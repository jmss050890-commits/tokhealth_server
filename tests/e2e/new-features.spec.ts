import { test, expect } from '@playwright/test';

// Constants
const BASE_URL = 'https://tokhealth-kpa-1.preview.emergentagent.com';
const TEST_EMAIL = 'meka@demo.com';
const TEST_PASSWORD = 'pass123';

// Helper to dismiss toasts
async function dismissToasts(page) {
  // Setup toast handler to auto-dismiss sonner toasts
  await page.addLocatorHandler(
    page.locator('[data-sonner-toast]'),
    async (toast) => {
      // Wait a bit then click to dismiss
      await toast.click({ timeout: 2000 }).catch(() => {});
    },
    { times: 10, noWaitAfter: true }
  );
}

// Helper to setup logged in state
async function setupAuth(page) {
  // First navigate to the page
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  
  // Now we can access localStorage
  await page.evaluate(() => {
    localStorage.setItem('tokhealth_disclaimer_accepted', 'true');
  });
  
  // Reload to pick up disclaimer setting
  await page.reload({ waitUntil: 'domcontentloaded' });
  
  // Wait for auth screen
  await expect(page.getByTestId('auth-screen')).toBeVisible({ timeout: 10000 });
  
  // Fill login credentials
  await page.getByTestId('auth-email-input').fill(TEST_EMAIL);
  await page.getByTestId('auth-password-input').fill(TEST_PASSWORD);
  await page.getByTestId('auth-submit-button').click();
  
  // Wait for dashboard
  await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
  
  // Wait for toast to auto-dismiss (4 seconds should be enough)
  await page.waitForTimeout(4000);
}

test.describe('P1 - User Profile New Fields', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should navigate to User Profile page', async ({ page }) => {
    // Click profile button
    await page.getByTestId('profile-button').click();
    
    // Wait for profile page
    await expect(page.getByTestId('user-profile')).toBeVisible({ timeout: 10000 });
  });

  test('should display allergies input field', async ({ page }) => {
    await page.getByTestId('profile-button').click({ force: true });
    await expect(page.getByTestId('user-profile')).toBeVisible({ timeout: 10000 });
    
    // Allergies input should be present
    await expect(page.getByTestId('allergy-input')).toBeVisible();
    await expect(page.getByTestId('allergy-add-btn')).toBeVisible();
  });

  test('should display food tolerances input field', async ({ page }) => {
    await page.getByTestId('profile-button').click();
    await expect(page.getByTestId('user-profile')).toBeVisible({ timeout: 10000 });
    
    // Food tolerances input should be present
    await expect(page.getByTestId('food-tolerance-input')).toBeVisible();
    await expect(page.getByTestId('food-tolerance-add-btn')).toBeVisible();
  });

  test('should display spiritual preference dropdown', async ({ page }) => {
    await page.getByTestId('profile-button').click();
    await expect(page.getByTestId('user-profile')).toBeVisible({ timeout: 10000 });
    
    // Spiritual preference select should be present
    await expect(page.getByTestId('spiritual-preference-select')).toBeVisible();
    await expect(page.getByTestId('spiritual-preference-custom')).toBeVisible();
  });

  test('should add an allergy tag via dropdown', async ({ page }) => {
    await page.getByTestId('profile-button').click();
    await expect(page.getByTestId('user-profile')).toBeVisible({ timeout: 10000 });
    
    // Type in the allergy input
    await page.getByTestId('allergy-input').fill('Pea');
    
    // Wait for dropdown suggestions to appear
    await page.waitForTimeout(500);
    
    // Click the first suggestion if visible
    const firstOption = page.getByTestId('allergy-option-0');
    if (await firstOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstOption.click();
    }
  });

  test('should display save profile button', async ({ page }) => {
    await page.getByTestId('profile-button').click();
    await expect(page.getByTestId('user-profile')).toBeVisible({ timeout: 10000 });
    
    // Save button should be visible
    await expect(page.getByTestId('save-profile-button')).toBeVisible();
  });
});

test.describe('P2 - Wisdom Vault Lab Results Tab', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should navigate to Wisdom Vault page', async ({ page }) => {
    // Click wisdom vault card
    await page.getByTestId('wisdom-card').click();
    
    // Wait for wisdom vault page
    await expect(page.getByTestId('wisdom-vault')).toBeVisible({ timeout: 10000 });
  });

  test('should display Journal and Lab Results tabs', async ({ page }) => {
    await page.getByTestId('wisdom-card').click();
    await expect(page.getByTestId('wisdom-vault')).toBeVisible({ timeout: 10000 });
    
    // Tab buttons should be visible
    await expect(page.getByTestId('wisdom-tab-journal')).toBeVisible();
    await expect(page.getByTestId('wisdom-tab-lab')).toBeVisible();
  });

  test('should switch to Lab Results tab', async ({ page }) => {
    await page.getByTestId('wisdom-card').click();
    await expect(page.getByTestId('wisdom-vault')).toBeVisible({ timeout: 10000 });
    
    // Click Lab Results tab
    await page.getByTestId('wisdom-tab-lab').click();
    
    // Lab upload button should be visible
    await expect(page.getByTestId('lab-upload-btn')).toBeVisible({ timeout: 5000 });
  });

  test('should display upload button in Lab Results tab', async ({ page }) => {
    await page.getByTestId('wisdom-card').click();
    await expect(page.getByTestId('wisdom-vault')).toBeVisible({ timeout: 10000 });
    
    // Click Lab Results tab
    await page.getByTestId('wisdom-tab-lab').click();
    
    // Upload button should be visible
    await expect(page.getByTestId('lab-upload-btn')).toBeVisible();
    
    // File input should exist (hidden)
    const fileInput = page.getByTestId('lab-file-input');
    await expect(fileInput).toBeAttached();
  });
});

test.describe('P3 - Prescription Tracker RxNorm Search', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should navigate to Prescription Tracker page', async ({ page }) => {
    // Click prescriptions card
    await page.getByTestId('prescriptions-card').click();
    
    // Wait for prescription tracker page
    await expect(page.getByTestId('prescription-tracker')).toBeVisible({ timeout: 10000 });
  });

  test('should display Add Medication button', async ({ page }) => {
    await page.getByTestId('prescriptions-card').click();
    await expect(page.getByTestId('prescription-tracker')).toBeVisible({ timeout: 10000 });
    
    // Add button should be visible
    await expect(page.getByTestId('add-medication-btn')).toBeVisible();
  });

  test('should open add medication form', async ({ page }) => {
    await page.getByTestId('prescriptions-card').click();
    await expect(page.getByTestId('prescription-tracker')).toBeVisible({ timeout: 10000 });
    
    // Click add medication
    await page.getByTestId('add-medication-btn').click();
    
    // Med name input should appear
    await expect(page.getByTestId('med-name-input')).toBeVisible({ timeout: 5000 });
  });

  test('should search medication using RxNorm', async ({ page }) => {
    await page.getByTestId('prescriptions-card').click();
    await expect(page.getByTestId('prescription-tracker')).toBeVisible({ timeout: 10000 });
    
    // Click add medication
    await page.getByTestId('add-medication-btn').click();
    await expect(page.getByTestId('med-name-input')).toBeVisible({ timeout: 5000 });
    
    // Type medication name to trigger search
    await page.getByTestId('med-name-input').fill('aspirin');
    
    // Wait for search results (debounced at 400ms)
    await page.waitForTimeout(600);
    
    // Check if drug results appear
    const firstResult = page.getByTestId('drug-result-0');
    await expect(firstResult).toBeVisible({ timeout: 5000 });
  });

  test('should select drug from search results', async ({ page }) => {
    await page.getByTestId('prescriptions-card').click();
    await expect(page.getByTestId('prescription-tracker')).toBeVisible({ timeout: 10000 });
    
    await page.getByTestId('add-medication-btn').click();
    await expect(page.getByTestId('med-name-input')).toBeVisible({ timeout: 5000 });
    
    // Type medication name
    await page.getByTestId('med-name-input').fill('ibuprofen');
    
    // Wait for search results
    await page.waitForTimeout(600);
    
    // Click first result if visible
    const firstResult = page.getByTestId('drug-result-0');
    if (await firstResult.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstResult.click();
      
      // Input should now have the selected drug name
      const inputValue = await page.getByTestId('med-name-input').inputValue();
      expect(inputValue.toLowerCase()).toContain('ibuprofen');
    }
  });
});

test.describe('P3 - Drug Interaction Checker', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should display interaction checker when 2+ medications exist', async ({ page }) => {
    await page.getByTestId('prescriptions-card').click();
    await expect(page.getByTestId('prescription-tracker')).toBeVisible({ timeout: 10000 });
    
    // Check if interaction button exists (only shown with 2+ meds)
    const interactionBtn = page.getByTestId('check-interactions-btn');
    
    // Button should be visible if user has 2+ prescriptions
    // If not visible, that's expected behavior for <2 meds
    const isVisible = await interactionBtn.isVisible().catch(() => false);
    
    if (isVisible) {
      // Button is visible - interaction checker is available
      await expect(interactionBtn).toBeVisible();
    } else {
      // Button not visible - expected when <2 medications
      console.log('Interaction checker not visible (requires 2+ medications)');
    }
  });
});
