#!/bin/bash

# Script to run LoadRunner compatible tests using k6
# Ensure k6 is installed: https://k6.io/docs/getting-started/installation/

echo "Starting LoadRunner compatible performance tests..."

# Run the load test
k6 run e2e/loadrunner-script.js

# Run Playwright performance tests
echo "Running Playwright performance tests..."
npx playwright test e2e/performance.spec.ts --reporter=list,html

# Generate performance report
echo "Performance test completed. Check the HTML report for details." 