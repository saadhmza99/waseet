#!/usr/bin/env python3
"""Seed notaires for Tanger / Marrakech / Rabat / Fes / Oujda / Nador / Al Hoceima /
Ouarzazate / Laayoune / Dakhla from _notaires_regions_raw.txt.

Blocks are name / address / phone / email. City sections start with <<<City>>> or
are introduced by glued \"email for city Name\" markers in the paste.
"""

from __future__ import annotations

import json
import re
import unicodedata
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "scripts" / "_notaires_regions_raw.txt"
AVATAR_DIR = ROOT / "frontend" / "public" / "notaires"
ALL_LOGINS = ROOT / "supabase" / "seeds" / "ALL_PROFESSIONAL_LOGINS.csv"
CAT_CODE = "6.4.1"

# city_key -> (seed_batch, login_domain_suffix, default_city, region, uuid_ns)
CITY_META: dict[str, tuple[str, str, str, str, uuid.UUID]] = {
    "Tanger": (
        "notaires_tanger_2026",
        "notaires-tanger.sifarah.local",
        "Tanger",
        "Tanger-Tetouan-Al Hoceima",
        uuid.UUID("c8f3d2a1-9b33-4e44-af55-c20c3707aa12"),
    ),
    "Marrakech": (
        "notaires_marrakech_2026",
        "notaires-marrakech.sifarah.local",
        "Marrakech",
        "Marrakech-Safi",
        uuid.UUID("d9a4e3b2-0c44-5f55-b066-d30d4808bb23"),
    ),
    "Rabat": (
        "notaires_rabat_2026",
        "notaires-rabat.sifarah.local",
        "Rabat",
        "Rabat-Sale-Kenitra",
        uuid.UUID("e0b5f4c3-1d55-6066-c177-e40e5909cc34"),
    ),
    "Fes": (
        "notaires_fes_2026",
        "notaires-fes.sifarah.local",
        "Fes",
        "Fes-Meknes",
        uuid.UUID("f1c6a5d4-2e66-7177-d288-f50f6000dd45"),
    ),
    "Oujda": (
        "notaires_oujda_2026",
        "notaires-oujda.sifarah.local",
        "Oujda",
        "Oriental",
        uuid.UUID("a2d7b6e5-3f77-8288-e399-a60a7101ee56"),
    ),
    "Nador": (
        "notaires_nador_2026",
        "notaires-nador.sifarah.local",
        "Nador",
        "Oriental",
        uuid.UUID("b3e8c7f6-4088-9399-f4aa-b70b8202ff67"),
    ),
    "Al Hoceima": (
        "notaires_alhoceima_2026",
        "notaires-alhoceima.sifarah.local",
        "Al Hoceima",
        "Tanger-Tetouan-Al Hoceima",
        uuid.UUID("c4f9d8a7-5199-a4aa-05bb-c80c9303aa78"),
    ),
    "Ouarzazate": (
        "notaires_ouarzazate_2026",
        "notaires-ouarzazate.sifarah.local",
        "Ouarzazate",
        "Draa-Tafilalet",
        uuid.UUID("d5a0e9b8-62aa-b5bb-16cc-d90d0404bb89"),
    ),
    "Laayoune": (
        "notaires_laayoune_2026",
        "notaires-laayoune.sifarah.local",
        "Laayoune",
        "Laayoune-Sakia El Hamra",
        uuid.UUID("e6b1f0c9-73bb-c6cc-27dd-e00e1505cc9a"),
    ),
    "Dakhla": (
        "notaires_dakhla_2026",
        "notaires-dakhla.sifarah.local",
        "Dakhla",
        "Dakhla-Oued Ed-Dahab",
        uuid.UUID("f7c2a1d0-84cc-d7dd-38ee-f10f2606ddab"),
    ),
    "Casablanca": (
        "notaires_regions_casa_extra_2026",
        "notaires-casablanca.sifarah.local",
        "Casablanca",
        "Casablanca-Settat",
        uuid.UUID("a8d3b2e1-95dd-e8ee-49ff-a20a3707eebc"),
    ),
}

COLORS = [
    ("#174f43", "#e8f2ef"),
    ("#1a3a5c", "#e8eef5"),
    ("#5c3d1a", "#f5efe8"),
    ("#3d1a5c", "#f0e8f5"),
    ("#1a5c4a", "#e8f5f1"),
    ("#5c1a2e", "#f5e8ec"),
    ("#2c4a6e", "#e9eef4"),
    ("#4a5c1a", "#f2f5e8"),
]

HOOKS = [
    "L'étude reçoit particuliers et professionnels pour sécuriser chaque acte.",
    "Un accompagnement clair, du premier rendez-vous jusqu'à la signature.",
    "Dossiers immobiliers, famille et entreprises traités avec rigueur.",
    "Proximité, écoute et délais tenus pour vos formalités notariales.",
    "Une étude de confiance pour vos projets patrimoniaux.",
    "Conseil notarial accessible, avec un suivi transparent du dossier.",
]


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\u2014", "-").replace("\u2013", "-").replace("—", "-").replace("–", "-")
    text = text.replace("&amp;", "&")
    return "'" + text.replace("'", "''") + "'"


def slugify(value: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return (text or fallback)[:40]


def strip_maitre(name: str) -> str:
    text = name.strip()
    text = re.sub(r"(?i)^m\.?\s*e\.?\s+", "", text)
    text = re.sub(r"(?i)^me\s+", "", text)
    text = re.sub(r"(?i)^ma[iî]tre\s+", "", text)
    text = re.sub(r"(?i)\bma[iî]tre\b", " ", text)
    # Drop Arabic tokens mixed into names
    text = re.sub(r"[\u0600-\u06FF]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def title_name(raw: str) -> str:
    raw = strip_maitre(raw)
    parts = [p for p in re.split(r"\s+", raw.strip()) if p]
    out = []
    for p in parts:
        low = p.lower().replace("'", "")
        if low in {"el", "al", "ben", "ait", "ou", "ep", "ibn", "bnou", "my", "mly"}:
            out.append(p.upper() if len(p) <= 3 else p.capitalize())
            continue
        if p.lower().startswith("m'"):
            out.append("M'" + p[2:].capitalize())
            continue
        if "-" in p:
            out.append("-".join(s.capitalize() if s else "" for s in p.split("-")))
            continue
        out.append(p.capitalize() if p.isupper() or p.islower() else p)
    return " ".join(out)


def phone_e164(raw: str) -> str:
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("212"):
        return "+" + digits
    if digits.startswith("0") and len(digits) >= 9:
        return "+212" + digits[1:]
    if digits:
        return "+212" + digits
    return ""


def initials(name: str) -> str:
    skip = {"el", "al", "ben", "ait", "ou", "ep", "maitre", "maître", "me", "my", "mly"}
    parts = [p for p in re.split(r"\s+", name.strip()) if p and p.lower() not in skip]
    if not parts:
        return "N"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def write_svg(path: Path, letters: str, fg: str, bg: str) -> None:
    path.write_text(
        f"""<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="{bg}"/>
  <circle cx="128" cy="128" r="96" fill="{fg}"/>
  <text x="128" y="140" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="700" fill="{bg}">{letters}</text>
</svg>
""",
        encoding="utf-8",
    )


def bio_for(name: str, city: str, i: int) -> str:
    hooks = [
        "L'étude reçoit particuliers et professionnels pour sécuriser chaque acte.",
        "Un accompagnement clair, du premier rendez-vous jusqu'à la signature.",
        "Dossiers immobiliers, famille et entreprises traités avec rigueur.",
        "Proximité, écoute et délais tenus pour vos formalités notariales.",
        f"Une étude de confiance pour vos projets patrimoniaux à {city}.",
        "Conseil notarial accessible, avec un suivi transparent du dossier.",
    ]
    return (
        f"{name}, notaire à {city}. {hooks[i % len(hooks)]} "
        f"Ventes, donations, successions, sociétés et authentification d'actes."
    )[:450]


def about_for(name: str, address: str, phone: str, email: str, city: str, i: int) -> str:
    focus = [
        ("ventes immobilières et VEFA", "donations et successions", "création et cession de sociétés"),
        ("actes de vente et promesses", "régimes matrimoniaux", "baux et actes authentiques"),
        ("transactions immobilières", "partages successoraux", "conseil patrimonial"),
        ("sécurisation des titres", "actes de société", "formalités auprès des administrations"),
    ][i % 4]
    return f"""<h2>Étude de {name}</h2>
<p>Notaire à {city}, {name} accompagne particuliers, familles et entreprises dans la rédaction et l'authentification des actes. L'étude privilégie la clarté des explications, la vérification des pièces et le respect des délais.</p>
<h3>Domaines d'intervention</h3>
<ul>
<li>{focus[0]}</li>
<li>{focus[1]}</li>
<li>{focus[2]}</li>
</ul>
<p>Chaque dossier fait l'objet d'un suivi personnalisé, de la prise de contact jusqu'à la signature et au dépôt des formalités.</p>
<p><strong>Adresse :</strong> {address}</p>
<p><strong>Tél :</strong> {phone} · <strong>Email :</strong> {email}</p>"""


def service_desc(name: str, city: str) -> str:
    return (
        f"Accompagnement notarial par {name} à {city} : actes de vente, donations, "
        f"successions, sociétés et authentification. Honoraires selon le barème et la nature du dossier. "
        f"Prise de rendez-vous sur devis."
    )


def is_email(line: str) -> bool:
    return bool(re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", line))


def is_phone(line: str) -> bool:
    digits = re.sub(r"\D", "", line)
    return len(digits) >= 9 and (digits.startswith("0") or digits.startswith("212") or digits.startswith("8"))


def normalize_city_key(raw: str) -> str:
    key = re.sub(r"\s+", " ", raw.strip()).title()
    aliases = {
        "Alhoceima": "Al Hoceima",
        "Al-Hoceima": "Al Hoceima",
        "Laâyoune": "Laayoune",
        "Laayoune": "Laayoune",
        "Fès": "Fes",
        "Fez": "Fes",
    }
    return aliases.get(key, key)


def preprocess_raw(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("gmail..com", "gmail.com")
    # email for city Name  OR  email for city: Name
    text = re.sub(
        r"(?i)(\S+@\S+)\s+for\s+(marrakech|rabat|fes|oujda|nador|al\s*hoceima|ouarzazate|laayoune|dakhla)\s*:?\s*",
        lambda m: f"{m.group(1)}\n<<<{normalize_city_key(m.group(2))}>>>\n",
        text,
    )
    # email oujda Name (no "for")
    text = re.sub(
        r"(?i)(\S+@\S+)\s+oujda\s+",
        lambda m: f"{m.group(1)}\n<<<Oujda>>>\n",
        text,
    )
    # Rabat -> Fes glue without marker
    text = text.replace(
        "benmakhloufnotaire@gmail.com ABDELHAY EL KANDOUSSSI",
        "benmakhloufnotaire@gmail.com\n<<<Fes>>>\nABDELHAY EL KANDOUSSSI",
    )
    # Trailing period on emails
    text = re.sub(r"(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\.(?=\s|$)", r"\1", text)
    return text


def city_from_address(address: str, default_city: str) -> str:
    a = (address or "").upper()
    checks = [
        ("TAMANSOURT", "Tamansourt"),
        ("MARRAKECH", "Marrakech"),
        ("GUELIZ", "Marrakech"),
        ("GUÉLIZ", "Marrakech"),
        ("TANGER", "Tanger"),
        ("RABAT", "Rabat"),
        ("AGDAL", "Rabat"),
        ("HAY RIAD", "Rabat"),
        (" FES", "Fes"),
        ("FÈS", "Fes"),
        ("OUJDA", "Oujda"),
        ("NADOR", "Nador"),
        ("AL HOCEIMA", "Al Hoceima"),
        ("OUARZAZATE", "Ouarzazate"),
        ("LAAYOUNE", "Laayoune"),
        ("DAKHLA", "Dakhla"),
        ("CASABLANCA", "Casablanca"),
        ("SIDI ALLAL BAHRAOUI", "Sidi Allal El Bahraoui"),
    ]
    for needle, city in checks:
        if needle in a:
            return city
    if re.fullmatch(r"\d{5}", (address or "").strip()) or address.strip() in {".", ""}:
        return default_city
    return default_city


def parse_sections(text: str) -> dict[str, list[dict[str, str]]]:
    text = preprocess_raw(text)
    # Start as Tanger until first marker
    sections: dict[str, list[str]] = {"Tanger": []}
    current = "Tanger"
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        m = re.fullmatch(r"<<<(.+?)>>>", line)
        if m:
            current = normalize_city_key(m.group(1))
            sections.setdefault(current, [])
            continue
        sections.setdefault(current, []).append(line)

    out: dict[str, list[dict[str, str]]] = {}
    for city, lines in sections.items():
        rows: list[dict[str, str]] = []
        i = 0
        while i + 3 < len(lines):
            name, address, phone, email = lines[i], lines[i + 1], lines[i + 2], lines[i + 3]
            if is_email(address) and is_phone(phone) and is_email(email):
                address = city
            if not is_phone(phone) or not is_email(email):
                i += 1
                continue
            if address in {".", ""} or re.fullmatch(r"\d{5}", address):
                address = f"{city} {address}" if re.fullmatch(r"\d{5}", address) else city
            # Reclassify Azeddine Joundy (Casa address) out of Al Hoceima
            row_city = city
            if "bd yacoub el mansour" in address.lower() and "hay salam" in address.lower():
                row_city = "Casablanca"
            rows.append(
                {
                    "city_key": row_city,
                    "name_raw": name,
                    "full_name": title_name(name),
                    "address": address.replace("—", "-").replace("–", "-"),
                    "phone": phone,
                    "email": email.lower().strip().rstrip("."),
                }
            )
            i += 4
        if rows:
            # Move misfiled rows
            for row in rows:
                key = row["city_key"] if row["city_key"] in CITY_META else city
                out.setdefault(key, []).append(row)
    return out


def emit_city_sql(
    city_key: str,
    rows: list[dict[str, str]],
    global_usernames: set[str],
) -> tuple[list[str], list[str], int]:
    batch, domain, default_city, region, ns = CITY_META[city_key]
    lines: list[str] = []
    pw: list[str] = []
    emails_seen: set[str] = set()
    kept = 0

    lines.append(f"-- ===== {city_key} ({batch}) =====")
    lines.append(
        f"DELETE FROM public.services WHERE user_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(batch)});"
    )
    lines.append(
        f"DELETE FROM public.profile_internal_categories WHERE profile_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(batch)});"
    )
    lines.append(
        f"DELETE FROM public.profile_category_history WHERE profile_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(batch)});"
    )
    lines.append(
        f"DELETE FROM public.profiles WHERE id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(batch)});"
    )
    lines.append(
        f"DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(batch)});"
    )
    lines.append(
        f"DELETE FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(batch)};"
    )
    lines.append("")

    for i, row in enumerate(rows):
        email = row["email"]
        if email in emails_seen:
            continue
        emails_seen.add(email)
        bare = row["full_name"] or title_name(row["name_raw"])
        if not bare:
            continue
        display = bare
        city_slug = slugify(city_key, "ville")
        base = slugify(bare, f"n-{i+1}")
        # City prefix avoids collisions with Casa/Agadir batches (same family names).
        username = f"notaire-{city_slug}-{base}"[:48]
        n = 2
        while username in global_usernames:
            username = f"notaire-{city_slug}-{base}-{n}"[:48]
            n += 1
        global_usernames.add(username)

        user_id = str(uuid.uuid5(ns, email))
        svc_id = str(uuid.uuid5(ns, f"svc:{email}"))
        city = city_from_address(row["address"], default_city)
        phone = phone_e164(row["phone"])
        password = f"Sifarah-{username}-2026!"
        fg, bg = COLORS[kept % len(COLORS)]
        letters = initials(bare)
        svg_name = f"{username}.svg"
        write_svg(AVATAR_DIR / svg_name, letters, fg, bg)
        avatar = f"/notaires/{svg_name}"
        bio = bio_for(bare, city, kept)
        about = about_for(bare, row["address"], row["phone"], email, city, kept)
        login_email = f"{username}@{domain}"

        meta = {
            "seed_batch": batch,
            "username": username,
            "full_name": display,
            "profession": "Notaire",
            "location": city,
            "bio": bio,
            "phone": phone,
            "profile_type": "enterprise",
            "internal_category_code": CAT_CODE,
        }
        app_meta = json.dumps({"provider": "email", "providers": ["email"]})
        meta_json = json.dumps(meta, ensure_ascii=False)

        lines.append(
            "INSERT INTO auth.users ("
            "instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, "
            "raw_app_meta_data, raw_user_meta_data, created_at, updated_at, "
            "confirmation_token, recovery_token, email_change_token_new, email_change"
            ") VALUES ("
            f"'00000000-0000-0000-0000-000000000000', {sql_str(user_id)}::uuid, "
            f"'authenticated', 'authenticated', {sql_str(login_email)}, "
            f"crypt({sql_str(password)}, gen_salt('bf')), NOW(), "
            f"{sql_str(app_meta)}::jsonb, {sql_str(meta_json)}::jsonb, NOW(), NOW(), '', '', '', ''"
            ");"
        )
        lines.append(
            "INSERT INTO auth.identities ("
            "id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at"
            ") VALUES ("
            f"{sql_str(user_id)}::uuid, {sql_str(user_id)}::uuid, "
            f"jsonb_build_object('sub', {sql_str(user_id)}, 'email', {sql_str(login_email)}, "
            f"'email_verified', true, 'phone_verified', false), "
            f"'email', {sql_str(user_id)}, NOW(), NOW(), NOW()"
            ");"
        )
        lines.append("UPDATE public.profiles SET")
        lines.append(f"  username = {sql_str(username)},")
        lines.append(f"  full_name = {sql_str(display)},")
        lines.append("  profession = 'Notaire',")
        lines.append(f"  location = {sql_str(city)},")
        lines.append(f"  bio = {sql_str(bio)},")
        lines.append(f"  about_text = {sql_str(about)},")
        lines.append(f"  phone = {sql_str(phone or None)},")
        lines.append(f"  email = {sql_str(email)},")
        lines.append("  website_url = NULL,")
        lines.append(f"  avatar_url = {sql_str(avatar)},")
        lines.append("  cover_photo_url = NULL,")
        lines.append("  profile_type = 'enterprise',")
        lines.append("  directory_visible = TRUE,")
        lines.append("  is_verified = TRUE,")
        lines.append("  verified_at = COALESCE(verified_at, NOW()),")
        lines.append(
            f"  internal_category_id = (SELECT id FROM public.internal_categories WHERE code = {sql_str(CAT_CODE)} LIMIT 1),"
        )
        lines.append("  updated_at = NOW()")
        lines.append(f"WHERE id = {sql_str(user_id)}::uuid;")
        lines.append(
            "INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary) "
            "SELECT "
            f"{sql_str(user_id)}::uuid, id, TRUE "
            f"FROM public.internal_categories WHERE code = {sql_str(CAT_CODE)} LIMIT 1 "
            "ON CONFLICT DO NOTHING;"
        )

        included = json.dumps(
            ["Acte authentique", "Vérification des pièces", "Conseil préalable", "Formalités post-signature"],
            ensure_ascii=False,
        )
        kinds = json.dumps(["Conseil", "Actes"], ensure_ascii=False)
        cities = json.dumps([city], ensure_ascii=False)
        audiences = json.dumps(["Particuliers", "Professionnels"], ensure_ascii=False)
        missions = json.dumps(["Sur place", "Sur rendez-vous"], ensure_ascii=False)
        title = f"Étude notariale - {bare}"
        desc = service_desc(bare, city)
        lines.append(
            "INSERT INTO public.services ("
            "id, user_id, title, description, category, cover, gallery, kinds, included, options, "
            "price_mode, amount, duration, zone_mode, cities, region, travel, remote, "
            "audiences, audience_other, missions, internal_category_id"
            ") VALUES ("
            f"{sql_str(svc_id)}::uuid, {sql_str(user_id)}::uuid, "
            f"{sql_str(title)}, {sql_str(desc)}, 'Notariat', "
            f"{sql_str(avatar)}, {sql_str(json.dumps([avatar]))}::jsonb, "
            f"{sql_str(kinds)}::jsonb, {sql_str(included)}::jsonb, '[]'::jsonb, "
            f"'devis', NULL, NULL, 'villes', {sql_str(cities)}::jsonb, {sql_str(region)}, "
            f"FALSE, FALSE, {sql_str(audiences)}::jsonb, NULL, {sql_str(missions)}::jsonb, "
            f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(CAT_CODE)} LIMIT 1)"
            ");"
        )
        lines.append("")
        pw.append(f"{user_id},{login_email},{username},{display},{password}")
        kept += 1

    return lines, pw, kept


def main() -> None:
    raw = RAW_PATH.read_text(encoding="utf-8")
    sections = parse_sections(raw)
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)

    out_sql = ROOT / "supabase" / "seeds" / "seed_notaires_regions.sql"
    out_pw = ROOT / "supabase" / "seeds" / "seed_notaires_regions_passwords.csv"

    all_lines = [
        "-- AUTO-GENERATED by scripts/seed_notaires_regions.py",
        "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
        "BEGIN;",
        "",
    ]
    all_pw = ["id,email,username,full_name,password"]
    usernames: set[str] = set()
    summary: list[str] = []

    for city_key in [
        "Tanger",
        "Marrakech",
        "Rabat",
        "Fes",
        "Oujda",
        "Nador",
        "Al Hoceima",
        "Ouarzazate",
        "Laayoune",
        "Dakhla",
        "Casablanca",
    ]:
        rows = sections.get(city_key) or []
        if not rows:
            continue
        if city_key not in CITY_META:
            raise SystemExit(f"Missing CITY_META for {city_key}")
        lines, pw, kept = emit_city_sql(city_key, rows, usernames)
        all_lines.extend(lines)
        all_pw.extend(pw)
        summary.append(f"{city_key}: {kept}")

    all_lines.append("COMMIT;")
    out_sql.write_text("\n".join(all_lines) + "\n", encoding="utf-8")
    out_pw.write_text("\n".join(all_pw) + "\n", encoding="utf-8")

    if ALL_LOGINS.exists():
        existing = ALL_LOGINS.read_text(encoding="utf-8")
        if not existing.endswith("\n"):
            existing += "\n"
        ALL_LOGINS.write_text(existing + "\n".join(all_pw[1:]) + "\n", encoding="utf-8")

    print(f"Wrote {out_sql}")
    print(f"Wrote {out_pw}")
    print(" | ".join(summary))
    print(f"Total: {len(all_pw) - 1}")


if __name__ == "__main__":
    main()
