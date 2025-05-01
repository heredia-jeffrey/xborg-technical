@echo off
echo Running working tests...

echo Running unit tests first...
cd apps\api && yarn test
if %ERRORLEVEL% NEQ 0 (
    echo Unit tests failed!
    exit /b %ERRORLEVEL%
)
cd ..\..

echo Running simple e2e tests (without server)...
cd apps\client && yarn test:e2e:simple
set E2E_RESULT=%ERRORLEVEL%

echo Test run completed!
exit /b %E2E_RESULT% 