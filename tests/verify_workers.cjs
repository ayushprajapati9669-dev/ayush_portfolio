const puppeteer = require('puppeteer');

(async () => {
  console.log('=== VERIFYING WEB WORKERS INTEGRATION & PERFORMANCE ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const workerRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push('PAGE ERROR: ' + err.message);
  });
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('Worker') || url.includes('worker')) {
      workerRequests.push(url);
    }
  });

  // Test 1: Load page and scroll to trigger portrait sampling
  console.log('1. Loading homepage and scrolling to trigger Portrait Worker...');
  await page.setViewport({ width: 800, height: 900 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(160, { immediate: true });
    } else {
      window.scrollTo(0, 160);
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  const portraitResult = await page.evaluate(() => {
    const canvas = document.querySelector('.hero-photo-wrapper canvas');
    const ctx = canvas?.getContext('2d');
    let nonZero = 0;
    if (ctx && canvas && canvas.width > 0 && canvas.height > 0) {
      const idata = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < idata.length; i += 16) {
        if (idata[i] > 0) nonZero++;
      }
    }
    return {
      canvasW: canvas?.width,
      canvasH: canvas?.height,
      hasDrawnParticles: nonZero > 100,
      nonZeroSampledPixels: nonZero
    };
  });

  console.log('   Portrait Worker Execution Result:', portraitResult);

  // Test 2: Scroll into Bento section to trigger Cinematic Particle Card Worker
  console.log('2. Scrolling into Bento section to trigger Cinematic Particle Worker...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(1400, { immediate: true });
    } else {
      window.scrollTo(0, 1400);
    }
  });
  await new Promise(r => setTimeout(r, 2000));

  const cinematicResult = await page.evaluate(() => {
    const particleContainer = document.querySelector('.particle-container');
    const canvas = particleContainer?.querySelector('canvas');
    return {
      cardMounted: Boolean(particleContainer),
      hasCanvas: Boolean(canvas),
      canvasW: canvas?.clientWidth,
      canvasH: canvas?.clientHeight
    };
  });

  console.log('   Cinematic Particle Card Result:', cinematicResult);
  console.log('   Worker Network Requests captured:', workerRequests);

  // Test 3: Console Errors
  console.log('\n3. Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log('   [ERROR]', e));
  }

  const pass = portraitResult.hasDrawnParticles &&
               cinematicResult.hasCanvas &&
               consoleErrors.length === 0 &&
               workerRequests.length > 0;

  console.log(`\n=== WORKER VERIFICATION: ${pass ? 'ALL TESTS PASSED' : 'FAILED'} ===`);

  await browser.close();
  if (!pass) process.exit(1);
})();
