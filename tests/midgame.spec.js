const { test, expect } = require('@playwright/test')

test('renders the mocked mid-game Bowser Balloon screen', async ({ page }) => {
  await page.goto('/mock/midgame', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    document.body.style.display = 'block'
    document
      .querySelectorAll('[data-next-hide-fouc]')
      .forEach((element) => element.remove())
  })

  await expect(page.locator('.previewPill')).toContainText('mocked mid-game state')
  await expect(page.locator('.gameTitle')).toContainText('Pick a lever. Hope Bowser misses.')
  await expect(page.locator('.turnBanner')).toContainText('it is your turn!')

  await page.screenshot({
    path: 'test-results/midgame-vibe.png',
    fullPage: true,
    scale: 'css',
  })
})
