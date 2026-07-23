# Testing Strategy — Penguk

Referenced by `development/coding-standards.md` and `development/definition-of-done.md`. This defines *how* testing works project-wide; `unit.md`, `integration.md`, and `e2e.md` will each expand their layer in detail as the sprint that needs them arrives — this file is what CI needs today.

## Tooling

- **Runner:** Vitest, for both `apps/api` (NestJS) and `apps/web` (Next.js) — one tool, one config style, less context-switching (consistent with the single-TypeScript-language rationale in ADR-0007).
- **API integration tests:** Supertest against a real Postgres instance in Docker (not mocked) — per NFR-004, sync/idempotency logic must be proven against a real DB, not an in-memory fake.
- **Coverage tool:** `@vitest/coverage-v8`.

## Test Layers

| Layer | Location | What it covers | Required for merge? |
|---|---|---|---|
| Unit | `*.spec.ts` co-located with source | `domain/` logic — SRS algorithm, dedup rules, any BR-xxx enforcement | Yes, for any new/changed domain logic |
| Integration | `apps/api/test/` | Module boundaries, Prisma repositories, real DB reads/writes | Yes, for any new endpoint or sync job |
| E2E | `apps/web/e2e/` (Playwright, added when frontend exists) | Full user workflows from `product/scope.md` (signup → sync → review) | Only at `v1.0.0` hardening (Sprint 8), not per-PR |

## Coverage Expectations

- Domain layer (`domain/` folders): **90%+** — this is where NFR-003 explicitly calls out silent-failure risk (SRS scheduling, problem dedup).
- Application/infrastructure layers: no hard number — tested through integration tests, not chased for coverage percentage.
- No coverage requirement is a substitute for `definition-of-done.md`'s actual rule: every BR-xxx enforced needs an explicit test proving it, not just incidental coverage.

## CI Enforcement (feeds Sprint 0, Day 5)

```
npm run lint && npm run typecheck && npm run test
```

Runs on every PR. A PR cannot merge if any step fails — no "merge now, fix tests later."

## What this file does NOT decide yet

Test data factories/fixtures, snapshot testing policy, and E2E environment setup are deferred to `unit.md`/`integration.md`/`e2e.md`, written just before the sprint that first needs them (Sprint 1 for unit/integration, Sprint 8 for e2e).