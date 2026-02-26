import { Page, expect } from '@playwright/test';

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
}

export async function dismissToasts(page: Page) {
  await page.addLocatorHandler(
    page.locator('[data-sonner-toast], .Toastify__toast, [role="status"].toast, .MuiSnackbar-root'),
    async () => {
      const close = page.locator('[data-sonner-toast] [data-close], [data-sonner-toast] button[aria-label="Close"], .Toastify__close-button, .MuiSnackbar-root button');
      await close.first().click({ timeout: 2000 }).catch(() => {});
    },
    { times: 10, noWaitAfter: true }
  );
}

export async function checkForErrors(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const errorElements = Array.from(
      document.querySelectorAll('.error, [class*="error"], [id*="error"]')
    );
    return errorElements.map(el => el.textContent || '').filter(Boolean);
  });
}

export async function acceptDisclaimer(page: Page) {
  // Set disclaimer accepted in localStorage
  await page.evaluate(() => {
    localStorage.setItem('tokhealth_disclaimer_accepted', 'true');
  });
}

export async function login(page: Page, email: string, password: string) {
  // First accept disclaimer
  await acceptDisclaimer(page);
  
  // Navigate to root to trigger auth screen
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  
  // Wait for auth screen
  await expect(page.getByTestId('auth-screen')).toBeVisible({ timeout: 10000 });
  
  // Fill in email and password
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(password);
  
  // Click submit
  await page.getByTestId('auth-submit').click();
  
  // Wait for dashboard to appear
  await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 15000 });
}

export async function loginWithToken(page: Page, email: string, password: string): Promise<string> {
  const baseUrl = page.url().split('/')[0] + '//' + page.url().split('/')[2];
  
  // Accept disclaimer first
  await acceptDisclaimer(page);
  
  // Call login API directly
  const response = await page.request.post(`${baseUrl}/api/auth/login`, {
    data: { email, password }
  });
  
  const data = await response.json();
  const token = data?.data?.token;
  
  if (!token) {
    throw new Error('Login failed - no token returned');
  }
  
  // Set token in localStorage
  await page.evaluate((tkn) => {
    localStorage.setItem('tokhealth_token', tkn);
    localStorage.setItem('tokhealth_disclaimer_accepted', 'true');
  }, token);
  
  return token;
}

export async function navigateToPage(page: Page, pageName: string) {
  // Available pages: loop, profile, biometrics, nutrition, hydration, prescriptions, coach, contacts, export, vault, family
  const navItem = page.getByTestId(`nav-${pageName}`);
  await navItem.click();
}
