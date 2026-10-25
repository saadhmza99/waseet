# Seed: 289 professionals + 289 services

Generated from:

- `professionnels_289.csv` / `.json`
- `prestations_services.csv` / `.json`

## What it writes

| Source | Target |
|--------|--------|
| professionnels | `auth.users` + `auth.identities` + `public.profiles` |
| `ice` | `profiles.ice` (shown in Infos) |
| `internal_category_code` | `profiles.internal_category_id` via `internal_categories.code` |
| prestations | `public.services` (`user_id` = `firmId`) |

There is **no** separate `professionals` / `prestations` table in this app schema: pros live in `profiles`, prestations in `services`.

## Placeholder passwords (per pro)

Pattern:

```text
Sifarah-{username}-2026!
```

Examples:

- Castlewood → `Sifarah-castlewood-2026!`
- ALQUIMAROC → `Sifarah-alquimaroc-2026!`

Full list (email, username, password):

`seed_pros_services_289_passwords.csv`

## Regenerate

```bash
python scripts/generate_pros_services_seed.py
```

## Apply on Supabase

1. Ensure taxonomy is already loaded (`categories`, `feed_sub_categories`, `internal_categories` from `schema.sql`).
2. In Supabase SQL Editor (or `psql`), run `seed_pros_services_289.sql`.

Re-running is safe: it deletes the previous `seed_batch = pros_services_289` then re-inserts.

### ICE only (already seeded DB)

If profiles exist but Infos has no ICE:

1. Run `seed_pros_services_289_ice.sql` (adds `profiles.ice` if missing, then backfills).

### Options cleanup (mission lines)

If service details show “Mission nationale / Mission à l'international” under Options:

1. Run `seed_pros_services_289_options_cleanup.sql` (keeps National/International in `missions` only).
