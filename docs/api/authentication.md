# Authentication — Penguk API

Per ADR-0008, Penguk supports two authentication methods, both resulting
in the same kind of session token.

## Obtaining a Token

### Option A — Email and Password

```
POST /v1/auth/login
{ "email": "...", "password": "..." }
```

Returns an access token on success.

### Option B — GitHub OAuth

1. Redirect the user to `GET /v1/auth/github`.
2. GitHub redirects back to `GET /v1/auth/github/callback` with an
   authorization code, which the API exchanges for the user's GitHub
   identity, creating a new User on first login (FR-001).
3. The response includes an access token, the same shape as Option A.

## Using the Token

Every authenticated request must include:

```
Authorization: Bearer <token>
```

See `openapi/components/security.yaml` for the formal `bearerAuth` scheme
definition referenced by every protected endpoint in the spec.

## Token Lifetime

- Access tokens are short-lived JWTs (stateless, per ADR-0008 — no
  server-side session store).
- Expired tokens return `401 Unauthorized` with error code `token_expired`
  (see `errors.md`); the client must re-authenticate via either method above.

## Logout

```
POST /v1/auth/logout
```

Since tokens are stateless, logout is enforced client-side (discarding the
token) plus, if applicable, a server-side denylist entry for the token's
remaining lifetime — not a full session invalidation, since no session
state is stored per ADR-0008.

## Rate Limiting

Authentication endpoints are rate-limited per NFR-002, to mitigate
brute-force attempts against the email/password method. Exceeding the
limit returns `429 Too Many Requests`.
