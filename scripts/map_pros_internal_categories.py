#!/usr/bin/env python3
"""Map lechantier/BTP trades → internal_categories codes (multi allowed).

Reads:
  - pros_filtered_btp_merged.csv
  - services_cards_new_vs_supabase.csv

Writes:
  - scripts/_trade_to_internal_categories.json
  - scripts/pros_filtered_btp_mapped.csv  (+ internal_category_codes, labels)
  - scripts/services_cards_mapped.csv     (+ internal_category_id codes filled)
"""

from __future__ import annotations

import csv
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROS_CSV = ROOT / "pros_filtered_btp_merged.csv"
SERVICES_CSV = ROOT / "services_cards_new_vs_supabase.csv"
OUT_DIR = ROOT / "scripts"

# Primary code first; extras are additional specialties (≤5 total when applied).
TRADE_TO_CODES: dict[str, list[str]] = {
    # Architecture / design
    "architect": ["5.1.1"],
    "architecte": ["5.1.1"],
    "agence d'architecture": ["5.1.1"],
    "interior architect": ["5.2.1"],
    "architecte d'intérieur": ["5.2.1"],
    "interior design": ["5.2.2", "5.2.3"],
    "designer d'intérieur": ["5.2.2", "5.2.3"],
    "agence de design": ["5.2.2", "5.2.3"],
    "entrepreneur spécialisé dans la décoration d'intérieur": ["5.2.3", "4.2.2"],
    # Engineering / BET
    "engineering firm": ["3.4.2", "3.4.3"],
    "bureau d'étude": ["3.4.2", "3.4.3"],
    "consultant en ingénierie": ["3.4.3", "3.4.2"],
    "ingénieur civil": ["3.4.1"],
    "ingénieur structures": ["3.4.1", "3.1.3"],
    "ingénieur": ["3.4.3"],
    "ingénieur géotechnique": ["3.4.1", "3.4.9"],
    "control office": ["3.4.4"],
    "laboratoire": ["3.4.4", "3.4.9"],
    "école d'ingénieurs": ["8.3.6"],
    # Survey / topo (Construction & BTP · Ingénierie & études)
    "surveyor": ["3.4.7", "3.4.8"],
    "géomètre": ["3.4.7", "3.4.8"],
    "arpenteur-géomètre": ["3.4.7", "3.4.8"],
    "topographe": ["3.4.8"],
    "bureau de topographie": ["3.4.8", "3.4.7"],
    "entreprise de topographie": ["3.4.8", "3.4.7"],
    # General contractors / structure
    "entreprise": ["3.1.5", "3.1.3"],
    "entreprise de construction": ["3.1.5", "3.1.3", "3.4.6"],
    "structural work": ["3.1.3", "3.1.5", "3.1.4"],
    "gros œuvre": ["3.1.5", "3.1.3", "3.1.4"],
    "travaux généraux": ["3.1.5", "3.4.6"],
    "entrepreneur": ["3.1.5", "3.4.6"],
    "société de travaux publics": ["3.4.1", "3.1.2"],
    "entreprise de génie civil": ["3.4.1", "3.1.2"],
    "entreprise de vrd": ["3.1.2", "3.4.1"],
    "earthworks": ["3.1.2"],
    "entreprise de terrassement": ["3.1.2"],
    "constructeur immobilier": ["1.2.1", "3.1.5"],
    "constructeur de maisons personnalisées": ["3.1.5", "5.1.2"],
    "modular building": ["3.1.5", "3.5.3"],
    "bâtiment modulaire": ["3.1.5", "3.5.3"],
    "siège social": ["3.1.5"],
    "prestataire": ["3.4.6"],
    "professionnel btp à classifier": ["3.4.6"],
    # Electricity
    "électricien": ["3.2.1"],
    "electricity": ["3.2.1"],
    "installation électrique": ["3.2.1"],
    "service d'installation électrique": ["3.2.1"],
    "electrical equipment": ["3.5.3", "8.5.3"],
    "matériel électrique": ["8.5.3", "3.5.3"],
    "fournisseur d'électricité": ["8.5.3", "3.2.1"],
    "magasin d'électronique": ["8.5.3"],
    # Plumbing / HVAC
    "plumbing": ["3.2.2"],
    "plombier": ["3.2.2"],
    "hvac": ["3.2.3", "3.2.5", "3.2.4"],
    "air conditioning": ["3.2.3"],
    "entrepreneur spécialisé dans les systèmes de cvc": ["3.2.3", "3.2.5", "3.2.4"],
    "fournisseur de systèmes de climatisation": ["8.5.3", "3.2.3"],
    "magasin de systèmes de climatisation": ["8.5.3", "3.2.3"],
    "service de réparation de systèmes de climatisation": ["3.2.3", "8.6.2"],
    # Isolation / waterproofing
    "pose d'isolation / étanchéité": ["3.2.7", "3.2.6"],
    "isolation": ["3.2.7"],
    "insulation": ["3.2.7"],
    "entrepreneur spécialisé dans l'isolation": ["3.2.7"],
    "étanchéité": ["3.2.6"],
    "waterproofing": ["3.2.6"],
    "entreprise d'étanchéité": ["3.2.6"],
    "service d'imperméabilisation": ["3.2.6"],
    "magasin de matériaux d'isolation": ["8.5.4", "3.2.7"],
    # Finishes
    "painting": ["3.3.2"],
    "peinture": ["3.3.2"],
    "pose de peinture": ["3.3.2"],
    "peintre en bâtiment": ["3.3.2"],
    "wall covering": ["3.3.1"],
    "wall covering installation": ["3.3.1"],
    "installation de revêtement mural": ["3.3.1"],
    "revêtement mural": ["3.3.1"],
    "tiling": ["3.3.1"],
    "pose de carrelage": ["3.3.1"],
    "tile installation": ["3.3.1"],
    "magasin de carrelage": ["8.5.4", "3.3.1"],
    "flooring": ["3.3.1"],
    "floor covering installation": ["3.3.1"],
    "installation de revêtement de sol": ["3.3.1"],
    "entrepreneur spécialisé dans les revêtements de sol": ["3.3.1"],
    "plastering": ["3.2.7", "3.3.1"],
    "false ceiling": ["3.2.7", "4.2.1"],
    "pose de faux plafond": ["3.2.7", "4.2.1"],
    "façadier": ["3.3.3", "4.1.4"],
    # Menuiserie / metal / alu / glass
    "menuiserie": ["3.3.4"],
    "menuisier": ["3.3.4"],
    "pose de menuiserie": ["3.3.4"],
    "atelier de menuiserie": ["3.3.4"],
    "aluminium": ["3.3.4", "3.3.3"],
    "fournisseur d'aluminium": ["8.5.4", "3.3.4"],
    "fenêtre en aluminium": ["3.3.4"],
    "pose de fenêtres": ["3.3.4"],
    "magasin de fenêtres en pvc": ["8.5.4", "3.3.4"],
    "metal frame": ["3.3.5", "3.1.3"],
    "entreprise de construction métallique": ["3.3.5", "3.1.3"],
    "installation de charpente métallique": ["3.1.6", "3.3.5"],
    "ferronnerie / métallurgie": ["3.3.5", "3.3.6"],
    "shop shutters": ["3.3.6", "3.3.5"],
    "glazing": ["3.3.3", "3.3.4"],
    "vitrerie - miroiterie": ["3.3.3", "3.3.4"],
    # Elevators / fire / security / automation
    "elevators": ["3.2.9"],
    "service de protection contre les incendies": ["3.2.8"],
    "incendie": ["3.2.8"],
    "fournisseur de systèmes de protection contre les incendies": ["8.5.3", "3.2.8"],
    "consultant en protection contre les incendies": ["3.2.8", "3.4.3"],
    "home automation": ["7.5.2", "3.2.1"],
    "installation domotique": ["7.5.2", "3.2.1"],
    "automatisme": ["7.5.2", "3.5.3"],
    "video surveillance": ["7.5.5", "8.6.3"],
    "fournisseur de systèmes de sécurité": ["8.6.3", "8.5.3"],
    "système audio": ["7.5.2", "8.5.3"],
    # Kitchen / bath / furniture / lighting
    "kitchen": ["4.2.3"],
    "cuisine": ["4.2.3"],
    "pose de cuisine": ["4.2.3"],
    "salle de bain / sanitaire": ["4.2.4"],
    "furniture": ["4.2.5", "8.5.2"],
    "magasin d'ameublement et de décoration": ["8.5.2", "4.2.2"],
    "lighting": ["4.2.7"],
    # Outdoor / pool / landscape
    "swimming pool": ["4.3.4"],
    "piscine": ["4.3.4"],
    "société de construction de piscine": ["4.3.4"],
    "outdoor landscaping": ["4.3.2", "4.3.5"],
    "paysagiste": ["4.3.2", "5.3.3"],
    "landscaper": ["4.3.2", "5.3.3"],
    "aménagement extérieur": ["4.3.5"],
    "aménagement de terrasse / véranda": ["4.3.3", "4.3.5"],
    # Materials / suppliers / rental
    "construction materials": ["8.5.4", "3.5.1"],
    "matériaux de construction": ["8.5.4", "3.5.1"],
    "magasin de materiaux de construction": ["8.5.4", "3.5.1"],
    "grossiste en matériaux de construction": ["8.5.4", "3.5.1"],
    "fournisseur de matériaux de construction": ["8.5.4", "3.5.1"],
    "natural stone": ["8.5.4", "3.5.1"],
    "pierre naturelle": ["8.5.4", "3.5.1"],
    "hardware": ["8.5.1", "8.5.4"],
    "epi": ["8.5.1", "3.5.2"],
    "site equipment": ["3.5.2", "8.5.3"],
    "equipment rental": ["3.5.2", "8.5.3"],
    "location d'engins de chantier": ["3.5.2"],
    "fabricant": ["8.5.5", "3.5.4"],
    "fournisseur d'équipements industriels": ["8.5.3", "3.5.3"],
    "entreprise de packaging": ["8.5.5"],
    # Cleaning / maintenance / transport
    "site cleaning": ["8.6.1"],
    "service de nettoyage et d'entretien": ["8.6.1", "8.6.2"],
    "service d'assainissement": ["8.6.1", "3.2.2"],
    "transport": ["8.6.5"],
    "service de restauration de bâtiments": ["4.1.5", "4.1.6"],
    "entrepreneur spécialisé dans l'asphalte": ["3.1.2", "3.4.1"],
    # Real estate / photo / marketing / other
    "expert immobilier": ["1.4.2", "1.4.3"],
    "vidéo et photo immobilière": ["8.4.3", "8.4.4"],
    "real estate photography": ["8.4.3"],
    "infographie 3d / maquette": ["5.4.4", "7.2.6"],
    "service de marketing internet": ["8.4.1", "8.4.2"],
    "agence de publicité": ["8.4.2"],
    "agence de branding": ["8.4.2"],
    "société de vente aux enchères": ["1.1.4"],
    "assistance et services informatiques": ["7.1.5"],
    # Labels often embedded in raw_profile_text when trade column is empty
    "architecte d'intérieur": ["5.2.1"],
    "bureau d'études": ["3.4.2", "3.4.3"],
    "bureau d'etudes": ["3.4.2", "3.4.3"],
    "infographie 3d / maquette": ["5.4.4", "7.2.6"],
    "3d rendering / modeling": ["5.4.4", "7.2.6"],
    "matériel électrique": ["8.5.3", "3.5.3"],
    "materiel electrique": ["8.5.3", "3.5.3"],
    "climatisation": ["3.2.3"],
    "topographe": ["3.4.8", "3.4.7"],
    "laboratoire (essais sols/matériaux)": ["3.4.4", "3.4.9"],
    "laboratoire (essais sols/materiaux)": ["3.4.4", "3.4.9"],
    "pose revêtement mur": ["3.3.1"],
    "pose revetement mur": ["3.3.1"],
    "pose revêtement sol": ["3.3.1"],
    "pose revetement sol": ["3.3.1"],
    "revêtement mur": ["3.3.1", "8.5.4"],
    "revetement mur": ["3.3.1", "8.5.4"],
    "aluminium / menuiserie alu": ["3.3.4", "3.3.3"],
    "terrasse / véranda": ["4.3.3", "4.3.5"],
    "terrasse / veranda": ["4.3.3", "4.3.5"],
    "terrace / veranda": ["4.3.3", "4.3.5"],
    "salle de bain / sanitaire": ["4.2.4"],
    "bathroom / sanitary": ["4.2.4"],
    "carpentry / woodwork": ["3.3.4"],
    "fenêtres / portes / volets": ["3.3.4", "3.3.6"],
    "fenetres / portes / volets": ["3.3.4", "3.3.6"],
    "gros œuvre / construction": ["3.1.5", "3.1.3"],
    "gros oeuvre / construction": ["3.1.5", "3.1.3"],
    "nettoyage chantier": ["8.6.1"],
    "location engins": ["3.5.2"],
    "professionnel btp": ["3.4.6"],
}


def fold(value: str) -> str:
    text = unicodedata.normalize("NFKD", (value or "").strip().lower())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.replace("œ", "oe").replace("æ", "ae")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


FOLDED_MAP = {fold(k): v for k, v in TRADE_TO_CODES.items()}
# Longest labels first for substring extraction from raw text
EMBEDDED_LABELS = sorted(FOLDED_MAP.keys(), key=len, reverse=True)

SOFT_NEEDLES: list[tuple[str, list[str]]] = [
    ("architecte d'interieur", ["5.2.1"]),
    ("architecte interieur", ["5.2.1"]),
    ("interior design", ["5.2.2", "5.2.3"]),
    ("design interieur", ["5.2.2", "5.2.3"]),
    ("cuisiniste", ["4.2.3"]),
    ("cuisine", ["4.2.3"]),
    ("dressing", ["4.2.6", "4.2.3"]),
    ("kitchen", ["4.2.3"]),
    ("zone design", ["5.2.2", "4.2.1"]),
    ("deco", ["5.2.3", "4.2.2"]),
    ("decor", ["5.2.3", "4.2.2"]),
    ("architect", ["5.1.1"]),
    ("bureau d'etude", ["3.4.2", "3.4.3"]),
    ("bureau d etude", ["3.4.2", "3.4.3"]),
    ("engineering", ["3.4.2", "3.4.3"]),
    ("genie civil", ["3.4.1"]),
    ("beton", ["3.1.4", "3.4.1"]),
    ("vrd", ["3.1.2", "3.4.1"]),
    ("infographie", ["5.4.4", "7.2.6"]),
    ("maquette", ["5.4.4"]),
    ("3d", ["5.4.4", "7.2.6"]),
    ("rendu", ["5.4.4"]),
    ("materiel electrique", ["8.5.3", "3.5.3"]),
    ("electrique", ["3.2.1", "8.5.3"]),
    ("electricien", ["3.2.1"]),
    ("photovolta", ["8.6.6", "3.2.1"]),
    ("solaire", ["8.6.6", "3.2.1"]),
    ("energie", ["8.6.6"]),
    ("climatisation", ["3.2.3"]),
    ("frig", ["3.2.3"]),
    ("cvc", ["3.2.3", "3.2.5"]),
    ("topograph", ["3.4.8", "3.4.7"]),
    ("geomet", ["3.4.7"]),
    ("geotechn", ["3.4.9", "3.4.4"]),
    ("laboratoire", ["3.4.4", "3.4.9"]),
    ("revetement", ["3.3.1"]),
    ("carrel", ["3.3.1"]),
    ("zellige", ["3.3.1", "4.2.2"]),
    ("marbre", ["8.5.4", "3.3.1"]),
    ("granit", ["8.5.4", "3.3.1"]),
    ("quartz", ["8.5.4", "4.2.3"]),
    ("dallage", ["3.1.4", "3.3.1"]),
    ("resine", ["3.3.1"]),
    ("menuis", ["3.3.4"]),
    ("carpentry", ["3.3.4"]),
    ("woodwork", ["3.3.4"]),
    ("bois", ["3.3.4", "8.5.4"]),
    ("porte", ["3.3.4", "3.3.6"]),
    ("fenetre", ["3.3.4"]),
    ("aluminium", ["3.3.4", "3.3.3"]),
    ("ferronner", ["3.3.5", "3.3.6"]),
    ("metall", ["3.3.5"]),
    ("inox", ["3.3.5"]),
    ("store", ["3.3.4", "4.2.1"]),
    ("tente", ["4.3.3", "4.3.5"]),
    ("bache", ["4.3.5"]),
    ("veranda", ["4.3.3"]),
    ("terrasse", ["4.3.3"]),
    ("sanitaire", ["4.2.4"]),
    ("salle de bain", ["4.2.4"]),
    ("quincailler", ["8.5.1"]),
    ("materiaux", ["8.5.4", "3.5.1"]),
    ("nettoyage", ["8.6.1"]),
    ("echafaud", ["3.5.2"]),
    ("location", ["3.5.2"]),
    ("engin", ["3.5.2"]),
    ("plomb", ["3.2.2"]),
    ("peinture", ["3.3.2"]),
    ("paint", ["3.3.2"]),
    ("etanche", ["3.2.6"]),
    ("isolat", ["3.2.7"]),
    ("piscine", ["4.3.4"]),
    ("paysag", ["4.3.2"]),
    ("amenagement", ["4.2.1"]),
    ("construction", ["3.1.5", "3.4.6"]),
    ("gros oeuvre", ["3.1.5", "3.1.3"]),
    ("lighting", ["4.2.7"]),
    ("luminaire", ["4.2.7"]),
    ("نجار", ["3.3.4"]),
    ("مطابخ", ["4.2.3"]),
    ("ديكور", ["5.2.3", "4.2.2"]),
]


def codes_for_trade(trade: str) -> list[str]:
    key = fold(trade)
    if not key:
        return []
    if key in FOLDED_MAP:
        return list(FOLDED_MAP[key])
    for needle, codes in SOFT_NEEDLES:
        if needle in key:
            return list(codes)
    return []


def extract_embedded_trade(raw: str) -> str:
    """Pull métier label glued to city in lechantier raw text, e.g. MenuiserieCasablanca."""
    text = fold(raw)
    if not text:
        return ""
    for label in EMBEDDED_LABELS:
        if len(label) < 4:
            continue
        if label in text:
            return label
    return ""


def infer_codes_from_profile(row: dict) -> list[str]:
    """Classify a pro even when trade column is empty, using raw/name/description."""
    trade = (row.get("trade") or "").strip()
    codes = codes_for_trade(trade)
    if codes:
        return codes

    raw = row.get("raw_profile_text") or row.get("raw") or ""
    embedded = extract_embedded_trade(raw)
    if embedded:
        codes = codes_for_trade(embedded)
        if codes:
            return codes

    blob = fold(
        " ".join(
            [
                row.get("professional_name") or "",
                row.get("company_name") or row.get("name") or "",
                row.get("description") or "",
                raw,
                row.get("project_1_name") or "",
                row.get("project_1_description") or "",
                row.get("url") or "",
            ]
        )
    )
    for needle, needle_codes in SOFT_NEEDLES:
        if needle in blob:
            return list(needle_codes)

    # Last resort: generic BTP contractor so every pro gets a specialty
    return ["3.4.6"]


def load_category_labels() -> dict[str, str]:
    # Prefer a local dump if present; else leave labels empty (codes still useful).
    path = OUT_DIR / "_internal_categories.json"
    if path.exists():
        rows = json.loads(path.read_text(encoding="utf-8"))
        return {str(r["code"]): str(r["detailed_sub_category"]) for r in rows}
    return {}


def write_trade_map(labels: dict[str, str]) -> None:
    payload = []
    for trade, codes in sorted(TRADE_TO_CODES.items(), key=lambda x: x[0]):
        payload.append(
            {
                "trade": trade,
                "codes": codes,
                "labels": [labels.get(c, c) for c in codes],
            }
        )
    out = OUT_DIR / "_trade_to_internal_categories.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {out} ({len(payload)} trade rules)")


def map_pros(labels: dict[str, str]) -> None:
    with PROS_CSV.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    extra = [
        "internal_category_codes",
        "internal_category_labels",
        "internal_category_primary_code",
    ]
    for col in extra:
        if col not in fieldnames:
            fieldnames.append(col)

    mapped = 0
    multi = 0
    inferred_empty_trade = 0
    unmapped: Counter[str] = Counter()
    for row in rows:
        trade = (row.get("trade") or "").strip()
        codes = infer_codes_from_profile(row)
        # Optional multi-specialty enrichment from description (keep ≤5)
        if codes:
            blob = fold(
                " ".join(
                    [
                        trade,
                        row.get("description") or "",
                        row.get("professional_name") or "",
                        row.get("company_name") or "",
                        row.get("raw_profile_text") or "",
                    ]
                )
            )
            extras: list[str] = []
            hints = [
                ("plomb", "3.2.2"),
                ("electric", "3.2.1"),
                ("climat", "3.2.3"),
                ("chauffage", "3.2.5"),
                ("etanche", "3.2.6"),
                ("isolat", "3.2.7"),
                ("menuis", "3.3.4"),
                ("peinture", "3.3.2"),
                ("carrel", "3.3.1"),
                ("architect", "5.1.1"),
                ("interieur", "5.2.1"),
                ("cuisin", "4.2.3"),
                ("paysag", "4.3.2"),
                ("piscine", "4.3.4"),
            ]
            for needle, code in hints:
                if needle in blob and code not in codes:
                    extras.append(code)
            codes = (codes + extras)[:5]

        row["internal_category_codes"] = "|".join(codes)
        row["internal_category_labels"] = "|".join(labels.get(c, c) for c in codes)
        row["internal_category_primary_code"] = codes[0] if codes else ""
        if codes:
            mapped += 1
            if not trade:
                inferred_empty_trade += 1
            if len(codes) > 1:
                multi += 1
        else:
            unmapped[trade or "(empty)"] += 1

    out = OUT_DIR / "pros_filtered_btp_mapped.csv"
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    report = OUT_DIR / "_pros_category_map_report.txt"
    lines = [
        f"total={len(rows)} mapped={mapped} multi={multi} unmapped={len(rows)-mapped} inferred_from_empty_trade={inferred_empty_trade}",
        "",
        "unmapped trades:",
    ]
    for trade, count in unmapped.most_common():
        lines.append(f"  {count:4d}  {trade}")
    report.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {out}")
    print(f"wrote {report}")


def map_services(labels: dict[str, str]) -> None:
    if not SERVICES_CSV.exists():
        print(f"skip services (missing {SERVICES_CSV})")
        return
    with SERVICES_CSV.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    for col in ("internal_category_codes", "internal_category_labels"):
        if col not in fieldnames:
            fieldnames.append(col)

    # Index pros mapping by ice / username when available
    pros_by_ice: dict[str, list[str]] = {}
    pros_by_user: dict[str, list[str]] = {}
    mapped_pros = OUT_DIR / "pros_filtered_btp_mapped.csv"
    if mapped_pros.exists():
        with mapped_pros.open(encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                codes = [c for c in (row.get("internal_category_codes") or "").split("|") if c]
                ice = (row.get("ice") or "").strip()
                url = (row.get("profile_url") or row.get("url") or "").rstrip("/").split("/")[-1]
                if ice and codes:
                    pros_by_ice[ice] = codes
                if url and codes:
                    pros_by_user[fold(url)] = codes

    filled = 0
    inherited = 0
    still_empty = 0
    for row in rows:
        existing = (row.get("internal_category_id") or "").strip()
        # Prefer owner specialty codes; fall back to profession/category mapping.
        ice = (row.get("ice") or "").strip()
        user = fold(row.get("username") or "")
        url = fold((row.get("_profile_url") or "").rstrip("/").split("/")[-1])
        owner_codes: list[str] = []
        if ice and ice in pros_by_ice:
            owner_codes = pros_by_ice[ice]
        elif user and user in pros_by_user:
            owner_codes = pros_by_user[user]
        elif url and url in pros_by_user:
            owner_codes = pros_by_user[url]

        codes: list[str] = []
        if owner_codes:
            # Default service specialty = owner's primary (+ keep owner set)
            codes = list(owner_codes)
            inherited += 1
        elif existing and not existing.isdigit() and "." in existing:
            codes = [existing]
        else:
            codes = codes_for_trade(row.get("profession") or row.get("category") or "")
            if not codes:
                codes = infer_codes_from_profile(
                    {
                        "trade": row.get("profession") or "",
                        "name": row.get("full_name") or "",
                        "company_name": row.get("full_name") or "",
                        "description": row.get("description") or "",
                        "raw_profile_text": " ".join(
                            [
                                row.get("title") or "",
                                row.get("profession") or "",
                                row.get("category") or "",
                                row.get("bio") or "",
                            ]
                        ),
                    }
                )

        row["internal_category_codes"] = "|".join(codes)
        row["internal_category_labels"] = "|".join(labels.get(c, c) for c in codes)
        if codes:
            # store primary code string in internal_category_id for later SQL resolve-by-code
            if not existing.isdigit():
                row["internal_category_id"] = codes[0]
            filled += 1
        else:
            still_empty += 1

    out = OUT_DIR / "services_cards_mapped.csv"
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    print(
        f"wrote {out} filled_codes={filled}/{len(rows)} "
        f"inherited_from_owner={inherited} still_empty={still_empty}"
    )


def main() -> None:
    # Fetch labels from a small sidecar if we dump them; otherwise codes only.
    labels_path = OUT_DIR / "_internal_categories.json"
    labels: dict[str, str] = {}
    if labels_path.exists():
        labels = {
            str(r["code"]): str(r["detailed_sub_category"])
            for r in json.loads(labels_path.read_text(encoding="utf-8"))
        }
    write_trade_map(labels)
    map_pros(labels)
    map_services(labels)


if __name__ == "__main__":
    main()
