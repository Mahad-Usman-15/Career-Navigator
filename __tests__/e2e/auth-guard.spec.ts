// T043: Auth guard E2E tests
// Tests that unauthenticated users are redirected and API returns 401
import { test, expect } from '@playwright/test'

test.describe('Auth Guard', () => {
  test('unauthenticated user visiting /dashboard is redirected to /sign-in', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test('unauthenticated user visiting /careercounselling is redirected to /sign-in', async ({ page }) => {
    await page.goto('/careercounselling')
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test('unauthenticated user visiting /skillgapanalyzer is redirected to /sign-in', async ({ page }) => {
    await page.goto('/skillgapanalyzer')
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test('unauthenticated POST /api/skillgap returns 401', async ({ request }) => {
    const formData = new FormData()
    formData.append('jobDescription', 'Senior Software Engineer with React and Node.js experience required.')
    formData.append('resumeText', 'Python developer with 2 years experience.')

    const res = await request.post('/api/skillgap', {
      multipart: {
        jobDescription: 'Senior Software Engineer with React and Node.js experience required.',
        resumeText: 'Python developer with 2 years experience.'
      }
    })
    expect(res.status()).toBe(401)
  })

  test('unauthenticated POST /api/generateguidance returns 401', async ({ request }) => {
    const res = await request.post('/api/generateguidance')
    expect(res.status()).toBe(401)
  })

  test('unauthenticated GET /api/dashboard returns 401', async ({ request }) => {
    const res = await request.get('/api/dashboard')
    expect(res.status()).toBe(401)
  })
})
