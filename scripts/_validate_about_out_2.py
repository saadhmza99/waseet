# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
out = json.loads((ROOT / "_about_out_2.json").read_text(encoding="utf-8"))
inp = json.loads((ROOT / "_about_batch_2.json").read_text(encoding="utf-8"))
assert len(out) == len(inp) == 98
assert [x["id"] for x in out] == [x["id"] for x in inp]
assert [x["username"] for x in out] == [x["username"] for x in inp]
bios = [x["bio"] for x in out]
assert len(set(bios)) == 98
bad = []
for x in out:
    bio = x["bio"]
    about = x["about_html"]
    plain = re.sub(r"<[^>]+>", " ", about)
    if len(bio) > 220:
        bad.append(("bio_len", x["username"], len(bio)))
    if bio.strip() == plain.strip():
        bad.append(("bio_eq_about", x["username"]))
    for phrase in [
        "Notre objectif est d'offrir un accompagnement personnalisé",
        "Que vous souhaitiez lancer un projet neuf",
    ]:
        if phrase in about:
            bad.append(("boilerplate", x["username"]))
    wc = len(plain.split())
    if not (120 <= wc <= 200):
        bad.append(("wc", x["username"], wc))
raw = (ROOT / "_about_out_2.json").read_bytes()
assert "é".encode("utf-8") in raw
print("entries", len(out))
print("bad", bad)
print("kb", round(len(raw) / 1024, 1))
print("ok")
