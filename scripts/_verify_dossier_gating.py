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


print(
    "directory sample",
    q(
        """
        select id::text, left(title, 40) as title, open_dossier, dossier_locked,
               jsonb_array_length(coalesce(team, '[]'::jsonb)) as team_n,
               jsonb_array_length(coalesce(partners, '[]'::jsonb)) as partners_n,
               attributes ? 'architecte' as has_arch
        from public.projects_directory
        where featured_promoter
        order by open_dossier desc, created_at desc
        limit 8
        """
    ),
)

print(
    "raw locked goldstar team_n (should still exist in base table)",
    q(
        """
        select id::text, jsonb_array_length(coalesce(team, '[]'::jsonb)) as team_n
        from public.projects
        where id = '31b06f81-f037-57d3-8797-7a5e64b9ceb4'
        """
    ),
)

print(
    "policies",
    q(
        """
        select polname, pg_get_expr(polqual, polrelid) as qual
        from pg_policy
        where polrelid = 'public.projects'::regclass
        order by polname
        """
    ),
)
