# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-dashboard.spec.ts >> Dashboard >> revenue chart is visible
- Location: e2e\02-dashboard.spec.ts:15:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('svg.recharts-surface').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('svg.recharts-surface').first()

```

```yaml
- text: F
- heading "Frahman & Brothers" [level=1]
- paragraph: Operations management system
- text: Username
- textbox "Username":
  - /placeholder: admin
- text: Password
- textbox "Password":
  - /placeholder: ••••••••
- button "Sign in"
- paragraph: Pirojpur, Bangladesh · v1.0
- alert
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
  12 |     await expect(cards).toHaveCount(4, { timeout: 10_000 });
  13 |   });
  14 | 
  15 |   test("revenue chart is visible", async ({ page }) => {
  16 |     await page.goto("http://localhost:3000/");
  17 |     // Recharts renders an SVG
> 18 |     await expect(page.locator("svg.recharts-surface").first()).toBeVisible({ timeout: 10_000 });
     |                                                                ^ Error: expect(locator).toBeVisible() failed
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