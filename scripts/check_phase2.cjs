const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(1400, { immediate: true });
    } else {
      window.scrollTo(0, 1400);
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  const res = await page.evaluate(() => {
    return {
      scrollY: window.scrollY,
      hasWave: Boolean(document.querySelector('[aria-label="Interactive 3D Terrain Wave Displacement"]')),
      hasParticle: Boolean(document.querySelector('.particle-container')),
      hasLazyCanvas: document.querySelectorAll('canvas').length
    };
  });
  console.log('phase2_audit exact check:', res);
  await browser.close();
})();

