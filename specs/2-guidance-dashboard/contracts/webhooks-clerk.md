# API Contract: Clerk Webhook

**Route**: `POST /api/webhooks/clerk`
**Auth**: Svix signature verification (NOT Clerk session — called by Clerk's servers)

---

## POST /api/webhooks/clerk

### Purpose
Receive Clerk lifecycle events and provision user records in the database. Currently handles `user.created` only. Must be idempotent — safe to process the same event multiple times.

### Security
- NOT protected by Clerk session middleware (`proxy.js` must NOT include this route in `isProtectedRoute`)
- NOT called via `requireAuth()` — no Clerk session exists (caller is Clerk's servers, not a browser)
- Authenticated by **Svix signature** headers: `svix-id`, `svix-timestamp`, `svix-signature`
- Verified against `CLERK_WEBHOOK_SECRET` environment variable
- Requests without valid signature headers → 401 (no DB read or write)

### Request
```
POST /api/webhooks/clerk
svix-id: msg_abc123
svix-timestamp: 1710000000
svix-signature: v1,base64encodedhmac...
Content-Type: application/json

{
  "type": "user.created",
  "data": {
    "id": "user_2abc...",
    "first_name": "Ali",
    "last_name": "Khan",
    "email_addresses": [
      { "email_address": "ali@example.com", "id": "idn_..." }
    ],
    "created_at": 1710000000000
  }
}
```

**Critical**: Body must be read as raw text (`req.text()`) before signature verification. Do NOT call `req.json()` first — it consumes the body stream.

### Responses

#### 200 OK — processed successfully (or idempotent no-op)
```json
{ "received": true }
```

#### 401 Unauthorized — missing or invalid signature
```json
{ "error": "Invalid signature" }
```

#### 400 Bad Request — missing required Svix headers
```json
{ "error": "Missing svix headers" }
```

#### 500 Internal Server Error — DB write failed
```json
{ "error": "Failed to provision user" }
```

### Handler Logic
```
1. body = await req.text()  // MUST be raw text
2. Extract svix headers: svix-id, svix-timestamp, svix-signature
   → if any missing: return 400
3. new Webhook(CLERK_WEBHOOK_SECRET).verify(body, headers)
   → if throws: return 401
4. event = JSON.parse(body)
5. if event.type !== 'user.created': return 200 { received: true }  // ignore other events
6. prisma.users.upsert({
     where: { clerkId: event.data.id },
     update: {},  // idempotent no-op if user exists
     create: {
       clerkId: event.data.id,
       name: `${event.data.first_name ?? ''} ${event.data.last_name ?? ''}`.trim(),
       email: event.data.email_addresses[0]?.email_address ?? ''
     }
   })
7. return 200 { received: true }
```

### Idempotency
`upsert` with `update: {}` ensures that if Clerk retries the same event:
- If user already exists: no change, returns 200
- If user does not exist: creates the record, returns 200
- No error, no duplicate record, no partial state

### Clerk Configuration
In the Clerk dashboard, configure the webhook endpoint:
- URL: `https://<your-domain>/api/webhooks/clerk`
- Events: `user.created` (only — deferred: `user.updated`, `user.deleted`)
- Signing secret: copy to `CLERK_WEBHOOK_SECRET` in `.env.local` and Vercel env vars

### proxy.js Note
The route `/api/webhooks/clerk` MUST NOT appear in `isProtectedApiRoute` in `proxy.js`. It must be publicly reachable by Clerk's servers. The Svix signature provides its own security.
