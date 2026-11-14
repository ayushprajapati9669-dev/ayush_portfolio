const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(1400, { immediate: true });
    } else {
      window.scrollTo(0, 1400);
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const waveBox = await page.evaluate(() => {
    const waveEl = document.querySelector('[aria-label*="Wave"], [aria-label*="wave"]');
    const bento = document.getElementById('bento-section');
    return {
      scrollY: window.scrollY,
      hasWaveEl: Boolean(waveEl),
      allCanvasCount: document.querySelectorAll('canvas').length
    };
  });
  console.log('Result at 800x600 scrollY 1400:', waveBox);
  await browser.close();
})();
