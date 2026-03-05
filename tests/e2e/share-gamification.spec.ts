import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://tokhealth-dev.preview.emergentagent.com';
const TEST_USER = { email: 'meka@demo.com', password: 'pass123' };

// Helper to setup authenticated session
async function setupAuthenticatedSession(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('tokhealth_disclaimer_accepted', 'true');
  });
  
  const loginResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
    data: TEST_USER
  });
  const loginData = await loginResponse.json();
  const token = loginData?.data?.token;
  const user = loginData?.data;
  
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('tokhealth_token', token);
    localStorage.setItem('tokhealth_user', JSON.stringify(user));
  }, { token, user });
  
  return token;
}

test.describe('Share Progress Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    // Navigate to Share Progress via More Features
    await page.getByTestId('show-more-btn').click();
    await page.getByTestId('share-card').click();
    await expect(page.getByTestId('share-progress')).toBeVisible({ timeout: 10000 });
  });

  test('share progress page loads with shareable card', async ({ page }) => {
    const sharePage = page.getByTestId('share-progress');
    await expect(sharePage).toBeVisible();
    // Check for share button
    const shareButton = page.getByTestId('share-button');
    await expect(shareButton).toBeVisible();
  });

  test('shareable card shows health data', async ({ page }) => {
    // The card should show calories, protein, water, steps
    await expect(page.getByText('Calories')).toBeVisible();
    await expect(page.getByText('Protein')).toBeVisible();
    await expect(page.getByText('Water')).toBeVisible();
    await expect(page.getByText('Steps')).toBeVisible();
  });

  test('share button is clickable', async ({ page }) => {
    const shareButton = page.getByTestId('share-button');
    await expect(shareButton).toBeVisible();
    await expect(shareButton).toBeEnabled();
    // Click should work (will try to share or copy to clipboard)
    await shareButton.click();
    // Wait briefly to ensure no error occurs
    await page.waitForLoadState('domcontentloaded');
  });
});

test.describe('Gamification Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    // Navigate to Gamification via More Features
    await page.getByTestId('show-more-btn').click();
    await page.getByTestId('gamification-card').click();
    await expect(page.getByTestId('gamification-page')).toBeVisible({ timeout: 10000 });
  });

  test('gamification page loads with streak card', async ({ page }) => {
    const gamificationPage = page.getByTestId('gamification-page');
    await expect(gamificationPage).toBeVisible();
    // Check for check-in button
    const checkInButton = page.getByTestId('check-in-button');
    await expect(checkInButton).toBeVisible();
  });

  test('streak card shows current streak', async ({ page }) => {
    // Should show "Day Streak" text (exact match to avoid badge descriptions)
    await expect(page.getByText('Day Streak', { exact: true })).toBeVisible();
    // Should show "Best Streak" text
    await expect(page.getByText('Best Streak')).toBeVisible();
  });

  test('badges grid shows 10 badges', async ({ page }) => {
    // Check for specific badges by their test IDs
    await expect(page.getByTestId('badge-first_meal')).toBeVisible();
    await expect(page.getByTestId('badge-hydration_hero')).toBeVisible();
    await expect(page.getByTestId('badge-step_starter')).toBeVisible();
    await expect(page.getByTestId('badge-vitals_check')).toBeVisible();
    await expect(page.getByTestId('badge-week_warrior')).toBeVisible();
    await expect(page.getByTestId('badge-month_master')).toBeVisible();
    await expect(page.getByTestId('badge-journal_keeper')).toBeVisible();
    await expect(page.getByTestId('badge-prayer_warrior')).toBeVisible();
    await expect(page.getByTestId('badge-meal_master')).toBeVisible();
    await expect(page.getByTestId('badge-centurion')).toBeVisible();
  });

  test('check-in button is clickable', async ({ page }) => {
    const checkInButton = page.getByTestId('check-in-button');
    await expect(checkInButton).toBeEnabled();
    await checkInButton.click();
    // Wait for API response, streak should remain or increase
    await page.waitForLoadState('domcontentloaded');
    // Verify day streak is still visible (exact match)
    await expect(page.getByText('Day Streak', { exact: true })).toBeVisible();
  });

  test('badge progress shows for unearned badges', async ({ page }) => {
    // Unearned badges should show progress bars
    const stepStarterBadge = page.getByTestId('badge-step_starter');
    await expect(stepStarterBadge).toBeVisible();
    // Should show threshold like "0/1000"
    await expect(stepStarterBadge.getByText(/\/1000/)).toBeVisible();
  });
});

test.describe('i18n Language Switching', () => {
  test('language selector is visible on disclaimer page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Language selector should be visible using its data-testid
    await expect(page.getByTestId('language-btn')).toBeVisible();
  });

  test('can switch language to Spanish on auth screen', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Accept disclaimer first
    await page.evaluate(() => {
      localStorage.setItem('tokhealth_disclaimer_accepted', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('auth-screen')).toBeVisible({ timeout: 10000 });
    
    // Find and click language selector
    const langSelector = page.getByTestId('language-btn');
    await expect(langSelector).toBeVisible();
    await langSelector.click();
    
    // Select Spanish using data-testid (lang-es)
    await page.getByTestId('lang-es').click();
    
    // Auth screen should show Spanish text
    await expect(page.getByText('Bienvenido a')).toBeVisible({ timeout: 5000 });
  });

  test('dashboard text changes when language is switched', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    
    // Default should be English - check for English text
    await expect(page.getByText('More Features')).toBeVisible();
    
    // Click language selector and switch to Spanish
    const langSelector = page.getByTestId('language-btn');
    await expect(langSelector).toBeVisible();
    await langSelector.click();
    await page.getByTestId('lang-es').click();
    
    // Dashboard should now show Spanish text
    await expect(page.getByText('Mas Funciones')).toBeVisible({ timeout: 5000 });
  });
});
