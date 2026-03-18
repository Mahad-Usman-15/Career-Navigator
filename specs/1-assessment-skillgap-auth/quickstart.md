# Quickstart: Foundation + Assessment & Skill Gap Auth

**Date**: 2026-03-15 | **Phase**: 0 + 1

Use this to validate the implementation end-to-end after completing each phase checkpoint.

---

## Prerequisites

- Node.js 18+
- Supabase project provisioned (`DATABASE_URL` available)
- All env vars set in `.env.local` (see CLAUDE.md for full list)
- Clerk dev instance configured

---

## Phase 0 Checkpoint — Foundation

### 1. Install new packages

```bash
npm install @prisma/client pdf-parse
npm install -D prisma vitest @vitejs/plugin-react @vitest/coverage-v8 msw @types/pdf-parse
```

### 2. Push schema to Supabase

```bash
npx prisma generate
npx prisma db push
```

Expected output: `Your database is now in sync with your Prisma schema.`

Verify in Supabase Table Editor: `career_assessments`, `career_guidance`, `skill_gaps` tables exist.

### 3. Verify auth guard (manual)

```bash
curl -X GET http://localhost:3000/api/career-assessment
# Expected: {"error":"Unauthorized"} with status 401
```

### 4. Run test suite

```bash
npx vitest run
# Expected: All tests pass (no live DB or AI needed)
```

**Phase 0 PASS** ✅ — DB synced, 401 on unauthed request, tests green.

---

## Phase 1 Checkpoint — Career Assessment (Stream A)

### 5. Sign in and submit an assessment

Use the app's career counselling page, or via Postman/curl with a valid Clerk session token:

```bash
curl -X POST http://localhost:3000/api/career-assessment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-session-token>" \
  -d '{
    "name": "Test Student",
    "age": 20,
    "current_qualification": "Under Graduate",
    "mbtiAnswers": {"ei1":0,"ei2":1,"ei3":0,"ei4":1,"ei5":0,"sn1":1,"sn2":0,"sn3":1,"sn4":0,"sn5":1,"tf1":0,"tf2":0,"tf3":1,"tf4":1,"tf5":0,"jp1":0,"jp2":0,"jp3":0,"jp4":1,"jp5":1},
    "iqAnswers": {"1":"42","2":"True","3":"Ounce","4":"30","5":"Eating","6":"Ocean","7":"36","8":"Snake","9":"150 miles","10":"243"}
  }'
# Expected: 201 with mbtiType and iqScore
```

### 6. Retrieve the assessment

```bash
curl -X GET http://localhost:3000/api/career-assessment \
  -H "Authorization: Bearer <clerk-session-token>"
# Expected: 200 with assessment data
```

### 7. Verify upsert (re-submit with different name)

Re-POST with `"name": "Updated Name"`. Then GET — should return `"Updated Name"`, not the original.

### 8. Verify 404 for new user

Sign in as a different Clerk user (no assessment submitted) and GET `/api/career-assessment`.
Expected: `{"error":"No assessment found"}` with status 404.

**Stream A PASS** ✅

---

## Phase 1 Checkpoint — Skill Gap (Stream B)

### 9. Submit with text resume

```bash
curl -X POST http://localhost:3000/api/skillgap \
  -H "Authorization: Bearer <clerk-session-token>" \
  -F "resumeText=Software engineering student with Python and SQL experience." \
  -F "jobDescription=Looking for a React developer with TypeScript and Node.js skills."
# Expected: 201 with analysis including missingSkills, matchingSkills, compatibilityScore
```

### 10. Submit with PDF resume

```bash
curl -X POST http://localhost:3000/api/skillgap \
  -H "Authorization: Bearer <clerk-session-token>" \
  -F "resume=@/path/to/resume.pdf" \
  -F "jobDescription=Looking for a React developer with TypeScript and Node.js skills."
# Expected: 201 with analysis
```

### 11. Test image-only PDF fallback

Submit a scanned PDF with no text layer.
Expected: `{"error":"Could not extract text from PDF..."}` with status 400.

### 12. Retrieve analyses list

```bash
curl -X GET http://localhost:3000/api/skillgap \
  -H "Authorization: Bearer <clerk-session-token>"
# Expected: 200 with array of analyses, most recent first
```

### 13. Verify new user returns empty array

GET `/api/skillgap` as a user with no submissions.
Expected: `{"success":true,"data":[]}` with status 200.

**Stream B PASS** ✅

---

## Security Smoke Test

### 14. Confirm no cross-user data access

1. Sign in as User A, submit an assessment.
2. Sign in as User B (different Clerk account), GET `/api/career-assessment`.
3. Expected: User B gets 404 (their own record doesn't exist) — NOT User A's data.

### 15. Confirm session-only identity

Attempt to add `clerkId` or `userId` to any request body and verify it has no effect — the server always uses the session identity.

**Security PASS** ✅

---

## Full Run

```bash
npx vitest run --coverage
# Expected: All tests pass, coverage report generated
```
