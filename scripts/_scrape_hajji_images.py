#!/usr/bin/env python3
"""Scrape Hajji & Associés (ahlo.ma) for usable post photos."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}
PAGES = [
    "https://ahlo.ma/",
    "https://ahlo.ma/en/home/",
    "https://ahlo.ma/notre-equipe/",
    "https://ahlo.ma/a-propos/",
    "https://ahlo.ma/activites/",
    "https://ahlo.ma/en/our-team/amin-hajji/",
    "https://www.bcgsearch.com/bestlawfirms/KrMEw/Hajji-and-Associes/photos",
]
BAD = ("logo", "favicon", "icon", "sprite", "placeholder", "1x1", "emoji", "gravatar", "wp-include")


def fetch(url: str) -> str | None:
    try:
        req = urllib.request.Request(url, headers=UA)
        return urllib.request.urlopen(req, timeout=40).read().decode("utf-8", "ignore")
    except Exception as exc:  # noqa: BLE001
        print("FAIL", url, type(exc).__name__)
        return None


def extract(html: str) -> list[str]:
    found = re.findall(r"https?://[^\s\"'<>]+?\.(?:jpe?g|png|webp)", html, flags=re.I)
    found += re.findall(r'(?:src|data-src|content)=["\']([^"\']+\.(?:jpe?g|png|webp)[^"\']*)', html, flags=re.I)
    clean: list[str] = []
    seen: set[str] = set()
    for raw in found:
        u = raw.split()[0].rstrip(",)")
        if u.startswith("//"):
            u = "https:" + u
        if u.startswith("/"):
            u = "https://ahlo.ma" + u
        low = u.lower()
        if any(b in low for b in BAD):
            continue
        if u in seen:
            continue
        seen.add(u)
        clean.append(u)
    return clean


def head_ok(url: str) -> bool:
    try:
        req = urllib.request.Request(url, method="HEAD", headers=UA)
        resp = urllib.request.urlopen(req, timeout=20)
        ct = (resp.headers.get("Content-Type") or "").lower()
        return resp.status < 400 and ("image" in ct or url.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))
    except Exception:  # noqa: BLE001
        try:
            req = urllib.request.Request(url, headers={**UA, "Range": "bytes=0-64"})
            resp = urllib.request.urlopen(req, timeout=20)
            return resp.status < 400
        except Exception:  # noqa: BLE001
            return False


def main() -> None:
    all_imgs: list[str] = []
    for page in PAGES:
        print("\n====", page)
        html = fetch(page)
        if not html:
            continue
        imgs = extract(html)
        print("found", len(imgs))
        for u in imgs[:25]:
            print(" ", u)
        all_imgs.extend(imgs)
    # unique preserve order
    uniq: list[str] = []
    seen: set[str] = set()
    for u in all_imgs:
        if u in seen:
            continue
        seen.add(u)
        uniq.append(u)
    ok = [u for u in uniq if head_ok(u)]
    print("\nOK", len(ok), "/", len(uniq))
    for u in ok:
        print(u)
    Path("scripts/_hajji_images_found.json").write_text(
        json.dumps({"all": uniq, "ok": ok}, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
