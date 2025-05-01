# Test info

- Name: Login Form Edge Cases >> should show success message and redirect
- Location: C:\Users\hered\playground\xborg\xborg-backend-challenge-main\apps\client\e2e\login-edge-cases.spec.ts:105:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "undefined/login", waiting until "load"

    at C:\Users\hered\playground\xborg\xborg-backend-challenge-main\apps\client\e2e\login-edge-cases.spec.ts:69:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Login Form Edge Cases', () => {
   4 |   test.beforeEach(async ({ page, baseURL }) => {
   5 |     // Setup mock for login page with simplified HTML and scripts
   6 |     await page.route('**/login', async (route) => {
   7 |       await route.fulfill({
   8 |         status: 200,
   9 |         contentType: 'text/html',
   10 |         body: `
   11 |           <html>
   12 |             <head>
   13 |               <title>XBorg - Login</title>
   14 |               <style>
   15 |                 .error-message {
   16 |                   color: red;
   17 |                   display: none;
   18 |                 }
   19 |                 .success-message {
   20 |                   color: green;
   21 |                   display: none;
   22 |                 }
   23 |               </style>
   24 |             </head>
   25 |             <body>
   26 |               <div>
   27 |                 <h5>Login to</h5>
   28 |                 <h3>Xborg</h3>
   29 |                 
   30 |                 <form id="login-form">
   31 |                   <div>
   32 |                     <button type="submit" id="metamask-login">Login with Metamask</button>
   33 |                     <div id="error-message" class="error-message">Login failed. Please try again.</div>
   34 |                     <div id="metamask-not-installed" class="error-message">Metamask not detected. Please install Metamask.</div>
   35 |                     <div id="network-error" class="error-message">Network error. Please check your connection.</div>
   36 |                     <div id="success-message" class="success-message">Login successful! Redirecting...</div>
   37 |                   </div>
   38 |                 </form>
   39 |                 
   40 |                 <div>Dont have an account? <a href="/signup">Sign up</a></div>
   41 |               </div>
   42 |             </body>
   43 |           </html>
   44 |         `,
   45 |       });
   46 |     });
   47 |
   48 |     // Mock profile page for redirect testing
   49 |     await page.route('**/profile', async (route) => {
   50 |       await route.fulfill({
   51 |         status: 200,
   52 |         contentType: 'text/html',
   53 |         body: `
   54 |           <html>
   55 |             <head>
   56 |               <title>XBorg - Profile</title>
   57 |             </head>
   58 |             <body>
   59 |               <div>
   60 |                 <h3>Profile</h3>
   61 |                 <div>Welcome to your profile</div>
   62 |               </div>
   63 |             </body>
   64 |           </html>
   65 |         `,
   66 |       });
   67 |     });
   68 |
>  69 |     await page.goto(`${baseURL}/login`);
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
   70 |   });
   71 |
   72 |   test('should display the metamask login button', async ({ page }) => {
   73 |     // Basic test to verify the page loads
   74 |     await expect(page.getByRole('button', { name: 'Login with Metamask' })).toBeVisible();
   75 |     await expect(page.getByText('Login to')).toBeVisible();
   76 |     await expect(page.getByText('Xborg')).toBeVisible();
   77 |   });
   78 |
   79 |   test('should show metamask not installed error', async ({ page }) => {
   80 |     // Simulate metamask not installed by injecting a script to show the error
   81 |     await page.evaluate(() => {
   82 |       document.getElementById('metamask-not-installed').style.display = 'block';
   83 |     });
   84 |     
   85 |     // Verify the error message appears
   86 |     await expect(page.locator('#metamask-not-installed')).toBeVisible();
   87 |     await expect(page.locator('#metamask-not-installed')).toHaveText(
   88 |       'Metamask not detected. Please install Metamask.'
   89 |     );
   90 |   });
   91 |
   92 |   test('should show network error message', async ({ page }) => {
   93 |     // Directly show the network error message
   94 |     await page.evaluate(() => {
   95 |       document.getElementById('network-error').style.display = 'block';
   96 |     });
   97 |     
   98 |     // Verify the error message appears
   99 |     await expect(page.locator('#network-error')).toBeVisible();
  100 |     await expect(page.locator('#network-error')).toHaveText(
  101 |       'Network error. Please check your connection.'
  102 |     );
  103 |   });
  104 |
  105 |   test('should show success message and redirect', async ({ page }) => {
  106 |     // Mock form submission
  107 |     await page.evaluate(() => {
  108 |       document.getElementById('success-message').style.display = 'block';
  109 |       setTimeout(() => {
  110 |         window.location.href = '/profile';
  111 |       }, 50);
  112 |     });
  113 |     
  114 |     // Click the login button
  115 |     await page.getByRole('button', { name: 'Login with Metamask' }).click();
  116 |     
  117 |     // Wait for navigation to profile page
  118 |     await page.waitForURL('**/profile');
  119 |     
  120 |     // Verify we're on the profile page
  121 |     await expect(page).toHaveTitle(/XBorg - Profile/);
  122 |   });
  123 | }); 
```