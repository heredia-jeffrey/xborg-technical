import { test, expect } from '@playwright/test';

// Performance thresholds
const PERF_THRESHOLDS = {
  // These are very generous thresholds for any environment
  LOAD_TIME: 15000,     // 15 seconds max
  RENDER_TIME: 10000,   // 10 seconds max
  TIME_TO_INTERACTIVE: 12000 // 12 seconds max
};

test.describe('Browser Performance Metrics', () => {
  test('collects basic performance metrics', async ({ page }) => {
    // Create a start timestamp
    const testStartTime = Date.now();
    
    // Navigate to a static HTML page we create in-memory to avoid server dependencies
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Performance Test</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 2rem; }
            button { padding: 0.5rem 1rem; margin: 1rem 0; }
            .box { 
              width: 300px; 
              height: 200px; 
              background: linear-gradient(45deg, #ff0000, #00ff00);
              margin: 1rem 0;
              transition: all 0.3s ease;
            }
            .box:hover { transform: scale(1.1); }
            @keyframes pulse {
              0% { opacity: 0.5; }
              100% { opacity: 1; }
            }
            .animated { 
              animation: pulse 2s infinite alternate; 
              padding: 1rem;
              background-color: #f0f0f0;
            }
          </style>
        </head>
        <body>
          <h1>Performance Test Page</h1>
          <p class="animated">This element has animations to test rendering performance</p>
          <div class="box"></div>
          <button id="testButton">Click to Test Interactivity</button>
          <div id="results">Click the button to test interaction performance</div>
          
          <script>
            // Record when the page script executes
            window.performanceResults = {
              scriptExecutionTime: Date.now(),
              interactions: []
            };
            
            // Set up the button click handler
            document.getElementById('testButton').addEventListener('click', function() {
              const clickTime = Date.now();
              
              // Simulate some work
              let result = 0;
              for (let i = 0; i < 100000; i++) {
                result += Math.sqrt(i);
              }
              
              const processingTime = Date.now() - clickTime;
              
              // Record the results
              window.performanceResults.interactions.push({
                type: 'click',
                processingTime,
                timestamp: clickTime
              });
              
              // Update the UI
              document.getElementById('results').textContent = 
                'Button click processed in ' + processingTime + 'ms';
            });
            
            // Record when DOM is complete
            document.addEventListener('DOMContentLoaded', function() {
              window.performanceResults.domContentLoaded = Date.now();
            });
            
            // Record when page is fully loaded
            window.addEventListener('load', function() {
              window.performanceResults.pageLoaded = Date.now();
              
              // Record browser performance metrics if available
              if (window.performance) {
                const navTiming = performance.getEntriesByType('navigation')[0];
                if (navTiming) {
                  window.performanceResults.navTiming = {
                    domComplete: navTiming.domComplete,
                    loadEventEnd: navTiming.loadEventEnd,
                    domInteractive: navTiming.domInteractive
                  };
                }
                
                const paintEntries = performance.getEntriesByType('paint');
                window.performanceResults.paintTiming = {};
                
                for (const entry of paintEntries) {
                  window.performanceResults.paintTiming[entry.name] = entry.startTime;
                }
              }
            });
          </script>
        </body>
      </html>
    `);
    
    // Record when the page content was set
    const contentLoadTime = Date.now() - testStartTime;
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Get the recorded performance metrics
    const metrics = await page.evaluate(() => {
      return window.performanceResults;
    });
    
    // Click the button to test interactivity
    await page.click('#testButton');
    
    // Wait a moment for the processing to complete
    await page.waitForTimeout(100);
    
    // Get the updated performance metrics with interaction data
    const metricsWithInteraction = await page.evaluate(() => {
      return window.performanceResults;
    });
    
    // Calculate our own metrics
    const totalLoadTime = Date.now() - testStartTime;
    
    // Log all the collected metrics
    console.log('==== Performance Test Results ====');
    console.log(`Content Load Time: ${contentLoadTime}ms`);
    console.log(`Total Load Time: ${totalLoadTime}ms`);
    console.log('Browser Metrics:', metrics);
    console.log('Interaction Metrics:', metricsWithInteraction.interactions);
    
    // Create assertions based on the collected metrics
    expect(contentLoadTime).toBeLessThan(PERF_THRESHOLDS.RENDER_TIME);
    expect(totalLoadTime).toBeLessThan(PERF_THRESHOLDS.LOAD_TIME);
    
    // Test interaction performance if we have data
    if (metricsWithInteraction.interactions.length > 0) {
      const buttonClick = metricsWithInteraction.interactions[0];
      expect(buttonClick.processingTime).toBeLessThan(PERF_THRESHOLDS.TIME_TO_INTERACTIVE);
    }
  });
}); 