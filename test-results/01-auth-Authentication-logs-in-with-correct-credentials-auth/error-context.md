# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-auth.spec.ts >> Authentication >> logs in with correct credentials
- Location: e2e\01-auth.spec.ts:25:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 25000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e6]: F
      - generic [ref=e7]:
        - heading "Frahman & Brothers" [level=1] [ref=e8]
        - paragraph [ref=e9]: Operations management system
    - generic [ref=e10]:
      - generic [ref=e11]:
        - text: Username
        - textbox "Username" [ref=e12]:
          - /placeholder: admin
      - generic [ref=e13]:
        - text: Password
        - textbox "Password" [ref=e14]:
          - /placeholder: ••••••••
      - paragraph [ref=e15]: Invalid username or password.
      - button "Sign in" [ref=e16]
    - paragraph [ref=e17]: Pirojpur, Bangladesh · v1.0
  - button "Open Next.js Dev Tools" [ref=e23] [cursor=pointer]:
    - img [ref=e24]
  - alert [ref=e27]
```

# Test source

```ts
  1  | /**
  2  |  * Auth suite — login, logout, protected-route redirect.
  3  |  */
  4  | import { test, expect } from "@playwright/test";
  5  | 
  6  | const BASE = "http://localhost:3000";
  7  | const USERNAME = process.env.AUTH_USERNAME ?? "admin";
  8  | const PASSWORD = process.env.E2E_PASSWORD ?? "frahman2024";
  9  | 
  10 | test.describe("Authentication", () => {
  11 |   test("redirects unauthenticated visitors to /login", async ({ page }) => {
  12 |     await page.goto(`${BASE}/`);
  13 |     await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  14 |   });
  15 | 
  16 |   test("shows error on wrong password", async ({ page }) => {
  17 |     await page.goto(`${BASE}/login`);
  18 |     await page.locator("#username").fill(USERNAME);
  19 |     await page.locator("#password").fill("wrongpassword");
  20 |     await page.locator("button[type='submit']").click();
  21 |     await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 8_000 });
  22 |     await expect(page).toHaveURL(/\/login/);
  23 |   });
  24 | 
  25 |   test("logs in with correct credentials", async ({ page }) => {
  26 |     await page.goto(`${BASE}/login`);
  27 |     await page.locator("#username").fill(USERNAME);
  28 |     await page.locator("#password").fill(PASSWORD);
  29 |     await page.locator("button[type='submit']").click();
  30 |     // Wait for navigation away from /login (next-auth may go through callback URL first)
> 31 |     await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25_000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 25000ms exceeded.
  32 |     // Dashboard landmark or brand text should be present
  33 |     await expect(page.getByText(/frahman/i).first()).toBeVisible({ timeout: 10_000 });
  34 |   });
  35 | 
  36 |   test("protected routes redirect to /login after logout", async ({ page }) => {
  37 |     // Login
  38 |     await page.goto(`${BASE}/login`);
  39 |     await page.locator("#username").fill(USERNAME);
  40 |     await page.locator("#password").fill(PASSWORD);
  41 |     await page.locator("button[type='submit']").click();
  42 |     await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25_000 });
  43 | 
  44 |     // Sign out
  45 |     await page.getByRole("button", { name: /sign out/i }).click();
  46 |     await page.waitForURL((url) => url.pathname.startsWith("/login"), { timeout: 10_000 });
  47 | 
  48 |     // Attempt to access dashboard directly
  49 |     await page.goto(`${BASE}/retailers`);
  50 |     await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  51 |   });
  52 | });
  53 | 
```