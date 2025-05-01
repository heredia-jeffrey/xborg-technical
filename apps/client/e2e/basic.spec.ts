import { test, expect } from '@playwright/test';

test.describe('Basic Tests', () => {
  test('basic test - no server required', async ({ page }) => {
    // Create a simple HTML content
    await page.setContent(`
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <h1>Hello Playwright</h1>
          <button>Click me</button>
        </body>
      </html>
    `);

    // Verify the content is rendered correctly
    await expect(
      page.getByRole('heading', { name: 'Hello Playwright' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Click me' })).toBeVisible();
  });

  test('basic interaction - no server required', async ({ page }) => {
    // Create a simple HTML content with interactive elements
    await page.setContent(`
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <input type="text" placeholder="Enter your name" />
          <button onclick="document.querySelector('#result').textContent = 'Hello, ' + document.querySelector('input').value">
            Greet
          </button>
          <div id="result"></div>
        </body>
      </html>
    `);

    // Interact with the page
    await page.getByPlaceholder('Enter your name').fill('Playwright');
    await page.getByRole('button', { name: 'Greet' }).click();

    // Verify the result
    await expect(page.locator('#result')).toHaveText('Hello, Playwright');
  });
});
