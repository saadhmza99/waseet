#!/usr/bin/env python3
"""Rewrite profiles.about_text (Infos → À propos) and repair bio from clean about."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAW = Path(__file__).resolve().parent / "_profiles_about_raw.txt"
OUT_SQL = Path(__file__).resolve().parent / "_rewrite_about.sql"
OUT_REPORT = Path(__file__).resolve().parent / "_rewrite_about_report.csv"
MAX_BIO = 251

GENERIC_OPENERS = [
    re.compile(
        r"^Nous sommes une entreprise basée à [^.]{1,80} spécialisée en [^.]{1,120}\.\s*",
        re.I | re.S,
    ),
    re.compile(
        r"^Nous sommes une entreprise spécialisée en [^.]{1,120}\.\s*",
        re.I | re.S,
    ),
    re.compile(
        r"^Nous \(Acero\) propose\b",  # keep body, fix later if needed
        re.I,
    ),
]


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def looks_mojibake(s: str) -> bool:
    return any(tok in (s or "") for tok in ("├", "ΓÇ", "┘", "╪", "Â", "â€™", "Ã©", "Ã¨"))


def strip_generic(text: str) -> str:
    t = (text or "").strip()
    for rx in GENERIC_OPENERS[:2]:
        t = rx.sub("", t).strip()
    return t


def normalize_whitespace(text: str) -> str:
    t = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    t = re.sub(r"[ \t]+\n", "\n", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    t = re.sub(r"[ \t]{2,}", " ", t)
    return t.strip()


def first_bio_excerpt(about: str) -> str:
    """Short header bio from about, ≤251 chars, end on word boundary."""
    plain = re.sub(r"<[^>]+>", "", about or "")
    plain = normalize_whitespace(plain).replace("\n", " ")
    plain = re.sub(r"\s+", " ", plain).strip()
    if len(plain) <= MAX_BIO:
        return plain
    cut = plain[: MAX_BIO - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut.rstrip(".,;:") + "…"


def build_about(row: dict) -> str:
    name = (row.get("full_name") or "").strip() or "Cette entreprise"
    city = (row.get("location") or "").strip()
    profession = (row.get("profession") or "").strip()
    bio = (row.get("bio") or "").strip()
    about = (row.get("about_text") or "").strip()
    specs = row.get("specialties") or []
    if isinstance(specs, str):
        try:
            specs = json.loads(specs)
        except json.JSONDecodeError:
            specs = [specs]

    # Prefer about_text if not mojibake; else bio if clean; else synthesize
    source = ""
    if about and not looks_mojibake(about):
        source = strip_generic(about)
    elif bio and not looks_mojibake(bio):
        source = bio
    elif about:
        source = strip_generic(about)
    elif bio:
        source = bio

    source = normalize_whitespace(source)

    if not source or len(source) < 40:
        where = f" basée à {city}" if city else ""
        focus = f", spécialisée en {profession.lower()}" if profession else ""
        source = f"{name} est une entreprise{where}{focus}."

    # If body doesn't mention the company name near the start, leave as-is (many start with "Créée…")
    # Ensure we don't leave a dangling generic-only string
    if source.lower().startswith("nous sommes une entreprise"):
        source = strip_generic(source) or source

    # Multi-specialty footer when useful
    if isinstance(specs, list) and len(specs) > 1:
        label = ", ".join(s for s in specs if s)
        if label and label.lower() not in source.lower():
            source = source.rstrip() + f"\n\nDomaines d'expertise : {label}."

    return source[:8000]


def load_rows() -> list[dict]:
    raw = RAW.read_text(encoding="utf-8", errors="replace")
    # Find JSON object in CLI output
    start = raw.find("{")
    if start < 0:
        raise SystemExit("no JSON in export")
    payload = json.loads(raw[start:])
    rows = payload.get("rows") or payload
    if not isinstance(rows, list):
        raise SystemExit("unexpected JSON shape")
    return rows


def main() -> int:
    rows = load_rows()
    sql = ["-- Rewrite Infos À propos (about_text) + repair bio", "BEGIN;"]
    report_lines = ["id,username,changed,bio_len,about_len"]

    changed = 0
    for row in rows:
        pid = row["id"]
        username = row.get("username") or ""
        new_about = build_about(row)
        new_bio = first_bio_excerpt(new_about)
        old_about = (row.get("about_text") or "").strip()
        old_bio = (row.get("bio") or "").strip()

        about_changed = new_about != old_about
        bio_changed = new_bio != old_bio or looks_mojibake(old_bio)
        if not about_changed and not bio_changed:
            report_lines.append(f"{pid},{username},0,{len(new_bio)},{len(new_about)}")
            continue

        changed += 1
        sets = []
        if about_changed:
            sets.append(f"about_text = {sql_str(new_about)}")
        if bio_changed:
            sets.append(f"bio = {sql_str(new_bio)}")
        sets.append("updated_at = NOW()")
        sql.append(f"UPDATE public.profiles SET {', '.join(sets)} WHERE id = '{pid}'::uuid;")
        report_lines.append(f"{pid},{username},1,{len(new_bio)},{len(new_about)}")

    sql.append("COMMIT;")
    OUT_SQL.write_text("\n".join(sql) + "\n", encoding="utf-8")
    OUT_REPORT.write_text("\n".join(report_lines) + "\n", encoding="utf-8")
    print(f"profiles={len(rows)} changed={changed}")
    print(f"wrote {OUT_SQL}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
