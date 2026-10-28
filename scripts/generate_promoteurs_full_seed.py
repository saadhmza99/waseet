#!/usr/bin/env python3
"""Generate SQL seed for ALL sifarah promoteurs + projets immobiliers.

Sources:
  sifarah data/promoteurs_immobiliers.csv
  sifarah data/projets_immobiliers.csv
  sifarah data/projets_pros.csv          (team links → projects.team)

Dedup against live DB exports (run scripts/_export_existing_for_promoteurs.py first):
  scripts/_existing_profiles_all.json
  scripts/_existing_projects.json
  scripts/_existing_promoteurs.json

Match keys — promoteurs (strict — no website-host merge):
  profiles.id == promoteur_id
  email (casefold, valid non-local)
  username slug
  fold(full_name) / fold(variantes_noms) / fold(nom_legal)
  (website host alone is NOT enough — subsidiaries share domains)

Match keys — projects (skip insert):
  projects.id == projet_id
  attributes.source_project_id / chridari_ref / projet_id_legacy
  fold(title) + fold(city)

When a promoteur already exists, new non-duplicate projects are still attached
to that existing profile id (no second account).

Outputs:
  supabase/seeds/seed_promoteurs_full.sql          (auth + profiles)
  supabase/seeds/promoteurs_full_chunks/*.sql      (projects, chunked)
  supabase/seeds/seed_promoteurs_full_passwords.csv
  scripts/_promoteurs_seed_dedup_report.json

Usage:
  python scripts/_export_existing_for_promoteurs.py
  python scripts/generate_promoteurs_full_seed.py
  supabase db query --linked -f supabase/seeds/seed_promoteurs_full.sql
  # then each chunk under promoteurs_full_chunks/
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
import unicodedata
import uuid
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "sifarah data"
PROMS_CSV = DATA / "promoteurs_immobiliers.csv"
PROJ_CSV = DATA / "projets_immobiliers.csv"
PROS_CSV = DATA / "projets_pros.csv"

EXISTING_PROFILES = ROOT / "scripts" / "_existing_profiles_all.json"
EXISTING_PROJECTS = ROOT / "scripts" / "_existing_projects.json"
EXISTING_PROMOTEURS = ROOT / "scripts" / "_existing_promoteurs.json"

OUT_USERS = ROOT / "supabase" / "seeds" / "seed_promoteurs_full.sql"
OUT_CHUNKS = ROOT / "supabase" / "seeds" / "promoteurs_full_chunks"
OUT_PASS = ROOT / "supabase" / "seeds" / "seed_promoteurs_full_passwords.csv"
OUT_REPORT = ROOT / "scripts" / "_promoteurs_seed_dedup_report.json"

SEED_BATCH = "promoteurs_full_sifarah"
PASSWORD_PREFIX = "Sifarah"
PASSWORD_SUFFIX = "2026!"
PROFESSION = "Promotion immobilière"
INTERNAL_CATEGORY_CODE = "1.2.1"
NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
PROJECTS_PER_CHUNK = 40
MAX_BIO = 251

AGGREGATOR_DOMAINS = {
    "chridari.ma",
    "www.chridari.ma",
    "tachrone.ma",
    "www.tachrone.ma",
    "facebook.com",
    "www.facebook.com",
    "instagram.com",
    "www.instagram.com",
    "linkedin.com",
    "www.linkedin.com",
    "youtube.com",
    "www.youtube.com",
    "wa.me",
    "api.whatsapp.com",
}

STATUS_PROGRESS = {
    "livre": 100,
    "termine": 100,
    "pret_a_livrer": 90,
    "en_construction": 55,
    "en_commercialisation": 40,
    "sur_plan": 15,
    "non_determine": 0,
}

OPENINGS = [
    "Promoteur immobilier ancré à {city}, {name} développe des programmes résidentiels et mixtes au Maroc.",
    "Depuis {city}, {name} conçoit et commercialise des projets immobiliers pensés pour le marché local.",
    "{name} accompagne acquéreurs et investisseurs avec une offre structurée autour de {city} et au-delà.",
    "Acteur de la promotion immobilière à {city}, {name} mise sur la qualité de livraison et la transparence.",
    "Basé à {city}, {name} porte des opérations immobilières du montage à la commercialisation.",
]

MIDDLES = [
    "Chaque programme est suivi de près : implantation, typologies, planning et relation clients.",
    "L'équipe privilégie des livrables clairs, des délais réalistes et un interlocuteur unique.",
    "Les projets allient confort d'usage, normes locales et proximité des services du quotidien.",
    "De la réservation à la livraison, le parcours client reste structuré et traçable.",
]

CLOSINGS = [
    "Retrouvez {name} sur Sifarah pour découvrir les programmes en cours et entrer en contact.",
    "Contactez {name} via Sifarah pour une visite, une brochure ou un devis personnalisé.",
    "Échangez avec {name} sur Sifarah autour de votre projet d'acquisition ou d'investissement.",
]


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    text = str(value).replace("\r\n", "\n").replace("\r", "\n")
    text = (
        text.replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u00b4", "'")
        .replace("`", "'")
    )
    text = text.replace("\n", " ").replace("\t", " ")
    return "'" + text.replace("'", "''") + "'"


def sql_num(value) -> str:
    if value is None or str(value).strip() == "":
        return "NULL"
    try:
        return str(float(str(value).replace(" ", "").replace(",", ".")))
    except (TypeError, ValueError):
        return "NULL"


def sql_json(value) -> str:
    payload = json.dumps(value, ensure_ascii=False)
    payload = payload.replace("\r\n", "\n").replace("\r", "\n").replace("\n", " ").replace("\t", " ")
    tag = "j"
    while f"${tag}$" in payload:
        tag += "x"
    return f"${tag}${payload}${tag}$::jsonb"


def sql_bool(value: bool) -> str:
    return "true" if value else "false"


def fold(value: str | None) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def slugify(value: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return (text or fallback)[:40].strip("-")


def pick(seed: str, options: list[str]) -> str:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return options[int(digest[:8], 16) % len(options)]


def host_of(url: str | None) -> str:
    if not url:
        return ""
    raw = str(url).strip()
    if not raw.startswith("http"):
        raw = "https://" + raw
    try:
        host = (urlparse(raw).hostname or "").lower().removeprefix("www.")
    except Exception:
        return ""
    if not host or host in AGGREGATOR_DOMAINS or "." not in host:
        return ""
    return host


def is_valid_email(email: str | None) -> bool:
    email = (email or "").strip().lower()
    if "@" not in email or " " in email:
        return False
    local, _, domain = email.partition("@")
    if not local or not domain or "." not in domain:
        return False
    if domain in AGGREGATOR_DOMAINS or domain.endswith(".local"):
        return False
    return True


def login_email(username: str, site: str, csv_email: str) -> str:
    if is_valid_email(csv_email):
        return csv_email.strip().lower()
    host = host_of(site)
    if host:
        return f"contact@{host}"
    return f"{username}@sifarah.local"


def clean_text(value: str | None, limit: int = 4000) -> str:
    text = (value or "").strip()
    if not text:
        return ""
    junk = (
        "Veuillez saisir",
        "dangerouslySetInnerHTML",
        "$undefined",
        "self.__next_f",
    )
    if any(j in text for j in junk):
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def parse_images(raw: str | None, cover: str | None, limit: int = 12) -> list[str]:
    urls: list[str] = []
    cover_u = (cover or "").strip()
    if cover_u.startswith("http"):
        urls.append(cover_u)
    if raw and raw.strip():
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            data = []
        if isinstance(data, list):
            for item in data:
                if isinstance(item, str):
                    u = item.strip()
                elif isinstance(item, dict):
                    u = str(item.get("url") or item.get("src") or "").strip()
                else:
                    continue
                if u.startswith("http") and u not in urls:
                    urls.append(u)
                if len(urls) >= limit:
                    break
    return urls[:limit]


def pipe_parts(value: str | None) -> list[str]:
    if not value:
        return []
    return [p.strip() for p in str(value).split("|") if p.strip()]


def make_bio(name: str, city: str, n_projects: int, seed: str) -> str:
    city_label = city or "Maroc"
    templates = [
        f"{name} — promoteur immobilier à {city_label}.",
        f"Promotion immobilière à {city_label} — {name}.",
        f"{name}, programmes immobiliers basés à {city_label}.",
    ]
    if n_projects:
        templates.append(
            f"{name} — {n_projects} projet(s) référencé(s) sur Sifarah ({city_label})."
        )
    return pick(seed + ":bio", templates)[:MAX_BIO]


def make_about(
    name: str,
    city: str,
    seed: str,
    description: str,
    specialties: str,
    n_projects: int,
) -> str:
    city_label = city.strip() or "Maroc"
    opening = pick(seed + ":o", OPENINGS).format(name=name, city=city_label)
    middle = pick(seed + ":m", MIDDLES)
    closing = pick(seed + ":c", CLOSINGS).format(name=name)
    desc = clean_text(description, 700)
    specs = [s for s in pipe_parts(specialties)[:6]]
    bullets = specs or [
        "Montage et commercialisation de programmes",
        "Suivi de chantier et relation clients",
        "Typologies adaptées au marché local",
    ]
    items = "".join(f"<li>{b}</li>" for b in bullets)
    desc_block = f"<p>{desc}</p>" if desc else ""
    count_line = (
        f"<p><strong>{n_projects}</strong> projet(s) immobilier(s) référencé(s) sur Sifarah.</p>"
        if n_projects
        else ""
    )
    return (
        f"<h2>{name}</h2>"
        f"<p>{opening}</p>"
        f"{desc_block}"
        f"{count_line}"
        f"<h3>Axes d'intervention</h3>"
        f"<ul>{items}</ul>"
        f"<p>{middle}</p>"
        f"<p>{closing}</p>"
    )


def load_json_list(path: Path) -> list[dict]:
    if not path.exists():
        raise SystemExit(f"Missing {path} — run scripts/_export_existing_for_promoteurs.py first")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit(f"Expected list in {path}")
    return data


def build_existing_maps(profiles: list[dict]):
    by_id: dict[str, dict] = {}
    by_email: dict[str, str] = {}
    by_user: dict[str, str] = {}
    by_name: dict[str, str] = {}
    by_host: dict[str, str] = {}
    taken_usernames: set[str] = set()
    taken_emails: set[str] = set()
    taken_ids: set[str] = set()
    for row in profiles:
        pid = (row.get("id") or "").strip()
        if not pid:
            continue
        by_id[pid] = row
        taken_ids.add(pid)
        email = (row.get("email") or "").strip().lower()
        user = (row.get("username") or "").strip().lower()
        name = fold(row.get("full_name") or row.get("lower_full_name") or "")
        host = host_of(row.get("website_url") or "")
        if email:
            by_email[email] = pid
            taken_emails.add(email)
        if user:
            by_user[user] = pid
            taken_usernames.add(user)
        if name and name not in by_name:
            by_name[name] = pid
        if host and host not in by_host:
            by_host[host] = pid
    return by_id, by_email, by_user, by_name, by_host, taken_ids, taken_usernames, taken_emails


def build_project_dup_keys(projects: list[dict]) -> tuple[set[str], set[tuple[str, str]]]:
    ids: set[str] = set()
    title_city: set[tuple[str, str]] = set()
    for row in projects:
        pid = (row.get("id") or "").strip().lower()
        if pid:
            ids.add(pid)
        attrs = row.get("attributes") or {}
        if isinstance(attrs, str):
            try:
                attrs = json.loads(attrs)
            except json.JSONDecodeError:
                attrs = {}
        if isinstance(attrs, dict):
            for key in ("source_project_id", "projet_id", "chridari_ref", "projet_id_legacy"):
                val = attrs.get(key)
                if val:
                    ids.add(str(val).strip().lower())
        for key in ("promoter_id",):
            pass
        title_city.add((fold(row.get("title") or ""), fold(row.get("city") or "")))
    return ids, title_city


def resolve_promoteur(
    row: dict,
    by_id: dict[str, dict],
    by_email: dict[str, str],
    by_user: dict[str, str],
    by_name: dict[str, str],
    by_host: dict[str, str],
) -> tuple[str | None, str]:
    """Reuse only on strong identity keys.

    Website-host matching is intentionally omitted: regional brands (AlOmrane *)
    and unrelated firms often share a parent domain and must stay separate accounts.
    """
    del by_host  # kept in signature for call-site compatibility
    pid = (row.get("promoteur_id") or "").strip()
    if pid and pid in by_id:
        return pid, "id"
    email = (row.get("email") or "").strip().lower()
    if is_valid_email(email) and email in by_email:
        return by_email[email], "email"
    nom = (row.get("nom") or "").strip()
    base = slugify(nom, f"promoteur-{(pid or 'x')[:8]}")
    if base in by_user:
        return by_user[base], "username"
    name_keys = [fold(nom)]
    name_keys.extend(fold(v) for v in pipe_parts(row.get("variantes_noms")))
    name_keys.append(fold(row.get("nom_legal") or ""))
    for key in name_keys:
        if key and key in by_name:
            return by_name[key], "name"
    return None, ""


def main() -> None:
    if not PROMS_CSV.exists() or not PROJ_CSV.exists():
        raise SystemExit("Missing sifarah CSV files")

    profiles = load_json_list(EXISTING_PROFILES)
    projects_existing = load_json_list(EXISTING_PROJECTS)
    (
        by_id,
        by_email,
        by_user,
        by_name,
        by_host,
        taken_ids,
        taken_usernames,
        taken_emails,
    ) = build_existing_maps(profiles)
    existing_project_ids, existing_title_city = build_project_dup_keys(projects_existing)

    with PROMS_CSV.open(encoding="utf-8-sig", newline="") as f:
        prom_rows = list(csv.DictReader(f))
    with PROJ_CSV.open(encoding="utf-8-sig", newline="") as f:
        proj_rows = list(csv.DictReader(f))

    team_by_project: dict[str, list[dict]] = defaultdict(list)
    if PROS_CSV.exists():
        with PROS_CSV.open(encoding="utf-8-sig", newline="") as f:
            for link in csv.DictReader(f):
                projet_id = (link.get("projet_id") or "").strip()
                pro_id = (link.get("professionnel_id") or "").strip()
                pro_name = (link.get("professionnel_nom") or "").strip()
                if not projet_id or not pro_name:
                    continue
                # Only keep pros that already exist in DB (avoid dangling refs)
                member = {
                    "id": pro_id if pro_id in taken_ids else "",
                    "name": pro_name,
                    "role": "Partenaire / intervenant",
                    "logo": "",
                    "website": "",
                }
                team_by_project[projet_id].append(member)

    projects_by_prom: dict[str, list[dict]] = defaultdict(list)
    orphan_projects: list[dict] = []
    for row in proj_rows:
        pid = (row.get("promoteur_id") or "").strip()
        if pid:
            projects_by_prom[pid].append(row)
        else:
            orphan_projects.append(row)

    # Index promoteurs by fold(name) for orphan project attachment
    prom_by_name: dict[str, dict] = {}
    for row in prom_rows:
        for key in [fold(row.get("nom") or ""), fold(row.get("nom_legal") or "")]:
            if key and key not in prom_by_name:
                prom_by_name[key] = row
        for v in pipe_parts(row.get("variantes_noms")):
            k = fold(v)
            if k and k not in prom_by_name:
                prom_by_name[k] = row

    prepared: list[dict] = []
    reuse_map: dict[str, str] = {}  # csv promoteur_id → effective user id
    report = {
        "promoteurs_csv": len(prom_rows),
        "projects_csv": len(proj_rows),
        "promoteurs_reused": [],
        "promoteurs_new": [],
        "projects_skipped": [],
        "projects_new": 0,
        "projects_orphan_skipped": 0,
        "projects_orphan_attached": 0,
    }

    # Freeze DB email map for identity reuse — never merge on emails we invent
    # mid-batch (e.g. Anassi website → contact@groupejamai.com must not absorb
    # the real Groupe Jamai row that owns that mailbox).
    db_by_email = dict(by_email)

    # Reserve explicit CSV emails first so website-derived logins don't steal them.
    reserved_csv_emails: set[str] = set()
    for row in prom_rows:
        em = (row.get("email") or "").strip().lower()
        if is_valid_email(em):
            reserved_csv_emails.add(em)

    for row in prom_rows:
        csv_id = (row.get("promoteur_id") or "").strip()
        nom = (row.get("nom") or "").strip() or f"Promoteur {(csv_id or 'x')[:8]}"
        existing_id, reason = resolve_promoteur(
            row, by_id, db_by_email, by_user, by_name, by_host
        )

        base = slugify(nom, f"promoteur-{(csv_id or 'x')[:8]}")
        username = base
        n = 2
        while username.lower() in taken_usernames and (
            not existing_id or by_user.get(username.lower()) != existing_id
        ):
            # If reusing, keep existing username when possible
            if existing_id and existing_id in by_id:
                existing_user = (by_id[existing_id].get("username") or "").strip()
                if existing_user:
                    username = existing_user
                    break
            username = f"{base}-{n}"[:48]
            n += 1

        site = (row.get("site_web") or "").strip()
        if not site or host_of(site) == "":
            site = (row.get("profil_chridari_url") or "").strip()
        csv_email = (row.get("email") or "").strip()
        if is_valid_email(csv_email):
            email = csv_email.lower()
        else:
            host = host_of(site)
            derived = f"contact@{host}" if host else ""
            # Don't take an address another CSV row explicitly owns.
            if derived and derived not in reserved_csv_emails and derived not in taken_emails:
                email = derived
            else:
                email = f"{username}@sifarah.local"
        # Final uniqueness for NEW auth users
        if not existing_id:
            if email.lower() in taken_emails:
                email = f"{username}@sifarah.local"
            while email.lower() in taken_emails:
                email = f"{username}-{n}@sifarah.local"
                n += 1

        if existing_id:
            user_id = existing_id
            is_new = False
            report["promoteurs_reused"].append(
                {"csv_id": csv_id, "user_id": user_id, "name": nom, "via": reason}
            )
        else:
            # Prefer CSV UUID when free; else deterministic uuid5
            if csv_id and csv_id not in taken_ids:
                user_id = csv_id
            else:
                user_id = str(uuid.uuid5(NS, f"sifarah:promoteur:{csv_id or nom}"))
                if user_id in taken_ids:
                    user_id = str(uuid.uuid5(NS, f"sifarah:promoteur:alt:{csv_id or nom}"))
            is_new = True
            report["promoteurs_new"].append({"csv_id": csv_id, "user_id": user_id, "name": nom})
            taken_ids.add(user_id)
            taken_usernames.add(username.lower())
            taken_emails.add(email.lower())
            by_user[username.lower()] = user_id
            fname = fold(nom)
            if fname:
                by_name.setdefault(fname, user_id)

        if csv_id:
            reuse_map[csv_id] = user_id

        linked = projects_by_prom.get(csv_id, [])
        city = (row.get("ville_siege") or "").strip()
        if not city:
            cities = pipe_parts(row.get("villes_projets_chridari"))
            city = cities[0] if cities else ""
            if not city and linked:
                city = (linked[0].get("ville") or "").strip()

        prepared.append(
            {
                "csv_id": csv_id,
                "id": user_id,
                "is_new": is_new,
                "nom": nom,
                "username": username,
                "email": email,
                "site": site if host_of(site) or site.startswith("http") else "",
                "city": city,
                "phone": (row.get("telephone") or "").strip(),
                "logo": (row.get("logo_url") or "").strip(),
                "description": clean_text(row.get("description") or row.get("description_courte")),
                "specialties": row.get("activites_specialites") or "",
                "n_projects": len(linked),
                "password": f"{PASSWORD_PREFIX}-{username}-{PASSWORD_SUFFIX}",
                "address": (row.get("adresse") or "").strip(),
            }
        )

    # Attach orphan projects via promoteur_nom when possible
    for row in orphan_projects:
        key = fold(row.get("promoteur_nom") or "")
        match = prom_by_name.get(key) if key else None
        if match:
            csv_id = (match.get("promoteur_id") or "").strip()
            projects_by_prom[csv_id].append(row)
            report["projects_orphan_attached"] += 1
            # refresh n_projects on prepared
        else:
            report["projects_orphan_skipped"] += 1

    for p in prepared:
        p["n_projects"] = len(projects_by_prom.get(p["csv_id"], []))
        p["bio"] = make_bio(p["nom"], p["city"], p["n_projects"], p["id"])
        p["about"] = make_about(
            p["nom"],
            p["city"],
            p["id"],
            p["description"],
            p["specialties"],
            p["n_projects"],
        )

    # --- Build project inserts ---
    project_inserts: list[str] = []
    for p in prepared:
        for row in projects_by_prom.get(p["csv_id"], []):
            projet_id = (row.get("projet_id") or "").strip()
            title = (row.get("nom_projet") or row.get("titre_annonce") or "").strip() or "Projet"
            city = (row.get("ville") or "").strip()
            legacy = (row.get("chridari_ref") or row.get("projet_id_legacy") or "").strip()
            keys = {projet_id.lower()} if projet_id else set()
            if legacy:
                keys.add(legacy.lower())
            if keys & existing_project_ids:
                report["projects_skipped"].append(
                    {"projet_id": projet_id, "title": title, "reason": "id/source"}
                )
                continue
            if (fold(title), fold(city)) in existing_title_city:
                report["projects_skipped"].append(
                    {"projet_id": projet_id, "title": title, "reason": "title_city"}
                )
                continue

            # Choose id: prefer CSV UUID if free
            if projet_id and projet_id.lower() not in existing_project_ids:
                new_id = projet_id
            else:
                new_id = str(uuid.uuid5(NS, f"sifarah:projet:{projet_id or title}:{p['id']}"))
            existing_project_ids.add(new_id.lower())
            if projet_id:
                existing_project_ids.add(projet_id.lower())
            existing_title_city.add((fold(title), fold(city)))

            images = parse_images(row.get("images_galerie_json"), row.get("image_principale_url"))
            cover = images[0] if images else ""
            status = (row.get("statut_construction") or "").strip() or None
            commercial = (row.get("statut_commercial") or "").strip() or None
            progress = STATUS_PROGRESS.get((status or "").lower(), 0)
            price_on_request = str(row.get("prix_sur_demande") or "").lower() in (
                "true",
                "1",
                "yes",
            )
            desc = clean_text(row.get("description") or row.get("description_courte"), 5000)
            typologies = (row.get("typologies") or row.get("typologies_offres") or "").strip()
            equipment = (row.get("equipements") or "").replace("|", ", ").strip()
            nearby = (row.get("proximites") or "").replace("|", ", ").strip()
            surface_bits = []
            if row.get("superficie_min"):
                surface_bits.append(str(row.get("superficie_min")).strip())
            if row.get("superficie_max") and row.get("superficie_max") != row.get("superficie_min"):
                surface_bits.append(str(row.get("superficie_max")).strip())
            surface = " – ".join(surface_bits)
            if surface and row.get("unite_superficie"):
                surface = f"{surface} {row.get('unite_superficie')}"

            attrs = {
                "source_project_id": projet_id,
                "chridari_ref": legacy or None,
                "projet_id_legacy": (row.get("projet_id_legacy") or None),
                "reference_annonce": (row.get("reference_annonce") or None),
                "architecte": clean_text(row.get("architecte"), 500) or None,
                "bureau_etudes": clean_text(row.get("bureau_etudes"), 500) or None,
                "entreprises_construction": clean_text(row.get("entreprises_construction"), 800)
                or None,
                "sous_traitants": clean_text(row.get("sous_traitants"), 500) or None,
                "equipe_realisation_mentions": clean_text(row.get("equipe_realisation_mentions"), 800)
                or None,
                "url_source": (row.get("url_source") or row.get("url_canonique") or None),
                "chambres_min": row.get("chambres_min") or None,
                "chambres_max": row.get("chambres_max") or None,
                "seed_batch": SEED_BATCH,
            }
            attrs = {k: v for k, v in attrs.items() if v not in (None, "")}

            team = team_by_project.get(projet_id, [])[:40]
            # Deduplicate team by fold(name)
            seen_t: set[str] = set()
            team_clean = []
            for m in team:
                k = fold(m.get("name") or "")
                if not k or k in seen_t:
                    continue
                seen_t.add(k)
                team_clean.append(m)

            lat = sql_num(row.get("latitude"))
            lng = sql_num(row.get("longitude"))

            cols = [
                "id",
                "user_id",
                "title",
                "description",
                "city",
                "neighborhood",
                "address",
                "postal_code",
                "country",
                "latitude",
                "longitude",
                "category",
                "subtype",
                "project_type",
                "status",
                "commercial_status",
                "progress",
                "expected_end",
                "actual_end",
                "cover_image",
                "images",
                "typologies",
                "equipment",
                "nearby",
                "price_on_request",
                "price_from",
                "price_min",
                "price_max",
                "currency",
                "surface",
                "promoter_id",
                "promoter_name",
                "promoter_website",
                "team",
                "attributes",
            ]
            vals = [
                f"{sql_str(new_id)}::uuid",
                f"{sql_str(p['id'])}::uuid",
                sql_str(title[:200]),
                sql_str(desc) if desc else "NULL",
                sql_str(city) if city else "NULL",
                sql_str((row.get("quartier") or "").strip() or None),
                sql_str((row.get("adresse") or "").strip() or None),
                sql_str((row.get("code_postal") or "").strip() or None),
                sql_str((row.get("pays") or "MA").strip() or "MA"),
                lat,
                lng,
                sql_str("immobilier"),
                sql_str((row.get("type_projet") or "").strip() or None),
                sql_str((row.get("type_projet") or "").strip() or None),
                sql_str(status),
                sql_str(commercial),
                str(progress),
                sql_str((row.get("date_livraison_prevue") or "").strip() or None),
                sql_str((row.get("date_livraison_effective") or "").strip() or None),
                sql_str(cover) if cover else "NULL",
                sql_json(images),
                sql_str(typologies) if typologies else "NULL",
                sql_str(equipment) if equipment else "NULL",
                sql_str(nearby) if nearby else "NULL",
                sql_bool(price_on_request),
                sql_num(row.get("prix_affiche_a_partir_de") or row.get("prix_min")),
                sql_num(row.get("prix_min")),
                sql_num(row.get("prix_max")),
                sql_str((row.get("devise") or "MAD").strip() or "MAD"),
                sql_str(surface) if surface else "NULL",
                sql_str(p["id"]),
                sql_str(p["nom"]),
                sql_str(p["site"]) if p["site"] else "NULL",
                sql_json(team_clean),
                sql_json(attrs),
            ]
            project_inserts.append(
                "INSERT INTO public.projects ("
                + ", ".join(cols)
                + ") SELECT "
                + ", ".join(vals)
                + " WHERE NOT EXISTS ("
                "SELECT 1 FROM public.projects x WHERE x.id = "
                + f"{sql_str(new_id)}::uuid"
                + " OR x.attributes->>'source_project_id' = "
                + sql_str(projet_id)
                + ");"
            )
            report["projects_new"] += 1

    # --- Write users SQL ---
    lines: list[str] = []
    lines.append("-- AUTO-GENERATED by scripts/generate_promoteurs_full_seed.py")
    lines.append(f"-- Seed batch: {SEED_BATCH}")
    lines.append(
        f"-- New promoteurs: {sum(1 for p in prepared if p['is_new'])} | "
        f"Reused: {sum(1 for p in prepared if not p['is_new'])} | "
        f"New projects: {report['projects_new']} | Skipped projects: {len(report['projects_skipped'])}"
    )
    lines.append(f"-- Passwords: {OUT_PASS.name}")
    lines.append("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    lines.append("BEGIN;")
    lines.append("")

    new_users = [p for p in prepared if p["is_new"]]
    lines.append(f"-- auth.users for {len(new_users)} new promoteurs")
    for p in new_users:
        meta = {
            "seed_batch": SEED_BATCH,
            "username": p["username"],
            "full_name": p["nom"],
            "profession": PROFESSION,
            "location": p["city"],
            "bio": p["bio"],
            "profile_type": "enterprise",
            "internal_category_code": INTERNAL_CATEGORY_CODE,
            "source_promoteur_id": p["csv_id"],
        }
        app_meta = sql_str(json.dumps({"provider": "email", "providers": ["email"]}))
        lines.append(
            "INSERT INTO auth.users ("
            "instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, "
            "raw_app_meta_data, raw_user_meta_data, created_at, updated_at, "
            "confirmation_token, recovery_token, email_change_token_new, email_change"
            ") VALUES ("
            f"'00000000-0000-0000-0000-000000000000', {sql_str(p['id'])}::uuid, "
            f"'authenticated', 'authenticated', {sql_str(p['email'])}, "
            f"crypt({sql_str(p['password'])}, gen_salt('bf')), NOW(), "
            f"{app_meta}::jsonb, {sql_str(json.dumps(meta, ensure_ascii=False))}::jsonb, "
            "NOW(), NOW(), '', '', '', ''"
            ") ON CONFLICT (id) DO NOTHING;"
        )
        lines.append(
            "INSERT INTO auth.identities ("
            "id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at"
            ") VALUES ("
            f"{sql_str(p['id'])}::uuid, {sql_str(p['id'])}::uuid, "
            f"jsonb_build_object('sub', {sql_str(p['id'])}, 'email', {sql_str(p['email'])}, "
            "'email_verified', true, 'phone_verified', false), "
            f"'email', {sql_str(p['id'])}, NOW(), NOW(), NOW()"
            ") ON CONFLICT DO NOTHING;"
        )

    lines.append("")
    lines.append("-- Enrich profiles (new + reused)")
    for p in prepared:
        phone_sql = sql_str(p["phone"]) if p["phone"] else "NULL"
        site_sql = sql_str(p["site"]) if p["site"] else "NULL"
        logo_sql = sql_str(p["logo"]) if p["logo"] and p["logo"].startswith("http") else "NULL"
        lines.append(
            "UPDATE public.profiles SET "
            f"username = COALESCE(NULLIF(username, ''), {sql_str(p['username'])}), "
            f"full_name = COALESCE(NULLIF(full_name, ''), {sql_str(p['nom'])}), "
            f"profession = COALESCE(NULLIF(profession, ''), {sql_str(PROFESSION)}), "
            f"location = COALESCE(NULLIF(location, ''), {sql_str(p['city']) if p['city'] else 'NULL'}), "
            f"bio = COALESCE(NULLIF(bio, ''), {sql_str(p['bio'])}), "
            f"about_text = COALESCE(NULLIF(about_text, ''), {sql_str(p['about'])}), "
            f"email = COALESCE(NULLIF(email, ''), {sql_str(p['email'])}), "
            f"phone = COALESCE(NULLIF(phone, ''), {phone_sql}), "
            f"website_url = COALESCE(NULLIF(website_url, ''), {site_sql}), "
            f"avatar_url = CASE "
            f"WHEN {logo_sql} IS NOT NULL AND ("
            "avatar_url IS NULL OR btrim(avatar_url) = '' "
            "OR avatar_url LIKE '%default-pro.jpg%' OR avatar_url LIKE '%default-pro-avatar%'"
            f") THEN {logo_sql} ELSE avatar_url END, "
            "profile_type = COALESCE(NULLIF(profile_type, ''), 'enterprise'), "
            "internal_category_id = COALESCE("
            "internal_category_id, "
            f"(SELECT id FROM public.internal_categories WHERE code = {sql_str(INTERNAL_CATEGORY_CODE)} LIMIT 1)"
            ") "
            f"WHERE id = {sql_str(p['id'])}::uuid;"
        )

    lines.append("")
    lines.append(
        "-- Découvrir filters promoteurs via profile_internal_categories (!inner), "
        "not profiles.internal_category_id alone."
    )
    for p in prepared:
        lines.append(
            "INSERT INTO public.profile_internal_categories "
            "(profile_id, internal_category_id, is_primary) "
            "SELECT "
            f"{sql_str(p['id'])}::uuid, ic.id, "
            "NOT EXISTS ("
            "SELECT 1 FROM public.profile_internal_categories x "
            f"WHERE x.profile_id = {sql_str(p['id'])}::uuid AND x.is_primary"
            ") "
            "FROM public.internal_categories ic "
            f"WHERE ic.code = {sql_str(INTERNAL_CATEGORY_CODE)} "
            "ON CONFLICT (profile_id, internal_category_id) DO NOTHING;"
        )

    lines.append("")
    lines.append("COMMIT;")
    OUT_USERS.parent.mkdir(parents=True, exist_ok=True)
    OUT_USERS.write_text("\n".join(lines) + "\n", encoding="utf-8")

    with OUT_PASS.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle, fieldnames=["id", "email", "username", "full_name", "password", "is_new"]
        )
        writer.writeheader()
        for p in prepared:
            writer.writerow(
                {
                    "id": p["id"],
                    "email": p["email"],
                    "username": p["username"],
                    "full_name": p["nom"],
                    "password": p["password"] if p["is_new"] else "(existing account)",
                    "is_new": "yes" if p["is_new"] else "no",
                }
            )

    # --- Project chunks ---
    OUT_CHUNKS.mkdir(parents=True, exist_ok=True)
    for old in OUT_CHUNKS.glob("*.sql"):
        old.unlink()
    for i in range(0, len(project_inserts), PROJECTS_PER_CHUNK):
        chunk = project_inserts[i : i + PROJECTS_PER_CHUNK]
        n = i // PROJECTS_PER_CHUNK + 1
        path = OUT_CHUNKS / f"seed_promoteurs_projects_{n:03d}.sql"
        body = [
            f"-- Projects chunk {n} ({len(chunk)} inserts) batch {SEED_BATCH}",
            "BEGIN;",
            *chunk,
            "COMMIT;",
            "",
        ]
        path.write_text("\n".join(body), encoding="utf-8")

    report["promoteurs_reused_count"] = len(report["promoteurs_reused"])
    report["promoteurs_new_count"] = len(report["promoteurs_new"])
    report["projects_skipped_count"] = len(report["projects_skipped"])
    # Keep skipped list compact in report file (titles only sample)
    if len(report["projects_skipped"]) > 80:
        report["projects_skipped_sample"] = report["projects_skipped"][:80]
        report["projects_skipped"] = []
    OUT_REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {OUT_USERS}")
    print(f"Wrote {OUT_PASS}")
    print(f"Wrote {OUT_CHUNKS} ({(len(project_inserts) + PROJECTS_PER_CHUNK - 1) // PROJECTS_PER_CHUNK} chunks)")
    print(f"Wrote {OUT_REPORT}")
    print(
        f"Promoteurs new={report['promoteurs_new_count']} reused={report['promoteurs_reused_count']} | "
        f"Projects new={report['projects_new']} skipped={report['projects_skipped_count']} | "
        f"Orphans attached={report['projects_orphan_attached']} skipped={report['projects_orphan_skipped']}"
    )


if __name__ == "__main__":
    main()
