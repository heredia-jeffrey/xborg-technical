# Test info

- Name: Login Form Validation >> should have working signup link
- Location: C:\Users\hered\playground\xborg\xborg-backend-challenge-main\apps\client\e2e\login-validation.spec.ts:20:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/login", waiting until "load"

    at C:\Users\hered\playground\xborg\xborg-backend-challenge-main\apps\client\e2e\login-validation.spec.ts:5:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Login Form Validation', () => {
   4 |   test.beforeEach(async ({ page }) => {
>  5 |     await page.goto('/login');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
   6 |   });
   7 |
   8 |   test('should display login button', async ({ page }) => {
   9 |     // Check that all form fields are present
  10 |     await expect(page.getByRole('button', { name: /login with metamask/i })).toBeVisible();
  11 |   });
  12 |
  13 |   test('should display correct form labels', async ({ page }) => {
  14 |     await expect(page.getByText(/Login to/i)).toBeVisible();
  15 |     await expect(page.getByText(/Xborg/i)).toBeVisible();
  16 |     await expect(page.getByText(/Dont have an account/i)).toBeVisible();
  17 |     await expect(page.getByRole('link', { name: /Sign up/i })).toBeVisible();
  18 |   });
  19 |
  20 |   test('should have working signup link', async ({ page }) => {
  21 |     await page.getByRole('link', { name: /Sign up/i }).click();
  22 |     await expect(page).toHaveURL('/signup');
  23 |   });
  24 | }); 
```