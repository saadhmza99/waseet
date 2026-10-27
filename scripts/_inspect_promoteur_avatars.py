#!/usr/bin/env python3
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent


def q(sql: str):
    r = subprocess.run(
        ["supabase", "db", "query", "--linked", "-o", "json", sql],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if r.returncode:
        sys.stderr.write(r.stderr or "")
        raise SystemExit(r.returncode)
    raw = (r.stdout or "").strip()
    data = json.loads(raw[raw.find("{") :])
    return data.get("rows") or []


def main() -> None:
    rows = q(
        """
        SELECT full_name, website_url, left(avatar_url, 120) AS avatar
        FROM profiles p
        JOIN internal_categories ic ON ic.id = p.internal_category_id
        WHERE ic.code = '1.2.1'
        """
    )
    hosts = Counter()
    samples = []
    for r in rows:
        u = r.get("avatar") or ""
        host = urlparse(u).hostname or "(none)"
        hosts[host] += 1
        if len(samples) < 25:
            samples.append(f"{r['full_name'][:40]} | {u}")
    print("hosts:", hosts.most_common(15))
    print("--- samples ---")
    print("\n".join(samples))
    (ROOT / "_promoteurs_logo_targets.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
