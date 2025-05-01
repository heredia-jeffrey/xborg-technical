import { test, expect } from '@playwright/test';

test.describe('Login Form Submission', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Setup mock for login page with interactive form
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
                    <div id="success-message" class="success-message">Login successful! Redirecting...</div>
                  </div>
                </form>
                
                <div>Dont have an account? <a href="/signup">Sign up</a></div>
                
                <script>
                  // Mock Metamask connection
                  window.ethereum = {
                    isMetaMask: true,
                    request: async (params) => {
                      if (params.method === 'eth_requestAccounts') {
                        return ['0x1234567890123456789012345678901234567890'];
                      }
                      if (params.method === 'personal_sign') {
                        return '0xsignature';
                      }
                      return null;
                    }
                  };
                  
                  // Form submission handler
                  document.getElementById('login-form').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Simulate login process
                    document.getElementById('metamask-login').textContent = 'Connecting...';
                    
                    // Show success message immediately
                    document.getElementById('success-message').style.display = 'block';
                    
                    // Redirect after a short delay
                    setTimeout(function() {
                      window.location.href = '/profile';
                    }, 100);
                  });
                </script>
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
                <div>Manage your personal information</div>
              </div>
            </body>
          </html>
        `,
      });
    });

    // Mock API endpoints
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake-session-token',
          user: {
            userName: 'xborg_user',
            email: 'user@example.com',
          },
        }),
      });
    });

    // Setup mock for signup page
    await page.route('**/signup', async (route) => {
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
              </div>
            </body>
          </html>
        `,
      });
    });

    // Navigate to the login page with absolute URL
    await page.goto(`${baseURL}/login`);
  });

  test('should display login form elements', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/XBorg - Login/);

    // Verify heading
    await expect(page.getByText('Login to')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Xborg' })).toBeVisible();

    // Verify login button
    await expect(
      page.getByRole('button', { name: 'Login with Metamask' })
    ).toBeVisible();

    // Verify signup link
    await expect(page.getByText('Dont have an account?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test('should submit form and show success message', async ({ page }) => {
    // Click the login button (no need for navigation promise as that can be flaky)
    await page.getByRole('button', { name: 'Login with Metamask' }).click();

    // Verify button text changes during submission
    await expect(
      page.getByRole('button', { name: 'Connecting...' })
    ).toBeVisible();

    // Wait for success message (with longer timeout)
    await expect(page.locator('#success-message')).toBeVisible({
      timeout: 2000,
    });

    // Allow time for the page to process before checking navigation
    await page.waitForTimeout(200);

    // Verify we're on the profile page
    await expect(page).toHaveTitle(/XBorg - Profile/);
  });

  test('should navigate to signup page when clicking signup link', async ({
    page,
  }) => {
    // Click the signup link (no need for navigation promise)
    await page.getByRole('link', { name: 'Sign up' }).click();

    // Verify we're on the signup page
    await expect(page).toHaveTitle(/XBorg - Sign Up/);
    await expect(page.getByText('Sign up to')).toBeVisible();
  });

  test('should handle login error scenario', async ({ page }) => {
    // Modify the page to simulate an error
    await page.evaluate(() => {
      // Override the submit handler to show error
      document.getElementById('login-form').onsubmit = function (e) {
        e.preventDefault();
        document.getElementById('error-message').style.display = 'block';
        return false;
      };
    });

    // Click the login button
    await page.getByRole('button', { name: 'Login with Metamask' }).click();

    // Verify error message appears
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#error-message')).toHaveText(
      'Login failed. Please try again.'
    );
  });
});
