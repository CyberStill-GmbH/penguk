# Database — Normalization

## Target: Third Normal Form (3NF)

Penguk's schema targets 3NF as the default, with explicit, documented
deviations where denormalization is a deliberate trade-off rather than an
oversight.

## Applied Normalization Decisions

### Problem tags → normalized (`tags`, `problem_tags`)

Tags are stored as a catalog table (`tags`) plus a junction table
(`problem_tags`), instead of a JSON/array column on `problems`.

**Why**: Statistics (FR-010) needs to filter and aggregate by tag
reliably. A free-text array risks duplicate variants of the same tag
(`"dp"` vs `"Dynamic Programming"` vs `"DP "`), which would silently break
aggregation. A catalog table enforces one canonical name per tag.

### Contest problems → normalized (`contest_problems`)

The ordered list of Problems in a Contest is a junction table with a
`position` column, not an array on `contests`.

**Why**: `position` needs to be queried directly (BR-007 requires
"ascending difficulty order" derived from contest structure), and a
junction table allows indexing and joining without deserializing an array.

### Contest solved problems → normalized (`contest_solved_problems`)

A `ContestParticipation`'s `solvedProblemIds` (per the Domain Model) is
stored as a junction table, not an array column.

**Why**: BR-007 (Upsolve derivation) requires checking, per Problem,
whether it exists in this set — an operation that is a simple indexed
join against a junction table, versus an array-containment scan that
does not scale as cleanly with indexing.

## Deliberate Denormalization (documented exceptions)

### `users.preferences` — JSONB, not normalized

User preferences (theme, timezone, language, SRS interval preferences)
are stored as a single JSONB column instead of a separate table.

**Why this is acceptable**: preferences are read and written as a whole
unit tied to a single User, are never queried or filtered across users,
and are expected to evolve in shape over time (new preference keys added
without a schema migration). Normalizing this would add join overhead for
no query benefit.

### `problems.difficulty` — stored as a single scalar, not a lookup table

Difficulty is stored directly as an integer/rating value rather than a
foreign key to a difficulty catalog.

**Why this is acceptable**: difficulty values are numeric ratings from
external platforms (e.g. Codeforces rating, LeetCode difficulty tier),
not a fixed enumerable set Penguk defines itself — there is no shared
catalog to normalize against.

## Non-Goals

Penguk does not pursue normal forms beyond 3NF (e.g. BCNF, 4NF) as a
blanket policy. Where a specific case would benefit from further
normalization, it will be evaluated and documented individually, following
the same pattern as the exceptions above rather than a global rule.
