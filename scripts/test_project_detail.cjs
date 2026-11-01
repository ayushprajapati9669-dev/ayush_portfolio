const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5175/projects', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Find a "Read Case Study" link
  const link = await page.$('a[href*="/projects/"]');
  if (link) {
    const href = await page.evaluate(el => el.getAttribute('href'), link);
    console.log('Navigating to project link:', href);
    await page.goto(`http://localhost:5175${href}`, { waitUntil: 'networkidle2' });
  } else {
    console.log('Navigating to fallback project detail');
    await page.goto('http://localhost:5175/projects/proj-1', { waitUntil: 'networkidle2' });
  }

  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/project_detail_view.png' });
  console.log('Saved project_detail_view.png');

  await browser.close();
})();
