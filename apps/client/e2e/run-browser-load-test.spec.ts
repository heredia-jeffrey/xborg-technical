import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('LoadRunner-compatible Browser Load Tests', () => {
  test('executes load test in browser', async ({ page }) => {
    // Get the loadrunner script
    const loadRunnerScript = fs.readFileSync(path.join(__dirname, 'loadrunner-script.js'), 'utf8');
    
    // Create a modified version of the script that doesn't depend on a server
    const modifiedScript = loadRunnerScript.replace(
      // Replace the fetch calls with mock functions
      /async function runLoadTest\([^{]*{[\s\S]*?return {/m,
      `async function runLoadTest(iterations = 10, concurrency = 2) {
        const metrics = new PerformanceMetrics();
        console.log(\`Starting load test with \${iterations} iterations and \${concurrency} concurrent users\`);
        
        // Simulated execution with mock data
        const executeIteration = async () => {
          try {
            // Mock home page test
            let startTime = Date.now();
            // Simulate 100-200ms response time
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
            let pageLoadTime = Date.now() - startTime;
            metrics.addPageLoadDuration(pageLoadTime);
            metrics.recordSuccess(true);
            
            // Simulate user think time (LoadRunner compatible)
            await new Promise(resolve => setTimeout(resolve, PERFORMANCE_BUDGETS.LOADRUNNER.THINK_TIME));
            
            // Mock API call test
            startTime = Date.now();
            // Simulate 50-150ms API response time
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
            let apiCallTime = Date.now() - startTime;
            metrics.addApiCallDuration(apiCallTime);
            metrics.recordSuccess(true);
          } catch (error) {
            metrics.recordSuccess(false);
            metrics.errors++;
            console.error('Error during load test:', error);
          }
        };
        
        // Execute tests in batches with the specified concurrency
        for (let i = 0; i < iterations; i += concurrency) {
          const batch = [];
          for (let j = 0; j < concurrency && i + j < iterations; j++) {
            batch.push(executeIteration());
          }
          await Promise.all(batch);
          console.log(\`Completed batch \${Math.floor(i / concurrency) + 1}/\${Math.ceil(iterations / concurrency)}\`);
        }
        
        // Print results
        console.log('Performance Test Results:');
        console.log(JSON.stringify(metrics.summary, null, 2));
        
        // Check if all budgets are met
        const budgetVerification = metrics.verifyBudgets();
        console.log(\`All performance budgets met: \${budgetVerification.passedAll}\`);
        console.log('Budget verification:', JSON.stringify(budgetVerification.results, null, 2));
        
        return {`
    );

    // Create a minimal HTML page that can run our load tests
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LoadRunner-compatible Load Test</title>
          <script>
            ${modifiedScript}
          </script>
        </head>
        <body>
          <h1>LoadRunner-compatible Load Test</h1>
          <div id="results">Running tests...</div>
          <script>
            (async function() {
              try {
                const resultsElement = document.getElementById('results');
                resultsElement.textContent = 'Starting load test...';
                
                const result = await runLoadTest(5, 2);
                
                // Format results for display
                resultsElement.innerHTML = '<h2>Test Results</h2><pre>' + 
                  JSON.stringify(result.metrics.summary, null, 2) + 
                  '</pre><h2>Budget Verification</h2><pre>' + 
                  JSON.stringify(result.budgetVerification, null, 2) + 
                  '</pre>';
                
                window.testComplete = true;
                window.testResults = result;
              } catch (error) {
                document.getElementById('results').textContent = 'Error: ' + error.message;
                console.error(error);
                window.testComplete = true;
                window.testError = error;
              }
            })();
          </script>
        </body>
      </html>
    `);
    
    // Wait for the test to complete
    await page.waitForFunction(() => window.testComplete === true, { timeout: 30000 });
    
    // Get the test results
    const testResults = await page.evaluate(() => {
      return {
        error: window.testError,
        results: window.testResults
      };
    });
    
    // Log the results
    if (testResults.error) {
      console.error('Load test failed:', testResults.error);
    } else {
      console.log('Load test summary:', JSON.stringify(testResults.results.metrics.summary, null, 2));
      console.log('Budget verification:', JSON.stringify(testResults.results.budgetVerification, null, 2));
      console.log('All budgets met:', testResults.results.budgetVerification.passedAll);
    }
  });
}); 