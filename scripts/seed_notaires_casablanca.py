#!/usr/bin/env python3
"""Seed Casablanca notaires from _notaires_casablanca_raw.txt (4-line blocks).

No em dashes in generated copy. Re-run safe via seed_batch = notaires_casablanca_2026.
"""

from __future__ import annotations

import json
import re
import unicodedata
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "scripts" / "_notaires_casablanca_raw.txt"
OUT_SQL = ROOT / "supabase" / "seeds" / "seed_notaires_casablanca.sql"
OUT_PASSWORDS = ROOT / "supabase" / "seeds" / "seed_notaires_casablanca_passwords.csv"
ALL_LOGINS = ROOT / "supabase" / "seeds" / "ALL_PROFESSIONAL_LOGINS.csv"
AVATAR_DIR = ROOT / "frontend" / "public" / "notaires"
SEED_BATCH = "notaires_casablanca_2026"
NS = uuid.UUID("b7e2c1f0-8a22-4d33-9e44-b1fb26f6ff01")
CAT_CODE = "6.4.1"
OUTAGHANI_STUB_ID = "b7c4e2a1-0f11-5c22-9d33-0a1a10a1a001"

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
    "Une étude de confiance pour vos projets patrimoniaux à Casablanca.",
    "Conseil notarial accessible, avec un suivi transparent du dossier.",
]


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\u2014", "-").replace("\u2013", "-").replace("—", "-").replace("–", "-")
    return "'" + text.replace("'", "''") + "'"


def slugify(value: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return (text or fallback)[:40]


def collapse_spaced_letters(raw: str) -> str:
    """M O U R A D Z A A M A N E -> Mourad Zaamane when mostly single letters."""
    parts = [p for p in re.split(r"\s+", raw.strip()) if p]
    if len(parts) >= 4 and sum(1 for p in parts if len(p) == 1) >= len(parts) * 0.7:
        joined = "".join(parts)
        # Prefer a first-name length that leaves a lasting surname (e.g. Mourad Zaamane).
        for n in (6, 5, 7, 4, 8):
            if 2 <= n < len(joined) - 2:
                return joined[:n].capitalize() + " " + joined[n:].capitalize()
        mid = max(3, len(joined) // 2)
        return joined[:mid].capitalize() + " " + joined[mid:].capitalize()
    return raw


def strip_maitre(name: str) -> str:
    text = name.strip()
    text = re.sub(r"(?i)^m\.?\s*e\.?\s+", "", text)
    text = re.sub(r"(?i)^me\s+", "", text)
    text = re.sub(r"(?i)^ma[iî]tre\s+", "", text)
    # IMANE MAITRE HAMDOUCHI / sabri Maitre fatima zahra
    text = re.sub(r"(?i)\bma[iî]tre\b", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    # "sabri ... fatima zahra" -> put family name last if first token looks like surname alone after strip
    return text


def title_name(raw: str) -> str:
    raw = collapse_spaced_letters(raw)
    raw = strip_maitre(raw)
    parts = [p for p in re.split(r"\s+", raw.strip()) if p]
    out = []
    for p in parts:
        low = p.lower().replace("'", "")
        if low in {"el", "al", "ben", "ait", "ou", "ep", "ibn", "bnou"}:
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


def city_from_address(address: str) -> str:
    a = (address or "").upper()
    if "EL JADIDA" in a or "ELJADIDA" in a:
        return "El Jadida"
    if "TIT MELLIL" in a or "TIT-MELLIL" in a:
        return "Tit Mellil"
    if "BOUSKOURA" in a:
        return "Bouskoura"
    if "NOUACEUR" in a:
        return "Nouaceur"
    if "DAR BOUAZZA" in a or "ERRAHMA" in a:
        return "Dar Bouazza"
    if "BERRECHID" in a:
        return "Berrechid"
    return "Casablanca"


def initials(name: str) -> str:
    skip = {"el", "al", "ben", "ait", "ou", "ep", "maitre", "maître", "me"}
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
    hook = HOOKS[i % len(HOOKS)]
    return (
        f"{name}, notaire à {city}. {hook} "
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
    return "@" in line and re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", line) is not None


def is_phone(line: str) -> bool:
    digits = re.sub(r"\D", "", line)
    return len(digits) >= 9 and (digits.startswith("0") or digits.startswith("212"))


def parse_rows() -> list[dict[str, str]]:
    raw = RAW_PATH.read_text(encoding="utf-8")
    lines = [ln.strip() for ln in raw.splitlines() if ln.strip()]
    rows: list[dict[str, str]] = []
    i = 0
    while i + 3 < len(lines):
        name, address, phone, email = lines[i], lines[i + 1], lines[i + 2], lines[i + 3]
        # Swap if address is email and later line is address-like
        if is_email(address) and is_phone(phone) and is_email(email):
            # name / email-as-address / phone / email -> use Casablanca
            address = "Casablanca"
        if is_email(address) and not is_phone(phone):
            # malformed; skip block attempt shift
            i += 1
            continue
        if not is_phone(phone) or not is_email(email):
            i += 1
            continue
        if address in {".", ""} or re.fullmatch(r"\d{5}", address):
            address = f"Casablanca {address}" if re.fullmatch(r"\d{5}", address) else "Casablanca"
        address = address.replace("\u2014", "-").replace("\u2013", "-").replace("—", "-").replace("–", "-")
        rows.append(
            {
                "name_raw": name,
                "full_name": title_name(name),
                "address": address,
                "phone": phone,
                "email": email.lower().strip(),
            }
        )
        i += 4
    return rows


def main() -> None:
    rows = parse_rows()
    if not rows:
        raise SystemExit(f"No rows parsed from {RAW_PATH}")
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    usernames: set[str] = set()
    emails_seen: set[str] = set()
    lines: list[str] = []
    pw_lines = ["id,email,username,full_name,password"]

    lines.append("-- AUTO-GENERATED by scripts/seed_notaires_casablanca.py")
    lines.append(f"-- Seed batch: {SEED_BATCH}")
    lines.append(f"-- Notaires: {len(rows)}")
    lines.append("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    lines.append("BEGIN;")
    lines.append("")
    # Remove prior incomplete Outaghani stub (Berrechid one-off).
    lines.append(f"-- Drop prior Outaghani stub {OUTAGHANI_STUB_ID}")
    lines.append(
        f"DELETE FROM public.services WHERE user_id = {sql_str(OUTAGHANI_STUB_ID)}::uuid "
        f"OR user_id IN (SELECT id FROM public.profiles WHERE username = 'notaire-kamal-outaghani');"
    )
    lines.append(
        "DELETE FROM public.profile_internal_categories WHERE profile_id = "
        f"{sql_str(OUTAGHANI_STUB_ID)}::uuid OR profile_id IN "
        "(SELECT id FROM public.profiles WHERE username = 'notaire-kamal-outaghani');"
    )
    lines.append(
        "DELETE FROM public.profile_category_history WHERE profile_id = "
        f"{sql_str(OUTAGHANI_STUB_ID)}::uuid OR profile_id IN "
        "(SELECT id FROM public.profiles WHERE username = 'notaire-kamal-outaghani');"
    )
    lines.append(
        "DELETE FROM public.profiles WHERE id = "
        f"{sql_str(OUTAGHANI_STUB_ID)}::uuid OR username = 'notaire-kamal-outaghani';"
    )
    lines.append(
        "DELETE FROM auth.identities WHERE user_id = "
        f"{sql_str(OUTAGHANI_STUB_ID)}::uuid OR user_id IN "
        "(SELECT id FROM auth.users WHERE email = 'notaire-kamal-outaghani@notaires-agadir.sifarah.local');"
    )
    lines.append(
        "DELETE FROM auth.users WHERE id = "
        f"{sql_str(OUTAGHANI_STUB_ID)}::uuid OR email = 'notaire-kamal-outaghani@notaires-agadir.sifarah.local';"
    )
    lines.append("")
    lines.append(
        f"DELETE FROM public.services WHERE user_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM public.profile_internal_categories WHERE profile_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM public.profile_category_history WHERE profile_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM public.profiles WHERE id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)});"
    )
    lines.append(
        f"DELETE FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)};"
    )
    lines.append("")

    kept = 0
    for i, row in enumerate(rows):
        email = row["email"]
        if email in emails_seen:
            continue
        emails_seen.add(email)
        full_name = row["full_name"]
        bare = full_name
        display = bare

        base = slugify(bare, f"notaire-{i+1}")
        username = f"notaire-{base}"[:48]
        n = 2
        while username in usernames:
            username = f"notaire-{base}-{n}"[:48]
            n += 1
        usernames.add(username)

        user_id = str(uuid.uuid5(NS, email))
        svc_id = str(uuid.uuid5(NS, f"svc:{email}"))
        city = city_from_address(row["address"])
        phone = phone_e164(row["phone"])
        password = f"Sifarah-{username}-2026!"
        fg, bg = COLORS[kept % len(COLORS)]
        letters = initials(bare)
        svg_name = f"{username}.svg"
        write_svg(AVATAR_DIR / svg_name, letters, fg, bg)
        avatar = f"/notaires/{svg_name}"

        bio = bio_for(bare, city, kept)
        about = about_for(bare, row["address"], row["phone"], email, city, kept)
        login_email = f"{username}@notaires-casablanca.sifarah.local"

        meta = {
            "seed_batch": SEED_BATCH,
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
            [
                "Acte authentique",
                "Vérification des pièces",
                "Conseil préalable",
                "Formalités post-signature",
            ],
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
            f"'devis', NULL, NULL, 'villes', {sql_str(cities)}::jsonb, 'Casablanca-Settat', "
            f"FALSE, FALSE, {sql_str(audiences)}::jsonb, NULL, {sql_str(missions)}::jsonb, "
            f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(CAT_CODE)} LIMIT 1)"
            ");"
        )
        lines.append("")

        pw_lines.append(f"{user_id},{login_email},{username},{display},{password}")
        kept += 1

    lines.append("COMMIT;")
    lines.append(f"-- Login emails: {{username}}@notaires-casablanca.sifarah.local")
    lines.append(f"-- Passwords: see {OUT_PASSWORDS.name}")

    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    OUT_SQL.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_PASSWORDS.write_text("\n".join(pw_lines) + "\n", encoding="utf-8")

    if ALL_LOGINS.exists():
        existing = ALL_LOGINS.read_text(encoding="utf-8")
        append_rows = "\n".join(pw_lines[1:]) + "\n"
        if not existing.endswith("\n"):
            existing += "\n"
        ALL_LOGINS.write_text(existing + append_rows, encoding="utf-8")

    print(f"Wrote {OUT_SQL} ({kept} notaires, parsed {len(rows)})")
    print(f"Wrote {OUT_PASSWORDS}")
    print(f"Avatars in {AVATAR_DIR}")


if __name__ == "__main__":
    main()
