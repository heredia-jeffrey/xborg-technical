import { test, expect } from '@playwright/test';

test.describe('Network Condition Tests', () => {
  const HTML_CONTENT = `
    <html>
      <head>
        <title>XBorg - Network Test</title>
        <style>
          .container { padding: 20px; font-family: Arial, sans-serif; }
          #loading { display: none; color: blue; }
          #error { display: none; color: red; }
          #content { display: none; }
          #retry-button { display: none; margin-top: 10px; }
          button { padding: 8px 16px; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>XBorg Network Test</h1>
          
          <div>
            <button id="load-data">Load Data</button>
            <button id="offline-mode">Simulate Offline</button>
            <button id="online-mode">Simulate Online</button>
          </div>
          
          <div id="loading">Loading data...</div>
          <div id="error">Failed to load data. <span id="error-message"></span></div>
          <button id="retry-button">Retry</button>
          
          <div id="content">
            <h3>User Profile</h3>
            <div id="user-data">
              <p>Name: <span id="user-name"></span></p>
              <p>Email: <span id="user-email"></span></p>
              <p>Status: <span id="user-status"></span></p>
            </div>
          </div>
          
          <script>
            const loadingEl = document.getElementById('loading');
            const errorEl = document.getElementById('error');
            const errorMsgEl = document.getElementById('error-message');
            const contentEl = document.getElementById('content');
            const retryButton = document.getElementById('retry-button');
            
            let isOffline = false;
            
            // Mock API call with network conditions
            async function fetchUserData() {
              loadingEl.style.display = 'block';
              errorEl.style.display = 'none';
              contentEl.style.display = 'none';
              retryButton.style.display = 'none';
              
              // Simulate offline condition
              if (isOffline) {
                setTimeout(() => {
                  loadingEl.style.display = 'none';
                  errorEl.style.display = 'block';
                  errorMsgEl.textContent = 'Network connection unavailable';
                  retryButton.style.display = 'block';
                }, 1000);
                return;
              }
              
              try {
                // Simulate API call
                const response = await new Promise((resolve, reject) => {
                  setTimeout(() => {
                    resolve({
                      ok: true,
                      json: () => Promise.resolve({
                        name: 'John Doe',
                        email: 'john@xborg.com',
                        status: 'Active'
                      })
                    });
                  }, 2000); // 2 second delay to simulate network
                });
                
                if (!response.ok) {
                  throw new Error('API request failed');
                }
                
                const data = await response.json();
                
                // Display the data
                document.getElementById('user-name').textContent = data.name;
                document.getElementById('user-email').textContent = data.email;
                document.getElementById('user-status').textContent = data.status;
                
                loadingEl.style.display = 'none';
                contentEl.style.display = 'block';
              } catch (error) {
                loadingEl.style.display = 'none';
                errorEl.style.display = 'block';
                errorMsgEl.textContent = error.message || 'Unknown error occurred';
                retryButton.style.display = 'block';
              }
            }
            
            // Event listeners
            document.getElementById('load-data').addEventListener('click', fetchUserData);
            
            document.getElementById('offline-mode').addEventListener('click', () => {
              isOffline = true;
              document.body.style.backgroundColor = '#ffeeee';
            });
            
            document.getElementById('online-mode').addEventListener('click', () => {
              isOffline = false;
              document.body.style.backgroundColor = '';
            });
            
            retryButton.addEventListener('click', fetchUserData);
          </script>
        </div>
      </body>
    </html>
  `;

  test.beforeEach(async ({ page }) => {
    // Setup the test page directly with page content instead of routing
    await page.setContent(HTML_CONTENT);
  });

  test('should show loading state when fetching data', async ({ page }) => {
    await page.getByRole('button', { name: 'Load Data' }).click();
    await expect(page.locator('#loading')).toBeVisible();
  });

  test('should load and display data successfully under normal conditions', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Load Data' }).click();

    // Wait for loading to complete and content to appear
    await expect(page.locator('#content')).toBeVisible({ timeout: 5000 });

    // Verify data was loaded
    await expect(page.locator('#user-name')).toHaveText('John Doe');
    await expect(page.locator('#user-email')).toHaveText('john@xborg.com');
  });

  test('should handle offline state gracefully', async ({ page }) => {
    // Set to offline mode
    await page.getByRole('button', { name: 'Simulate Offline' }).click();

    // Try to load data
    await page.getByRole('button', { name: 'Load Data' }).click();

    // Verify error message appears
    await expect(page.locator('#error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#error-message')).toHaveText(
      'Network connection unavailable'
    );

    // Verify retry button appears
    await expect(page.locator('#retry-button')).toBeVisible();
  });

  test('should recover after connection is restored', async ({ page }) => {
    // Set to offline mode
    await page.getByRole('button', { name: 'Simulate Offline' }).click();

    // Try to load data (will fail)
    await page.getByRole('button', { name: 'Load Data' }).click();

    // Wait for error state
    await expect(page.locator('#error')).toBeVisible({ timeout: 5000 });

    // Restore connection
    await page.getByRole('button', { name: 'Simulate Online' }).click();

    // Try again with retry button
    await page.getByRole('button', { name: 'Retry' }).click();

    // Verify data loads successfully
    await expect(page.locator('#content')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#user-name')).toHaveText('John Doe');
  });
});
