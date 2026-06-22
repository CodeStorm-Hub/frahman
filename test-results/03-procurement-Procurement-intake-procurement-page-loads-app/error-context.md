# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-procurement.spec.ts >> Procurement intake >> procurement page loads
- Location: e2e\03-procurement.spec.ts:15:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /procurement/i })
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByRole('heading', { name: /procurement/i })

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
  2  |  * Procurement suite — intake a new batch; verify stock reflects the addition.
  3  |  *
  4  |  * Real-life scenario: The owner receives 200 bags of Urea from BADC on an
  5  |  * allotment. He records the intake and the system creates both an
  6  |  * InventoryBatch and a journal entry (DR Inventory / CR AP-BADC).
  7  |  */
  8  | import { test, expect } from "@playwright/test";
  9  | 
  10 | const TIMESTAMP = Date.now();
  11 | const BATCH_NOTE = `E2E-Batch-${TIMESTAMP}`;
  12 | 
  13 | test.describe("Procurement intake", () => {
  14 | 
  15 |   test("procurement page loads", async ({ page }) => {
  16 |     await page.goto("http://localhost:3000/procurement");
> 17 |     await expect(page.getByRole("heading", { name: /procurement/i })).toBeVisible({ timeout: 8_000 });
     |                                                                       ^ Error: expect(locator).toBeVisible() failed
  18 |   });
  19 | 
  20 |   test("add inventory batch for Urea and see it reflected", async ({ page }) => {
  21 |     await page.goto("http://localhost:3000/procurement");
  22 | 
  23 |     // Open add-batch form / button
  24 |     const addBtn = page.getByRole("button", { name: /add batch|receive stock|intake/i });
  25 |     await expect(addBtn).toBeVisible({ timeout: 8_000 });
  26 |     await addBtn.click();
  27 | 
  28 |     // Fill the form — product selector, bags count, cost per bag, note
  29 |     const dialog = page.locator("[role='dialog']");
  30 |     await expect(dialog).toBeVisible();
  31 | 
  32 |     // Select product (Urea)
  33 |     const productSelect = dialog.locator("select, [role='combobox']").first();
  34 |     await productSelect.selectOption({ label: "Urea" });
  35 | 
  36 |     // Bags
  37 |     const bagsInput = dialog.getByLabel(/bags/i);
  38 |     await bagsInput.fill("200");
  39 | 
  40 |     // Cost per bag — 1800 BDT
  41 |     const costInput = dialog.getByLabel(/cost|price/i).first();
  42 |     await costInput.fill("1800");
  43 | 
  44 |     // Note field (used for batch identification in tests)
  45 |     const noteInput = dialog.getByLabel(/note|remarks|supplier|allotment/i);
  46 |     if (await noteInput.count() > 0) {
  47 |       await noteInput.fill(BATCH_NOTE);
  48 |     }
  49 | 
  50 |     await dialog.getByRole("button", { name: /save|add|confirm/i }).click();
  51 | 
  52 |     // Dialog closes; page revalidates
  53 |     await expect(dialog).not.toBeVisible({ timeout: 10_000 });
  54 | 
  55 |     // The batch should appear somewhere on the page (table row)
  56 |     await expect(page.getByText("200")).toBeVisible({ timeout: 8_000 });
  57 |   });
  58 | });
  59 | 
```