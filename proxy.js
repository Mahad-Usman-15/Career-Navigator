import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Layer 1 (page routes): redirect unauthenticated users to sign-in
const isProtectedRoute = createRouteMatcher(['/careercounselling(.*)', '/skillgapanalyzer(.*)', '/dashboard(.*)'])

// Layer 1 (API routes): return JSON 401 before route handler runs
// Server-side auth() in each handler is layer 2 (constitution Principle I)
const isProtectedApiRoute = createRouteMatcher(['/api/career-assessment(.*)', '/api/skillgap(.*)', '/api/generateguidance(.*)', '/api/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()

  if (isProtectedApiRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}