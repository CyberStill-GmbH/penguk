# API Overview — Penguk

## Purpose

This is the reference documentation for Penguk's REST API. It backs the
web frontend today and is designed to be safely exposed as a public API
in a later phase (see `Scope.md` — v3 roadmap), so every decision here
favors clarity and stability over convenience shortcuts.

## Base URL

```
https://api.penguk.dev/v1
```

All endpoints are versioned under `/v1`. Breaking changes will be
introduced as `/v2`, never as an in-place change to `/v1`.

## Resource Map

| Resource     | Domain Entities                         | Docs                                                                   |
| ------------ | --------------------------------------- | ---------------------------------------------------------------------- |
| Auth         | User, Account (session)                 | [`openapi/paths/auth.yaml`](./openapi/paths/auth.yaml)                 |
| Users        | User, Repository                        | [`openapi/paths/users.yaml`](./openapi/paths/users.yaml)               |
| Integrations | Account, Integration                    | [`openapi/paths/integrations.yaml`](./openapi/paths/integrations.yaml) |
| Problems     | Problem, Tag                            | [`openapi/paths/problems.yaml`](./openapi/paths/problems.yaml)         |
| Reviews      | Problem Review, Review                  | [`openapi/paths/reviews.yaml`](./openapi/paths/reviews.yaml)           |
| Notes        | Note, Repository                        | [`openapi/paths/notes.yaml`](./openapi/paths/notes.yaml)               |
| Contests     | Contest, Contest Participation, Upsolve | [`openapi/paths/contests.yaml`](./openapi/paths/contests.yaml)         |
| Dashboard    | Aggregated read views                   | [`openapi/paths/dashboard.yaml`](./openapi/paths/dashboard.yaml)       |

## Read This Next

- [`conventions.md`](./conventions.md) — naming, pagination, filtering, and formatting rules that apply across every endpoint.
- [`authentication.md`](./authentication.md) — how to obtain and use an access token.
- [`errors.md`](./errors.md) — the error response shape and status code meanings.
- [`openapi/openapi.yaml`](./openapi/openapi.yaml) — the machine-readable spec (source of truth; this document is the human-readable companion).

## Source of Truth

The OpenAPI spec under `openapi/` is authoritative. If anything in this
overview or in the prose docs conflicts with the spec, the spec wins —
these documents should be corrected to match it, not the other way around.
