#!/usr/bin/env python3
"""Generate unique French bio + about_html for seed profiles (lc-*), then SQL for apply_ai_about.

Usage:
  python scripts/generate_seed_about.py           # write _about_out_seed.json + _apply_ai_about.sql
  python scripts/generate_seed_about.py --apply    # also push SQL via supabase db query --linked

Reads live rows from stdin JSON array OR from scripts/_about_seed_input.json
(export via supabase first — see export SQL at bottom of this file).
"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INP = ROOT / "_about_seed_input.json"
OUT = ROOT / "_about_out_seed.json"
MAX_BIO = 251

OPENINGS = [
    "Installé à {city}, {name} accompagne les chantiers avec une approche concrète et un suivi de près.",
    "À {city}, {name} met son savoir-faire au service des maîtres d'ouvrage et des entreprises générales.",
    "{name} intervient depuis {city} sur des projets résidentiels, tertiaires et techniques.",
    "Ancré à {city}, {name} privilégie la qualité d'exécution et la clarté des engagements.",
    "Depuis {city}, {name} propose des prestations structurées pour sécuriser vos travaux.",
]

MIDDLES = [
    "L'équipe adapte ses méthodes au contexte du site, aux délais et aux contraintes réglementaires locales.",
    "Chaque mission commence par un diagnostic clair, puis un plan d'intervention réaliste et traçable.",
    "Le suivi terrain, la coordination des corps d'état et le respect des normes restent au cœur du métier.",
    "Clients particuliers et professionnels y trouvent un interlocuteur unique, réactif et transparent.",
    "Les livrables sont conçus pour être exploitables par les bureaux d'études et les entreprises de pose.",
]

CLOSINGS = [
    "Contactez {name} sur Sifarah pour présenter votre projet et obtenir une réponse adaptée.",
    "Retrouvez {name} sur Sifarah pour échanger sur votre besoin et planifier la suite.",
    "Écrivez à {name} via Sifarah : devis, questions techniques ou prise de rendez-vous.",
]

BULLETS = {
    "default": [
        "Étude du besoin et cadrage du chantier",
        "Exécution soignée et contrôle qualité",
        "Coordination et suivi jusqu'à la réception",
    ],
    "architect": [
        "Conception et plans d'exécution",
        "Suivi de chantier et coordination",
        "Conformité réglementaire et esthétique",
    ],
    "btp": [
        "Gros œuvre et travaux structurels",
        "Organisation de chantier",
        "Respect des délais et de la sécurité",
    ],
    "artisan": [
        "Pose et finitions professionnelles",
        "Matériaux adaptés au climat marocain",
        "SAV et conseils d'entretien",
    ],
    "fourn": [
        "Approvisionnement matériaux BTP",
        "Conseils techniques et alternatives",
        "Livraison et suivi de commande",
    ],
    "topo": [
        "Relevés et plans topographiques",
        "Dossiers fonciers et bornage",
        "Suivi géométrique de chantier",
    ],
}


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def pick(seed: str, options: list[str]) -> str:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return options[int(digest[:8], 16) % len(options)]


def bullet_key(profession: str, name: str) -> str:
    blob = f"{profession} {name}".lower()
    if any(w in blob for w in ("architect", "architecte")):
        return "architect"
    if any(w in blob for w in ("topograph", "géomètre", "geometre", "foncier")):
        return "topo"
    if any(w in blob for w in ("fournisseur", "matériau", "materiau", "négoce", "negoce")):
        return "fourn"
    if any(w in blob for w in ("entreprise", "btp", "construction", "génie", "genie", "travaux")):
        return "btp"
    if any(w in blob for w in ("plomb", "électric", "electric", "peintre", "menuis", "carrel", "ferron", "alu")):
        return "artisan"
    return "default"


def make_bio(name: str, profession: str, city: str, seed: str) -> str:
    parts = [p for p in [profession.strip(), city.strip()] if p]
    if not parts:
        base = f"{name} — professionnel du BTP sur Sifarah."
    elif len(parts) == 1:
        base = f"{name} — {parts[0]}."
    else:
        templates = [
            f"{name} — {parts[0]} à {parts[1]}.",
            f"{parts[0]} à {parts[1]} — {name}.",
            f"{name}, {parts[0].lower()} basé à {parts[1]}.",
        ]
        base = pick(seed + ":bio", templates)
    return base[:MAX_BIO]


def make_about(name: str, profession: str, city: str, seed: str) -> str:
    city_label = city.strip() or "Maroc"
    opening = pick(seed + ":o", OPENINGS).format(name=name, city=city_label)
    middle = pick(seed + ":m", MIDDLES)
    closing = pick(seed + ":c", CLOSINGS).format(name=name)
    bullets = BULLETS[bullet_key(profession, name)]
    # rotate bullets by seed
    shift = int(hashlib.md5(seed.encode()).hexdigest()[:2], 16) % len(bullets)
    bullets = bullets[shift:] + bullets[:shift]
    pro_line = (
        f"<p>Spécialité : <strong>{profession}</strong>.</p>" if profession.strip() else ""
    )
    items = "".join(f"<li>{b}</li>" for b in bullets)
    return (
        f"<h2>{name}</h2>"
        f"<p>{opening}</p>"
        f"{pro_line}"
        f"<h3>Ce que nous apportons</h3>"
        f"<ul>{items}</ul>"
        f"<p>{middle}</p>"
        f"<p>{closing}</p>"
    )


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html or "")


def main() -> None:
    if not INP.exists():
        raise SystemExit(
            f"Missing {INP.name}. Export first:\n"
            "  supabase db query --linked -o json "
            "\"SELECT id, username, full_name, profession, location FROM profiles "
            "WHERE username LIKE 'lc-%'\" > scripts/_about_seed_input.json\n"
            "(then unwrap rows if needed)"
        )

    raw = json.loads(INP.read_text(encoding="utf-8"))
    # Accept either plain list or supabase agent envelope / {rows:[]}
    if isinstance(raw, dict):
        rows = raw.get("rows") or raw.get("data") or []
    else:
        rows = raw
    if not isinstance(rows, list) or not rows:
        raise SystemExit("input JSON has no profile rows")

    out_rows: list[dict] = []
    for row in rows:
        pid = str(row.get("id") or "").strip()
        if not pid:
            continue
        name = (row.get("full_name") or row.get("username") or "Professionnel").strip()
        profession = (row.get("profession") or "").strip()
        city = (row.get("location") or "").strip()
        username = (row.get("username") or "").strip()
        seed = f"{pid}:{username}"
        bio = make_bio(name, profession, city, seed)
        about = make_about(name, profession, city, seed)
        words = len(strip_tags(about).split())
        if words < 40:
            about += "<p>Intervention sur devis, avec un accompagnement clair de la demande jusqu'à la réalisation.</p>"
        out_rows.append(
            {
                "id": pid,
                "username": username,
                "bio": bio,
                "about_html": about,
            }
        )

    OUT.write_text(json.dumps(out_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {OUT} entries={len(out_rows)}")

    # Also write SQL compatible with apply_ai_about.py
    sql = ["-- Seed AI-style bio + about_html", "BEGIN;"]
    for row in out_rows:
        sql.append(
            "UPDATE public.profiles SET "
            f"bio = {sql_str(row['bio'])}, "
            f"about_text = {sql_str(row['about_html'])}, "
            "updated_at = NOW() "
            f"WHERE id = '{row['id']}'::uuid;"
        )
    sql.append("COMMIT;")
    sql_path = ROOT / "_apply_ai_about_seed.sql"
    sql_path.write_text("\n".join(sql) + "\n", encoding="utf-8")
    print(f"wrote {sql_path} updates={len(out_rows)}")

    if "--apply" in sys.argv:
        cmd = ["supabase", "db", "query", "--linked", "-f", str(sql_path)]
        print("running:", " ".join(cmd))
        proc = subprocess.run(cmd, cwd=str(ROOT.parent))
        sys.exit(proc.returncode)


if __name__ == "__main__":
    main()
