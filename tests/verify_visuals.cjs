const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Check Home page 0 to 1 Journey
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  const journeyCard = await page.$('.zero-journey-scrollbar');
  if (journeyCard) {
    const section = await page.evaluateHandle((el) => {
      let cur = el;
      while (cur && !cur.innerText.includes('The 0 to 1 Journey')) {
        cur = cur.parentElement;
      }
      return cur || el.parentElement;
    }, journeyCard);

    if (section && section.asElement()) {
      await section.asElement().screenshot({ path: 'tests/verified_journey_noscrollbar.png' });
      console.log('Saved tests/verified_journey_noscrollbar.png');
    }
  }

  // 2. Check Skills page
  await page.goto('http://localhost:5174/skills', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: 'tests/verified_skills_clean.png', fullPage: false });
  console.log('Saved tests/verified_skills_clean.png');

  // Check scrollbar computed styles on .zero-journey-scrollbar
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  const scrollbarStyles = await page.evaluate(() => {
    const el = document.querySelector('.zero-journey-scrollbar');
    if (!el) return null;
    const computed = window.getComputedStyle(el);
    return {
      scrollbarWidth: computed.scrollbarWidth,
      overflowX: computed.overflowX,
      overflowY: computed.overflowY
    };
  });
  console.log('Computed zero-journey-scrollbar styles:', scrollbarStyles);

  await browser.close();
})().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
