import json
import subprocess
from pathlib import Path

q = (
    "SELECT count(*)::int AS moji FROM profiles "
    "WHERE coalesce(about_text,'') LIKE '%' || E'\\u251C' || '%' "
    "   OR coalesce(bio,'') LIKE '%' || E'\\u251C' || '%'"
)
r = subprocess.run(["supabase", "db", "query", "--linked", "-o", "json", q], capture_output=True)
out = (r.stdout or b"").decode("utf-8", "replace")
if "{" not in out:
    out = (r.stderr or b"").decode("utf-8", "replace")
print(out[out.find("{") : out.rfind("}") + 1])
