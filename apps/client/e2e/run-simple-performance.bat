@echo off
ECHO Running simplified performance tests...

CALL npx playwright test e2e/simple-performance.spec.ts --reporter=list

ECHO Performance test completed. 