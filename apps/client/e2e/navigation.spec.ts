import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock for login page
    await page.route('/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>XBorg - Login</title>
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
                <div>Already have an account? <a href="/login">Login</a></div>
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

  test('should navigate to the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Xborg|XBorg/);
  });

  test('should navigate to the signup page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/signup');
    await expect(page.getByText(/Sign up to/i)).toBeVisible();
  });

  test('should navigate to the login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /login/i }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByText(/Login to/i)).toBeVisible();
  });

  test('should navigate from signup to login page', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('link', { name: /login/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should navigate from login to signup page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/signup');
  });
}); 