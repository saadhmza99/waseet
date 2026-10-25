import csv
from pathlib import Path

rows = list(csv.DictReader(Path("fournisseurs et produits/lechantier_products_complete.csv").open(encoding="utf-8-sig")))
for r in rows:
    if "Coin magique" in (r.get("product_name") or ""):
        for k, v in r.items():
            if v and "dangerouslySetInnerHTML" in v:
                print("FIELD", k, "len", len(v))
            if v and len(v) > 5000:
                print("BIG", k, len(v), v[:80].replace("\n", " "))
        break
