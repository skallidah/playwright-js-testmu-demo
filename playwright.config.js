// playwright.config.js
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',       // Where your test scripts are
  timeout: 60000,
  retries: 0,
  use: {
    headless: true,         // Do not show browsers for demo
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },
  workers: 4,               // run 4 tests in parallel locally
};

module.exports = config;
