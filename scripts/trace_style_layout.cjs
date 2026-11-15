const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 640, isMobile: true, hasTouch: true, devicePixelRatio: 2 });

  await page.tracing.start({ path: 'trace.json', screenshots: false });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2500));
  await page.tracing.stop();

  await browser.close();

  const traceData = JSON.parse(fs.readFileSync('trace.json', 'utf8'));
  const events = traceData.traceEvents || [];

  const styleEvents = [];
  const layoutEvents = [];

  for (const e of events) {
    if (e.name === 'UpdateLayoutTree' && e.dur > 5000) { // > 5ms
      styleEvents.push({
        durMs: (e.dur / 1000).toFixed(1),
        ts: (e.ts / 1000).toFixed(1),
        args: e.args
      });
    }
    if (e.name === 'Layout' && e.dur > 5000) { // > 5ms
      layoutEvents.push({
        durMs: (e.dur / 1000).toFixed(1),
        ts: (e.ts / 1000).toFixed(1),
        args: e.args
      });
    }
  }

  console.log(`UpdateLayoutTree (Recalc Style > 5ms): ${styleEvents.length} events`);
  console.log(JSON.stringify(styleEvents.slice(0, 10), null, 2));

  console.log(`\nLayout (> 5ms): ${layoutEvents.length} events`);
  console.log(JSON.stringify(layoutEvents.slice(0, 10), null, 2));
})();

