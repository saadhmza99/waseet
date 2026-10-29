import re
from pathlib import Path

text = Path("supabase/seeds/seed_bet_agrement_d13_d21.sql").read_text(encoding="utf-8")
bios = re.findall(r"  bio = '((?:''|[^'])*)'", text)
lengths = [len(b.replace("''", "'")) for b in bios]
print("bios", len(bios), "max", max(lengths) if lengths else 0, "over251", sum(1 for n in lengths if n > 251))
