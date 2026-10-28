#!/usr/bin/env python3
"""Apply a SQL file via supabase db query --linked."""
import subprocess
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: _apply_sql_file.py <path.sql>")
    path = Path(sys.argv[1])
    sql = path.read_text(encoding="utf-8")
    r = subprocess.run(
        ["supabase", "db", "query", "--linked", "-o", "json", "-f", str(path)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    sys.stdout.write(r.stdout or "")
    sys.stderr.write(r.stderr or "")
    raise SystemExit(r.returncode)


if __name__ == "__main__":
    main()
