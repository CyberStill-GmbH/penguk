# Database — Migration Strategy

## Tooling

Prisma Migrate is the single source of truth for schema changes
(ADR-0004). The Prisma schema file is the canonical schema definition;
migrations are generated from it, never hand-written from scratch.

## Workflow

1. A schema change is made in `schema.prisma`.
2. `prisma migrate dev` generates a timestamped migration file locally
   and applies it to the developer's local database.
3. The migration file is committed alongside the code change that
   requires it, in the same Pull Request.
4. CI applies the migration to a fresh database as part of the
   integration test stage (`ci-cd.md`), catching migration errors before merge.
5. On merge to `main`, the migration is applied to staging automatically.
6. On release, the migration is applied to production as an explicit,
   logged deployment step — never implicitly on application boot
   (`ci-cd.md`).

## Migration File Naming

Follows Prisma's default convention:
`YYYYMMDDHHMMSS_short_description/migration.sql`
(e.g. `20260716120000_add_upsolve_status/migration.sql`)

## Backwards Compatibility Rules

To support zero-downtime deploys (multiple instances running during a
rolling deploy may briefly run old and new code against the same
database):

- **Additive changes are preferred**: new nullable columns, new tables,
  new indexes can be deployed independently of application code changes.
- **Destructive changes are split into two deploys**:
  1. Deploy code that stops using the old column/table, while the
     migration only adds the replacement (old column remains, unused).
  2. A follow-up migration drops the old column/table once no running
     instance depends on it.
- **Renaming a column** is treated as a destructive change: add the new
  column, migrate data, switch application code, then drop the old column
  — never a direct in-place rename.

## Data Migrations

Migrations that transform existing data (not just schema) are written as
explicit scripts run as part of the migration step, and are:

- Idempotent (safe to re-run if a deploy is retried).
- Logged with row counts affected, for auditability.
- Never silently swallow errors — a failed data migration halts the
  deployment rather than leaving data partially transformed (aligns with
  NFR-004's "no partial writes" principle).

## Rollback

Since `ci-cd.md` promotes a pre-built, already-tested image rather than
rebuilding at release time, a rollback reverts to the previous image tag.
Because destructive schema changes are always split across two deploys
(see above), the previous application version remains compatible with the
current database schema at the point of rollback — no separate "down"
migration is required for normal operation.

## Environments

- **Local**: `prisma migrate dev`, disposable database, freely reset.
- **CI**: fresh database per pipeline run, migrations applied from
  scratch to validate they run cleanly end-to-end.
- **Staging**: mirrors production migration process exactly, used as the
  final check before a migration reaches production.
- **Production**: migrations applied only via the CI/CD pipeline
  (`ci-cd.md`), never manually.

## Seed Data

A minimal seed script (e.g. reference `tags` catalog entries) is
maintained separately from migrations, run manually or in local/CI setup
— never mixed into a schema migration file.