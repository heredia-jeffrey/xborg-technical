import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the auth state
    await page.addInitScript(() => {
      // Mock session cookie
      Object.defineProperty(window.document, 'cookie', {
        writable: true,
        value: 'xborg.session=fake-session-token',
      });
    });

    // Setup mock for profile page
    await page.route('/profile', async (route) => {
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
                
                <div id="profile-container">
                  <div class="avatar">X</div>
                  
                  <div class="field">
                    <div class="field-title">Username</div>
                    <div class="field-value" id="username">xborg_user</div>
                  </div>
                  
                  <div class="field">
                    <div class="field-title">First name</div>
                    <div class="field-value" id="firstname">John</div>
                  </div>
                  
                  <div class="field">
                    <div class="field-title">Last name</div>
                    <div class="field-value" id="lastname">Doe</div>
                  </div>
                  
                  <div class="field">
                    <div class="field-title">Email</div>
                    <div class="field-value" id="email">john.doe@example.com</div>
                  </div>
                  
                  <div class="field">
                    <div class="field-title">Location</div>
                    <div class="field-value" id="location">New York</div>
                  </div>
                  
                  <button id="logout-button">Logout</button>
                </div>
              </div>
              
              <script>
                document.getElementById('logout-button').addEventListener('click', function() {
                  // Clear cookies
                  document.cookie = "xborg.session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  // Redirect to login
                  window.location.href = '/login';
                });
              </script>
            </body>
          </html>
        `,
      });
    });

    // Mock login page for navigation testing
    await page.route('/login', async (route) => {
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
              </div>
            </body>
          </html>
        `,
      });
    });

    // Mock redirect to login if not authenticated
    await page.route('/api/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          userName: 'xborg_user',
          email: 'john.doe@example.com',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            location: 'New York',
          },
        }),
      });
    });

    await page.goto('/profile');
  });

  test('should display user profile information', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/XBorg - Profile/);

    // Verify heading
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();

    // Verify profile data is visible
    await expect(page.getByText('Username')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#username')).toHaveText('xborg_user');

    await expect(page.getByText('First name')).toBeVisible();
    await expect(page.locator('#firstname')).toBeVisible();
    await expect(page.locator('#firstname')).toHaveText('John');

    await expect(page.getByText('Last name')).toBeVisible();
    await expect(page.locator('#lastname')).toBeVisible();
    await expect(page.locator('#lastname')).toHaveText('Doe');

    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#email')).toHaveText('john.doe@example.com');

    await expect(page.getByText('Location')).toBeVisible();
    await expect(page.locator('#location')).toBeVisible();
    await expect(page.locator('#location')).toHaveText('New York');
  });

  test('should navigate to login page when clicking logout', async ({
    page,
  }) => {
    // Get the logout button
    const logoutButton = page.locator('#logout-button');

    // Check the button is visible
    await expect(logoutButton).toBeVisible();

    // Set up a navigation promise
    const navigationPromise = page.waitForNavigation();

    // Click logout button
    await logoutButton.click();

    // Wait for navigation to complete
    await navigationPromise;

    // Verify we're on the login page
    await expect(page).toHaveTitle(/XBorg - Login/);
    await expect(page.getByText('Login to')).toBeVisible();
  });
});
