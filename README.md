# Penguk

> Spaced repetition for competitive programming. Sync your solved problems from LeetCode and Codeforces, keep your notes where you already write them (your GitHub repo), and know exactly what to review today.

**Status:** 🚧 In active development — building toward `v1.0.0` (MVP). Not yet deployed. See [roadmap](docs/roadmap/milestones.md) for the current build plan.

---

## The Problem

Competitive programmers solve hundreds of problems across LeetCode, Codeforces, and other platforms — but the patterns don't stick. Solutions live scattered across repos and notes apps, there's no system for revisiting what you've already learned, and by the time a similar problem shows up in an interview or a contest, you've forgotten how you solved it the first time.

Penguk centralizes your solved problems, keeps your notes in your own GitHub repository (not another proprietary editor), and schedules reviews with spaced repetition so what you learn actually stays learned.

## Tech Stack

| Layer | Stack |
|---|---|
| Backend | NestJS, TypeScript, Prisma, PostgreSQL |
| Queue / Background Jobs | Redis, BullMQ |
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| Auth | GitHub OAuth, JWT |
| API | REST, documented with OpenAPI |

Every technical decision is documented as an ADR — see [`docs/architecture/adrs/`](docs/architecture/adrs/).

## Architecture

Modular monolith: one deployable application, internally divided into isolated modules (Auth, Users, Integrations, Problems, Reviews, Notes, Contests, Dashboard) that mirror the system's bounded contexts — chosen deliberately over microservices at this stage. Full rationale in [`docs/architecture/overview.md`](docs/architecture/overview.md).

## Documentation

This project is documentation-first. Before writing code, the product scope, domain rules, requirements, architecture, database design, API contracts, and security model were all defined and are kept in sync with the code as it's built.

Full docs live in [`docs/`](docs/README.md) — start there for anything beyond this overview.

## Roadmap

Building toward `v1.0.0` in sprints, tracked day by day. See [`docs/roadmap/v1.md`](docs/roadmap/v1.md) for the current sprint plan and [`docs/roadmap/milestones.md`](docs/roadmap/milestones.md) for version targets.

## Local Development

Setup instructions will go here once Sprint 0 is complete — see [`docs/development/repository-structure.md`](docs/development/repository-structure.md) in the meantime.

## Contributing

Read [`docs/development/`](docs/development/) for branching strategy, commit conventions, coding standards, and definition of done before opening a PR.

## License

GNU Apache V2.0