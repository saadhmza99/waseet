#!/usr/bin/env python3
"""Write ICE backfill SQL for already-seeded pros_services_289 profiles."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = Path(
    r"C:\Users\Hamza\Projects\chridari-sifarah\output\pros_services_289\professionnels_289.csv"
)
OUT = ROOT / "supabase" / "seeds" / "seed_pros_services_289_ice.sql"


def sql_str(value: str | None) -> str:
    if value is None or value == "":
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def main() -> None:
    rows = list(csv.DictReader(CSV_PATH.open(encoding="utf-8-sig")))
    lines = [
        "-- Backfill ICE for pros_services_289 profiles (safe to re-run).",
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ice TEXT;",
        "",
    ]
    count = 0
    for row in rows:
        user_id = (row.get("id") or "").strip()
        ice = (row.get("ice") or "").strip()
        if not user_id or not ice:
            continue
        lines.append(
            f"UPDATE public.profiles SET ice = {sql_str(ice)} WHERE id = {sql_str(user_id)}::uuid;"
        )
        count += 1
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {count} ICE updates -> {OUT}")


if __name__ == "__main__":
    main()
