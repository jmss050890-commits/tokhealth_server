import { test, expect } from '@playwright/test';

// Constants
const BASE_URL = 'https://tokhealth-kpa-1.preview.emergentagent.com';
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
// HEALTH COACH CAMERA TESTS
// ============================================

test.describe('Health Coach Camera Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.getByTestId('coach-card').click();
    await expect(page.getByTestId('health-coach')).toBeVisible({ timeout: 10000 });
  });

  test('should display camera button next to microphone', async ({ page }) => {
    const cameraBtn = page.getByTestId('coach-camera-btn');
    await expect(cameraBtn).toBeVisible();
  });

  test('should have hidden photo input for camera', async ({ page }) => {
    const photoInput = page.getByTestId('coach-photo-input');
    await expect(photoInput).toBeAttached();
    await expect(photoInput).toHaveAttribute('accept', 'image/*');
  });

  test('camera button should be clickable', async ({ page }) => {
    const cameraBtn = page.getByTestId('coach-camera-btn');
    await expect(cameraBtn).toBeVisible();
    await expect(cameraBtn).toBeEnabled();
  });
});

// ============================================
// WISDOM VAULT JOURNAL CAMERA TESTS  
// ============================================

test.describe('Wisdom Vault Journal Camera Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.getByTestId('wisdom-card').click();
    await expect(page.getByTestId('wisdom-vault')).toBeVisible({ timeout: 10000 });
  });

  test('should display Capture a Memory card in journal tab', async ({ page }) => {
    // Journal is the default tab - check for the Capture Memory card
    const captureCard = page.locator('text=Capture a Memory');
    await expect(captureCard).toBeVisible({ timeout: 5000 });
  });

  test('should display camera button for journal photo', async ({ page }) => {
    const cameraBtn = page.getByTestId('journal-camera-btn');
    await expect(cameraBtn).toBeVisible();
  });

  test('should have hidden photo input for journal camera', async ({ page }) => {
    const photoInput = page.getByTestId('journal-photo-input');
    await expect(photoInput).toBeAttached();
    await expect(photoInput).toHaveAttribute('accept', 'image/*');
  });

  test('camera button should be clickable', async ({ page }) => {
    const cameraBtn = page.getByTestId('journal-camera-btn');
    await expect(cameraBtn).toBeVisible();
    await expect(cameraBtn).toBeEnabled();
  });

  test('should show description for capturing poems, notes, anything', async ({ page }) => {
    await expect(page.locator('text=Poem, note, artwork — anything you want to keep')).toBeVisible();
  });
});

// ============================================
// PRESCRIPTION TRACKER MEDICINE SCANNER TESTS
// ============================================

test.describe('Prescription Tracker Medicine Scanner Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.getByTestId('prescriptions-card').click();
    await expect(page.getByTestId('prescription-tracker')).toBeVisible({ timeout: 10000 });
  });

  test('should display Scan Medicine Label card', async ({ page }) => {
    const scanCard = page.locator('text=Scan Medicine Label');
    await expect(scanCard).toBeVisible({ timeout: 5000 });
  });

  test('should display medicine scanner camera button', async ({ page }) => {
    const scannerBtn = page.getByTestId('med-scanner-btn');
    await expect(scannerBtn).toBeVisible();
  });

  test('should have hidden input for medicine scanner', async ({ page }) => {
    const scannerInput = page.getByTestId('med-scanner-input');
    await expect(scannerInput).toBeAttached();
    await expect(scannerInput).toHaveAttribute('accept', 'image/*');
  });

  test('medicine scanner button should be clickable', async ({ page }) => {
    const scannerBtn = page.getByTestId('med-scanner-btn');
    await expect(scannerBtn).toBeVisible();
    await expect(scannerBtn).toBeEnabled();
  });

  test('should show description for scanning medicine bottle or label', async ({ page }) => {
    await expect(page.locator('text=Take a photo of your medicine bottle or label')).toBeVisible();
  });
});
