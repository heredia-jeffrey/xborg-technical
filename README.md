# XBorg Tech Challenge

## Submission Requirements

- Unit Tests
- Integration Tests
- E2E Testing
- Testing Performance benchmarks
- Clearly document strategies via effective testing and in the Submission Documentation section of the ReadMe

Implementation should be submitted via a public GitHub repository, or a private repository with collaborator access granted to the provided emails.

## Architecture

- Language - Typescript
- Monorepo - Turborepo
- Client - NextJs
- Api - NestJs
- DB - SQLite

## Apps and Packages

- `client`: [Next.js](https://nextjs.org/) app
- `api`: [Nestjs](https://nestjs.com) app
- `tsconfig`: Typescript configuration used throughout the monorepo

## Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Husky](https://typicode.github.io/husky/) for Git hooks

## Steps to run app

#### Install Metamask [link](https://chromewebstore.google.com/detail/nkbihfbeogaeaoehlefnkodbefgpgknn?utm_source=item-share-cb)

#### Run commands in order

```bash
# Enter all commands from the project root

# Start the infrastructure (Requires Docker)
$ yarn start:local:infra

# Install dependencies
$ yarn install

 # Build the app including the lib
$ yarn build

# Migrate the DB
$ cd apps/api && yarn migrate:local

 # Run the application stack in dev
 $ yarn dev
```

## Additional Commands

```bash
# Run tests in all apps
$ yarn test

# Run linter in all apps
$ yarn lint

# Format code in all apps
$ yarn format

```

## Submission Documentation...

## Testing Architecture

The project employs a comprehensive testing approach across multiple layers:

### End-to-End (E2E) Tests

E2E tests verify the entire application flow from the user's perspective. This project uses Playwright for E2E testing, which offers several advantages:

- **Browser Automation**: Tests run in real browser environments
- **Speed**: Playwright's execution is faster than other E2E frameworks
- **Isolation**: Tests can run independently of backend services using route mocking

#### Key E2E Test Features

1. **Page Route Mocking**: All E2E tests implement route mocking to simulate server responses without requiring a running backend

   - Tests remain stable regardless of backend availability
   - Tests run faster by bypassing real network requests
   - Enables focused testing of UI behavior independent of API changes

2. **Test Categories**:
   - **Accessibility Tests**: Verify that pages are accessible and contain expected elements
   - **Navigation Tests**: Ensure proper navigation between different pages
   - **Form Validation Tests**: Test form input validation for login and signup forms
   - **Form Submission Tests**: Validate form submissions and success/error states
   - **Profile Page Tests**: Test user profile functionality including data display and logout
   - **User Journey Tests**: Test complete flows from login/signup through to profile viewing
   - **Basic Tests**: Simple smoke tests for basic application functionality
   - **Edge Case Tests**: Test error handling and edge cases for various user interactions
   - **API Error Tests**: Test application's ability to handle various API error responses

#### Comprehensive E2E Test Suite

The E2E test suite has been expanded to include thorough testing of all major user flows:

1. **Profile Page Testing** (`profile.spec.ts`):

   - Verifies user profile data is displayed correctly
   - Tests logout functionality
   - Confirms authentication state handling

2. **Login Form Submission** (`login-form-submission.spec.ts`):

   - Tests successful login form submission
   - Validates error handling during login attempts
   - Confirms proper UI state changes during the login process
   - Tests navigation between login and signup pages

3. **Signup Form Submission** (`signup-form-submission.spec.ts`):

   - Tests successful signup with valid user data
   - Validates form field requirements
   - Tests email format validation
   - Confirms proper UI state changes during signup process
   - Tests navigation between signup and login pages

4. **Form Validation** (`login-validation.spec.ts`, `signup-validation.spec.ts`):

   - Tests validation of required fields
   - Validates input format requirements
   - Tests error message display
   - Confirms handling of special characters in inputs

5. **Accessibility & Navigation** (`accessibility.spec.ts`, `navigation.spec.ts`):

   - Tests proper page structure and element accessibility
   - Confirms navigation paths between all application pages

6. **Edge Cases Testing** (`login-edge-cases.spec.ts`, `signup-edge-cases.spec.ts`):

   - Tests scenarios where Metamask is not installed
   - Tests network error handling during login/signup
   - Tests handling of slow server responses
   - Tests behavior when the wallet is already registered
   - Tests rate limiting error handling
   - Tests multiple submission attempt prevention

7. **API Error Handling** (`api-errors.spec.ts`):

   - Tests application's handling of various HTTP status codes (403, 404, 500)
   - Tests timeout error handling
   - Tests proper error message display for different error types
   - Verifies consistent user experience during API failures

8. **Network Condition Tests** (`network-conditions.spec.ts`):

   - Tests application behavior under different connectivity scenarios
   - Verifies offline mode handling and appropriate error messages
   - Tests recovery when connection is restored
   - Validates loading states during network operations

9. **HTTP Status Handling Tests** (`http-status-handling.spec.ts`):

   - Comprehensive testing of all important HTTP status codes (200, 201, 400, 401, 403, 404, 500)
   - Verifies proper UI updates based on response status
   - Tests error message display for different status codes
   - Validates success states for 2xx responses

10. **Responsive Design Tests** (`responsive-design.spec.ts`):

    - Tests across multiple viewport sizes (desktop, tablet, mobile)
    - Verifies layout adaptations and responsive UI elements
    - Tests navigation changes in mobile view
    - Validates card grid reflow and other responsive behaviors

11. **MetaMask Integration Tests** (`metamask-integration.spec.ts`):

    - Tests wallet connection with mocked Ethereum provider
    - Validates success and failure scenarios for wallet connections
    - Tests message signing functionality
    - Tests transaction handling
    - Verifies proper error handling during wallet operations

12. **Form Tests and State Persistence** (`simplified-form-tests.spec.ts`, `state-persistence.spec.ts`):

    - Tests form validation and submission workflows
    - Validates state persistence across page navigation
    - Tests local storage for user preferences
    - Verifies data retention after simulated page reloads

13. **Keyboard Navigation Tests** (`keyboard-navigation.spec.ts`):
    - Tests navigation using only keyboard inputs
    - Validates proper tab order through interactive elements
    - Tests form completion using keyboard
    - Verifies focus management and accessibility

All tests use advanced Playwright features for reliable testing:

- Route mocking to simulate server responses
- Waiting for UI state changes before proceeding
- Proper isolation between tests
- Resilient selectors for stable tests across UI changes
- Direct DOM state manipulation for predictable test behavior

### Unit Tests

The backend API is thoroughly tested using Jest, with a focus on testing each component in isolation. The project follows best practices for unit testing:

- **Mocking Dependencies**: External dependencies are mocked using Jest mocks and ts-sinon to isolate units under test
- **Test Organization**: Tests are organized in `__tests__` directories alongside the source code they test
- **Comprehensive Coverage**: Tests cover normal operation, edge cases, and error handling

#### Key Unit Test Features

1. **Test Categories**:

   - **Service Tests**: Test business logic in service classes independently of controllers and repositories
   - **Repository Tests**: Test data access logic with mocked database interactions
   - **Controller Tests**: Test API endpoint behavior with mocked services
   - **Integration Tests**: Test interaction between modules

2. **Specialized Test Suites**:

   - **Error Handling Tests**: Ensure proper error responses and status codes
   - **Edge Case Tests**: Verify behavior with unusual inputs
   - **Special Character Tests**: Test handling of special characters in data

3. **Test Structure**:
   - Tests use the Arrange-Act-Assert (AAA) pattern for clear test organization
   - Each test focuses on testing a single behavior
   - Detailed test descriptions make it clear what functionality is being verified

#### Sample Test Coverage

The project includes specialized test files focusing on different aspects of the application:

- **user.service.spec.ts**: Tests core user service functionality
- **user.service.error-handling.spec.ts**: Tests error scenarios in the user service
- **user.service.edge-cases.spec.ts**: Tests unusual input handling
- **user.service.special-characters.spec.ts**: Tests handling of special characters
- **user.repository.spec.ts**: Tests data access operations
- **user.controller.spec.ts**: Tests API endpoints

### Running Tests

The project provides several commands for running tests:

```bash
# Run all tests (unit + simple E2E tests)
$ yarn test

# Run all E2E tests with route mocking
$ yarn test:e2e

# Run only the originally fixed accessibility and login tests
$ yarn test:e2e:fixed

# Run only basic E2E tests
$ yarn test:e2e:simple

# Run specific E2E test files
$ cd apps/client && npx playwright test e2e/profile.spec.ts
$ cd apps/client && npx playwright test e2e/login-form-submission.spec.ts
$ cd apps/client && npx playwright test e2e/signup-form-submission.spec.ts

# Run new edge case test files
$ cd apps/client && npx playwright test e2e/login-edge-cases.spec.ts
$ cd apps/client && npx playwright test e2e/signup-edge-cases.spec.ts
$ cd apps/client && npx playwright test e2e/api-errors.spec.ts

# Run advanced test scenarios
$ cd apps/client && npx playwright test e2e/network-conditions.spec.ts
$ cd apps/client && npx playwright test e2e/http-status-handling.spec.ts
$ cd apps/client && npx playwright test e2e/responsive-design.spec.ts
$ cd apps/client && npx playwright test e2e/metamask-integration.spec.ts
$ cd apps/client && npx playwright test e2e/keyboard-navigation.spec.ts

# Run all edge case tests together
$ cd apps/client && npx playwright test e2e/login-edge-cases.spec.ts e2e/signup-edge-cases.spec.ts e2e/api-errors.spec.ts

# Run E2E tests with UI mode for debugging
$ cd apps/client && npx playwright test --ui

# Run unit tests only
$ yarn test:unit

# Run the full test suite including all E2E tests
$ yarn test:full

# Run API unit tests in watch mode (auto-rerun on file changes)
$ cd apps/api && yarn test:watch

# Run API unit tests with coverage report
$ cd apps/api && yarn test:cov
```

### Performance Testing

The project includes a comprehensive performance testing suite that measures and monitors the application's performance characteristics. These tests help establish performance baselines and identify potential bottlenecks or regressions.

#### Performance Test Types

1. **Browser-based Performance Tests** (`browser-performance.spec.ts`):
   - Measures rendering and interaction performance in a controlled environment
   - Tracks metrics like content load time, total load time, and interaction responsiveness
   - Runs independently of the application server, allowing for isolated testing
   - Simulates user interactions and measures response times

2. **Simple Performance Measurements** (`simple-performance.spec.ts`):
   - Tests page load time, time to interactive, and API response times
   - Captures browser performance metrics (navigation timing, paint timing)
   - Requires the application to be running on http://localhost:3000

3. **Basic Performance Metrics Collection** (`run-perf-with-server.js`):
   - Uses curl to measure basic response times
   - Outputs results to a JSON file for further analysis
   - Can be integrated into CI/CD pipelines for continuous performance monitoring

#### Performance Budgets

Each performance test includes defined thresholds ("budgets") that establish acceptable performance limits:

- **Page Load Time**: 5-15 seconds (varies by test)
- **Time to Interactive**: 3-12 seconds (varies by test)
- **API Response Time**: 2-5 seconds (varies by test)

These budgets can be adjusted based on specific performance requirements and target environments.

#### Running Performance Tests

The project includes multiple ways to run performance tests:

1. **Complete Performance Test Suite**:
   ```bash
   # Navigate to the client app
   cd apps/client
   
   # Run all performance tests (Windows)
   ./run-all-performance-tests.bat
   ```

2. **Standalone Browser Performance Test** (no server required):
   ```bash
   # Navigate to the client app
   cd apps/client
   
   # Run browser-only performance test
   npx playwright test e2e/browser-performance.spec.ts --reporter=list
   ```

3. **Full Application Performance Test** (requires running server):
   ```bash
   # Start the application server in one terminal
   yarn dev
   
   # In another terminal, run the performance tests
   cd apps/client
   npx playwright test e2e/simple-performance.spec.ts --reporter=list
   ```

4. **Basic Metrics Collection**:
   ```bash
   # Navigate to the client app
   cd apps/client
   
   # Run basic metrics collection
   node e2e/run-perf-with-server.js
   ```

#### Performance Test Results

Performance test results are output in two ways:
- Console output showing key metrics during test execution
- JSON file (`performance-results.json`) for metrics that can be tracked over time

For more detailed information about performance testing, see the [Performance Testing README](apps/client/e2e/README-performance.md).
