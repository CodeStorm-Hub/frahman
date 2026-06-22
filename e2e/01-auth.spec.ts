/**
 * Auth suite — login, logout, protected-route redirect.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";
const USERNAME = process.env.AUTH_USERNAME ?? "admin";
const PASSWORD = process.env.E2E_PASSWORD ?? "frahman2024";

test.describe("Authentication", () => {
  test("redirects unauthenticated visitors to /login", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });

  test("shows error on wrong password", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.locator("#username").fill(USERNAME);
    await page.locator("#password").fill("wrongpassword");
    await page.locator("button[type='submit']").click();
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs in with correct credentials", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.locator("#username").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("button[type='submit']").click();
    // Wait for navigation away from /login (next-auth may go through callback URL first)
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25_000 });
    // Dashboard landmark or brand text should be present
    await expect(page.getByText(/frahman/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("protected routes redirect to /login after logout", async ({ page }) => {
    // Login
    await page.goto(`${BASE}/login`);
    await page.locator("#username").fill(USERNAME);
    await page.locator("#password").fill(PASSWORD);
    await page.locator("button[type='submit']").click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 25_000 });

    // Sign out
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL((url) => url.pathname.startsWith("/login"), { timeout: 10_000 });

    // Attempt to access dashboard directly
    await page.goto(`${BASE}/retailers`);
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });
});
