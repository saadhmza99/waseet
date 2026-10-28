#!/usr/bin/env python3
"""Download Majorelle Mubawab gallery + Mansions official, pick exteriors, apply."""
from __future__ import annotations

import json
import subprocess
import sys
import urllib.request
from pathlib import Path

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}
OUT = Path("scripts/_cover_preview")
OUT.mkdir(parents=True, exist_ok=True)

# Majorelle Hills Mubawab promotion 4538 gallery (from live page)
MAJORELLE = [
    f"https://www.mubawab-media.com/promotion/4/538F/pictures/h/Image{n}_{sid}.avif"
    for n, sid in [
        (1, 81586216),
        (2, 81586214),
        (3, 81586215),
        (4, 81586217),
        (5, 81586222),
        (6, 81586223),
        (7, 81586220),
        (8, 81586224),
        (10, 81586218),
        (12, 81586225),
        (13, 81586221),
        (14, 81586226),
        (15, 81586219),
        (16, 81586227),
    ]
]

MANSIONS = [
    "https://promoteurimmobilier.ma/wp-content/uploads/2023/08/4-min.jpg",
    "https://promoteurimmobilier.ma/wp-content/uploads/2023/08/5-2-min.jpg",
    "https://promoteurimmobilier.ma/wp-content/uploads/2023/08/6-min.jpg",
]


def fetch(url: str) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read()
    except Exception as exc:  # noqa: BLE001
        print("  fail", type(exc).__name__, url[-60:])
        return None


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


def q(v: str) -> str:
    return "'" + v.replace("'", "''") + "'"


def gallery_first_chridari(images_json) -> str | None:
    if isinstance(images_json, str):
        try:
            images_json = json.loads(images_json)
        except json.JSONDecodeError:
            return None
    bad = ("villa-ourika", "chatgpt", "google-play", "app-store", "chamnre", "toilette")
    for item in images_json or []:
        u = str(item or "").strip()
        low = u.lower()
        if not u.startswith("http"):
            continue
        if any(b in low for b in bad):
            continue
        if "chridari" in low:
            return u
    return None


def update(project_id: str, cover: str) -> None:
    run_sql(
        f"""
        update projects
        set cover_image = {q(cover)},
            images = case
              when jsonb_typeof(images) = 'array' and jsonb_array_length(images) > 0
                then jsonb_set(images, '{{0}}', to_jsonb({q(cover)}::text), true)
              else jsonb_build_array({q(cover)}::text)
            end,
            updated_at = now()
        where id = {q(project_id)}::uuid
        """
    )


def main() -> None:
    print("download majorelle…")
    maj_ok: list[str] = []
    for i, url in enumerate(MAJORELLE, 1):
        data = fetch(url)
        if not data:
            continue
        path = OUT / f"majorelle_{i}.avif"
        path.write_bytes(data)
        print("  saved", path.name, len(data))
        maj_ok.append(url)

    print("download mansions…")
    man_ok: list[str] = []
    for i, url in enumerate(MANSIONS, 1):
        data = fetch(url)
        if not data or len(data) < 50_000:
            print("  skip short/fail", url)
            continue
        # write partial OK
        path = OUT / f"mansions_pick_{i}.jpg"
        path.write_bytes(data)
        print("  saved", path.name, len(data))
        man_ok.append(url)

    # Prefer Image1 (cover-ish) from Mubawab if present
    maj_cover = maj_ok[0] if maj_ok else None
    man_cover = None
    # Prefer 4-min.jpg — visually matches The Mansions villa render
    for u in man_ok:
        if "4-min.jpg" in u:
            man_cover = u
            break
    if not man_cover and man_ok:
        man_cover = man_ok[0]

    mapping = {
        "Majorelle Hills": maj_cover,
        "The Mansions": man_cover,
    }

    rows = run_sql(
        """
        select p.id::text as id, p.title, p.cover_image, p.images
        from projects p
        join profiles pr on pr.id = p.user_id
        where pr.featured_promoter
          and (
            p.title ilike 'Majorelle Hills%'
            or p.title ilike 'The Mansions%'
            or p.title ilike 'Targa Palm%'
            or p.title ilike 'Al Houda Prestige%'
            or p.title ilike 'Residence Ranamir%'
          )
        order by p.title
        """
    )
    for row in rows:
        title = row["title"]
        print(f"\n{title}")
        cover = mapping.get(title)
        if not cover:
            cover = gallery_first_chridari(row.get("images"))
            print("  restore own", (cover or "")[:100])
        else:
            print("  external", cover[:100])
        if not cover:
            print("  miss")
            continue
        update(row["id"], cover)
        print("  updated")

    # verify
    verify = run_sql(
        """
        select p.title, left(p.cover_image,140) as cover
        from projects p
        join profiles pr on pr.id = p.user_id
        where pr.featured_promoter
          and (
            p.title ilike 'Majorelle Hills%'
            or p.title ilike 'The Mansions%'
            or p.title ilike 'Targa Palm%'
            or p.title ilike 'Al Houda Prestige%'
            or p.title ilike 'Residence Ranamir%'
            or p.title ilike 'Nour %'
          )
        order by p.title
        """
    )
    print("\n=== VERIFY ===")
    for v in verify:
        print(v["title"], "->", v["cover"])


if __name__ == "__main__":
    main()
