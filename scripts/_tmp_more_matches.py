#!/usr/bin/env python3
"""Build SQL to find existing profiles matching fournisseurs by username or website domain."""
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rows = list(csv.DictReader((ROOT / "_tmp_fournisseur_emails.csv").open(encoding="utf-8")))

usernames = []
domains = []
for r in rows:
    name = r["name"]
    # same slugify as seed
    import unicodedata
    text = unicodedata.normalize("NFKD", name or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch)).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:40]
    usernames.append(text)
    web = (r.get("website") or "").strip()
    m = re.search(r"https?://(?:www\.)?([^/]+)", web, re.I)
    if m:
        domains.append(m.group(1).lower())

uvals = ", ".join("'" + u.replace("'", "''") + "'" for u in sorted(set(usernames)))
dvals = ", ".join("'" + d.replace("'", "''") + "'" for d in sorted(set(domains)))
sql = f"""
SELECT p.id, p.username, p.full_name, p.website_url, u.email,
       u.raw_user_meta_data->>'seed_batch' AS seed_batch
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(p.username) IN ({uvals})
   OR EXISTS (
     SELECT 1 FROM unnest(ARRAY[{dvals}]::text[]) d
     WHERE p.website_url ILIKE '%' || d || '%'
   )
ORDER BY p.username;
"""
(ROOT / "_tmp_username_match.sql").write_text(sql, encoding="utf-8")
print("usernames", len(set(usernames)), "domains", len(set(domains)))
