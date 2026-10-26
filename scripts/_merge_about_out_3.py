# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

base = Path(r"c:\Users\Hamza\Downloads\waseet\scripts")
parts = [
    json.loads((base / f"_about_out_3_p{i}.json").read_text(encoding="utf-8"))
    for i in range(4)
]
out = []
for p in parts:
    out.extend(p)

src = json.loads((base / "_about_batch_3.json").read_text(encoding="utf-8"))
src_ids = [x["id"] for x in src]
out_ids = [x["id"] for x in out]

assert len(out) == 98, f"count={len(out)}"
assert out_ids == src_ids, "id order mismatch"

def plain_words(html: str) -> int:
    t = re.sub(r"<[^>]+>", " ", html)
    t = re.sub(r"\s+", " ", t).strip()
    return len(t.split())

issues = []
bios = set()
abouts = set()
for i, row in enumerate(out):
    bio = row["bio"]
    about = row["about_html"]
    if len(bio) > 220:
        issues.append(f"{i} {row['username']}: bio len {len(bio)}")
    if bio in bios:
        issues.append(f"{i} {row['username']}: duplicate bio")
    bios.add(bio)
    wc = plain_words(about)
    if wc < 100 or wc > 230:
        issues.append(f"{i} {row['username']}: words={wc}")
    # bio should not equal stripped about start
    about_plain = re.sub(r"<[^>]+>", " ", about)
    about_plain = re.sub(r"\s+", " ", about_plain).strip()
    if bio.strip() == about_plain.strip():
        issues.append(f"{i} {row['username']}: bio==about")
    if about in abouts:
        issues.append(f"{i} {row['username']}: duplicate about")
    abouts.add(about)
    # accents check: should contain some French accents somewhere in batch
    for boiler in [
        "accompagnement personnalisé, transparent",
        "Que vous souhaitiez lancer un projet neuf",
    ]:
        if boiler in about:
            issues.append(f"{i} {row['username']}: boilerplate")

# UTF-8 accents present
accented = sum(1 for r in out if any(c in (r["bio"] + r["about_html"]) for c in "éèàùçœÉÀ"))
print(f"entries={len(out)} accented_rows={accented}")
if issues:
    print("ISSUES:")
    for x in issues[:40]:
        print(x)
    print(f"... total issues {len(issues)}")
else:
    print("validation OK")

(base / "_about_out_3.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print("written _about_out_3.json")
