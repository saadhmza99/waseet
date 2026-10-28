#!/usr/bin/env python3
import json
import subprocess
import sys

sql = """
select p.id::text as id, p.title,
  coalesce(pr.full_name, '') as promoter,
  coalesce(pr.website_url, '') as website
from projects p
join profiles pr on pr.id = p.user_id
where pr.featured_promoter
  and (
    coalesce(p.cover_image, '') ilike '%chridari%'
    or coalesce(p.images::text, '') ilike '%chridari.ma%'
  )
order by pr.full_name, p.title;
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
rows = json.loads(r.stdout[r.stdout.find("{") :]).get("rows") or []
out = "scripts/_wm_projects.json"
open(out, "w", encoding="utf-8").write(json.dumps(rows, ensure_ascii=False, indent=2))
print(f"wrote {out} n={len(rows)}")
for row in rows[:25]:
    print(f"- {row['promoter']} | {row['title']} | {row['website']}")
