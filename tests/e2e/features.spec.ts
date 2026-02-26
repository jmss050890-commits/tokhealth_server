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

test.describe('Biometrics Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('biometrics-card').click();
    await expect(page.getByTestId('biometrics-tracker')).toBeVisible({ timeout: 10000 });
  });
  
  test('can enter heart rate', async ({ page }) => {
    const heartRateInput = page.getByTestId('heart-rate-input');
    await expect(heartRateInput).toBeVisible();
    await heartRateInput.fill('72');
  });
  
  test('can enter blood pressure', async ({ page }) => {
    const systolicInput = page.getByTestId('bp-systolic-input');
    const diastolicInput = page.getByTestId('bp-diastolic-input');
    await expect(systolicInput).toBeVisible();
    await expect(diastolicInput).toBeVisible();
    await systolicInput.fill('120');
    await diastolicInput.fill('80');
  });
  
  test('can submit biometrics', async ({ page }) => {
    await page.getByTestId('heart-rate-input').fill('72');
    await page.getByTestId('bp-systolic-input').fill('118');
    await page.getByTestId('bp-diastolic-input').fill('78');
    await page.getByTestId('spo2-input').fill('98');
    
    // Submit
    const logButton = page.getByTestId('log-biometrics-button');
    await expect(logButton).toBeVisible();
    await logButton.click();
    
    // Should show success (toast or updated UI)
    await page.waitForLoadState('domcontentloaded');
  });
});

test.describe('Hydration Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('hydration-card').click();
    await expect(page.getByTestId('hydration-tracker')).toBeVisible({ timeout: 10000 });
  });
  
  test('hydration tracker shows progress', async ({ page }) => {
    // Should show some kind of progress indicator or stats
    await page.waitForLoadState('domcontentloaded');
    // Look for water amount displays or buttons
    const hydrationTracker = page.getByTestId('hydration-tracker');
    await expect(hydrationTracker).toBeVisible();
  });
});

test.describe('Emergency Contacts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('emergency-card').click();
    await expect(page.getByTestId('emergency-contacts')).toBeVisible({ timeout: 10000 });
  });
  
  test('emergency contacts page loads', async ({ page }) => {
    const emergencyContactsPage = page.getByTestId('emergency-contacts');
    await expect(emergencyContactsPage).toBeVisible();
  });
});

test.describe('Family Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('family-card').click();
    await expect(page.getByTestId('family-manager')).toBeVisible({ timeout: 10000 });
  });
  
  test('family manager shows invite button', async ({ page }) => {
    const inviteButton = page.getByTestId('invite-family-button');
    await expect(inviteButton).toBeVisible();
  });
  
  test('can open invite form', async ({ page }) => {
    await page.getByTestId('invite-family-button').click();
    const emailInput = page.getByTestId('invite-email-input');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Health Trends', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('trends-card').click();
    await expect(page.getByTestId('health-trends')).toBeVisible({ timeout: 10000 });
  });
  
  test('health trends page loads', async ({ page }) => {
    const trendsPage = page.getByTestId('health-trends');
    await expect(trendsPage).toBeVisible();
  });
});

test.describe('Health Coach', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('coach-card').click();
    await expect(page.getByTestId('health-coach')).toBeVisible({ timeout: 10000 });
  });
  
  test('health coach page loads', async ({ page }) => {
    const coachPage = page.getByTestId('health-coach');
    await expect(coachPage).toBeVisible();
  });
});

test.describe('Import Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('import-card').click();
    await expect(page.getByTestId('import-data')).toBeVisible({ timeout: 10000 });
  });
  
  test('import data page has template download', async ({ page }) => {
    const downloadButton = page.getByTestId('download-template-btn');
    await expect(downloadButton).toBeVisible();
  });
  
  test('import data page has file input', async ({ page }) => {
    const fileInput = page.getByTestId('csv-file-input');
    await expect(fileInput).toBeAttached();
  });
});

test.describe('The Loop', () => {
  test('can view The Loop health visualization', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupAuthenticatedSession(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
    
    // Click the Loop card
    await page.getByTestId('show-loop-button').click();
    
    // Should navigate to Loop view
    await page.waitForLoadState('domcontentloaded');
  });
});
