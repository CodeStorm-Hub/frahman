/**
 * CSV export suite — verify all export buttons trigger file downloads.
 */
import { test, expect } from "@playwright/test";

test.describe("CSV exports", () => {

  test("retailers page CSV download", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });

    const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
    await page.getByRole("button", { name: /export|csv/i }).first().click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/retailers.*\.csv$/i);
  });

  test("sales / invoices page CSV download", async ({ page }) => {
    await page.goto("http://localhost:3000/sales");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });

    const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
    await page.getByRole("button", { name: /export|csv/i }).first().click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/invoices.*\.csv$/i);
  });

  test("ledger page CSV download", async ({ page }) => {
    await page.goto("http://localhost:3000/ledgers");
    await expect(page.locator("tbody tr").first()).toBeVisible({ timeout: 10_000 });

    const downloadPromise = page.waitForEvent("download", { timeout: 10_000 });
    await page.getByRole("button", { name: /export|csv/i }).first().click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/ledger.*\.csv$/i);
  });
});
