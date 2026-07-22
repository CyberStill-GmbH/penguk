# Database — Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : has
    USERS ||--o| REPOSITORIES : has
    USERS ||--o{ PROBLEM_REVIEWS : owns
    USERS ||--o{ CONTEST_PARTICIPATIONS : has
    USERS ||--o{ UPSOLVES : has

    ACCOUNTS ||--o| INTEGRATIONS : has

    PROBLEMS ||--o{ PROBLEM_REVIEWS : "reviewed via"
    PROBLEM_REVIEWS ||--o{ REVIEWS : logs
    PROBLEM_REVIEWS |o--o| UPSOLVES : "fulfilled by"

    PROBLEMS ||--o{ PROBLEM_TAGS : "tagged with"
    TAGS ||--o{ PROBLEM_TAGS : tags

    CONTESTS ||--o{ CONTEST_PROBLEMS : includes
    PROBLEMS ||--o{ CONTEST_PROBLEMS : "appears in"

    CONTESTS ||--o{ CONTEST_PARTICIPATIONS : has
    CONTEST_PARTICIPATIONS ||--o{ CONTEST_SOLVED_PROBLEMS : solved
    PROBLEMS ||--o{ CONTEST_SOLVED_PROBLEMS : "solved in"

    CONTESTS ||--o{ UPSOLVES : derives
    PROBLEMS ||--o{ UPSOLVES : targets

    REPOSITORIES ||--o{ NOTES : contains
    PROBLEMS ||--o{ NOTES : "documented by"

    USERS {
        uuid id PK
        string username
        string email
        string password_hash
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }

    ACCOUNTS {
        uuid id PK
        uuid user_id FK
        string platform
        string handle
        timestamp created_at
    }

    INTEGRATIONS {
        uuid id PK
        uuid account_id FK
        string status
        timestamp last_sync
        string last_error
        timestamp updated_at
    }

    PROBLEMS {
        uuid id PK
        string external_id
        string platform
        string title
        int difficulty
        timestamp created_at
        timestamp updated_at
    }

    TAGS {
        uuid id PK
        string name UK
    }

    PROBLEM_TAGS {
        uuid problem_id FK
        uuid tag_id FK
    }

    PROBLEM_REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid problem_id FK
        date next_review_date
        int interval_days
        int retention_level
        string status
        string solution_reference
        timestamp created_at
        timestamp updated_at
    }

    REVIEWS {
        uuid id PK
        uuid problem_review_id FK
        string result
        timestamp reviewed_at
    }

    CONTESTS {
        uuid id PK
        string external_id
        string platform
        date start_date
    }

    CONTEST_PROBLEMS {
        uuid contest_id FK
        uuid problem_id FK
        int position
    }

    CONTEST_PARTICIPATIONS {
        uuid id PK
        uuid user_id FK
        uuid contest_id FK
        int rank
        int rating_change
        timestamp created_at
    }

    CONTEST_SOLVED_PROBLEMS {
        uuid contest_participation_id FK
        uuid problem_id FK
    }

    UPSOLVES {
        uuid id PK
        uuid user_id FK
        uuid contest_id FK
        uuid problem_id FK
        uuid problem_review_id FK
        string status
        timestamp created_at
        timestamp completed_at
    }

    REPOSITORIES {
        uuid id PK
        uuid user_id FK
        string type
        string url
        timestamp created_at
        timestamp updated_at
    }

    NOTES {
        uuid id PK
        uuid repository_id FK
        uuid problem_id FK
        string path
        text content
        timestamp created_at
        timestamp updated_at
    }
```

## Design notes

- `PROBLEM_TAGS` and `CONTEST_SOLVED_PROBLEMS` are junction tables rather
  than array/JSON columns — see `normalization.md` for the rationale.
- `ACCOUNTS.platform` + `INTEGRATIONS` enforce BR-009 (at most one account
  per platform) at the application layer; the uniqueness itself is
  enforced by a composite unique constraint (`user_id`, `platform`) —
  see `indexing.md`.
- `PROBLEMS` is a global catalog shared across all users (not owned by a
  single User), matching the Domain Model's separation between `Problem`
  and `Problem Review`.
- Only `PK` and `FK` are shown as key markers in the diagram, for
  compatibility with Mermaid renderers that don't support the `UK`
  modifier or inline attribute comments. Uniqueness constraints and
  nullable columns are documented in `indexing.md` and
  `naming-conventions.md` instead of in the diagram itself.

## Nullable columns (not shown as comments above, for rendering compatibility)

- `users.password_hash` — nullable; a User authenticated only via GitHub
  OAuth has no password (ADR-0008).
- `integrations.last_error` — nullable; only populated when the last sync failed.
- `problem_reviews.solution_reference` — nullable; may not be set immediately.
- `upsolves.problem_review_id` — nullable until the user starts working on it.
- `upsolves.completed_at` — nullable until the Upsolve is completed.
- `notes.problem_id` — nullable; a Note may exist without being linked to a Problem.

## Unique constraints (not shown as `UK` above, for rendering compatibility)

- `users.email` — unique.
- `repositories.user_id` — unique (BR-010: at most one Repository per User).
- See `indexing.md` for the full list of unique constraints, including
  composite ones (e.g. `accounts(user_id, platform)`).
