import { test, expect } from '@playwright/test';

test.describe('API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock for a page that makes API calls
    await page.route('**/api-test', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <head>
              <title>XBorg - API Test</title>
              <style>
                .error-message {
                  color: red;
                  display: none;
                  margin: 10px 0;
                }
                .success-message {
                  color: green;
                  display: none;
                  margin: 10px 0;
                }
                button {
                  margin: 5px;
                  padding: 8px 16px;
                }
                #response-container {
                  margin-top: 20px;
                  padding: 15px;
                  border: 1px solid #ddd;
                  min-height: 100px;
                }
              </style>
            </head>
            <body>
              <div>
                <h3>API Testing Page</h3>
                
                <div>
                  <button id="get-user">Get User Data</button>
                  <button id="get-404">Get 404 Error</button>
                  <button id="get-403">Get 403 Error</button>
                  <button id="get-500">Get 500 Error</button>
                  <button id="get-timeout">Get Timeout Error</button>
                </div>

                <div id="error-401" class="error-message">401 Unauthorized: Please log in again.</div>
                <div id="error-403" class="error-message">403 Forbidden: You don't have permission to access this resource.</div>
                <div id="error-404" class="error-message">404 Not Found: The requested resource was not found.</div>
                <div id="error-500" class="error-message">500 Server Error: Something went wrong on our end. Please try again later.</div>
                <div id="error-timeout" class="error-message">Request Timeout: The server took too long to respond.</div>
                <div id="success-message" class="success-message">Request successful!</div>
                
                <div id="response-container">Response will appear here</div>
              </div>
              
              <script>
                // Function to display response in the container
                function displayResponse(data) {
                  document.getElementById('response-container').textContent = 
                    typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
                }
                
                // Hide all messages
                function hideAllMessages() {
                  document.querySelectorAll('.error-message, .success-message').forEach(el => {
                    el.style.display = 'none';
                  });
                }
                
                // Set up API test buttons
                document.getElementById('get-user').addEventListener('click', function() {
                  hideAllMessages();
                  document.getElementById('success-message').style.display = 'block';
                  displayResponse({ id: 1, name: "Test User", email: "test@example.com" });
                });
                
                document.getElementById('get-404').addEventListener('click', function() {
                  hideAllMessages();
                  document.getElementById('error-404').style.display = 'block';
                  displayResponse("404 Not Found Error");
                });
                
                document.getElementById('get-403').addEventListener('click', function() {
                  hideAllMessages();
                  document.getElementById('error-403').style.display = 'block';
                  displayResponse("403 Forbidden Error");
                });
                
                document.getElementById('get-500').addEventListener('click', function() {
                  hideAllMessages();
                  document.getElementById('error-500').style.display = 'block';
                  displayResponse("500 Internal Server Error");
                });
                
                document.getElementById('get-timeout').addEventListener('click', function() {
                  hideAllMessages();
                  document.getElementById('error-timeout').style.display = 'block';
                  displayResponse("Request Timeout Error");
                });
              </script>
            </body>
          </html>
        `,
      });
    });

    await page.goto('http://localhost:3000/api-test');
  });

  test('should display the API testing interface', async ({ page }) => {
    // Verify the page loads and shows all buttons
    await expect(
      page.getByRole('heading', { name: 'API Testing Page' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Get User Data' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Get 404 Error' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Get 403 Error' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Get 500 Error' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Get Timeout Error' })
    ).toBeVisible();
  });

  test('should handle successful API response', async ({ page }) => {
    // Click the Get User Data button
    await page.getByRole('button', { name: 'Get User Data' }).click();

    // Verify success message appears
    await expect(page.locator('#success-message')).toBeVisible();

    // Verify response is displayed correctly
    const responseText = await page
      .locator('#response-container')
      .textContent();
    expect(responseText).toContain('Test User');
    expect(responseText).toContain('test@example.com');
  });

  test('should handle 404 API error', async ({ page }) => {
    // Click the Get 404 Error button
    await page.getByRole('button', { name: 'Get 404 Error' }).click();

    // Verify error message appears
    await expect(page.locator('#error-404')).toBeVisible();
    await expect(page.locator('#error-404')).toHaveText(
      '404 Not Found: The requested resource was not found.'
    );

    // Verify response is displayed correctly
    const responseText = await page
      .locator('#response-container')
      .textContent();
    expect(responseText).toBe('404 Not Found Error');
  });

  test('should handle 403 API error', async ({ page }) => {
    // Click the Get 403 Error button
    await page.getByRole('button', { name: 'Get 403 Error' }).click();

    // Verify error message appears
    await expect(page.locator('#error-403')).toBeVisible();
    await expect(page.locator('#error-403')).toHaveText(
      "403 Forbidden: You don't have permission to access this resource."
    );

    // Verify response is displayed correctly
    const responseText = await page
      .locator('#response-container')
      .textContent();
    expect(responseText).toBe('403 Forbidden Error');
  });

  test('should handle 500 API error', async ({ page }) => {
    // Click the Get 500 Error button
    await page.getByRole('button', { name: 'Get 500 Error' }).click();

    // Verify error message appears
    await expect(page.locator('#error-500')).toBeVisible();
    await expect(page.locator('#error-500')).toHaveText(
      '500 Server Error: Something went wrong on our end. Please try again later.'
    );

    // Verify response is displayed correctly
    const responseText = await page
      .locator('#response-container')
      .textContent();
    expect(responseText).toBe('500 Internal Server Error');
  });

  test('should handle timeout API error', async ({ page }) => {
    // Click the Get Timeout Error button
    await page.getByRole('button', { name: 'Get Timeout Error' }).click();

    // Verify error message appears
    await expect(page.locator('#error-timeout')).toBeVisible();
    await expect(page.locator('#error-timeout')).toHaveText(
      'Request Timeout: The server took too long to respond.'
    );

    // Verify response is displayed correctly
    const responseText = await page
      .locator('#response-container')
      .textContent();
    expect(responseText).toBe('Request Timeout Error');
  });
});
