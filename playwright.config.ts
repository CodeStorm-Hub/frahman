import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/debug-*.spec.ts"],
  fullyParallel: false,          // serial — tests share DB state intentionally
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],

  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: "http://localhost:3000",
    // All tests except the auth suite load saved auth state
    storageState: "e2e/auth-state.json",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },
    {
      // Auth tests run without saved state (they test the actual login UI)
      name: "auth",
      testMatch: /01-auth\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: undefined,
      },
    },
    {
      // All other tests use the pre-authenticated state
      name: "app",
      testMatch: /0[2-9]-.*\.spec\.ts|1\d-.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/auth-state.json",
      },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
