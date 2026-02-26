import { test, expect } from '@playwright/test';

// Constants
const BASE_URL = 'https://tokhealth-dev.preview.emergentagent.com';
const TEST_EMAIL = 'meka@demo.com';
const TEST_PASSWORD = 'pass123';

// Helper to setup logged in state
async function setupAuth(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  
  // Set disclaimer accepted
  await page.evaluate(() => {
    localStorage.setItem('tokhealth_disclaimer_accepted', 'true');
  });
  
  await page.reload({ waitUntil: 'domcontentloaded' });
  
  // Wait for auth screen and login
  await expect(page.getByTestId('auth-screen')).toBeVisible({ timeout: 10000 });
  await page.getByTestId('auth-email-input').fill(TEST_EMAIL);
  await page.getByTestId('auth-password-input').fill(TEST_PASSWORD);
  await page.getByTestId('auth-submit-button').click();
  
  // Wait for dashboard
  await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
}

// ============================================
// THE LOOP PAGE TESTS
// ============================================

test.describe('The Loop Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should navigate to The Loop from SHOW THE LOOP button', async ({ page }) => {
    await page.getByTestId('show-loop-button').click();
    await expect(page.getByTestId('the-loop')).toBeVisible({ timeout: 10000 });
  });

  test('should display THE LOOP header', async ({ page }) => {
    await page.getByTestId('show-loop-button').click();
    await expect(page.getByTestId('the-loop')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=THE LOOP')).toBeVisible();
    await expect(page.locator('text=Your complete health status at a glance')).toBeVisible();
  });

  test('should display health zone indicator', async ({ page }) => {
    await page.getByTestId('show-loop-button').click();
    await expect(page.getByTestId('the-loop')).toBeVisible({ timeout: 10000 });
    
    // Should show one of the zone indicators (green, yellow, red, or gray)
    const zoneIndicator = page.locator('text=/🟢|🟡|🔴|⚪/');
    await expect(zoneIndicator.first()).toBeVisible();
  });

  test('should display Nutrition section', async ({ page }) => {
    await page.getByTestId('show-loop-button').click();
    await expect(page.getByTestId('the-loop')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Nutrition')).toBeVisible();
  });

  test('should display Heart & Vitals section', async ({ page }) => {
    await page.getByTestId('show-loop-button').click();
    await expect(page.getByTestId('the-loop')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Heart & Vitals')).toBeVisible();
  });

  test('should display Activity section', async ({ page }) => {
    await page.getByTestId('show-loop-button').click();
    await expect(page.getByTestId('the-loop')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Activity', { exact: true }).first()).toBeVisible();
  });

  test('should have Refresh button', async ({ page }) => {
    await page.getByTestId('show-loop-button').click();
    await expect(page.getByTestId('the-loop')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();
  });
});

// ============================================
// MEDICAL EXPORT PAGE TESTS
// ============================================

test.describe('Medical Export Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.getByTestId('export-card').click();
    await expect(page.getByTestId('medical-export')).toBeVisible({ timeout: 10000 });
  });

  test('should display Medical Export header', async ({ page }) => {
    await expect(page.locator('text=Medical Export')).toBeVisible();
    await expect(page.locator('text=Generate a report for your doctor visit')).toBeVisible();
  });

  test('should display Report Preview section', async ({ page }) => {
    await expect(page.locator('text=Report Preview')).toBeVisible();
  });

  test('should display Patient info', async ({ page }) => {
    await expect(page.locator('text=Patient')).toBeVisible();
  });

  test('should display Latest Vitals section', async ({ page }) => {
    await expect(page.locator('text=Latest Vitals')).toBeVisible();
  });

  test('should display Medications section', async ({ page }) => {
    await expect(page.locator('text=/Medications/i').first()).toBeVisible();
  });

  test('should display Emergency Contacts section', async ({ page }) => {
    await expect(page.locator('text=/Emergency Contacts/i').first()).toBeVisible();
  });

  test('should display Generate Printable Report button', async ({ page }) => {
    const generateBtn = page.getByTestId('generate-report-button');
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toContainText('Generate Printable Report');
  });
});

// ============================================
// DASHBOARD NAVIGATION CARDS TESTS
// ============================================

test.describe('Dashboard Navigation Cards', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should display all main cards', async ({ page }) => {
    // Primary cards
    await expect(page.getByTestId('biometrics-card')).toBeVisible();
    await expect(page.getByTestId('nutrition-card')).toBeVisible();
    await expect(page.getByTestId('coach-card')).toBeVisible();
    await expect(page.getByTestId('wisdom-card')).toBeVisible();
    await expect(page.getByTestId('hydration-card')).toBeVisible();
  });

  test('should display secondary cards', async ({ page }) => {
    await expect(page.getByTestId('emergency-card')).toBeVisible();
    await expect(page.getByTestId('prescriptions-card')).toBeVisible();
    await expect(page.getByTestId('export-card')).toBeVisible();
    await expect(page.getByTestId('family-card')).toBeVisible();
    await expect(page.getByTestId('trends-card')).toBeVisible();
    await expect(page.getByTestId('import-card')).toBeVisible();
    await expect(page.getByTestId('spiritual-card')).toBeVisible();
  });

  test('should display new feature cards - Privacy, Apple Health, Reminders', async ({ page }) => {
    await expect(page.getByTestId('privacy-card')).toBeVisible();
    await expect(page.getByTestId('healthkit-card')).toBeVisible();
    await expect(page.getByTestId('notifications-card')).toBeVisible();
  });

  test('should display THE LOOP card prominently', async ({ page }) => {
    const loopCard = page.getByTestId('loop-card');
    await expect(loopCard).toBeVisible();
    await expect(loopCard).toContainText('THE LOOP');
    await expect(page.getByTestId('show-loop-button')).toBeVisible();
  });
});
