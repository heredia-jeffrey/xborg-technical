#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📊 Performance Testing 📊');

// File to store performance metrics
const RESULTS_FILE = path.join(__dirname, 'performance-results.json');

// Simple metrics collector
const metrics = {
  results: [],
  addResult: function(name, value, unit = 'ms', pass = true) {
    this.results.push({
      name,
      value,
      unit,
      pass,
      timestamp: new Date().toISOString()
    });
  },
  saveResults: function() {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(this.results, null, 2));
    console.log(`Results saved to: ${RESULTS_FILE}`);
  }
};

// Measure page load time using curl
function measurePageLoad() {
  return new Promise((resolve, reject) => {
    console.log('Measuring page load time...');
    
    // Use curl to measure response time
    const command = 'curl -o nul -s -w "Connect: %{time_connect}s\\nTTFB: %{time_starttransfer}s\\nTotal: %{time_total}s\\n" http://localhost:3000';
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Measurement failed: ${error.message}`);
        
        // Add a failing result
        metrics.addResult('Page Load Time', 0, 'ms', false);
        resolve(0); // Continue with the test
        return;
      }
      
      console.log('Page load measurement results:');
      console.log(stdout);
      
      // Extract the total time
      const totalTimeMatch = stdout.match(/Total: ([\d.]+)s/);
      if (totalTimeMatch && totalTimeMatch[1]) {
        const totalTimeInSeconds = parseFloat(totalTimeMatch[1]);
        const totalTimeInMs = totalTimeInSeconds * 1000;
        
        metrics.addResult('Page Load Time', totalTimeInMs);
        resolve(totalTimeInMs);
      } else {
        metrics.addResult('Page Load Time', 0, 'ms', false);
        resolve(0);
      }
    });
  });
}

// Main function for simplified performance measurement
async function main() {
  try {
    // Attempt direct measurement without starting server
    await measurePageLoad();
    
    // Save results
    metrics.saveResults();
    
    console.log('Basic performance measurement completed!');
    console.log('Note: For full performance testing, please ensure the application is running');
    
  } catch (error) {
    console.error('Performance testing failed:', error);
  }
}

// Run the main function
main(); 