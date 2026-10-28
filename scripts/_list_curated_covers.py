#!/usr/bin/env python3
import json
import subprocess

sql = """
select p.id::text as id, p.title,
  left(coalesce(pr.full_name,''),40) as promoter,
  left(coalesce(p.cover_image,''),120) as cover
from projects p
join profiles pr on pr.id = p.user_id
where pr.featured_promoter
  and (
    p.cover_image ilike '%groupealnour.ma%'
    or p.cover_image ilike '%alhoudagroupe.com%'
    or p.cover_image ilike '%promoteurimmobilier.ma%'
    or p.title ilike any(array[
      'The Mansions%',
      'Majorelle Hills%',
      'Targa Palm%',
      'Al Houda Prestige%',
      'Residence Ranamir%',
      'Nour Confort Targa',
      'Nour Prestige Targa',
      'Nour Horizon%',
      'Nour Prestige Extension%',
      'Nour Prestige',
      'Nour Confort Gu%',
      'Nour Prisme%'
    ])
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
rows = json.loads(r.stdout[r.stdout.find("{") :]).get("rows") or []
print("n", len(rows))
for row in rows:
    print(f"{row['promoter']} | {row['title']}")
    print(f"  {row['cover']}")
open("scripts/_curated_cover_projects.json", "w", encoding="utf-8").write(
    json.dumps(rows, ensure_ascii=False, indent=2)
)
