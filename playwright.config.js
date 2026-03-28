/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  timeout: 30000,
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 3000',
    port: 3000,
    reuseExistingServer: true,
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    viewport: { width: 1440, height: 1200 },
  },
}

module.exports = config
