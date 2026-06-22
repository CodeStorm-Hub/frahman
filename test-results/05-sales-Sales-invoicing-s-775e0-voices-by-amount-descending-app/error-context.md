# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-sales.spec.ts >> Sales invoicing >> sort sales invoices by amount descending
- Location: e2e\05-sales.spec.ts:70:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('columnheader', { name: /amount/i })
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByRole('columnheader', { name: /amount/i })

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
  2  |  * Sales suite — create a credit sales invoice; verify FIFO depletion, balance update.
  3  |  *
  4  |  * Real-life scenario: Karim Traders orders 50 bags of Urea on credit at ৳1,950/bag.
  5  |  * System should: deplete oldest FIFO batch first, create 4-line journal entry
  6  |  * (DR AR-1300 / CR Revenue-4000 / DR COGS-5000 / CR Inventory-1200),
  7  |  * update retailer balance to ৳97,500.
  8  |  */
  9  | import { test, expect } from "@playwright/test";
  10 | 
  11 | const TIMESTAMP = Date.now();
  12 | export const TEST_SHOP_NAME = `Karim Traders E2E ${TIMESTAMP}`;
  13 | 
  14 | test.describe("Sales invoicing", () => {
  15 | 
  16 |   test("sales page loads with invoice table", async ({ page }) => {
  17 |     await page.goto("http://localhost:3000/sales");
  18 |     await expect(page.getByRole("heading", { name: /invoices/i })).toBeVisible({ timeout: 8_000 });
  19 |   });
  20 | 
  21 |   test("create a credit sale invoice for an existing retailer", async ({ page }) => {
  22 |     await page.goto("http://localhost:3000/sales/new");
  23 |     await expect(page).toHaveURL(/\/sales\/new/, { timeout: 8_000 });
  24 | 
  25 |     // Select retailer — pick the first one available
  26 |     const retailerSelect = page.locator("select, [role='combobox']").first();
  27 |     await expect(retailerSelect).toBeVisible({ timeout: 8_000 });
  28 |     // Pick any available retailer
  29 |     await retailerSelect.selectOption({ index: 1 });
  30 | 
  31 |     // Add a line item — 10 bags of Urea
  32 |     const productSelect = page.locator("select, [role='combobox']").nth(1);
  33 |     await productSelect.selectOption({ label: "Urea" });
  34 | 
  35 |     const bagsInput = page.getByLabel(/bags/i).first();
  36 |     await bagsInput.fill("10");
  37 | 
  38 |     const priceInput = page.getByLabel(/price|rate/i).first();
  39 |     // Price per bag in Taka
  40 |     await priceInput.fill("1950");
  41 | 
  42 |     // Submit
  43 |     await page.getByRole("button", { name: /create|save|issue/i }).click();
  44 | 
  45 |     // Should redirect to invoice detail or back to /sales
  46 |     await page.waitForURL(/\/sales\/[^/]+|\/sales$/, { timeout: 15_000 });
  47 |     // Success indicator
  48 |     await expect(
  49 |       page.getByText(/invoice|INV-/i).first(),
  50 |     ).toBeVisible({ timeout: 8_000 });
  51 |   });
  52 | 
  53 |   test("invoice list date-range filter works", async ({ page }) => {
  54 |     await page.goto("http://localhost:3000/sales");
  55 |     await expect(page.getByLabel(/from date/i)).toBeVisible({ timeout: 8_000 });
  56 | 
  57 |     const today = new Date();
  58 |     const yyyy = today.getFullYear();
  59 |     const mm = String(today.getMonth() + 1).padStart(2, "0");
  60 |     const dd = String(today.getDate()).padStart(2, "0");
  61 |     const todayStr = `${yyyy}-${mm}-${dd}`;
  62 | 
  63 |     await page.getByLabel(/from date/i).fill(todayStr);
  64 |     await page.getByLabel(/to date/i).fill(todayStr);
  65 | 
  66 |     // Filter should reduce visible count — "N of M shown" text
  67 |     await expect(page.getByText(/of .* shown/i)).toBeVisible({ timeout: 5_000 });
  68 |   });
  69 | 
  70 |   test("sort sales invoices by amount descending", async ({ page }) => {
  71 |     await page.goto("http://localhost:3000/sales");
  72 | 
  73 |     const amountHeader = page.getByRole("columnheader", { name: /amount/i });
> 74 |     await expect(amountHeader).toBeVisible({ timeout: 8_000 });
     |                                ^ Error: expect(locator).toBeVisible() failed
  75 |     await amountHeader.click(); // ascending
  76 |     await amountHeader.click(); // descending
  77 |     // Table still has rows without error
  78 |     await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 5_000 });
  79 |   });
  80 | });
  81 | 
```