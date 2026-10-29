#!/usr/bin/env python3
"""Generate monogram SVGs for profiles missing avatar_url and emit SQL updates."""

from __future__ import annotations

import json
import re
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AVATAR_DIR = ROOT / "frontend" / "public" / "monograms"
OUT_SQL = ROOT / "scripts" / "_apply_monogram_avatars.sql"

COLORS = [
    ("#174f43", "#e8f2ef"),
    ("#1a3a5c", "#e8eef5"),
    ("#5c3d1a", "#f5efe8"),
    ("#3d1a5c", "#f0e8f5"),
    ("#1a5c4a", "#e8f5f1"),
    ("#5c1a2e", "#f5e8ec"),
    ("#2c4a6e", "#e9eef4"),
    ("#4a5c1a", "#f2f5e8"),
]


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def slugify(value: str, fallback: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    text = re.sub(r"-{2,}", "-", text)
    return (text or fallback)[:48]


def initials(name: str) -> str:
    skip = {"el", "al", "ben", "ait", "ou", "de", "du", "la", "le", "et", "and"}
    parts = [p for p in re.split(r"\s+", (name or "").strip()) if p and p.lower() not in skip]
    if not parts:
        return "?"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def write_svg(path: Path, letters: str, fg: str, bg: str) -> None:
    path.write_text(
        f"""<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="{bg}"/>
  <circle cx="128" cy="128" r="96" fill="{fg}"/>
  <text x="128" y="140" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="700" fill="{bg}">{letters}</text>
</svg>
""",
        encoding="utf-8",
    )


def fetch_rows() -> list[dict]:
    q = (
        "SELECT id::text, coalesce(nullif(trim(full_name),''), nullif(trim(username),''), 'Pro') AS name, "
        "coalesce(nullif(trim(username),''), id::text) AS username "
        "FROM public.profiles "
        "WHERE avatar_url IS NULL OR btrim(avatar_url) = '' "
        "OR avatar_url ~* '/avatars/?$' "
        "OR avatar_url ILIKE '%default-pro%' "
        "OR avatar_url ILIKE '%default-pro-avatar%' "
        "OR avatar_url ILIKE '%default.jpeg%' "
        "OR avatar_url ILIKE '%tachrone%' "
        "OR avatar_url ILIKE '%lechantier%' "
        "OR avatar_url ILIKE '%telecontact%' "
        "OR avatar_url ILIKE '%chridari%' "
        "OR avatar_url ILIKE '%kerix%' "
        "OR avatar_url ILIKE '%woomar%' "
        "OR avatar_url ILIKE '%goafricaonline%' "
        "ORDER BY created_at"
    )
    proc = subprocess.run(
        ["supabase", "db", "query", "--linked", "-o", "json", q],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0:
        raise SystemExit(proc.stderr or proc.stdout)
    # CLI wraps JSON; find the rows array
    text = proc.stdout
    start = text.find("{")
    if start < 0:
        raise SystemExit("No JSON in supabase output")
    # may have multiple JSON objects; take first object with rows
    data = json.loads(text[start : text.find("\nA new version") if "\nA new version" in text else None] or text[start:])
    if isinstance(data, dict) and "rows" in data:
        return data["rows"]
    # fallback: parse last {...}
    objs = []
    depth = 0
    buf = []
    for ch in text:
        if ch == "{":
            if depth == 0:
                buf = ["{"]
            else:
                buf.append(ch)
            depth += 1
        elif ch == "}":
            buf.append(ch)
            depth -= 1
            if depth == 0:
                try:
                    objs.append(json.loads("".join(buf)))
                except json.JSONDecodeError:
                    pass
        elif depth > 0:
            buf.append(ch)
    for obj in reversed(objs):
        if isinstance(obj, dict) and "rows" in obj:
            return obj["rows"]
    raise SystemExit("Could not parse rows from supabase output")


def main() -> None:
    rows = fetch_rows()
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    lines = ["-- AUTO monograms for profiles without avatar", "BEGIN;"]
    for i, row in enumerate(rows):
        pid = row["id"]
        name = row.get("name") or "Pro"
        username = slugify(row.get("username") or name, f"pro-{i}")
        fg, bg = COLORS[i % len(COLORS)]
        letters = initials(name)
        fname = f"{username}-{pid[:8]}.svg"
        write_svg(AVATAR_DIR / fname, letters, fg, bg)
        url = f"/monograms/{fname}"
        lines.append(
            f"UPDATE public.profiles SET avatar_url = {sql_str(url)}, updated_at = NOW() "
            f"WHERE id = {sql_str(pid)}::uuid;"
        )
    lines.append("COMMIT;")
    lines.append(f"-- Updated {len(rows)} profiles")
    OUT_SQL.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(rows)} monograms -> {AVATAR_DIR}")
    print(f"SQL -> {OUT_SQL}")


if __name__ == "__main__":
    main()
