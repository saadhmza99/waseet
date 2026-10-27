#!/usr/bin/env python3
import csv
import json
import subprocess
import sys
from pathlib import Path

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
        sys.stderr.write(r.stderr or r.stdout or "fail\n")
        raise SystemExit(r.returncode)
    raw = (r.stdout or "").strip()
    idx = raw.find("{")
    data = json.loads(raw[idx:] if idx >= 0 else raw)
    return data.get("rows") or []


def main() -> None:
    rows = q(
        """
        SELECT p.id, p.username, p.full_name, p.website_url, p.avatar_url,
          CASE WHEN p.avatar_url IS NULL OR btrim(p.avatar_url) = '' THEN 0 ELSE 1 END AS has_avatar
        FROM profiles p
        JOIN internal_categories ic ON ic.id = p.internal_category_id
        WHERE ic.code = '1.2.1'
        ORDER BY p.full_name
        """
    )
    (ROOT / "_promoteurs_logo_targets.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    with_avatar = sum(int(r["has_avatar"]) for r in rows)
    print(f"db promoteurs={len(rows)} with_avatar={with_avatar} missing={len(rows) - with_avatar}")

    csv_path = ROOT.parent / "sifarah data" / "promoteurs_immobiliers.csv"
    csv_logos = 0
    if csv_path.exists():
        with csv_path.open(encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                if (row.get("logo_url") or "").startswith("http"):
                    csv_logos += 1
        print(f"csv with logo_url={csv_logos}")


if __name__ == "__main__":
    main()
