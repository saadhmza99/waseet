#!/usr/bin/env python3
"""Fast apply: verified matching covers only (no bulk download)."""
from __future__ import annotations

import json
import subprocess
import sys

# Matching covers verified against project pages / Mubawab listing gallery.
COVERS = {
    # Mubawab residence Majorelle Hills (Al Houda) — real listing gallery Image1
    "Majorelle Hills": "https://www.mubawab-media.com/promotion/4/538F/pictures/h/Image1_81586216.avif",
    # Official AT83 / promoteurimmobilier The Mansions render (matches Chridari villa)
    "The Mansions": "https://promoteurimmobilier.ma/wp-content/uploads/2023/08/4-min.jpg",
}


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
        cover = COVERS.get(title) or gallery_first_chridari(row.get("images"))
        print(title)
        print("  from", (row.get("cover_image") or "")[:100])
        print("  to  ", (cover or "")[:100])
        if not cover:
            print("  miss")
            continue
        update(row["id"], cover)
        print("  ok")

    verify = run_sql(
        """
        select p.title, left(p.cover_image,160) as cover
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
    print("\nVERIFY")
    for v in verify:
        print(f"{v['title']}: {v['cover']}")


if __name__ == "__main__":
    main()
