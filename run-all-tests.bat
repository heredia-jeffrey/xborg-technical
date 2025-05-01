@echo off
echo Running all tests...

echo Running unit tests first...
cd apps\api && yarn test
if %ERRORLEVEL% NEQ 0 (
    echo Unit tests failed!
    exit /b %ERRORLEVEL%
)
cd ..\..

echo Starting servers for E2E tests...
echo Starting client server...
start cmd /c "cd apps\client && yarn dev"

echo Starting API server...
start cmd /c "cd apps\api && yarn dev"

echo Waiting for servers to fully start (30 seconds)...
timeout /t 30

echo Running E2E tests...
cd apps\client 
yarn test:e2e:no-server
set E2E_RESULT=%ERRORLEVEL%
cd ..\..

echo Tests completed, shutting down servers...
taskkill /f /im node.exe

echo Test run completed!
exit /b %E2E_RESULT% 