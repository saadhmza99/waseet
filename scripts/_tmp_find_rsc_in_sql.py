from pathlib import Path

p = Path("supabase/seeds/seed_products_289.sql")
print("mtime", p.stat().st_mtime, "size", p.stat().st_size)
text = p.read_text(encoding="utf-8")
idx = text.find("dangerouslySetInnerHTML")
print("first idx", idx)
print(text[max(0, idx - 200) : idx + 100])
# which column - look backward for VALUES field position is hard; search nearby keys
snippet = text[max(0, idx - 80) : idx + 40]
print("snippet", snippet)
