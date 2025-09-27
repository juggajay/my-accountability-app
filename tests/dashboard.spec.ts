import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load the dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Good');
    
    // Check for recovery score section
    await expect(page.getByText('Today\'s Recovery Score')).toBeVisible();
    
    // Check for metrics cards
    await expect(page.getByText('Pain Level')).toBeVisible();
    await expect(page.getByText('Exercise Streak')).toBeVisible();
  });

  test('should display premium gradient header', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for date display
    const dateElement = page.locator('p:has-text("•")').first();
    await expect(dateElement).toBeVisible();
    await expect(dateElement).toContainText('Day');
  });

  test('should show getting started message when no data', async ({ page }) => {
    await page.goto('/dashboard');
    
    // If no data exists, should show welcome message
    const welcomeMessage = page.getByText('Welcome to Your Accountability Journey!');
    if (await welcomeMessage.isVisible()) {
      await expect(welcomeMessage).toContainText('Start by logging');
    }
  });

  test('should have correct time-based greeting', async ({ page }) => {
    await page.goto('/dashboard');
    
    const heading = page.getByRole('heading', { level: 1 });
    const text = await heading.textContent();
    
    // Should contain one of the time-based greetings
    expect(
      text?.includes('Good morning') || 
      text?.includes('Good afternoon') || 
      text?.includes('Good evening')
    ).toBeTruthy();
  });
});

test.describe('Dashboard Components', () => {
  test('should render progress rings', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for SVG progress rings
    const progressRings = page.locator('svg circle');
    await expect(progressRings.first()).toBeVisible();
  });

  test('should have proper styling and animations', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for premium card elements
    const cards = page.locator('[class*="rounded-2xl"]');
    await expect(cards.first()).toBeVisible();
    
    // Check for gradient backgrounds
    const gradients = page.locator('[class*="gradient"]');
    expect(await gradients.count()).toBeGreaterThan(0);
  });
});