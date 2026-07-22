# ADR-0006 — Use REST as Primary API Style

## Status

Accepted

## Context

Penguk's roadmap (v3) includes a public API intended for third-party
consumption (CLI tools, editor extensions), documented via OpenAPI
(`technologies.md` — Documentation). The chosen API style must be broadly
interoperable and simple enough to document and maintain without adding
unnecessary complexity, per the maintainability priority in `overview.md`.

## Decision

Penguk exposes its backend functionality as a REST API, documented with
OpenAPI/Swagger, generated directly from the NestJS controllers (ADR-0002).

## Consequences

### Positive

- REST is a widely understood standard, minimizing onboarding friction
  for both frontend developers and future third-party API consumers.
- OpenAPI documentation can be generated directly from NestJS decorators,
  keeping documentation and implementation in sync.
- Does not assume a specific client language or runtime, supporting the
  public API goal for v3.

### Negative

- Less flexible than GraphQL for clients needing to shape queries
  precisely; may result in over-fetching or under-fetching for complex
  dashboard views.
- Requires explicit versioning strategy as the API evolves, since REST
  does not manage schema evolution automatically.

## Alternatives Considered

- **GraphQL** — rejected; the added complexity (resolvers, N+1 query
  handling, schema management) conflicts with the maintainability
  priority, without a corresponding need at the current stage.
- **tRPC** — rejected; while it offers strong type-safety within a
  TypeScript-only stack, it is not framework-agnostic, which conflicts
  with the goal of a broadly interoperable public API in v3.
