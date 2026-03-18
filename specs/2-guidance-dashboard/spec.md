# Feature Specification: Career Guidance, Dashboard & User Provisioning

**Feature Branch**: `main` (no separate branch — working directly on main)
**Created**: 2026-03-16
**Status**: Draft
**Input**: Phase 2 + Phase 3 — Complete the API layer (career guidance generation, dashboard aggregation, Clerk webhook), then build the dashboard UI as a server-rendered page showing a student's complete career profile.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Student Generates AI Career Guidance (Priority: P1)

A signed-in student who has completed their MBTI + IQ assessment requests AI-generated career recommendations. The platform analyses their personality type, IQ score, qualification level, and skills, then returns 3–5 career paths — each with a match score, reasoning, market outlook for Pakistan, and a step-by-step learning roadmap. The guidance is saved so it can be viewed again later without re-running the AI.

**Why this priority**: This is the primary value proposition of the platform. Assessment data is only useful if it produces actionable career recommendations. Without guidance generation, the platform has no output for the student.

**Independent Test**: A signed-in student with an existing assessment can POST to the guidance endpoint and receive 3–5 career paths with match scores and roadmaps. The response is stored and retrievable via GET — verifiable without the dashboard page being built.

**Acceptance Scenarios**:

1. **Given** a signed-in student with a completed assessment, **When** they request career guidance, **Then** the system returns 3–5 career paths, each with a title, match score (0–100), reasoning, market outlook, and at least one roadmap step.

2. **Given** a signed-in student, **When** they request guidance and the AI service is unavailable, **Then** the system returns a service-unavailable error and makes no database write.

3. **Given** a signed-in student, **When** they request guidance and the AI returns a malformed or incomplete response, **Then** the system returns a service-unavailable error — the malformed data is never saved to the database.

4. **Given** a signed-in student with no completed assessment, **When** they request career guidance, **Then** the system returns a clear error indicating that an assessment must be completed first.

5. **Given** a visitor NOT signed in, **When** they attempt to request guidance, **Then** the system refuses with an Unauthorized error — no assessment lookup or AI call is made.

6. **Given** a signed-in student who has previously generated guidance, **When** they request it again, **Then** the system returns their saved guidance via GET — no duplicate AI call is needed.

---

### User Story 2 — Student Views Complete Career Dashboard (Priority: P1)

A signed-in student opens their dashboard and sees their complete career profile in one place: their MBTI type, IQ score, most recent skill match percentage, top 3 career paths with compatibility bars, top missing skills, and quick-action buttons for the most common next steps. The page loads in a single server-rendered request — no visible loading spinners per section.

**Why this priority**: The dashboard is the student's home page and the primary surface where all other features converge. It is the visual proof that the platform delivers value. It must work as a unified experience, not a collection of separate loading states.

**Independent Test**: A signed-in student with data in all 3 tables (assessment, guidance, skill gap) sees all sections populated correctly from a single page load. A student with no data in one table sees that section in an empty/pending state — not an error.

**Acceptance Scenarios**:

1. **Given** a signed-in student with complete data (assessment + guidance + skill gap), **When** they open the dashboard, **Then** all sections are populated: MBTI type, IQ score, skill match %, top 3 career paths with match bars, and top missing skills.

2. **Given** a signed-in student with only an assessment (no guidance or skill gap yet), **When** they open the dashboard, **Then** the assessment section is populated and the guidance/skill gap sections show a "Not completed yet" prompt with a call-to-action.

3. **Given** a visitor NOT signed in, **When** they navigate to `/dashboard`, **Then** they are redirected to the sign-in page — the dashboard page never renders for unauthenticated users.

4. **Given** a signed-in student, **When** the dashboard loads, **Then** all data is fetched in a single server request — the student does not see separate per-section loading states.

5. **Given** a signed-in student on the dashboard, **When** they click "Retake Assessment", **Then** they are navigated to the assessment page. **When** they click "New Skill Gap Scan", **Then** they are navigated to the skill gap page.

---

### User Story 3 — Student Retrieves Previously Generated Guidance (Priority: P2)

A signed-in student who has already generated career guidance can retrieve their saved recommendations at any time without triggering a new AI call. The guidance is available as long as their account exists.

**Why this priority**: Persistence of AI-generated results is a core data integrity expectation. Students should not have to re-pay AI quota every time they view their guidance.

**Independent Test**: A student can GET their previously generated guidance and receive the same data that was returned during generation — no new AI call occurs.

**Acceptance Scenarios**:

1. **Given** a signed-in student with saved guidance, **When** they GET their guidance, **Then** the system returns the stored record with all career paths, overall timeline, and generation timestamp.

2. **Given** a signed-in student who has never generated guidance, **When** they GET their guidance, **Then** the system returns a 404 with a clear "No guidance found" message.

3. **Given** a signed-in student, **When** they GET their guidance, **Then** the response contains only their own data — never another user's career paths.

---

### User Story 4 — New User Account is Pre-Provisioned on Sign-Up (Priority: P2)

When a new student creates a Clerk account, the platform automatically creates a corresponding record in the database. This ensures the dashboard and other routes always have a valid user anchor — they never encounter a "user not found" error purely due to a missing DB record.

**Why this priority**: Without pre-provisioning, edge cases arise where Clerk has a user but the DB does not. This causes subtle failures in routes that JOIN user data. Solving it once at sign-up prevents defensive checks everywhere else.

**Independent Test**: When a Clerk sign-up webhook fires, a new record is created in the database. If the same event fires twice (Clerk retry), only one record exists — duplicate events are handled idempotently.

**Acceptance Scenarios**:

1. **Given** a new user signs up via Clerk, **When** the webhook fires, **Then** a database record is created with the user's clerkId, name, and email.

2. **Given** a duplicate webhook event for the same user, **When** it is processed, **Then** the system handles it idempotently — no duplicate records are created and no error is returned.

3. **Given** a webhook event with an invalid or missing signature, **When** it is received, **Then** the system rejects it with a 401 — no database write occurs.

4. **Given** a webhook event for a user that already has assessment data, **When** it is processed, **Then** the existing data is not overwritten or corrupted.

---

### Edge Cases

- What happens when a student requests guidance but their assessment record was deleted mid-request?
- What if the dashboard API call returns partial data (one table fails)? → System returns 500 for the entire request — no partial data.
- What if the Clerk webhook fires before the database is ready (cold start)?
- What if guidance generation succeeds but the DB write fails — the system returns 500 and the AI response is lost. Student must retry.
- What if a student has multiple guidance records (re-generated)? → GET and dashboard always return the most recently created record ordered by `generatedAt` desc.
- What if the MBTI/IQ data in the assessment record is malformed when guidance tries to read it?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Foundation

- **FR-F01**: The system MUST expose a single `GET /api/dashboard` endpoint that aggregates data from all three tables (`career_assessments`, `career_guidance`, `skill_gaps`) in a single server request using parallel queries and returns a unified response.
- **FR-F02**: The dashboard page MUST be a server-rendered page — data fetching occurs on the server before the page is sent to the browser.
- **FR-F03**: The `POST /api/webhooks/clerk` endpoint MUST validate the Clerk webhook signature before processing any payload.

#### Career Guidance Generation (POST /api/generateguidance)

- **FR-001**: The system MUST reject requests to generate guidance from unauthenticated users with an Unauthorized response.
- **FR-002**: The system MUST reject guidance generation requests if the requesting user has no completed assessment in the database, returning a clear "assessment required" error.
- **FR-003**: The system MUST send the user's personality type, IQ score, qualification, and skills to the AI service to generate career recommendations.
- **FR-004**: The AI response MUST contain between 3 and 5 career paths, each with: title, match score (0–100), reasoning, market outlook, and roadmap steps.
- **FR-005**: The system MUST validate the AI response against the expected schema before writing to the database — a malformed AI response MUST return a 503 with no database write.
- **FR-005b**: If the AI call succeeds and schema validation passes but the database write fails, the system MUST return a 500 error. The AI response is not returned to the client — the student must retry.
- **FR-006**: On successful validation, the system MUST save the guidance tied to the user's session identity and their assessment record.
- **FR-007**: The saved guidance record MUST include an overall timeline with a short-term goal and a long-term goal.

#### Career Guidance Retrieval (GET /api/generateguidance)

- **FR-008**: The system MUST reject unauthenticated GET requests with an Unauthorized response.
- **FR-009**: The system MUST return the most recently generated guidance record for the authenticated user.
- **FR-010**: The system MUST return a 404 with a "No guidance found" message if no guidance exists for the user.
- **FR-011**: The system MUST return only the requesting user's guidance — never another user's data.

#### Dashboard Aggregation (GET /api/dashboard)

- **FR-012**: The system MUST reject unauthenticated dashboard requests with an Unauthorized response.
- **FR-013**: The system MUST return a unified response containing: assessment summary (MBTI type, IQ score), most recent guidance summary (top 3 career paths with match scores), and most recent skill gap summary (compatibility score, top missing skills).
- **FR-014**: If a section has no data (e.g., student has no guidance yet), the system MUST return `null` for that section — not an error. This applies to missing data only, not query failures.
- **FR-014b**: If any of the 3 table queries throws an error during a dashboard request, the system MUST return a 500 for the entire response — no partial data is returned.
- **FR-015**: The response MUST be shaped for direct consumption by the dashboard page with no additional client-side transformation required.

#### Dashboard Page (/dashboard)

- **FR-016**: The dashboard page MUST redirect unauthenticated users to the sign-in page — it MUST NOT render for users without a valid session.
- **FR-017**: The dashboard MUST display: welcome banner (student name), MBTI type card, IQ score card, skill match percentage card, top 3 career paths with compatibility bars, top missing skills list, and quick-action buttons.
- **FR-018**: Sections with no data MUST show a clear "not yet completed" state with a prompt to take the relevant action — not an error or blank space.

#### Clerk Webhook (POST /api/webhooks/clerk)

- **FR-019**: The system MUST verify the Clerk webhook signature using the `CLERK_WEBHOOK_SECRET` environment variable before processing any event.
- **FR-020**: On a `user.created` event, the system MUST create a record in the dedicated `users` table with the user's `clerkId`, `name`, and `email`. This table is separate from `career_assessments` — no empty assessment row is created.
- **FR-021**: The webhook handler MUST be idempotent — processing the same event twice MUST NOT create duplicate records.
- **FR-022**: The system MUST return a 200 response to Clerk immediately after successful processing — delayed responses cause Clerk to retry.

### Key Entities

- **User**: A provisioned platform account. Created by the Clerk webhook on sign-up. Fields: `clerkId` (unique), `name`, `email`, `createdAt`. This is a dedicated `users` table — separate from assessment data.
- **Career Guidance**: An AI-generated record tied to one user and one assessment. Contains 3–5 career paths and an overall timeline. Created once per guidance request; GET returns the most recent.
- **Career Path**: A single recommended career within a guidance record. Has title, match score, reasoning, market outlook, and a roadmap of learning steps.
- **Dashboard Response**: A read-only aggregated view combining the latest record from each of the three tables for a given user. Not persisted — assembled on request.
- **Roadmap Step**: A single actionable item within a career path. Has a step description and a suggested resource (course, website, book).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Career guidance is generated and returned to the student in under 15 seconds (p90).
- **SC-002**: The dashboard page is fully server-rendered and visible to the student in under 3 seconds (p95) on a standard connection.
- **SC-003**: 100% of unauthenticated requests to `/api/generateguidance` and `/api/dashboard` return an Unauthorized (401) response; requests to `/api/webhooks/clerk` with missing or invalid signatures return a rejected (400 or 401) response — no data is leaked in any case.
- **SC-004**: AI guidance generation fails gracefully — 100% of AI failures return a 503 with no partial data written to the database.
- **SC-005**: The dashboard aggregates all 3 data types in a single server request — the student sees no per-section loading states.
- **SC-006**: The Clerk webhook processes `user.created` events idempotently — 0 duplicate user records created regardless of retry count.
- **SC-007**: All tests run without a live database or live AI service — the full test suite completes in CI with mocks only.
- **SC-008**: A student with data in all 3 tables sees a fully populated dashboard in one page load — 0 additional client-side data fetches.

---

## Clarifications

### Session 2026-03-16

- Q: Where does the Clerk webhook write the new user record — which table? → A: A new dedicated `users` table (`clerkId`, `name`, `email`, `createdAt`). Separate from `career_assessments`. No empty assessment row created.
- Q: If guidance AI call succeeds but DB write fails, what does the system return? → A: Return 500 — guidance is lost, student must try again. Consistent with assessment and skill gap error handling.
- Q: If one of the 3 table queries fails during a dashboard request, what does the system return? → A: Return 500 for the entire dashboard — all or nothing. No partial data returned.
- Q: Can a student POST to generate guidance multiple times? → A: Yes — each POST creates a new record. Previous records stay in DB. GET and dashboard always show the most recent.

---

## Assumptions

1. **Assessment prerequisite for guidance**: A student must have a completed assessment before generating guidance. The guidance route reads from `career_assessments` to build the AI prompt.
2. **Multiple guidance records allowed**: Students may POST to generate guidance any number of times — each call creates a new record. GET and the dashboard always surface the most recently created record (ordered by `generatedAt` desc). Old records remain in the DB but are never surfaced.
3. **Clerk webhook events**: Only the `user.created` event is handled in this phase. `user.updated` and `user.deleted` are deferred.
4. **Dashboard null sections**: If a student has no guidance or no skill gap, those sections return `null` from the API. The UI shows a prompt, not an error.
5. **Pakistan market context**: AI prompts for career guidance MUST explicitly request market outlook relevant to Pakistan — this is part of the prompt design, not a user-facing input.
6. **No re-generation UI in this phase**: The dashboard shows previously generated guidance. Re-generating guidance is a direct call to POST /api/generateguidance — no dedicated UI button is built in this phase.
7. **Supabase free tier**: The DB may pause after 7 days of inactivity. This is a deployment concern, not a feature concern — handled by keeping the project active.

---

## Out of Scope

- Jobs & internships matching (JSearch, Adzuna, Rozee.pk, JobMatchAgent) — deferred per constitution
- User-facing guidance re-generation button on the dashboard
- Guidance history (viewing past guidance records) — only the latest is shown
- `user.updated` and `user.deleted` Clerk webhook events
- Email notifications when guidance is ready
- PDF export of career guidance or dashboard
- Mobile-specific responsive optimisations (basic responsiveness assumed from existing Tailwind setup)
