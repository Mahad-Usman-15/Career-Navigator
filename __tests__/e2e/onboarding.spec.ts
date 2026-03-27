// T044: Onboarding flow E2E tests
// Tests the new student onboarding wizard behavior
import { test, expect } from '@playwright/test'
import { clearTestData } from '../fixtures/seed'

test.describe('Onboarding Flow', () => {
  // NOTE: These tests require a signed-in Clerk session.
  // Set up Clerk test user via environment and storageState before running.

  test.skip('new user (no assessment) visiting /dashboard is redirected to /onboarding', async ({ page }) => {
    // Requires authenticated session with no assessment record
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/onboarding/)
  })

  test.skip('onboarding Step 1 shows welcome and name prompt', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page.getByText(/welcome/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
  })

  test.skip('onboarding Step 2 CTA links to /careercounselling', async ({ page }) => {
    await page.goto('/onboarding')
    // Navigate to step 2
    await page.getByRole('button', { name: /continue/i }).click()
    await expect(page.getByRole('link', { name: /take assessment/i })).toHaveAttribute('href', '/careercounselling')
  })

  test.skip('onboarding Step 3 "Do it later" button navigates to /dashboard', async ({ page }) => {
    await page.goto('/onboarding')
    // Navigate through steps
    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByRole('button', { name: /do it later/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
