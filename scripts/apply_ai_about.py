#!/usr/bin/env python3
"""Merge AI-generated about batches (incl. partials) and apply to profiles (UTF-8)."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MAX_BIO = 251


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html or "")


def load_rows() -> list[dict]:
    paths = sorted(ROOT.glob("_about_out*.json"))
    # Prefer full batches over partials when both exist
    by_stem: dict[str, Path] = {}
    for path in paths:
        name = path.name
        if re.fullmatch(r"_about_out_\d+\.json", name):
            by_stem[name] = path
        elif re.fullmatch(r"_about_out_\d+_p\d+\.json", name):
            # keep partials; merge later by id
            by_stem.setdefault(name, path)
        else:
            by_stem[name] = path

    seen: dict[str, dict] = {}
    for path in sorted(by_stem.values(), key=lambda p: p.name):
        part = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(part, list):
            raise SystemExit(f"{path} is not a list")
        for row in part:
            pid = row.get("id")
            if not pid:
                continue
            seen[pid] = row
    return list(seen.values())


def write_sql(rows: list[dict]) -> Path:
    sql = ["-- AI-generated bio + about_html", "BEGIN;"]
    updates = 0
    for row in rows:
        pid = row["id"]
        bio = (row.get("bio") or "").strip().replace("—", " : ")[:MAX_BIO]
        about = (row.get("about_html") or "").strip().replace("—", " : ")
        if not about:
            continue
        words = len(strip_tags(about).split())
        if words < 40:
            continue
        sql.append(
            "UPDATE public.profiles SET "
            f"bio = {sql_str(bio)}, "
            f"about_text = {sql_str(about)}, "
            "updated_at = NOW() "
            f"WHERE id = '{pid}'::uuid;"
        )
        updates += 1

    sql.append("COMMIT;")
    out = ROOT / "_apply_ai_about.sql"
    out.write_text("\n".join(sql) + "\n", encoding="utf-8")
    print(f"entries={len(rows)} updates={updates} wrote {out}")
    return out


def apply_sql(sql_path: Path) -> None:
    # Pipe file to avoid PowerShell mangling UTF-8
    cmd = ["supabase", "db", "query", "--linked", "-f", str(sql_path)]
    print("running:", " ".join(cmd))
    proc = subprocess.run(cmd, cwd=str(ROOT.parent))
    if proc.returncode != 0:
        sys.exit(proc.returncode)


def main() -> None:
    rows = load_rows()
    if not rows:
        raise SystemExit("no _about_out*.json rows found")
    sql_path = write_sql(rows)
    if "--apply" in sys.argv:
        apply_sql(sql_path)


if __name__ == "__main__":
    main()
