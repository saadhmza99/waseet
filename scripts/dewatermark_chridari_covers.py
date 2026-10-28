#!/usr/bin/env python3
"""
Remove Chridari watermarks from featured promoter project covers,
rehost cleaned JPEGs on Supabase Storage, and update projects rows.

Usage:
  python scripts/dewatermark_chridari_covers.py           # covers only
  python scripts/dewatermark_chridari_covers.py --gallery  # covers + gallery urls
  python scripts/dewatermark_chridari_covers.py --limit 5
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from simple_lama_inpainting import SimpleLama

PROJECT_REF = "auusinntfgmoneqhjcbe"
STORAGE_PUBLIC = f"https://{PROJECT_REF}.supabase.co/storage/v1/object/public/images/projects"
STORAGE_UPLOAD = f"https://{PROJECT_REF}.supabase.co/storage/v1/object/images/projects"
UA = "Mozilla/5.0 (compatible; SifarahDewatermark/1.0)"


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


def service_role_key() -> str:
    env = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if env:
        return env
    r = subprocess.run(
        ["supabase", "projects", "api-keys", f"--project-ref={PROJECT_REF}", "-o", "env"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if r.returncode:
        raise SystemExit(r.stderr or "failed to fetch api keys")
    for line in (r.stdout or "").splitlines():
        if line.startswith("SUPABASE_SERVICE_ROLE_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("SUPABASE_SERVICE_ROLE_KEY not found")


def prefer_large(url: str) -> str:
    return re.sub(r"-medium(\.(?:jpg|jpeg|png|webp))$", r"-large\1", url, flags=re.I)


def download(url: str) -> bytes:
    req = urllib.request.Request(prefer_large(url), headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return resp.read()
    except urllib.error.HTTPError:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=45) as resp:
            return resp.read()


def watermark_mask(bgr: np.ndarray) -> np.ndarray:
    """Soft center plate over the classic Chridari logo + wordmark."""
    h, w = bgr.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    mask[int(h * 0.40) : int(h * 0.60), int(w * 0.20) : int(w * 0.80)] = 255
    mask = cv2.GaussianBlur(mask, (41, 41), 0)
    _, mask = cv2.threshold(mask, 14, 255, cv2.THRESH_BINARY)
    return mask


def clean_bytes(raw: bytes, lama: SimpleLama) -> bytes:
    arr = np.frombuffer(raw, dtype=np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("decode failed")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    mask = watermark_mask(bgr)
    out = lama(Image.fromarray(rgb), Image.fromarray(mask))
    buf = io.BytesIO()
    out.convert("RGB").save(buf, format="JPEG", quality=90, optimize=True)
    return buf.getvalue()


def upload(key: str, object_name: str, data: bytes) -> str:
    url = f"{STORAGE_UPLOAD}/{object_name}"
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": "image/jpeg",
            "x-upsert": "true",
        },
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        resp.read()
    return f"{STORAGE_PUBLIC}/{object_name}"


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def object_name_for(url: str) -> str:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:24]
    return f"chridari-clean/{digest}.jpg"


def parse_images(raw) -> list[str]:
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            return []
    if not isinstance(raw, list):
        return []
    return [str(u or "").strip() for u in raw]


def collect_jobs(include_gallery: bool) -> list[tuple[str, str, str]]:
    """Return list of (project_id, field, url) where field is cover|gallery:<idx>."""
    rows = run_sql(
        """
        select p.id::text as id, p.cover_image, p.images
        from projects p
        join profiles pr on pr.id = p.user_id
        where pr.featured_promoter
          and (
            coalesce(p.cover_image, '') ilike '%chridari.ma%'
            or coalesce(p.cover_image, '') ilike '%chridari-clean%'
            or coalesce(p.images::text, '') ilike '%chridari.ma%'
          )
        order by p.open_dossier desc, p.created_at desc
        """
    )
    jobs: list[tuple[str, str, str]] = []
    for row in rows:
        pid = row["id"]
        cover = (row.get("cover_image") or "").strip()
        images = parse_images(row.get("images"))
        if "chridari.ma" in cover:
            jobs.append((pid, "cover", cover))
        elif "chridari-clean" in cover:
            # Re-clean from the first original gallery asset when cover was already swapped.
            src = next((u for u in images if "chridari.ma" in u), "")
            if src:
                jobs.append((pid, "cover", src))
        if include_gallery:
            for idx, u in enumerate(images):
                if "chridari.ma" in u:
                    jobs.append((pid, f"gallery:{idx}", u))
    return jobs


def apply_replacements(replacements: dict[tuple[str, str], str]) -> None:
    # Group by project
    by_project: dict[str, dict[str, str]] = {}
    for (pid, field), new_url in replacements.items():
        by_project.setdefault(pid, {})[field] = new_url

    for pid, fields in by_project.items():
        sets: list[str] = []
        if "cover" in fields:
            sets.append(f"cover_image = {sql_quote(fields['cover'])}")
        gallery_updates = {int(k.split(":")[1]): v for k, v in fields.items() if k.startswith("gallery:")}
        if gallery_updates:
            # Pull current images and patch indices in Python via SQL jsonb_set chain.
            current = run_sql(f"select images from projects where id = {sql_quote(pid)}::uuid")
            images = current[0]["images"] if current else []
            if isinstance(images, str):
                images = json.loads(images)
            if not isinstance(images, list):
                images = []
            for idx, url in gallery_updates.items():
                if 0 <= idx < len(images):
                    images[idx] = url
            sets.append(f"images = {sql_quote(json.dumps(images))}::jsonb")
        if not sets:
            continue
        sets.append("updated_at = now()")
        run_sql(f"update projects set {', '.join(sets)} where id = {sql_quote(pid)}::uuid")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gallery", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--skip-upload", action="store_true", help="clean only, write local map")
    args = parser.parse_args()

    jobs = collect_jobs(include_gallery=args.gallery)
    # Deduplicate by source URL but keep all project fields that need update.
    if args.limit:
        jobs = jobs[: args.limit]

    print(f"jobs={len(jobs)} gallery={args.gallery}")
    key = "" if args.skip_upload else service_role_key()
    lama = SimpleLama()
    cache: dict[str, str] = {}  # source url -> cleaned public url
    replacements: dict[tuple[str, str], str] = {}
    failed = 0

    for i, (pid, field, url) in enumerate(jobs, 1):
        print(f"[{i}/{len(jobs)}] {field} {pid[:8]}…", flush=True)
        try:
            if url in cache:
                replacements[(pid, field)] = cache[url]
                continue
            raw = download(url)
            cleaned = clean_bytes(raw, lama)
            if args.skip_upload:
                out = Path("scripts/_wm_probe/batch") / f"{hashlib.sha1(url.encode()).hexdigest()[:16]}.jpg"
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_bytes(cleaned)
                public = str(out)
            else:
                public = upload(key, object_name_for(url), cleaned)
            cache[url] = public
            replacements[(pid, field)] = public
            print(f"  -> {public}", flush=True)
        except Exception as exc:  # noqa: BLE001
            failed += 1
            print(f"  FAIL {type(exc).__name__}: {exc}", flush=True)

    if replacements and not args.skip_upload:
        apply_replacements(replacements)
        print(f"updated projects fields={len(replacements)} failed={failed}")
    else:
        print(f"done local/cache={len(cache)} failed={failed}")


if __name__ == "__main__":
    main()
