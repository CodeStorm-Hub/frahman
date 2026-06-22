/**
 * Retailers suite — add a retailer, view their detail page, verify credit utilization.
 *
 * Real-life scenario: A new shop owner "Karim Traders" in Mathbaria wants to buy
 * on credit. The owner creates a retailer account with a credit limit of ৳1,00,000.
 */
import { test, expect } from "@playwright/test";

const TIMESTAMP = Date.now();
export const TEST_SHOP_NAME = `Karim Traders E2E ${TIMESTAMP}`;
const PROPRIETOR_NAME = "Karim Hossain";
const PHONE = `017${String(TIMESTAMP).slice(-8)}`;
const CREDIT_LIMIT = "100000";

test.describe("Retailers", () => {

  test("retailers page loads with table", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");
    await expect(page.getByRole("heading", { name: /retailers/i })).toBeVisible({ timeout: 8_000 });
    // Table header row
    await expect(page.getByRole("columnheader", { name: /shop/i })).toBeVisible();
  });

  test("add a new retailer", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");

    const addBtn = page.getByRole("button", { name: /add retailer|new retailer/i });
    await expect(addBtn).toBeVisible({ timeout: 8_000 });
    await addBtn.click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/shop name/i).fill(TEST_SHOP_NAME);
    await dialog.getByLabel(/proprietor/i).fill(PROPRIETOR_NAME);
    await dialog.getByLabel(/phone/i).fill(PHONE);

    const addressField = dialog.getByLabel(/address/i);
    if (await addressField.count() > 0) {
      await addressField.fill("Mathbaria, Pirojpur");
    }

    const creditField = dialog.getByLabel(/credit limit/i);
    await creditField.fill(CREDIT_LIMIT);

    await dialog.getByRole("button", { name: /save|add|create/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // New retailer appears in the table
    await expect(page.getByText(TEST_SHOP_NAME)).toBeVisible({ timeout: 8_000 });
  });

  test("retailer detail page shows zero balance for new retailer", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");

    // Navigate to the new retailer's detail page
    const link = page.getByRole("link").filter({ hasText: TEST_SHOP_NAME });
    await link.first().click();
    await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });

    // Outstanding balance should be ৳0
    await expect(page.getByText(/outstanding balance/i)).toBeVisible();
    await expect(page.getByText(/৳0|৳0\.00|0 BDT/)).toBeVisible({ timeout: 5_000 });
  });

  test("search filters retailer table", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");

    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible({ timeout: 8_000 });
    await searchInput.fill(TEST_SHOP_NAME);

    // Only our test retailer should remain visible; others hidden
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(1, { timeout: 5_000 });
    await expect(rows.getByText(TEST_SHOP_NAME)).toBeVisible();
  });

  test("retailer table columns are sortable", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");

    // Click the "Shop" column header to sort
    const shopHeader = page.getByRole("columnheader", { name: /shop/i });
    await expect(shopHeader).toBeVisible({ timeout: 8_000 });
    await shopHeader.click();
    // Second click reverses sort
    await shopHeader.click();
    // No crash — table still has rows
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 5_000 });
  });
});
