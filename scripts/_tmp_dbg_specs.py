#!/usr/bin/env python3
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
import sys

sys.path.insert(0, str(ROOT / "scripts"))
from generate_fournisseurs_products_seed import clean_specs, clean_text, extract_specs_from_blob

rows = list(
    csv.DictReader(
        (ROOT / "fournisseurs et produits" / "lechantier_products_complete.csv").open(
            encoding="utf-8-sig"
        )
    )
)
raw = next(
    r.get("minimum_quantity_detailed") or ""
    for r in rows
    if "Coin magique Anthracite" in (r.get("product_name") or "")
)
m = re.search(r"Technical\s+specifications\s*(.*)$", raw, flags=re.I | re.S)
body = m.group(1) if m else ""
lines = [
    f"match={bool(m)} body_len={len(body)}",
    f"body_head={body[:120]!r}",
]
body2 = body.replace("✅", "\n• ").replace("�o.", "\n• ").replace("•", "\n• ")
body2 = re.sub(r"\s+", " ", body2)
body2 = re.sub(r"\s*•\s*", "\n• ", body2).strip(" \n•")
body2 = re.sub(r"(Request a quote|Delivery available|Available suppliers).*$", "", body2, flags=re.I)
lines.append(f"after_strip={body2[:200]!r}")
lines.append(f"clean_specs={clean_specs(body2)!r}")
lines.append(f"clean_text={clean_text(body2)!r}")
lines.append(f"extract={extract_specs_from_blob(raw)!r}")
(ROOT / "_tmp_dbg.txt").write_text("\n".join(lines), encoding="utf-8")
print("ok")
