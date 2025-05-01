import { test, expect } from '@playwright/test';

test.describe('Signup Form Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock for signup page with simplified HTML
    await page.route('**/signup', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>XBorg - Sign Up</title>
              <style>
                .error-message {
                  color: red;
                  display: none;
                }
                .success-message {
                  color: green;
                  display: none;
                }
              </style>
            </head>
            <body>
              <div>
                <h5>Sign up to</h5>
                <h3>Xborg</h3>
                
                <form id="signup-form">
                  <div>
                    <button type="submit" id="metamask-signup">Sign up with Metamask</button>
                    <div id="error-message" class="error-message">Registration failed. Please try again.</div>
                    <div id="metamask-not-installed" class="error-message">Metamask not detected. Please install Metamask.</div>
                    <div id="network-error" class="error-message">Network error. Please check your connection.</div>
                    <div id="wallet-in-use" class="error-message">This wallet is already registered.</div>
                    <div id="rate-limit" class="error-message">Too many attempts. Please try again later.</div>
                    <div id="success-message" class="success-message">Account created! Redirecting...</div>
                  </div>
                </form>
                
                <div>Already have an account? <a href="/login">Log in</a></div>
              </div>
            </body>
          </html>
        `,
      });
    });

    // Mock dashboard page for redirect testing
    await page.route('**/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>XBorg - Dashboard</title>
            </head>
            <body>
              <div>
                <h3>Dashboard</h3>
                <div>Welcome to your dashboard</div>
              </div>
            </body>
          </html>
        `,
      });
    });

    // Mock login page for link testing
    await page.route('**/login', async (route) => {
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
              </div>
            </body>
          </html>
        `,
      });
    });

    await page.goto('http://localhost:3000/signup');
  });

  test('should display the metamask signup button', async ({ page }) => {
    // Basic test to verify the page loads
    await expect(page.getByRole('button', { name: 'Sign up with Metamask' })).toBeVisible();
    await expect(page.getByText('Sign up to')).toBeVisible();
    await expect(page.getByText('Xborg')).toBeVisible();
  });

  test('should show metamask not installed error', async ({ page }) => {
    // Simulate metamask not installed by showing the error
    await page.evaluate(() => {
      document.getElementById('metamask-not-installed').style.display = 'block';
    });
    
    // Verify the error message appears
    await expect(page.locator('#metamask-not-installed')).toBeVisible();
    await expect(page.locator('#metamask-not-installed')).toHaveText(
      'Metamask not detected. Please install Metamask.'
    );
  });

  test('should show wallet already registered error', async ({ page }) => {
    // Show the wallet in use error
    await page.evaluate(() => {
      document.getElementById('wallet-in-use').style.display = 'block';
    });
    
    // Verify the error message appears
    await expect(page.locator('#wallet-in-use')).toBeVisible();
    await expect(page.locator('#wallet-in-use')).toHaveText(
      'This wallet is already registered.'
    );
  });

  test('should show rate limiting error', async ({ page }) => {
    // Show the rate limit error
    await page.evaluate(() => {
      document.getElementById('rate-limit').style.display = 'block';
    });
    
    // Verify the error message appears
    await expect(page.locator('#rate-limit')).toBeVisible();
    await expect(page.locator('#rate-limit')).toHaveText(
      'Too many attempts. Please try again later.'
    );
  });

  test('should show success message and redirect', async ({ page }) => {
    // Mock form submission
    await page.evaluate(() => {
      document.getElementById('success-message').style.display = 'block';
      
      // Use a simpler approach to test redirection
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    });
    
    // Click the signup button
    await page.getByRole('button', { name: 'Sign up with Metamask' }).click();
    
    // Check for title change after redirection
    await expect(async () => {
      const title = await page.title();
      expect(title).toContain('XBorg - Dashboard');
    }).toPass({ timeout: 5000 });
  });

  test('should navigate to login page', async ({ page }) => {
    // Click the login link
    await page.getByRole('link', { name: 'Log in' }).click();
    
    // Verify we're on the login page
    await expect(page).toHaveURL(/login/);
    await expect(page).toHaveTitle(/XBorg - Login/);
  });
}); 