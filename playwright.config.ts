import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:5175",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  reporter: "list",
});
