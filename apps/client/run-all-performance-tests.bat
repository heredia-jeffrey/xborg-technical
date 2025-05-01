@echo off
echo ===================================================
echo XBorg Performance Test Suite
echo ===================================================

echo.
echo Step 1: Running standalone browser performance test
echo This test doesn't require a running server
echo ---------------------------------------------------
npx playwright test e2e/browser-performance.spec.ts --reporter=list

echo.
echo Step 2: Running basic performance metrics collection
echo ---------------------------------------------------
node e2e/run-perf-with-server.js

echo.
echo Step 3: Checking if application server is running
echo If you want to run the full performance test suite,
echo make sure the application is running on http://localhost:3000
echo ---------------------------------------------------
curl -s -o nul -w "Server status: %{http_code}\n" http://localhost:3000 || (
  echo Application server is not running.
  echo To run the full test suite, start the server with:
  echo   npm run dev
  echo And then run this script again.
  goto :end
)

echo.
echo Step 4: Running full performance test suite
echo ---------------------------------------------------
npx playwright test e2e/simple-performance.spec.ts --reporter=list

:end
echo.
echo Performance testing completed.
echo Check the results above and in e2e/performance-results.json
echo =================================================== 