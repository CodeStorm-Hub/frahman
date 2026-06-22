# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-retailers.spec.ts >> Retailers >> search filters retailer table
- Location: e2e\04-retailers.spec.ts:66:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder(/search/i)
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByPlaceholder(/search/i)

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
  2  |  * Retailers suite — add a retailer, view their detail page, verify credit utilization.
  3  |  *
  4  |  * Real-life scenario: A new shop owner "Karim Traders" in Mathbaria wants to buy
  5  |  * on credit. The owner creates a retailer account with a credit limit of ৳1,00,000.
  6  |  */
  7  | import { test, expect } from "@playwright/test";
  8  | 
  9  | const TIMESTAMP = Date.now();
  10 | export const TEST_SHOP_NAME = `Karim Traders E2E ${TIMESTAMP}`;
  11 | const PROPRIETOR_NAME = "Karim Hossain";
  12 | const PHONE = `017${String(TIMESTAMP).slice(-8)}`;
  13 | const CREDIT_LIMIT = "100000";
  14 | 
  15 | test.describe("Retailers", () => {
  16 | 
  17 |   test("retailers page loads with table", async ({ page }) => {
  18 |     await page.goto("http://localhost:3000/retailers");
  19 |     await expect(page.getByRole("heading", { name: /retailers/i })).toBeVisible({ timeout: 8_000 });
  20 |     // Table header row
  21 |     await expect(page.getByRole("columnheader", { name: /shop/i })).toBeVisible();
  22 |   });
  23 | 
  24 |   test("add a new retailer", async ({ page }) => {
  25 |     await page.goto("http://localhost:3000/retailers");
  26 | 
  27 |     const addBtn = page.getByRole("button", { name: /add retailer|new retailer/i });
  28 |     await expect(addBtn).toBeVisible({ timeout: 8_000 });
  29 |     await addBtn.click();
  30 | 
  31 |     const dialog = page.locator("[role='dialog']");
  32 |     await expect(dialog).toBeVisible();
  33 | 
  34 |     await dialog.getByLabel(/shop name/i).fill(TEST_SHOP_NAME);
  35 |     await dialog.getByLabel(/proprietor/i).fill(PROPRIETOR_NAME);
  36 |     await dialog.getByLabel(/phone/i).fill(PHONE);
  37 | 
  38 |     const addressField = dialog.getByLabel(/address/i);
  39 |     if (await addressField.count() > 0) {
  40 |       await addressField.fill("Mathbaria, Pirojpur");
  41 |     }
  42 | 
  43 |     const creditField = dialog.getByLabel(/credit limit/i);
  44 |     await creditField.fill(CREDIT_LIMIT);
  45 | 
  46 |     await dialog.getByRole("button", { name: /save|add|create/i }).click();
  47 |     await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  48 | 
  49 |     // New retailer appears in the table
  50 |     await expect(page.getByText(TEST_SHOP_NAME)).toBeVisible({ timeout: 8_000 });
  51 |   });
  52 | 
  53 |   test("retailer detail page shows zero balance for new retailer", async ({ page }) => {
  54 |     await page.goto("http://localhost:3000/retailers");
  55 | 
  56 |     // Navigate to the new retailer's detail page
  57 |     const link = page.getByRole("link").filter({ hasText: TEST_SHOP_NAME });
  58 |     await link.first().click();
  59 |     await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });
  60 | 
  61 |     // Outstanding balance should be ৳0
  62 |     await expect(page.getByText(/outstanding balance/i)).toBeVisible();
  63 |     await expect(page.getByText(/৳0|৳0\.00|0 BDT/)).toBeVisible({ timeout: 5_000 });
  64 |   });
  65 | 
  66 |   test("search filters retailer table", async ({ page }) => {
  67 |     await page.goto("http://localhost:3000/retailers");
  68 | 
  69 |     const searchInput = page.getByPlaceholder(/search/i);
> 70 |     await expect(searchInput).toBeVisible({ timeout: 8_000 });
     |                               ^ Error: expect(locator).toBeVisible() failed
  71 |     await searchInput.fill(TEST_SHOP_NAME);
  72 | 
  73 |     // Only our test retailer should remain visible; others hidden
  74 |     const rows = page.locator("tbody tr");
  75 |     await expect(rows).toHaveCount(1, { timeout: 5_000 });
  76 |     await expect(rows.getByText(TEST_SHOP_NAME)).toBeVisible();
  77 |   });
  78 | 
  79 |   test("retailer table columns are sortable", async ({ page }) => {
  80 |     await page.goto("http://localhost:3000/retailers");
  81 | 
  82 |     // Click the "Shop" column header to sort
  83 |     const shopHeader = page.getByRole("columnheader", { name: /shop/i });
  84 |     await expect(shopHeader).toBeVisible({ timeout: 8_000 });
  85 |     await shopHeader.click();
  86 |     // Second click reverses sort
  87 |     await shopHeader.click();
  88 |     // No crash — table still has rows
  89 |     await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 5_000 });
  90 |   });
  91 | });
  92 | 
```