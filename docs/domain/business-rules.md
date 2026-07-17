# Business Rules — Penguk

## BR-001 Problem Ownership

A Problem Review belongs to exactly one User.

---

## BR-002 Review Scheduling

A Problem Review's nextReviewDate cannot be before the last review date registered.

---

## BR-003 Spaced Repetition

A successful review increases the next review interval.

A failed review decreases retention progress.

---

## BR-004 Synchronization

A synchronization process must not create duplicated Problems.

---

## BR-005 External Platforms

Penguk does not modify data on external platforms.

It only imports and organizes information.

---

## BR-006 Notes

A Note belongs to the user repository source.

Penguk does not become the primary storage of notes.

## BR-007 Upsolving +1

After a Contest Participation is synchronized, the first Problem in the
Contest's ordered list not present in solvedProblemIds is automatically
marked as an obligatory Upsolve.

## BR-008 Account and Data Erase

A user can export their data at any time.

Deleting an account permanently and irreversibly removes all user data from Penguk.

## BR-009 User Identity vs Integrations

A user can register without having any platform connected.

A user must have at most one account connected per platform.

## BR-010 Unique Repository

A user can have at most one Repository connected at a time.

Connecting a new Repository requires disconnecting the previous one first.

If the selected Repository is a Git repository and it does not exist,
Penguk creates it automatically.

A local notes app (e.g. Obsidian, Notion) can also be selected as the user's Repository.

## BR-011 Authentication Methods

A User must have at least one authentication method (GitHub OAuth or
email/password).

If both are configured, either can be used to log in to the same account.