#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sql = """
SELECT p.id, p.full_name, p.website_url, p.username
FROM profiles p
JOIN internal_categories ic ON ic.id = p.internal_category_id
WHERE ic.code = '1.2.1'
  AND (p.avatar_url IS NULL OR p.avatar_url LIKE '%default-pro.jpg%')
ORDER BY p.full_name
"""
r = subprocess.run(
    ["supabase", "db", "query", "--linked", "-o", "json", sql],
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace",
)
if r.returncode:
    sys.stderr.write(r.stderr or r.stdout or "")
    raise SystemExit(r.returncode)
raw = r.stdout
rows = json.loads(raw[raw.find("{") :]).get("rows") or []
(ROOT / "_promoteurs_still_default.json").write_text(
    json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(len(rows))
for x in rows[:50]:
    print(x["full_name"])
