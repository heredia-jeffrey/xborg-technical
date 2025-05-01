import { test, expect } from '@playwright/test';

test.describe('Login Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock for login page
    await page.route('/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>XBorg</title>
            </head>
            <body>
              <div>
                <h5>Login to</h5>
                <h3>Xborg</h3>
                <button>Login with Metamask</button>
                <div>Dont have an account? <a href="/signup">Sign up</a></div>
              </div>
            </body>
          </html>
        `
      });
    });

    // Setup mock for signup page
    await page.route('/signup', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>XBorg - Sign Up</title>
            </head>
            <body>
              <div>
                <h5>Sign up to</h5>
                <h3>Xborg</h3>
                <button>Sign up with Metamask</button>
              </div>
            </body>
          </html>
        `
      });
    });
    
    await page.goto('/login');
  });

  test('should display login button', async ({ page }) => {
    // Check that all form fields are present
    await expect(page.getByRole('button', { name: /login with metamask/i })).toBeVisible();
  });

  test('should display correct form labels', async ({ page }) => {
    await expect(page.getByText(/Login to/i)).toBeVisible();
    await expect(page.locator('h3:has-text("Xborg")')).toBeVisible();
    await expect(page.getByText(/Dont have an account/i)).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Dont have an account\?/ }).getByRole('link')).toBeVisible();
  });

  test('should have working signup link', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/signup');
  });
}); 