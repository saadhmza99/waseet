#!/usr/bin/env python3
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
emails = [
    r["email"].strip().lower()
    for r in csv.DictReader((ROOT / "_tmp_fournisseur_emails.csv").open(encoding="utf-8"))
    if r.get("email")
]
vals = ", ".join("'" + e.replace("'", "''") + "'" for e in emails)
sql = f"""
SELECT u.id, u.email, p.username, p.full_name, p.profession, p.location, p.phone,
       p.website_url,
       (p.avatar_url IS NOT NULL AND length(p.avatar_url) > 0) AS has_avatar,
       (p.about_text IS NOT NULL AND length(p.about_text) > 0) AS has_about,
       (p.cover_photo_url IS NOT NULL AND length(p.cover_photo_url) > 0) AS has_cover,
       (SELECT count(*) FROM public.services s WHERE s.user_id = p.id) AS services_n,
       u.raw_user_meta_data->>'seed_batch' AS seed_batch
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE lower(u.email) IN ({vals})
ORDER BY u.email;
"""
(ROOT / "_tmp_collision_query.sql").write_text(sql, encoding="utf-8")
print(f"querying {len(emails)} emails")
