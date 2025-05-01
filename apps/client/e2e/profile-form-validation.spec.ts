import { test, expect } from '@playwright/test';

test.describe('Profile Form Validation', () => {
  // HTML content with a user profile form
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
              <label for="display-name">Display Name</label>
              <input type="text" id="display-name" name="displayName" maxlength="50">
              <div id="display-name-error" class="error">Display name cannot exceed 50 characters</div>
            </div>
            
            <div class="form-group">
              <label for="bio">Bio</label>
              <textarea id="bio" name="bio" rows="4" maxlength="500"></textarea>
              <div id="bio-error" class="error">Bio cannot exceed 500 characters</div>
              <div id="bio-count">0/500</div>
            </div>
            
            <div class="form-group">
              <label for="country">Country</label>
              <select id="country" name="country">
                <option value="">Select a country</option>
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="au">Australia</option>
                <option value="fr">France</option>
                <option value="de">Germany</option>
                <option value="jp">Japan</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="website">Website</label>
              <input type="url" id="website" name="website">
              <div id="website-error" class="error">Please enter a valid URL</div>
            </div>
            
            <div class="form-group">
              <input type="checkbox" id="receive-notifications" name="receiveNotifications">
              <label for="receive-notifications" style="display: inline;">Receive email notifications</label>
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
          const displayNameInput = document.getElementById('display-name');
          const bioInput = document.getElementById('bio');
          const websiteInput = document.getElementById('website');
          const termsCheckbox = document.getElementById('terms');
          const bioCount = document.getElementById('bio-count');
          
          // Error elements
          const usernameError = document.getElementById('username-error');
          const emailError = document.getElementById('email-error');
          const displayNameError = document.getElementById('display-name-error');
          const bioError = document.getElementById('bio-error');
          const websiteError = document.getElementById('website-error');
          const termsError = document.getElementById('terms-error');
          
          // Success message
          const formSubmitted = document.getElementById('form-submitted');
          const submittedData = document.getElementById('submitted-data');
          
          // Input validation functions
          function validateUsername() {
            const value = usernameInput.value.trim();
            const isValid = value.length >= 3 && value.length <= 30;
            
            usernameError.style.display = isValid ? 'none' : 'block';
            usernameInput.classList.toggle('input-error', !isValid);
            
            return isValid;
          }
          
          function validateEmail() {
            const value = emailInput.value.trim();
            const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            const isValid = regex.test(value);
            
            emailError.style.display = isValid ? 'none' : 'block';
            emailInput.classList.toggle('input-error', !isValid);
            
            return isValid;
          }
          
          function validateDisplayName() {
            const value = displayNameInput.value.trim();
            const isValid = value.length <= 50;
            
            displayNameError.style.display = isValid ? 'none' : 'block';
            displayNameInput.classList.toggle('input-error', !isValid);
            
            return isValid;
          }
          
          function validateBio() {
            const value = bioInput.value.trim();
            const isValid = value.length <= 500;
            
            bioError.style.display = isValid ? 'none' : 'block';
            bioInput.classList.toggle('input-error', !isValid);
            bioCount.textContent = value.length + '/500';
            
            return isValid;
          }
          
          function validateWebsite() {
            const value = websiteInput.value.trim();
            
            if (value === '') {
              // Website is optional
              websiteError.style.display = 'none';
              websiteInput.classList.remove('input-error');
              return true;
            }
            
            // Simple URL validation
            let isValid = false;
            try {
              new URL(value);
              isValid = true;
            } catch (e) {
              isValid = false;
            }
            
            websiteError.style.display = isValid ? 'none' : 'block';
            websiteInput.classList.toggle('input-error', !isValid);
            
            return isValid;
          }
          
          function validateTerms() {
            const isValid = termsCheckbox.checked;
            
            termsError.style.display = isValid ? 'none' : 'block';
            
            return isValid;
          }
          
          // Attach input event listeners
          usernameInput.addEventListener('input', validateUsername);
          usernameInput.addEventListener('blur', validateUsername);
          
          emailInput.addEventListener('input', validateEmail);
          emailInput.addEventListener('blur', validateEmail);
          
          displayNameInput.addEventListener('input', validateDisplayName);
          displayNameInput.addEventListener('blur', validateDisplayName);
          
          bioInput.addEventListener('input', validateBio);
          bioInput.addEventListener('blur', validateBio);
          
          websiteInput.addEventListener('input', validateWebsite);
          websiteInput.addEventListener('blur', validateWebsite);
          
          termsCheckbox.addEventListener('change', validateTerms);
          
          // Form submission
          form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Validate all fields
            const isUsernameValid = validateUsername();
            const isEmailValid = validateEmail();
            const isDisplayNameValid = validateDisplayName();
            const isBioValid = validateBio();
            const isWebsiteValid = validateWebsite();
            const isTermsChecked = validateTerms();
            
            // Check if form is valid
            const isFormValid = isUsernameValid && isEmailValid && isDisplayNameValid && 
                               isBioValid && isWebsiteValid && isTermsChecked;
            
            if (isFormValid) {
              // Collect form data
              const formData = {
                username: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                displayName: displayNameInput.value.trim() || null,
                bio: bioInput.value.trim() || null,
                country: document.getElementById('country').value || null,
                website: websiteInput.value.trim() || null,
                receiveNotifications: document.getElementById('receive-notifications').checked
              };
              
              // Display success message
              submittedData.innerHTML = '<pre>' + JSON.stringify(formData, null, 2) + '</pre>';
              form.style.display = 'none';
              formSubmitted.style.display = 'block';
              
              // You would typically send the data to an API here
              console.log('Form data:', formData);
            }
          });
        </script>
      </body>
    </html>
  `;

  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML_CONTENT);
  });

  test('should show form with all fields', async ({ page }) => {
    // Check if form is displayed
    await expect(page.locator('#profile-form')).toBeVisible();

    // Check if all form fields are present
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#display-name')).toBeVisible();
    await expect(page.locator('#bio')).toBeVisible();
    await expect(page.locator('#country')).toBeVisible();
    await expect(page.locator('#website')).toBeVisible();
    await expect(page.locator('#receive-notifications')).toBeVisible();
    await expect(page.locator('#terms')).toBeVisible();

    // Check if submit button is present
    await expect(page.locator('#submit-button')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Test with invalid email
    await page.fill('#email', 'invalid-email');

    // Explicitly trigger validation
    await page.evaluate(() => {
      document.getElementById('email')?.dispatchEvent(new Event('blur'));
    });

    // Error should be visible
    await expect(page.locator('#email-error')).toBeVisible();

    // Test with valid email
    await page.fill('#email', 'valid@example.com');

    // Explicitly trigger validation
    await page.evaluate(() => {
      document.getElementById('email')?.dispatchEvent(new Event('blur'));
    });

    // Error should be hidden
    await expect(page.locator('#email-error')).not.toBeVisible();
  });

  test('should validate website URL format', async ({ page }) => {
    // Test with invalid URL
    await page.fill('#website', 'invalid-url');

    // Explicitly trigger validation
    await page.evaluate(() => {
      document.getElementById('website')?.dispatchEvent(new Event('blur'));
    });

    // Error should be visible
    await expect(page.locator('#website-error')).toBeVisible();

    // Test with valid URL
    await page.fill('#website', 'https://example.com');

    // Explicitly trigger validation
    await page.evaluate(() => {
      document.getElementById('website')?.dispatchEvent(new Event('blur'));
    });

    // Error should be hidden
    await expect(page.locator('#website-error')).not.toBeVisible();

    // Test with empty value (should be valid as it's optional)
    await page.fill('#website', '');

    // Explicitly trigger validation
    await page.evaluate(() => {
      document.getElementById('website')?.dispatchEvent(new Event('blur'));
    });

    // Error should be hidden
    await expect(page.locator('#website-error')).not.toBeVisible();
  });

  test('should submit form with valid data', async ({ page }) => {
    // Fill in all required fields with valid data
    await page.fill('#username', 'testuser');
    await page.fill('#email', 'test@example.com');
    await page.check('#terms');

    // Fill in optional fields
    await page.fill('#display-name', 'Test User');
    await page.fill('#bio', 'This is my test bio');
    await page.selectOption('#country', 'us');
    await page.fill('#website', 'https://example.com');
    await page.check('#receive-notifications');

    // Submit the form
    await page.click('#submit-button');

    // Check if success message is displayed
    await expect(page.locator('#form-submitted')).toBeVisible();

    // Check if form data is displayed correctly
    const submittedDataText = await page
      .locator('#submitted-data')
      .textContent();
    // Handle potential null value
    const data = submittedDataText ? JSON.parse(submittedDataText) : {};

    expect(data.username).toBe('testuser');
    expect(data.email).toBe('test@example.com');
    expect(data.displayName).toBe('Test User');
    expect(data.bio).toBe('This is my test bio');
    expect(data.country).toBe('us');
    expect(data.website).toBe('https://example.com');
    expect(data.receiveNotifications).toBe(true);
  });

  test('should submit form with only required fields', async ({ page }) => {
    // Fill in only the required fields
    await page.fill('#username', 'minimaluser');
    await page.fill('#email', 'minimal@example.com');
    await page.check('#terms');

    // Submit the form
    await page.click('#submit-button');

    // Check if success message is displayed
    await expect(page.locator('#form-submitted')).toBeVisible();

    // Check if form data is displayed correctly
    const submittedDataText = await page
      .locator('#submitted-data')
      .textContent();
    // Handle potential null value
    const data = submittedDataText ? JSON.parse(submittedDataText) : {};

    expect(data.username).toBe('minimaluser');
    expect(data.email).toBe('minimal@example.com');
    expect(data.displayName).toBeNull();
    expect(data.bio).toBeNull();
    expect(data.country).toBeNull();
    expect(data.website).toBeNull();
    expect(data.receiveNotifications).toBe(false);
  });
});
