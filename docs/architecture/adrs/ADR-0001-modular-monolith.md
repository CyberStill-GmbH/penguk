# ADR-0001 — Adopt Modular Monolith Architecture

## Status

Accepted

## Context

Penguk must be scalable in users, data volume, and cloud provider (see
`overview.md` — Architectural Goals), while remaining maintainable by a
small team and external open-source contributors. A distributed
architecture (Microservices) from day one would add operational overhead
(networking, deployment orchestration, cross-service observability) that
is not justified at the current stage. At the same time, an unstructured
monolith would make future evolution to Hexagonal Architecture or
Microservices costly, since it would require retrofitting boundaries that
were never enforced.

## Decision

Penguk is built as a single deployable application, internally divided
into modules that mirror the system's bounded contexts (Auth, Users,
Problems, Reviews, Notes, Integrations, Contests, Dashboard, Statistics).
Each module owns its own data and exposes a defined service interface;
no module accesses another module's database tables directly. Dependency
Inversion (SOLID) is applied so domain logic depends on abstractions, not
concrete infrastructure — the same mechanism that will allow individual
modules to be extracted into separate services later, without rewriting
their internal logic.

## Consequences

### Positive

- Single deployment pipeline and infrastructure footprint, lower
  operational cost at the current scale.
- Enforced module boundaries make future extraction into Hexagonal
  Architecture or Microservices an incremental migration, not a rewrite.
- Easier onboarding for contributors: one codebase, one set of local
  setup steps.

### Negative

- All modules currently scale together as one process; scaling a single
  hot module independently is not possible without first extracting it.
- Requires discipline to keep module boundaries from eroding as the
  codebase grows; violations are not prevented by infrastructure alone.

## Alternatives Considered

- **Microservices from day one** — rejected; the operational overhead
  (service discovery, distributed transactions, cross-service monitoring)
  is unjustified at the current user and team scale.
- **Unstructured (traditional) monolith** — rejected; without enforced
  module boundaries, a future migration to Hexagonal or Microservices
  would require significant rework rather than incremental extraction.