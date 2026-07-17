# Domain Model — Penguk

## Entities

## User (Aggregate Root)

Represents a person using Penguk.

Attributes:
- id
- username
- email
- preferences

---

## Account (Entity, part of User aggregate)

Belongs to the User aggregate — enforces BR-009 (max one per platform)
as part of the same transaction that creates/deletes a User's accounts.

Attributes:
- id
- userId
- platform
- handle

---

## Integration (Aggregate Root)

Independent aggregate so background sync jobs can update it without
touching the User aggregate at all.

Attributes:
- id
- accountId
- status
- lacstSync
- lastError

---

## Problem (Aggregate Root)

Represents a competitive programming problem, shared across all users.

Attributes:
- id
- externalId
- title
- platform
- difficulty
- tags

---

## Problem Review (Aggregate Root)

Represents a User's personal tracking of a Problem: its schedule,
history, and solution reference.

Attributes:
- id
- userId
- problemId
- nextReviewDate
- interval
- retentionLevel
- status
- solutionReference

---

## Review (Entity, part of Problem Review aggregate)

Represents a single repetition attempt logged against a Problem Review.

Attributes:
- id
- problemReviewId
- result (success | failed)
- reviewedAt

---

## Contest (Aggregate Root)

Represents a timed competitive programming event, shared across all users.

Attributes:
- id
- externalId
- platform
- problems (ordered list of Problem references)
- startDate

---

## Contest Participation (Aggregate Root)

Represents a specific User's participation in a Contest, independent from
Contest and User so synchronization jobs can write to it without locking
either aggregate.

Attributes:
- id
- userId
- contestId
- solvedProblemIds (list)
- rank
- ratingChange

---

## Upsolve (Aggregate Root)

A historical record of an obligatory upsolve derived from a Contest
Participation, kept even after completion for analytics/mapping purposes.

Attributes:
- id
- userId
- contestId
- problemId
- problemReviewId (nullable until the user starts working on it)
- status (pending, completed, skipped)
- createdAt
- completedAt

---

## Repository (Entity, part of User aggregate)

Attributes:
- id
- userId
- type (git | obsidian | notion)
- url

---

## Note (Entity, part of Repository aggregate)

Attributes:
- id
- repositoryId
- problemId (optional)
- path
- content