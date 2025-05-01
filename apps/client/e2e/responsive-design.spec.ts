import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  // HTML content with responsive design elements
  const HTML_CONTENT = `
    <html>
      <head>
        <title>XBorg - Responsive Design Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; }
          
          .container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          header {
            background-color: #1a1a2e;
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .logo { font-size: 24px; font-weight: bold; }
          
          /* Desktop Navigation */
          .desktop-nav {
            display: flex;
            gap: 20px;
          }
          
          /* Mobile Navigation (Hidden by default) */
          .mobile-nav-toggle {
            display: none;
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
          }
          
          .mobile-nav {
            display: none;
            position: fixed;
            top: 0;
            right: 0;
            width: 250px;
            height: 100%;
            background-color: #1a1a2e;
            padding: 20px;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
          }
          
          .mobile-nav.open {
            transform: translateX(0);
          }
          
          .mobile-nav a {
            display: block;
            color: white;
            text-decoration: none;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .mobile-close {
            color: white;
            background: none;
            border: none;
            font-size: 24px;
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
          }
          
          /* Card Grid */
          .card-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 30px;
          }
          
          .card {
            background-color: #f5f5f5;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .card h3 {
            margin-bottom: 10px;
            color: #1a1a2e;
          }
          
          /* Responsive Media Queries */
          @media (max-width: 1024px) {
            .card-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          @media (max-width: 768px) {
            .desktop-nav {
              display: none;
            }
            
            .mobile-nav-toggle {
              display: block;
            }
            
            .mobile-nav {
              display: block;
            }
            
            .card-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <div class="logo">XBorg</div>
          
          <nav class="desktop-nav">
            <a href="#" id="nav-home">Home</a>
            <a href="#" id="nav-profile">Profile</a>
            <a href="#" id="nav-settings">Settings</a>
            <a href="#" id="nav-logout">Logout</a>
          </nav>
          
          <button class="mobile-nav-toggle" id="mobile-nav-toggle">☰</button>
        </header>
        
        <div class="mobile-nav" id="mobile-nav">
          <button class="mobile-close" id="mobile-close">✕</button>
          <a href="#" id="mobile-nav-home">Home</a>
          <a href="#" id="mobile-nav-profile">Profile</a>
          <a href="#" id="mobile-nav-settings">Settings</a>
          <a href="#" id="mobile-nav-logout">Logout</a>
        </div>
        
        <div class="container">
          <h1>Responsive Design Test</h1>
          <p id="viewport-size">Current viewport: <span id="width">0</span> x <span id="height">0</span></p>
          
          <div class="card-grid">
            <div class="card">
              <h3>Card 1</h3>
              <p>This is content for the first card. It should resize based on viewport width.</p>
            </div>
            <div class="card">
              <h3>Card 2</h3>
              <p>This is content for the second card. It should resize based on viewport width.</p>
            </div>
            <div class="card">
              <h3>Card 3</h3>
              <p>This is content for the third card. It should resize based on viewport width.</p>
            </div>
          </div>
        </div>
        
        <script>
          // Update viewport size display
          function updateViewportSize() {
            document.getElementById('width').textContent = window.innerWidth;
            document.getElementById('height').textContent = window.innerHeight;
          }
          
          // Call initially and on resize
          updateViewportSize();
          window.addEventListener('resize', updateViewportSize);
          
          // Mobile navigation toggle
          document.getElementById('mobile-nav-toggle').addEventListener('click', () => {
            document.getElementById('mobile-nav').classList.add('open');
          });
          
          document.getElementById('mobile-close').addEventListener('click', () => {
            document.getElementById('mobile-nav').classList.remove('open');
          });
        </script>
      </body>
    </html>
  `;

  // Test on desktop viewport
  test('should display desktop layout on large screens', async ({ page }) => {
    // Set a desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(HTML_CONTENT);
    
    // Check that desktop navigation is visible
    await expect(page.locator('.desktop-nav')).toBeVisible();
    
    // Check that mobile navigation toggle is hidden
    await expect(page.locator('.mobile-nav-toggle')).not.toBeVisible();
    
    // Check that the cards are in a 3-column layout (width should be roughly 1/3 of the container)
    const firstCard = page.locator('.card').first();
    const boundingBox = await firstCard.boundingBox();
    
    // Card should take up roughly 1/3 of the container width (accounting for gaps and padding)
    // We're checking if it's less than 400px which is roughly 1/3 of the 1200px max container
    expect(boundingBox.width).toBeLessThan(400);
  });

  // Test on tablet viewport
  test('should adapt layout for tablet screens', async ({ page }) => {
    // Set a tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.setContent(HTML_CONTENT);
    
    // Check that desktop navigation is not visible
    await expect(page.locator('.desktop-nav')).not.toBeVisible();
    
    // Check that mobile navigation toggle is visible
    await expect(page.locator('.mobile-nav-toggle')).toBeVisible();
    
    // Check that mobile nav is initially closed
    await expect(page.locator('.mobile-nav.open')).not.toBeVisible();
    
    // Check the card layout - should be in a single column now
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(3);
    
    // First and second cards should be stacked (similar Y positions)
    const firstCardBox = await cards.nth(0).boundingBox();
    const secondCardBox = await cards.nth(1).boundingBox();
    
    // The second card's top should be below the first card's bottom
    expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height);
  });

  // Test on mobile viewport
  test('should adapt layout for mobile screens', async ({ page }) => {
    // Set a mobile viewport using a predefined device
    await page.setViewportSize(devices['iPhone X'].viewport);
    await page.setContent(HTML_CONTENT);
    
    // Check that desktop navigation is hidden
    await expect(page.locator('.desktop-nav')).not.toBeVisible();
    
    // Check that mobile navigation toggle is visible
    await expect(page.locator('.mobile-nav-toggle')).toBeVisible();
    
    // Test mobile navigation interaction
    await page.click('#mobile-nav-toggle');
    
    // Mobile nav should be open now
    await expect(page.locator('#mobile-nav.open')).toBeVisible();
    
    // Check all mobile nav items are visible
    await expect(page.locator('#mobile-nav-home')).toBeVisible();
    await expect(page.locator('#mobile-nav-profile')).toBeVisible();
    await expect(page.locator('#mobile-nav-settings')).toBeVisible();
    await expect(page.locator('#mobile-nav-logout')).toBeVisible();
    
    // Close mobile nav
    await page.click('#mobile-close');
    
    // Mobile nav should be closed
    await expect(page.locator('#mobile-nav.open')).not.toBeVisible();
    
    // Card layout should be single column on mobile
    const cardGridStyles = await page.evaluate(() => {
      const cardGrid = document.querySelector('.card-grid');
      return window.getComputedStyle(cardGrid).gridTemplateColumns;
    });
    
    // Should only have one column
    expect(cardGridStyles.split(' ').length).toBe(1);
  });

  // Test viewport size display
  test('should update viewport size display when resizing', async ({ page }) => {
    // Start with desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.setContent(HTML_CONTENT);
    
    // Check initial size display
    await expect(page.locator('#width')).toHaveText('1280');
    await expect(page.locator('#height')).toHaveText('720');
    
    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check updated size display
    await expect(page.locator('#width')).toHaveText('768');
    await expect(page.locator('#height')).toHaveText('1024');
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check updated size display
    await expect(page.locator('#width')).toHaveText('375');
    await expect(page.locator('#height')).toHaveText('667');
  });
}); 