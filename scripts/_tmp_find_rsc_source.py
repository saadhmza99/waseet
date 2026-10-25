import csv
import json
from pathlib import Path

DATA = Path("fournisseurs et produits/lechantier_products_complete.csv")
rows = list(csv.DictReader(DATA.open(encoding="utf-8-sig")))
fields = [
    "description_detailed",
    "description_recrawl",
    "description_original",
    "meta_description_detailed",
    "technical_specifications_detailed",
    "product_images_detailed_json",
    "product_images_recrawl_json",
    "product_images_original_json",
    "all_images_detailed_json",
]
for field in fields:
    hits = sum(1 for r in rows if "dangerouslySetInnerHTML" in (r.get(field) or ""))
    print(field, hits)
# sample image entry
for r in rows:
    raw = r.get("product_images_detailed_json") or ""
    if "dangerouslySetInnerHTML" in raw:
        print("image sample len", len(raw), raw[:200])
        break
    try:
        imgs = json.loads(raw) if raw else []
    except Exception:
        continue
    if imgs and isinstance(imgs[0], str) and len(imgs[0]) > 500:
        print("long url", len(imgs[0]), imgs[0][:150])
        break
