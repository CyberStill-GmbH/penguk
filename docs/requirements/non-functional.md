# Non Functional Requirements — Penguk

---

# NFR-001 Performance

## Description

The system must respond quickly for common operations, especially
when displaying already-synchronized data.

## Requirements

- Dashboard requests with cached/synced data must respond in under 500ms (p95).
- Background synchronization jobs must not block or degrade dashboard response time.
- Review Queue queries must respond in under 300ms (p95).

---

# NFR-002 Security

## Description

The system must protect user credentials, external tokens, and personal data.

## Requirements

- Passwords must be hashed with a strong algorithm (e.g. bcrypt or argon2), never stored in plain text.
- OAuth tokens and external API credentials must be encrypted at rest.
- All traffic must be served over HTTPS.
- Authentication endpoints must be rate-limited to prevent brute-force attempts.
- External integrations must use each platform's official authorization flow (OAuth/API keys), never scraped credentials.

---

# NFR-003 Maintainability

## Description

The codebase should be easy to modify and safe to extend by external contributors.

## Requirements

- Clear module boundaries per bounded context (Auth, Integrations, Problems, Reviews, Notes).
- Architecture decisions documented (ADRs or equivalent) for major structural choices.
- Automated test coverage required for: spaced repetition logic, deduplication logic, and platform sync parsers.
- Public API/module interfaces documented for contributors.

---

# NFR-004 Reliability

## Description

The system must handle external service failures without data loss or corruption.

## Requirements

- Synchronization jobs must be idempotent: re-running a failed sync must not create duplicate Problems (BR-004).
- Failed synchronizations must retry with exponential backoff before being marked as errored.
- A failed sync must leave previously stored data unchanged (no partial writes).
- External API rate-limit responses must pause and reschedule the job, not fail permanently.

---

# NFR-005 Availability

## Description

The system's core features must remain usable even when a specific
external platform integration is down.

## Requirements

- The Dashboard, Review Queue, and Notes features must remain available if a single platform's API is unreachable.
- Synchronization job uptime target: 99% successful runs per week, excluding external platform outages.
- Users are notified in-app when an Integration has been failing for more than 24 hours.

---

# NFR-006 Observability

## Description

The system must provide enough visibility to detect and diagnose
failures without relying on user reports.

## Requirements

- Structured logging for all synchronization jobs, including duration and outcome.
- Errors from external integrations are logged with enough context to reproduce them (platform, accountId, timestamp).
- Basic metrics exposed for: job success/failure rate, queue size, and API response times.

---

# NFR-007 Scalability

## Description

The system must handle growth in users and synchronized data without
requiring architectural rework.

## Requirements

- Synchronization workload must run through a queue (BullMQ or equivalent) so job volume can scale horizontally by adding workers.
- Database queries for Dashboard and Statistics must use indexed lookups, avoiding full-table scans as data grows.
- Rate-limit handling per external platform must be per-account, not global, so one user's sync load doesn't throttle others.