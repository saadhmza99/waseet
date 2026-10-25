import re
from pathlib import Path

# Check the regenerated master SQL, not just chunks
src = Path("supabase/seeds/seed_products_289.sql")
t = src.read_text(encoding="utf-8")
print("master size", src.stat().st_size)
print("RSC markers in master", t.count("dangerouslySetInnerHTML"), t.count('"$undefined"'), t.count('"children"'))
ins = re.findall(r"INSERT INTO public\.products.*?;", t)
print("n inserts", len(ins), "avg len", sum(len(i) for i in ins) // max(len(ins), 1))
print("sample title area", ins[0][80:250] if ins else "")
# find where junk lives
if ins:
    row = ins[0]
    for label, start in [("gallery", row.find("::jsonb")), ("attrs", row.rfind("::jsonb"))]:
        print(label, start)
    # parse roughly: count between VALUES and end
    print("has children in first", '"children"' in row)
