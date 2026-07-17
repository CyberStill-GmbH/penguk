# Database — Naming Conventions

## Tables

- `snake_case`, plural nouns: `users`, `problem_reviews`, `contest_participations`.
- Junction tables are named by combining both related tables, singular
  concept first, in the order the relationship reads naturally:
  `problem_tags`, `contest_problems`, `contest_solved_problems`.

## Columns

- `snake_case`.
- Primary key is always `id` (UUID), regardless of table.
- Foreign keys are named `<singular_referenced_table>_id`:
  `user_id`, `problem_id`, `contest_id`, `problem_review_id`.
- Boolean columns are prefixed `is_` or `has_`: `is_active`, `has_password`.
- Timestamps use `_at` suffix: `created_at`, `updated_at`, `completed_at`,
  `reviewed_at`, `last_sync`.
- Avoid abbreviations except where already standard in the domain
  (`id`, `url`). Spell out otherwise: `retention_level`, not `ret_lvl`.

## Enums / Status-like columns

- Stored as `string` (Postgres `varchar`/`text` with an application-level
  enum, via Prisma), not native Postgres `ENUM` types.

**Why**: native Postgres enums require a schema migration to add a new
value, which is disproportionately costly for status fields expected to
evolve (e.g. adding a new `Integration.status` value). Prisma enums give
type safety at the application layer without that migration cost.

## Indexes and Constraints

- Unique constraint names: `uq_<table>_<column(s)>`, e.g. `uq_accounts_user_id_platform`.
- Index names: `idx_<table>_<column(s)>`, e.g. `idx_problem_reviews_next_review_date`.
- Foreign key constraint names follow Prisma's default convention
  (`<table>_<column>_fkey`) unless a specific name is required for clarity.

## Junction Table Columns

- No surrogate `id` column unless the relationship itself carries
  additional attributes worth referencing directly (e.g. `contest_problems.position`).
- Composite primary key is the pair of foreign keys unless otherwise noted.

## Migration File Naming

See `migration-strategy.md` for how migration files are named and ordered.