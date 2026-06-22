# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 06-payments.spec.ts >> Payments >> payment dialog shows unpaid invoice list on retailer detail page
- Location: e2e\06-payments.spec.ts:38:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('tbody tr a').first()
    - waiting for" http://localhost:3000/login" navigation to finish...
    - navigated to "http://localhost:3000/login"

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
  2  |  * Payments suite — record payment against an outstanding invoice; verify balance drops.
  3  |  *
  4  |  * Real-life scenario: Karim Traders sends ৳19,500 cash (clearing their 10-bag Urea
  5  |  * invoice). The system creates a PAY- journal entry and marks the invoice settled.
  6  |  */
  7  | import { test, expect } from "@playwright/test";
  8  | 
  9  | test.describe("Payments", () => {
  10 | 
  11 |   test("record payment on a retailer with outstanding balance", async ({ page }) => {
  12 |     // Navigate to retailers list and find one with a positive balance
  13 |     await page.goto("http://localhost:3000/retailers");
  14 | 
  15 |     // Find any "Record Payment" button (retailer with balance > 0)
  16 |     const payBtn = page.getByRole("button", { name: /record payment/i }).first();
  17 |     await expect(payBtn).toBeVisible({ timeout: 10_000 });
  18 |     await payBtn.click();
  19 | 
  20 |     const dialog = page.locator("[role='dialog']");
  21 |     await expect(dialog).toBeVisible();
  22 | 
  23 |     // Enter payment amount — use a small safe amount (100 BDT)
  24 |     const amountInput = dialog.getByLabel(/payment amount/i);
  25 |     await amountInput.fill("100");
  26 | 
  27 |     const noteInput = dialog.getByLabel(/note/i);
  28 |     await noteInput.fill("E2E test payment");
  29 | 
  30 |     await dialog.getByRole("button", { name: /confirm payment/i }).click();
  31 | 
  32 |     // Success banner
  33 |     await expect(dialog.getByText(/recorded successfully/i)).toBeVisible({ timeout: 10_000 });
  34 |     // Dialog closes after 1.5s
  35 |     await expect(dialog).not.toBeVisible({ timeout: 5_000 });
  36 |   });
  37 | 
  38 |   test("payment dialog shows unpaid invoice list on retailer detail page", async ({ page }) => {
  39 |     await page.goto("http://localhost:3000/retailers");
  40 | 
  41 |     // Navigate to a retailer detail page — click first retailer link
  42 |     const firstRetailerLink = page.locator("tbody tr a").first();
> 43 |     await firstRetailerLink.click();
     |                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  44 |     await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });
  45 | 
  46 |     // Open Record Payment dialog if balance > 0
  47 |     const payBtn = page.getByRole("button", { name: /record payment/i });
  48 |     if (await payBtn.count() === 0) {
  49 |       test.skip(true, "No retailer with outstanding balance found");
  50 |       return;
  51 |     }
  52 |     await payBtn.first().click();
  53 |     const dialog = page.locator("[role='dialog']");
  54 |     await expect(dialog).toBeVisible();
  55 | 
  56 |     // If there are unpaid invoices, the selector should show "Apply to Invoice"
  57 |     const invoiceSection = dialog.getByText(/apply to invoice/i);
  58 |     // It's OK if there are no unpaid invoices — dialog is still usable
  59 |     if (await invoiceSection.count() > 0) {
  60 |       await expect(invoiceSection).toBeVisible();
  61 |     }
  62 | 
  63 |     // Close dialog
  64 |     await dialog.getByRole("button", { name: /cancel/i }).click();
  65 |   });
  66 | });
  67 | 
```