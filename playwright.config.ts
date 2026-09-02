import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://127.0.0.1:4321/claude-certification-study-kit/", trace: "retain-on-failure" },
  webServer: { command: "node scripts/serve-dist.mjs", url: "http://127.0.0.1:4321/claude-certification-study-kit/", reuseExistingServer: true },
  projects: [{ name: "chromium", use: { browserName: "chromium", launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } } }],
});
