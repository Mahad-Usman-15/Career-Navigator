// T046: Skill gap analyzer E2E tests
// Tests form validation, loading states, and results rendering
import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Skill Gap Analyzer', () => {
  // NOTE: These tests require authenticated Clerk session

  test.skip('submitting with job description < 100 chars shows validation error without API call', async ({ page }) => {
    await page.goto('/skillgapanalyzer')

    await page.getByLabel(/job description/i).fill('Short JD')
    await page.getByRole('button', { name: /analyze/i }).click()

    await expect(page.getByText(/too short|at least 100/i)).toBeVisible()
    // Verify no loading state appeared (API was not called)
    await expect(page.getByText(/analyzing/i)).not.toBeVisible()
  })

  test.skip('uploading non-PDF file shows validation error', async ({ page }) => {
    await page.goto('/skillgapanalyzer')

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByLabel(/upload resume/i).click()
    ])
    // Create a fake txt file — the validator should reject non-PDF
    await fileChooser.setFiles({
      name: 'resume.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is a text file, not a PDF')
    })

    await expect(page.getByText(/pdf only/i)).toBeVisible()
  })

  test.skip('valid submission shows AI loading steps then results', async ({ page }) => {
    await page.goto('/skillgapanalyzer')

    const jd = `We are looking for a Senior Software Engineer with strong experience in React, TypeScript,
Node.js, PostgreSQL, and AWS. You will be responsible for designing and building scalable backend
services and working with frontend teams to deliver high-quality products. Experience with CI/CD
pipelines and agile development is required. Minimum 3 years experience.`.trim()

    await page.getByLabel(/job description/i).fill(jd)
    await page.getByLabel(/skills|resume text/i).fill('Python developer with 2 years experience in JavaScript and data analysis.')
    await page.getByRole('button', { name: /analyze/i }).click()

    // Loading steps visible
    await expect(page.getByText(/reading your resume/i)).toBeVisible({ timeout: 3000 })

    // Eventually results appear
    await expect(page.getByText(/compatibility score/i)).toBeVisible({ timeout: 30000 })
    await expect(page.getByText(/missing skills/i)).toBeVisible()
  })

  test.skip('results include learning resources section', async ({ page }) => {
    // This test assumes a previous successful submission has been made
    await page.goto('/skillgapanalyzer')
    // Submit and wait for results...
    // Then check for resources section
    await expect(page.getByText(/learning resources/i)).toBeVisible({ timeout: 30000 })
  })
})
