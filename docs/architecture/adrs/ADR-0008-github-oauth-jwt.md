# ADR-0008 — Use GitHub OAuth as Primary Authentication Provider

## Status

Accepted

## Context

Penguk's target users (competitive programmers, technical job seekers)
overwhelmingly already hold GitHub accounts, and GitHub is independently
required as the Repository provider for the Notes system (BR-006,
BR-010). FR-001 also requires supporting users without a GitHub account
through email and password authentication as a secondary method.

## Decision

GitHub OAuth is adopted as Penguk's primary authentication provider,
implemented via Passport.js within the Auth Module (ADR-0002). Email and
password authentication (hashed with bcrypt or argon2, per NFR-002) is
supported as a secondary method for users without a GitHub account.
Sessions are issued as stateless JWTs to avoid a shared server-side
session store.

## Consequences

### Positive

- Fastest onboarding path for the primary target audience, who already
  use GitHub daily.
- A single GitHub authorization can serve both authentication and
  Repository connection (BR-010), reducing redundant setup steps for
  most users.
- Stateless JWT sessions require no shared session store, supporting
  horizontal scalability (NFR-007) and cloud portability (`overview.md`).

### Negative

- Requires maintaining a second authentication path (email/password),
  with its own security surface (password hashing, credential validation,
  brute-force protection per NFR-002).
- JWTs are harder to revoke instantly compared to server-side sessions;
  mitigated by short token expiration and refresh handling.

## Alternatives Considered

- **Third-party auth providers (e.g. Auth0, Firebase Auth)** — rejected;
  introduces an external dependency and potential vendor lock-in, working
  against the cloud portability goal in `overview.md`.
- **GitHub OAuth only, without a password fallback** — rejected; would
  exclude users who do not have or do not wish to use a GitHub account,
  conflicting with FR-001.