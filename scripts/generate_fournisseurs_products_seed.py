#!/usr/bin/env python3
"""Generate SQL seeds for Le Chantier fournisseurs + products.

Sources (folder `fournisseurs et produits/`):
  lechantier_suppliers_complete.csv
  lechantier_products_complete.csv
  lechantier_product_supplier_relationships.csv

Optional match file (repo root, from live DB export):
  _tmp_existing_pros.csv  (id,email,username,website_url,seed_batch)

When a fournisseur matches an existing account (email, username, or website
domain), that profile id is reused and only empty/missing columns are
enriched — no duplicate auth.users row.

Outputs:
  supabase/seeds/seed_fournisseurs_289.sql
  supabase/seeds/seed_products_289.sql
  supabase/seeds/seed_fournisseurs_289_passwords.csv

Usage: python scripts/generate_fournisseurs_products_seed.py
"""
from __future__ import annotations

import csv
import json
import re
import unicodedata
import uuid
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "fournisseurs et produits"
SUPPLIERS_CSV = DATA / "lechantier_suppliers_complete.csv"
PRODUCTS_CSV = DATA / "lechantier_products_complete.csv"
RELS_CSV = DATA / "lechantier_product_supplier_relationships.csv"
EXISTING_CSV = ROOT / "_tmp_existing_pros.csv"

OUT_FOUR = ROOT / "supabase" / "seeds" / "seed_fournisseurs_289.sql"
OUT_PROD = ROOT / "supabase" / "seeds" / "seed_products_289.sql"
OUT_PASS = ROOT / "supabase" / "seeds" / "seed_fournisseurs_289_passwords.csv"

SEED_BATCH = "fournisseurs_289"
PASSWORD_PREFIX = "Sifarah"
PASSWORD_SUFFIX = "2026!"
INTERNAL_CATEGORY_CODE = "8.5.4"
NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

AGGREGATOR_DOMAINS = {
    "lechantier.ma",
    "www.lechantier.ma",
    "chridari.ma",
    "www.chridari.ma",
    "tachrone.ma",
    "www.tachrone.ma",
    "wa.me",
    "api.whatsapp.com",
    "facebook.com",
    "www.facebook.com",
    "instagram.com",
    "www.instagram.com",
    "linkedin.com",
    "www.linkedin.com",
}

BAD_EMAIL_DOMAINS = {"https", "http", "wa.me", "gmail", "email"}

CATEGORY_FR: dict[str, str] = {
    "Aluminium": "Aluminium",
    "Lighting": "Luminaire",
    "Pool": "Piscine",
    "Marble": "Pierre naturelle",
    "Natural stone": "Pierre naturelle",
    "Ready-mix concrete": "Matériaux de construction",
    "Interior coatings": "Revêtement mural",
    "Exterior coatings": "Revêtement mural",
    "Floor systems (beams & blocks)": "Matériaux de construction",
    "Wall panels": "Revêtement mural",
    "Basins & washbasins": "Salle de bain / Sanitaire",
    "Toilets & bidets": "Salle de bain / Sanitaire",
    "Solar energy": "Climatisation / Chauffage",
    "Safety gear (PPE)": "EPI",
    "Bricks": "Matériaux de construction",
    "Cement": "Matériaux de construction",
    "Garden": "Aménagement extérieur",
    "Site equipment": "Matériel de chantier",
    "Site tools": "Matériel de chantier",
    "Door hardware": "Quincaillerie",
    "Hardware": "Quincaillerie",
    "Circuit breakers & fuses": "Matériel électrique",
    "Electrical equipment": "Matériel électrique",
    "HVAC": "Climatisation / Chauffage",
    "Flooring": "Revêtement de sol",
    "Carpentry / Woodwork": "Menuiserie",
    "Bathroom / Sanitary": "Salle de bain / Sanitaire",
    "Wall covering": "Revêtement mural",
    "Modular building": "Bâtiment modulaire",
    "Home automation": "Automatisme",
    "Paint": "Peinture",
    "Insulation": "Isolation",
    "Waterproofing": "Étanchéité",
    "Glass": "Vitrerie",
    "Tile": "Carrelage",
    "Kitchen": "Cuisine",
    "Fire safety": "Incendie",
    "Elevators": "Ascenseurs",
    "Plumbing": "Plomberie",
    "Other": "Matériaux de construction",
}


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    # Normalize curly/smart quotes so they don't break SQL string literals.
    text = (
        text.replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u00b4", "'")
        .replace("`", "'")
    )
    # Keep each INSERT on one line for the Management API SQL runner.
    text = text.replace("\n", " ").replace("\t", " ")
    return "'" + text.replace("'", "''") + "'"


def sql_num(value) -> str:
    if value is None or value == "":
        return "NULL"
    try:
        return str(float(value))
    except (TypeError, ValueError):
        return "NULL"


def sql_json(value) -> str:
    """Emit JSON as a dollar-quoted literal so nested quotes stay valid JSON."""
    payload = json.dumps(value, ensure_ascii=False)
    payload = payload.replace("\r\n", "\n").replace("\r", "\n").replace("\n", " ").replace("\t", " ")
    tag = "j"
    while f"${tag}$" in payload:
        tag += "x"
    return f"${tag}${payload}${tag}$::jsonb"


def slugify(value: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return (text or fallback)[:40].strip("-")


def parse_json_list(raw: str | None) -> list:
    if not raw or not str(raw).strip():
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


def image_urls(raw: str | None, limit: int = 6) -> list[str]:
    """Extract http(s) image URLs only (skip objects / junk)."""
    urls: list[str] = []
    for item in parse_json_list(raw):
        if isinstance(item, str):
            u = item.strip()
        elif isinstance(item, dict):
            u = str(item.get("src") or item.get("url") or "").strip()
        else:
            continue
        if u.startswith("http") and "dangerouslySetInnerHTML" not in u and len(u) < 500:
            urls.append(u)
        if len(urls) >= limit:
            break
    return urls


def first_str(items: list) -> str:
    for item in items:
        if isinstance(item, str) and item.strip():
            return item.strip()
        if isinstance(item, dict):
            for key in ("url", "value", "phone", "email", "href"):
                if item.get(key):
                    return str(item[key]).strip()
    return ""


def normalize_key(value: str) -> str:
    text = (value or "").strip().lower()
    text = text.replace("https://", "").replace("http://", "")
    text = text.removeprefix("www.")
    return text.rstrip("/")


def host_of(url: str) -> str:
    if not url:
        return ""
    raw = url.strip()
    if not raw.startswith("http"):
        raw = "https://" + raw
    try:
        host = (urlparse(raw).hostname or "").lower().removeprefix("www.")
    except Exception:
        return ""
    if not host or host in AGGREGATOR_DOMAINS or "." not in host:
        return ""
    return host


def is_valid_email(email: str) -> bool:
    email = (email or "").strip().lower()
    if "@" not in email or " " in email:
        return False
    local, _, domain = email.partition("@")
    if not local or not domain or "." not in domain:
        return False
    if domain in BAD_EMAIL_DOMAINS or domain in AGGREGATOR_DOMAINS:
        return False
    if domain.startswith("http") or "/" in domain:
        return False
    return True


def login_email(username: str, websites: list, emails_j: list) -> str:
    display = first_str(emails_j)
    if is_valid_email(display):
        return display.lower()
    for url in websites:
        host = host_of(str(url))
        if host:
            return f"contact@{host}"
    return f"{username}@sifarah.local"


def clean_text(value: str | None, limit: int = 1500) -> str:
    """Drop crawler junk (RSC payloads, huge HTML) and keep readable text."""
    text = (value or "").strip()
    if not text:
        return ""
    # React Server Components / Next.js flight payloads
    if any(
        marker in text
        for marker in (
            "dangerouslySetInnerHTML",
            "$undefined",
            '"children"',
            "self.__next_f",
            "__html",
        )
    ):
        return ""
    if text.count("{") > 12 or text.count("<") > 20:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def clean_specs(value: str | None, limit: int = 4000) -> str:
    """Keep real technical specs; drop supplier-list scrape residue."""
    text = clean_text(value, limit)
    if not text:
        return ""
    low = text.lower().replace(" ", "")
    if "availablesuppliers" in low or "whatsappphone" in low or "voirfiche" in low:
        return ""
    if text.lower().startswith("available suppliers"):
        return ""
    return text


def extract_specs_from_blob(value: str | None, limit: int = 4000) -> str:
    """Pull specs after 'Technical specifications' inside contaminated min-qty blobs."""
    raw = (value or "").strip()
    if not raw:
        return ""
    m = re.search(r"Technical\s+specifications\s*(.*)$", raw, flags=re.I | re.S)
    if not m:
        return ""
    body = m.group(1)
    # Cut crawl tails before they inject RSC / supplier widgets
    body = re.split(
        r"(?:Available\s+suppliers|Frequently\s+asked\s+questions|Request\s+a\s+quote|WhatsAppPhone|Voir\s+fiche)",
        body,
        maxsplit=1,
        flags=re.I,
    )[0]
    # bullet-like markers from crawl
    body = body.replace("✅", "\n• ").replace("�o.", "\n• ")
    body = re.sub(r"[\u2022\u25cf\u25e6]", "\n• ", body)
    lines = []
    for part in re.split(r"\n•\s*|\n+", body):
        part = re.sub(r"\s+", " ", part).strip(" •\t")
        if part:
            lines.append(f"• {part}" if not part.startswith("•") else part)
    text = "\n".join(lines).strip()
    if not text or len(text) < 8:
        return ""
    if text.count("{") > 8 or "dangerouslySetInnerHTML" in text:
        return ""
    return text[:limit]


def extract_min_quantity(value: str | None) -> str:
    raw = (value or "").strip()
    if not raw:
        return ""
    # Prefer known units so "1 PièceDelivery" → "1 Pièce"
    m = re.search(
        r"([0-9]+(?:[.,][0-9]+)?\s*(?:Pi[eè]ces?|pcs?|Unit[eé]s?|m[²2]|m[èe]tres?(?:\s+lin[eé]aires?)?|kg|Kilogrammes?|Lots?|Cartons?|Sacs?|Palettes?))",
        raw,
        flags=re.I,
    )
    if m:
        return m.group(1).strip()[:60]
    m = re.match(r"^[:\s]*([0-9]+(?:[.,][0-9]+)?)", raw)
    return m.group(1).strip()[:60] if m else ""


KNOWN_UNITS = (
    "pièce",
    "piece",
    "pcs",
    "unité",
    "unite",
    "kg",
    "kilogramme",
    "m²",
    "m2",
    "mètre",
    "metre",
    "ml",
    "m³",
    "m3",
    "litre",
    "l",
    "sac",
    "palette",
    "rouleau",
    "boîte",
    "boite",
    "carton",
    "set",
    "lot",
)


def normalize_unit_token(unit: str) -> str:
    unit = (unit or "").strip()[:40]
    if not unit:
        return ""
    low = (
        unit.lower()
        .replace("é", "e")
        .replace("è", "e")
        .replace("ô", "o")
        .replace("à", "a")
    )
    if low in ("schema", "html", "undefined", "null", "json"):
        return ""
    # Trim glued crawl tails: PièceLe → Pièce, MètreDelivery → Mètre
    for known in sorted(KNOWN_UNITS, key=len, reverse=True):
        if low == known or low.startswith(known):
            # preserve original casing for the matched prefix length
            return unit[: len(known)] if len(unit) >= len(known) else unit
    if len(unit) > 12 or any(ch in unit for ch in "{}\"'<>"):
        return ""
    return unit


def extract_unit(*candidates: str | None) -> str:
    """Pull unit after MAD/… from price or supplier blobs; reject RSC junk."""
    for raw in candidates:
        text = (raw or "").strip()
        if not text:
            continue
        if any(m in text for m in ("dangerouslySetInnerHTML", "$undefined", "self.__next_f")):
            # still try a short MAD/unit match on the head
            text = text[:200]
        text = re.sub(r"\s+", " ", text)
        m = re.search(
            r"(?:MAD|DH|€|EUR)\s*/\s*([A-Za-zÀ-ÿ0-9²³]+(?:\s+[A-Za-zÀ-ÿ0-9²³]+)?)",
            text,
            flags=re.I,
        )
        if not m:
            # From950MAD / PièceLe
            m = re.search(
                r"(?:MAD|DH)\s*/\s*([A-Za-zÀ-ÿ0-9²³]+)",
                text.replace(" ", ""),
                flags=re.I,
            )
            if m:
                # re-read with spaces from original around match is hard; use token only
                unit = normalize_unit_token(m.group(1))
                if unit:
                    return unit
            continue
        unit = normalize_unit_token(m.group(1))
        if unit:
            return unit
    return ""


def profession_for(row: dict) -> str:
    linked = parse_json_list(row.get("linked_categories_json"))
    for cat in linked:
        label = str(cat).strip()
        if label and label != "Other":
            return CATEGORY_FR.get(label, label)[:80]
    title = (row.get("business_category_from_title") or "").strip()
    if title and title.lower() not in ("casablanca", "rabat", "marrakech", "tanger"):
        title = re.sub(r"\s+in\s+.+$", "", title, flags=re.I).strip()
        return CATEGORY_FR.get(title, title)[:80] or "Fournisseur"
    return "Fournisseur de matériaux"


def load_existing() -> tuple[dict[str, str], dict[str, str], dict[str, str]]:
    """email → id, username → id, website_host → id"""
    by_email: dict[str, str] = {}
    by_user: dict[str, str] = {}
    by_host: dict[str, str] = {}
    if not EXISTING_CSV.exists():
        print(f"WARN: {EXISTING_CSV.name} missing — no collision matching (all new accounts)")
        return by_email, by_user, by_host
    with EXISTING_CSV.open(encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            pid = (row.get("id") or "").strip()
            if not pid:
                continue
            email = (row.get("email") or "").strip().lower()
            user = (row.get("username") or "").strip().lower()
            host = host_of(row.get("website_url") or "")
            if email:
                by_email[email] = pid
            if user:
                by_user[user] = pid
            if host and host not in by_host:
                by_host[host] = pid
    print(f"Loaded existing map: {len(by_email)} emails, {len(by_user)} usernames, {len(by_host)} hosts")
    return by_email, by_user, by_host


def resolve_existing(
    email: str,
    username: str,
    website: str,
    by_email: dict[str, str],
    by_user: dict[str, str],
    by_host: dict[str, str],
) -> tuple[str | None, str]:
    if email and email in by_email:
        return by_email[email], "email"
    if username and username in by_user:
        return by_user[username], "username"
    host = host_of(website)
    if host and host in by_host:
        return by_host[host], "website"
    return None, ""


def coalesce_update(column: str, new_value: str | None) -> str:
    """Only fill when current column is null/blank (enrich, don't overwrite)."""
    if not new_value:
        return ""
    return (
        f"  {column} = CASE WHEN {column} IS NULL OR btrim({column}::text) = '' "
        f"THEN {sql_str(new_value)} ELSE {column} END,"
    )


def main() -> None:
    for path in (SUPPLIERS_CSV, PRODUCTS_CSV, RELS_CSV):
        if not path.exists():
            raise SystemExit(f"Missing: {path}")

    by_email, by_user, by_host = load_existing()

    with SUPPLIERS_CSV.open(encoding="utf-8-sig", newline="") as f:
        supplier_rows = list(csv.DictReader(f))
    with PRODUCTS_CSV.open(encoding="utf-8-sig", newline="") as f:
        product_rows = list(csv.DictReader(f))
    with RELS_CSV.open(encoding="utf-8-sig", newline="") as f:
        rel_rows = list(csv.DictReader(f))

    usernames: set[str] = set()
    used_emails: set[str] = set()
    suppliers: list[dict] = []
    key_to_owner: dict[str, str] = {}
    matched_n = 0
    new_n = 0

    for row in supplier_rows:
        name = (row.get("supplier_name") or "").strip()
        if not name or name == "404":
            continue
        key = normalize_key(row.get("supplier_identity_key") or row.get("canonical_supplier_profile_url") or name)
        if not key or key in key_to_owner:
            continue

        planned_id = str(uuid.uuid5(NS, f"sifarah:fournisseur:{key}"))
        base = slugify(name, f"fournisseur-{planned_id[:8]}")
        username = base
        n = 2
        while username in usernames:
            username = f"{base}-{n}"[:48]
            n += 1
        usernames.add(username)

        phones = parse_json_list(row.get("phone_numbers_json"))
        emails_j = parse_json_list(row.get("email_addresses_json"))
        websites = parse_json_list(row.get("website_urls_json"))
        images = parse_json_list(row.get("image_urls_json"))
        phone = first_str(phones)
        email_display = first_str(emails_j) if is_valid_email(first_str(emails_j)) else ""
        website = first_str(websites)
        if host_of(website) == "":
            # skip junk website values
            website = ""
        email = login_email(username, websites, emails_j)
        # keep login emails unique within the new-account set
        if email in used_emails and email.endswith("@sifarah.local") is False:
            # still fine for matching existing; for NEW we may need unique
            pass
        used_emails.add(email)

        logo = (row.get("logo_url") or "").strip()
        cover = first_str(images)
        city = (row.get("city") or "").strip()
        desc = clean_text(row.get("description"), 4000)
        profession = profession_for(row)
        bio = (desc[:450] if desc else f"Fournisseur — {profession} à {city or 'Maroc'}.")
        profile_url = (row.get("canonical_supplier_profile_url") or "").strip()

        existing_id, match_how = resolve_existing(email, username, website or profile_url, by_email, by_user, by_host)
        if existing_id:
            owner_id = existing_id
            is_new = False
            matched_n += 1
        else:
            # ensure unique login among NEW accounts
            login = email
            if login in by_email or login in {s["email"] for s in suppliers if s["is_new"]}:
                login = f"{username}@sifarah.local"
            email = login
            owner_id = planned_id
            is_new = True
            new_n += 1

        suppliers.append(
            {
                "planned_id": planned_id,
                "id": owner_id,
                "is_new": is_new,
                "match_how": match_how,
                "key": key,
                "name": name,
                "username": username,
                "email": email,
                "email_display": email_display or email,
                "password": f"{PASSWORD_PREFIX}-{username}-{PASSWORD_SUFFIX}",
                "phone": phone,
                # Never publish scraped / lechantier profile URLs as website_url
                "website": "",
                "match_website": website or profile_url,
                "logo": logo,
                "cover": cover,
                "city": city,
                "profession": profession,
                "bio": bio,
                "about": desc or bio,
            }
        )
        key_to_owner[key] = owner_id
        for alt in (profile_url, row.get("supplier_identity_key") or ""):
            nk = normalize_key(alt)
            if nk:
                key_to_owner[nk] = owner_id

    # product → owner
    product_owner: dict[str, str] = {}
    for rel in rel_rows:
        conf = (rel.get("match_confidence") or "").strip().lower()
        status = (rel.get("supplier_match_status") or "").strip().lower()
        if "matched_to_crawled_profile" not in status:
            continue
        if conf != "high" and "matched" not in status:
            continue
        purl = normalize_key(rel.get("product_url") or "")
        skey = normalize_key(rel.get("supplier_identity_key") or rel.get("canonical_supplier_profile_url") or "")
        owner = key_to_owner.get(skey)
        if purl and owner:
            product_owner[purl] = owner

    for row in product_rows:
        purl = normalize_key(row.get("canonical_product_url") or row.get("product_url_detailed") or "")
        if not purl or purl in product_owner:
            continue
        skey = normalize_key(row.get("supplier_profile_url") or "")
        owner = key_to_owner.get(skey)
        if owner:
            product_owner[purl] = owner

    products: list[dict] = []
    skipped_no_owner = 0
    skipped_ineligible = 0
    for row in product_rows:
        if str(row.get("eligible_as_product") or "").lower() not in ("true", "1", "yes"):
            skipped_ineligible += 1
            continue
        name = (row.get("product_name") or "").strip()
        if not name or "Construisez votre projet" in name:
            skipped_ineligible += 1
            continue
        url = (
            (row.get("canonical_product_url") or "").strip()
            or (row.get("product_url_detailed") or "").strip()
            or (row.get("product_url_original") or "").strip()
        )
        purl = normalize_key(url)
        owner = product_owner.get(purl)
        if not owner:
            skipped_no_owner += 1
            continue
        slug = (row.get("product_slug") or "").strip() or slugify(name, "product")
        pid = str(uuid.uuid5(NS, f"sifarah:product:{slug or purl}"))
        category = (
            (row.get("category_detailed") or "").strip()
            or (row.get("category_recrawl") or "").strip()
            or (row.get("category_original") or "").strip()
        )
        brand = (
            (row.get("brand_detailed") or "").strip()
            or (row.get("brand_recrawl") or "").strip()
            or (row.get("brand_original") or "").strip()
        )
        sku = (row.get("reference_sku_original") or "").strip()
        price = (row.get("cleaned_price_candidate") or "").strip()
        currency = (row.get("cleaned_price_candidate_currency") or "MAD").strip() or "MAD"
        price_text = (
            (row.get("original_priceText_verbatim") or "").strip()
            or (row.get("detailed_priceText_verbatim") or "").strip()
            or (row.get("recrawled_priceText_verbatim") or "").strip()
        )
        unit = extract_unit(
            price_text,
            row.get("technical_specifications_detailed"),
            row.get("technical_specifications_original"),
            row.get("minimum_quantity_detailed"),
            row.get("minimum_quantity_original"),
        )
        min_q = extract_min_quantity(row.get("minimum_quantity_detailed")) or extract_min_quantity(
            row.get("minimum_quantity_original")
        )
        desc = (
            clean_text(row.get("description_detailed"), 1500)
            or clean_text(row.get("description_recrawl"), 1500)
            or clean_text(row.get("description_original"), 1500)
            or clean_text(row.get("meta_description_detailed"), 500)
            or clean_text(row.get("meta_description_recrawl"), 500)
            or clean_text(row.get("meta_description_original"), 500)
        )
        gallery = (
            image_urls(row.get("product_images_detailed_json"))
            or image_urls(row.get("product_images_recrawl_json"))
            or image_urls(row.get("product_images_original_json"))
            or image_urls(row.get("all_images_detailed_json"))
        )
        cover = gallery[0] if gallery else ""
        city_owner = next((s["city"] for s in suppliers if s["id"] == owner), "")
        delivery = [city_owner] if city_owner else []
        # Official columns first; crawl often stuffed real specs into min-qty blobs.
        specs_detailed = (
            clean_specs(row.get("technical_specifications_detailed"), 4000)
            or extract_specs_from_blob(row.get("minimum_quantity_detailed"), 4000)
        )
        specs_original = (
            clean_specs(row.get("technical_specifications_original"), 4000)
            or extract_specs_from_blob(row.get("minimum_quantity_original"), 4000)
        )
        attrs = {
            "source": "lechantier",
            "source_url": url,
            "category_fr": CATEGORY_FR.get(category, category),
            "supplier_matching_status": (row.get("supplier_matching_status") or "").strip(),
            "technical_specifications_detailed": specs_detailed or None,
            "technical_specifications_original": specs_original or None,
            "specs": specs_detailed or specs_original or None,
        }
        products.append(
            {
                "id": pid,
                "user_id": owner,
                "title": name[:200],
                "description": desc or None,
                "category": category or None,
                "brand": brand or None,
                "sku": sku or None,
                "price": price or None,
                "currency": currency,
                "unit": unit or None,
                "min_quantity": min_q or None,
                "cover": cover or None,
                "gallery": gallery,
                "delivery_cities": delivery,
                "attributes": attrs,
                "source_url": url or None,
            }
        )

    seen_pids: set[str] = set()
    unique_products: list[dict] = []
    for p in products:
        if p["id"] in seen_pids:
            continue
        seen_pids.add(p["id"])
        unique_products.append(p)
    products = unique_products

    batch_users = (
        f"(SELECT id FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)})"
    )
    owner_ids = sorted({s["id"] for s in suppliers})

    # --- fournisseurs SQL ---
    lines: list[str] = []
    lines.append("-- AUTO-GENERATED by scripts/generate_fournisseurs_products_seed.py")
    lines.append(f"-- Seed batch (new accounts only): {SEED_BATCH}")
    lines.append(f"-- Fournisseurs: {len(suppliers)} (new={new_n}, matched_existing={matched_n})")
    lines.append(f"-- Password pattern (new accounts): {PASSWORD_PREFIX}-{{username}}-{PASSWORD_SUFFIX}")
    lines.append("-- Matched existing profiles are enriched (COALESCE empty fields) — not re-created.")
    lines.append("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    lines.append("")
    lines.append("BEGIN;")
    lines.append("")
    lines.append("-- Remove previous NEW-only seed batch (matched pros_services accounts are kept)")
    lines.append(f"DELETE FROM public.products WHERE user_id IN {batch_users};")
    lines.append(f"DELETE FROM public.profile_category_history WHERE profile_id IN {batch_users};")
    lines.append(f"DELETE FROM public.profiles WHERE id IN {batch_users};")
    lines.append(f"DELETE FROM auth.identities WHERE user_id IN {batch_users};")
    lines.append(f"DELETE FROM auth.users WHERE raw_user_meta_data->>'seed_batch' = {sql_str(SEED_BATCH)};")
    lines.append("")

    lines.append("-- New auth accounts (only when no existing profile matched)")
    for s in suppliers:
        if not s["is_new"]:
            continue
        meta = {
            "seed_batch": SEED_BATCH,
            "username": s["username"],
            "full_name": s["name"],
            "profession": s["profession"],
            "location": s["city"],
            "bio": s["bio"][:450],
            "profile_type": "enterprise",
            "internal_category_code": INTERNAL_CATEGORY_CODE,
            "source_supplier_key": s["key"],
        }
        app_meta = sql_str(json.dumps({"provider": "email", "providers": ["email"]}))
        lines.append(
            "INSERT INTO auth.users ("
            "instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, "
            "raw_app_meta_data, raw_user_meta_data, created_at, updated_at, "
            "confirmation_token, recovery_token, email_change_token_new, email_change"
            ") VALUES ("
            f"'00000000-0000-0000-0000-000000000000', {sql_str(s['id'])}::uuid, "
            f"'authenticated', 'authenticated', {sql_str(s['email'])}, "
            f"crypt({sql_str(s['password'])}, gen_salt('bf')), NOW(), "
            f"{app_meta}::jsonb, {sql_str(json.dumps(meta, ensure_ascii=False))}::jsonb, NOW(), NOW(), '', '', '', ''"
            ");"
        )
        lines.append(
            "INSERT INTO auth.identities ("
            "id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at"
            ") VALUES ("
            f"{sql_str(s['id'])}::uuid, {sql_str(s['id'])}::uuid, "
            f"jsonb_build_object('sub', {sql_str(s['id'])}, 'email', {sql_str(s['email'])}, "
            "'email_verified', true, 'phone_verified', false), "
            f"'email', {sql_str(s['id'])}, NOW(), NOW(), NOW()"
            ");"
        )

    lines.append("")
    lines.append("-- Enrich ALL owners (new + matched): fill empty profile columns only")
    for s in suppliers:
        lines.append(f"-- {s['name']} ({'NEW' if s['is_new'] else 'MATCH:' + s['match_how']})")
        lines.append("UPDATE public.profiles SET")
        parts = [
            coalesce_update("full_name", s["name"]),
            coalesce_update("profession", s["profession"]),
            coalesce_update("location", s["city"] or None),
            coalesce_update("bio", s["bio"][:450]),
            coalesce_update("about_text", (s["about"] or "")[:8000] or None),
            coalesce_update("phone", s["phone"] or None),
            "  website_url = NULL,",
            coalesce_update("avatar_url", s["logo"] or None),
            coalesce_update("cover_photo_url", s["cover"] or None),
        ]
        # display email: enrich if empty (don't change auth login)
        parts.append(coalesce_update("email", s["email_display"] or None))
        for part in parts:
            if part:
                lines.append(part)
        if s["is_new"]:
            lines.append("  username = " + sql_str(s["username"]) + ",")
            lines.append("  profile_type = 'enterprise',")
            lines.append(
                f"  internal_category_id = COALESCE(internal_category_id, "
                f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(INTERNAL_CATEGORY_CODE)} LIMIT 1)),"
            )
        else:
            # matched: only set category if missing
            lines.append(
                f"  internal_category_id = COALESCE(internal_category_id, "
                f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(INTERNAL_CATEGORY_CODE)} LIMIT 1)),"
            )
            lines.append("  profile_type = COALESCE(profile_type, 'enterprise'),")
        lines.append("  updated_at = NOW()")
        lines.append(f"WHERE id = {sql_str(s['id'])}::uuid;")
        lines.append("")

    lines.append("COMMIT;")
    OUT_FOUR.write_text("\n".join(lines), encoding="utf-8")

    with OUT_PASS.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["username", "email", "password", "full_name", "city", "id", "is_new", "match_how"],
        )
        w.writeheader()
        for s in suppliers:
            w.writerow(
                {
                    "username": s["username"],
                    "email": s["email"],
                    "password": s["password"] if s["is_new"] else "(existing account — keep current password)",
                    "full_name": s["name"],
                    "city": s["city"],
                    "id": s["id"],
                    "is_new": "yes" if s["is_new"] else "no",
                    "match_how": s["match_how"],
                }
            )

    # products: delete prior products for ALL owners in this seed set, then insert
    plines: list[str] = []
    plines.append("-- AUTO-GENERATED by scripts/generate_fournisseurs_products_seed.py")
    plines.append(
        f"-- Products: {len(products)} (skipped_no_owner={skipped_no_owner}, ineligible={skipped_ineligible})"
    )
    plines.append("BEGIN;")
    plines.append("")
    # wipe products owned by any fournisseur in this run (new batch + matched)
    if owner_ids:
        id_list = ", ".join(sql_str(i) + "::uuid" for i in owner_ids)
        plines.append(f"DELETE FROM public.products WHERE user_id IN ({id_list});")
    plines.append(f"DELETE FROM public.products WHERE user_id IN {batch_users};")
    plines.append("")
    for p in products:
        plines.append(
            "INSERT INTO public.products ("
            "id, user_id, title, description, category, brand, sku, price, currency, unit, "
            "min_quantity, cover, gallery, delivery_cities, attributes, source_url"
            ") VALUES ("
            f"{sql_str(p['id'])}::uuid, {sql_str(p['user_id'])}::uuid, "
            f"{sql_str(p['title'])}, {sql_str(p['description'])}, {sql_str(p['category'])}, "
            f"{sql_str(p['brand'])}, {sql_str(p['sku'])}, {sql_num(p['price'])}, "
            f"{sql_str(p['currency'])}, {sql_str(p['unit'])}, {sql_str(p['min_quantity'])}, "
            f"{sql_str(p['cover'])}, {sql_json(p['gallery'])}, {sql_json(p['delivery_cities'])}, "
            f"{sql_json(p['attributes'])}, {sql_str(p['source_url'])}"
            ") ON CONFLICT (id) DO UPDATE SET "
            "title = EXCLUDED.title, description = EXCLUDED.description, category = EXCLUDED.category, "
            "brand = EXCLUDED.brand, sku = EXCLUDED.sku, price = EXCLUDED.price, currency = EXCLUDED.currency, "
            "unit = EXCLUDED.unit, min_quantity = EXCLUDED.min_quantity, cover = EXCLUDED.cover, "
            "gallery = EXCLUDED.gallery, delivery_cities = EXCLUDED.delivery_cities, "
            "attributes = EXCLUDED.attributes, source_url = EXCLUDED.source_url, "
            "user_id = EXCLUDED.user_id, updated_at = NOW();"
        )
    plines.append("")
    plines.append("COMMIT;")
    OUT_PROD.write_text("\n".join(plines), encoding="utf-8")

    print(f"Wrote {OUT_FOUR} ({len(suppliers)} fournisseurs: new={new_n}, matched={matched_n})")
    print(f"Wrote {OUT_PROD} ({len(products)} products; skipped_no_owner={skipped_no_owner})")
    print(f"Wrote {OUT_PASS}")


if __name__ == "__main__":
    main()
