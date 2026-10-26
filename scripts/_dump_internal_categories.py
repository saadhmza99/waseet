#!/usr/bin/env python3
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
out = ROOT / "_internal_categories.json"
proc = subprocess.run(
    [
        "supabase",
        "db",
        "query",
        "--linked",
        "SELECT id, code, detailed_sub_category FROM internal_categories ORDER BY id;",
    ],
    capture_output=True,
    text=True,
    encoding="utf-8",
)
text = (proc.stdout or "") + "\n" + (proc.stderr or "")
match = re.search(r"\{[^{}]*\"rows\"\s*:\s*\[[\s\S]*?\]\s*(?:,\s*\"warning\"[\s\S]*?)?\}", text)
if not match:
    # broader fallback
    match = re.search(r"\{\s*\"boundary\".*?\}\s*$", text, re.S)
if not match:
    raise SystemExit("Could not parse supabase JSON:\n" + text[:800])
obj = json.loads(match.group(0))
rows = obj["rows"]
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"wrote {out} count={len(rows)}")
