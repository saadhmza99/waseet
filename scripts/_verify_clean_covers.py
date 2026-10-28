#!/usr/bin/env python3
import json
import subprocess

sql = """
select left(title,40) as t, left(cover_image,100) as c
from projects
where title ilike any(array[
  'Nour Horizon%',
  'Nour Prestige Extension%',
  'Majorelle Hills%',
  'Targa Palm%',
  'Nour Confort Targa',
  'Nour Prestige Targa',
  'Al Houda Prestige'
])
order by title;
"""
r = subprocess.run(
    ["supabase", "db", "query", "--linked", "-o", "json", sql],
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace",
)
rows = json.loads(r.stdout[r.stdout.find("{") :]).get("rows") or []
for row in rows:
    print(row["t"], "|", row["c"])
