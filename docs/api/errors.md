# Errors — Penguk API

## Error Response Shape

Every error response, regardless of status code, uses the same shape:

```json
{
  "error": {
    "code": "problem_review_not_found",
    "message": "No Problem Review exists with the given id.",
    "details": null
  }
}
```

- `code` — a stable, machine-readable string. Safe to branch logic on;
  will not change without a version bump.
- `message` — human-readable, safe to display, not guaranteed to be
  stable wording across releases.
- `details` — optional object with field-level context (e.g. validation
  errors); `null` when not applicable.

## Status Code Mapping

| Status | Meaning | Example `code` |
|---|---|---|
| 400 | Malformed request (bad JSON, invalid query param) | `invalid_request` |
| 401 | Missing, invalid, or expired token | `unauthorized`, `token_expired` |
| 403 | Authenticated, but not allowed to access this resource | `forbidden` |
| 404 | Resource does not exist | `not_found` |
| 409 | Conflict with current state (e.g. Repository already connected, BR-010) | `conflict` |
| 422 | Valid request shape, but fails a business rule | `validation_failed` |
| 429 | Rate limit exceeded | `rate_limited` |
| 500 | Unexpected server error | `internal_error` |
| 503 | Dependent external service unavailable (e.g. platform sync down) | `upstream_unavailable` |

## Validation Errors (422)

Field-level validation failures populate `details`:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "One or more fields are invalid.",
    "details": {
      "email": "must be a valid email address"
    }
  }
}
```

## Business Rule Violations

Errors that stem directly from a Business Rule reference it in `details`
for traceability, e.g. attempting to connect a second Repository:

```json
{
  "error": {
    "code": "conflict",
    "message": "A Repository is already connected. Disconnect it first.",
    "details": { "rule": "BR-010" }
  }
}
```

## Retryable vs Non-Retryable

- `429` and `503` are safe to retry with backoff.
- `400`, `401`, `403`, `404`, `409`, `422` are not retryable without
  changing the request itself.