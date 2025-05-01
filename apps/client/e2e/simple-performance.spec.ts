import { test, expect } from '@playwright/test';

// Simple performance budgets
const PERFORMANCE_BUDGETS = {
  PAGE_LOAD_MAX_TIME: 10000,       // 10s max for page load (generous)
  TIME_TO_INTERACTIVE: 8000,       // 8s max for TTI
  API_RESPONSE_MAX_TIME: 5000      // 5s max for API response
};

test.describe('Basic Performance Tests', () => {
  test('measures basic page load performance', async ({ page }) => {
    // Start timer
    const startTime = Date.now();
    
    // Navigate to homepage
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Calculate total load time
    const totalLoadTime = Date.now() - startTime;
    console.log(`Total page load time: ${totalLoadTime}ms`);
    
    // This is a generous budget to avoid test failures in various environments
    expect(totalLoadTime).toBeLessThan(PERFORMANCE_BUDGETS.PAGE_LOAD_MAX_TIME);
  });
  
  test('measures time to interactive', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Measure time until a button is clickable
    const startTime = Date.now();
    await page.waitForSelector('button:visible', { timeout: PERFORMANCE_BUDGETS.TIME_TO_INTERACTIVE });
    const timeToInteractive = Date.now() - startTime;
    
    console.log(`Time to interactive: ${timeToInteractive}ms`);
    expect(timeToInteractive).toBeLessThan(PERFORMANCE_BUDGETS.TIME_TO_INTERACTIVE);
  });
  
  test('captures basic performance metrics', async ({ page }) => {
    await page.goto('/');
    
    // Get some basic performance metrics from the browser
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        // Navigation timing
        navigationTiming: {
          loadTime: navigation ? navigation.duration : null,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd : null,
          firstByte: navigation ? navigation.responseStart - navigation.requestStart : null,
        },
        // Paint timing
        paintTiming: {
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
        }
      };
    });
    
    console.log('Performance metrics:', performanceMetrics);
  });
}); 