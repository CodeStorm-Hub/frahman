# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 10-retailer-statement.spec.ts >> Retailer statement >> statement shows Frahman & Brothers letterhead
- Location: e2e\10-retailer-statement.spec.ts:38:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('tbody tr a').first()

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
      - button "Sign in" [ref=e15]
    - paragraph [ref=e16]: Pirojpur, Bangladesh · v1.0
  - button "Open Next.js Dev Tools" [ref=e22] [cursor=pointer]:
    - img [ref=e23]
  - alert [ref=e26]
```

# Test source

```ts
  1  | /**
  2  |  * Retailer statement suite — open the printable account statement for a retailer.
  3  |  */
  4  | import { test, expect } from "@playwright/test";
  5  | 
  6  | test.describe("Retailer statement", () => {
  7  | 
  8  |   test("statement page accessible from retailer detail", async ({ page }) => {
  9  |     await page.goto("http://localhost:3000/retailers");
  10 | 
  11 |     // Navigate to first retailer
  12 |     const firstLink = page.locator("tbody tr a").first();
  13 |     await firstLink.click();
  14 |     await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });
  15 | 
  16 |     // Click Statement button
  17 |     const statementBtn = page.getByRole("link", { name: /statement/i });
  18 |     await expect(statementBtn).toBeVisible({ timeout: 5_000 });
  19 |     await statementBtn.click();
  20 | 
  21 |     await page.waitForURL(/\/retailers\/[^/]+\/statement$/, { timeout: 10_000 });
  22 |     await expect(page.getByText(/account statement/i)).toBeVisible({ timeout: 8_000 });
  23 |   });
  24 | 
  25 |   test("statement page shows print button", async ({ page }) => {
  26 |     await page.goto("http://localhost:3000/retailers");
  27 |     const firstLink = page.locator("tbody tr a").first();
  28 |     await firstLink.click();
  29 |     await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });
  30 | 
  31 |     const statementBtn = page.getByRole("link", { name: /statement/i });
  32 |     await statementBtn.click();
  33 |     await page.waitForURL(/\/statement$/, { timeout: 10_000 });
  34 | 
  35 |     await expect(page.getByRole("button", { name: /print/i })).toBeVisible({ timeout: 5_000 });
  36 |   });
  37 | 
  38 |   test("statement shows Frahman & Brothers letterhead", async ({ page }) => {
  39 |     await page.goto("http://localhost:3000/retailers");
  40 |     const firstLink = page.locator("tbody tr a").first();
> 41 |     await firstLink.click();
     |                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  42 |     await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });
  43 | 
  44 |     const statementBtn = page.getByRole("link", { name: /statement/i });
  45 |     await statementBtn.click();
  46 |     await page.waitForURL(/\/statement$/, { timeout: 10_000 });
  47 | 
  48 |     await expect(page.getByText(/frahman.*brothers/i)).toBeVisible({ timeout: 5_000 });
  49 |   });
  50 | });
  51 | 
```