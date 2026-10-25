#!/usr/bin/env python3
"""Build SQL dump of existing profiles for fournisseur matching."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sql = """
SELECT u.id::text AS id,
       lower(u.email) AS email,
       lower(p.username) AS username,
       p.full_name,
       p.website_url,
       u.raw_user_meta_data->>'seed_batch' AS seed_batch
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE COALESCE(u.is_anonymous, false) = false
ORDER BY p.username;
"""
(ROOT / "_tmp_export_pros.sql").write_text(sql, encoding="utf-8")
print("wrote _tmp_export_pros.sql")
