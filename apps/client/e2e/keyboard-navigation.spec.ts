import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation Tests', () => {
  const HTML_CONTENT = `
    <html>
      <head>
        <title>XBorg - Keyboard Navigation Test</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          
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
          
          button {
            background-color: #4c6ef5;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
          
          button:hover, button:focus {
            background-color: #364fc7;
            outline: 2px solid #000;
          }
          
          input:focus, select:focus, textarea:focus {
            outline: 2px solid #4c6ef5;
            border-color: #4c6ef5;
          }
          
          /* For focus indicator */
          .focus-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          
          .focused-element {
            font-weight: bold;
            color: #4c6ef5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Keyboard Navigation Test</h1>
          
          <div class="focus-indicator">
            Currently focused: <span id="focused-element">None</span>
          </div>
          
          <form id="test-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name">
            </div>
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email">
            </div>
            
            <div class="form-group">
              <label for="country">Country</label>
              <select id="country" name="country">
                <option value="">Select a country</option>
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="au">Australia</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="message">Message</label>
              <textarea id="message" name="message" rows="4"></textarea>
            </div>
            
            <div class="form-group">
              <button type="button" id="cancel-button">Cancel</button>
              <button type="submit" id="submit-button">Submit</button>
            </div>
          </form>
          
          <div id="submission-result" style="display: none; margin-top: 20px; padding: 15px; background-color: #d4edda; color: #155724; border-radius: 4px;">
            Form submitted successfully!
          </div>
        </div>
        
        <script>
          // Track focused element
          document.addEventListener('focusin', function(e) {
            const target = e.target;
            let elementName = 'Unknown';
            
            if (target.id) {
              elementName = target.id;
            } else if (target.name) {
              elementName = target.name;
            } else if (target.tagName) {
              elementName = target.tagName.toLowerCase();
            }
            
            document.getElementById('focused-element').textContent = elementName;
          });
          
          // Form submission
          document.getElementById('test-form').addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('test-form').style.display = 'none';
            document.getElementById('submission-result').style.display = 'block';
          });
          
          // Cancel button
          document.getElementById('cancel-button').addEventListener('click', function() {
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
              input.value = '';
            });
            
            // Focus back on first field
            document.getElementById('name').focus();
          });
        </script>
      </body>
    </html>
  `;

  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML_CONTENT);
  });

  test('should focus elements in correct order with tab key', async ({ page }) => {
    // Get the expected tab order of focusable elements
    const expectedTabOrder = [
      'name',
      'email', 
      'country',
      'message',
      'cancel-button',
      'submit-button'
    ];
    
    // Start from the beginning of the page
    await page.keyboard.press('Tab');
    
    // Check focus indicator for each element in order
    for (const elementId of expectedTabOrder) {
      await expect(page.locator('#focused-element')).toHaveText(elementId);
      await page.keyboard.press('Tab');
    }
  });

  test('should fill out form using only keyboard', async ({ page }) => {
    // Start by focusing on the first input field
    await page.focus('#name');
    
    // Type in name
    await page.keyboard.type('John Doe');
    
    // Tab to email field
    await page.keyboard.press('Tab');
    await page.keyboard.type('john@example.com');
    
    // Tab to country dropdown
    await page.keyboard.press('Tab');
    
    // Open dropdown with Space
    await page.keyboard.press('Space');
    
    // Navigate down to select an option
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown'); // Move to "United States"
    
    // Select with Enter
    await page.keyboard.press('Enter');
    
    // Tab to message
    await page.keyboard.press('Tab');
    await page.keyboard.type('This is a test message sent using keyboard only');
    
    // Tab to cancel button, then to submit button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Submit the form with Enter
    await page.keyboard.press('Enter');
    
    // Check if form was submitted
    await expect(page.locator('#submission-result')).toBeVisible();
    await expect(page.locator('#test-form')).not.toBeVisible();
  });

  test('should cancel form with keyboard', async ({ page }) => {
    // Fill out the name field
    await page.focus('#name');
    await page.keyboard.type('To be canceled');
    
    // Navigate to cancel button
    await page.keyboard.press('Tab'); // to email
    await page.keyboard.press('Tab'); // to country
    await page.keyboard.press('Tab'); // to message
    await page.keyboard.press('Tab'); // to cancel button
    
    // Verify focus is on cancel button
    await expect(page.locator('#focused-element')).toHaveText('cancel-button');
    
    // Press enter to cancel
    await page.keyboard.press('Enter');
    
    // Verify fields are cleared and focus returned to name
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#focused-element')).toHaveText('name');
  });
}); 