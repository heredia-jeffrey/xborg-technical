import { test, expect } from '@playwright/test';

test.describe('State Persistence Tests', () => {
  const HTML_CONTENT = `
    <html>
      <head>
        <title>XBorg - State Persistence Test</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .container { max-width: 1000px; margin: 0 auto; }
          .nav { display: flex; background: #f8f9fa; padding: 10px; margin-bottom: 20px; }
          .nav a { margin-right: 20px; text-decoration: none; color: #333; }
          .nav a.active { font-weight: bold; color: #4c6ef5; }
          .page { display: none; }
          .page.active { display: block; }
          .counter-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
          button { padding: 8px 16px; margin-right: 10px; background: #4c6ef5; color: white; border: none; border-radius: 4px; cursor: pointer; }
          input, textarea { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; }
          .saved-note { margin-top: 20px; padding: 15px; background: #d4edda; color: #155724; border-radius: 4px; display: none; }
          .preferences { display: flex; margin-bottom: 20px; }
          .theme-option { padding: 10px; margin-right: 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
          .theme-option.selected { background: #4c6ef5; color: white; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>State Persistence Demo</h1>
          
          <div class="nav">
            <a href="#" id="nav-counter" class="active" data-page="counter-page">Counter</a>
            <a href="#" id="nav-notes" data-page="notes-page">Notes</a>
            <a href="#" id="nav-settings" data-page="settings-page">Settings</a>
          </div>
          
          <div id="counter-page" class="page active">
            <h2>Counter Page</h2>
            <p>This counter will persist across page navigation and reloads:</p>
            <div class="counter-value" id="counter-value">0</div>
            <button id="increment-btn">Increment</button>
            <button id="decrement-btn">Decrement</button>
            <button id="reset-btn">Reset</button>
            <div>
              <p><a href="#" id="reload-link">Simulate Page Reload</a></p>
            </div>
          </div>
          
          <div id="notes-page" class="page">
            <h2>Notes Page</h2>
            <p>Write a note below and it will be saved in local storage:</p>
            <textarea id="notes-content" rows="6" placeholder="Type your notes here..."></textarea>
            <button id="save-notes-btn">Save Notes</button>
            <div id="saved-note" class="saved-note">Notes saved successfully!</div>
          </div>
          
          <div id="settings-page" class="page">
            <h2>Settings Page</h2>
            <p>Select your theme preference:</p>
            <div class="preferences">
              <div class="theme-option" id="theme-light" data-theme="light">Light</div>
              <div class="theme-option" id="theme-dark" data-theme="dark">Dark</div>
              <div class="theme-option" id="theme-system" data-theme="system">System</div>
            </div>
            <button id="save-settings-btn">Save Settings</button>
          </div>
        </div>
        
        <script>
          // Initialize state from localStorage
          function initializeState() {
            // Counter
            const counter = localStorage.getItem('demo-counter') || '0';
            document.getElementById('counter-value').textContent = counter;
            
            // Notes
            const notes = localStorage.getItem('demo-notes') || '';
            document.getElementById('notes-content').value = notes;
            
            // Theme
            const theme = localStorage.getItem('demo-theme') || 'light';
            document.querySelectorAll('.theme-option').forEach(option => {
              option.classList.remove('selected');
            });
            document.querySelector(\`[data-theme="\${theme}"]\`).classList.add('selected');
          }
          
          // Navigation
          document.querySelectorAll('.nav a').forEach(navLink => {
            navLink.addEventListener('click', function(e) {
              e.preventDefault();
              
              // Update active nav
              document.querySelectorAll('.nav a').forEach(link => {
                link.classList.remove('active');
              });
              this.classList.add('active');
              
              // Show active page
              const pageId = this.getAttribute('data-page');
              document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
              });
              document.getElementById(pageId).classList.add('active');
            });
          });
          
          // Counter functionality
          document.getElementById('increment-btn').addEventListener('click', function() {
            const counterEl = document.getElementById('counter-value');
            const newValue = parseInt(counterEl.textContent) + 1;
            counterEl.textContent = newValue;
            localStorage.setItem('demo-counter', newValue);
          });
          
          document.getElementById('decrement-btn').addEventListener('click', function() {
            const counterEl = document.getElementById('counter-value');
            const newValue = parseInt(counterEl.textContent) - 1;
            counterEl.textContent = newValue;
            localStorage.setItem('demo-counter', newValue);
          });
          
          document.getElementById('reset-btn').addEventListener('click', function() {
            document.getElementById('counter-value').textContent = '0';
            localStorage.setItem('demo-counter', '0');
          });
          
          // Notes functionality
          document.getElementById('save-notes-btn').addEventListener('click', function() {
            const notes = document.getElementById('notes-content').value;
            localStorage.setItem('demo-notes', notes);
            
            // Show saved message
            const savedNote = document.getElementById('saved-note');
            savedNote.style.display = 'block';
            setTimeout(() => {
              savedNote.style.display = 'none';
            }, 2000);
          });
          
          // Settings functionality
          document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', function() {
              document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('selected');
              });
              this.classList.add('selected');
            });
          });
          
          document.getElementById('save-settings-btn').addEventListener('click', function() {
            const selectedTheme = document.querySelector('.theme-option.selected');
            const themeValue = selectedTheme.getAttribute('data-theme');
            localStorage.setItem('demo-theme', themeValue);
          });
          
          // Reload simulation
          document.getElementById('reload-link').addEventListener('click', function(e) {
            e.preventDefault();
            initializeState();
          });
          
          // Initialize on load
          initializeState();
        </script>
      </body>
    </html>
  `;

  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML_CONTENT);
  });

  test('should persist counter value across page navigation', async ({
    page,
  }) => {
    // Initial counter value
    await expect(page.locator('#counter-value')).toHaveText('0');

    // Increment the counter a few times
    await page.click('#increment-btn');
    await page.click('#increment-btn');
    await page.click('#increment-btn');

    // Check counter value
    await expect(page.locator('#counter-value')).toHaveText('3');

    // Navigate to Notes page
    await page.click('#nav-notes');

    // Check Notes page is active
    await expect(page.locator('#notes-page')).toBeVisible();

    // Navigate back to Counter page
    await page.click('#nav-counter');

    // Check Counter page is active and counter value persisted
    await expect(page.locator('#counter-page')).toBeVisible();
    await expect(page.locator('#counter-value')).toHaveText('3');
  });

  test('should persist counter value after page reload', async ({ page }) => {
    // Increment the counter
    await page.click('#increment-btn');
    await page.click('#increment-btn');

    // Check counter value
    await expect(page.locator('#counter-value')).toHaveText('2');

    // Simulate page reload
    await page.click('#reload-link');

    // Verify counter value is still there
    await expect(page.locator('#counter-value')).toHaveText('2');
  });

  test('should save theme preference', async ({ page }) => {
    // Navigate to Settings page
    await page.click('#nav-settings');

    // Select dark theme
    await page.click('#theme-dark');
    await page.click('#save-settings-btn');

    // Navigate away and back
    await page.click('#nav-counter');
    await page.click('#nav-settings');

    // Verify dark theme is still selected
    await expect(page.locator('#theme-dark')).toHaveClass(/selected/);
    await expect(page.locator('#theme-light')).not.toHaveClass(/selected/);
  });

  test('should reset counter to zero', async ({ page }) => {
    // Increment counter
    await page.click('#increment-btn');
    await page.click('#increment-btn');
    await page.click('#increment-btn');

    // Verify counter is incremented
    await expect(page.locator('#counter-value')).toHaveText('3');

    // Reset counter
    await page.click('#reset-btn');

    // Verify counter is reset
    await expect(page.locator('#counter-value')).toHaveText('0');

    // Navigate away and back
    await page.click('#nav-notes');
    await page.click('#nav-counter');

    // Verify counter stays at 0
    await expect(page.locator('#counter-value')).toHaveText('0');
  });
});
