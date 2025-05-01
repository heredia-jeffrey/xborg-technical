# Performance Testing

This directory contains performance testing tools for the XBorg application. The tests are designed to measure and verify the performance characteristics of the application.

## Available Performance Tests

1. **Browser-based Performance Test**: Measures rendering and interaction performance in a controlled environment
   - File: `browser-performance.spec.ts`
   - Run: `npx playwright test e2e/browser-performance.spec.ts --reporter=list`

2. **Simple Performance Measurements**: Tests page load time, time to interactive, and API response times
   - File: `simple-performance.spec.ts`
   - Run: `npx playwright test e2e/simple-performance.spec.ts --reporter=list`
   - Note: Requires the application to be running on http://localhost:3000

3. **Basic Performance Metric Collection**: Uses curl to measure response times
   - File: `run-perf-with-server.js`
   - Run: `node e2e/run-perf-with-server.js`
   - Output: Saves results to `e2e/performance-results.json`

## Running Performance Tests

### Standalone Browser Performance Test

This test doesn't require a running server and can be executed at any time:

```bash
npx playwright test e2e/browser-performance.spec.ts --reporter=list
```

### Full Application Performance Tests

1. Start the application server:
   ```bash
   npm run dev
   ```

2. In a separate terminal, run the performance tests:
   ```bash
   npx playwright test e2e/simple-performance.spec.ts --reporter=list
   ```

### Performance Budgets

Performance budgets are defined in each test file. The current thresholds are:

- **Page Load Time**: 5-15 seconds (varies by test)
- **Time to Interactive**: 3-12 seconds (varies by test)
- **API Response Time**: 2-5 seconds (varies by test)

## Interpreting Results

The tests output metrics to the console and, in some cases, to JSON files for further analysis. Key metrics to review include:

1. **Page Load Time**: Total time to fully load the page
2. **Time to Interactive**: Time until the user can interact with the page
3. **API Response Time**: Time for API calls to complete
4. **First Contentful Paint**: Time until the first content is rendered
5. **DOM Complete**: Time until the DOM is fully loaded

## Troubleshooting

If tests fail or freeze:

1. Ensure the application server is running (for tests that require it)
2. Try running the browser-based test which doesn't require a server
3. Check for network issues or firewalls blocking connections
4. Review the performance results to identify bottlenecks 