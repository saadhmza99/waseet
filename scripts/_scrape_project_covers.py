#!/usr/bin/env python3
"""Scrape matching cover candidates from official / listing pages."""
from __future__ import annotations

import json
import re
import urllib.request

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}

PAGES = {
    "mansions_fr": "https://promoteurimmobilier.ma/themansions/",
    "mansions_en": "https://promoteurimmobilier.ma/en/themansions/",
    "palm": "https://alhoudagroupe.com/palm-targa/",
    "semlalia": "https://alhoudagroupe.com/semlalia/",
    "majorelle_site": "https://alhoudagroupe.com/majorelle-hills/",
    "majorelle_muba": "https://www.mubawab.ma/fr/p/4538/residence-majorelle-hills",
    "mh_prestige": "https://alhoudagroupe.com/",
}

BAD = (
    "logo",
    "favicon",
    "icon",
    "sprite",
    "placeholder",
    "1x1",
    "google-play",
    "app-store",
    "apple-store",
    "avatar",
    "emoji",
    "chatgpt",
    "removebg",
    "wixstatic",
)


def fetch(url: str) -> str | None:
    try:
        req = urllib.request.Request(url, headers=UA)
        return urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "ignore")
    except Exception as exc:  # noqa: BLE001
        print("FAIL", url, type(exc).__name__, exc)
        return None


def extract(html: str) -> list[str]:
    og = re.findall(
        r'property=["\']og:image["\'][^>]*content=["\']([^"\']+)',
        html,
        flags=re.I,
    )
    og += re.findall(
        r'content=["\']([^"\']+)["\'][^>]*property=["\']og:image',
        html,
        flags=re.I,
    )
    imgs = re.findall(r"https?://[^\s\"'<>]+?\.(?:jpe?g|png|webp)", html, flags=re.I)
    imgs += re.findall(
        r"https?://(?:www\.)?mubawab-media\.com/[^\s\"'<>]+",
        html,
        flags=re.I,
    )
    # data-src / lazy
    imgs += re.findall(
        r'(?:data-src|data-lazy-src|data-original)=["\'](https?://[^"\']+)',
        html,
        flags=re.I,
    )
    imgs += og
    seen: set[str] = set()
    clean: list[str] = []
    for raw in imgs:
        u = raw.split()[0].rstrip(",)")
        low = u.lower()
        if any(b in low for b in BAD):
            continue
        if u in seen:
            continue
        seen.add(u)
        clean.append(u)
    return clean


def main() -> None:
    out: dict[str, list[str]] = {}
    for key, url in PAGES.items():
        print("\n====", key, url)
        html = fetch(url)
        if not html:
            out[key] = []
            continue
        clean = extract(html)
        for u in clean[:50]:
            print(u)
        print("TOTAL", len(clean))
        out[key] = clean
    with open("scripts/_scraped_cover_candidates.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
