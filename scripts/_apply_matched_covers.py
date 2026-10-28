#!/usr/bin/env python3
"""Apply verified matching covers (no villa-on-residence / no AI stock / no badges)."""
from __future__ import annotations

import json
import subprocess
import sys
import urllib.request

UA = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}

# Prefer project-specific listing / official photos over ChatGPT / wrong villas.
COVERS: dict[str, list[str]] = {
    # Real Majorelle Hills gallery on Mubawab (promotion 4538)
    "Majorelle Hills": [
        "https://www.mubawab-media.com/promotion/4/538F/pictures/h/Image1_81586216.jpg",
        "https://www.mubawab-media.com/promotion/4/538F/pictures/h/Image1_81586216.avif",
        "https://www.mubawab-media.com/promotion/4/538F/pictures/h/Image2_81586214.avif",
    ],
    # The Mansions page hero on promoteurimmobilier (not villa-ourika)
    "The Mansions": [
        "https://promoteurimmobilier.ma/wp-content/uploads/2023/08/5-2-min.jpg",
        "https://promoteurimmobilier.ma/wp-content/uploads/2023/08/4-min.jpg",
        "https://promoteurimmobilier.ma/wp-content/uploads/2023/08/6-min.jpg",
    ],
    # Official Al Houda interiors for Palm Targa (project-specific; not villa stock)
    # Prefer restoring own gallery first via SQL fallback below.
    "Targa Palm": [],
    "Al Houda Prestige": [],
    "Residence Ranamir Semlalia": [],
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


def url_ok(url: str) -> bool:
    try:
        req = urllib.request.Request(url, method="HEAD", headers=UA)
        resp = urllib.request.urlopen(req, timeout=25)
        ct = (resp.headers.get("Content-Type") or "").lower()
        return resp.status < 400 and ("image" in ct or url.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".avif")))
    except Exception:  # noqa: BLE001
        # some CDNs reject HEAD — try GET range
        try:
            req = urllib.request.Request(url, headers={**UA, "Range": "bytes=0-64"})
            resp = urllib.request.urlopen(req, timeout=25)
            return resp.status < 400
        except Exception:  # noqa: BLE001
            return False


def pick_working(candidates: list[str]) -> str | None:
    for u in candidates:
        print("  check", u[:110])
        if url_ok(u):
            print("  ok")
            return u
        print("  dead")
    return None


def gallery_own(images_json) -> str | None:
    if isinstance(images_json, str):
        try:
            images_json = json.loads(images_json)
        except json.JSONDecodeError:
            return None
    if not isinstance(images_json, list):
        return None
    bad = ("villa-ourika", "chatgpt", "google-play", "app-store", "CHAMNRE", "TOILETTE")
    for item in images_json:
        u = str(item or "").strip()
        if not u.startswith("http"):
            continue
        low = u.lower()
        if any(b.lower() in low for b in bad):
            continue
        # prefer chridari project media (known matching)
        if "chridari" in low or "media." in low:
            return u
    for item in images_json:
        u = str(item or "").strip()
        if u.startswith("http") and "villa-ourika" not in u.lower() and "chatgpt" not in u.lower():
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
    titles = list(COVERS.keys())
    rows = run_sql(
        """
        select p.id::text as id, p.title, p.cover_image, p.images
        from projects p
        join profiles pr on pr.id = p.user_id
        where pr.featured_promoter
          and (
        """
        + " or ".join(f"p.title ilike {q(t)}" for t in titles)
        + """
          )
        order by p.title
        """
    )
    print("targets", len(rows))
    for row in rows:
        title = row["title"]
        print(f"\n{title}")
        print("  was", (row.get("cover_image") or "")[:110])
        chosen = pick_working(COVERS.get(title) or [])
        if not chosen:
            chosen = gallery_own(row.get("images"))
            if chosen:
                print("  restore own", chosen[:110])
        if not chosen:
            print("  miss")
            continue
        update(row["id"], chosen)
        print("  updated ->", chosen[:110])


if __name__ == "__main__":
    main()
