// Screenshots of the page with emulated geolocation (Ivano-Frankivsk) for the lab report
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1100, height: 900 },
    geolocation: { latitude: 48.9226, longitude: 24.7111, accuracy: 25 },
    permissions: ['geolocation'], locale: 'uk-UA', timezoneId: 'Europe/Kyiv'
  });
  const page = await ctx.newPage();
  await page.goto('file://' + process.cwd() + '/myLoc.html');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'lr7_map.png', fullPage: true });
  await page.click('#goToDest');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'lr7_dest.png', fullPage: true });
  await browser.close();
})();
