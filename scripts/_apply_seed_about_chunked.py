#!/usr/bin/env python3
"""Apply _about_out_seed.json in SQL chunks via supabase db query --linked."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "_about_out_seed.json"
CHUNK = 80
MAX_BIO = 251


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    rows = json.loads(OUT.read_text(encoding="utf-8"))
    if not isinstance(rows, list) or not rows:
        raise SystemExit("no rows in _about_out_seed.json")

    total = 0
    for i in range(0, len(rows), CHUNK):
        part = rows[i : i + CHUNK]
        lines = ["BEGIN;"]
        for row in part:
            bio = (row.get("bio") or "").strip()[:MAX_BIO]
            about = (row.get("about_html") or "").strip()
            if not about:
                continue
            lines.append(
                "UPDATE public.profiles SET "
                f"bio = {sql_str(bio)}, "
                f"about_text = {sql_str(about)}, "
                "updated_at = NOW() "
                f"WHERE id = '{row['id']}'::uuid;"
            )
            total += 1
        lines.append("COMMIT;")
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", suffix=".sql", delete=False, dir=str(ROOT)
        ) as tmp:
            tmp.write("\n".join(lines) + "\n")
            path = Path(tmp.name)
        print(f"chunk {i // CHUNK + 1}: {len(part)} rows -> {path.name}")
        proc = subprocess.run(
            ["supabase", "db", "query", "--linked", "-f", str(path)],
            cwd=str(ROOT.parent),
            encoding="utf-8",
            errors="replace",
        )
        path.unlink(missing_ok=True)
        if proc.returncode != 0:
            sys.exit(proc.returncode)

    print(f"done updates={total}")


if __name__ == "__main__":
    main()
