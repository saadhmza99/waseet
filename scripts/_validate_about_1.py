#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
rows = json.loads((ROOT / "_about_out_1.json").read_text(encoding="utf-8"))
batch = json.loads((ROOT / "_about_batch_1.json").read_text(encoding="utf-8"))


def strip(h: str) -> str:
    return re.sub(r"<[^>]+>", " ", h or "")


def wc(h: str) -> int:
    return len(strip(h).split())


assert [r["id"] for r in rows] == [r["id"] for r in batch]
pads = [r["username"] for r in rows if "En résumé," in r["about_html"]]
print("emergency_pads", len(pads))
print("pads", pads)

bios: set[str] = set()
abouts: set[str] = set()
issues: list[str] = []
for r in rows:
    bio = r["bio"].strip()
    about = r["about_html"].strip()
    w = wc(about)
    if len(bio) > 220:
        issues.append(f"bio long {r['username']} {len(bio)}")
    if w < 120 or w > 200:
        issues.append(f"words {r['username']} {w}")
    if "accompagnement personnalisé" in about or "Que vous souhaitiez lancer" in about:
        issues.append("boilerplate " + r["username"])
    if bio in bios:
        issues.append("dup bio " + r["username"])
    if about in abouts:
        issues.append("dup about " + r["username"])
    bios.add(bio)
    abouts.add(about)

print("issues", len(issues))
for i in issues:
    print(i)
print("count", len(rows))
print("word_range", min(wc(r["about_html"]) for r in rows), max(wc(r["about_html"]) for r in rows))
print("bio_max", max(len(r["bio"]) for r in rows))
print("sample", rows[3]["bio"][:100])
print("accent_ok", "É" in rows[3]["about_html"] or "é" in rows[3]["about_html"])
