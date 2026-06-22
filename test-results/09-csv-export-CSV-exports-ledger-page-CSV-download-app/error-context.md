# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-csv-export.spec.ts >> CSV exports >> ledger page CSV download
- Location: e2e\09-csv-export.spec.ts:30:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('tbody tr').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('tbody tr').first()

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
  2  |  * CSV export suite — verify all export buttons trigger file downloads.
  3  |  */
  4  | import { test, expect } from "@playwright/test";
  5  | 
  6  | test.describe("CSV exports", () => {
  7  | 
  8  |   test("retailers page CSV download", async ({ page }) => {
  9  |     await page.goto("http://localhost:3000/retailers");
  10 |     await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });
  11 | 
  12 |     const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
  13 |     await page.getByRole("button", { name: /export|csv/i }).first().click();
  14 |     const download = await downloadPromise;
  15 | 
  16 |     expect(download.suggestedFilename()).toMatch(/retailers.*\.csv$/i);
  17 |   });
  18 | 
  19 |   test("sales / invoices page CSV download", async ({ page }) => {
  20 |     await page.goto("http://localhost:3000/sales");
  21 |     await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });
  22 | 
  23 |     const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
  24 |     await page.getByRole("button", { name: /export|csv/i }).first().click();
  25 |     const download = await downloadPromise;
  26 | 
  27 |     expect(download.suggestedFilename()).toMatch(/invoices.*\.csv$/i);
  28 |   });
  29 | 
  30 |   test("ledger page CSV download", async ({ page }) => {
  31 |     await page.goto("http://localhost:3000/ledgers");
> 32 |     await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  33 | 
  34 |     const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
  35 |     await page.getByRole("button", { name: /export|csv/i }).first().click();
  36 |     const download = await downloadPromise;
  37 | 
  38 |     expect(download.suggestedFilename()).toMatch(/ledger.*\.csv$/i);
  39 |   });
  40 | });
  41 | 
```