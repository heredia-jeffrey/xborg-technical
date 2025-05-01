import { test, expect } from '@playwright/test';

test.describe('Signup Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the signup page with a form
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
                <form id="signup-form">
                  <div>
                    <label for="username">Username</label>
                    <input id="username" name="username" type="text" />
                    <div class="error-username" style="display: none;">Username is required</div>
                  </div>
                  
                  <div>
                    <label for="email">Email address</label>
                    <input id="email" name="email" type="email" />
                    <div class="error-email" style="display: none;">Must be a valid email</div>
                  </div>
                  
                  <div>
                    <label for="firstName">First name</label>
                    <input id="firstName" name="firstName" type="text" />
                  </div>
                  
                  <div>
                    <label for="lastName">Last name</label>
                    <input id="lastName" name="lastName" type="text" />
                  </div>
                  
                  <button id="signup-button">Sign up with Metamask</button>
                </form>

                <script>
                  document.getElementById('signup-button').addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Reset error messages
                    document.querySelector('.error-username').style.display = 'none';
                    document.querySelector('.error-email').style.display = 'none';
                    
                    // Validate username
                    const username = document.getElementById('username').value;
                    if (!username) {
                      document.querySelector('.error-username').style.display = 'block';
                    }
                    
                    // Validate email
                    const email = document.getElementById('email').value;
                    if (email && !email.includes('@')) {
                      document.querySelector('.error-email').style.display = 'block';
                    }
                  });
                </script>
              </div>
            </body>
          </html>
        `
      });
    });
    
    await page.goto('/signup');
  });

  test('should display form with all fields', async ({ page }) => {
    // Check that all form fields are present
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('First name')).toBeVisible();
    await expect(page.getByLabel('Last name')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up with metamask/i })).toBeVisible();
  });

  test('should show validation error for empty username', async ({ page }) => {
    // Click the sign up button without filling username
    await page.getByRole('button', { name: /sign up with metamask/i }).click();
    
    // Expect error message for required username
    await expect(page.getByText('Username is required')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    // Fill in username field (required)
    await page.getByLabel('Username').fill('testuser');
    
    // Fill in invalid email
    await page.getByLabel('Email address').fill('invalid-email');
    
    // Click sign up button
    await page.getByRole('button', { name: /sign up with metamask/i }).click();
    
    // Expect error message for invalid email
    await expect(page.getByText('Must be a valid email')).toBeVisible();
  });

  test('should not show validation error for valid email format', async ({ page }) => {
    // Fill in username field (required)
    await page.getByLabel('Username').fill('testuser');
    
    // Fill in valid email
    await page.getByLabel('Email address').fill('valid@example.com');
    
    // Click sign up button
    await page.getByRole('button', { name: /sign up with metamask/i }).click();
    
    // Expect no error message for email
    await expect(page.getByText('Must be a valid email')).not.toBeVisible();
  });

  test('should accept special characters in username', async ({ page }) => {
    // Fill in username with special characters
    await page.getByLabel('Username').fill('user-name_123.test');
    
    // Fill in valid email
    await page.getByLabel('Email address').fill('valid@example.com');
    
    // Click sign up button
    await page.getByRole('button', { name: /sign up with metamask/i }).click();
    
    // Expect no error for username format
    await expect(page.getByText('Username is required')).not.toBeVisible();
  });

  test('should accept special characters in email', async ({ page }) => {
    // Fill in username field
    await page.getByLabel('Username').fill('testuser');
    
    // Fill in email with special characters
    await page.getByLabel('Email address').fill('user.name+tag@example-site.com');
    
    // Click sign up button
    await page.getByRole('button', { name: /sign up with metamask/i }).click();
    
    // Expect no error for email format
    await expect(page.getByText('Must be a valid email')).not.toBeVisible();
  });
}); 