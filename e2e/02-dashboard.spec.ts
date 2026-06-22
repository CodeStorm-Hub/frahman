/**
 * Dashboard suite — KPI cards, charts, alerts banner render correctly.
 */
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {

  test("renders KPI cards", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    // Four KPI cards present on the dashboard
    const cards = page.locator("[data-slot='card']");
    await expect(cards).toHaveCount(4, { timeout: 10_000 });
  });

  test("revenue chart is visible", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    // Recharts renders an SVG
    await expect(page.locator("svg.recharts-surface").first()).toBeVisible({ timeout: 10_000 });
  });

  test("sidebar navigation links are all present", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    const nav = page.locator("nav");
    await expect(nav.getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /procurement/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /retailers/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /sales/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /ledger/i })).toBeVisible();
  });
});
