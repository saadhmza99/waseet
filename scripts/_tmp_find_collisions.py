#!/usr/bin/env python3
"""List fournisseur login emails that would collide with existing auth.users."""
import csv
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "fournisseurs et produits"
AGG = {"lechantier.ma", "www.lechantier.ma", "chridari.ma", "www.chridari.ma", "tachrone.ma", "www.tachrone.ma"}


def slugify(value, fallback):
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch)).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return (text or fallback)[:40].strip("-")


def parse_json_list(raw):
    if not raw or not str(raw).strip():
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


def first_str(items):
    for item in items:
        if isinstance(item, str) and item.strip():
            return item.strip()
        if isinstance(item, dict):
            for key in ("url", "value", "phone", "email", "href"):
                if item.get(key):
                    return str(item[key]).strip()
    return ""


def login_email(username, websites, emails_j):
    email_display = first_str(emails_j)
    if email_display and "@" in email_display and " " not in email_display:
        domain = email_display.split("@", 1)[1].lower()
        if domain not in ("https", "wa.me") and "." in domain:
            return email_display.lower()
    website = first_str(websites)
    match = re.search(r"https?://([^/]+)", website or "")
    domain = match.group(1).lower() if match else ""
    if domain and domain not in AGG and "." in domain and domain not in ("wa.me", "https"):
        return f"contact@{domain.removeprefix('www.')}"
    return f"{username}@sifarah.local"


rows = list(csv.DictReader((DATA / "lechantier_suppliers_complete.csv").open(encoding="utf-8-sig")))
out = []
seen = set()
for row in rows:
    name = (row.get("supplier_name") or "").strip()
    if not name or name == "404":
        continue
    username = slugify(name, "x")
    websites = parse_json_list(row.get("website_urls_json"))
    emails_j = parse_json_list(row.get("email_addresses_json"))
    email = login_email(username, websites, emails_j)
    out.append(
        {
            "name": name,
            "email": email,
            "website": first_str(websites),
            "city": (row.get("city") or "").strip(),
            "key": (row.get("supplier_identity_key") or "").strip(),
        }
    )
    seen.add(email)

(ROOT / "_tmp_fournisseur_emails.csv").write_text(
    "name,email,website,city,key\n"
    + "\n".join(f'"{r["name"].replace(chr(34), "")}",{r["email"]},{r["website"]},{r["city"]},{r["key"]}' for r in out),
    encoding="utf-8",
)
print("total", len(out), "unique emails", len(seen))
# within-batch dups
from collections import Counter
c = Counter(r["email"] for r in out)
print("within-batch dups:", [(e, n) for e, n in c.items() if n > 1][:20])
