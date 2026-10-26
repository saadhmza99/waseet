#!/usr/bin/env python3
"""Seed lechantier BTP pros → auth.users + profiles + services + realisations.

Source (mapped):
  scripts/pros_filtered_btp_mapped.csv
  scripts/services_cards_mapped.csv

Schema lives in supabase/schema.sql only (no separate migration design files).

Outputs:
  supabase/seeds/seed_lechantier_btp.sql          (chunked apply via --apply)
  supabase/seeds/seed_lechantier_btp_passwords.csv

Password: Sifarah-{username}-2026!
"""

from __future__ import annotations

import csv
import json
import re
import subprocess
import sys
import unicodedata
import uuid
from pathlib import Path

import bcrypt

ROOT = Path(__file__).resolve().parents[1]
PROS_CSV = ROOT / "scripts" / "pros_filtered_btp_mapped.csv"
SVCS_CSV = ROOT / "scripts" / "services_cards_mapped.csv"
OUT_DIR = ROOT / "supabase" / "seeds"
OUT_SQL = OUT_DIR / "seed_lechantier_btp.sql"
OUT_PASSWORDS = OUT_DIR / "seed_lechantier_btp_passwords.csv"
CHUNK_DIR = OUT_DIR / "seed_lechantier_btp_chunks"

SEED_BATCH = "lechantier_btp_1710"
PASSWORD_PREFIX = "Sifarah"
PASSWORD_SUFFIX = "2026!"
MAX_BIO = 251
NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")  # URL namespace
# Keep in sync with public.get_default_avatar_url() in schema.sql
DEFAULT_AVATAR_URL = (
    "https://auusinntfgmoneqhjcbe.supabase.co/storage/v1/object/public/images/avatars/default-pro.jpg"
)


def clean_image_url(value: str | None) -> str | None:
    """Drop empty / placeholder logos (e.g. Kerix directory default)."""
    url = (value or "").strip()
    if not url:
        return None
    low = url.lower()
    if (
        "kerix-net-logo" in low
        or "kerix.net/images/kerix" in low
        or "woomar-footer" in low
        or "yelo.ma/img/logos/woomar" in low
        or "lechantier.ma/logo" in low
    ):
        return None
    return url


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    return "'" + text.replace("'", "''") + "'"


def sql_bool(value: object) -> str:
    return "TRUE" if str(value or "").strip().lower() in {"1", "true", "yes", "oui"} else "FALSE"


def fold(value: str) -> str:
    text = unicodedata.normalize("NFKD", (value or "").strip().lower())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", text).strip()


def slugify(value: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return (text or fallback)[:40]


def trunc(value: str | None, n: int) -> str:
    text = (value or "").strip()
    if len(text) <= n:
        return text
    return text[: n - 1].rstrip() + "…"


def parse_jsonish(value: object) -> list:
    if value is None:
        return []
    text = str(value).strip()
    if not text or text.lower() == "null":
        return []
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return parsed
        if parsed is None:
            return []
        return [parsed]
    except Exception:
        return [part.strip() for part in text.split("|") if part.strip()]


def sql_json(value: object) -> str:
    return sql_str(json.dumps(value if value is not None else [], ensure_ascii=False))


def password_for(username: str) -> str:
    return f"{PASSWORD_PREFIX}-{username}-{PASSWORD_SUFFIX}"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=6)).decode("utf-8")


def load_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def profile_url_of(row: dict) -> str:
    return (row.get("profile_url") or row.get("url") or row.get("_profile_url") or "").strip().rstrip("/")


def slug_from_url(url: str) -> str:
    if not url:
        return ""
    return url.rstrip("/").split("/")[-1].strip().lower()


SKIP_PROJECT_NAMES = {
    "",
    "contact this professional",
    "request a quote from this professional",
}


def is_real_project_name(name: str) -> bool:
    text = fold(name)
    if not text or text in SKIP_PROJECT_NAMES:
        return False
    if text.startswith("contact "):
        return False
    return True


def build_rows() -> tuple[list[dict], list[dict], list[dict]]:
    pros_raw = load_csv(PROS_CSV)
    svcs_raw = load_csv(SVCS_CSV)

    svc_by_ice: dict[str, dict] = {}
    svc_by_url: dict[str, dict] = {}
    svc_by_user: dict[str, dict] = {}
    for row in svcs_raw:
        ice = (row.get("ice") or "").strip()
        url = profile_url_of(row)
        user = fold(row.get("username") or "")
        if ice and ice not in svc_by_ice:
            svc_by_ice[ice] = row
        if url and url not in svc_by_url:
            svc_by_url[url] = row
        if user and user not in svc_by_user:
            svc_by_user[user] = row

    used_ids: set[str] = set()
    used_usernames: set[str] = set()
    pros: list[dict] = []

    for row in pros_raw:
        ice = (row.get("ice") or "").strip()
        url = profile_url_of(row)
        url_slug = slug_from_url(url)
        match = None
        if ice and ice in svc_by_ice:
            match = svc_by_ice[ice]
        elif url and url in svc_by_url:
            match = svc_by_url[url]
        elif url_slug and url_slug in svc_by_user:
            match = svc_by_user[url_slug]

        # Always namespace UUIDs under this seed batch to avoid clashing with older seeds.
        key = url or ice or (row.get("company_name") or row.get("professional_name") or str(len(pros)))
        user_id = str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:{key.lower()}"))
        if user_id in used_ids:
            user_id = str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:dup:{key.lower()}:{len(pros)}"))
        used_ids.add(user_id)

        name = (row.get("company_name") or row.get("professional_name") or "").strip() or f"pro-{user_id[:8]}"
        preferred_user = (match.get("username") if match else "") or url_slug
        base = slugify(preferred_user or name, f"pro-{user_id[:8]}")
        # Prefix avoids collisions with older seed usernames (profiles_username_key).
        base = f"lc-{base}"[:40]
        username = base
        n = 2
        while username in used_usernames:
            username = f"{base}-{n}"[:48]
            n += 1
        used_usernames.add(username)

        codes = [c for c in (row.get("internal_category_codes") or "").split("|") if c.strip()]
        if not codes and match:
            codes = [c for c in (match.get("internal_category_codes") or "").split("|") if c.strip()]
        primary = (row.get("internal_category_primary_code") or (codes[0] if codes else "")).strip()

        real_email = (row.get("email") or "").strip().lower()
        # Auth email must be unique across all batches — keep real email on profiles.email.
        email = f"{username}@lechantier.sifarah.local"

        description = (row.get("description") or "").strip()
        bio = trunc(description or f"{name} — {(row.get('trade') or '').strip()} {(row.get('city') or '').strip()}".strip(), MAX_BIO)

        projects: list[dict] = []
        for i in range(1, 5):
            pname = (row.get(f"project_{i}_name") or "").strip()
            pdesc = (row.get(f"project_{i}_description") or "").strip()
            # images: project_image_url_i and sometimes only image 1 is shared
            images = []
            img = (row.get(f"project_image_url_{i}") or "").strip()
            if img:
                images.append(img)
            if i == 1:
                for j in range(2, 5):
                    extra = (row.get(f"project_image_url_{j}") or "").strip()
                    # Only attach extra gallery images to first project when later projects have no name
                    if extra and not is_real_project_name(row.get(f"project_{j}_name") or ""):
                        images.append(extra)
            if not is_real_project_name(pname) and not images:
                continue
            title = pname if is_real_project_name(pname) else f"Réalisation — {name}"
            # Deduplicate images
            seen = set()
            uniq = []
            for u in images:
                if u not in seen:
                    seen.add(u)
                    uniq.append(u)
            if not uniq and not pdesc:
                continue
            projects.append(
                {
                    "title": trunc(title, 160),
                    "description": pdesc or None,
                    "images": uniq,
                    "cover": uniq[0] if uniq else None,
                    "city": (row.get("city") or "").strip() or None,
                }
            )

        # If no named projects but profile has project images, one realisation from gallery
        if not projects:
            gallery = []
            for j in range(1, 5):
                img = clean_image_url(row.get(f"project_image_url_{j}"))
                if img:
                    gallery.append(img)
            avatar = clean_image_url(row.get("profile_image_url"))
            if gallery:
                projects.append(
                    {
                        "title": trunc(f"Réalisations — {name}", 160),
                        "description": description or None,
                        "images": gallery,
                        "cover": gallery[0],
                        "city": (row.get("city") or "").strip() or None,
                    }
                )
            elif avatar:
                projects.append(
                    {
                        "title": trunc(f"Portfolio — {name}", 160),
                        "description": description or None,
                        "images": [avatar],
                        "cover": avatar,
                        "city": (row.get("city") or "").strip() or None,
                    }
                )

        pros.append(
            {
                "id": user_id,
                "username": username,
                "full_name": name,
                "email": email,
                "profile_email": real_email or email,
                "phone": (row.get("phone") or "").strip() or None,
                "location": (row.get("city") or "").strip() or None,
                "profession": (row.get("trade") or "").strip() or (match.get("profession") if match else "") or None,
                "bio": bio,
                "about_text": description or None,
                "website_url": (row.get("website") or "").strip() or None,
                "ice": ice or None,
                "avatar_url": clean_image_url(row.get("profile_image_url")) or DEFAULT_AVATAR_URL,
                "cover_photo_url": clean_image_url(row.get("project_image_url_1"))
                or clean_image_url(row.get("profile_image_url")),
                "codes": codes,
                "primary_code": primary,
                "address": (row.get("address") or "").strip() or None,
                "profile_url": url or None,
                "projects": projects,
            }
        )

    # Services: attach to owner via ice / profile_url / username (UUIDs remapped to this batch).
    pro_by_ice = {p["ice"]: p for p in pros if p.get("ice")}
    pro_by_url = {p["profile_url"]: p for p in pros if p.get("profile_url")}
    pro_by_user = {fold(p["username"]): p for p in pros}

    services: list[dict] = []
    used_svc_ids: set[str] = set()
    for row in svcs_raw:
        ice = (row.get("ice") or "").strip()
        url = profile_url_of(row)
        user_slug = fold(row.get("username") or "")
        owner = pro_by_ice.get(ice) or pro_by_url.get(url) or pro_by_user.get(user_slug)
        if not owner:
            continue
        user_id = owner["id"]
        svc_id = str(
            uuid.uuid5(
                NS,
                f"sifarah:{SEED_BATCH}:svc:{user_id}:{(row.get('title') or '')[:80]}:{(row.get('id') or '')}",
            )
        )
        if svc_id in used_svc_ids:
            svc_id = str(uuid.uuid5(NS, f"sifarah:{SEED_BATCH}:svc:dup:{svc_id}:{len(services)}"))
        used_svc_ids.add(svc_id)

        codes = [c for c in (row.get("internal_category_codes") or "").split("|") if c.strip()]
        if not codes:
            codes = owner["codes"][:1]
        primary = (row.get("internal_category_id") or "").strip()
        if not primary or primary.isdigit():
            primary = codes[0] if codes else owner.get("primary_code") or ""

        # Service cards use the firm logo (profile avatar), not scraped photos.
        logo = clean_image_url(owner.get("avatar_url")) or DEFAULT_AVATAR_URL
        gallery = [logo]
        cover = logo

        services.append(
            {
                "id": svc_id,
                "user_id": user_id,
                "title": (row.get("title") or "").strip() or "Service",
                "description": (row.get("description") or "").strip() or None,
                "category": (row.get("category") or "").strip() or None,
                "cover": cover,
                "gallery": gallery,
                "kinds": parse_jsonish(row.get("kinds")),
                "included": parse_jsonish(row.get("included")),
                "options": parse_jsonish(row.get("options")),
                "price_mode": (row.get("price_mode") or "devis").strip() or "devis",
                "amount": None if str(row.get("amount") or "").strip().lower() in {"", "null"} else str(row.get("amount")).strip(),
                "duration": None if str(row.get("duration") or "").strip().lower() in {"", "null"} else str(row.get("duration")).strip(),
                "zone_mode": (row.get("zone_mode") or "villes").strip() or "villes",
                "cities": parse_jsonish(row.get("cities")),
                "region": (row.get("region") or "").strip() or None,
                "travel": row.get("travel"),
                "remote": row.get("remote"),
                "audiences": parse_jsonish(row.get("audiences")),
                "audience_other": None if str(row.get("audience_other") or "").strip().lower() in {"", "null"} else str(row.get("audience_other")).strip(),
                "missions": parse_jsonish(row.get("missions")),
                "primary_code": primary,
            }
        )

    realisations: list[dict] = []
    for pro in pros:
        for idx, project in enumerate(pro["projects"]):
            rid = str(uuid.uuid5(NS, f"sifarah:realisation:{pro['id']}:{idx}:{project['title']}"))
            realisations.append(
                {
                    "id": rid,
                    "user_id": pro["id"],
                    "title": project["title"],
                    "description": project["description"],
                    "images": project["images"],
                    "cover": project["cover"],
                    "city": project["city"],
                    "primary_code": pro.get("primary_code") or None,
                }
            )

    return pros, services, realisations


def emit_sql(pros: list[dict], services: list[dict], realisations: list[dict]) -> list[str]:
    lines: list[str] = []
    lines.append("-- AUTO-GENERATED by scripts/seed_lechantier_btp.py")
    lines.append(f"-- Seed batch: {SEED_BATCH}")
    lines.append(f"-- Pros: {len(pros)} | Services: {len(services)} | Realisations: {len(realisations)}")
    lines.append(f"-- Password pattern: {PASSWORD_PREFIX}-{{username}}-{PASSWORD_SUFFIX}")
    lines.append("-- Schema source of truth: supabase/schema.sql")
    lines.append("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    lines.append("BEGIN;")
    lines.append("")
    lines.append("-- Remove previous run of this batch")
    lines.append(
        f"DELETE FROM public.realisations WHERE user_id IN ("
        f"SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)}"
        f");"
    )
    lines.append(
        f"DELETE FROM public.services WHERE user_id IN ("
        f"SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)}"
        f");"
    )
    lines.append(
        f"DELETE FROM public.profile_internal_categories WHERE profile_id IN ("
        f"SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)}"
        f");"
    )
    lines.append(
        f"DELETE FROM public.profile_category_history WHERE profile_id IN ("
        f"SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)}"
        f");"
    )
    lines.append(
        f"DELETE FROM public.profiles WHERE id IN ("
        f"SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)}"
        f");"
    )
    lines.append(
        f"DELETE FROM auth.identities WHERE user_id IN ("
        f"SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)}"
        f");"
    )
    lines.append(
        f"DELETE FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)};"
    )
    lines.append("")

    password_rows: list[dict[str, str]] = []
    lines.append("-- auth.users + identities")
    for pro in pros:
        password = password_for(pro["username"])
        hashed = hash_password(password)
        password_rows.append(
            {
                "id": pro["id"],
                "email": pro["email"],
                "username": pro["username"],
                "full_name": pro["full_name"],
                "password": password,
            }
        )
        meta = {
            "seed_batch": SEED_BATCH,
            "username": pro["username"],
            "full_name": pro["full_name"],
            "profession": pro.get("profession") or "",
            "location": pro.get("location") or "",
            "bio": pro.get("bio") or "",
            "phone": pro.get("phone") or "",
            "profile_type": "enterprise",
            "internal_category_code": pro.get("primary_code") or "",
            "source_profile_url": pro.get("profile_url") or "",
        }
        app_meta = {"provider": "email", "providers": ["email"]}
        lines.append(
            "INSERT INTO auth.users ("
            "instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, "
            "raw_app_meta_data, raw_user_meta_data, created_at, updated_at, "
            "confirmation_token, recovery_token, email_change_token_new, email_change"
            ") VALUES ("
            f"'00000000-0000-0000-0000-000000000000', {sql_str(pro['id'])}::uuid, "
            f"'authenticated', 'authenticated', {sql_str(pro['email'])}, "
            f"{sql_str(hashed)}, NOW(), "
            f"{sql_str(json.dumps(app_meta, ensure_ascii=False))}::jsonb, "
            f"{sql_str(json.dumps(meta, ensure_ascii=False))}::jsonb, NOW(), NOW(), '', '', '', ''"
            ");"
        )
        lines.append(
            "INSERT INTO auth.identities ("
            "id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at"
            ") VALUES ("
            f"{sql_str(pro['id'])}::uuid, {sql_str(pro['id'])}::uuid, "
            f"jsonb_build_object('sub', {sql_str(pro['id'])}, 'email', {sql_str(pro['email'])}, "
            f"'email_verified', true, 'phone_verified', false), "
            f"'email', {sql_str(pro['id'])}, NOW(), NOW(), NOW()"
            ");"
        )

    lines.append("")
    lines.append("-- enrich profiles")
    for pro in pros:
        code = pro.get("primary_code") or ""
        lines.append("UPDATE public.profiles SET")
        lines.append(f"  username = {sql_str(pro['username'])},")
        lines.append(f"  full_name = {sql_str(pro['full_name'])},")
        lines.append(f"  profession = {sql_str(pro.get('profession'))},")
        lines.append(f"  location = {sql_str(pro.get('location'))},")
        lines.append(f"  bio = {sql_str(pro.get('bio'))},")
        lines.append(f"  about_text = {sql_str(pro.get('about_text'))},")
        lines.append(f"  phone = {sql_str(pro.get('phone'))},")
        lines.append(f"  email = {sql_str(pro.get('profile_email') or pro['email'])},")
        lines.append(f"  website_url = {sql_str(pro.get('website_url'))},")
        lines.append(f"  ice = {sql_str(pro.get('ice'))},")
        lines.append(f"  avatar_url = {sql_str(pro.get('avatar_url'))},")
        lines.append(f"  cover_photo_url = {sql_str(pro.get('cover_photo_url'))},")
        lines.append("  profile_type = 'enterprise',")
        if code:
            lines.append(
                f"  internal_category_id = (SELECT id FROM public.internal_categories WHERE code = {sql_str(code)} LIMIT 1),"
            )
        else:
            lines.append("  internal_category_id = NULL,")
        lines.append("  updated_at = NOW()")
        lines.append(f"WHERE id = {sql_str(pro['id'])}::uuid;")

    lines.append("")
    lines.append("-- multi internal categories")
    for pro in pros:
        codes = pro.get("codes") or []
        if not codes:
            continue
        lines.append(
            f"DELETE FROM public.profile_internal_categories WHERE profile_id = {sql_str(pro['id'])}::uuid;"
        )
        for i, code in enumerate(codes[:5]):
            lines.append(
                "INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary) "
                f"SELECT {sql_str(pro['id'])}::uuid, ic.id, {('TRUE' if i == 0 else 'FALSE')} "
                f"FROM public.internal_categories ic WHERE ic.code = {sql_str(code)} "
                "ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;"
            )

    lines.append("")
    lines.append("-- services")
    for svc in services:
        code = svc.get("primary_code") or ""
        lines.append(
            "INSERT INTO public.services ("
            "id, user_id, title, description, category, cover, gallery, kinds, included, options, "
            "price_mode, amount, duration, zone_mode, cities, region, travel, remote, "
            "audiences, audience_other, missions, internal_category_id"
            ") VALUES ("
            f"{sql_str(svc['id'])}::uuid, {sql_str(svc['user_id'])}::uuid, "
            f"{sql_str(svc['title'])}, {sql_str(svc.get('description'))}, {sql_str(svc.get('category'))}, "
            f"{sql_str(svc.get('cover'))}, {sql_json(svc.get('gallery'))}::jsonb, "
            f"{sql_json(svc.get('kinds'))}::jsonb, {sql_json(svc.get('included'))}::jsonb, "
            f"{sql_json(svc.get('options'))}::jsonb, {sql_str(svc.get('price_mode') or 'devis')}, "
            f"{sql_str(svc.get('amount'))}, {sql_str(svc.get('duration'))}, "
            f"{sql_str(svc.get('zone_mode') or 'villes')}, {sql_json(svc.get('cities'))}::jsonb, "
            f"{sql_str(svc.get('region'))}, {sql_bool(svc.get('travel'))}, {sql_bool(svc.get('remote'))}, "
            f"{sql_json(svc.get('audiences'))}::jsonb, {sql_str(svc.get('audience_other'))}, "
            f"{sql_json(svc.get('missions'))}::jsonb, "
            + (
                f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(code)} LIMIT 1)"
                if code
                else "NULL"
            )
            + ");"
        )

    lines.append("")
    lines.append("-- realisations")
    for row in realisations:
        code = row.get("primary_code") or ""
        lines.append(
            "INSERT INTO public.realisations ("
            "id, user_id, title, description, images, cover, city, internal_category_id"
            ") VALUES ("
            f"{sql_str(row['id'])}::uuid, {sql_str(row['user_id'])}::uuid, "
            f"{sql_str(row['title'])}, {sql_str(row.get('description'))}, "
            f"{sql_json(row.get('images'))}::jsonb, {sql_str(row.get('cover'))}, "
            f"{sql_str(row.get('city'))}, "
            + (
                f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(code)} LIMIT 1)"
                if code
                else "NULL"
            )
            + ");"
        )

    lines.append("")
    lines.append("COMMIT;")
    lines.append("NOTIFY pgrst, 'reload schema';")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with OUT_PASSWORDS.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["id", "email", "username", "full_name", "password"])
        writer.writeheader()
        writer.writerows(password_rows)

    return lines


def write_chunks(lines: list[str], chunk_size: int = 250) -> list[Path]:
    """Split into BEGIN/COMMIT chunks for reliable apply."""
    CHUNK_DIR.mkdir(parents=True, exist_ok=True)
    for old in CHUNK_DIR.glob("*.sql"):
        old.unlink()

    # Keep preamble delete in first chunk; data statements chunked
    header: list[str] = []
    body: list[str] = []
    in_header = True
    for line in lines:
        if in_header:
            header.append(line)
            if line.startswith("-- auth.users"):
                in_header = False
                body.append(line)
        else:
            if line.strip() in {"COMMIT;", "NOTIFY pgrst, 'reload schema';"}:
                continue
            body.append(line)

    # Group body into statement batches (statements end with ");" or ";")
    stmts: list[str] = []
    buf: list[str] = []
    for line in body:
        buf.append(line)
        if line.rstrip().endswith(";"):
            stmts.append("\n".join(buf))
            buf = []
    if buf:
        stmts.append("\n".join(buf))

    paths: list[Path] = []
    # Chunk 0: cleanup only
    cleanup_lines = [ln for ln in header if not ln.startswith("-- auth.users")]
    # ensure ends with nothing open — header has BEGIN and deletes
    p0 = CHUNK_DIR / "chunk_000_cleanup.sql"
    # header already has BEGIN; add COMMIT
    cleanup = "\n".join(cleanup_lines).rstrip()
    if "BEGIN;" in cleanup and "COMMIT;" not in cleanup:
        cleanup += "\nCOMMIT;\n"
    p0.write_text(cleanup, encoding="utf-8")
    paths.append(p0)

    for i in range(0, len(stmts), chunk_size):
        part = stmts[i : i + chunk_size]
        idx = len(paths)
        path = CHUNK_DIR / f"chunk_{idx:03d}.sql"
        text = "BEGIN;\n" + "\n".join(part) + "\nCOMMIT;\n"
        path.write_text(text, encoding="utf-8")
        paths.append(path)

    OUT_SQL.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return paths


def apply_chunks(paths: list[Path]) -> None:
    for i, path in enumerate(paths):
        print(f"[{i+1}/{len(paths)}] applying {path.name} ...", flush=True)
        proc = subprocess.run(
            ["supabase", "db", "query", "--linked", "-f", str(path)],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if proc.returncode != 0:
            print(proc.stdout)
            print(proc.stderr)
            raise SystemExit(f"Failed on {path}")
        # show brief ok
        if "ERROR" in (proc.stdout or "") or "ERROR" in (proc.stderr or ""):
            print(proc.stdout)
            print(proc.stderr)
            raise SystemExit(f"SQL error on {path}")
    print("apply done")


def main() -> None:
    if not PROS_CSV.exists() or not SVCS_CSV.exists():
        raise SystemExit(f"Missing mapped CSVs:\n  {PROS_CSV}\n  {SVCS_CSV}")

    print("building rows...", flush=True)
    pros, services, realisations = build_rows()
    print(f"pros={len(pros)} services={len(services)} realisations={len(realisations)}", flush=True)
    print("hashing passwords + emitting SQL (slow)...", flush=True)
    lines = emit_sql(pros, services, realisations)
    print(f"wrote {OUT_SQL} and {OUT_PASSWORDS}", flush=True)
    paths = write_chunks(lines, chunk_size=200)
    print(f"chunks={len(paths)} in {CHUNK_DIR}", flush=True)

    if "--apply" in sys.argv:
        apply_chunks(paths)
        # verify
        subprocess.run(
            [
                "supabase",
                "db",
                "query",
                "--linked",
                (
                    "SELECT "
                    "(SELECT count(*) FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = 'lechantier_btp_1710') AS users, "
                    "(SELECT count(*) FROM profiles p JOIN auth.users u ON u.id = p.id "
                    " WHERE u.raw_user_meta_data->>'seed_batch' = 'lechantier_btp_1710') AS profiles, "
                    "(SELECT count(*) FROM services s JOIN auth.users u ON u.id = s.user_id "
                    " WHERE u.raw_user_meta_data->>'seed_batch' = 'lechantier_btp_1710') AS services, "
                    "(SELECT count(*) FROM realisations r JOIN auth.users u ON u.id = r.user_id "
                    " WHERE u.raw_user_meta_data->>'seed_batch' = 'lechantier_btp_1710') AS realisations;"
                ),
            ],
            cwd=str(ROOT),
        )


if __name__ == "__main__":
    main()
