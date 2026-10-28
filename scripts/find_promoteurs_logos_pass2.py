#!/usr/bin/env python3
"""Second pass: guess .ma domains + email hosts for promoteurs still on default avatar."""
from __future__ import annotations

import csv
import json
import re
import subprocess
import sys
import unicodedata
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "sifarah data" / "promoteurs_immobiliers.csv"
OUT_SQL = ROOT / "scripts" / "_apply_promoteurs_logos_pass2.sql"
OUT_JSON = ROOT / "scripts" / "_promoteurs_logos_pass2.json"

UA = "Mozilla/5.0 (compatible; SifarahLogoBot/1.0)"
TIMEOUT = 10
WORKERS = 16

SKIP_EMAIL_DOMAINS = {
    "gmail.com",
    "yahoo.com",
    "yahoo.fr",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "sifarah.local",
}


def fold(value: str | None) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def slug_domain_candidates(name: str) -> list[str]:
    text = unicodedata.normalize("NFKD", name or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch)).lower()
    text = re.sub(r"\b(sarl|sa|sas|groupe|group|immobilier|immobiliere|promotion|promoteur|holding|company|co)\b", " ", text)
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    if len(text) < 3:
        return []
    parts = text.split("-")
    cands = [f"{text}.ma", f"www.{text}.ma"]
    if len(parts) >= 2:
        compact = "".join(parts)
        cands.append(f"{compact}.ma")
        cands.append(f"{parts[0]}.ma")
    # unique preserve order
    out: list[str] = []
    for c in cands:
        if c not in out:
            out.append(c)
    return out[:6]


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def probe(url: str) -> str | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA}, method="GET")
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            data = resp.read(300_000)
            final = resp.geturl()
            ctype = (resp.headers.get("Content-Type") or "").lower()
            code = getattr(resp, "status", 200)
        if code >= 400 or len(data) < 100:
            return None
        if ctype.startswith("image/") or any(
            final.lower().split("?", 1)[0].endswith(ext)
            for ext in (".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico")
        ):
            return final
        if "logo.clearbit.com" in final or "cdn.brandfetch.io" in final or "google.com/s2/favicons" in final:
            # clearbit returns 1x1 or html on miss sometimes
            if len(data) < 400 and not ctype.startswith("image/"):
                return None
            return final
        return None
    except Exception:
        return None


def logos_for_host(host: str) -> list[str]:
    host = host.removeprefix("www.")
    return [
        f"https://logo.clearbit.com/{host}",
        f"https://cdn.brandfetch.io/{host}/w/400/h/400",
        f"https://www.google.com/s2/favicons?domain={host}&sz=128",
    ]


def main() -> None:
    apply = "--apply" in sys.argv
    r = subprocess.run(
        [
            "supabase",
            "db",
            "query",
            "--linked",
            "-o",
            "json",
            """
            SELECT p.id, p.full_name, p.website_url, p.avatar_url, p.email
            FROM profiles p
            JOIN internal_categories ic ON ic.id = p.internal_category_id
            WHERE ic.code = '1.2.1'
              AND (p.avatar_url IS NULL OR p.avatar_url LIKE '%default-pro.jpg%')
            """,
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if r.returncode:
        sys.stderr.write(r.stderr or "")
        raise SystemExit(r.returncode)
    profiles = json.loads(r.stdout[r.stdout.find("{") :]).get("rows") or []
    print(f"still default: {len(profiles)}")

    by_id = {}
    by_name = {}
    with CSV_PATH.open(encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            by_id[row["promoteur_id"]] = row
            by_name[fold(row.get("nom") or "")] = row

    def work(p: dict) -> dict:
        csv_row = by_id.get(p["id"]) or by_name.get(fold(p.get("full_name") or "")) or {}
        hosts: list[str] = []
        site = (p.get("website_url") or csv_row.get("site_web") or "").strip()
        if site.startswith("http"):
            h = urllib.parse.urlparse(site).hostname or ""
            if h:
                hosts.append(h)
        email = (p.get("email") or csv_row.get("email") or "").strip().lower()
        if "@" in email:
            dom = email.split("@", 1)[1].split()[0].strip().strip("|")
            if dom and dom not in SKIP_EMAIL_DOMAINS and "." in dom:
                hosts.append(dom)
        for cand in slug_domain_candidates(p.get("full_name") or ""):
            hosts.append(cand)
        # unique
        seen: set[str] = set()
        uniq_hosts: list[str] = []
        for h in hosts:
            h = h.lower().removeprefix("www.")
            if h in seen:
                continue
            seen.add(h)
            uniq_hosts.append(h)

        for host in uniq_hosts[:8]:
            for url in logos_for_host(host):
                ok = probe(url)
                if ok and "google.com/s2/favicons" not in ok:
                    return {
                        "id": p["id"],
                        "name": p.get("full_name"),
                        "host": host,
                        "logo": ok,
                        "source": "clearbit" if "clearbit" in ok else "brandfetch",
                    }
            # favicon last for this host
            fav = probe(logos_for_host(host)[-1])
            if fav:
                return {
                    "id": p["id"],
                    "name": p.get("full_name"),
                    "host": host,
                    "logo": fav,
                    "source": "favicon",
                }
        return {"id": p["id"], "name": p.get("full_name"), "logo": None, "source": None}

    results: list[dict] = []
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futs = [pool.submit(work, p) for p in profiles]
        for i, fut in enumerate(as_completed(futs), 1):
            results.append(fut.result())
            if i % 40 == 0 or i == len(futs):
                hit = sum(1 for x in results if x.get("logo"))
                print(f"  {i}/{len(futs)} hits={hit}")

    OUT_JSON.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    updates = [r for r in results if r.get("logo")]
    # Prefer non-favicon
    updates.sort(key=lambda r: 0 if r.get("source") == "favicon" else 1, reverse=True)

    lines = ["-- pass2 domain-guess logos", f"-- {len(updates)} updates", "BEGIN;"]
    for r in updates:
        lines.append(
            "UPDATE public.profiles SET "
            f"avatar_url = {sql_str(r['logo'])}, updated_at = NOW() "
            f"WHERE id = {sql_str(r['id'])}::uuid "
            "AND (avatar_url IS NULL OR avatar_url LIKE '%default-pro.jpg%');"
        )
    lines.append("COMMIT;")
    OUT_SQL.write_text("\n".join(lines) + "\n", encoding="utf-8")
    from collections import Counter

    print("hits", len(updates), Counter(r.get("source") for r in updates))
    print(f"Wrote {OUT_SQL}")

    if apply and updates:
        r = subprocess.run(
            ["supabase", "db", "query", "--linked", "-f", str(OUT_SQL)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if r.returncode:
            sys.stderr.write(r.stderr or "")
            raise SystemExit(r.returncode)
        print("Applied OK")


if __name__ == "__main__":
    main()
