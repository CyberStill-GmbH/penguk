# Architecture Overview — Penguk

## Architectural Goals

- **User scalability**: support growth in number of users and synchronized
  data without requiring a redesign (see NFR-007).
- **Persistence scalability**: the data model and storage layer must handle
  growing volumes of Problems, Reviews, and Contest data without degrading
  query performance.
- **Security**: protect user credentials, external tokens, and personal
  data by default, not as an afterthought (see NFR-002).
- **Cloud portability**: the system must not be tightly coupled to any
  single cloud provider. Moving hosting providers, or self-hosting, should
  require configuration changes, not a rewrite.
- **Maintainability**: the codebase must stay easy to understand and safe
  to extend by external open-source contributors (see NFR-003).
- **Testability**: business rules must be verifiable through automated unit and integration tests without depending on external services.

## Architectural Style

**Modular Monolith.**

Penguk starts as a single deployable application, internally organized into
well-isolated modules that mirror the domain's bounded contexts (Auth,
Integrations, Problems, Reviews, Notes, Contests). Each module owns its
data and exposes a clear interface to the others — no direct cross-module
database access.

This style is chosen deliberately over starting with Microservices or a
fully Hexagonal architecture:

- It avoids the operational overhead (deployment, networking, observability
  across services) that Microservices would demand for a project at this stage.
- It still enforces internal boundaries strict enough that the system can
  evolve into **Hexagonal Architecture** (isolating domain logic behind
  ports/adapters) or be split into **Microservices** later, if usage or team
  size justifies the added complexity.

## Prioritized Quality Attributes

In order of priority for this stage of the project:

1. **Maintainability** — the project is open-source; contributors need to
   understand and extend it without deep tribal knowledge.
2. **Security** — user credentials and external platform tokens must never
   be the weak point.
3. **Portability** — infrastructure choices must not lock Penguk into one
   cloud provider.
4. **Reliability** — external integrations fail often (rate limits, downtime);
   the system must degrade gracefully, not corrupt data.
5. **Scalability** — matters, but is not optimized prematurely; the modular
   monolith is intentionally chosen so scalability can be addressed by
   splitting modules later, once real growth demands it.

This ordering means: if a design decision improves scalability at the cost
of maintainability or portability, it is deprioritized for now.

## Main Components

- **Auth Module** — authentication (GitHub OAuth, email/password), session management.
- **Users Module** — User profile, preferences, Account, Repository (per BR-009, BR-010).
- **Integrations Module** — external platform connections, synchronization jobs, sync status.
- **Problems Module** — Problem catalog, deduplication (per BR-004).
- **Reviews Module** — Problem Review, spaced repetition scheduling, Review Queue.
- **Contests Module** — Contest data, Contest Participation, Upsolve derivation (per BR-007).
- **Notes Module** — Note management, Repository read/write integration.
- **Dashboard/Statistics Module** — aggregated read views built from the modules above.

Each module maps to one or more Aggregate Roots from the Domain Model, and
communicates with other modules only through explicit interfaces — never by
querying another module's tables directly.

## Design Principles

- **SOLID**, applied at the module and class level, with special emphasis on:
  - **Dependency Inversion**: domain logic (spaced repetition rules,
    deduplication rules, upsolve derivation) must depend on abstractions
    (interfaces/ports), never directly on a specific database driver, queue
    library, or cloud SDK. This is what makes cloud portability and a future
    Hexagonal migration realistic instead of aspirational.
  - **Single Responsibility**: each module owns one bounded context and one
    reason to change (e.g. the Integrations module only knows about syncing,
    not about how reviews are scheduled).
  - **Open/Closed**: adding a new external platform (e.g. AtCoder) should mean
    adding a new implementation of a sync interface, not modifying existing
    platform code.

- **Domain-Driven Design tactical patterns**: Aggregates enforce their own
  invariants (e.g. BR-001, BR-009, BR-010 are enforced inside the User and
  Problem Review aggregates, not in application code scattered across
  controllers).

- **Infrastructure as a swappable detail**: databases, queues, and cloud
  services are treated as implementation details behind interfaces defined
  by the domain/application layers — not as the foundation the domain is
  built on top of.

- **Fail gracefully, never silently corrupt**: any interaction with an
  external system (platform APIs, Git providers) must assume it can fail,
  and must never leave Penguk's own data in a partially-updated state
  (see NFR-004).