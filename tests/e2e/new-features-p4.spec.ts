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
// DASHBOARD NEW CARDS TESTS
// ============================================

test.describe('Dashboard New Feature Cards', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should display Data Privacy card', async ({ page }) => {
    const privacyCard = page.getByTestId('privacy-card');
    await expect(privacyCard).toBeVisible();
    await expect(privacyCard).toContainText('Data Privacy');
  });

  test('should display Apple Health card', async ({ page }) => {
    const healthkitCard = page.getByTestId('healthkit-card');
    await expect(healthkitCard).toBeVisible();
    await expect(healthkitCard).toContainText('Apple Health');
  });

  test('should display Reminders/Notifications card', async ({ page }) => {
    const notificationsCard = page.getByTestId('notifications-card');
    await expect(notificationsCard).toBeVisible();
    await expect(notificationsCard).toContainText('Reminders');
  });

  test('should navigate to Data Privacy page from card', async ({ page }) => {
    await page.getByTestId('privacy-card').click();
    // Should show Data Privacy page content
    await expect(page.getByText('Data Privacy Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('export-data-btn')).toBeVisible();
  });

  test('should navigate to Apple HealthKit page from card', async ({ page }) => {
    await page.getByTestId('healthkit-card').click();
    // Should show HealthKit page content
    await expect(page.getByText('Apple HealthKit')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('healthkit-sync-btn')).toBeVisible();
  });

  test('should navigate to Notifications page from card', async ({ page }) => {
    await page.getByTestId('notifications-card').click();
    // Should show Notifications page content
    await expect(page.getByText('Notifications & Reminders')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('add-reminder-btn')).toBeVisible();
  });
});

// ============================================
// FLOATING ASK COACH BUTTON TESTS
// ============================================

test.describe('Floating Ask Coach Button', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test('should display Ask Coach FAB on dashboard', async ({ page }) => {
    const coachFab = page.getByTestId('ask-coach-fab');
    await expect(coachFab).toBeVisible();
  });

  test('should open coach panel when FAB is clicked', async ({ page }) => {
    await page.getByTestId('ask-coach-fab').click({ force: true });
    await expect(page.getByTestId('ask-coach-panel')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('coach-input')).toBeVisible();
    await expect(page.getByTestId('coach-send-btn')).toBeVisible();
  });

  test('should close coach panel when close button clicked', async ({ page }) => {
    await page.getByTestId('ask-coach-fab').click({ force: true });
    await expect(page.getByTestId('ask-coach-panel')).toBeVisible();
    
    await page.getByTestId('close-coach-panel').click();
    await expect(page.getByTestId('ask-coach-panel')).not.toBeVisible();
    await expect(page.getByTestId('ask-coach-fab')).toBeVisible();
  });

  test('should display Ask Coach FAB on feature pages', async ({ page }) => {
    // Navigate to Biometrics
    await page.getByTestId('biometrics-card').click();
    await expect(page.getByTestId('ask-coach-fab')).toBeVisible({ timeout: 5000 });
    
    // Go back and try another page
    await page.getByTestId('back-to-dashboard').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();
    
    // Navigate to Nutrition
    await page.getByTestId('nutrition-card').click();
    await expect(page.getByTestId('ask-coach-fab')).toBeVisible({ timeout: 5000 });
  });
});

// ============================================
// DATA PRIVACY PAGE TESTS
// ============================================

test.describe('Data Privacy Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.getByTestId('privacy-card').click();
    await expect(page.getByText('Data Privacy Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should display data categories', async ({ page }) => {
    // Should show data categories section
    await expect(page.getByText('Your Stored Data')).toBeVisible();
    // Should list some categories
    await expect(page.getByText('Profile & Baseline')).toBeVisible();
    await expect(page.getByText('Nutrition Logs')).toBeVisible();
  });

  test('should display export data button', async ({ page }) => {
    const exportBtn = page.getByTestId('export-data-btn');
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toContainText('Download All My Data');
  });

  test('should display delete account section', async ({ page }) => {
    const deleteBtn = page.getByTestId('show-delete-btn');
    await expect(deleteBtn).toBeVisible();
    await expect(deleteBtn).toContainText('Delete My Account');
  });

  test('should show delete confirmation when delete button clicked', async ({ page }) => {
    await page.getByTestId('show-delete-btn').click();
    
    // Should show confirmation input
    await expect(page.getByTestId('delete-confirm-input')).toBeVisible();
    await expect(page.getByTestId('confirm-delete-btn')).toBeVisible();
    
    // Delete button should be disabled until "DELETE" is typed
    const confirmBtn = page.getByTestId('confirm-delete-btn');
    await expect(confirmBtn).toBeDisabled();
    
    // Type DELETE
    await page.getByTestId('delete-confirm-input').fill('DELETE');
    await expect(confirmBtn).toBeEnabled();
  });

  test('should display privacy commitment info', async ({ page }) => {
    await expect(page.getByText('Privacy Commitment')).toBeVisible();
    await expect(page.getByText('All your data is encrypted')).toBeVisible();
  });
});

// ============================================
// APPLE HEALTHKIT PAGE TESTS
// ============================================

test.describe('Apple HealthKit Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.getByTestId('healthkit-card').click();
    await expect(page.getByText('Apple HealthKit')).toBeVisible({ timeout: 10000 });
  });

  test('should display connection status', async ({ page }) => {
    await expect(page.getByText('Connection Status')).toBeVisible();
  });

  test('should display available data types', async ({ page }) => {
    await expect(page.getByText('Available Data Types')).toBeVisible();
    await expect(page.getByText('Steps')).toBeVisible();
    await expect(page.getByText('Heart Rate')).toBeVisible();
    await expect(page.getByText('Active Calories')).toBeVisible();
  });

  test('should display sync button', async ({ page }) => {
    const syncBtn = page.getByTestId('healthkit-sync-btn');
    await expect(syncBtn).toBeVisible();
  });

  test('should show iOS instructions on non-iOS device', async ({ page }) => {
    // On desktop browser, should show instructions
    await expect(page.getByText('How to connect Apple HealthKit')).toBeVisible();
    await expect(page.getByText('Open this app on your iPhone')).toBeVisible();
  });

  test('should display Ask Coach FAB on HealthKit page', async ({ page }) => {
    await expect(page.getByTestId('ask-coach-fab')).toBeVisible();
  });
});

// ============================================
// NOTIFICATIONS & REMINDERS PAGE TESTS
// ============================================

test.describe('Notifications & Reminders Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.getByTestId('notifications-card').click();
    await expect(page.getByText('Notifications & Reminders')).toBeVisible({ timeout: 10000 });
  });

  test('should display notification status', async ({ page }) => {
    // Should show push notification status
    const statusText = page.locator('text=/Notifications (Enabled|Disabled)/');
    await expect(statusText).toBeVisible({ timeout: 5000 });
  });

  test('should display add reminder button', async ({ page }) => {
    const addBtn = page.getByTestId('add-reminder-btn');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add Reminder');
  });

  test('should open add reminder form', async ({ page }) => {
    await page.getByTestId('add-reminder-btn').click();
    
    // Form fields should appear
    await expect(page.getByTestId('reminder-type-select')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('reminder-title-input')).toBeVisible();
    await expect(page.getByTestId('reminder-time-input')).toBeVisible();
    await expect(page.getByTestId('save-reminder-btn')).toBeVisible();
  });

  test('should create and display new reminder', async ({ page }) => {
    const testTitle = `TEST_UI_${Date.now()}`;
    
    // Open form
    await page.getByTestId('add-reminder-btn').click();
    await expect(page.getByTestId('reminder-title-input')).toBeVisible({ timeout: 5000 });
    
    // Fill form
    await page.getByTestId('reminder-title-input').fill(testTitle);
    await page.getByTestId('reminder-time-input').fill('09:00');
    
    // Save
    await page.getByTestId('save-reminder-btn').click();
    
    // Should show success toast and new reminder in list
    await expect(page.getByText(testTitle)).toBeVisible({ timeout: 10000 });
  });

  test('should display Ask Coach FAB on Notifications page', async ({ page }) => {
    await expect(page.getByTestId('ask-coach-fab')).toBeVisible();
  });
});

// ============================================
// WISDOM VAULT DRUG LOOKUP TESTS
// ============================================

test.describe('Wisdom Vault Drug Lookup', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.getByTestId('wisdom-card').click();
    await expect(page.getByTestId('wisdom-vault')).toBeVisible({ timeout: 10000 });
  });

  test('should display Lab tab with drug lookup', async ({ page }) => {
    // Click Lab tab
    await page.getByTestId('wisdom-tab-lab').click();
    
    // Should show drug lookup section
    await expect(page.getByTestId('drug-lookup-input')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('drug-lookup-btn')).toBeVisible();
  });

  test('should search for drug information', async ({ page }) => {
    // Click Lab tab
    await page.getByTestId('wisdom-tab-lab').click();
    await expect(page.getByTestId('drug-lookup-input')).toBeVisible({ timeout: 5000 });
    
    // Search for aspirin
    await page.getByTestId('drug-lookup-input').fill('aspirin');
    await page.getByTestId('drug-lookup-btn').click();
    
    // Wait for results (OpenFDA may take a moment)
    // Should show either results or "no results" message
    await expect(page.locator('text=/Found|No results|Drug/i').first()).toBeVisible({ timeout: 15000 });
  });
});
