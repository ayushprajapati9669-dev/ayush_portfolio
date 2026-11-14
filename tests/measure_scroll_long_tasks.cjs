const puppeteer = require('puppeteer');

(async () => {
  console.log('=== MEASURING INTERACTION-TIME SCROLL LONG TASKS ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  // Wait for initial load to settle
  await new Promise(r => setTimeout(r, 3000));

  // Install PerformanceObserver for long tasks before interaction
  await page.evaluate(() => {
    window.__interactionLongTasks = [];
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__interactionLongTasks.push({
          duration: Math.round(entry.duration),
          startTime: Math.round(entry.startTime),
          name: entry.name
        });
      }
    });
    obs.observe({ entryTypes: ['longtask'] });
  });

  console.log('Interaction start: Scrolling into deferred Bento section (1400px)...');
  const scrollStart = Date.now();

  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(1400, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 1400, behavior: 'smooth' });
    }
  });

  // Wait 3.5 seconds for scroll, mount, and particle initialization
  await new Promise(r => setTimeout(r, 3500));

  const longTasks = await page.evaluate(() => window.__interactionLongTasks || []);
  const mounted = await page.evaluate(() => ({
    wave: Boolean(document.querySelector('[aria-label="Interactive 3D Terrain Wave Displacement"]')),
    particles: Boolean(document.querySelector('.particle-container')),
    canvasCount: document.querySelectorAll('canvas').length
  }));

  console.log('Mounted state on scroll:', mounted);
  console.log(`Interaction long tasks count (>= 50ms): ${longTasks.length}`);
  if (longTasks.length > 0) {
    longTasks.forEach((t, i) => console.log(`  Task ${i+1}: ${t.duration}ms (at ${t.startTime}ms)`));
  } else {
    console.log('  SUCCESS: Zero long tasks (>50ms) created during scroll & deferred mount!');
  }

  await browser.close();
  console.log('\n=== INTERACTION TEST COMPLETE ===');
})();

