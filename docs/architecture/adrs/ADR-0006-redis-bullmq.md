# ADR-0005 — Use Redis and BullMQ for Background Jobs

## Status

Accepted

## Context

Synchronizing external platforms (GitHub, LeetCode, Codeforces) is
inherently unreliable: rate limits, downtime, and slow responses are
expected, not exceptional (NFR-004, NFR-007). These operations must not
block user-facing requests, and failures must be retried without
corrupting existing data (BR-004, BR-005).

## Decision

Redis is adopted as the message broker, with BullMQ as the job queue
library used to schedule and process background synchronization jobs
(Problem imports, Contest sync). Job processing logic is isolated in a
dedicated Background Job Module (see `c4-container.md`), which runs within
the same deployable process as the API for the current stage, but has no
other module depending on it directly — allowing it to be extracted into
a separate worker process later as a deployment change, without
refactoring its internal logic.

## Consequences

### Positive

- Built-in retry and exponential backoff support directly satisfies
  NFR-004 without custom implementation.
- Decouples slow or failing external calls from user-facing request
  latency (NFR-001).
- Queue-based design allows horizontal scaling of job processing later
  (NFR-007) without redesigning the synchronization logic.

### Negative

- Adds Redis as an additional infrastructure component to operate and
  monitor (`ci-cd.md`, `NFR-006`).
- Job processing correctness (e.g. idempotency, per BR-004) must be
  explicitly implemented and tested; the queue itself does not guarantee
  duplicate-free synchronization.

## Alternatives Considered

- **RabbitMQ** — rejected; heavier operational footprint than Redis for
  the current job volume, without a corresponding benefit at this stage.
- **In-process scheduled tasks (e.g. cron)** — rejected; no built-in
  retry/backoff, no horizontal scalability, and a failure would require
  manual intervention rather than automatic recovery.
