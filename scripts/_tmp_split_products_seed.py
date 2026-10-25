#!/usr/bin/env python3
"""Split seed_products_289.sql into chunk files under supabase/seeds/products_chunks/."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / "supabase" / "seeds" / "seed_products_289.sql"
out_dir = ROOT / "supabase" / "seeds" / "products_chunks"
out_dir.mkdir(parents=True, exist_ok=True)
for old in out_dir.glob("*.sql"):
    old.unlink()

text = src.read_text(encoding="utf-8")
# extract INSERT lines
inserts = [line for line in text.splitlines() if line.startswith("INSERT INTO public.products")]
# preamble: DELETE statements
preamble = []
for line in text.splitlines():
    if line.startswith("DELETE FROM"):
        preamble.append(line)

CHUNK = 100
chunks = []
for i in range(0, len(inserts), CHUNK):
    part = inserts[i : i + CHUNK]
    chunks.append(part)

# chunk 0: deletes + first inserts
for idx, part in enumerate(chunks):
    lines = ["-- chunk %d/%d" % (idx + 1, len(chunks)), "BEGIN;", ""]
    if idx == 0:
        lines.extend(preamble)
        lines.append("")
    lines.extend(part)
    lines.append("")
    lines.append("COMMIT;")
    path = out_dir / f"seed_products_289_part{idx + 1:02d}.sql"
    path.write_text("\n".join(lines), encoding="utf-8")
    print(path.name, len(part), "inserts", path.stat().st_size, "bytes")

print("total inserts", len(inserts), "chunks", len(chunks))
