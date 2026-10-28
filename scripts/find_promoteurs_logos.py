#!/usr/bin/env python3
"""Find logos online for promoteurs (default avatar → real logo URL).

Sources (in order):
  1. sifarah data/promoteurs_immobiliers.csv logo_url
  2. Scrape site_web HTML (og:image, apple-touch-icon, img[src*=logo], link rel icon)
  3. Brandfetch CDN / Clearbit-style domain logo
  4. Google s2 favicon sz=256 (last resort)

Writes:
  scripts/_promoteurs_logos_found.json
  scripts/_apply_promoteurs_logos.sql

Usage:
  python scripts/find_promoteurs_logos.py
  python scripts/find_promoteurs_logos.py --apply
"""
from __future__ import annotations

import csv
import json
import re
import subprocess
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "sifarah data" / "promoteurs_immobiliers.csv"
OUT_JSON = ROOT / "scripts" / "_promoteurs_logos_found.json"
OUT_SQL = ROOT / "scripts" / "_apply_promoteurs_logos.sql"

DEFAULT_AVATAR_MARKERS = (
    "default-pro.jpg",
    "default-pro-avatar",
    "default.jpeg",
    "kerix-net-logo",
)

AGGREGATOR_HOSTS = {
    "chridari.ma",
    "www.chridari.ma",
    "tachrone.ma",
    "www.tachrone.ma",
    "facebook.com",
    "www.facebook.com",
    "instagram.com",
    "www.instagram.com",
    "linkedin.com",
    "www.linkedin.com",
    "youtube.com",
    "wa.me",
}

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
TIMEOUT = 12
WORKERS = 12


def fold(value: str | None) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def host_of(url: str | None) -> str:
    if not url:
        return ""
    raw = str(url).strip()
    if not raw.startswith("http"):
        raw = "https://" + raw
    try:
        host = (urllib.parse.urlparse(raw).hostname or "").lower()
    except Exception:
        return ""
    return host


def is_http(url: str | None) -> bool:
    return bool(url) and str(url).strip().lower().startswith("http")


def is_default_avatar(url: str | None) -> bool:
    value = (url or "").strip()
    if not value:
        return True
    return any(m in value for m in DEFAULT_AVATAR_MARKERS)


def absolute_url(base: str, href: str) -> str:
    return urllib.parse.urljoin(base, href.strip())


class LogoHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.candidates: list[tuple[int, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        ad = {k.lower(): (v or "") for k, v in attrs}
        if tag == "meta":
            prop = (ad.get("property") or ad.get("name") or "").lower()
            content = ad.get("content") or ""
            if content and prop in ("og:image", "og:image:url", "twitter:image"):
                self.candidates.append((30, content))
        elif tag == "link":
            rel = (ad.get("rel") or "").lower()
            href = ad.get("href") or ""
            if not href:
                return
            if "apple-touch-icon" in rel:
                self.candidates.append((50, href))
            elif "icon" in rel and "shortcut" not in rel:
                self.candidates.append((20, href))
            elif rel == "shortcut icon":
                self.candidates.append((15, href))
        elif tag == "img":
            src = ad.get("src") or ad.get("data-src") or ""
            blob = " ".join(
                [
                    src,
                    ad.get("alt") or "",
                    ad.get("class") or "",
                    ad.get("id") or "",
                    ad.get("title") or "",
                ]
            ).lower()
            if not src:
                return
            if "logo" in blob and "logo-footer" not in blob:
                score = 80
                if src.lower().endswith((".svg", ".png", ".webp")):
                    score += 10
                if "white" in blob or "footer" in blob:
                    score -= 25
                self.candidates.append((score, src))


def http_get(url: str, *, binary: bool = False, max_bytes: int = 2_000_000):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "*/*",
            "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        data = resp.read(max_bytes)
        final = resp.geturl()
        ctype = (resp.headers.get("Content-Type") or "").lower()
        code = getattr(resp, "status", 200)
    if binary:
        return code, final, ctype, data
    return code, final, ctype, data.decode("utf-8", errors="replace")


def url_looks_like_image(url: str, ctype: str = "", body: bytes | None = None) -> bool:
    low = url.lower().split("?", 1)[0]
    if any(low.endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico")):
        return True
    if ctype.startswith("image/"):
        return True
    if body and len(body) > 24:
        if body[:8] == b"\x89PNG\r\n\x1a\n":
            return True
        if body[:3] == b"\xff\xd8\xff":
            return True
        if body[:4] == b"RIFF" and body[8:12] == b"WEBP":
            return True
        head = body[:200].lstrip().lower()
        if head.startswith(b"<svg") or b"<svg" in head[:50]:
            return True
    # Brandfetch / clearbit often omit extension
    if "logo.clearbit.com" in low or "cdn.brandfetch.io" in low or "google.com/s2/favicons" in low:
        return True
    return False


def probe_image(url: str) -> str | None:
    if not is_http(url):
        return None
    # Skip tiny icons / trackers
    if any(x in url.lower() for x in ("1x1", "pixel", "tracking", "spinner", "placeholder")):
        return None
    try:
        code, final, ctype, data = http_get(url, binary=True, max_bytes=400_000)
        if code >= 400:
            return None
        if not url_looks_like_image(final, ctype, data):
            return None
        if len(data) < 80 and "svg" not in ctype and not final.lower().endswith(".svg"):
            return None
        return final
    except Exception:
        return None


def scrape_site_logo(site: str) -> str | None:
    host = host_of(site)
    if not host or host in AGGREGATOR_HOSTS:
        return None
    base = site.strip()
    if not base.startswith("http"):
        base = "https://" + base
    try:
        code, final, ctype, html = http_get(base, max_bytes=900_000)
        if code >= 400 or "text/html" not in ctype and "<html" not in html.lower()[:500]:
            # still try parse
            pass
    except Exception:
        return None

    parser = LogoHTMLParser()
    try:
        parser.feed(html)
    except Exception:
        pass
    ranked = sorted(parser.candidates, key=lambda x: -x[0])
    seen: set[str] = set()
    for score, href in ranked:
        if score < 15:
            continue
        abs_url = absolute_url(final, href)
        if abs_url in seen:
            continue
        seen.add(abs_url)
        # Prefer same-site assets
        if host_of(abs_url) and host_of(abs_url) not in {host, host.removeprefix("www.")} and score < 40:
            continue
        ok = probe_image(abs_url)
        if ok:
            return ok
    return None


def domain_logo_fallbacks(site: str) -> list[str]:
    host = host_of(site)
    if not host or host in AGGREGATOR_HOSTS:
        return []
    host = host.removeprefix("www.")
    return [
        f"https://cdn.brandfetch.io/{host}/w/400/h/400?c=1idbYqQ2qQ",
        f"https://logo.clearbit.com/{host}",
        f"https://www.google.com/s2/favicons?domain={host}&sz=128",
    ]


def load_db_profiles() -> list[dict]:
    r = subprocess.run(
        [
            "supabase",
            "db",
            "query",
            "--linked",
            "-o",
            "json",
            """
            SELECT p.id, p.username, p.full_name, p.website_url, p.avatar_url
            FROM profiles p
            JOIN internal_categories ic ON ic.id = p.internal_category_id
            WHERE ic.code = '1.2.1'
            """,
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if r.returncode:
        sys.stderr.write(r.stderr or r.stdout or "query failed\n")
        raise SystemExit(r.returncode)
    raw = (r.stdout or "").strip()
    data = json.loads(raw[raw.find("{") :])
    return data.get("rows") or []


def load_csv_index() -> tuple[dict[str, dict], dict[str, dict]]:
    by_id: dict[str, dict] = {}
    by_name: dict[str, dict] = {}
    with CSV_PATH.open(encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            pid = (row.get("promoteur_id") or "").strip()
            if pid:
                by_id[pid] = row
            name = fold(row.get("nom") or "")
            if name and name not in by_name:
                by_name[name] = row
    return by_id, by_name


def resolve_for_profile(profile: dict, csv_row: dict | None) -> dict:
    name = profile.get("full_name") or profile.get("username") or ""
    site = (profile.get("website_url") or "").strip()
    csv_logo = ""
    csv_site = ""
    if csv_row:
        csv_logo = (csv_row.get("logo_url") or "").strip()
        csv_site = (csv_row.get("site_web") or "").strip()
        if not site or host_of(site) in AGGREGATOR_HOSTS:
            if csv_site and host_of(csv_site) not in AGGREGATOR_HOSTS:
                site = csv_site

    result = {
        "id": profile["id"],
        "name": name,
        "site": site,
        "logo": None,
        "source": None,
    }

    # 1) CSV logo
    if is_http(csv_logo):
        ok = probe_image(csv_logo)
        if ok:
            result["logo"] = ok
            result["source"] = "csv"
            return result

    # 2) Scrape website
    if site:
        scraped = scrape_site_logo(site)
        if scraped:
            result["logo"] = scraped
            result["source"] = "scrape"
            return result

        # 3) Domain CDNs
        for url in domain_logo_fallbacks(site):
            ok = probe_image(url)
            if ok:
                # Reject google favicon if tiny / generic — still accept as weak
                result["logo"] = ok
                result["source"] = (
                    "brandfetch"
                    if "brandfetch" in ok
                    else "clearbit"
                    if "clearbit" in ok
                    else "favicon"
                )
                if result["source"] != "favicon":
                    return result
                # keep favicon only if nothing else; continue trying others first
        if result["logo"]:
            return result

    return result


def main() -> None:
    apply = "--apply" in sys.argv
    profiles = load_db_profiles()
    by_id, by_name = load_csv_index()
    targets = [p for p in profiles if is_default_avatar(p.get("avatar_url"))]
    already = [p for p in profiles if not is_default_avatar(p.get("avatar_url"))]
    print(f"promoteurs={len(profiles)} need_logo={len(targets)} already_ok={len(already)}")

    found: list[dict] = []
    # Keep existing good logos in report
    for p in already:
        found.append(
            {
                "id": p["id"],
                "name": p.get("full_name"),
                "site": p.get("website_url"),
                "logo": p.get("avatar_url"),
                "source": "existing",
            }
        )

    def work(profile: dict) -> dict:
        csv_row = by_id.get(profile["id"]) or by_name.get(fold(profile.get("full_name") or ""))
        return resolve_for_profile(profile, csv_row)

    t0 = time.time()
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futs = {pool.submit(work, p): p for p in targets}
        done = 0
        for fut in as_completed(futs):
            done += 1
            row = fut.result()
            found.append(row)
            if done % 25 == 0 or done == len(targets):
                ok_n = sum(1 for x in found if x.get("logo") and x.get("source") != "existing")
                print(f"  progress {done}/{len(targets)} newly_found~{ok_n} ({time.time() - t0:.0f}s)")

    OUT_JSON.write_text(json.dumps(found, ensure_ascii=False, indent=2), encoding="utf-8")

    updates = [r for r in found if r.get("logo") and r.get("source") not in (None, "existing")]
    lines = [
        "-- AUTO: promoteur logos from CSV / site scrape / brand CDNs",
        f"-- updates: {len(updates)}",
        "BEGIN;",
    ]
    for r in updates:
        lines.append(
            "UPDATE public.profiles SET "
            f"avatar_url = {sql_str(r['logo'])}, updated_at = NOW() "
            f"WHERE id = {sql_str(r['id'])}::uuid "
            "AND ("
            "avatar_url IS NULL OR btrim(avatar_url) = '' "
            "OR avatar_url LIKE '%default-pro.jpg%' "
            "OR avatar_url LIKE '%default-pro-avatar%'"
            ");"
        )
    lines.append("COMMIT;")
    OUT_SQL.write_text("\n".join(lines) + "\n", encoding="utf-8")

    by_src: dict[str, int] = {}
    for r in found:
        src = r.get("source") or "none"
        if r.get("logo"):
            by_src[src] = by_src.get(src, 0) + 1
        else:
            by_src["none"] = by_src.get("none", 0) + 1
    print(f"Wrote {OUT_JSON}")
    print(f"Wrote {OUT_SQL} ({len(updates)} updates)")
    print("sources:", by_src)

    if apply and updates:
        print("Applying SQL…")
        r = subprocess.run(
            ["supabase", "db", "query", "--linked", "-f", str(OUT_SQL)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if r.returncode:
            sys.stderr.write(r.stderr or r.stdout or "apply failed\n")
            raise SystemExit(r.returncode)
        print("Applied OK")


if __name__ == "__main__":
    main()
