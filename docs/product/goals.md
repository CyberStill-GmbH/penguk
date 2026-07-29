# Goals — Penguk

## Product Goals

- That a user can see, in one place, their real progress in competitive programming (solved problems, rating, notes), without having to access 3 different platforms.

- That the spaced repetition system actually reduces pattern forgetting (DP, graphs, etc.), not just exists as a feature.

- That notes reside where the user already works (their repository, their Obsidian), not in yet another proprietary editor.

- That the product is usable from the MVP stage, not just a promise of "when it's complete."

## User Goals

- Stop wasting time manually organizing folders of solutions and loose notes.

- Know what to review today without having to remember it on their own.

- See real progress (not just "solved problems") to know if the study method is working.

- Have clear evidence of their progress to show in job interviews.

## Business Goals

- Validate that a real community exists that is willing to use and contribute to the tool (issues, pull requests, stars on GitHub).

- Keep infrastructure costs to a minimum while the project is open-source and not monetized.

- If monetization is explored in the future (e.g., features for teams/academies), ensure that the MVP architecture does not hinder it.

## Engineering Goals

- Modular architecture from day one (Auth, Integrations, Problems, Reviews, Notes as separate modules in NestJS) to allow for growth without rewriting.

- External synchronizations (LeetCode, Codeforces, GitHub) resilient to rate limits and outages, using queues (BullMQ) instead of synchronous calls.

- Basic test coverage in the SRS logic and integration parsers, as these are the areas where silent failures are most likely to occur. - Documented code and decisions (README, simple ADRs) so others can contribute without having to ask you everything.

## Learning Goals

- Practice designing systems with queues and background jobs in a real-world use case, not a tutorial.

- Learn to design your own spaced repetition algorithm (or adapt an SM-2 type) instead of copying a library.

- Gain experience maintaining an open-source project from start to finish: scope, roadmap, contributions, releases.

- Have a portfolio project that demonstrates real backend architecture, not just another CRUD application.

## Success Metrics

**Build Success Metrics**

The MVP is considered complete when:

- A user can authenticate successfully.
- A GitHub repository can be connected.
- At least one competitive programming platform can be synchronized.
- Solved problems are imported correctly.
- Daily review queues are generated automatically.
- Personal Markdown notes are displayed correctly.
- The application can be deployed to production.
- Core modules have automated tests.
- API documentation is available.

**Product (after the MVP)**

- Percentage of scheduled reviews that are actually completed (measures if the SRS is actually used, not just if it exists).

- Average time between "issue resolved" and "note/upsolve recorded" (measures if the flow is sufficiently low friction).

- 30-day retention: users who are still syncing data one month after signing up.

**Engineering**

- Background sync uptime (goal: minimize silent failures).

- Dashboard response time with already synced data (perceived < 500ms).
