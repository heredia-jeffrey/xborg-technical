@echo off
ECHO Starting LoadRunner compatible performance tests...

REM Run the load test
CALL k6 run e2e/loadrunner-script.js

ECHO Running Playwright performance tests...
CALL npx playwright test e2e/performance.spec.ts --reporter=list,html

ECHO Performance test completed. Check the HTML report for details. 