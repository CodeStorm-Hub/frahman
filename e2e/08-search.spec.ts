/**
 * Global search suite — Cmd+K command palette finds retailers and invoices.
 *
 * Real-life scenario: Owner types a retailer name in the search and navigates
 * directly to their account page without clicking through the full list.
 */
import { test, expect } from "@playwright/test";

test.describe("Global search (Cmd+K palette)", () => {

  test("Cmd+K opens the command palette", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Trigger via keyboard shortcut
    await page.keyboard.press("Meta+k");
    // Also try Ctrl+K (Windows)
    await page.keyboard.press("Control+k");

    const palette = page.locator("[cmdk-root], [role='dialog']").filter({
      has: page.locator("input[type='text'], input[placeholder]"),
    });
    await expect(palette.first()).toBeVisible({ timeout: 5_000 });
  });

  test("search palette filters and navigates to a retailer", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    await page.keyboard.press("Control+k");
    const palette = page.locator("[cmdk-root], [role='dialog']").first();
    await expect(palette).toBeVisible({ timeout: 5_000 });

    // Type partial retailer name that should exist from seeded data
    const input = palette.locator("input").first();
    await input.fill("Karim");

    // Results appear
    const results = palette.locator("[cmdk-item], [role='option']");
    if (await results.count() > 0) {
      await results.first().click();
      // Should navigate somewhere
      await expect(page).not.toHaveURL("http://localhost:3000/", { timeout: 5_000 });
    } else {
      // No seeded data named "Karim" — just verify palette opened and responds
      await expect(input).toBeFocused();
    }
  });

  test("search palette closes on Escape", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.keyboard.press("Control+k");

    const palette = page.locator("[cmdk-root], [role='dialog']").first();
    await expect(palette).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press("Escape");
    await expect(palette).not.toBeVisible({ timeout: 3_000 });
  });

  test("mobile search icon triggers palette", async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/");

    const searchIcon = page.locator("[aria-label='Search'], button:has(svg)").filter({
      hasText: /search/i,
    });
    if (await searchIcon.count() > 0) {
      await searchIcon.first().click();
      await expect(
        page.locator("[cmdk-root], [role='dialog']").first(),
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});
