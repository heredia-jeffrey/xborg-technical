import { test, expect } from '@playwright/test';

test.describe('HTTP Status Code Handling', () => {
  // HTML template for our test page
  const getHtmlContent = (initialStatus = 200) => `
    <html>
      <head>
        <title>XBorg - HTTP Status Test</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .error { color: #d32f2f; display: none; }
          .success { color: #388e3c; display: none; }
          .loading { color: #1976d2; display: none; }
          button { padding: 8px 16px; margin-right: 8px; margin-bottom: 8px; cursor: pointer; }
          select { padding: 8px; margin-bottom: 16px; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h2>HTTP Status Code Testing</h2>
            <div>
              <label for="status-select">Select HTTP Status Code:</label>
              <select id="status-select">
                <option value="200">200 - OK</option>
                <option value="201">201 - Created</option>
                <option value="400">400 - Bad Request</option>
                <option value="401">401 - Unauthorized</option>
                <option value="403">403 - Forbidden</option>
                <option value="404">404 - Not Found</option>
                <option value="500">500 - Server Error</option>
                <option value="503">503 - Service Unavailable</option>
              </select>
            </div>
            
            <button id="send-request">Send Request</button>
            <button id="clear-results">Clear Results</button>
            
            <div class="card">
              <h3>Response</h3>
              <div id="loading" class="loading">Loading...</div>
              <div id="success" class="success">Request successful!</div>
              <div id="error" class="error">Error: <span id="error-message"></span></div>
              <pre id="response-data"></pre>
            </div>
          </div>
        </div>
        
        <script>
          // Status code based response templates
          const responseTemplates = {
            200: { message: 'OK', data: { id: 123, name: 'John Doe', email: 'john@example.com' } },
            201: { message: 'Created', data: { id: 456, name: 'New User', email: 'new@example.com' } },
            400: { message: 'Bad Request', error: 'Invalid parameters provided' },
            401: { message: 'Unauthorized', error: 'Authentication required' },
            403: { message: 'Forbidden', error: 'You do not have permission to access this resource' },
            404: { message: 'Not Found', error: 'The requested resource does not exist' },
            500: { message: 'Server Error', error: 'An unexpected error occurred on the server' },
            503: { message: 'Service Unavailable', error: 'The service is temporarily unavailable' }
          };
          
          // Initial status
          let selectedStatus = ${initialStatus};
          document.getElementById('status-select').value = selectedStatus;
          
          // Elements
          const loadingEl = document.getElementById('loading');
          const successEl = document.getElementById('success');
          const errorEl = document.getElementById('error');
          const errorMessageEl = document.getElementById('error-message');
          const responseDataEl = document.getElementById('response-data');
          const statusSelectEl = document.getElementById('status-select');
          
          // Update status when select changes
          statusSelectEl.addEventListener('change', () => {
            selectedStatus = parseInt(statusSelectEl.value, 10);
          });
          
          // Send request
          document.getElementById('send-request').addEventListener('click', async () => {
            // Reset display
            loadingEl.style.display = 'block';
            successEl.style.display = 'none';
            errorEl.style.display = 'none';
            responseDataEl.textContent = '';
            
            // Fake API call with delay to simulate network
            setTimeout(() => {
              loadingEl.style.display = 'none';
              
              const response = responseTemplates[selectedStatus];
              
              // Display based on status code
              if (selectedStatus >= 200 && selectedStatus < 300) {
                // Success
                successEl.style.display = 'block';
                responseDataEl.textContent = JSON.stringify(response, null, 2);
              } else {
                // Error
                errorEl.style.display = 'block';
                errorMessageEl.textContent = response.error;
                responseDataEl.textContent = JSON.stringify(response, null, 2);
              }
            }, 1000);
          });
          
          // Clear results
          document.getElementById('clear-results').addEventListener('click', () => {
            loadingEl.style.display = 'none';
            successEl.style.display = 'none';
            errorEl.style.display = 'none';
            responseDataEl.textContent = '';
          });
        </script>
      </body>
    </html>
  `;

  test.beforeEach(async ({ page }) => {
    await page.setContent(getHtmlContent());
  });

  test('should display loading state when sending request', async ({ page }) => {
    await page.getByRole('button', { name: 'Send Request' }).click();
    await expect(page.locator('#loading')).toBeVisible();
  });

  test('should handle 200 OK response correctly', async ({ page }) => {
    await page.selectOption('#status-select', '200');
    await page.getByRole('button', { name: 'Send Request' }).click();
    
    // Verify success UI elements
    await expect(page.locator('#success')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#error')).not.toBeVisible();
    
    // Verify response data contains expected content
    const responseText = await page.locator('#response-data').textContent();
    expect(responseText).toContain('John Doe');
    expect(responseText).toContain('john@example.com');
  });

  test('should handle 201 Created response correctly', async ({ page }) => {
    await page.selectOption('#status-select', '201');
    await page.getByRole('button', { name: 'Send Request' }).click();
    
    // Verify success UI elements
    await expect(page.locator('#success')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#error')).not.toBeVisible();
    
    // Verify response data contains expected content
    const responseText = await page.locator('#response-data').textContent();
    expect(responseText).toContain('New User');
    expect(responseText).toContain('new@example.com');
  });

  test('should handle 400 Bad Request error correctly', async ({ page }) => {
    await page.selectOption('#status-select', '400');
    await page.getByRole('button', { name: 'Send Request' }).click();
    
    // Verify error UI elements
    await expect(page.locator('#error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#success')).not.toBeVisible();
    await expect(page.locator('#error-message')).toHaveText('Invalid parameters provided');
  });

  test('should handle 401 Unauthorized error correctly', async ({ page }) => {
    await page.selectOption('#status-select', '401');
    await page.getByRole('button', { name: 'Send Request' }).click();
    
    // Verify error UI elements
    await expect(page.locator('#error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#error-message')).toHaveText('Authentication required');
  });

  test('should handle 404 Not Found error correctly', async ({ page }) => {
    await page.selectOption('#status-select', '404');
    await page.getByRole('button', { name: 'Send Request' }).click();
    
    // Verify error UI elements
    await expect(page.locator('#error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#error-message')).toHaveText('The requested resource does not exist');
  });

  test('should handle 500 Server Error correctly', async ({ page }) => {
    await page.selectOption('#status-select', '500');
    await page.getByRole('button', { name: 'Send Request' }).click();
    
    // Verify error UI elements
    await expect(page.locator('#error')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('#error-message')).toHaveText('An unexpected error occurred on the server');
  });

  test('should clear results when clear button is clicked', async ({ page }) => {
    // First make a request to show some data
    await page.getByRole('button', { name: 'Send Request' }).click();
    await expect(page.locator('#success')).toBeVisible({ timeout: 3000 });
    
    // Then clear it
    await page.getByRole('button', { name: 'Clear Results' }).click();
    
    // Verify all result elements are hidden
    await expect(page.locator('#loading')).not.toBeVisible();
    await expect(page.locator('#success')).not.toBeVisible();
    await expect(page.locator('#error')).not.toBeVisible();
    
    // Verify response data is emptied
    const responseText = await page.locator('#response-data').textContent();
    expect(responseText).toBe('');
  });
}); 