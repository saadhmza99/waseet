# -*- coding: utf-8 -*-
import json
from pathlib import Path

src = Path(r"c:\Users\Hamza\Downloads\waseet\scripts\_about_batch_3.json")
out_dir = Path(r"c:\Users\Hamza\Downloads\waseet\scripts\_batch3_profiles")
out_dir.mkdir(exist_ok=True)

data = json.loads(src.read_text(encoding="utf-8"))
summary = []
for i, p in enumerate(data):
    specs = p.get("specialties") or []
    if isinstance(specs, list):
        labels = []
        for s in specs:
            if isinstance(s, dict):
                labels.append(s.get("label") or s.get("code") or "")
            else:
                labels.append(str(s))
        specs_str = ", ".join(x for x in labels if x)
    else:
        specs_str = str(specs)

    seed = (p.get("about_seed") or "").replace("\r\n", "\n").strip()
    # strip known boilerplate for cleaner writing source
    for boiler in [
        "Notre objectif est d’offrir un accompagnement personnalisé, transparent et professionnel à chaque étape du projet.",
        "Notre objectif est d'offrir un accompagnement personnalisé, transparent et professionnel à chaque étape du projet.",
        "Que vous souhaitiez lancer un projet neuf, rénover, équiper ou sécuriser un ouvrage,",
    ]:
        seed = seed.replace(boiler, "")

    item = {
        "i": i,
        "id": p.get("id"),
        "username": p.get("username"),
        "full_name": p.get("full_name"),
        "profession": p.get("profession"),
        "location": p.get("location") or "",
        "specialties": specs_str,
        "website_url": p.get("website_url") or "",
        "about_seed": seed[:1200],
        "bio_existing": (p.get("bio") or "")[:300],
    }
    summary.append(item)
    (out_dir / f"{i:03d}.json").write_text(
        json.dumps(item, ensure_ascii=False, indent=2), encoding="utf-8"
    )

Path(r"c:\Users\Hamza\Downloads\waseet\scripts\_about_batch_3_summary.json").write_text(
    json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(f"exported {len(summary)} profiles")
