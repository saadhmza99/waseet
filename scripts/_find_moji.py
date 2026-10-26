import json
import subprocess
from pathlib import Path

q = (
    "SELECT id::text AS id, username FROM profiles "
    "WHERE coalesce(about_text,'') LIKE '%' || chr(9500) || '%' "
    "OR coalesce(bio,'') LIKE '%' || chr(9500) || '%'"
)
r = subprocess.run(["supabase", "db", "query", "--linked", "-o", "json", q], capture_output=True)
out = (r.stdout or b"").decode("utf-8", "replace")
if "{" not in out:
    out = (r.stderr or b"").decode("utf-8", "replace")
payload = json.loads(out[out.find("{") :])
Path(__file__).with_name("_moji_rows.json").write_text(
    json.dumps(payload.get("rows", []), ensure_ascii=False, indent=2), encoding="utf-8"
)
print(payload.get("rows", []))
