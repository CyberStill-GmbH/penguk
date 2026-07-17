# Functional Requirements — Penguk

## Introduction

Brief description of the system capabilities.

---

# FR-001: User Authentication

## Description

The system must allow users to create an account and authenticate,
either via GitHub OAuth or via email and password.

## Actors
- User

## Priority
High

## Acceptance Criteria
- User can sign in via GitHub OAuth.
- User can register and authenticate with email and password.
- Invalid credentials are rejected.
- User session persists across page reloads.
- User can log out.

---

# FR-002: Profile Management

## Description

The system must allow users to manage their profile.

## Actors

- User

## Priority

Medium

## Acceptance Criteria

- User can update preferences.
- User can delete their account.
- User can export personal data.

---

# FR-003: Platform Integration

## Description

The system must allow users to connect external competitive programming platforms.

## Actors

- User

## Priority

High

## Acceptance Criteria

- User can connect a supported platform.
- System displays synchronization status.
- Synchronization errors are reported.

# FR-004: GitHub Repository Integration

## Description

The system must allow users to connect a single Repository (Git
repository or local notes app) to sync their notes.

## Actors
- User

## Priority
High

## Acceptance Criteria
- User can connect exactly one Repository at a time (BR-010).
- Connecting a new Repository requires disconnecting the previous one.
- If a Git repository does not exist, the system creates it automatically.
- User can select a local notes app (Obsidian, Notion) as their Repository instead.

---

# FR-005: Problem Management

## Description

The system must import and store Problems from connected platforms
without creating duplicates.

## Actors
- User

## Priority
High

## Acceptance Criteria
- Each Problem is uniquely identified by platform + externalId (BR-004).
- Synchronizing an already-known Problem updates it instead of duplicating it.
- Problem details (title, difficulty, tags) are kept up to date on sync.

---

# FR-006: Notes Management

## Description

The system must let users view and manage Notes stored in their
connected Repository, optionally linked to a Problem.

## Actors
- User

## Priority
Medium

## Acceptance Criteria
- User can view Notes rendered from their Repository's Markdown files.
- A Note can be linked to zero or one Problem (BR-006).
- Notes remain stored in the user's Repository; Penguk does not become
  their primary storage.

---

# FR-007: Spaced Repetition

## Description

The system must schedule and update Problem Reviews based on the
user's review outcomes.

## Actors
- User

## Priority
High

## Acceptance Criteria
- A successful Review increases the Problem Review's interval (BR-003).
- A failed Review decreases retention progress (BR-003).
- nextReviewDate can never be set before the last recorded Review (BR-002).
- Each Review outcome is logged and kept in history.

---

# FR-008: Review Queue

## Description

The system must present the user's pending Problem Reviews grouped by
urgency.

## Actors
- User

## Priority
High

## Acceptance Criteria
- Reviews are grouped into: Overdue, Today, Tomorrow, This Week.
- User can mark a Review as remembered or forgotten directly from the queue.
- User can postpone or reset a Problem Review's schedule.

---

# FR-009: Dashboard

## Description

The system must display an aggregated overview of the user's progress.

## Actors
- User

## Priority
Medium

## Acceptance Criteria
- Dashboard shows solved Problems, pending Reviews, and current streak.
- Dashboard reflects data from all connected platforms.
- Data updates after each successful synchronization.

---

# FR-010: Statistics

## Description

The system must provide breakdowns of the user's progress by platform,
language, difficulty, and tag.

## Actors
- User

## Priority
Low

## Acceptance Criteria
- User can filter statistics by platform, tag, and difficulty.
- Statistics are computed from synchronized Problem and Problem Review data.

---

# FR-011: Contest Tracking

## Description

The system must track Contests and derive obligatory Upsolves from the
user's Contest Participation.

## Actors
- User

## Priority
Medium

## Acceptance Criteria
- System records a Contest Participation after a contest the user took part in.
- The first unsolved Problem, in ascending difficulty order, is marked
  as an obligatory Upsolve (BR-007).
- User can view pending and completed Upsolves.