# Scope — Penguk

Penguk focuses on a single workflow: synchronizing solved problems from external competitive programming platforms, organizing them with personal notes, and improving long-term retention through spaced repetition. Every feature included in the MVP supports this workflow.

---

# In Scope

## User Management

- Authentication with GitHub OAuth and email/password
- User profile management
- Time zone and language preferences
- Light and dark themes
- Export personal data
- Delete account

---

## Supported Platforms (MVP)

- GitHub
- LeetCode
- Codeforces

---

## Planned Integrations

- AtCoder
- CSES
- Kattis
- HackerRank
- CodeChef

For every integration:

- Connect
- Disconnect
- Synchronize
- Synchronization status
- Last synchronization
- Error reporting

---

## GitHub Repository & Notes

- Connect a GitHub repository
- Read Markdown files from a configurable directory
- Associate commits with solved problems through GitHub Webhooks
- Markdown editor and viewer
- Code syntax highlighting

---

## Spaced Repetition (SRS)

Provide a spaced repetition workflow for reviewing solved problems.

The system should support:

- Review scheduling
- Review history
- Daily review queue
- Overdue reviews
- Remembered / Forgotten / Snooze / Restart actions

---

## Dashboard & Statistics

Provide dashboards and statistics about the user's learning progress.

Including:

- Solved problems
- Pending reviews
- Daily streak
- Reviews completed
- Statistics by platform
- Statistics by language
- Statistics by difficulty
- Statistics by tag

---

## +1 Upsolving

After a contest, Penguk should be able to:

- Detect the first unsolved problem
- Suggest the next problem with a slightly higher difficulty
- Add it to the review queue as a recommended upsolve

---

## Contests

- Upcoming contest calendar
- Contest history
- Rating history
- Contest metrics (AC, WA, TLE, time)

---

## Wellbeing

Provide lightweight wellbeing features.

Initially:

- Detect repeated unsuccessful submissions
- Suggest taking a short break

---

# Out of Scope

Penguk is **not** intended to:

- Execute or compile code.
- Replace competitive programming platforms.
- Become an online judge.
- Provide a social network or discussion platform.
- Replace GitHub.
- Become a general-purpose note-taking application.
- Provide a native mobile application.
- Support organizations, academies, or multitenancy in the MVP.

---

# MVP

The MVP is considered complete when a user can complete the following workflow:

1. Create an account or sign in.
2. Connect GitHub.
3. Connect LeetCode and Codeforces.
4. Synchronize solved problems.
5. Read personal Markdown notes stored in GitHub.
6. Review solved problems using spaced repetition.
7. Return on another day and continue where they left off.

The MVP intentionally excludes advanced analytics, notifications, anti-tilt features, coaching, and multitenancy.

---

# Future Versions

## v2 — Habits & Analytics

- Automatic +1 upsolving engine
- Pattern weakness heatmaps
- Weekly email summaries
- Discord and Telegram notifications
- Custom learning goals
- Contest reminders
- Advanced dashboards

---

## v3 — Coaching & Scaling

- Personalized recommendation engine
- Advanced anti-tilt detection
- Public REST API
- API Keys
- Swagger/OpenAPI documentation
- Team support
- Academies
- Multitenancy (subject to demand)

---

# Success Criteria

The MVP is successful if a new user can:

- Sign in successfully.
- Connect GitHub.
- Connect at least one competitive programming platform.
- Synchronize solved problems.
- Read personal notes.
- Complete today's review session.
- Return another day and continue learning without losing progress.

---

# Assumptions

- Users already solve problems on external competitive programming platforms.
- Users maintain notes inside GitHub repositories.
- External platform APIs remain available.
- Users have a stable internet connection.

---

# Constraints

- No code execution.
- Desktop-first experience.
- Responsive web application (PWA).
- English is the primary language.
- Single-user SaaS for the MVP.