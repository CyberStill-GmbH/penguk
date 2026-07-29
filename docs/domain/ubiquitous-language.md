# Ubiquitous Language — Penguk

## User

A perosn who register in Penguk to track their Competitive Programing progress.

A User can exist wothout any Account or Repository connected (BR-009).

## Account

A user's idetity on an external platform (e.g. a Codeforces handle or a Leetcode username), linked to exactly one User per platform (BR-009).

An Account is what an Integration authenticates and syncs data through.

## Repository

The single external resource where a User's Notes are stored: either Git repository or a local notes app (e.g. Obsidian, Notion).

A User has at most one Repository connected at a time (BR-010).

## Note

A piece of content written by a User about a problem (approach, post-mortem, template), stored in their Repository, not owned by Penguk (BR-006).

## Contest

A timed competitive programming event on an external platform, containing an ordered set of Problems by difficulty.

A Contest's unsolved Problems are the source for the Upsolve rule (BR-007).

## Contest Participation

The record of a specific User's results in a Contest: which Problems
they solved, their rank, and rating change. It is the source data used
to derive Upsolves.

## Problem

A competitive programming problem from an external platform, shared across all users.

A Problem contains:

- Platform
- Difficulty
- Tags

---

## Problem Review

The relathionship between a User and a Problem, tracking that user's personal progress

A Problem Review contains:

- Solution reference
- Review Schedule
- Review History

---

## Review

An event where users evaluates their retention of a Problem, marked as successful or failed, which updates the Review Schedule.

---

## Review Schedule

The state of a Problem Review's spaced repetition: next review date, current interval, and retention level.

---

## Integration

The technical connection between Penguk and an external platform, used to synchronize an Account's data (Problems solved, ratings, contests).

An Integration has status: connected, disconnected, last synced, or errored.

---

## Synchronization

The process of importing external platform data into Penguk.

---

## Pattern

An algorithmic concept associated with Problems.

Examples:

- Dynamic Programming
- Graphs
- Greedy

---

## Upsolve

The first unsolved Problem from a contest, in ascending order, marked as an obligatory Problem Review after contest ends.
