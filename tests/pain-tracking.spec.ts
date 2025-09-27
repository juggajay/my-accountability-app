import { test, expect } from '@playwright/test'

test.describe('Pain Tracking Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/track/pain')
  })

  test('should load pain tracking page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Pain Tracking/i })).toBeVisible()
    await expect(page.getByText(/Good Morning/i)).toBeVisible()
  })

  test('should display pain slider with emoji', async ({ page }) => {
    await expect(page.getByText(/Pain Level/i)).toBeVisible()
    
    const painValue = page.locator('text=/\\d+/').first()
    await expect(painValue).toBeVisible()
  })

  test('should allow adjusting pain level slider', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await expect(slider).toBeVisible()
    
    await slider.fill('7')
    
    await page.waitForTimeout(500)
    
    const displayValue = page.locator('.text-3xl.font-bold.tabular-nums').first()
    await expect(displayValue).toHaveText('7')
  })

  test('should allow adjusting energy and mood sliders', async ({ page }) => {
    const sliders = page.locator('input[type="range"]')
    
    await sliders.nth(1).fill('8')
    await sliders.nth(2).fill('6')
    
    await page.waitForTimeout(500)
  })

  test('should allow entering notes', async ({ page }) => {
    const notesTextarea = page.locator('textarea')
    await expect(notesTextarea).toBeVisible()
    
    await notesTextarea.fill('Slept well, feeling good today')
    await expect(notesTextarea).toHaveValue('Slept well, feeling good today')
  })

  test('should submit morning check-in successfully', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('4')
    
    const submitButton = page.getByRole('button', { name: /Save Morning Check-In/i })
    await expect(submitButton).toBeVisible()
    
    await submitButton.click()
    
    await expect(submitButton).toHaveText(/Saving/i)
    
    await expect(page.getByText(/Saved successfully/i)).toBeVisible({ timeout: 10000 })
  })

  test('should show summary after saving', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('5')
    
    await page.locator('input[type="range"]').nth(1).fill('7')
    await page.locator('input[type="range"]').nth(2).fill('8')
    
    const submitButton = page.getByRole('button', { name: /Save Morning Check-In/i })
    await submitButton.click()
    
    await expect(page.getByText(/Saved successfully/i)).toBeVisible({ timeout: 10000 })
    
    await expect(page.getByText(/Today's Summary/i)).toBeVisible({ timeout: 5000 })
  })

  test('should persist data on page reload', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('3')
    
    const submitButton = page.getByRole('button', { name: /Save Morning Check-In/i })
    await submitButton.click()
    
    await expect(page.getByText(/Saved successfully/i)).toBeVisible({ timeout: 10000 })
    
    await page.reload()
    
    await expect(page.getByText(/Today's Summary/i)).toBeVisible({ timeout: 5000 })
  })

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByText(/Pain Tracking/i)).toBeVisible()
    await expect(page.locator('input[type="range"]').first()).toBeVisible()
    
    const submitButton = page.getByRole('button', { name: /Save Morning Check-In/i })
    await expect(submitButton).toBeVisible()
  })
})