#!/usr/bin/env python3
"""Apply curated WebSearch logo batch #1 (short list, named match)."""
from __future__ import annotations

import json
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT_SQL = ROOT / "_apply_promoteurs_logos_curated_batch1.sql"

# name substring (casefold) → logo URL (official / Wikimedia / parent brand)
CURATED = [
    ("Arcadia Capital", "https://arcadia-immo.ma/wp-content/uploads/2025/01/Arcadia-logo.svg"),
    ("Avenis", "https://www.jetgroupafrica.com/images/logo.png"),
    ("Yamed", "https://ynexis.com/wp-content/uploads/2025/10/YNEXIS_LOGO_DIGI_R.svg"),
    ("OCP S.A.", "https://upload.wikimedia.org/wikipedia/commons/6/6e/Ocp-group.png"),
    # parent Jet Group brand also covers Avenis sibling Jet Sakane naming if present
]


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def probe(url: str) -> bool:
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"},
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read(80_000)
            code = getattr(resp, "status", 200)
            ctype = (resp.headers.get("Content-Type") or "").lower()
        if code >= 400 or len(data) < 40:
            return False
        if ctype.startswith("image/") or url.lower().endswith((".png", ".svg", ".jpg", ".jpeg", ".webp")):
            return True
        return len(data) > 200
    except Exception as exc:
        print(f"  probe fail {url}: {exc}")
        return False


def main() -> None:
    apply = "--apply" in sys.argv
    still = json.loads((ROOT / "_promoteurs_still_default.json").read_text(encoding="utf-8"))
    by_name = {str(r["full_name"]).strip(): r for r in still}

    updates: list[tuple[str, str, str]] = []
    for name, url in CURATED:
        row = by_name.get(name)
        if not row:
            print(f"skip (not default / missing): {name}")
            continue
        print(f"probe {name} …")
        if not probe(url):
            print(f"  BAD url, skip: {url}")
            continue
        updates.append((row["id"], name, url))
        print(f"  OK {url}")

    lines = [
        "-- Curated logo batch 1 (manual/WebSearch)",
        f"-- {len(updates)} updates",
        "BEGIN;",
    ]
    for pid, name, url in updates:
        lines.append(f"-- {name}")
        lines.append(
            "UPDATE public.profiles SET "
            f"avatar_url = {sql_str(url)}, updated_at = NOW() "
            f"WHERE id = {sql_str(pid)}::uuid "
            "AND (avatar_url IS NULL OR avatar_url LIKE '%default-pro.jpg%');"
        )
    lines.append("COMMIT;")
    OUT_SQL.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_SQL} ({len(updates)})")

    if apply and updates:
        r = subprocess.run(
            ["supabase", "db", "query", "--linked", "-f", str(OUT_SQL)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if r.returncode:
            sys.stderr.write(r.stderr or r.stdout or "")
            raise SystemExit(r.returncode)
        print("Applied OK")


if __name__ == "__main__":
    main()
