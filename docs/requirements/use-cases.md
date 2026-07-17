# Use Cases — Penguk

---

# UC-001 Authenticate User

## Actor
User

## Preconditions
- None (covers both first-time registration and returning login).

## Main Flow
1. User opens the login page.
2. User selects an authentication method (GitHub OAuth or email/password).
3a. If GitHub OAuth: system redirects to GitHub, receives authorization, and either logs in the matching User or creates a new one (FR-001).
3b. If email/password: system validates credentials against stored hash.
4. System creates an authenticated session.
5. User is redirected to the dashboard.

## Alternative Flows
- Invalid email/password credentials: system rejects login and shows an error.
- User cancels or is denied at the GitHub OAuth screen: system returns to login page, no session created.
- GitHub OAuth provider is unavailable: system shows a retry option, session is not created.

## Postconditions
User has an authenticated session and access to the application.

---

# UC-002 Connect GitHub Repository

## Actor
User

## Preconditions
- User is authenticated.

## Main Flow
1. User navigates to Repository settings.
2. User chooses a Repository type: Git repository or local notes app (Obsidian, Notion).
3. If Git and the repository does not exist, system creates it automatically (BR-010).
4. If the User already has a Repository connected, system disconnects the previous one first (BR-010).
5. System confirms the new Repository as connected.

## Alternative Flows
- Git provider authorization fails: connection is aborted, previous Repository (if any) remains unchanged.
- User cancels the disconnect-and-replace step: no changes are made.

## Postconditions
User has exactly one Repository connected.

---

# UC-003 Synchronize Platform Data

## Actor
System (background job), triggered by User action or schedule

## Preconditions
- User has at least one Account with an active Integration.

## Main Flow
1. Sync job picks up a pending Integration.
2. System fetches data from the external platform's API.
3. System matches incoming Problems by (platform + externalId), updating existing ones instead of duplicating (BR-004).
4. System updates the user's Contest Participation and Problem Review records as needed.
5. System updates the Integration's status and lastSync timestamp.

## Alternative Flows
- External API returns a rate-limit error: job is rescheduled with backoff, Integration status remains unchanged (NFR-004).
- External API is unreachable: Integration is marked as errored with lastError populated, previously stored data remains unchanged.

## Postconditions
Problem, Contest Participation, and Integration data reflect the latest successful sync.

---

# UC-004 Review Problem

## Actor
User

## Preconditions
- A Problem Review exists and is due (or the User manually selects one).

## Main Flow
1. User opens the Review Queue.
2. User selects a due Problem Review.
3. User marks the review outcome as successful or failed.
4. System logs a Review event (BR-003).
5. System updates the Problem Review's nextReviewDate and interval accordingly (BR-002, BR-003).

## Alternative Flows
- User postpones the review: nextReviewDate is updated without logging a Review event.
- User resets the Problem Review: interval and retention level return to their base state.

## Postconditions
The Problem Review's schedule and history reflect the latest outcome.

---

# UC-005 Create Note

## Actor
User

## Preconditions
- User has a Repository connected.

## Main Flow
1. User opens the Notes section.
2. User writes or edits Markdown content.
3. User optionally links the Note to a Problem.
4. System writes the Note to the connected Repository (BR-006).

## Alternative Flows
- No Repository is connected: system prompts the user to connect one first (UC-002).
- Write to the Repository fails (e.g. Git push error): Note is kept locally as unsaved, user is notified.

## Postconditions
The Note exists in the User's Repository, optionally linked to a Problem.

---

# UC-006 View Dashboard

## Actor
User

## Preconditions
- User is authenticated.

## Main Flow
1. User opens the Dashboard.
2. System retrieves aggregated data: solved Problems, pending Reviews, streak, and connected platforms.
3. System displays the aggregated view.

## Alternative Flows
- One or more Integrations are errored: Dashboard still renders using last successfully synced data, with a warning indicator.

## Postconditions
User sees an up-to-date (or clearly marked as stale) overview of their progress.

---

# UC-007 Export User Data

## Actor
User

## Preconditions
- User is authenticated.

## Main Flow
1. User requests a data export from account settings.
2. System compiles the User's data: profile, Problem Reviews, Notes references, Contest Participations, Upsolves.
3. System generates a downloadable file.
4. User downloads the file.

## Alternative Flows
- Export generation fails: user is notified and can retry.

## Postconditions
User has a complete copy of their personal data.

---

# UC-008 Delete Account

## Actor
User

## Preconditions
- User is authenticated.

## Main Flow
1. User requests account deletion.
2. System reminds the user they can export their data first (UC-007), if not already done.
3. User confirms deletion.
4. System permanently deletes all User data: Accounts, Integrations, Problem Reviews, Upsolves, Notes references (BR-008).
5. System does not modify any data on external platforms (BR-005).

## Alternative Flows
- User cancels the confirmation step: no data is deleted.

## Postconditions
All of the User's data is permanently removed from Penguk.