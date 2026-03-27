// T047: Dashboard E2E tests
// Tests dashboard rendering with and without data
import { test, expect } from '@playwright/test'
import { seedAssessment, seedGuidance, seedSkillGap, clearTestData, TEST_CLERK_ID } from '../fixtures/seed'

test.describe('Dashboard', () => {
  // NOTE: These tests require authenticated Clerk session

  test.skip('dashboard with full data shows all 3 assessment cards', async ({ page }) => {
    // Seed full data before test
    const assessment = await seedAssessment()
    await seedGuidance(TEST_CLERK_ID, assessment.id)
    await seedSkillGap()

    await page.goto('/dashboard')

    // Assessment cards
    await expect(page.getByText(/mbti type/i)).toBeVisible()
    await expect(page.getByText(/iq score/i)).toBeVisible()
    await expect(page.getByText(/skill match/i)).toBeVisible()

    // Career paths section
    await expect(page.getByText(/top career paths/i)).toBeVisible()
    await expect(page.getByText(/software engineer/i)).toBeVisible()

    // Skill gap section
    await expect(page.getByText(/skill gap summary/i)).toBeVisible()

    // Job listings panel
    await expect(page.getByText(/jobs matching/i)).toBeVisible()

    await clearTestData()
  })

  test.skip('dashboard with no data shows empty state CTA cards', async ({ page }) => {
    // Ensure test user has an assessment (to pass /onboarding redirect) but no guidance or skill gap
    const assessment = await seedAssessment()

    await page.goto('/dashboard')

    // Empty states visible
    await expect(page.getByText(/take the assessment/i)).toBeVisible()
    await expect(page.getByText(/upload your resume/i)).toBeVisible()
    await expect(page.getByText(/discover your top 5 career matches/i)).toBeVisible()

    await clearTestData()
  })

  test.skip('dashboard shows Download Report button when guidance exists', async ({ page }) => {
    const assessment = await seedAssessment()
    await seedGuidance(TEST_CLERK_ID, assessment.id)

    await page.goto('/dashboard')

    await expect(page.getByRole('button', { name: /download report/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /share report/i })).toBeVisible()

    await clearTestData()
  })

  test.skip('clicking Share Report generates a shareable link', async ({ page }) => {
    const assessment = await seedAssessment()
    await seedGuidance(TEST_CLERK_ID, assessment.id)

    await page.goto('/dashboard')

    await page.getByRole('button', { name: /share report/i }).click()
    await expect(page.getByRole('button', { name: /copy/i })).toBeVisible({ timeout: 5000 })

    await clearTestData()
  })
})
