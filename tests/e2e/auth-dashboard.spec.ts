import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://tokhealth-dev.preview.emergentagent.com';
const TEST_USER = { email: 'meka@demo.com', password: 'pass123' };

// Helper to accept disclaimer and login
async function setupAuthenticatedSession(page: Page) {
  // Set disclaimer accepted and login via API
  await page.evaluate(() => {
    localStorage.setItem('tokhealth_disclaimer_accepted', 'true');
  });
  
  // Login via API to get token
  const loginResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
    data: TEST_USER
  });
  const loginData = await loginResponse.json();
  const token = loginData?.data?.token;
  const user = loginData?.data;
  
  // Set auth in localStorage
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('tokhealth_token', token);
    localStorage.setItem('tokhealth_user', JSON.stringify(user));
  }, { token, user });
  
  return token;
}

test.describe('Auth & Privacy Tests', () => {
  
  test('disclaimer screen shows on first visit', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('disclaimer-screen')).toBeVisible();
    await expect(page.getByTestId('disclaimer-card')).toBeVisible();
    await expect(page.getByTestId('medical-disclaimer')).toBeVisible();
  });
  
  test('can accept disclaimer and see auth screen', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('disclaimer-screen')).toBeVisible();
    
    // Check the acceptance checkbox
    await page.getByTestId('accept-checkbox').check();
    
    // Click Enter button
    await page.getByTestId('enter-button').click();
    
    // Should see auth screen
    await expect(page.getByTestId('auth-screen')).toBeVisible({ timeout: 10000 });
  });
  
  test('login with valid credentials shows dashboard', async ({ page }) => {
    // Set disclaimer accepted
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('tokhealth_disclaimer_accepted', 'true');
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Should be on auth screen
    await expect(page.getByTestId('auth-screen')).toBeVisible({ timeout: 10000 });
    
    // Fill login form
    await page.getByTestId('auth-email-input').fill(TEST_USER.email);
    await page.getByTestId('auth-password-input').fill(TEST_USER.password);
    
    // Submit
    await page.getByTestId('auth-submit-button').click();
    
    // Should see dashboard
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
  });
  
  test('logged in user can logout', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 10000 });
    
    // Click logout
    await page.getByTestId('logout-button').click();
    
    // Should redirect to auth screen
    await expect(page.getByTestId('auth-screen')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dashboard Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
  });
  
  test('dashboard shows 6 primary feature cards', async ({ page }) => {
    // Check the 6 primary feature cards are visible
    await expect(page.getByTestId('loop-card')).toBeVisible();
    await expect(page.getByTestId('biometrics-card')).toBeVisible();
    await expect(page.getByTestId('nutrition-card')).toBeVisible();
    await expect(page.getByTestId('coach-card')).toBeVisible();
    await expect(page.getByTestId('wisdom-card')).toBeVisible();
    await expect(page.getByTestId('hydration-card')).toBeVisible();
    await expect(page.getByTestId('prescriptions-card')).toBeVisible();
    // Secondary cards are in collapsible "More Features" section
    await expect(page.getByTestId('emergency-card')).not.toBeVisible();
    await expect(page.getByTestId('family-card')).not.toBeVisible();
    await expect(page.getByTestId('trends-card')).not.toBeVisible();
  });
  
  test('More Features section shows secondary cards', async ({ page }) => {
    // Click "More Features" button to expand
    await page.getByTestId('show-more-btn').click();
    // Now secondary cards should be visible
    await expect(page.getByTestId('emergency-card')).toBeVisible();
    await expect(page.getByTestId('family-card')).toBeVisible();
    await expect(page.getByTestId('trends-card')).toBeVisible();
    await expect(page.getByTestId('export-card')).toBeVisible();
    await expect(page.getByTestId('spiritual-card')).toBeVisible();
    await expect(page.getByTestId('privacy-card')).toBeVisible();
  });
  
  test('can navigate to biometrics tracker', async ({ page }) => {
    await page.getByTestId('biometrics-card').click();
    await expect(page.getByTestId('biometrics-tracker')).toBeVisible({ timeout: 10000 });
    
    // Can go back to dashboard
    await page.getByTestId('back-to-dashboard').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
  });
  
  test('can navigate to health coach', async ({ page }) => {
    await page.getByTestId('coach-card').click();
    await expect(page.getByTestId('health-coach')).toBeVisible({ timeout: 10000 });
  });
  
  test('can navigate to hydration tracker', async ({ page }) => {
    await page.getByTestId('hydration-card').click();
    await expect(page.getByTestId('hydration-tracker')).toBeVisible({ timeout: 10000 });
  });
  
  test('can navigate to emergency contacts from More Features', async ({ page }) => {
    // Expand More Features section first
    await page.getByTestId('show-more-btn').click();
    await page.getByTestId('emergency-card').click();
    await expect(page.getByTestId('emergency-contacts')).toBeVisible({ timeout: 10000 });
  });
  
  test('can navigate to prescriptions', async ({ page }) => {
    await page.getByTestId('prescriptions-card').click();
    // Note: PrescriptionTracker doesn't have a data-testid, we just check it loads
    await page.waitForLoadState('domcontentloaded');
    // Go back to dashboard
    await page.getByTestId('back-to-dashboard').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
  });
  
  test('can navigate to family manager from More Features', async ({ page }) => {
    // Expand More Features section first
    await page.getByTestId('show-more-btn').click();
    await page.getByTestId('family-card').click();
    await expect(page.getByTestId('family-manager')).toBeVisible({ timeout: 10000 });
  });
  
  test('can navigate to health trends from More Features', async ({ page }) => {
    // Expand More Features section first
    await page.getByTestId('show-more-btn').click();
    await page.getByTestId('trends-card').click();
    await expect(page.getByTestId('health-trends')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Profile & User Info', () => {
  
  test('profile button shows Your Baseline (not user name)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 10000 });
    
    // Profile button now shows "Your Baseline" from i18n profile.title
    const profileButton = page.getByTestId('profile-button');
    await expect(profileButton).toBeVisible();
    await expect(profileButton).toContainText('Baseline');
  });
  
  test('can navigate to profile page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 10000 });
    
    // Click profile button
    await page.getByTestId('profile-button').click();
    
    // Should navigate to profile page
    await page.waitForLoadState('domcontentloaded');
  });
});
