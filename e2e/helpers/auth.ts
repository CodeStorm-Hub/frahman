import { type Page } from "@playwright/test";

export const BASE = "http://localhost:3000";
export const USERNAME = process.env.AUTH_USERNAME ?? "admin";
export const PASSWORD = process.env.E2E_PASSWORD ?? "frahman2024";

/**
 * UI login — used only by 01-auth.spec.ts which tests the actual login form.
 * Other test files rely on storageState loaded from e2e/auth-state.json.
 */
export async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.locator("#username").fill(USERNAME);
  await page.locator("#password").fill(PASSWORD);
  await page.locator("button[type='submit']").click();
  // Wait for the client-side router.push("/") triggered by useEffect on success
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL((url) => url.pathname.startsWith("/login"), { timeout: 10_000 });
}
