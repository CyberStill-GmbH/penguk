# API Conventions — Penguk

## Casing

- **URL paths**: `kebab-case`, plural nouns: `/problem-reviews`, `/integrations`.
- **JSON body fields**: `camelCase`, matching frontend/TypeScript conventions:
  `nextReviewDate`, `retentionLevel`. This differs intentionally from the
  database's `snake_case` (`naming-conventions.md` in `database/`) — the
  mapping between them is handled at the persistence layer (Prisma),
  never leaked into the API contract.

## Identifiers

- All resource IDs are UUIDs, returned and accepted as strings.

## Dates and Times

- All timestamps are ISO 8601, UTC: `2026-07-16T14:30:00Z`.
- Date-only fields (e.g. `nextReviewDate`) use `YYYY-MM-DD`, no time component.

## Pagination

List endpoints (`GET /problems`, `GET /problem-reviews`, etc.) use
offset-based pagination via query parameters:

```
GET /problems?limit=20&offset=40
```

- `limit` — default 20, max 100.
- `offset` — default 0.

Responses include a `pagination` object:

```json
{
  "data": [ ... ],
  "pagination": { "limit": 20, "offset": 40, "total": 137 }
}
```

## Filtering

Filterable list endpoints accept query parameters matching the field name
directly, e.g.:

```
GET /problems?platform=codeforces&difficulty=1600
GET /problem-reviews?status=overdue
```

Multiple values for the same filter are comma-separated:
`GET /problems?tags=dp,graphs`.

## Partial Updates

`PATCH` is used for partial updates (e.g. updating one preference field);
`PUT` is reserved for full-resource replacement where it applies (e.g.
replacing the connected Repository, per BR-010's "replace, don't append" rule).

## Idempotency

Endpoints that trigger side effects with external systems (e.g.
`POST /integrations/{id}/sync`) accept an optional `Idempotency-Key`
header, so a retried request after a network failure does not trigger a
duplicate synchronization job (ties to BR-004 and NFR-004).

## Response Envelope

- Single-resource responses return the resource object directly, no
  wrapper: `GET /problems/{id}` → `{ "id": "...", "title": "..." }`.
- List responses use the `data` + `pagination` envelope shown above.
- Error responses always use the shape defined in `errors.md`.
