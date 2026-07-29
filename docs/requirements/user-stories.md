# User Stories — Penguk

---

## US-001 Authentication

### Story

As a user,
I want to authenticate with GitHub OAuth or with email and password,
so that I can access my personal progress using whichever method I prefer.

### Acceptance Criteria

- Given I have a GitHub account, when I authenticate via GitHub OAuth, then I can access my Penguk profile.
- Given I have registered with email and password, when I enter valid credentials, then I can access my Penguk profile.
- Given I enter invalid credentials, when I try to log in, then I see an error and no session is created.

---

## US-002 Connect Platform

### Story

As a competitive programmer,
I want to connect my LeetCode account,
so that Penguk can synchronize my solved problems.

### Acceptance Criteria

- Platform connection succeeds.
- Problems are imported.
- Synchronization status is visible.

---

## US-003 Manage Profile

### Story

As a user,
I want to update my preferences and manage my account,
so that Penguk fits how I actually work and I stay in control of my data.

### Acceptance Criteria

- Given I change a preference (timezone, theme, language), when I save it, then it applies immediately.
- Given I request account deletion, when I confirm it, then all my data is permanently removed.
- Given I request a data export, when it's ready, then I can download a file with my personal data.

---

## US-004 Connect Repository

### Story

As a user,
I want to connect a single Repository (Git or a local notes app),
so that my notes and post-mortems live where I already work.

### Acceptance Criteria

- Given I don't have a Repository connected, when I connect one, then it becomes my active Repository.
- Given I already have a Repository connected, when I connect a new one, then the previous one is disconnected first.
- Given I connect a Git repository that doesn't exist yet, when I confirm, then Penguk creates it automatically.

---

## US-005 Track Problems

### Story

As a competitive programmer,
I want my solved problems to be tracked without duplicates,
so that my progress stays accurate across every sync.

### Acceptance Criteria

- Given a Problem already exists from a previous sync, when it's synced again, then it's updated, not duplicated.
- Given a new Problem is solved on a connected platform, when I sync, then it appears in my tracked Problems.

---

## US-006 Write Notes

### Story

As a user,
I want to write notes about a problem I solved,
so that I can capture my approach and learn from my mistakes later.

### Acceptance Criteria

- Given I have a Repository connected, when I write a Note, then it's saved to my Repository.
- Given I'm writing a Note, when I link it to a Problem, then I can find it later from that Problem.
- Given I haven't connected a Repository, when I try to create a Note, then I'm prompted to connect one first.

---

## US-007 Spaced Repetition Scheduling

### Story

As a competitive programmer,
I want my reviews to be scheduled automatically based on how well I remember each problem,
so that I don't forget patterns I already learned.

### Acceptance Criteria

- Given I mark a review as successful, when it's saved, then my next review interval increases.
- Given I mark a review as failed, when it's saved, then my retention progress decreases.
- Given a review is due, when I check it, then its next review date is never before my last recorded review.

---

## US-008 Review Queue

### Story

As a user,
I want to see which problems I need to review today,
so that I know exactly what to study without guessing.

### Acceptance Criteria

- Given I have pending reviews, when I open my queue, then they're grouped into Overdue, Today, Tomorrow, and This Week.
- Given I'm reviewing a problem, when I mark it remembered or forgotten, then its schedule updates accordingly.
- Given I want to delay a review, when I postpone it, then its date changes without affecting my history.

---

## US-009 Dashboard Overview

### Story

As a user,
I want to see an overview of my progress in one place,
so that I don't have to check multiple platforms to know how I'm doing.

### Acceptance Criteria

- Given I open my dashboard, when data has synced successfully, then I see my solved problems, pending reviews, and streak.
- Given one of my integrations is failing, when I view my dashboard, then I still see my last synced data with a warning.

---

## US-010 View Statistics

### Story

As a user,
I want to break down my progress by platform, language, difficulty, and tag,
so that I can see where I'm actually improving and where I'm stuck.

### Acceptance Criteria

- Given I have synced data, when I open statistics, then I can filter by platform, tag, and difficulty.
- Given I filter my statistics, when results update, then they reflect only my synced Problems and Problem Reviews.

---

## US-011 Contest Tracking and Upsolving

### Story

As a competitive programmer,
I want Penguk to automatically flag the problem I should upsolve after a contest,
so that I don't skip the hardest and most valuable part of improving.

### Acceptance Criteria

- Given I participated in a contest, when it syncs, then my participation (solved problems, rank, rating change) is recorded.
- Given I have unsolved problems in a synced contest, when the sync completes, then the first unsolved problem in ascending difficulty order is marked as an obligatory Upsolve.
- Given I have pending Upsolves, when I check them, then I can see which are pending and which are completed.
