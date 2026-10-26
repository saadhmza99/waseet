#!/usr/bin/env python3
"""Export lc-* profiles to _about_seed_input.json via supabase db query."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "_about_seed_input.json"
SQL = (
    "SELECT id::text AS id, username, full_name, profession, location "
    "FROM public.profiles WHERE username LIKE 'lc-%' ORDER BY username;"
)


def main() -> None:
    cmd = [
        "supabase",
        "db",
        "query",
        "--linked",
        "-o",
        "json",
        "--agent",
        "no",
        SQL,
    ]
    print("running:", " ".join(cmd))
    proc = subprocess.run(
        cmd,
        cwd=str(ROOT.parent),
        capture_output=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr or proc.stdout or "supabase query failed")
        sys.exit(proc.returncode)
    raw = (proc.stdout or "").strip()
    # Strip CLI noise lines before JSON
    start = raw.find("[")
    if start < 0:
        start = raw.find("{")
    if start < 0:
        raise SystemExit("no JSON in supabase output")
    data = json.loads(raw[start:])
    if isinstance(data, dict):
        rows = data.get("rows") or data.get("data") or []
    else:
        rows = data
    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {OUT} rows={len(rows)}")


if __name__ == "__main__":
    main()
