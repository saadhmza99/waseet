#!/usr/bin/env python3
"""
Replace Chridari covers by scraping promoter sites + Moroccan listing portals
(Avito Immoneuf, Agenz, Mubawab, lechantier) using the project title.

No watermark removal — only replace with external non-Chridari images.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
BLOCK = ("chridari", "facebook", "fbcdn", "instagram", "tiktok", "youtube", "ytimg", "gstatic", "google.")
ALLOW_HINTS = (
    ".ma/",
    "immoneuf.avito.ma",
    "avito.ma",
    "agenz.ma",
    "mubawab",
    "lechantier.ma",
    "wp-content/uploads",
    "cloudinary",
    "supabase.co/storage",
)


class ImgCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: list[str] = []

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)
        if tag == "img":
            for key in ("src", "data-src", "data-lazy-src", "data-original", "data-url"):
                val = (ad.get(key) or "").strip()
                if val:
                    self.urls.append(val)
        if tag == "meta" and ad.get("property") in {"og:image", "twitter:image"}:
            val = (ad.get("content") or "").strip()
            if val:
                self.urls.append(val)
        # JSON-LD / srcset leftovers often appear as absolute URLs in attributes
        for key, val in attrs:
            if val and isinstance(val, str) and "http" in val and any(ext in val.lower() for ext in (".jpg", ".jpeg", ".png", ".webp")):
                for part in re.findall(r"https?://[^\s\"'<>]+", val):
                    self.urls.append(part)


def run_sql(sql: str) -> list[dict]:
    r = subprocess.run(
        ["supabase", "db", "query", "--linked", "-o", "json", sql],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if r.returncode:
        sys.stderr.write(r.stderr or r.stdout or "")
        raise SystemExit(r.returncode)
    raw = r.stdout
    return json.loads(raw[raw.find("{") :]).get("rows") or []


def sql_quote(v: str) -> str:
    return "'" + v.replace("'", "''") + "'"


def fetch(url: str, timeout: int = 25) -> bytes | None:
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except Exception:
        return None


def abs_url(u: str, base: str) -> str:
    u = u.strip().split("?")[0]
    if u.startswith("//"):
        return "https:" + u
    if u.startswith("/"):
        return urllib.parse.urljoin(base, u)
    return u


def url_ok(u: str) -> bool:
    low = u.lower()
    if not low.startswith("http"):
        return False
    if any(b in low for b in BLOCK):
        return False
    if not any(h in low for h in ALLOW_HINTS):
        return False
    if any(x in low for x in ("logo", "favicon", "icon", "avatar", "sprite", "1x1", "pixel")):
        return False
    if re.search(r"\.(svg)(?:$|\?)", low):
        return False
    return True


def extract_images(html: bytes, base: str) -> list[str]:
    # Also pull bare image URLs from HTML/JSON payloads.
    text = html.decode("utf-8", errors="ignore")
    found = re.findall(r"https?://[^\s\"'<>\\]+?\.(?:jpe?g|png|webp)", text, flags=re.I)
    parser = ImgCollector()
    try:
        parser.feed(text)
    except Exception:
        pass
    out: list[str] = []
    for raw in parser.urls + found:
        u = abs_url(raw, base)
        if url_ok(u):
            out.append(u)
    # dedupe keep order
    seen = set()
    uniq = []
    for u in out:
        if u not in seen:
            seen.add(u)
            uniq.append(u)
    return uniq


def title_tokens(title: str) -> list[str]:
    stop = {"residence", "residences", "projet", "project", "marrakech", "casa", "casablanca"}
    tokens = [t for t in re.split(r"[^a-z0-9]+", title.lower()) if len(t) > 3 and t not in stop]
    return tokens[:6]


def score(u: str, title: str) -> int:
    low = u.lower()
    s = 0
    tokens = title_tokens(title)
    hits = sum(1 for t in tokens if t in low)
    if tokens and hits == 0:
        return -100  # reject unrelated assets (e.g. generic lechantier portfolio)
    s += hits * 12
    for host in ("wp-content/uploads", "immoneuf", "agenz", "mubawab", "avito", "groupealnour", "liliskane", "alhouda"):
        if host in low:
            s += 8
    if "lechantier.ma/uploads/pro/" in low and hits < 1:
        s -= 50
    if re.search(r"\.(jpe?g|webp)$", low):
        s += 3
    if any(x in low for x in ("thumb", "small", "150x", "100x", "icon", "logo")):
        s -= 12
    return s


def verify_image(u: str) -> bool:
    data = fetch(u, timeout=18)
    if not data or len(data) < 12000:
        return False
    return data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n" or b"WEBP" in data[:20] or len(data) > 40000


def pick(candidates: list[str], title: str) -> str | None:
    ranked = [u for u in sorted(set(candidates), key=lambda u: score(u, title), reverse=True) if score(u, title) > 0]
    for u in ranked[:12]:
        if verify_image(u):
            return u
    return None


def slugify(text: str) -> str:
    text = text.lower()
    repl = str.maketrans("àáâãäåèéêëìíîïòóôõöùúûüýÿç", "aaaaaaeeeeiiiiooooouuuuyyc")
    text = text.translate(repl)
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text


def search_pages(title: str, promoter: str, website: str) -> list[str]:
    q = urllib.parse.quote_plus(f"{title} {promoter}".strip())
    tq = urllib.parse.quote_plus(title)
    pages = [
        f"https://immoneuf.avito.ma/fr/s/maroc/immobilier-neuf?q={tq}",
        f"https://www.mubawab.ma/fr/s/{urllib.parse.quote(title)}",
        f"https://agenz.ma/fr/search?q={tq}",
        f"https://lechantier.ma/?s={tq}",
        f"https://www.google.com/search?q={q}+immobilier+Marrakech&tbm=isch",  # may be blocked; ignored if so
    ]
    if website and website.startswith("http") and "chridari" not in website:
        pages.insert(0, website.rstrip("/") + "/")
        # Common project listing paths
        host = website.rstrip("/")
        pages.extend(
            [
                f"{host}/projects/",
                f"{host}/projets/",
                f"{host}/nos-projets/",
                f"{host}/realisations/",
                f"{host}/project/{slugify(title)}/",
                f"{host}/projects/{slugify(title)}/",
                f"{host}/projet/{slugify(title)}/",
            ]
        )
    return pages


def find_cover(title: str, promoter: str, website: str) -> str | None:
    candidates: list[str] = []
    for page in search_pages(title, promoter, website):
        html = fetch(page)
        if not html:
            continue
        imgs = extract_images(html, page)
        # Keep only reasonably scored matches when many images
        if len(imgs) > 30:
            imgs = sorted(imgs, key=lambda u: score(u, title), reverse=True)[:20]
        candidates.extend(imgs)
        time.sleep(0.35)
    return pick(candidates, title)


def update_cover(project_id: str, cover: str) -> None:
    run_sql(
        f"""
        update projects
        set cover_image = {sql_quote(cover)},
            images = case
              when jsonb_typeof(images) = 'array' and jsonb_array_length(images) > 0
                then jsonb_set(images, '{{0}}', to_jsonb({sql_quote(cover)}::text), true)
              else jsonb_build_array({sql_quote(cover)}::text)
            end,
            updated_at = now()
        where id = {sql_quote(project_id)}::uuid
        """
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--from-json", default="scripts/_wm_projects.json")
    args = ap.parse_args()

    path = Path(args.from_json)
    if path.exists():
        rows = json.loads(path.read_text(encoding="utf-8"))
    else:
        rows = run_sql(
            """
            select p.id::text as id, p.title,
              coalesce(pr.full_name,'') as promoter,
              coalesce(pr.website_url,'') as website
            from projects p
            join profiles pr on pr.id=p.user_id
            where pr.featured_promoter
              and (coalesce(p.cover_image,'') ilike '%chridari%'
                   or coalesce(p.images::text,'') ilike '%chridari.ma%')
            order by pr.full_name, p.title
            """
        )
    if args.limit:
        rows = rows[: args.limit]

    print(f"projects={len(rows)}")
    found = miss = 0
    mapping = []
    for i, row in enumerate(rows, 1):
        title = row["title"]
        print(f"[{i}/{len(rows)}] {row['promoter']} — {title}", flush=True)
        cover = find_cover(title, row.get("promoter") or "", row.get("website") or "")
        if not cover:
            miss += 1
            print("  miss", flush=True)
            continue
        found += 1
        print(f"  -> {cover}", flush=True)
        mapping.append({"id": row["id"], "title": title, "cover": cover})
        if not args.dry_run:
            update_cover(row["id"], cover)
    Path("scripts/_wm_cover_replacements.json").write_text(
        json.dumps(mapping, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"done found={found} miss={miss}")


if __name__ == "__main__":
    main()
