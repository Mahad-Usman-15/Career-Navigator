# Feature Specification: Groq Agents Migration & Platform Hardening

**Feature Branch**: `main` (working directly on main — no separate branch)
**Created**: 2026-03-17
**Status**: Draft
**Input**: Milestone 3 — Make the platform work end-to-end: AI agent abstraction with multi-level fallback, fix missing client flows, fix dashboard data bugs, harden inputs, and restore visual consistency.

---

## Clarifications

### Session 2026-03-17

- Q: When a student pastes more than 4,000 characters in a free-text field, should the input be silently truncated or shown a message? → A: Silently truncate — no error shown, form submits normally with trimmed text
- Q: What should the student see while career guidance is being generated after assessment submission? → A: Loading spinner with message "Generating your career paths…" on the same page
- Q: If a student re-submits the assessment and guidance already exists, should guidance be regenerated? → A: Always regenerate — every assessment save triggers a fresh guidance call, overwriting previous guidance (merged into FR-005)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Student Receives AI Career Guidance After Assessment (Priority: P1)

A signed-in student completes the career assessment and immediately sees AI-generated career path recommendations on the same page — without any extra navigation or manual action required. The system uses the best-available AI provider behind the scenes, falling back gracefully if any provider is unavailable.

**Why this priority**: Career guidance is the core value of the platform. Currently the assessment saves successfully but guidance is never triggered from the frontend — the student lands on a blank result with no next step. This is the most critical broken flow.

**Independent Test**: Submit the career assessment form as a signed-in student and verify that career guidance (at least 3 career paths with match scores) appears on the page or a clear "View on Dashboard" CTA is presented — without any manual API calls.

**Acceptance Scenarios**:

1. **Given** a signed-in student fills and submits the assessment form, **When** the assessment is saved, **Then** a loading spinner with the message "Generating your career paths…" appears immediately, and career paths are displayed on the same page once generation completes
2. **Given** the primary AI provider is unavailable, **When** guidance is requested, **Then** the system transparently retries through two more providers and still returns guidance — the student sees only a continuous loading indicator; no provider name, error code, or retry count is shown
3. **Given** all AI providers fail, **When** guidance generation is attempted, **Then** the student sees "Career guidance temporarily unavailable — view your assessment on the Dashboard" — the assessment result is preserved and accessible
4. **Given** a visitor who is not signed in, **When** they attempt to access the career counselling page, **Then** they are redirected to the sign-in page before any form is shown

---

### User Story 2 — Student Analyses Skill Gap with Reliable Results (Priority: P1)

A signed-in student uploads a text-based PDF resume or manually fills in their skills, pastes a job description, and receives a skill gap report with a compatibility score, missing skills, matching skills, and a learning roadmap. Scanned/image PDFs are rejected with a clear, helpful message.

**Why this priority**: Skill gap analysis is the second core product feature. The AI call currently uses a single provider with no fallback — a brief Gemini outage silently fails the entire feature. Scanned PDFs silently produce empty results today.

**Independent Test**: Submit a text-based skill profile and job description as a signed-in student and verify that a report appears with all four data sections (score, missing skills, matching skills, roadmap). Upload a scanned PDF and verify a clear rejection message appears.

**Acceptance Scenarios**:

1. **Given** a signed-in student submits valid text skills and a job description, **When** analysis runs, **Then** a report shows a compatibility score (0–100), at least one missing skill, at least one matching skill, and at least one roadmap step
2. **Given** a student uploads a scanned or image-only PDF, **When** the file is processed, **Then** the system returns a clear message: "This appears to be a scanned PDF. Please use a text-based PDF or fill the form manually." — no empty or silent failure
3. **Given** a student uploads a valid text-extractable PDF, **When** analysis runs, **Then** skills from the PDF are used in the comparison — same quality result as the manual text flow
4. **Given** a visitor who is not signed in navigates to the skill gap analyzer page, **Then** they are redirected to the sign-in page — they never see a raw error response

---

### User Story 3 — Student Views Accurate Data on Dashboard (Priority: P2)

A signed-in student visits the dashboard after completing their assessment, generating guidance, and running a skill gap scan — and sees all three data sections populated with their actual results.

**Why this priority**: Dashboard null display is a confirmed regression from wrong data key names. It makes the platform appear broken even for students who completed every step. Every user will hit this.

**Independent Test**: Complete all three activities (assessment, guidance, skill scan), visit the dashboard, and verify all three cards show real values — not dashes, nulls, or empty states.

**Acceptance Scenarios**:

1. **Given** a student completed the career assessment, **When** they visit the dashboard, **Then** the MBTI personality type and IQ score are shown correctly — not blank
2. **Given** a student has saved career guidance, **When** they visit the dashboard, **Then** their top career paths are listed with match percentages
3. **Given** a student has a skill gap scan saved, **When** they visit the dashboard, **Then** the compatibility score and top missing skills are displayed

---

### User Story 4 — Malicious or Oversized Input Is Rejected Safely (Priority: P2)

Any text a student enters — skills, job descriptions, resume text — is checked for prompt manipulation patterns and length limits before reaching the AI. Oversized inputs are silently trimmed and injection patterns are silently stripped — the student sees no error and the flow continues uninterrupted.

**Why this priority**: Without input limits, a student pasting a very long document could exhaust the AI provider's free-tier token quota for all other users. Prompt injection could produce misleading career advice.

**Independent Test**: Paste more than 4,000 characters in the job description field and submit — verify the request is rejected or truncated before AI is called. Paste an injection phrase ("Ignore previous instructions") and verify the AI output is not manipulated.

**Acceptance Scenarios**:

1. **Given** a student pastes a job description exceeding 4,000 characters, **When** the form is submitted, **Then** the excess text is silently trimmed before the AI receives it — no error is shown, the form submits normally
2. **Given** a student includes a prompt injection phrase in any free-text field, **When** the analysis runs, **Then** the injection patterns are stripped before AI processing — the AI output reflects only the student's genuine profile

---

### User Story 5 — Dashboard and Personality Types Pages Match Site Design (Priority: P3)

A student visiting the dashboard or the personality types page sees the same dark theme, blue-cyan gradient headings, and card styling used on every other page of the platform.

**Why this priority**: Both pages currently render in a light theme that clashes with the rest of the site. The inconsistency signals an unfinished product to first-time users.

**Independent Test**: Open the dashboard and the personality types page — verify dark background, blue-cyan gradient headings, and no white cards or light text on white backgrounds.

**Acceptance Scenarios**:

1. **Given** a signed-in student visits the dashboard, **When** the page renders, **Then** the background is dark, card backgrounds are dark grey, and section headings use the blue-to-cyan gradient matching the rest of the site
2. **Given** any user visits the personality types page, **When** the page renders, **Then** the visual appearance is consistent with the career counselling and skill gap analyzer pages

---

### Edge Cases

- **Scanned PDF with a few words**: A PDF with under 50 extractable characters after trimming is treated as image-only and rejected — even if it technically has some text
- **Guidance fails but assessment succeeds**: The assessment result is always saved regardless of guidance failure. The student is not left on a blank page — they see a clear next-step CTA
- **All three AI providers fail simultaneously**: The student sees a single "service temporarily unavailable" message. No provider names, no stack traces, no partial data written to the database
- **Prompt injection in job description**: Injection patterns are stripped before the AI prompt is assembled. The student sees no error — the AI simply receives cleaned text
- **Field too long**: Text truncated silently at 4,000 characters per field. Student is not shown a validation error for this — it is handled transparently
- **Student submits assessment twice**: The second submission updates the existing assessment record and triggers fresh guidance generation — previous guidance is overwritten with results based on the new answers
- **Student visits skill gap analyzer while signed out**: Server-side redirect to sign-in — no flash of page content before redirect
- **AI returns structurally invalid response**: Validation catches it and the next fallback level is tried. If all levels return invalid responses, the student sees the standard service-unavailable message

---

## Requirements *(mandatory)*

### Functional Requirements

#### AI Reliability

- **FR-001**: After a student submits the career assessment, career guidance generation MUST start automatically — the student MUST NOT need to take a separate action; a loading indicator MUST be shown while generation is in progress
- **FR-002**: Career guidance and skill gap analysis MUST attempt at least three AI provider levels before returning a service-unavailable error to the student
- **FR-003**: AI-generated responses MUST be validated for structural correctness before being saved — invalid responses MUST trigger the next fallback level, not a partial save
- **FR-004**: If all AI fallback levels fail, the system MUST return a user-friendly error message — never a raw provider error, API key reference, or prompt text
- **FR-005**: Career guidance generation MUST NOT block the assessment save — assessment data is persisted regardless of guidance outcome; every successful assessment submission MUST also trigger a fresh guidance generation, overwriting any previously saved guidance for that student

#### Dashboard Data Accuracy

- **FR-006**: The dashboard MUST display the student's MBTI personality type from the correct data field — the current wrong field name MUST be corrected
- **FR-007**: The dashboard MUST display the student's IQ score from the correct data field — the current wrong field name MUST be corrected
- **FR-008**: The dashboard MUST NOT display a "category" field for the IQ score — this field is not stored and MUST be removed from the dashboard response

#### Input Safety

- **FR-009**: All free-text inputs (skills, job description, resume text) MUST be capped at 4,000 characters before being passed to any AI provider
- **FR-010**: All free-text inputs MUST have the following prompt injection patterns removed (case-insensitive) before being embedded in AI prompts: "ignore previous instructions", "ignore all instructions", "disregard instructions", "you are now", "act as", "system:", "forget everything", "new instructions"

#### Access Control

- **FR-011**: The skill gap analyzer page MUST redirect unauthenticated users to the sign-in page before any page content is rendered — server-side, not client-side
- **FR-012**: All protected API routes MUST verify the user session as the first operation — before any database lookup or AI call

#### Scanned PDF Handling

- **FR-013**: If a PDF upload produces fewer than 50 characters of extractable text after trimming, the system MUST reject the file with a message explaining that scanned PDFs are not supported and offering the manual text alternative

#### Visual Consistency

- **FR-014**: The dashboard page MUST use the same dark background colour and card styling as the career counselling and skill gap analyzer pages
- **FR-015**: The personality types page MUST use the same dark background, card styling, and gradient heading style as the rest of the site
- **FR-016**: Neither rethemed page MUST use light-mode CSS variables as the primary visual style

#### Code Consistency

- **FR-017**: The career assessment API route MUST be converted from JavaScript to TypeScript — consistent with all other API routes

### Key Entities

- **Career Guidance**: AI-generated output — 3 to 5 career paths, each with a title, match score, reasoning, Pakistan market outlook, and learning roadmap; tied to a student's assessment
- **Skill Gap Analysis**: AI-generated output — compatibility score (0–100), missing skills list, matching skills list, suggested learning roadmap; tied to a student's resume content and job description
- **AI Fallback Chain**: A sequential reliability mechanism — tries the strongest available AI model first, steps down to lighter models, then to a secondary provider before returning an error
- **Sanitized Input**: User-supplied text after prompt injection patterns are removed and length is capped — the form used to construct every AI prompt

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student who submits the career assessment sees career paths displayed on the same page or within one click — zero additional navigation steps required
- **SC-002**: The dashboard shows non-null, correct values for MBTI type, IQ score, and skill match score for any student who has completed all three activities
- **SC-003**: Uploading a scanned PDF on the skill gap analyzer produces a visible, explanatory rejection message 100% of the time — silent empty results never occur
- **SC-004**: A student who is not signed in visiting the skill gap analyzer is redirected to sign-in before any page content loads — they never see a raw error response
- **SC-005**: A free-text field containing more than 4,000 characters never reaches an AI provider — confirmed by passing a 5,000-character string through the input sanitization function and verifying the output is exactly 4,000 characters or fewer
- **SC-006**: The dashboard and personality types pages are visually consistent with the career counselling page — confirmed by visual inspection across all three pages simultaneously
- **SC-007**: All automated tests that were passing before this milestone continue to pass after every change is applied — zero regressions
- **SC-008**: The dashboard page loads all student data without any client-side data fetching — all data is available on first render

---

## Assumptions

1. The AI provider APIs are accessible from the deployment environment with the configured credentials
2. The existing Zod schemas for career guidance and skill gap analysis are structurally correct — no schema changes are needed
3. A 4,000-character limit per text field is sufficient for typical student resumes and job descriptions, and stays within the primary AI provider's free-tier token limits when combined with the system prompt
4. "Post-assessment guidance trigger" means the guidance call fires automatically after a successful assessment save — not a separate button the student must click; a loading spinner with the message "Generating your career paths…" is shown while generation is in progress
5. Prompt injection sanitization covers the most common manipulation patterns; full adversarial robustness against sophisticated attacks is not in scope for this milestone
6. "Visual consistency" means matching background colour, card background colour, and heading gradient style — pixel-perfect design parity is not required
7. The existing `pdf-parse` library correctly extracts text from standard text-based PDFs; the 50-character threshold reliably identifies image-only PDFs for typical student documents

---

## Out of Scope

- Jobs and internships service (external job board integrations, job matching agent)
- Moving hardcoded MBTI questions, IQ questions, or personality type descriptions to a content management system or database
- User profile editing or account management pages
- Full adversarial prompt injection protection (rate limiting, ML-based detection, sandboxing)
- Storing or serving the original uploaded PDF file — text extraction and discard remains the only flow
- Any changes to the contact form or Clerk webhook endpoints
