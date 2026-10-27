#!/usr/bin/env python3
"""Export live profiles + projects JSON for promoteurs seed dedup."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run_json(sql: str):
    r = subprocess.run(
        ["supabase", "db", "query", "--linked", "-o", "json", sql],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if r.returncode != 0:
        sys.stderr.write(r.stderr or r.stdout or "query failed\n")
        raise SystemExit(r.returncode)
    raw = (r.stdout or "").strip()
    idx = raw.find("{")
    if idx < 0:
        idx = raw.find("[")
    raw = raw[idx:] if idx >= 0 else raw
    data = json.loads(raw)
    if isinstance(data, dict):
        data = data.get("rows") or data.get("data") or data.get("result") or []
    if not isinstance(data, list):
        raise SystemExit(f"Unexpected query payload type: {type(data)}")
    return data


def main() -> None:
    profiles = run_json(
        "SELECT id, email, username, full_name, lower(full_name) AS lower_full_name, "
        "website_url FROM public.profiles"
    )
    projects = run_json(
        "SELECT id, user_id, title, city, promoter_id, promoter_name, attributes "
        "FROM public.projects"
    )
    (ROOT / "_existing_profiles_all.json").write_text(
        json.dumps(profiles, ensure_ascii=False), encoding="utf-8"
    )
    (ROOT / "_existing_projects.json").write_text(
        json.dumps(projects, ensure_ascii=False), encoding="utf-8"
    )
    promoteurs_only = run_json(
        "SELECT id, email, username, full_name, lower(full_name) AS lower_full_name, website_url "
        "FROM public.profiles WHERE profession ILIKE '%promotion%' OR profession ILIKE '%promoteur%'"
    )
    (ROOT / "_existing_promoteurs.json").write_text(
        json.dumps(promoteurs_only, ensure_ascii=False), encoding="utf-8"
    )
    print(f"profiles={len(profiles)} promoteurs={len(promoteurs_only)} projects={len(projects)}")


if __name__ == "__main__":
    main()
