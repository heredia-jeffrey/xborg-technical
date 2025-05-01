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

All tests use advanced Playwright features for reliable testing:
- Route mocking to simulate server responses
- Waiting for UI state changes before proceeding
- Proper isolation between tests
- Resilient selectors for stable tests across UI changes

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

#### Notes on Test Implementation

- **Mock-Based Testing**: Tests are designed to run without a live backend server by using mocking
- **UI Validation**: E2E tests focus on validating UI elements, navigation, and form validation logic
- **Test Independence**: Each test file can run independently without side effects
- **Robust Selectors**: E2E tests use robust element selectors that are less likely to break with UI changes
- **Test Isolation**: Unit tests isolate components from their dependencies for focused testing

### Test Files Overview

**E2E Test Files:**

- `accessibility.spec.ts`: Tests for proper page structure and element accessibility
- `login-validation.spec.ts`: Tests for login form validation
- `login-form-submission.spec.ts`: Tests for login form submission functionality and success/error states
- `navigation.spec.ts`: Tests for proper navigation between application pages
- `signup-validation.spec.ts`: Tests for signup form validation
- `signup-form-submission.spec.ts`: Tests for signup form submission process and validation
- `profile.spec.ts`: Tests for user profile functionality and authentication state
- `basic.spec.ts`: Basic smoke tests that don't require server connections

**Unit Test Files:**

- `user.service.spec.ts`: Tests for user business logic
- `user.repository.spec.ts`: Tests for data access operations
- `user.controller.spec.ts`: Tests for API endpoints
- Various specialized test files for edge cases and error handling
