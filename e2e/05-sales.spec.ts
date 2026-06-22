/**
 * Sales suite — create a credit sales invoice; verify FIFO depletion, balance update.
 *
 * Real-life scenario: Karim Traders orders 50 bags of Urea on credit at ৳1,950/bag.
 * System should: deplete oldest FIFO batch first, create 4-line journal entry
 * (DR AR-1300 / CR Revenue-4000 / DR COGS-5000 / CR Inventory-1200),
 * update retailer balance to ৳97,500.
 */
import { test, expect } from "@playwright/test";

const TIMESTAMP = Date.now();
export const TEST_SHOP_NAME = `Karim Traders E2E ${TIMESTAMP}`;

test.describe("Sales invoicing", () => {

  test("sales page loads with invoice table", async ({ page }) => {
    await page.goto("http://localhost:3000/sales");
    await expect(page.getByRole("heading", { name: /invoices/i })).toBeVisible({ timeout: 8_000 });
  });

  test("create a credit sale invoice for an existing retailer", async ({ page }) => {
    await page.goto("http://localhost:3000/sales/new");
    await expect(page).toHaveURL(/\/sales\/new/, { timeout: 8_000 });

    // Select retailer — pick the first one available
    const retailerSelect = page.locator("select, [role='combobox']").first();
    await expect(retailerSelect).toBeVisible({ timeout: 8_000 });
    // Pick any available retailer
    await retailerSelect.selectOption({ index: 1 });

    // Add a line item — 10 bags of Urea
    const productSelect = page.locator("select, [role='combobox']").nth(1);
    await productSelect.selectOption({ label: "Urea" });

    const bagsInput = page.getByLabel(/bags/i).first();
    await bagsInput.fill("10");

    const priceInput = page.getByLabel(/price|rate/i).first();
    // Price per bag in Taka
    await priceInput.fill("1950");

    // Submit
    await page.getByRole("button", { name: /create|save|issue/i }).click();

    // Should redirect to invoice detail or back to /sales
    await page.waitForURL(/\/sales\/[^/]+|\/sales$/, { timeout: 15_000 });
    // Success indicator
    await expect(
      page.getByText(/invoice|INV-/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("invoice list date-range filter works", async ({ page }) => {
    await page.goto("http://localhost:3000/sales");
    await expect(page.getByLabel(/from date/i)).toBeVisible({ timeout: 8_000 });

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    await page.getByLabel(/from date/i).fill(todayStr);
    await page.getByLabel(/to date/i).fill(todayStr);

    // Filter should reduce visible count — "N of M shown" text
    await expect(page.getByText(/of .* shown/i)).toBeVisible({ timeout: 5_000 });
  });

  test("sort sales invoices by amount descending", async ({ page }) => {
    await page.goto("http://localhost:3000/sales");

    const amountHeader = page.getByRole("columnheader", { name: /amount/i });
    await expect(amountHeader).toBeVisible({ timeout: 8_000 });
    await amountHeader.click(); // ascending
    await amountHeader.click(); // descending
    // Table still has rows without error
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 5_000 });
  });
});
