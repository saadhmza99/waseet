#!/usr/bin/env python3
"""Restore about_text/bio from seed SQL (UTF-8), then polish Infos À propos."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEEDS = ROOT / "supabase" / "seeds"
OUT_SQL = Path(__file__).resolve().parent / "_restore_fix_about.sql"
MAX_BIO = 251


def read_sql_string(text: str, start: int) -> tuple[str | None, int]:
    """Parse a SQL string or NULL starting at start; return (value, index_after)."""
    i = start
    while i < len(text) and text[i] in " \t\r\n":
        i += 1
    if text[i : i + 4].upper() == "NULL":
        return None, i + 4
    if i >= len(text) or text[i] != "'":
        return None, start
    i += 1
    out: list[str] = []
    while i < len(text):
        ch = text[i]
        if ch == "'" and i + 1 < len(text) and text[i + 1] == "'":
            out.append("'")
            i += 2
            continue
        if ch == "'":
            return "".join(out), i + 1
        out.append(ch)
        i += 1
    return None, start


def extract_from_seeds() -> dict[str, dict]:
    found: dict[str, dict] = {}
    where_re = re.compile(r"WHERE\s+id\s*=\s*'([0-9a-f-]{36})'::uuid;", re.I)
    for path in sorted(SEEDS.glob("seed_*.sql")):
        text = path.read_text(encoding="utf-8")
        for wm in where_re.finditer(text):
            pid = wm.group(1)
            # Look backward for nearest UPDATE public.profiles SET
            head = text.rfind("UPDATE public.profiles SET", 0, wm.start())
            if head < 0:
                continue
            block = text[head : wm.start()]
            entry = found.setdefault(pid, {})
            for field in ("about_text", "bio", "full_name", "username"):
                key = f"{field} ="
                idx = block.find(key)
                if idx < 0:
                    key = f"{field}="
                    idx = block.find(key)
                if idx < 0:
                    continue
                rest = block[idx + len(key) :]
                # Fournisseurs seed: CASE WHEN ... THEN '...' ELSE about_text END
                then_idx = rest.upper().find("THEN")
                if rest.lstrip().upper().startswith("CASE") and then_idx >= 0:
                    val, _ = read_sql_string(rest, then_idx + 4)
                else:
                    val, _ = read_sql_string(block, idx + len(key))
                if val is not None:
                    entry[field] = val
    return found


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def strip_generic(text: str) -> str:
    t = (text or "").strip()
    patterns = [
        r"^Nous sommes une entreprise basée à .+? spécialisée en .+?\.\s*",
        r"^Nous sommes une entreprise spécialisée en .+?\.\s*",
        r"^Nous sommes une société basée à .+? spécialisée en .+?\.\s*",
        r"^Nous sommes une entreprise marocaine spécialisée en .+?\.\s*",
        r"^Nous sommes une entreprise basée à .+? spécialisée en .+?\.\s*",
    ]
    for p in patterns:
        t2 = re.sub(p, "", t, count=1, flags=re.I | re.S)
        if t2 != t:
            return t2.strip()
    return t


def normalize_ws(text: str) -> str:
    t = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    t = re.sub(r"[ \t]+\n", "\n", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def bio_from_about(about: str) -> str:
    plain = normalize_ws(about).replace("\n", " ")
    plain = re.sub(r"\s+", " ", plain).strip()
    if len(plain) <= MAX_BIO:
        return plain
    cut = plain[: MAX_BIO - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut.rstrip(".,;:") + "…"


def fetch_specialties() -> dict[str, list[str]]:
    q = (
        "SELECT p.id::text AS id, COALESCE((SELECT json_agg(ic.detailed_sub_category "
        "ORDER BY pic.is_primary DESC, ic.code) FROM profile_internal_categories pic "
        "JOIN internal_categories ic ON ic.id = pic.internal_category_id "
        "WHERE pic.profile_id = p.id), '[]'::json) AS specialties FROM profiles p"
    )
    r = subprocess.run(
        ["supabase", "db", "query", "--linked", "-o", "json", q],
        capture_output=True,
    )
    out = r.stdout.decode("utf-8", errors="replace")
    if "{" not in out:
        out = r.stderr.decode("utf-8", errors="replace")
    payload = json.loads(out[out.find("{") :])
    result: dict[str, list[str]] = {}
    for row in payload.get("rows", []):
        specs = row.get("specialties") or []
        if isinstance(specs, str):
            specs = json.loads(specs)
        result[row["id"]] = [s for s in specs if s]
    return result


def polish_about(raw: str, name: str, specs: list[str]) -> str:
    body = strip_generic(normalize_ws(raw))
    if not body:
        body = f"{name} présente son activité professionnelle sur Sifarah."
    # Drop trailing ellipsis-only leftovers from truncated scrapes
    body = re.sub(r"\n*Domaines d'expertise :.*$", "", body, flags=re.I | re.S).strip()
    if len(specs) > 1:
        label = ", ".join(specs)
        if label.lower() not in body.lower():
            body = body.rstrip() + f"\n\nDomaines d'expertise : {label}."
    return body[:8000]


def main() -> None:
    seeded = extract_from_seeds()
    with_about = sum(1 for v in seeded.values() if v.get("about_text") or v.get("bio"))
    print(f"seed ids={len(seeded)} with about/bio={with_about}")
    specs_map = fetch_specialties()
    print(f"specialty map={len(specs_map)}")

    sql = ["-- Restore about/bio from seeds then polish Infos À propos", "BEGIN;"]
    n = 0
    sample = None
    for pid, fields in seeded.items():
        about = fields.get("about_text")
        bio = fields.get("bio")
        name = fields.get("full_name") or fields.get("username") or "Cette entreprise"
        if not about and not bio:
            continue
        source = about or bio or ""
        specs = specs_map.get(pid, [])
        new_about = polish_about(source, name, specs)
        new_bio = bio_from_about(new_about)
        sql.append(
            "UPDATE public.profiles SET "
            f"about_text = {sql_str(new_about)}, "
            f"bio = {sql_str(new_bio)}, "
            "updated_at = NOW() "
            f"WHERE id = '{pid}'::uuid;"
        )
        n += 1
        if sample is None:
            sample = (fields.get("username"), new_about[:180])

    sql.append("COMMIT;")
    OUT_SQL.write_text("\n".join(sql) + "\n", encoding="utf-8")
    print(f"updates={n} wrote {OUT_SQL}")
    if sample:
        Path(__file__).resolve().parent.joinpath("_about_sample_out.txt").write_text(
            f"{sample[0]}\n{sample[1]}\n", encoding="utf-8"
        )


if __name__ == "__main__":
    main()
