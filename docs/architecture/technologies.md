# Technologies — Penguk

## Backend

- **Runtime/Language**: Node.js + TypeScript
- **Framework**: NestJS — chosen over Express because its native dependency
  injection and module system directly support the Modular Monolith + DDD
  architecture defined in `overview.md`. Its providers translate naturally
  into ports/adapters if the system evolves toward Hexagonal Architecture.
- **API Style**: REST — kept framework-agnostic so a future public API
  (planned for v3) can be documented with OpenAPI and consumed by any client.

## Frontend

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui — components are copied into the codebase
  (built on Radix UI primitives) and restyled to match the design produced
  in Figma, instead of fighting an opinionated theme like Material UI/Chakra.
- **Design Process**: UI/UX designed in Figma before implementation.

## Data & Messaging

- **Primary Database**: PostgreSQL — relational, fits the Domain Model's
  aggregate relationships without needing a second database engine.
- **ORM**: Prisma
- **Cache / Queue Broker**: Redis
- **Job Queue**: BullMQ — background synchronization jobs (Problem imports,
  Contest sync), with retry/backoff support for NFR-004 (Reliability).

No NoSQL database is included at this stage — the domain data is
relational by nature, and a second storage engine would add operational
complexity without a concrete need.

## Authentication

- **Strategy**: Passport.js (NestJS's standard auth integration), with
  a GitHub OAuth strategy and a local (email/password) strategy.
- **Session mechanism**: JWT, stateless — no server-side session store to
  keep in sync, which fits the "cloud portability" and "scalability" goals
  from `overview.md` (any instance can validate a token without shared state).
- **Password hashing**: bcrypt or argon2, per NFR-002.
- **Token/secret storage**: OAuth tokens and API credentials encrypted at
  rest, per NFR-002.

> Assumption to confirm: JWT was chosen over server-side sessions because
> it avoids a shared session store, which matters for horizontal scaling
> and multi-instance deployments. If you'd rather keep sessions simpler
> (server-side, backed by Redis), that's also a valid option — just say so.

## Testing

- **Unit / Integration tests (backend)**: Jest — standard for NestJS,
  integrates with its DI system for mocking providers.
- **E2E tests (backend)**: Jest + Supertest, against the REST API directly.
- **Frontend tests**: Vitest + React Testing Library.
- See `testing-strategy.md` for what is tested and why.

## DevOps

- **Containerization**: Docker + Docker Compose — same container image
  runs regardless of hosting provider, which is what actually delivers on
  the cloud portability goal.
- **CI/CD**: GitHub Actions — native to an open-source GitHub-hosted project.
- See `ci-cd.md` for pipeline stages and branching model.

## Observability

- **Tracing/Logging**: OpenTelemetry, structured logs per NFR-006.
- **Metrics**: Prometheus + Grafana.
- Introduced once the MVP is stable — not required from day one, but
  planned so it doesn't get bolted on as an afterthought later.

## Documentation

- **API documentation**: OpenAPI/Swagger, generated from the REST layer.
- **Architecture decisions**: ADRs (Architecture Decision Records) for
  major structural choices, per NFR-003.
- **Project docs**: Markdown, versioned alongside the code
  (this same document set: Vision, Scope, Goals, DDD artifacts, Architecture).

## Infrastructure Principles

All infrastructure (database, queue, cloud services) is accessed behind
interfaces defined by the application/domain layers, per the Dependency
Inversion principle established in `overview.md` — no cloud-provider-specific
SDK is called directly from domain logic. This keeps the stack portable
across hosting providers.
