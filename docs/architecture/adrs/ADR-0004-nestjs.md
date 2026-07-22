# ADR-0004 — Use Prisma ORM

## Status

Accepted

## Context

Penguk's backend is fully TypeScript (ADR-0002), and its Domain Model
defines explicit entities and aggregates that must be represented safely
and consistently in code, without duplicating type definitions between
the database layer and the application layer.

## Decision

Prisma is adopted as the ORM for all PostgreSQL access (ADR-0003). Prisma
Client is accessed only from within each module's data-access layer,
behind the interfaces required by the Dependency Inversion principle
established in ADR-0001 — domain and application logic never import
Prisma directly.

## Consequences

### Positive

- End-to-end type safety between the database schema and TypeScript code,
  reducing an entire class of runtime errors.
- Built-in schema migrations, which integrate directly into the CI/CD
  pipeline (`ci-cd.md`).
- Schema-first workflow keeps the Domain Model's entities and the
  database schema traceable to each other.

### Negative

- Introduces a degree of coupling to Prisma's schema DSL and query API;
  mitigated by keeping Prisma access isolated behind module-level
  repository interfaces, per ADR-0001.
- Less direct control over fine-grained query optimization compared to
  hand-written SQL, relevant if performance targets in `NFR-001` are not
  met by generated queries.

## Alternatives Considered

- **TypeORM** — rejected; heavier decorator-based entity definitions and
  historically less consistent type-safety guarantees than Prisma.
- **Raw SQL / Knex** — rejected; provides more granular control but
  requires significantly more boilerplate and manual type-safety work,
  conflicting with the maintainability priority in `overview.md`.
