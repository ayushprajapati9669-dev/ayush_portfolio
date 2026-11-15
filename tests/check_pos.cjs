const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle2' });

  console.log('Scrolling to 1400...');
  await page.evaluate(() => {
    if (window.__lenis) window.__lenis.scrollTo(1400, { immediate: true });
    else window.scrollTo(0, 1400);
  });

  await new Promise(r => setTimeout(r, 3000));

  const status = await page.evaluate(() => {
    return {
      scrollY: window.scrollY,
      hasWave: Boolean(document.querySelector('[aria-label="Interactive 3D Terrain Wave Displacement"]')),
      hasParticle: Boolean(document.querySelector('.particle-container')),
      lazyCount: document.querySelectorAll('.relative.w-full').length
    };
  });
  console.log('Final status:', status);

  await browser.close();
})();
