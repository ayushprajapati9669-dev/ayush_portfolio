const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500));

  // Scroll down so below-the-fold component mounts
  await page.evaluate(() => {
    window.scrollTo(0, 800);
  });
  await new Promise((r) => setTimeout(r, 1500));

  const el = await page.$('.zero-to-one-journey-card');
  if (el) {
    await el.screenshot({ path: 'tests/screenshot_real_journey_card.png' });
    console.log('Saved tests/screenshot_real_journey_card.png');
  } else {
    console.log('Could not find .zero-to-one-journey-card');
  }

  // Also take screenshot of skills page
  await page.goto('http://localhost:5174/skills', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: 'tests/screenshot_real_skills_page.png', fullPage: false });
  console.log('Saved tests/screenshot_real_skills_page.png');

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
