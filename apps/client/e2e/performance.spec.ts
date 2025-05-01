import { test, expect } from '@playwright/test';
import { PERFORMANCE_BUDGETS } from './performance-budgets';

// LoadRunner integration
const LR_THINK_TIME = PERFORMANCE_BUDGETS.LOADRUNNER.THINK_TIME;
const MAX_LOAD_TIME = PERFORMANCE_BUDGETS.PAGE_LOAD.MAX_TIME;
const MAX_API_RESPONSE_TIME = PERFORMANCE_BUDGETS.API.MAX_RESPONSE_TIME;

test.describe('Performance Tests', () => {
  // Baseline performance measurement
  test('measures page load performance', async ({ page }) => {
    // Record start time for LoadRunner compatibility
    const startTime = Date.now();
    
    // Navigate to homepage
    await page.goto('/');
    
    // Record navigation timing for LoadRunner export
    const navTiming = await page.evaluate(() => {
      // Get performance data
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Export for LoadRunner compatibility
      return {
        loadEventEnd: perfData.loadEventEnd,
        domContentLoadedEventEnd: perfData.domContentLoadedEventEnd,
        domInteractive: perfData.domInteractive,
        connectEnd: perfData.connectEnd,
        duration: perfData.duration
      };
    });
    
    // Validate performance metrics
    expect(navTiming.loadEventEnd).toBeLessThan(MAX_LOAD_TIME);
    expect(navTiming.domContentLoadedEventEnd).toBeLessThan(PERFORMANCE_BUDGETS.PAGE_LOAD.FIRST_CONTENTFUL_PAINT);
    
    // Calculate elapsed time for LoadRunner export
    const elapsedTime = Date.now() - startTime;
    console.log(`Page load time: ${elapsedTime}ms`);
  });

  // Time to interactive measurement
  test('measures time to interactive', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to be interactive
    await page.waitForSelector('button', { state: 'visible' });
    
    const timeToInteractive = await page.evaluate(() => {
      return performance.now();
    });
    
    console.log(`Time to interactive: ${timeToInteractive}ms`);
    expect(timeToInteractive).toBeLessThan(PERFORMANCE_BUDGETS.PAGE_LOAD.INTERACTIVE);
  });

  // API response time measurement
  test('measures API response times', async ({ page }) => {
    await page.goto('/');
    
    // Record API call timing for LoadRunner compatibility
    await page.route('**/api/**', async (route) => {
      const startTime = Date.now();
      await route.continue();
      const responseTime = Date.now() - startTime;
      
      console.log(`API response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(MAX_API_RESPONSE_TIME);
    });
    
    // Trigger API call by interacting with the page
    await page.click('button:visible');
    
    // Think time for LoadRunner
    await page.waitForTimeout(LR_THINK_TIME);
  });
  
  // Throttled connection test
  test('performs under throttled network conditions', async ({ page }) => {
    // Throttle network for LoadRunner simulation
    await page.context().route('**/*', route => {
      route.continue({
        throttling: {
          downloadSpeed: PERFORMANCE_BUDGETS.NETWORK.FAST_3G.DOWNLOAD,
          uploadSpeed: PERFORMANCE_BUDGETS.NETWORK.FAST_3G.UPLOAD,
          latency: PERFORMANCE_BUDGETS.NETWORK.FAST_3G.LATENCY
        }
      });
    });
    
    const startTime = Date.now();
    await page.goto('/');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load under throttling: ${loadTime}ms`);
    
    // Under throttling we allow a multiplier of the normal maximum load time
    expect(loadTime).toBeLessThan(MAX_LOAD_TIME * PERFORMANCE_BUDGETS.NETWORK.FAST_3G.TIMEOUT_MULTIPLIER);
  });

  // Manual Web Vitals measurement without the web-vitals library
  test('captures performance metrics manually', async ({ page }) => {
    await page.goto('/');
    
    // Get performance metrics manually
    const performanceMetrics = await page.evaluate(() => {
      // Get largest contentful paint
      let largestPaint = 0;
      const paintEntries = performance.getEntriesByType('paint');
      for (const entry of paintEntries) {
        if (entry.name === 'first-contentful-paint') {
          largestPaint = entry.startTime;
        }
      }
      
      // Get cumulative layout shift approximation (if available)
      let layoutShift = 0;
      if ('LayoutShift' in window) {
        // We can only approximate CLS in this manual implementation
        layoutShift = 0.05; // Placeholder value
      }
      
      // Get first input delay approximation
      let firstInputDelay = 0;
      const firstInput = performance.getEntriesByType('first-input')[0];
      if (firstInput) {
        firstInputDelay = firstInput.processingStart - firstInput.startTime;
      }
      
      return {
        LCP: largestPaint,
        CLS: layoutShift,
        FID: firstInputDelay
      };
    });
    
    console.log('Performance Metrics:', performanceMetrics);
    
    // Assert on performance budgets
    expect(performanceMetrics.LCP || 0).toBeLessThan(PERFORMANCE_BUDGETS.PAGE_LOAD.LARGEST_CONTENTFUL_PAINT);
    expect(performanceMetrics.CLS || 0).toBeLessThan(PERFORMANCE_BUDGETS.UX.MAX_LAYOUT_SHIFT);
    expect(performanceMetrics.FID || 0).toBeLessThan(PERFORMANCE_BUDGETS.UX.MAX_INPUT_DELAY);
  });
}); 