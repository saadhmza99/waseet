# -*- coding: utf-8 -*-
"""Merge unique about entries and write _about_out_0.json."""
from __future__ import annotations

import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BATCH = ROOT / "_about_batch_0.json"
OUT = ROOT / "_about_out_0.json"
FORBIDDEN = [
    "Notre objectif est d'offrir un accompagnement personnalisé",
    "Notre objectif est d’offrir un accompagnement personnalisé",
    "Que vous souhaitiez lancer un projet neuf",
]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod


def visible_words(html: str) -> int:
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text).strip()
    return len(text.split()) if text else 0


def main() -> int:
    entries = []
    for i in range(4):
        mod = load_module(f"gen{i}", ROOT / f"_about_gen_{i}.py")
        entries.extend(mod.ENTRIES)

    # fix known typo
    for e in entries:
        e["about_html"] = e["about_html"].replace("livaison", "livraison")
        e["bio"] = e["bio"].strip()
        e["about_html"] = e["about_html"].strip()

    batch = json.loads(BATCH.read_text(encoding="utf-8"))
    batch_ids = [p["id"] for p in batch]
    by_id = {e["id"]: e for e in entries}

    missing = [i for i in batch_ids if i not in by_id]
    extra = [i for i in by_id if i not in set(batch_ids)]
    if missing or extra:
        print("MISSING", missing)
        print("EXTRA", extra)
        return 1

    ordered = []
    problems = []
    for p in batch:
        e = by_id[p["id"]]
        if e["username"] != p["username"]:
            problems.append(f"username mismatch {p['username']} vs {e['username']}")
        bio = e["bio"]
        html = e["about_html"]
        wc = visible_words(html)
        if len(bio) > 220:
            problems.append(f"{e['username']}: bio {len(bio)} chars")
        if wc < 120 or wc > 200:
            problems.append(f"{e['username']}: words={wc}")
        for phrase in FORBIDDEN:
            if phrase in html or phrase in bio:
                problems.append(f"{e['username']}: forbidden phrase")
        # bio should not equal stripped about start
        plain = re.sub(r"<[^>]+>", " ", html)
        plain = re.sub(r"\s+", " ", plain).strip()
        if bio.strip() == plain.strip():
            problems.append(f"{e['username']}: bio == about")
        ordered.append(
            {
                "id": e["id"],
                "username": e["username"],
                "bio": bio,
                "about_html": html,
            }
        )

    if problems:
        print("PROBLEMS:")
        for x in problems:
            print(" -", x)
        # still write if only word-count soft issues? No — fix first
        # Print word counts for short/long
        return 2

    OUT.write_text(
        json.dumps(ordered, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(ordered)} entries -> {OUT}")
    # sample accent check
    sample = ordered[0]["about_html"]
    print("accent_ok", "spécialis" in sample or "Située" in sample or "années" in sample or "é" in sample)
    return 0


if __name__ == "__main__":
    sys.exit(main())
