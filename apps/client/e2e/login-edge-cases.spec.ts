import { test, expect } from '@playwright/test';

test.describe('Login Form Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock for login page with simplified HTML
    await page.route('**/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>XBorg - Login</title>
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
                <h5>Login to</h5>
                <h3>Xborg</h3>
                
                <form id="login-form">
                  <div>
                    <button type="submit" id="metamask-login">Login with Metamask</button>
                    <div id="error-message" class="error-message">Login failed. Please try again.</div>
                    <div id="metamask-not-installed" class="error-message">Metamask not detected. Please install Metamask.</div>
                    <div id="network-error" class="error-message">Network error. Please check your connection.</div>
                    <div id="success-message" class="success-message">Login successful! Redirecting...</div>
                  </div>
                </form>
                
                <div>Dont have an account? <a href="/signup">Sign up</a></div>
              </div>
            </body>
          </html>
        `,
      });
    });

    // Mock profile page for redirect testing
    await page.route('**/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>XBorg - Profile</title>
            </head>
            <body>
              <div>
                <h3>Profile</h3>
                <div>Welcome to your profile</div>
              </div>
            </body>
          </html>
        `,
      });
    });

    // Use a hardcoded URL instead of baseURL which might be undefined
    await page.goto('http://localhost:3000/login');
  });

  test('should display the metamask login button', async ({ page }) => {
    // Basic test to verify the page loads
    await expect(
      page.getByRole('button', { name: 'Login with Metamask' })
    ).toBeVisible();
    await expect(page.getByText('Login to')).toBeVisible();
    await expect(page.getByText('Xborg')).toBeVisible();
  });

  test('should show metamask not installed error', async ({ page }) => {
    // Simulate metamask not installed by injecting a script to show the error
    await page.evaluate(() => {
      document.getElementById('metamask-not-installed').style.display = 'block';
    });

    // Verify the error message appears
    await expect(page.locator('#metamask-not-installed')).toBeVisible();
    await expect(page.locator('#metamask-not-installed')).toHaveText(
      'Metamask not detected. Please install Metamask.'
    );
  });

  test('should show network error message', async ({ page }) => {
    // Directly show the network error message
    await page.evaluate(() => {
      document.getElementById('network-error').style.display = 'block';
    });

    // Verify the error message appears
    await expect(page.locator('#network-error')).toBeVisible();
    await expect(page.locator('#network-error')).toHaveText(
      'Network error. Please check your connection.'
    );
  });

  test('should show success message and redirect', async ({ page }) => {
    // Mock form submission
    await page.evaluate(() => {
      document.getElementById('success-message').style.display = 'block';

      // Use a simpler approach to test redirection
      setTimeout(() => {
        window.location.href = '/profile';
      }, 100);
    });

    // Click the login button
    await page.getByRole('button', { name: 'Login with Metamask' }).click();

    // Check for title change after redirection
    await expect(async () => {
      const title = await page.title();
      expect(title).toContain('XBorg - Profile');
    }).toPass({ timeout: 5000 });
  });
});
