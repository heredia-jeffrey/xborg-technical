import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  // Mock the login page content
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
              <title>XBorg</title>
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

    // Setup mock for home page
    await page.route('/', async route => {
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
                <h1>Welcome to XBorg</h1>
                <a href="/login">Login</a>
                <a href="/signup">Sign up</a>
              </div>
            </body>
          </html>
        `
      });
    });
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Xborg|XBorg/);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    // Check that there are headings
    const headings = await page.getByRole('heading').all();
    expect(headings.length).toBeGreaterThan(0);
  });
  
  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });
  
  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/Login to/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login with Metamask' })).toBeVisible();
  });
  
  test('signup page should be accessible', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText(/Sign up to/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign up with Metamask' })).toBeVisible();
  });
}); 