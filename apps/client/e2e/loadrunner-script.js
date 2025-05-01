// LoadRunner-compatible performance test script
// This can be executed with any JavaScript test runner

// Import performance budgets
// Note: These match the values in performance-budgets.ts
const PERFORMANCE_BUDGETS = {
  PAGE_LOAD: {
    MAX_TIME: 5000,
    INTERACTIVE: 3000,
  },
  API: {
    MAX_RESPONSE_TIME: 2000,
  },
  LOADRUNNER: {
    THINK_TIME: 3000,
    SUCCESS_RATE_THRESHOLD: 0.95
  }
};

// Custom metrics for LoadRunner compatibility
class PerformanceMetrics {
  constructor() {
    this.pageLoadDurations = [];
    this.apiCallDurations = [];
    this.successfulRequests = 0;
    this.totalRequests = 0;
    this.errors = 0;
  }

  addPageLoadDuration(duration) {
    this.pageLoadDurations.push(duration);
  }

  addApiCallDuration(duration) {
    this.apiCallDurations.push(duration);
  }

  recordSuccess(isSuccess) {
    this.totalRequests++;
    if (isSuccess) {
      this.successfulRequests++;
    } else {
      this.errors++;
    }
  }

  get successRate() {
    return this.successfulRequests / this.totalRequests;
  }

  get averagePageLoadTime() {
    return this.pageLoadDurations.reduce((a, b) => a + b, 0) / this.pageLoadDurations.length;
  }
  
  get averageApiCallTime() {
    return this.apiCallDurations.reduce((a, b) => a + b, 0) / this.apiCallDurations.length;
  }

  get summary() {
    return {
      pageLoad: {
        average: this.averagePageLoadTime,
        samples: this.pageLoadDurations.length,
        max: Math.max(...this.pageLoadDurations),
        min: Math.min(...this.pageLoadDurations)
      },
      apiCall: {
        average: this.averageApiCallTime,
        samples: this.apiCallDurations.length,
        max: Math.max(...this.apiCallDurations),
        min: Math.min(...this.apiCallDurations)
      },
      success: {
        rate: this.successRate,
        total: this.totalRequests,
        errors: this.errors
      }
    };
  }

  verifyBudgets() {
    const results = {
      pageLoadWithinBudget: this.averagePageLoadTime < PERFORMANCE_BUDGETS.PAGE_LOAD.MAX_TIME,
      apiCallWithinBudget: this.averageApiCallTime < PERFORMANCE_BUDGETS.API.MAX_RESPONSE_TIME,
      successRateWithinBudget: this.successRate > PERFORMANCE_BUDGETS.LOADRUNNER.SUCCESS_RATE_THRESHOLD
    };
    
    return {
      passedAll: Object.values(results).every(result => result === true),
      results
    };
  }
}

// This function simulates LoadRunner behavior using the fetch API
// and can be executed in any JavaScript environment
async function runLoadTest(iterations = 10, concurrency = 2) {
  const metrics = new PerformanceMetrics();
  console.log(`Starting load test with ${iterations} iterations and ${concurrency} concurrent users`);
  
  // Create an array of promises for concurrent execution
  const executeIteration = async () => {
    try {
      // Home page test
      let startTime = Date.now();
      let response = await fetch('http://localhost:3000/');
      let endTime = Date.now();
      
      let pageLoadTime = endTime - startTime;
      metrics.addPageLoadDuration(pageLoadTime);
      metrics.recordSuccess(response.ok);
      
      // Simulate user think time (LoadRunner compatible)
      await new Promise(resolve => setTimeout(resolve, PERFORMANCE_BUDGETS.LOADRUNNER.THINK_TIME));
      
      // API call test
      startTime = Date.now();
      response = await fetch('http://localhost:3000/api/profile');
      endTime = Date.now();
      
      let apiCallTime = endTime - startTime;
      metrics.addApiCallDuration(apiCallTime);
      metrics.recordSuccess(response.ok);
    } catch (error) {
      metrics.recordSuccess(false);
      metrics.errors++;
      console.error('Error during load test:', error);
    }
  };
  
  // Execute tests in batches with the specified concurrency
  for (let i = 0; i < iterations; i += concurrency) {
    const batch = [];
    for (let j = 0; j < concurrency && i + j < iterations; j++) {
      batch.push(executeIteration());
    }
    await Promise.all(batch);
    console.log(`Completed batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(iterations / concurrency)}`);
  }
  
  // Print results
  console.log('Performance Test Results:');
  console.log(JSON.stringify(metrics.summary, null, 2));
  
  // Check if all budgets are met
  const budgetVerification = metrics.verifyBudgets();
  console.log(`All performance budgets met: ${budgetVerification.passedAll}`);
  console.log('Budget verification:', JSON.stringify(budgetVerification.results, null, 2));
  
  return {
    metrics,
    budgetVerification
  };
}

// Export the function for use in test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runLoadTest, PERFORMANCE_BUDGETS };
}

// Allow execution in browser environments
if (typeof window !== 'undefined') {
  window.runLoadTest = runLoadTest;
  window.PERFORMANCE_BUDGETS = PERFORMANCE_BUDGETS;
} 