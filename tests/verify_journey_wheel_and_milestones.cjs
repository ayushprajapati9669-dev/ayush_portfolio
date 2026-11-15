const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/journey', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const entriesCount = await page.$eval('.about-card .font-mono', el => el.innerText).catch(() => 'not found');
  const timelineTitles = await page.$$eval('.timeline-title span:first-child', els => els.map(el => el.innerText.trim()));
  const spotlightTitle = await page.$eval('.content-title', el => el.innerText.trim()).catch(() => 'none');
  
  const timelineListStyle = await page.$eval('.timeline-list', el => {
    const cs = window.getComputedStyle(el);
    return {
      maxHeight: cs.maxHeight,
      overflowY: cs.overflowY,
      overscrollBehavior: cs.overscrollBehavior,
      scrollbarWidth: cs.scrollbarWidth
    };
  });

  console.log('Verified Entries Counter:', entriesCount);
  console.log('Spotlight Title:', spotlightTitle);
  console.log('Timeline Titles (' + timelineTitles.length + '):', JSON.stringify(timelineTitles));
  console.log('Timeline List Styles:', timelineListStyle);

  // Live mouse wheel test on timeline item
  const itemHandle = await page.$('.timeline-item');
  if (itemHandle) {
    await itemHandle.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    const box = await itemHandle.boundingBox();
    console.log('Timeline item bounding box inside viewport:', box);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel({ deltaY: 200 });
    await new Promise(r => setTimeout(r, 500));
    const scrollAfter = await page.evaluate(() => window.scrollY);
    console.log('Wheel on timeline item: scrollBefore =', scrollBefore, ', scrollAfter =', scrollAfter);
  }

  await page.screenshot({ path: 'C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/journey_public_verified.png', fullPage: true });
  console.log('Screenshot saved to journey_public_verified.png');
  await browser.close();
})();
