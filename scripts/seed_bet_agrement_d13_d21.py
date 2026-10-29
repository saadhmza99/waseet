#!/usr/bin/env python3
"""Seed bureaux d'études agréés from bureaux_etudes_agrement.csv.

Only D13–D21 domains are kept (other D codes in the CSV are dropped).
No em dashes in generated copy. Re-run safe via seed_batch.
"""

from __future__ import annotations

import csv
import json
import re
import unicodedata
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "bureaux_etudes_agrement.csv"
OUT_SQL = ROOT / "supabase" / "seeds" / "seed_bet_agrement_d13_d21.sql"
OUT_PASSWORDS = ROOT / "supabase" / "seeds" / "seed_bet_agrement_d13_d21_passwords.csv"
ALL_LOGINS = ROOT / "supabase" / "seeds" / "ALL_PROFESSIONAL_LOGINS.csv"
AVATAR_DIR = ROOT / "frontend" / "public" / "monograms"
SEED_BATCH = "bet_agrement_d13_d21_2026"
NS = uuid.UUID("a11ce5e0-be17-4d13-9d21-0a9e5e0d13d1")

ALLOWED_D = {f"D{i}" for i in range(13, 22)}
D_TO_CODE = {f"D{i}": f"3.4.{i}" for i in range(13, 22)}

D_LABELS = {
    "D13": "études générales",
    "D14": "calcul de structures",
    "D15": "courant fort et courant faible",
    "D16": "réseaux des fluides",
    "D17": "voirie, assainissement et eau potable",
    "D18": "électricité, télécoms et éclairage public",
    "D19": "études d'impact sur l'environnement",
    "D20": "géologie, géophysique et hydrologie",
    "D21": "sécurité incendie dans les constructions",
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
    "Des dossiers techniques clairs, conformes aux normes et prêts pour le chantier.",
    "Un interlocuteur unique du diagnostic jusqu'aux plans d'exécution.",
    "Rigueur de calcul, délais tenus et coordination avec les architectes.",
    "Missions d'études calibrées pour promoteurs, collectivités et entreprises.",
    "Livrables traçables, notes de calcul et plans adaptés à votre programme.",
    "Une équipe de bureau d'études réactive, ancrée dans le tissu local.",
]


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    text = (
        text.replace("\u2014", "-")
        .replace("\u2013", "-")
        .replace("—", "-")
        .replace("–", "-")
    )
    return "'" + text.replace("'", "''") + "'"


def slugify(value: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return (text or fallback)[:40]


def initials(name: str) -> str:
    skip = {"el", "al", "ben", "ait", "ou", "de", "du", "la", "le", "et", "and", "ste", "sarl", "sa"}
    parts = [p for p in re.split(r"[\s\-_/]+", (name or "").strip()) if p and p.lower() not in skip]
    if not parts:
        return "BE"
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


def phone_e164(raw: str) -> str:
    digits = re.sub(r"\D", "", raw or "")
    if not digits:
        return ""
    if digits.startswith("212"):
        return "+" + digits
    if digits.startswith("0") and len(digits) >= 9:
        return "+212" + digits[1:]
    return "+212" + digits


def title_company(raw: str) -> str:
    text = re.sub(r"\s+", " ", (raw or "").strip())
    text = text.replace("`", "'")
    # Keep known acronyms uppercase-ish; otherwise title-ish
    if text.isupper() and len(text) > 4:
        small = {"de", "des", "du", "la", "le", "les", "et", "d", "l"}
        parts = []
        for i, p in enumerate(text.split(" ")):
            low = p.lower().strip(".,;")
            if low in small and i > 0:
                parts.append(low)
            elif re.fullmatch(r"[A-Z]{2,6}", p) or re.fullmatch(r"[A-Z]\.?[A-Z]\.?", p):
                parts.append(p)
            else:
                parts.append(p.capitalize() if p else p)
        return " ".join(parts)
    return text


def domains_d13_d21(row: dict) -> list[str]:
    src = [c.strip() for c in (row.get("sources") or "").split(";") if c.strip()]
    return [c for c in src if c in ALLOWED_D]


def bio_for(name: str, city: str, domains: list[str], i: int) -> str:
    # profiles.bio CHECK char_length <= 251
    labels = [D_LABELS[d] for d in domains[:3] if d in D_LABELS]
    focus = ", ".join(labels) if labels else "études techniques"
    hook = HOOKS[i % len(HOOKS)]
    short_name = name if len(name) <= 48 else name[:45].rstrip() + "…"
    text = f"{short_name} est un bureau d'études à {city}, agréé pour {focus}. {hook}"
    if len(text) <= 251:
        return text
    return text[:250].rstrip(" .,;") + "."


def about_for(name: str, city: str, address: str, phone: str, agrement: str, domains: list[str], i: int) -> str:
    labels = [D_LABELS[d] for d in domains if d in D_LABELS]
    domain_line = "; ".join(f"{d} ({D_LABELS[d]})" for d in domains if d in D_LABELS)
    hook = HOOKS[i % len(HOOKS)]
    phone_line = f"<p>Téléphone: {phone}</p>" if phone else ""
    addr = address.strip() or city
    return f"""<h2>{name}</h2>
<p>{name} intervient depuis {city} comme bureau d'études techniques agréé (code {agrement}).</p>
<p>Domaines D13 à D21 couverts: {domain_line or "études techniques du bâtiment et des infrastructures"}.</p>
<p>{hook}</p>
<p>Nous accompagnons maîtres d'ouvrage, architectes et entreprises générales sur la conception, le dimensionnement et le suivi des études, avec des livrables conformes aux référentiels marocains.</p>
<ul>
<li>Études et notes de calcul</li>
<li>Plans et dossiers d'exécution</li>
<li>Coordination avec les corps d'état</li>
</ul>
<p>Adresse: {addr}</p>
{phone_line}
<p>Retrouvez {name} sur Sifarah pour échanger sur votre prochain projet.</p>
""".replace("\u2014", "-").replace("—", "-").replace("–", "-")


def load_rows() -> list[dict]:
    with CSV_PATH.open(encoding="utf-8", newline="") as f:
        raw = list(csv.DictReader(f))
    out = []
    for row in raw:
        domains = domains_d13_d21(row)
        if not domains:
            continue
        out.append({**row, "_domains": domains})
    return out


def main() -> None:
    rows = load_rows()
    if not rows:
        raise SystemExit("No rows with D13-D21")

    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    usernames: set[str] = set()
    lines: list[str] = []
    pw_lines = ["id,email,username,full_name,password,agrement_code,city"]

    lines.append("-- AUTO-GENERATED by scripts/seed_bet_agrement_d13_d21.py")
    lines.append(f"-- Seed batch: {SEED_BATCH}")
    lines.append(f"-- Bureaux (D13-D21 only): {len(rows)}")
    lines.append("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    lines.append("BEGIN;")
    lines.append("")
    lines.append("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agrement_code TEXT;")
    lines.append("CREATE INDEX IF NOT EXISTS profiles_agrement_code_idx ON public.profiles (agrement_code);")
    lines.append("")
    # Ensure D13-D21 categories exist
    lines.append(
        """
INSERT INTO public.internal_categories (category_id, code, sub_category, detailed_sub_category, feed_sub_category_id)
SELECT v.category_id, v.code, v.sub_category, v.detailed_sub_category, f.id
FROM (VALUES
  (3, '3.4.13', 'Ingénierie & études', 'D13 - Études générales', 'ingenierie-etudes'),
  (3, '3.4.14', 'Ingénierie & études', 'D14 - Calcul de structures', 'ingenierie-etudes'),
  (3, '3.4.15', 'Ingénierie & études', 'D15 - Courant fort et courant faible', 'ingenierie-etudes'),
  (3, '3.4.16', 'Ingénierie & études', 'D16 - Réseaux des fluides', 'ingenierie-etudes'),
  (3, '3.4.17', 'Ingénierie & études', 'D17 - Voirie, assainissement et eau potable', 'ingenierie-etudes'),
  (3, '3.4.18', 'Ingénierie & études', 'D18 - Électricité, télécoms et éclairage public', 'ingenierie-etudes'),
  (3, '3.4.19', 'Ingénierie & études', 'D19 - Études d''impact sur l''environnement', 'ingenierie-etudes'),
  (3, '3.4.20', 'Ingénierie & études', 'D20 - Géologie, géophysique, hydrologie', 'ingenierie-etudes'),
  (3, '3.4.21', 'Ingénierie & études', 'D21 - Sécurité incendie dans les constructions', 'ingenierie-etudes')
) AS v(category_id, code, sub_category, detailed_sub_category, feed_slug)
JOIN public.feed_sub_categories f ON f.slug = v.feed_slug
ON CONFLICT (code) DO UPDATE
SET category_id = EXCLUDED.category_id,
    sub_category = EXCLUDED.sub_category,
    detailed_sub_category = EXCLUDED.detailed_sub_category,
    feed_sub_category_id = EXCLUDED.feed_sub_category_id;
""".strip()
    )
    lines.append("")

    # Clean previous batch
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

    for i, row in enumerate(rows):
        domains: list[str] = row["_domains"]
        name = title_company(row.get("nom") or f"Bureau {i+1}")
        city = (row.get("ville") or "").strip().title() or "Maroc"
        address = (row.get("adresse") or "").strip()
        phone = phone_e164(row.get("telephone") or "")
        agrement = (row.get("code d'agrément") or row.get("code d'agrement") or "").strip()
        # CSV header may be mojibake in some readers; fall back
        if not agrement:
            for k, v in row.items():
                if k and "agr" in k.lower() and "code" in k.lower():
                    agrement = (v or "").strip()
                    break

        base = slugify(name, f"bet-{i+1}")
        username = f"bet-{base}"[:48]
        n = 2
        while username in usernames:
            username = f"bet-{base}-{n}"[:48]
            n += 1
        usernames.add(username)

        # Stable id from CSV id when present
        csv_id = (row.get("id") or "").strip()
        user_id = csv_id if re.fullmatch(r"[0-9a-fA-F-]{36}", csv_id) else str(uuid.uuid5(NS, f"{agrement}:{name}:{city}"))
        # Force UUID v5 namespace shape if csv uuid collides with existing non-batch users: prefer uuid5 of agrement
        user_id = str(uuid.uuid5(NS, f"bet:{agrement}:{username}"))

        password = f"Sifarah-{username}-2026!"
        login_email = f"{username}@bet-agrement.sifarah.local"
        fg, bg = COLORS[i % len(COLORS)]
        letters = initials(name)
        svg_name = f"{username}-{user_id[:8]}.svg"
        write_svg(AVATAR_DIR / svg_name, letters, fg, bg)
        avatar = f"/monograms/{svg_name}"

        primary_d = domains[0]
        primary_code = D_TO_CODE[primary_d]
        bio = bio_for(name, city, domains, i)
        about = about_for(name, city, address, phone, agrement or "n/a", domains, i)

        meta = {
            "seed_batch": SEED_BATCH,
            "username": username,
            "full_name": name,
            "profession": "Bureau d'études",
            "location": city,
            "bio": bio,
            "phone": phone,
            "profile_type": "enterprise",
            "internal_category_code": primary_code,
            "agrement_code": agrement,
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
        lines.append(f"  full_name = {sql_str(name)},")
        lines.append("  profession = 'Bureau d''études',")
        lines.append(f"  location = {sql_str(city)},")
        lines.append(f"  bio = {sql_str(bio)},")
        lines.append(f"  about_text = {sql_str(about)},")
        lines.append(f"  phone = {sql_str(phone or None)},")
        lines.append("  email = NULL,")
        lines.append("  website_url = NULL,")
        lines.append(f"  avatar_url = {sql_str(avatar)},")
        lines.append("  cover_photo_url = NULL,")
        lines.append("  profile_type = 'enterprise',")
        lines.append("  directory_visible = TRUE,")
        lines.append(f"  agrement_code = {sql_str(agrement or None)},")
        lines.append(
            f"  internal_category_id = (SELECT id FROM public.internal_categories WHERE code = {sql_str(primary_code)} LIMIT 1),"
        )
        lines.append("  updated_at = NOW()")
        lines.append(f"WHERE id = {sql_str(user_id)}::uuid;")
        lines.append("")

        lines.append(f"DELETE FROM public.profile_internal_categories WHERE profile_id = {sql_str(user_id)}::uuid;")
        for di, d in enumerate(domains):
            code = D_TO_CODE[d]
            is_primary = "TRUE" if di == 0 else "FALSE"
            lines.append(
                "INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary) "
                f"SELECT {sql_str(user_id)}::uuid, ic.id, {is_primary} FROM public.internal_categories ic "
                f"WHERE ic.code = {sql_str(code)} LIMIT 1 "
                "ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;"
            )
        lines.append("")

        pw_lines.append(
            f"{user_id},{login_email},{username},{name.replace(',', ' ')},{password},{agrement},{city}"
        )

    lines.append("COMMIT;")
    lines.append(f"-- Seeded {len(rows)} BET profiles (D13-D21 only)")
    lines.append("NOTIFY pgrst, 'reload schema';")

    OUT_SQL.write_text("\n".join(lines) + "\n", encoding="utf-8")
    OUT_PASSWORDS.write_text("\n".join(pw_lines) + "\n", encoding="utf-8")

    # Append logins CSV (dedupe by username)
    existing = ""
    if ALL_LOGINS.exists():
        existing = ALL_LOGINS.read_text(encoding="utf-8")
    append_rows = []
    for line in pw_lines[1:]:
        parts = line.split(",", 5)
        if len(parts) < 5:
            continue
        uid, email, username, full_name, password = parts[0], parts[1], parts[2], parts[3], parts[4]
        if username in existing:
            continue
        append_rows.append(
            f"bet_agrement,{uid},{email},{username},{full_name},{password},seed_bet_agrement_d13_d21_passwords.csv"
        )
    if append_rows:
        with ALL_LOGINS.open("a", encoding="utf-8", newline="") as f:
            if existing and not existing.endswith("\n"):
                f.write("\n")
            f.write("\n".join(append_rows) + "\n")

    print(f"Wrote {len(rows)} profiles -> {OUT_SQL}")
    print(f"Passwords -> {OUT_PASSWORDS}")
    print(f"Monograms -> {AVATAR_DIR}")


if __name__ == "__main__":
    main()
