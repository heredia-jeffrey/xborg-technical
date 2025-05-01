# E2E Tests with Playwright

This directory contains end-to-end tests using Playwright for the XBorg client application.

## Tests Overview

The tests cover:

1. **Navigation** - Basic navigation between pages
2. **Form Validation** - Testing validation for signup and login forms
3. **Accessibility** - Basic accessibility checks for the main pages
4. **Basic Tests** - Simple tests that don't require a running server

## Running the Tests

You can run the tests using the following commands from the client directory:

### Simple tests (Recommended)
These tests don't require a running server and are useful for quick verification:

```bash
# Run basic tests that don't require a server
npm run test:e2e:simple

# Or use the direct command
npx playwright test e2e/basic.spec.ts --config=playwright.simple.config.ts
```

### Server-dependent tests (Manual approach)
For tests that require the Next.js development server, use the following two-step process:

**Step 1:** Start the development server in one terminal:
```bash
npm run dev
```

**Step 2:** In a separate terminal, run the tests:
```bash
npx playwright test
```

> **Note for Windows Users:** The automatic server start option in the Playwright configuration has been disabled as it may cause freezes in some Windows environments. Always use the manual two-step approach above when testing with a server.

## Test Structure

Tests are organized by functionality:

- `navigation.spec.ts` - Tests navigation flows between pages
- `signup-validation.spec.ts` - Tests form validation on the signup page
- `login-validation.spec.ts` - Tests form validation on the login page
- `accessibility.spec.ts` - Tests for basic accessibility features
- `basic.spec.ts` - Simple tests that don't require a running server

## Configuration

We have two configuration files:

1. `playwright.config.ts` - Main configuration for tests that require a web server
   - The automatic server start is commented out to avoid issues
   - Includes settings for browser, test directory, timeouts, etc.

2. `playwright.simple.config.ts` - Configuration for simple tests
   - Does not start a web server
   - Used for tests that create their own content

## Troubleshooting

If you encounter issues with the tests:

1. **Freezing tests**: If tests freeze when using the automatic server start, use the manual two-step approach
2. **Connection errors**: Make sure the server is running on the expected port (3000)
3. **Timeout errors**: Consider increasing the timeout settings in the configuration

## Notes on Metamask Interaction

Since the app uses Metamask for authentication, full end-to-end testing of authentication flows would require special handling for wallet interactions. These current tests focus on UI validation rather than complete authentication flows. 