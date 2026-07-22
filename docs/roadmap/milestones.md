# Milestones — Penguk

## Methodology

Scrum-lite, adapted for a solo developer:

- **Sprint length:** 6 working days (Mon–Sat). Sunday is off — no sprint work is scheduled on Sundays.
- **Sprint capacity:** ~5h/day → ~30h per sprint.
- **Definition of Ready:** a task can enter a sprint only if it references an existing FR/US/BR/NFR from `docs/requirements/` and `docs/domain/business-rules.md`. No task is invented outside what's already scoped in `docs/product/scope.md`.
- **Definition of Done (applies to every task, every sprint):**
  - Code merged to `main` via PR (see `docs/contributing/pull-requests.md`)
  - Unit tests written for business logic (per NFR-003)
  - No linter/type errors (`tsc --noEmit`, ESLint clean)
  - Relevant doc updated if behavior diverges from what's written (ADR, FR, or API spec)
- **Versioning:** [SemVer](https://semver.org/). Each sprint closes with a tagged pre-release (`v0.x.0`) until the MVP is complete at `v1.0.0`.

---

## Version Plan

| Version  | Scope                                                             | Sprints  | Target Date  |
| -------- | ----------------------------------------------------------------- | -------- | ------------ |
| `v0.1.0` | Project foundation (no user-facing feature yet)                   | Sprint 0 | Jul 23, 2026 |
| `v0.2.0` | Auth (FR-001, FR-002)                                             | Sprint 1 | Jul 30, 2026 |
| `v0.3.0` | Integrations: GitHub repo + platform connections (FR-003, FR-004) | Sprint 2 | Aug 6, 2026  |
| `v0.4.0` | Problems sync & dedup (FR-005)                                    | Sprint 3 | Aug 13, 2026 |
| `v0.5.0` | Notes (FR-006)                                                    | Sprint 4 | Aug 20, 2026 |
| `v0.6.0` | Spaced Repetition + Review Queue (FR-007, FR-008)                 | Sprint 5 | Aug 27, 2026 |
| `v0.7.0` | Dashboard & Statistics (FR-009, FR-010)                           | Sprint 6 | Sep 3, 2026  |
| `v0.8.0` | Contests & Upsolving (FR-011)                                     | Sprint 7 | Sep 10, 2026 |
| `v1.0.0` | Hardening, deploy, docs freeze — **MVP complete**                 | Sprint 8 | Sep 17, 2026 |

Total: **9 sprints (~54 working days, ~9 weeks)** from Jul 17 to Sep 17, 2026.

This is deliberately sequential, not parallel: each module depends on the one before it (Integrations needs Auth; Reviews needs Problems; Dashboard needs Reviews+Problems+Contests). Don't start a sprint's module before the previous one is merged and passing its tests — that's the #1 way solo projects stall half-finished.

---

## Post-MVP (not scheduled yet — see `v2.md`)

`v2.0.0` (Habits & Analytics) and `v3.0.0` (Coaching & Scaling) stay unscheduled until `v1.0.0` ships and you've used the MVP yourself for at least a week. Don't pull v2/v3 items into a sprint early — that's scope creep, and it's the exact pattern that stalled the project-selection phase before this.
