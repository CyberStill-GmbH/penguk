# Secrets Management — Penguk

Referenced before writing `docker-compose.yml` and any `.env` file (Sprint 0, Day 1-2). Expands NFR-002 into concrete practice.

## Local Development

- All secrets live in `.env` (gitignored). `.env.example` is committed with
  placeholder values only, kept in sync whenever a new required variable
  is added — a missing entry in `.env.example` is a bug, not a nitpick.
- Config is loaded and validated at startup (`apps/api/src/config/`) using
  a schema (e.g. `zod` or NestJS `ConfigModule` with Joi validation) — the
  app fails fast on boot if a required secret is missing, never at
  request time.
- Never log secret values, even at debug level. Logging the *presence* of
  a config key (`"DATABASE_URL loaded"`) is fine; logging its value is not.

## What counts as a secret

- Database credentials
- GitHub OAuth client secret
- JWT signing secret
- LeetCode/Codeforces API credentials (if/when they require auth)
- Any encryption key used to encrypt stored OAuth tokens (per NFR-002 —
  OAuth tokens themselves are also secrets once stored, encrypted at rest
  in Postgres, never in plaintext columns)

## Encryption at Rest (NFR-002)

- External OAuth tokens (GitHub, LeetCode, Codeforces) are encrypted
  before being written to Postgres — the encryption key itself is a
  secret (above), never derived from something guessable, and never
  committed.
- Passwords are hashed (bcrypt/argon2), never encrypted — hashing and
  encryption are different operations solving different problems; don't
  conflate them in implementation.

## Production

- Secrets are injected via the deployment platform's environment/secrets
  manager (per `docs/deployment/production.md` — whichever provider is
  chosen there), never baked into a Docker image or committed config file.
- Rotating a secret (e.g. JWT signing key) must not require a code
  change — only a config/env update and a restart.

## CI

- CI secrets (e.g. test DB credentials, if any external service is
  touched in integration tests) are stored in GitHub Actions Secrets, not
  in the workflow YAML.

## What this file does NOT decide yet

Formal incident-response process if a secret leaks, and key-rotation
scheduling policy — deferred until there's production traffic to protect
(post `v1.0.0`, revisit alongside `security/vulnerability-management.md`).