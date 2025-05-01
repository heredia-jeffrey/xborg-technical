const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Running all tests...');

// Paths
const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'apps', 'api');
const clientDir = path.join(rootDir, 'apps', 'client');

try {
  // Kill any running Node processes to free up ports
  console.log('Clearing any running node processes...');
  if (process.platform === 'win32') {
    try {
      execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors if no processes are running
    }
  }

  // Run unit tests first
  console.log('Running unit tests first...');
  execSync('yarn test', { 
    cwd: apiDir, 
    stdio: 'inherit'
  });

  // Start servers in order
  console.log('Starting API server...');
  const apiServer = spawn('yarn', ['dev'], { 
    cwd: apiDir,
    shell: true,
    detached: true,
    stdio: 'inherit'
  });

  console.log('Starting client server...');
  const clientServer = spawn('yarn', ['dev'], { 
    cwd: clientDir,
    shell: true,
    detached: true,
    stdio: 'inherit'
  });

  // Wait for servers to start
  console.log('Waiting for servers to fully start (30 seconds)...');
  setTimeout(() => {
    // Run E2E tests - use port 3001 since that's what the client is using
    console.log('Running E2E tests...');
    try {
      execSync('cross-env PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 playwright test --timeout=90000 --reporter=list', { 
        cwd: clientDir, 
        stdio: 'inherit'
      });
      console.log('E2E tests passed!');
    } catch (error) {
      console.error('E2E tests failed!');
    }

    // Cleanup
    console.log('Tests completed, shutting down servers...');
    if (process.platform === 'win32') {
      try {
        execSync('taskkill /F /IM node.exe', { stdio: 'ignore' });
      } catch (e) {
        // Ignore errors here
      }
    } else {
      process.kill(-clientServer.pid);
      process.kill(-apiServer.pid);
    }
    
    console.log('Test run completed!');
    process.exit(0);
  }, 30000);
} catch (error) {
  console.error('Tests failed!', error);
  process.exit(1);
} 