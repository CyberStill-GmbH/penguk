# ADR-0002 — Use NestJS as Backend Framework

## Status

Accepted

## Context

ADR-0001 requires a framework that can enforce module boundaries and
support Dependency Inversion (SOLID) without relying solely on developer
discipline, since Penguk is an open-source project with external
contributors of varying experience levels.

## Decision

Penguk's backend is built with NestJS. Its native dependency injection
container and module system are used directly to implement the module
boundaries defined in ADR-0001. Each bounded context (Auth, Users,
Problems, Reviews, Notes, Integrations, Contests, Dashboard, Statistics)
is implemented as a NestJS module, with providers depending on interfaces
rather than concrete implementations wherever infrastructure is involved.

## Consequences

### Positive

- Dependency injection and module decorators are enforced by the
  framework itself, reducing the risk of architectural drift from
  inconsistent contributor practices.
- NestJS providers map directly onto ports/adapters, easing a future
  migration toward Hexagonal Architecture (ADR-0001).
- Built-in support for testing (module overrides, provider mocking)
  aligns with the coverage requirements in `testing-strategy.md`.

### Negative

- More boilerplate and a steeper learning curve (decorators, DI, modules)
  than a minimal framework, which may slow down first-time contributors.
- Framework-specific conventions add a degree of lock-in to NestJS
  patterns within the application layer.

## Alternatives Considered

- **Express** — rejected; provides no built-in DI or module system, which
  would require the architecture from ADR-0001 to be enforced entirely by
  convention, with no framework-level safeguard.
- **Fastify** — rejected for the same reason as Express; performance
  benefits do not offset the lack of native architectural enforcement
  needed for this project.
