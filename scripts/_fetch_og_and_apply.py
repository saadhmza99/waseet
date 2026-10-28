#!/usr/bin/env python3
"""Fetch og:image from known promoter project pages and update matching project titles."""
from __future__ import annotations

import json
import re
import subprocess
import sys
import urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# title substring -> project page
PAGES = [
    ("Al Maamora", "https://www.liliskane.com/projet/143/al-maamora-r-1"),
    ("Al Anbra", "https://www.liliskane.com/projet/210/al-anbra"),
    ("Al Araar", "https://www.liliskane.com/projet/94/al-araar"),
    ("Al Araâr", "https://www.liliskane.com/projet/94/al-araar"),
    ("Al Yassamine", "https://www.liliskane.com/projet/77/al-yassamine"),
    ("Rosa Parc", "https://www.allali.ma/rosa-parc"),
]


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


def og_image(url: str) -> str | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
    except Exception as exc:  # noqa: BLE001
        print("fail", url, type(exc).__name__)
        return None
    m = re.search(
        r'<meta[^>]+property=["'']og:image["''][^>]+content=["'']([^"'']+)["'']',
        html,
        flags=re.I,
    )
    if not m:
        m = re.search(
            r'<meta[^>]+content=["'']([^"'']+)["''][^>]+property=["'']og:image["'']',
            html,
            flags=re.I,
        )
    if m:
        return m.group(1).strip()
    imgs = re.findall(r"https?://[^\"']+\.(?:jpe?g|png|webp)", html, flags=re.I)
    for u in imgs:
        low = u.lower()
        if any(x in low for x in ("logo", "favicon", "icon", "chridari")):
            continue
        if "upload" in low or "projet" in low or "media" in low:
            return u.split()[0]
    return None


def main() -> None:
    for title, page in PAGES:
        cover = og_image(page)
        print(title, "->", cover)
        if not cover or "logo" in cover.lower():
            continue
        run_sql(
            f"""
            update projects p
            set cover_image = {sql_quote(cover)},
                images = case
                  when jsonb_typeof(images) = 'array' and jsonb_array_length(images) > 0
                    then jsonb_set(images, '{{0}}', to_jsonb({sql_quote(cover)}::text), true)
                  else jsonb_build_array({sql_quote(cover)}::text)
                end,
                updated_at = now()
            where p.title ilike {sql_quote('%' + title + '%')}
              and exists (
                select 1 from profiles pr
                where pr.id = p.user_id and pr.featured_promoter
              )
            """
        )


if __name__ == "__main__":
    main()
