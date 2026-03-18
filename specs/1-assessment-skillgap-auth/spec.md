# Feature Specification: Foundation + Assessment & Skill Gap — Secure Auth + Supabase Migration

**Feature Branch**: `main` (no separate branch — working directly on main)
**Created**: 2026-03-15
**Status**: Draft
**Input**: Phase 0 + Phase 1 — Establish shared infrastructure (DB, auth guard, AI schemas, test setup), then fix and migrate career assessment and skill gap routes to Supabase with proper authentication

---

## User Scenarios & Testing *(mandatory)*

### User Story 0 — Platform Infrastructure is Ready for All Features (Priority: P0 — Blocks All Other Stories)

Before any student-facing feature can be built or tested, the platform must have a working database connection to Supabase, a single consistent mechanism for verifying user identity on every route, a validated structure for AI responses, and an automated test harness. Without these in place, every other user story is impossible to implement correctly or verify.

**Why this priority**: This is the shared foundation every other story depends on. No student-facing work can begin until this is complete — it is the single blocking prerequisite for P1 work.

**Independent Test**: The database accepts a write and a read. A request with no session returns Unauthorized. A valid AI response passes schema validation and an invalid one is rejected — all verifiable without any student-facing route being live.

**Acceptance Scenarios**:

1. **Given** the platform is deployed, **When** any API route attempts a database operation, **Then** it connects successfully to Supabase using a single shared connection — no route manages its own raw database connection.

2. **Given** a request arrives at any protected route without a valid session, **When** the auth guard is invoked, **Then** the route immediately returns an Unauthorized response and performs no database operation.

3. **Given** an AI service response for skill gap analysis, **When** the response is passed through the validation schema, **Then** a correctly structured response is accepted and an incorrectly structured response is rejected with a descriptive error — before any DB write occurs.

4. **Given** the test suite is run, **When** all test files execute, **Then** results are reported per-route with pass/fail detail — no test requires a live database or live AI service to run.

---

### User Story 1 — Student Submits Career Assessment Securely (Priority: P1)

A signed-in student completes the MBTI personality quiz and IQ test, then submits their personal profile (name, age, qualification, skills). The platform saves their assessment tied to their account so it can be retrieved on any device and used to generate career guidance later.

**Why this priority**: This is the entry point of the entire platform. Without a working, authenticated assessment submission, no other feature (guidance, dashboard, skill gap) can function. It is the first and most critical user action.

**Independent Test**: A user can sign in, submit assessment data, receive a confirmation with their MBTI type and IQ score, and the data is retrievable in a subsequent GET request — all without any other feature being present.

**Acceptance Scenarios**:

1. **Given** a signed-in student, **When** they submit a complete assessment form (name, age, qualification, MBTI answers, IQ answers, skills), **Then** the system saves the assessment, returns their MBTI personality type, IQ score, and a success confirmation.

2. **Given** a signed-in student who has already submitted an assessment, **When** they submit a new one, **Then** the system fully replaces the existing record with the new data — only one assessment record exists per user at any time.

3. **Given** a signed-in student, **When** they request their assessment data and one exists, **Then** the system returns only their own assessment — not any other user's data.

6. **Given** a signed-in student who has never submitted an assessment, **When** they request their assessment data, **Then** the system returns a 404 response with a "No assessment found" message — no empty or null data body.

4. **Given** a visitor who is NOT signed in, **When** they attempt to submit or retrieve an assessment, **Then** the system refuses the request with an "Unauthorized" error — no data is read or written.

5. **Given** a signed-in student submitting an incomplete form (missing name, age, qualification, MBTI answers, or IQ answers), **When** they submit, **Then** the system rejects the request with a clear validation error identifying the missing fields.

---

### User Story 2 — Student Uploads Resume for Skill Gap Analysis (Priority: P1)

A signed-in student uploads their resume (as a PDF file or pasted text) along with a target job description. The platform extracts the resume content, runs an AI comparison, and returns a structured analysis showing which skills the student has, which are missing, a compatibility score, and a personalised upskilling roadmap.

**Why this priority**: Skill gap analysis is the second core feature of the platform. It must work independently of career guidance — a student may only want to know how close they are to a specific job without running a full career assessment.

**Independent Test**: A user can sign in, submit a PDF resume + job description, and receive a skill gap analysis with matching skills, missing skills, a compatibility score (0–100), and a suggested upskilling roadmap — all without any other feature being present.

**Acceptance Scenarios**:

1. **Given** a signed-in student, **When** they upload a PDF resume and a job description, **Then** the system extracts the resume text server-side, runs AI analysis, saves the result, and returns: matching skills, missing skills, compatibility score, and an upskilling roadmap.

2. **Given** a signed-in student, **When** they paste plain resume text (instead of uploading a PDF) alongside a job description, **Then** the system accepts the text directly, runs AI analysis, and returns the same structured result as a PDF upload.

3. **Given** a signed-in student, **When** they request their previous skill gap analyses, **Then** the system returns only their own records, ordered most recent first.

4. **Given** a visitor who is NOT signed in, **When** they attempt to submit a resume or retrieve analyses, **Then** the system refuses with an "Unauthorized" error.

5. **Given** a signed-in student submitting a request with no resume content or no job description, **When** they submit, **Then** the system rejects the request with a clear validation error.

6. **Given** a signed-in student uploading a corrupted or empty PDF, **When** the system cannot extract text, **Then** the system returns a user-friendly error asking the student to paste their resume text instead — it does not crash or expose a technical error.

---

### User Story 3 — Student's Data is Exclusively Theirs (Priority: P1)

Every data operation — reading assessments, reading skill gap results — is scoped exclusively to the currently signed-in user. No user can access, modify, or infer another user's data through any route.

**Why this priority**: This is a non-negotiable security requirement. The platform handles sensitive personal data (age, qualifications, skills, career aspirations). Cross-user data access is a critical vulnerability.

**Independent Test**: With two separate user accounts, confirm that account A cannot retrieve or modify account B's assessment or skill gap data via any API call, regardless of what parameters are passed.

**Acceptance Scenarios**:

1. **Given** two different signed-in users (User A and User B), **When** User A requests their assessment, **Then** the system returns only User A's assessment — User B's data is never included or accessible.

2. **Given** a signed-in user, **When** any API request is made, **Then** the user identity determining which data is returned comes exclusively from the authenticated session — not from any value in the request body, URL, or query string.

---

### Edge Cases

- What happens when the AI service is unavailable during a skill gap submission? The system returns a clear service-unavailable error; no partial data is saved.
- What happens when a student submits assessment answers for only some MBTI dimensions? The system calculates MBTI from available answers — only fully unanswered dimension pairs default to a tie-break rule.
- What happens when a PDF contains only images (scanned resume with no extractable text)? The system returns a user-friendly error asking for text input instead.
- What happens when a student's session expires mid-submission? The system returns an Unauthorized error; the student is prompted to sign in again.
- What happens if the AI returns a malformed response for skill gap analysis? The system discards the result, returns a service error — no corrupted data is saved.
- What happens if the database is temporarily unavailable during a write? The system returns a service-unavailable error; no partial record is committed.

---

## Requirements *(mandatory)*

### Functional Requirements

**Foundation (Phase 0 — blocks all below)**

- **FR-F01**: The platform MUST use a single shared database connection for all routes — no route instantiates its own direct database connection.
- **FR-F02**: The platform MUST provide a single reusable authentication guard usable by any route — it extracts the user identity from the active session and returns Unauthorized if no valid session exists.
- **FR-F03**: The platform MUST define a fixed, validated structure for AI skill gap analysis responses — any AI response not matching this structure is rejected before reaching the database.
- **FR-F04**: The platform MUST have an automated test suite runnable without a live database or live AI service — all routes are testable in isolation using mocked dependencies.
- **FR-F05**: The database schema MUST define three tables — one for career assessments, one for career guidance, one for skill gap analyses — each capable of storing nested structured data natively without separate child tables.

**Career Assessment Route (Phase 1 — Stream A)**

- **FR-001**: The system MUST reject any assessment submission or retrieval request that does not have an active authenticated session, returning an Unauthorized response.
- **FR-002**: The system MUST calculate the student's MBTI personality type server-side from their submitted quiz answers — clients do not compute or pass the type directly.
- **FR-003**: The system MUST calculate the student's IQ score server-side from their submitted answers and chronological age — clients do not compute or pass the score directly.
- **FR-004**: The system MUST associate every saved assessment exclusively with the signed-in user's account identity, sourced from the authentication session.
- **FR-005**: The system MUST retrieve only the requesting user's own assessment data — identity for retrieval comes from the session, not from request parameters. If no assessment exists for the user, the system MUST return a 404 response with a clear "No assessment found" message.
- **FR-006**: The system MUST reject assessment submissions missing any of: name, age, qualification level, MBTI answers, or IQ answers — returning a clear validation error per missing field. Partial/draft saves are not supported; every submission must be complete.
- **FR-007**: The system MUST persist assessment data (personal info, MBTI result, IQ result, skills, interests) durably. If a record already exists for the user, it MUST be fully replaced by the new submission — no duplicate records for the same user are created.

**Skill Gap Analyzer Route (Phase 1 — Stream B)**

- **FR-008**: The system MUST reject any skill gap submission or retrieval request that does not have an active authenticated session, returning an Unauthorized response.
- **FR-009**: The system MUST accept resume input in two forms: a PDF file upload or plain pasted text.
- **FR-010**: When a PDF is uploaded, the system MUST extract the resume text server-side before any further processing — the raw PDF binary MUST NOT be stored in the database.
- **FR-011**: The system MUST send the extracted resume text and job description to an AI service and return a structured analysis containing: list of matching skills, list of missing skills, a compatibility score (numeric, 0–100), and a suggested upskilling roadmap.
- **FR-012**: The system MUST validate the AI response against the shared validation schema (FR-F03) before saving — if the AI returns an unrecognisable format, the system returns a service error without writing any data.
- **FR-013**: The system MUST save each analysis result linked exclusively to the signed-in user's account identity.
- **FR-014**: The system MUST return the signed-in user's own previous analyses ordered most recent first — identity for retrieval comes from the session.
- **FR-015**: If the PDF text extraction yields no content (empty or image-only PDF), the system MUST return a user-friendly error asking the student to paste their resume as text instead.
- **FR-016**: If the AI service is unavailable, the system MUST return a service-unavailable response — no partial or corrupted data is saved.

### Key Entities

- **Career Assessment**: A record capturing one student's personal profile (name, age, qualification level), MBTI personality type and dimension scores, IQ score and cognitive metrics, and their self-reported skills and interests. Linked exclusively to one user account. One record per user — re-submission replaces the existing record.

- **Skill Gap Analysis**: A record capturing one comparison event — the student's resume content (text), the target job description, and the AI-generated result (matching skills, missing skills, compatibility score, upskilling roadmap). Linked exclusively to one user account. A user may accumulate multiple analyses over time.

- **Career Guidance** *(schema only — not written in this phase)*: Defined in the database schema now so Phase 2 can begin immediately without schema changes. No data is written to this table in Phase 0+1.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-000**: The shared database connection, authentication guard, AI validation schema, and test harness are all operational before any Phase 1 route work begins — zero Phase 1 tasks start against a broken foundation.
- **SC-001**: A signed-in student can submit a complete assessment (MBTI + IQ + profile) and receive their results in under 5 seconds, 95% of the time.
- **SC-002**: A signed-in student can upload a PDF resume and receive a skill gap analysis in under 10 seconds, 90% of the time.
- **SC-003**: 100% of assessment and skill gap API requests without a valid session return an Unauthorized response — zero unauthorized data reads or writes occur.
- **SC-004**: 100% of data reads return only the requesting user's own records — zero cross-user data leakage occurs across any combination of inputs.
- **SC-005**: Students receive a clear, actionable error message (not a technical stack trace) for every failure scenario: missing fields, bad PDF, AI unavailability, expired session, database unavailability.
- **SC-006**: The Supabase database starts clean — no data migration from the old database is required. All new student submissions are stored correctly from day one.
- **SC-007**: All route tests pass without requiring a live database or live AI service — the test suite runs cleanly in CI with mocked dependencies.

---

## Clarifications

### Session 2026-03-15

- Q: When a signed-in student re-submits the assessment, what happens to their existing record? → A: New submission fully replaces the old record (upsert — one record per user always).
- Q: Is there existing student data in MongoDB that needs migrating to Supabase? → A: No — platform is pre-launch, fresh Supabase start, no migration needed.
- Q: Can a student save a partial/draft assessment and complete it later? → A: No — submission is all-or-nothing; the full form must be submitted in one session.
- Q: What does GET /api/career-assessment return when the student has never submitted? → A: 404 with `{ error: "No assessment found" }` — clear signal for the frontend to redirect to the assessment form.

---

## Assumptions

- Students are authenticated via Clerk before accessing any assessment or skill gap feature. The Clerk session provides a stable unique user identifier.
- The AI service used for skill gap analysis returns JSON-structured results. If it does not, the response is treated as a failure.
- PDF resumes are text-based (not scanned images). Image-only PDFs are an edge case handled with a user-friendly fallback.
- A student has exactly one career assessment record at any time. Re-submission fully replaces (upserts) the existing record — no history is kept. The GET endpoint always returns the single current record.
- The platform is pre-launch with no existing student data. Supabase starts empty — no MongoDB-to-Supabase data migration is required.
- The Supabase database is provisioned and accessible before Phase 0 begins.
- Assessment submissions are always complete — no draft or partial state exists. An assessment is either fully submitted or not saved at all.
- All nested data (MBTI answers, IQ answers, skills arrays, analysis results, roadmap steps) is stored as structured document fields within each record — not as separate linked records.
- Phase 0 (foundation) must be fully complete before any Phase 1 stream starts. Phase 1 Stream A (assessment) and Stream B (skill gap) can run in parallel once foundation is ready.

---

## Out of Scope

- Generating AI career guidance (separate feature — Phase 2 Stream A).
- The dashboard aggregation endpoint (separate feature — Phase 2 Stream B).
- The Clerk webhook for pre-creating user records on sign-up (separate feature — Phase 2 Stream C).
- Retake / history of multiple career assessments per user.
- Admin analytics or cross-user reporting.
- Jobs and internship matching.
