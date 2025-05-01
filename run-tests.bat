@echo off
echo Starting test sequence...

echo Starting client server...
start /b cmd /c "cd apps\client && yarn dev"

echo Starting API server...
start /b cmd /c "cd apps\api && yarn dev"

echo Waiting for servers to start (15 seconds)...
timeout /t 15

echo Running tests...
cd apps\client && npx playwright test --timeout=90000 --reporter=list

echo Tests completed, shutting down servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3333') do taskkill /f /pid %%a

echo Done! 