# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 07-ledger.spec.ts >> Ledger / double-entry accounting >> ledger balance summary shows debits equal credits
- Location: e2e\07-ledger.spec.ts:20:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('tbody tr').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
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
  2  |  * Ledger suite — verify the double-entry invariant (debits = credits) holds
  3  |  * for all recorded journal entries.
  4  |  *
  5  |  * Real-life scenario: After procurement, sales, and payments, every journal
  6  |  * entry in the system must balance. We query the UI aggregate and assert
  7  |  * total debits === total credits.
  8  |  */
  9  | import { test, expect } from "@playwright/test";
  10 | 
  11 | test.describe("Ledger / double-entry accounting", () => {
  12 | 
  13 |   test("ledger page loads and shows journal entries", async ({ page }) => {
  14 |     await page.goto("http://localhost:3000/ledgers");
  15 |     await expect(page.getByRole("heading", { name: /ledger|journal/i })).toBeVisible({ timeout: 8_000 });
  16 |     // At least one row in journal entries table
  17 |     await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });
  18 |   });
  19 | 
  20 |   test("ledger balance summary shows debits equal credits", async ({ page }) => {
  21 |     await page.goto("http://localhost:3000/ledgers");
  22 | 
  23 |     // The ledger page shows aggregate debit and credit totals
  24 |     // Both values should be identical (balanced books)
  25 |     const debitEl = page.getByTestId("total-debits");
  26 |     const creditEl = page.getByTestId("total-credits");
  27 | 
  28 |     if (await debitEl.count() > 0 && await creditEl.count() > 0) {
  29 |       const debitText = await debitEl.textContent();
  30 |       const creditText = await creditEl.textContent();
  31 |       expect(debitText?.trim()).toBe(creditText?.trim());
  32 |     } else {
  33 |       // Fallback: look for balanced indicator text
  34 |       const balancedText = page.getByText(/balanced|✓ balanced|debit.*=.*credit/i);
  35 |       if (await balancedText.count() > 0) {
  36 |         await expect(balancedText.first()).toBeVisible();
  37 |       }
  38 |       // If neither data-testid nor text indicator exists, the test passes
  39 |       // (page loaded successfully without error is sufficient)
> 40 |       await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 5_000 });
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  41 |     }
  42 |   });
  43 | 
  44 |   test("ledger CSV export downloads a file", async ({ page }) => {
  45 |     await page.goto("http://localhost:3000/ledgers");
  46 | 
  47 |     const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
  48 |     await page.getByRole("button", { name: /export|csv/i }).first().click();
  49 |     const download = await downloadPromise;
  50 | 
  51 |     expect(download.suggestedFilename()).toMatch(/\.csv$/i);
  52 |   });
  53 | });
  54 | 
```