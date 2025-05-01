import { test } from '@playwright/test';

test.describe('LoadRunner-compatible Browser Load Tests', () => {
  test('executes load test in browser', async ({ page }) => {
    // Create a minimal HTML page that can run our load tests
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LoadRunner-compatible Load Test</title>
          <script>
            ${require('fs').readFileSync('e2e/loadrunner-script.js', 'utf8')}
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
    await page.waitForFunction(() => window.testComplete === true, { timeout: 60000 });
    
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