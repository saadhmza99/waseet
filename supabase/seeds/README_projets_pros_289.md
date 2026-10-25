# Seed: projects linked to Tachrone pros

Source: repo-root `projets_pros_289.csv` (Kerix projects × `professionnel_id`).

## What it writes

| Source | Target |
|--------|--------|
| each CSV row | one `public.projects` row |
| `professionnel_id` | `projects.user_id` (FK → `profiles`) |
| `projet_id` | `attributes.source_project_id` (shared Kerix id) |

Same Kerix project can appear once per linked professional so each pro’s portfolio shows it. Discover dedupes via `source_project_id`.

## Regenerate

```bash
python scripts/generate_projets_pros_seed.py
```

## Apply on Supabase

1. Pros seed already applied (`seed_pros_services_289.sql`).
2. Run `seed_projets_pros_289.sql` in the SQL Editor.

Re-running is safe: it deletes `attributes.seed_batch = projets_pros_289` then re-inserts. Rows whose `professionnel_id` has no profile are skipped.
