import json
import subprocess
from pathlib import Path

q = (
    "SELECT username, left(about_text,160) AS a, left(bio,100) AS b "
    "FROM profiles WHERE username IN "
    "('castlewood','geomatrix','anir-carreaux','aifox-services','6po-industrie','ags-groupe') "
    "ORDER BY username"
)
r = subprocess.run(["supabase", "db", "query", "--linked", "-o", "json", q], capture_output=True)
out = r.stdout.decode("utf-8", errors="replace")
if "{" not in out:
    out = r.stderr.decode("utf-8", errors="replace")
payload = json.loads(out[out.find("{") :])
Path(__file__).with_name("_verify_about.txt").write_text(
    json.dumps(payload["rows"], ensure_ascii=False, indent=2), encoding="utf-8"
)
print("ok", len(payload["rows"]))
