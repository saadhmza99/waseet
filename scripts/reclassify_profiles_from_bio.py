#!/usr/bin/env python3
"""Infer internal categories from profession+bio and emit SQL updates (admin, no login)."""

from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPORT = Path(__file__).resolve().parent / "_profiles_bios_export.csv"
OUT_SQL = Path(__file__).resolve().parent / "_reclassify_profiles.sql"
OUT_REPORT = Path(__file__).resolve().parent / "_reclassify_report.csv"

# Ordered rules: (code, keywords). First match is primary; more matches → multi-category.
# Keywords matched against normalized profession + bio (lowercase, accents stripped).
RULES: list[tuple[str, list[str]]] = [
    ("5.1.1", ["architecte", "architecture ", "cabinet d'architecture", "cabinet d architecture"]),
    ("5.2.1", ["architecture interieure", "architecte d'interieur", "architecte d interieur", "design interieur", "architecture d'interieur"]),
    ("5.2.2", ["design d'interieur", "design d interieur", "interior design"]),
    ("5.3.3", ["paysagisme", "paysagiste"]),
    ("4.3.2", ["paysage", "espaces exterieurs", "amenagement exterieur", "jardinage"]),
    ("4.3.1", ["jardin", "plantes", "palmiers", "gazon", "arrosage"]),
    ("4.3.4", ["piscine", "piscines"]),
    ("1.2.1", ["promoteur immobilier", "promotion immobiliere", "societe de promotion"]),
    ("1.1.1", ["agence immobiliere", "immobilier transaction"]),
    ("1.1.2", ["agent immobilier"]),
    ("3.4.2", ["bureau d'etudes", "bureau d etudes", "bet ", "ingenierie du batiment", "etudes techniques"]),
    ("3.4.1", ["genie civil", "structure ", "ingenieur structure"]),
    ("6.2.3", ["geometre", "topographe", "topographie"]),
    ("3.1.3", ["gros oeuvre", "gros-oeuvre", "construction batiment", "entreprise de construction", "travaux publics", " btp"]),
    ("3.1.6", ["charpente", "metallique"]),
    ("3.1.5", ["maconnerie", "macon "]),
    ("3.1.4", ["beton", "prefa"]),
    ("3.2.1", ["electricien", "installation electrique", "electrique pour maison", "materiel electrique", "cablage", "eclairage", "domotique", "videosurveillance", "automatisme"]),
    ("3.2.2", ["plomberie", "plombier", "sanitaire", "robinetterie"]),
    ("3.2.3", ["climatisation", "clim ", "froid industriel", "frigori"]),
    ("3.2.5", ["chauffage"]),
    ("3.2.6", ["etancheite", "etanche"]),
    ("3.2.7", ["isolation thermique", "isolation acoustique", "isolation "]),
    ("3.2.9", ["ascenseur", "monte charge", "monte-charge"]),
    ("3.3.2", ["peinture", "peintures"]),
    ("3.3.4", ["menuiserie", "boiserie", "parquet", "menuisier"]),
    ("3.3.5", ["ferronnerie", "metallerie", "ferronnier", "ouvrages metalliques", "garde-corps", "garde corps"]),
    ("3.3.1", ["revetement", "carrelage", "carreaux"]),
    ("3.3.6", ["serrurerie", "serrurier"]),
    ("4.2.1", ["amenagement interieur", "agencement interieur", "fit-out", "fit out", "finition"]),
    ("4.2.3", ["cuisine", "cuisines", "kitchen"]),
    ("4.2.4", ["salle de bain", "salle de bains"]),
    ("4.1.1", ["renovation", "rehabilitation"]),
    ("4.4.1", ["travaux de peinture"]),
    ("7.5.2", ["domotique", "maison connectee", "smart home", "smart building"]),
    ("7.5.5", ["videosurveillance", "securite intelligente"]),
    ("8.4.3", ["photographe", "photographie"]),
    ("8.4.4", ["videaste", "video immobiliere", "video et photo"]),
    ("8.6.1", ["nettoyage", "menage"]),
    ("8.6.3", ["securite ", "gardiennage"]),
    ("8.6.6", ["energie solaire", "panneau solaire", "photovoltaique", "solutions energetiques"]),
    ("3.5.1", ["materiaux de construction", "mortier", "ciment", "gravette", "agregat", "aggregates", "ferraille", "acier", "steel"]),
    ("3.5.2", ["materiel de chantier", "echafaudage", "scaffolding", "outillage"]),
    ("3.5.3", ["equipements techniques"]),
    ("8.5.2", [" mobilier ", "ameublement"]),
    ("8.5.3", ["electromenager", "luminaire", "trio four"]),
    ("8.5.4", ["fournisseur de", "importation et la distribution", "distributeur de", "negoce de"]),
    ("8.5.5", ["produits specialises"]),
    ("8.5.1", ["fournitures professionnelles", "fournitures industrielles"]),
]


def strip_accents(s: str) -> str:
    repl = {
        "à": "a", "â": "a", "ä": "a", "á": "a",
        "é": "e", "è": "e", "ê": "e", "ë": "e",
        "î": "i", "ï": "i", "í": "i",
        "ô": "o", "ö": "o", "ó": "o",
        "ù": "u", "û": "u", "ü": "u",
        "ç": "c", "œ": "oe", "æ": "ae",
        "À": "a", "Â": "a", "É": "e", "È": "e", "Ê": "e",
        "Î": "i", "Ô": "o", "Ù": "u", "Û": "u", "Ç": "c",
    }
    for a, b in repl.items():
        s = s.replace(a, b)
    return s


def normalize(s: str) -> str:
    s = strip_accents((s or "").lower())
    s = re.sub(r"\s+", " ", s)
    return s


def clean_bio(bio: str) -> str:
    b = (bio or "").strip()
    b = re.sub(r"[.…]+$", "…", b) if b.endswith("…") or b.endswith("...") else b
    b = re.sub(r"\s+", " ", b)
    # Soft polish: capitalize first letter
    if b and b[0].islower():
        b = b[0].upper() + b[1:]
    return b[:251]  # matches profiles_bio_check / MAX_BIO_LENGTH


def has_kw(text: str, kw: str) -> bool:
    """Substring match with light boundaries to avoid immobilier→mobilier."""
    if " " in kw or len(kw) >= 8:
        return kw in text
    # short tokens: require non-letter borders
    return re.search(rf"(?<![a-z0-9]){re.escape(kw)}(?![a-z0-9])", text) is not None


def infer_codes(profession: str, bio: str, current: str) -> list[str]:
    text = normalize(f"{profession} {bio}")
    found: list[str] = []
    for code, kws in RULES:
        if any(has_kw(text, k) for k in kws):
            if code not in found:
                found.append(code)
        if len(found) >= 5:
            break
    # Drop weak fournisseur tag if stronger specialty already found
    if len(found) > 1 and found[0].startswith("8.5") is False:
        found = [c for c in found if not c.startswith("8.5")] or found
    if not found and current:
        return [current]
    if not found:
        return ["8.5.4"]
    # Keep current as primary if still among matches
    if current in found:
        found = [current] + [c for c in found if c != current]
    return found[:5]


def main() -> int:
    if not EXPORT.exists():
        print(f"missing {EXPORT}", file=sys.stderr)
        return 1

    rows_out = []
    sql_parts = [
        "-- Auto-generated: reclassify profiles from bio/profession (admin, no login)",
        "BEGIN;",
    ]

    with EXPORT.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        # handle BOM on key
        fieldnames = reader.fieldnames or []
        id_key = "id" if "id" in fieldnames else fieldnames[0]

        for row in reader:
            pid = row[id_key].strip()
            username = row.get("username", "")
            profession = row.get("profession", "")
            bio = row.get("bio", "")
            current = (row.get("current_code") or "").strip()
            codes = infer_codes(profession, bio, current)
            new_bio = clean_bio(bio)
            multi = len(codes) > 1
            changed = codes != ([current] if current else []) or new_bio != (bio or "").strip()

            rows_out.append(
                {
                    "id": pid,
                    "username": username,
                    "current_code": current,
                    "new_codes": "|".join(codes),
                    "multi": "1" if multi else "0",
                    "changed": "1" if changed else "0",
                    "bio_preview": new_bio[:120],
                }
            )

            if not changed and not multi:
                continue

            # Update bio when cleaned differently
            if new_bio and new_bio != (bio or "").strip():
                esc = new_bio.replace("'", "''")
                sql_parts.append(
                    f"UPDATE public.profiles SET bio = '{esc}', updated_at = NOW() WHERE id = '{pid}'::uuid;"
                )

            # Replace junction + primary
            sql_parts.append(f"DELETE FROM public.profile_internal_categories WHERE profile_id = '{pid}'::uuid;")
            for i, code in enumerate(codes):
                primary = "TRUE" if i == 0 else "FALSE"
                sql_parts.append(
                    f"""INSERT INTO public.profile_internal_categories (profile_id, internal_category_id, is_primary)
SELECT '{pid}'::uuid, ic.id, {primary}
FROM public.internal_categories ic WHERE ic.code = '{code}'
ON CONFLICT (profile_id, internal_category_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;"""
                )
            sql_parts.append(
                f"""UPDATE public.profiles p
SET internal_category_id = ic.id, updated_at = NOW()
FROM public.internal_categories ic
WHERE p.id = '{pid}'::uuid AND ic.code = '{codes[0]}';"""
            )

    sql_parts.append("COMMIT;")
    OUT_SQL.write_text("\n".join(sql_parts) + "\n", encoding="utf-8")

    with OUT_REPORT.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["id", "username", "current_code", "new_codes", "multi", "changed", "bio_preview"],
        )
        w.writeheader()
        w.writerows(rows_out)

    multi_n = sum(1 for r in rows_out if r["multi"] == "1")
    changed_n = sum(1 for r in rows_out if r["changed"] == "1")
    print(f"profiles={len(rows_out)} multi={multi_n} changed={changed_n}")
    print(f"wrote {OUT_SQL}")
    print(f"wrote {OUT_REPORT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
