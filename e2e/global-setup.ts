/**
 * Global auth setup — runs once before all tests.
 *
 * Uses next-auth's REST API (CSRF → credentials POST) to obtain a valid
 * session cookie, then saves it to e2e/auth-state.json. All test files
 * that need auth load from this saved state instead of logging in via the
 * UI every time.
 *
 * This approach is:
 * - Faster (one API call vs. full page load + form interaction)
 * - Reliable (decoupled from UI rendering quirks)
 * - Still tests real next-auth session mechanics
 */
import { chromium, type FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = "http://localhost:3000";
const USERNAME = process.env.AUTH_USERNAME ?? "admin";
const PASSWORD = process.env.E2E_PASSWORD ?? "frahman2024";
const STATE_FILE = path.join(process.cwd(), "e2e", "auth-state.json");

export default async function globalSetup(_config: FullConfig) {
  // First, try the REST API path (reliable, fast)
  const cookieHeader = await getAuthCookieViaApi();

  if (cookieHeader) {
    // Parse Set-Cookie headers into Playwright's cookie format and save to file
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the app first so cookies are in scope
    await page.goto(`${BASE}/`);

    // Add auth cookies to the context
    const cookies = parseSetCookieHeaders(cookieHeader, BASE);
    if (cookies.length > 0) {
      await context.addCookies(cookies);
    }

    // Verify the session works by checking if we can access a protected page
    await page.goto(`${BASE}/retailers`);
    const isAuthenticated = !page.url().includes("/login");

    if (isAuthenticated) {
      await context.storageState({ path: STATE_FILE });
      console.log("[global-setup] Auth state saved via REST API.");
      await browser.close();
      return;
    }

    await browser.close();
    console.warn("[global-setup] REST API auth succeeded but session check failed. Falling back to UI.");
  }

  // Fallback: drive the UI login form
  console.log("[global-setup] Attempting UI login...");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE}/login`);
  await page.locator("#username").fill(USERNAME);
  await page.locator("#password").fill(PASSWORD);
  await page.locator("button[type='submit']").click();

  try {
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 });
    await context.storageState({ path: STATE_FILE });
    console.log("[global-setup] Auth state saved via UI login.");
  } catch {
    console.error("[global-setup] UI login timed out. Tests requiring auth will fail.");
    // Write empty state so tests at least load
    fs.writeFileSync(STATE_FILE, JSON.stringify({ cookies: [], origins: [] }));
  }

  await browser.close();
}

/** Authenticates via next-auth REST API and returns raw Set-Cookie string(s). */
async function getAuthCookieViaApi(): Promise<string[] | null> {
  try {
    // Step 1: Get CSRF token
    const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
    if (!csrfRes.ok) return null;
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
    const csrfCookies = csrfRes.headers.getSetCookie?.() ?? (csrfRes.headers.get("set-cookie") ? [csrfRes.headers.get("set-cookie")!] : []);

    // Step 2: POST credentials
    const signInRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(csrfCookies.length ? { Cookie: csrfCookies.join("; ") } : {}),
      },
      body: new URLSearchParams({
        username: USERNAME,
        password: PASSWORD,
        csrfToken,
        callbackUrl: BASE,
        redirect: "false",
      }).toString(),
      redirect: "manual",
    });

    const setCookies = signInRes.headers.getSetCookie?.() ??
      (signInRes.headers.get("set-cookie") ? [signInRes.headers.get("set-cookie")!] : []);

    if (setCookies.length === 0) return null;
    return [...csrfCookies, ...setCookies];
  } catch (err) {
    console.warn("[global-setup] REST API auth failed:", err);
    return null;
  }
}

/** Parses raw Set-Cookie header values into Playwright cookie objects. */
function parseSetCookieHeaders(
  headers: string[],
  baseUrl: string,
): Parameters<import("@playwright/test").BrowserContext["addCookies"]>[0] {
  const url = new URL(baseUrl);
  return headers.flatMap((header) => {
    const parts = header.split(";").map((s) => s.trim());
    const [nameValue, ...attrs] = parts;
    const eqIdx = nameValue.indexOf("=");
    if (eqIdx === -1) return [];
    const name = nameValue.slice(0, eqIdx);
    const value = nameValue.slice(eqIdx + 1);

    const attrMap = Object.fromEntries(
      attrs.map((a) => {
        const idx = a.indexOf("=");
        return idx === -1 ? [a.toLowerCase(), true] : [a.slice(0, idx).toLowerCase().trim(), a.slice(idx + 1).trim()];
      }),
    );

    return [{
      name,
      value,
      domain: (attrMap["domain"] as string | undefined) ?? url.hostname,
      path: (attrMap["path"] as string | undefined) ?? "/",
      httpOnly: "httponly" in attrMap,
      secure: "secure" in attrMap,
      sameSite: (attrMap["samesite"] as "Strict" | "Lax" | "None" | undefined) ?? "Lax",
    }];
  });
}
