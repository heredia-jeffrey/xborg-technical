/**
 * Performance budgets and thresholds
 * These values define acceptable performance metrics
 * They integrate with both LoadRunner and Playwright tests
 */

export const PERFORMANCE_BUDGETS = {
  // Page loading budgets
  PAGE_LOAD: {
    MAX_TIME: 5000,        // 5s max for full page load
    INTERACTIVE: 3000,     // 3s max for page to become interactive
    FIRST_CONTENTFUL_PAINT: 2000, // 2s max for first contentful paint
    LARGEST_CONTENTFUL_PAINT: 2500, // 2.5s max for largest contentful paint
  },
  
  // API response budgets
  API: {
    MAX_RESPONSE_TIME: 2000, // 2s max for API responses
    MAX_FIRST_BYTE: 800,     // 800ms max for time to first byte
  },
  
  // User experience budgets
  UX: {
    MAX_INPUT_DELAY: 100,  // 100ms max for input delay
    MAX_LAYOUT_SHIFT: 0.1, // 0.1 max cumulative layout shift
  },
  
  // Resource budgets
  RESOURCES: {
    MAX_JS_SIZE: 500 * 1024,     // 500KB max for JS
    MAX_CSS_SIZE: 100 * 1024,    // 100KB max for CSS
    MAX_IMAGE_SIZE: 200 * 1024,  // 200KB max for images
    MAX_FONT_SIZE: 100 * 1024,   // 100KB max for fonts
    MAX_TOTAL_SIZE: 2 * 1024 * 1024, // 2MB max total
  },
  
  // Network condition simulation
  NETWORK: {
    SLOW_3G: {
      DOWNLOAD: 500 * 1024 / 8, // 500kbps download
      UPLOAD: 250 * 1024 / 8,   // 250kbps upload
      LATENCY: 300,             // 300ms latency
      TIMEOUT_MULTIPLIER: 4,    // Allow 4x normal timeouts
    },
    FAST_3G: {
      DOWNLOAD: 1.5 * 1024 * 1024 / 8, // 1.5Mbps download
      UPLOAD: 750 * 1024 / 8,          // 750kbps upload 
      LATENCY: 150,                    // 150ms latency
      TIMEOUT_MULTIPLIER: 2,           // Allow 2x normal timeouts
    }
  },
  
  // LoadRunner specific settings
  LOADRUNNER: {
    THINK_TIME: 3000,            // 3s think time between actions
    MAX_VIRTUAL_USERS: 100,      // Maximum number of virtual users
    SUCCESS_RATE_THRESHOLD: 0.95 // 95% success rate required
  }
}; 