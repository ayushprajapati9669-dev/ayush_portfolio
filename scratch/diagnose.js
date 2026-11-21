const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', m => console.log('LOG:', m.text()));
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));

  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const bento = await page.$('#bento-section');
  console.log('BENTO EXISTS:', !!bento);

  if (!bento) {
    const errorBoundary = await page.$('.mx-auto.text-center');
    console.log('Error boundary fallback active?', !!errorBoundary);
  }

  await browser.close();
})();
