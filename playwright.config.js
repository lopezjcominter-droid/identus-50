// Smoke test config (see docs/SMOKE_TEST.md)
module.exports = { testDir: 'tests', timeout: 90000, use: { headless: true, viewport: { width: 1400, height: 900 } },
  webServer: { command: 'python3 -m http.server 8765', port: 8765, reuseExistingServer: true } };
