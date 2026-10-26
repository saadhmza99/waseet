import json
import subprocess
from pathlib import Path

q = """
SELECT p.id::text AS id, p.username, p.full_name, p.profession, p.location, p.website_url,
       p.phone, p.profile_type, left(coalesce(p.bio,''), 251) AS bio,
       left(coalesce(p.about_text,''), 1200) AS about_seed,
       COALESCE((SELECT json_agg(json_build_object('code', ic.code, 'label', ic.detailed_sub_category)
                 ORDER BY pic.is_primary DESC, ic.code)
                 FROM profile_internal_categories pic
                 JOIN internal_categories ic ON ic.id = pic.internal_category_id
                 WHERE pic.profile_id = p.id), '[]'::json) AS specialties
FROM profiles p
WHERE coalesce(p.username,'') <> ''
ORDER BY p.username
"""
r = subprocess.run(["supabase", "db", "query", "--linked", "-o", "json", q], capture_output=True)
out = (r.stdout or b"").decode("utf-8", "replace")
if "{" not in out:
    out = (r.stderr or b"").decode("utf-8", "replace")
payload = json.loads(out[out.find("{") :])
rows = payload["rows"]
Path(__file__).with_name("_profiles_for_ai_about.json").write_text(
    json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(len(rows))
