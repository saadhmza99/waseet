from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = "avatar_url = 'https://acmatec.ma/\\/\\/acmatec.ma\\/wp-content\\/uploads\\/2025\\/12\\/Logo-acmatec.png'"
NEW = "avatar_url = 'https://simc-maroc.com/contents/exhibitors/pictures/2025/large/qfOh0VApxIdaQT7Zi7jY4fbrfqkqzTsrXPVCNx8a.jpg'"

for rel in [
    "supabase/seeds/seed_lechantier_btp.sql",
    "supabase/seeds/seed_lechantier_btp_chunks/chunk_024.sql",
]:
    path = ROOT / rel
    if not path.exists():
        print("missing", rel)
        continue
    text = path.read_text(encoding="utf-8")
    count = text.count(OLD)
    if count:
        path.write_text(text.replace(OLD, NEW), encoding="utf-8")
    print(f"{rel}: replaced {count}")
