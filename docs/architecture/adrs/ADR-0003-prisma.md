# ADR-0003 — Use PostgreSQL as Primary Database

## Status

Accepted

## Context

Penguk's Domain Model is composed of clearly related aggregates (User →
Account, Problem Review → Problem, Contest → Contest Participation,
Repository → Note) with strong invariants (BR-001, BR-004, BR-009,
BR-010) that depend on relational integrity.

## Decision

PostgreSQL is adopted as Penguk's single primary data store for all
domain data.

## Consequences

### Positive

- Native support for relational integrity (foreign keys, constraints)
  matches the Domain Model's aggregate relationships directly.
- Mature ecosystem, wide cloud provider support, which supports the
  cloud portability goal in `overview.md`.
- Avoids the operational cost of running and maintaining a second
  database engine.

### Negative

- Less suited to unstructured or highly variable data, should such a
  need arise later (not currently required by any Business Rule or
  Functional Requirement).

## Alternatives Considered

- **MongoDB** — rejected; the domain data is relational by nature, and
  introducing a schemaless database would add operational complexity
  without addressing a concrete requirement.
- **MySQL** — viable alternative, but PostgreSQL was preferred for its
  richer feature set (e.g. JSONB support for semi-structured fields where
  needed) and stronger alignment with the Prisma ORM (ADR-0004).
