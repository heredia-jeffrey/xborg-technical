import { test, expect } from '@playwright/test';

test.describe('Profile Form Tests (Simplified)', () => {
  const HTML_CONTENT = `
    <html>
      <head>
        <title>XBorg - Profile Update</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #333; }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }
          
          input, select, textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }
          
          input[type="checkbox"] {
            width: auto;
            margin-right: 8px;
          }
          
          button {
            background-color: #4c6ef5;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
          
          button:hover {
            background-color: #364fc7;
          }
          
          button:disabled {
            background-color: #a5a5a5;
            cursor: not-allowed;
          }
          
          .error {
            color: #d32f2f;
            font-size: 14px;
            margin-top: 5px;
            display: none;
          }
          
          .form-submitted {
            display: none;
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
          }
          
          .input-error {
            border-color: #d32f2f;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Update Your Profile</h1>
          
          <form id="profile-form">
            <div class="form-group">
              <label for="username">Username *</label>
              <input type="text" id="username" name="username" required minlength="3" maxlength="30">
              <div id="username-error" class="error">Username must be between 3 and 30 characters</div>
            </div>
            
            <div class="form-group">
              <label for="email">Email Address *</label>
              <input type="email" id="email" name="email" required>
              <div id="email-error" class="error">Please enter a valid email address</div>
            </div>
            
            <div class="form-group">
              <label for="bio">Bio</label>
              <textarea id="bio" name="bio" rows="4" maxlength="500"></textarea>
              <div id="bio-error" class="error">Bio cannot exceed 500 characters</div>
              <div id="bio-count">0/500</div>
            </div>
            
            <div class="form-group">
              <input type="checkbox" id="terms" name="terms" required>
              <label for="terms" style="display: inline;">I agree to the Terms of Service *</label>
              <div id="terms-error" class="error">You must agree to the Terms of Service</div>
            </div>
            
            <button type="submit" id="submit-button">Update Profile</button>
          </form>
          
          <div id="form-submitted" class="form-submitted">
            <h3>Profile Updated!</h3>
            <p>Your profile information has been successfully updated.</p>
            <div id="submitted-data"></div>
          </div>
        </div>
        
        <script>
          // Form elements
          const form = document.getElementById('profile-form');
          const usernameInput = document.getElementById('username');
          const emailInput = document.getElementById('email');
          const bioInput = document.getElementById('bio');
          const termsCheckbox = document.getElementById('terms');
          const bioCount = document.getElementById('bio-count');
          
          // Error elements
          const usernameError = document.getElementById('username-error');
          const emailError = document.getElementById('email-error');
          const bioError = document.getElementById('bio-error');
          const termsError = document.getElementById('terms-error');
          
          // Success message
          const formSubmitted = document.getElementById('form-submitted');
          const submittedData = document.getElementById('submitted-data');

          // Update bio count on input
          bioInput.addEventListener('input', function() {
            const count = bioInput.value.length;
            bioCount.textContent = count + '/500';
            bioError.style.display = count > 500 ? 'block' : 'none';
          });
          
          // Form submission
          form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Validate username
            const isUsernameValid = usernameInput.value.trim().length >= 3 && 
                                   usernameInput.value.trim().length <= 30;
            usernameError.style.display = isUsernameValid ? 'none' : 'block';
            
            // Validate email
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            const isEmailValid = emailRegex.test(emailInput.value.trim());
            emailError.style.display = isEmailValid ? 'none' : 'block';
            
            // Validate bio
            const isBioValid = bioInput.value.trim().length <= 500;
            bioError.style.display = isBioValid ? 'none' : 'block';
            
            // Validate terms
            const isTermsChecked = termsCheckbox.checked;
            termsError.style.display = isTermsChecked ? 'none' : 'block';
            
            // Check if form is valid
            const isFormValid = isUsernameValid && isEmailValid && 
                                isBioValid && isTermsChecked;
            
            if (isFormValid) {
              // Collect form data
              const formData = {
                username: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                bio: bioInput.value.trim() || null,
                termsAccepted: termsCheckbox.checked
              };
              
              // Display success message
              submittedData.innerHTML = '<pre>' + JSON.stringify(formData, null, 2) + '</pre>';
              form.style.display = 'none';
              formSubmitted.style.display = 'block';
              
              console.log('Form submitted successfully:', formData);
            } else {
              console.log('Form validation failed');
            }
          });
        </script>
      </body>
    </html>
  `;

  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML_CONTENT);
  });

  test('should display the form with required fields', async ({ page }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#bio')).toBeVisible();
    await expect(page.locator('#terms')).toBeVisible();
    await expect(page.locator('#submit-button')).toBeVisible();
  });

  test('should not submit form with empty required fields', async ({
    page,
  }) => {
    // Try to submit without filling required fields
    await page.click('#submit-button');

    // Success message should not be visible
    await expect(page.locator('#form-submitted')).not.toBeVisible();

    // Form should still be visible
    await expect(page.locator('#profile-form')).toBeVisible();
  });

  test('should show character count for bio field', async ({ page }) => {
    // Check initial count
    await expect(page.locator('#bio-count')).toHaveText('0/500');

    // Type something
    await page.fill('#bio', 'Hello');

    // Check count is updated
    await expect(page.locator('#bio-count')).toContainText('5/500');
  });

  test('should submit form with valid data', async ({ page }) => {
    // Fill out valid form data
    await page.fill('#username', 'testuser');
    await page.fill('#email', 'test@example.com');
    await page.fill('#bio', 'This is my test bio');
    await page.check('#terms');

    // Submit the form
    await page.click('#submit-button');

    // Check success message is displayed
    await expect(page.locator('#form-submitted')).toBeVisible();

    // Form should be hidden
    await expect(page.locator('#profile-form')).not.toBeVisible();

    // Verify submitted data
    const dataText =
      (await page.locator('#submitted-data').textContent()) || '';
    const data = JSON.parse(dataText);
    expect(data.username).toBe('testuser');
    expect(data.email).toBe('test@example.com');
  });
});
