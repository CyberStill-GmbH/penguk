# Database — Indexing Strategy

Indexes are added deliberately, tied to a known query pattern from the
Functional Requirements or Business Rules — not preemptively on every
column.

## Unique Indexes (enforce Business Rules)

| Table | Columns | Enforces |
|---|---|---|
| `problems` | (`platform`, `external_id`) | BR-004 — deduplication on sync |
| `contests` | (`platform`, `external_id`) | Same dedup principle, applied to Contests |
| `accounts` | (`user_id`, `platform`) | BR-009 — at most one account per platform |
| `repositories` | (`user_id`) | BR-010 — at most one Repository per User |
| `problem_reviews` | (`user_id`, `problem_id`) | BR-001 — one review track per user per problem |
| `contest_participations` | (`user_id`, `contest_id`) | One participation record per user per contest |
| `tags` | (`name`) | Canonical tag names, no duplicates (`normalization.md`) |

## Query-Pattern Indexes

| Table | Columns | Supports |
|---|---|---|
| `problem_reviews` | (`user_id`, `next_review_date`) | Review Queue grouping (FR-008): overdue/today/tomorrow/week, scoped per user |
| `problem_reviews` | (`user_id`, `status`) | Dashboard counts of pending/completed reviews (FR-009) |
| `integrations` | (`status`) | Background job scans for errored/pending integrations (NFR-004, NFR-006) |
| `notes` | (`problem_id`) | Looking up Notes linked to a specific Problem (FR-006) |
| `upsolves` | (`user_id`, `status`) | Viewing pending vs completed Upsolves (FR-011) |
| `contest_solved_problems` | (`contest_participation_id`) | Deriving the first unsolved Problem for Upsolve creation (BR-007) |
| `reviews` | (`problem_review_id`, `reviewed_at`) | Review history retrieval, ordered chronologically |

## Foreign Key Indexes

All foreign key columns are indexed by default (Prisma creates these
automatically), since every relationship in the ERD is expected to be
queried from the child side (e.g. "all Problem Reviews for this User").

## Explicitly Not Indexed (for now)

- `problems.title`, `notes.content` — no full-text search requirement
  exists yet (out of Scope per `Scope.md`). If full-text search on Notes
  or Problems becomes a requirement, a dedicated GIN index (`pg_trgm` or
  `tsvector`) will be added at that time, not preemptively.
- `users.preferences` (JSONB) — not queried or filtered on directly by any
  current Functional Requirement; a GIN index would be added only if that changes.

## Review Cadence

Indexes are revisited whenever a new Functional Requirement introduces a
new query pattern, and whenever `NFR-001` (Performance) targets are not
met in practice — not on a fixed schedule.