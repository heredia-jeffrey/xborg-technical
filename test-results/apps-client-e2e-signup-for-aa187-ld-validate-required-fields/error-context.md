# Test info

- Name: Signup Form Submission >> should validate required fields
- Location: C:\Users\hered\playground\xborg\xborg-backend-challenge-main\apps\client\e2e\signup-form-submission.spec.ts:137:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('#username-error')
Expected: visible
Received: hidden
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('#username-error')
    9 × locator resolved to <div id="username-error" class="error-message">Username is required</div>
      - unexpected value "hidden"

    at C:\Users\hered\playground\xborg\xborg-backend-challenge-main\apps\client\e2e\signup-form-submission.spec.ts:142:51
```

# Page snapshot

```yaml
- heading "Sign up to" [level=5]
- heading "Xborg" [level=3]
- text: Username
- textbox "Username"
- text: Email address
- textbox "Email address"
- text: First name
- textbox "First name"
- text: Last name
- textbox "Last name"
- button "Sign up with Metamask"
- text: Already have an account?
- link "Login":
  - /url: /login
```

# Test source

```ts
   42 |                 <input id="firstName" name="firstName" type="text" />
   43 |               </div>
   44 |               
   45 |               <div>
   46 |                 <label for="lastName">Last name</label>
   47 |                 <input id="lastName" name="lastName" type="text" />
   48 |               </div>
   49 |               
   50 |               <div>
   51 |                 <button type="submit" id="signup-button">Sign up with Metamask</button>
   52 |                 <div id="form-error" class="error-message">Signup failed. Please try again.</div>
   53 |                 <div id="form-success" class="success-message">Signup successful! Redirecting...</div>
   54 |               </div>
   55 |             </form>
   56 |             
   57 |             <div>Already have an account? <a href="/login" id="login-link">Login</a></div>
   58 |             
   59 |             <script>
   60 |               // Form validation functions
   61 |               function validateEmail(email) {
   62 |                 return email === '' || email.includes('@');
   63 |               }
   64 |               
   65 |               // Form submission handler
   66 |               document.getElementById('signup-form').addEventListener('submit', function(e) {
   67 |                 e.preventDefault();
   68 |                 
   69 |                 // Reset errors
   70 |                 document.getElementById('username-error').style.display = 'none';
   71 |                 document.getElementById('email-error').style.display = 'none';
   72 |                 document.getElementById('form-error').style.display = 'none';
   73 |                 
   74 |                 // Get form values
   75 |                 const username = document.getElementById('username').value;
   76 |                 const email = document.getElementById('email').value;
   77 |                 
   78 |                 // Validate
   79 |                 let isValid = true;
   80 |                 
   81 |                 if (!username) {
   82 |                   document.getElementById('username-error').style.display = 'block';
   83 |                   isValid = false;
   84 |                 }
   85 |                 
   86 |                 if (email && !validateEmail(email)) {
   87 |                   document.getElementById('email-error').style.display = 'block';
   88 |                   isValid = false;
   89 |                 }
   90 |                 
   91 |                 if (isValid) {
   92 |                   // Show success
   93 |                   document.getElementById('signup-button').textContent = 'Connecting...';
   94 |                   document.getElementById('form-success').style.display = 'block';
   95 |                   
   96 |                   // Set a flag to indicate successful submission
   97 |                   window.signupSuccess = true;
   98 |                 }
   99 |               });
  100 |               
  101 |               // Mock login link click handler
  102 |               document.getElementById('login-link').addEventListener('click', function(e) {
  103 |                 e.preventDefault();
  104 |                 document.title = 'XBorg - Login';
  105 |                 document.body.innerHTML = '<h5>Login to</h5><h3>Xborg</h3>';
  106 |                 window.loginPageLoaded = true;
  107 |               });
  108 |             </script>
  109 |           </div>
  110 |         </body>
  111 |       </html>
  112 |     `);
  113 |   });
  114 |
  115 |   test('should display signup form elements', async ({ page }) => {
  116 |     // Verify page title
  117 |     await expect(page).toHaveTitle(/XBorg - Sign Up/);
  118 |     
  119 |     // Verify heading
  120 |     await expect(page.getByText('Sign up to')).toBeVisible();
  121 |     await expect(page.getByRole('heading', { name: 'Xborg' })).toBeVisible();
  122 |     
  123 |     // Verify form fields
  124 |     await expect(page.getByLabel('Username')).toBeVisible();
  125 |     await expect(page.getByLabel('Email address')).toBeVisible();
  126 |     await expect(page.getByLabel('First name')).toBeVisible();
  127 |     await expect(page.getByLabel('Last name')).toBeVisible();
  128 |     
  129 |     // Verify signup button
  130 |     await expect(page.getByRole('button', { name: 'Sign up with Metamask' })).toBeVisible();
  131 |     
  132 |     // Verify login link
  133 |     await expect(page.getByText('Already have an account?')).toBeVisible();
  134 |     await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  135 |   });
  136 |
  137 |   test('should validate required fields', async ({ page }) => {
  138 |     // Submit without filling required fields
  139 |     await page.getByRole('button', { name: 'Sign up with Metamask' }).click();
  140 |     
  141 |     // Verify username error message
> 142 |     await expect(page.locator('#username-error')).toBeVisible();
      |                                                   ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  143 |     await expect(page.locator('#username-error')).toHaveText('Username is required');
  144 |   });
  145 |   
  146 |   test('should validate email format', async ({ page }) => {
  147 |     // Fill username (required field)
  148 |     await page.getByLabel('Username').fill('test_user');
  149 |     
  150 |     // Fill invalid email
  151 |     await page.getByLabel('Email address').fill('invalid-email');
  152 |     
  153 |     // Submit form
  154 |     await page.getByRole('button', { name: 'Sign up with Metamask' }).click();
  155 |     
  156 |     // Verify email error message
  157 |     await expect(page.locator('#email-error')).toBeVisible();
  158 |     await expect(page.locator('#email-error')).toHaveText('Must be a valid email');
  159 |   });
  160 |   
  161 |   test('should submit successfully with valid data', async ({ page }) => {
  162 |     // Fill form with valid data
  163 |     await page.getByLabel('Username').fill('test_user');
  164 |     await page.getByLabel('Email address').fill('test@example.com');
  165 |     await page.getByLabel('First name').fill('John');
  166 |     await page.getByLabel('Last name').fill('Doe');
  167 |     
  168 |     // Submit form
  169 |     await page.getByRole('button', { name: 'Sign up with Metamask' }).click();
  170 |     
  171 |     // Verify button changes
  172 |     await expect(page.getByRole('button', { name: 'Connecting...' })).toBeVisible();
  173 |     
  174 |     // Verify success message
  175 |     await expect(page.locator('#form-success')).toBeVisible();
  176 |     
  177 |     // Check that the success flag is set in the page context
  178 |     const successFlag = await page.evaluate(() => window.signupSuccess);
  179 |     expect(successFlag).toBe(true);
  180 |   });
  181 |
  182 |   test('should navigate to login page when clicking login link', async ({ page }) => {
  183 |     // Click login link
  184 |     await page.getByRole('link', { name: 'Login' }).click();
  185 |     
  186 |     // Verify we're on the login page
  187 |     await expect(page).toHaveTitle(/XBorg - Login/);
  188 |     
  189 |     // Check that the login page loaded flag is set
  190 |     const loginLoaded = await page.evaluate(() => window.loginPageLoaded);
  191 |     expect(loginLoaded).toBe(true);
  192 |   });
  193 | }); 
```