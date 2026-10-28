#!/usr/bin/env python3
import json
import subprocess
import sys


def q(sql: str):
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


print("fns", q("SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace AND proname LIKE '%project%'"))
print("open", q("SELECT id::text, title, open_dossier FROM projects WHERE open_dossier"))
print(
    "featured projects sample",
    q(
        """
        SELECT p.id::text, p.title, p.open_dossier,
               jsonb_array_length(coalesce(p.team, '[]'::jsonb)) AS team_n,
               left(coalesce(p.promoter_name, ''), 40) AS promoter
        FROM projects p
        JOIN profiles pr ON pr.id = p.user_id
        WHERE pr.featured_promoter
        ORDER BY p.open_dossier DESC, p.created_at DESC
        LIMIT 8
        """
    ),
)
