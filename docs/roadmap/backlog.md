# Product Backlog — Penguk

Every item here traces back to a Functional Requirement, User Story, or Business Rule already defined in `docs/requirements/` and `docs/domain/business-rules.md`. Nothing is added here that isn't already scoped in `docs/product/scope.md` — this file schedules and prioritizes, it doesn't invent.

---

## In `v1.0.0` (scheduled — see `v1.md` for day-by-day)

| Module       | Requirement                          | Priority | Sprint |
| ------------ | ------------------------------------ | -------- | ------ |
| Auth         | FR-001 Authentication                | High     | 1      |
| Auth         | FR-002 Profile Management            | Medium   | 1      |
| Integrations | FR-003 Platform Integration          | High     | 2      |
| Integrations | FR-004 GitHub Repository Integration | High     | 2      |
| Problems     | FR-005 Problem Management (dedup)    | High     | 3      |
| Notes        | FR-006 Notes Management              | Medium   | 4      |
| Reviews      | FR-007 Spaced Repetition             | High     | 5      |
| Reviews      | FR-008 Review Queue                  | High     | 5      |
| Dashboard    | FR-009 Dashboard                     | Medium   | 6      |
| Dashboard    | FR-010 Statistics                    | Low      | 6      |
| Contests     | FR-011 Contest Tracking & Upsolving  | Medium   | 7      |

---

## Explicitly out of `v1.0.0` (per `product/scope.md` — do not pull forward)

- AtCoder, CSES, Kattis, HackerRank, CodeChef integrations
- Automatic +1 upsolving engine (beyond the basic BR-007 derivation already in v1)
- Anti-tilt / wellbeing detection beyond nothing (wellbeing is v2, not v1 — confirm against scope.md before touching this)
- Notifications (Discord, Telegram, email)
- Public API / API Keys
- Team support, Academies, Multitenancy
- Native mobile app

If you catch yourself building any of these before `v1.0.0` is tagged, stop — it's the exact scope-creep pattern that stalled project selection before the roadmap existed.

---

## Parked ideas (not committed to any version)

Use this section during v1 development. If something good comes to mind mid-sprint that isn't already in scope.md, write it here with one line and move on. Do not evaluate it, do not start it. Revisit this list only after `v1.0.0` ships.

- (empty — add here as they come up)

---

## Traceability check

Before closing any sprint, confirm:

- [ ] Every FR touched has its acceptance criteria manually verified
- [ ] Every BR enforced has a corresponding test
- [ ] No module was touched that isn't in that sprint's scope (check `v1.md`)
