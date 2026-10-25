#!/usr/bin/env python3
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rows = list(
    csv.DictReader(
        (ROOT / "fournisseurs et produits" / "lechantier_products_complete.csv").open(
            encoding="utf-8-sig"
        )
    )
)
out = []
for r in rows:
    if "Coin magique Anthracite" not in (r.get("product_name") or ""):
        continue
    for k, v in r.items():
        if not v:
            continue
        if any(x in k.lower() for x in ["price", "unit", "min", "tech", "offer", "clean", "name"]):
            out.append(f"{k}\t{len(v)}\t{v[:220]!r}")
    break
(ROOT / "_tmp_one.txt").write_text("\n".join(out), encoding="utf-8")
print("lines", len(out))
