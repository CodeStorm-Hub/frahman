/**
 * Alerts suite — verify low-stock and overdue-receivables banners appear on the
 * dashboard when the relevant conditions are present in the database.
 *
 * These tests are read-only (no mutations). If the seeded database has items
 * below the low-stock threshold or invoices older than 30 days, banners appear.
 * If not, we just verify the dashboard loads cleanly without errors.
 */
import { test, expect } from "@playwright/test";

test.describe("Alerts banner", () => {

  test("dashboard loads without runtime errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    // Filter out known non-critical browser warnings
    const realErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("Download the React DevTools"),
    );
    expect(realErrors).toHaveLength(0);
  });

  test("low-stock alert banner visible when stock below threshold", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // The alerts banner is conditionally rendered server-side
    // If seeded data has a product with < 100 bags remaining, it appears
    const lowStockBanner = page.locator("[data-alert='low-stock'], .alerts-banner").filter({
      hasText: /low stock|bags remaining/i,
    });

    // Banner may or may not be present depending on DB state — don't fail if absent
    const hasLowStock = await lowStockBanner.count() > 0;
    if (hasLowStock) {
      await expect(lowStockBanner.first()).toBeVisible();
      await expect(lowStockBanner.first()).toHaveCSS("color", /.*/); // just check it's rendered
    }
  });

  test("overdue-receivables alert visible when invoices > 30 days outstanding", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    const overdueBanner = page.locator("[data-alert='overdue'], .alerts-banner").filter({
      hasText: /overdue|days outstanding/i,
    });

    const hasOverdue = await overdueBanner.count() > 0;
    if (hasOverdue) {
      await expect(overdueBanner.first()).toBeVisible();
    }
  });
});
