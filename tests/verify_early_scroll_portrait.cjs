const puppeteer = require('puppeteer');

(async () => {
  console.log('=== TESTING PHASE 2 PENDING EDGE CASE: SCROLL WITHIN FIRST 50MS ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  // Track start of navigation
  console.log('1. Navigating to homepage...');
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });

  // Wait 150ms for initial layout to settle, then trigger rapid scroll
  console.log('2. Triggering early scroll at ~150ms during bootstrap...');
  await new Promise(r => setTimeout(r, 150));
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(300, { immediate: true });
    } else {
      window.scrollTo(0, 300);
    }
  });

  // Wait 1.5 seconds for sampling batches to progress
  await new Promise(r => setTimeout(r, 1500));

  // Inspect portrait particle canvas state
  const state = await page.evaluate(() => {
    const canvas = document.querySelector('.hero-photo-container canvas');
    const img = document.querySelector('.hero-photo-img');
    return {
      hasCanvas: Boolean(canvas),
      canvasWidth: canvas?.width,
      canvasHeight: canvas?.height,
      imgLoaded: img?.complete,
      imgNaturalWidth: img?.naturalWidth,
      scrollY: window.scrollY
    };
  });

  console.log('Portrait state after early scroll test:', state);
  console.log('Console errors encountered:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log('  !', e));
  }

  await browser.close();
  console.log('\n=== EDGE CASE TEST COMPLETE ===');
})();
