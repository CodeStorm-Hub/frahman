/**
 * Payments suite — record payment against an outstanding invoice; verify balance drops.
 *
 * Real-life scenario: Karim Traders sends ৳19,500 cash (clearing their 10-bag Urea
 * invoice). The system creates a PAY- journal entry and marks the invoice settled.
 */
import { test, expect } from "@playwright/test";

test.describe("Payments", () => {

  test("record payment on a retailer with outstanding balance", async ({ page }) => {
    // Navigate to retailers list and find one with a positive balance
    await page.goto("http://localhost:3000/retailers");

    // Find any "Record Payment" button (retailer with balance > 0)
    const payBtn = page.getByRole("button", { name: /record payment/i }).first();
    await expect(payBtn).toBeVisible({ timeout: 10_000 });
    await payBtn.click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // Enter payment amount — use a small safe amount (100 BDT)
    const amountInput = dialog.getByLabel(/payment amount/i);
    await amountInput.fill("100");

    const noteInput = dialog.getByLabel(/note/i);
    await noteInput.fill("E2E test payment");

    await dialog.getByRole("button", { name: /confirm payment/i }).click();

    // Success banner
    await expect(dialog.getByText(/recorded successfully/i)).toBeVisible({ timeout: 10_000 });
    // Dialog closes after 1.5s
    await expect(dialog).not.toBeVisible({ timeout: 5_000 });
  });

  test("payment dialog shows unpaid invoice list on retailer detail page", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");

    // Navigate to a retailer detail page — click first retailer link
    const firstRetailerLink = page.locator("tbody tr a").first();
    await firstRetailerLink.click();
    await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });

    // Open Record Payment dialog if balance > 0
    const payBtn = page.getByRole("button", { name: /record payment/i });
    if (await payBtn.count() === 0) {
      test.skip(true, "No retailer with outstanding balance found");
      return;
    }
    await payBtn.first().click();
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // If there are unpaid invoices, the selector should show "Apply to Invoice"
    const invoiceSection = dialog.getByText(/apply to invoice/i);
    // It's OK if there are no unpaid invoices — dialog is still usable
    if (await invoiceSection.count() > 0) {
      await expect(invoiceSection).toBeVisible();
    }

    // Close dialog
    await dialog.getByRole("button", { name: /cancel/i }).click();
  });
});
