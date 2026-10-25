#!/usr/bin/env python3
"""Strip mission lines from services.options for already-seeded rows."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = Path(
    r"C:\Users\Hamza\Projects\chridari-sifarah\output\pros_services_289\prestations_services.csv"
)
OUT = ROOT / "supabase" / "seeds" / "seed_pros_services_289_options_cleanup.sql"


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def is_mission_option(value: str) -> bool:
    text = value.strip().lower()
    if not text:
        return False
    if text in {"national", "international"}:
        return True
    if re.match(r"^mission(s)?\s+(nationale?|internationales?|à l'international|a l'international)\b", text):
        return True
    if re.match(r"^missions?\s+internationales?\b", text):
        return True
    return False


def clean_options(raw: str | None) -> list[str]:
    parts = [part.strip() for part in str(raw or "").split("|") if part.strip()]
    return [part for part in parts if not is_mission_option(part)]


def main() -> None:
    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8-sig")))
    lines = [
        "-- Remove Mission nationale / Mission à l'international from services.options",
        "-- (those belong in missions, shown under Pour). Safe to re-run.",
        "",
    ]
    count = 0
    for row in rows:
        service_id = (row.get("id") or "").strip()
        if not service_id:
            continue
        options = clean_options(row.get("options"))
        lines.append(
            "UPDATE public.services SET options = "
            f"{sql_str(json.dumps(options, ensure_ascii=False))}::jsonb "
            f"WHERE id = {sql_str(service_id)}::uuid;"
        )
        count += 1
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {count} option cleanups -> {OUT}")


if __name__ == "__main__":
    main()
