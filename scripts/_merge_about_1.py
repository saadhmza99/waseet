#!/usr/bin/env python3
"""Merge about parts into _about_out_1.json and validate."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARTS = ROOT / "_about_parts"
BATCH = ROOT / "_about_batch_1.json"
OUT = ROOT / "_about_out_1.json"

GENERIC = [
    "Notre objectif est d’offrir un accompagnement personnalisé",
    "Notre objectif est d'offrir un accompagnement personnalisé",
    "Que vous souhaitiez lancer un projet neuf",
]


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html or "")


def word_count(html: str) -> int:
    return len(strip_tags(html).split())


def main() -> None:
    rows = []
    for name in ("part_a.json", "part_b.json", "part_c.json", "part_d.json"):
        part = json.loads((PARTS / name).read_text(encoding="utf-8"))
        rows.extend(part)

    batch = json.loads(BATCH.read_text(encoding="utf-8"))
    batch_ids = [r["id"] for r in batch]
    out_ids = [r["id"] for r in rows]

    assert len(rows) == 98, f"expected 98, got {len(rows)}"
    assert out_ids == batch_ids, "id order mismatch vs batch"

    bios = set()
    abouts = set()
    issues = []
    for r in rows:
        bio = (r.get("bio") or "").strip()
        about = (r.get("about_html") or "").strip()
        wc = word_count(about)
        if len(bio) > 220:
            issues.append(f"{r['username']}: bio {len(bio)} chars > 220")
        if wc < 100 or wc > 220:
            issues.append(f"{r['username']}: about words={wc} (want ~120-200)")
        for g in GENERIC:
            if g in about or g in bio:
                issues.append(f"{r['username']}: generic boilerplate")
        if bio in bios:
            issues.append(f"{r['username']}: duplicate bio")
        if about in abouts:
            issues.append(f"{r['username']}: duplicate about")
        bios.add(bio)
        abouts.add(about)
        # bio should not equal about plain
        if bio and bio == re.sub(r"\s+", " ", strip_tags(about)).strip()[: len(bio) + 5]:
            issues.append(f"{r['username']}: bio too similar to about")

    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT} entries={len(rows)}")
    if issues:
        print("ISSUES:")
        for i in issues:
            print(" -", i)
    else:
        print("validation OK")


if __name__ == "__main__":
    main()
