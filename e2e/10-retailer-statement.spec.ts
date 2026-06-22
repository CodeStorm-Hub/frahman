/**
 * Retailer statement suite — open the printable account statement for a retailer.
 */
import { test, expect } from "@playwright/test";

test.describe("Retailer statement", () => {

  test("statement page accessible from retailer detail", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");

    // Navigate to first retailer
    const firstLink = page.locator("tbody tr a").first();
    await firstLink.click();
    await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });

    // Click Statement button
    const statementBtn = page.getByRole("link", { name: /statement/i });
    await expect(statementBtn).toBeVisible({ timeout: 5_000 });
    await statementBtn.click();

    await page.waitForURL(/\/retailers\/[^/]+\/statement$/, { timeout: 10_000 });
    await expect(page.getByText(/account statement/i)).toBeVisible({ timeout: 8_000 });
  });

  test("statement page shows print button", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");
    const firstLink = page.locator("tbody tr a").first();
    await firstLink.click();
    await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });

    const statementBtn = page.getByRole("link", { name: /statement/i });
    await statementBtn.click();
    await page.waitForURL(/\/statement$/, { timeout: 10_000 });

    await expect(page.getByRole("button", { name: /print/i })).toBeVisible({ timeout: 5_000 });
  });

  test("statement shows Frahman & Brothers letterhead", async ({ page }) => {
    await page.goto("http://localhost:3000/retailers");
    const firstLink = page.locator("tbody tr a").first();
    await firstLink.click();
    await page.waitForURL(/\/retailers\/[^/]+$/, { timeout: 10_000 });

    const statementBtn = page.getByRole("link", { name: /statement/i });
    await statementBtn.click();
    await page.waitForURL(/\/statement$/, { timeout: 10_000 });

    await expect(page.getByText(/frahman.*brothers/i)).toBeVisible({ timeout: 5_000 });
  });
});
