# Penguk — Documentation

Penguk synchronizes solved problems from competitive programming platforms
(LeetCode, Codeforces), keeps personal notes where you already write them
(your GitHub repo), and schedules reviews with spaced repetition so
patterns actually stick.

This folder is the single source of truth for what Penguk is, why it's
built the way it is, and how to work on it. If something in the code
contradicts these docs, that's a bug in one of the two — open an issue,
don't just pick one silently.

## Start Here

| I want to... | Go to |
|---|---|
| Understand what Penguk does and why | [`product/vision.md`](product/vision.md), [`product/scope.md`](product/scope.md) |
| See what's in the MVP vs. later versions | [`product/scope.md`](product/scope.md), [`roadmap/v2.md`](roadmap/v2.md) |
| Understand the system architecture | [`architecture/overview.md`](architecture/overview.md) |
| See *why* a technical decision was made | [`architecture/adrs/`](architecture/adrs/) |
| Set up my local environment and start coding | [`development/repository-structure.md`](development/repository-structure.md) |
| Know the day-by-day build plan | [`roadmap/v1.md`](roadmap/v1.md), [`roadmap/milestones.md`](roadmap/milestones.md) |
| Check coding/commit/branch conventions | [`development/`](development/) |
| Know when something is "done" | [`development/definition-of-done.md`](development/definition-of-done.md) |
| Look up an API endpoint | [`api/overview.md`](api/overview.md), [`api/openapi/openapi.yaml`](api/openapi/openapi.yaml) |
| Understand a business rule (e.g. "why can't I connect 2 repos?") | [`domain/business-rules.md`](domain/business-rules.md) |

## Structure

```
docs/
├── product/          What Penguk is, for whom, and why — vision, scope, goals, personas
├── domain/           The business rules and ubiquitous language of the system
├── requirements/      Functional & non-functional requirements, user stories, use cases
├── architecture/      System design, C4 diagrams, and Architecture Decision Records (ADRs)
├── database/          Schema (ERD), normalization, naming, indexing, migration strategy
├── api/               API conventions, auth, errors, and the OpenAPI spec
├── security/          Threat model, authN/authZ, secrets, rate limiting, dependency policy
├── testing/           Testing strategy across unit, integration, and e2e layers
├── deployment/        Docker, environments, CI/CD, production setup
├── development/       Repo structure, branching, commits, coding standards, definition of done
└── roadmap/           Milestones, sprint-by-sprint plan (v1), and post-MVP scope (v2/v3)
```

## How These Docs Relate to Each Other

Documentation flows in one direction — each layer justifies the one below it:

```
product/        →  what problem are we solving, for whom
   ↓
domain/         →  what are the rules of that problem, in plain language
requirements/   →  what must the system do, precisely, to satisfy those rules
   ↓
architecture/   →  how is the system structured to meet those requirements
database/ api/  →  the concrete contracts that structure implies
security/       →
   ↓
development/    →  how we actually work, day to day, to build it correctly
roadmap/        →  in what order, and by when
testing/        →  how we prove it actually does what requirements/ says
deployment/     →  how it reaches production
```

If you're proposing a change, trace it upward first: does it change a
business rule (`domain/`) or a requirement (`requirements/`)? If so,
update that *before* touching architecture or code — not after.

## Traceability

Every feature built should trace back to an `FR-xxx` (Functional
Requirement) or `US-xxx` (User Story) in `requirements/`, and every
constraint enforced in code should trace back to a `BR-xxx` (Business
Rule) in `domain/business-rules.md`. Commits reference these directly
(see `development/commit-convention.md`) — this is what makes it possible
to answer "why does the code do this?" without guessing.

## Keeping This Documentation Alive

- Docs are updated in the **same PR** as the code change they describe,
  not in a follow-up "docs" PR. Stale docs are worse than no docs — see
  `development/definition-of-done.md`.
- Architectural decisions get a new ADR (`architecture/adrs/`), not an
  edit to an old one. ADRs are a log, not a living document.
- If you find a doc that contradicts the code, that's a real bug — open
  an issue same as you would for broken code.

## Contributing

New to the project? Read `product/vision.md` first, then
`architecture/overview.md`, then `development/repository-structure.md` to
get your environment running. Everything else you'll reference as needed.