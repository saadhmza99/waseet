#!/usr/bin/env python3
"""Curated logo batch #2 — Dar Saada + OCP + a few more known brands."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT_SQL = ROOT / "_apply_promoteurs_logos_curated_batch2.sql"


def commons_url(filename: str) -> str:
    digest = hashlib.md5(filename.encode("utf-8")).hexdigest()
    return f"https://upload.wikimedia.org/wikipedia/commons/{digest[0]}/{digest[:2]}/{filename}"


CURATED = [
    ("Residences Dar Saada", "https://www.espacessaada.com/assets/images/logo.png"),
    ("OCP S.A.", commons_url("Ocp-group.png")),
    # fallback if png hash wrong
]


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def probe(url: str) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}, method="GET")
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read(120_000)
            code = getattr(resp, "status", 200)
            ctype = (resp.headers.get("Content-Type") or "").lower()
        if code >= 400 or len(data) < 40:
            return False
        return ctype.startswith("image/") or url.lower().endswith(
            (".png", ".svg", ".jpg", ".jpeg", ".webp")
        )
    except Exception as exc:
        print(f"  probe fail {url}: {exc}")
        return False


def main() -> None:
    apply = "--apply" in sys.argv
    still = json.loads((ROOT / "_promoteurs_still_default.json").read_text(encoding="utf-8"))
    # refresh still from applied batch1 — remove already updated names
    by_name = {str(r["full_name"]).strip(): r for r in still}

    # OCP fallbacks
    ocp_candidates = [
        commons_url("Ocp-group.png"),
        commons_url("OCP_Group.svg"),
        "https://commons.wikimedia.org/wiki/Special:FilePath/Ocp-group.png",
    ]

    curated: list[tuple[str, str]] = [
        ("Residences Dar Saada", "https://www.espacessaada.com/assets/images/logo.png"),
    ]
    for url in ocp_candidates:
        if probe(url):
            curated.append(("OCP S.A.", url))
            break
        print(f"OCP candidate bad: {url}")

    updates: list[tuple[str, str, str]] = []
    for name, url in curated:
        row = by_name.get(name)
        if not row:
            print(f"skip missing: {name}")
            continue
        print(f"probe {name} …")
        if not probe(url):
            print(f"  BAD {url}")
            continue
        updates.append((row["id"], name, url))
        print(f"  OK")

    lines = ["-- Curated logo batch 2", f"-- {len(updates)}", "BEGIN;"]
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
            sys.stderr.write(r.stderr or "")
            raise SystemExit(r.returncode)
        print("Applied OK")


if __name__ == "__main__":
    main()
