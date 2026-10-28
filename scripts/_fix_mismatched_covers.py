#!/usr/bin/env python3
"""
1) Restore cover from the project's own Chridari gallery when we overwrote with
   unrelated villa/AI stock.
2) Try Mubawab / official pages for a matching non-Chridari cover when possible.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Projects that got wrong stock (villa / AI) — restore own gallery first.
RESTORE_TITLES = [
    "The Mansions",
    "Majorelle Hills",
    "Targa Palm",
    "Al Houda Prestige",
    "Residence Ranamir Semlalia",
]

# Optional: title -> listing page that should contain matching photos
LOOKUP_PAGES = {
    "Majorelle Hills": [
        "https://www.mubawab.ma/fr/p/4538/residence-majorelle-hills",
    ],
    "Targa Palm": [
        "https://alhoudagroupe.com/palm-targa/",
    ],
    "Al Houda Prestige": [
        "https://chridari.ma/fr/projects/al-houda-prestige-l6dckq",  # may be watermarked; last resort after restore
    ],
    "The Mansions": [
        "https://at83properties.com/",
        "https://chridari.ma/en/projects/the-mansions-villa-marrakesh-htj8a",
    ],
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


def fetch(url: str) -> str | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        return urllib.request.urlopen(req, timeout=35).read().decode("utf-8", "ignore")
    except Exception as exc:  # noqa: BLE001
        print("  fetch fail", url, type(exc).__name__)
        return None


def extract_images(html: str) -> list[str]:
    found = re.findall(r"https?://[^\s\"'<>\\]+?\.(?:jpe?g|png|webp)", html, flags=re.I)
    # also srcset fragments
    clean: list[str] = []
    seen = set()
    for raw in found:
        u = raw.split()[0].rstrip(",)")
        low = u.lower()
        if any(x in low for x in ("logo", "favicon", "icon", "sprite", "placeholder", "1x1")):
            continue
        if u in seen:
            continue
        seen.add(u)
        clean.append(u)
    return clean


def pick_external(images: list[str]) -> str | None:
    # Prefer mubawab / avito / promoter CDNs over chridari
    ranked = sorted(
        images,
        key=lambda u: (
            0 if "chridari" in u.lower() else 1,
            2 if "mubawab-media" in u.lower() or "mubawab" in u.lower() else 0,
            1 if "avito" in u.lower() else 0,
            len(u),
        ),
        reverse=True,
    )
    for u in ranked:
        if "chridari" in u.lower():
            continue
        if re.search(r"\.(jpe?g|webp)$", u.lower()) or "mubawab-media" in u.lower():
            return u
    return None


def gallery_first_http(images_json) -> str | None:
    if isinstance(images_json, str):
        try:
            images_json = json.loads(images_json)
        except json.JSONDecodeError:
            return None
    if not isinstance(images_json, list):
        return None
    for item in images_json:
        u = str(item or "").strip()
        if u.startswith("http"):
            return u
    return None


def update_cover(project_id: str, cover: str) -> None:
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
        select p.id::text as id, p.title, p.cover_image, p.images,
               coalesce(pr.full_name,'') as promoter
        from projects p
        join profiles pr on pr.id = p.user_id
        where pr.featured_promoter
          and (
            """
        + " or ".join(f"p.title ilike {q(t)}" for t in RESTORE_TITLES)
        + """
          )
        order by p.title
        """
    )
    print("targets", len(rows))
    for row in rows:
        title = row["title"]
        print(f"\n{row['promoter']} — {title}")
        print("  current", (row.get("cover_image") or "")[:100])

        # 1) Try external matching page
        chosen = None
        for page in LOOKUP_PAGES.get(title, []):
            html = fetch(page)
            if not html:
                continue
            imgs = extract_images(html)
            print(f"  scraped {page} -> {len(imgs)} imgs")
            chosen = pick_external(imgs)
            if chosen:
                print("  external", chosen[:120])
                break

        # 2) Fall back to project's own gallery (correct project, even if Chridari WM)
        if not chosen:
            own = gallery_first_http(row.get("images"))
            # Prefer a gallery image that isn't the bad villa stock we injected
            if own and "villa-ourika" not in own and "ChatGPT-Image" not in own:
                chosen = own
                print("  restore own gallery", chosen[:120])
            elif own:
                # walk for a better one
                imgs = row.get("images")
                if isinstance(imgs, str):
                    imgs = json.loads(imgs)
                for item in imgs or []:
                    u = str(item)
                    if u.startswith("http") and "villa-ourika" not in u and "ChatGPT-Image" not in u:
                        chosen = u
                        print("  restore own gallery#", chosen[:120])
                        break

        if not chosen:
            print("  miss")
            continue
        update_cover(row["id"], chosen)
        print("  updated")


if __name__ == "__main__":
    main()
