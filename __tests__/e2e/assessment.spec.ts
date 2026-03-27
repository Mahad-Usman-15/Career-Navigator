// T045: Assessment flow E2E tests
// Tests career counselling form validation and AI loading states
import { test, expect } from '@playwright/test'

test.describe('Career Assessment', () => {
  // NOTE: These tests require authenticated Clerk session with storageState configured

  test.skip('submitting valid assessment shows AI loading steps', async ({ page }) => {
    await page.goto('/careercounselling')

    // Fill in assessment form through each step
    // Step 1: Personal info
    await page.getByLabel(/name/i).fill('Test Student')
    await page.getByLabel(/age/i).fill('20')
    await page.getByLabel(/qualification/i).selectOption('A-levels')
    await page.getByRole('button', { name: /next/i }).click()

    // Step 2: Personality (MBTI) — select answers
    // (Implementation depends on actual MBTI question rendering)
    await page.getByRole('button', { name: /next/i }).click()

    // Step 3: IQ test
    await page.getByRole('button', { name: /next/i }).click()

    // Step 4: Skills
    await page.getByPlaceholder(/skills/i).fill('Python, JavaScript, Data Analysis')
    await page.getByRole('button', { name: /submit|generate/i }).click()

    // AI loading steps should be visible
    await expect(page.getByText(/analyzing your profile/i)).toBeVisible({ timeout: 3000 })
  })

  test.skip('submitting empty assessment shows inline validation errors', async ({ page }) => {
    await page.goto('/careercounselling')

    // Try to proceed without filling required fields
    await page.getByRole('button', { name: /next/i }).click()

    // Validation errors should appear without making API call
    await expect(page.getByText(/required|please fill/i)).toBeVisible()
  })

  test.skip('step indicator shows "Step X of Y"', async ({ page }) => {
    await page.goto('/careercounselling')
    await expect(page.getByText(/step 1 of/i)).toBeVisible()
  })
})
