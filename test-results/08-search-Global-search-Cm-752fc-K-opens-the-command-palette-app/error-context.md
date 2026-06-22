# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-search.spec.ts >> Global search (Cmd+K palette) >> Cmd+K opens the command palette
- Location: e2e\08-search.spec.ts:11:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[cmdk-root], [role=\'dialog\']').filter({ has: locator('input[type=\'text\'], input[placeholder]') }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[cmdk-root], [role=\'dialog\']').filter({ has: locator('input[type=\'text\'], input[placeholder]') }).first()
    - waiting for" http://localhost:3000/login" navigation to finish...
    - navigated to "http://localhost:3000/login"

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
  2  |  * Global search suite — Cmd+K command palette finds retailers and invoices.
  3  |  *
  4  |  * Real-life scenario: Owner types a retailer name in the search and navigates
  5  |  * directly to their account page without clicking through the full list.
  6  |  */
  7  | import { test, expect } from "@playwright/test";
  8  | 
  9  | test.describe("Global search (Cmd+K palette)", () => {
  10 | 
  11 |   test("Cmd+K opens the command palette", async ({ page }) => {
  12 |     await page.goto("http://localhost:3000/");
  13 | 
  14 |     // Trigger via keyboard shortcut
  15 |     await page.keyboard.press("Meta+k");
  16 |     // Also try Ctrl+K (Windows)
  17 |     await page.keyboard.press("Control+k");
  18 | 
  19 |     const palette = page.locator("[cmdk-root], [role='dialog']").filter({
  20 |       has: page.locator("input[type='text'], input[placeholder]"),
  21 |     });
> 22 |     await expect(palette.first()).toBeVisible({ timeout: 5_000 });
     |                                   ^ Error: expect(locator).toBeVisible() failed
  23 |   });
  24 | 
  25 |   test("search palette filters and navigates to a retailer", async ({ page }) => {
  26 |     await page.goto("http://localhost:3000/");
  27 | 
  28 |     await page.keyboard.press("Control+k");
  29 |     const palette = page.locator("[cmdk-root], [role='dialog']").first();
  30 |     await expect(palette).toBeVisible({ timeout: 5_000 });
  31 | 
  32 |     // Type partial retailer name that should exist from seeded data
  33 |     const input = palette.locator("input").first();
  34 |     await input.fill("Karim");
  35 | 
  36 |     // Results appear
  37 |     const results = palette.locator("[cmdk-item], [role='option']");
  38 |     if (await results.count() > 0) {
  39 |       await results.first().click();
  40 |       // Should navigate somewhere
  41 |       await expect(page).not.toHaveURL("http://localhost:3000/", { timeout: 5_000 });
  42 |     } else {
  43 |       // No seeded data named "Karim" — just verify palette opened and responds
  44 |       await expect(input).toBeFocused();
  45 |     }
  46 |   });
  47 | 
  48 |   test("search palette closes on Escape", async ({ page }) => {
  49 |     await page.goto("http://localhost:3000/");
  50 |     await page.keyboard.press("Control+k");
  51 | 
  52 |     const palette = page.locator("[cmdk-root], [role='dialog']").first();
  53 |     await expect(palette).toBeVisible({ timeout: 5_000 });
  54 | 
  55 |     await page.keyboard.press("Escape");
  56 |     await expect(palette).not.toBeVisible({ timeout: 3_000 });
  57 |   });
  58 | 
  59 |   test("mobile search icon triggers palette", async ({ page }) => {
  60 |     // Simulate mobile viewport
  61 |     await page.setViewportSize({ width: 390, height: 844 });
  62 |     await page.goto("http://localhost:3000/");
  63 | 
  64 |     const searchIcon = page.locator("[aria-label='Search'], button:has(svg)").filter({
  65 |       hasText: /search/i,
  66 |     });
  67 |     if (await searchIcon.count() > 0) {
  68 |       await searchIcon.first().click();
  69 |       await expect(
  70 |         page.locator("[cmdk-root], [role='dialog']").first(),
  71 |       ).toBeVisible({ timeout: 5_000 });
  72 |     }
  73 |   });
  74 | });
  75 | 
```