# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-dashboard.spec.ts >> Dashboard >> renders KPI cards
- Location: e2e\02-dashboard.spec.ts:8:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('[data-slot=\'card\']')
Expected: 4
Received: 0
Timeout:  10000ms

Call log:
  - Expect "toHaveCount" with timeout 10000ms
  - waiting for locator('[data-slot=\'card\']')
    23 × locator resolved to 0 elements
       - unexpected value "0"

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
  2  |  * Dashboard suite — KPI cards, charts, alerts banner render correctly.
  3  |  */
  4  | import { test, expect } from "@playwright/test";
  5  | 
  6  | test.describe("Dashboard", () => {
  7  | 
  8  |   test("renders KPI cards", async ({ page }) => {
  9  |     await page.goto("http://localhost:3000/");
  10 |     // Four KPI cards present on the dashboard
  11 |     const cards = page.locator("[data-slot='card']");
> 12 |     await expect(cards).toHaveCount(4, { timeout: 10_000 });
     |                         ^ Error: expect(locator).toHaveCount(expected) failed
  13 |   });
  14 | 
  15 |   test("revenue chart is visible", async ({ page }) => {
  16 |     await page.goto("http://localhost:3000/");
  17 |     // Recharts renders an SVG
  18 |     await expect(page.locator("svg.recharts-surface").first()).toBeVisible({ timeout: 10_000 });
  19 |   });
  20 | 
  21 |   test("sidebar navigation links are all present", async ({ page }) => {
  22 |     await page.goto("http://localhost:3000/");
  23 |     const nav = page.locator("nav");
  24 |     await expect(nav.getByRole("link", { name: /dashboard/i })).toBeVisible();
  25 |     await expect(nav.getByRole("link", { name: /procurement/i })).toBeVisible();
  26 |     await expect(nav.getByRole("link", { name: /retailers/i })).toBeVisible();
  27 |     await expect(nav.getByRole("link", { name: /sales/i })).toBeVisible();
  28 |     await expect(nav.getByRole("link", { name: /ledger/i })).toBeVisible();
  29 |   });
  30 | });
  31 | 
```