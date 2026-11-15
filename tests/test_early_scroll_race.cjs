const puppeteer = require('puppeteer');

const BASE_URL = 'http://127.0.0.1:4173';

async function testTiming(delayMs) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const client = await page.target().createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  
  if (delayMs > 0) {
    await new Promise(r => setTimeout(r, delayMs));
  }
  
  // Trigger touch/scroll
  await page.evaluate(() => {
    window.scrollTo({ top: 1200, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });

  // Wait 2.5 seconds for below-the-fold component to settle
  await new Promise(r => setTimeout(r, 2500));

  const state = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    const bento = Boolean(document.querySelector('.bento-section'));
    const wave = Boolean(document.querySelector('[aria-label="Interactive 3D Terrain Wave Displacement"]'));
    const particle = Boolean(document.querySelector('.particle-container'));
    return {
      scrollTriggerCount: st.length,
      stDetails: st.map(s => s.trigger ? (s.trigger.className || s.trigger.id || s.trigger.tagName) : 'unknown'),
      bentoMounted: bento,
      waveMounted: wave,
      particleMounted: particle,
      scrollY: window.scrollY
    };
  });

  await browser.close();
  return { delayMs, state, errors };
}

(async () => {
  console.log('=== TESTING EARLY SCROLL AT VARIOUS DELAYS (CPU THROTTLED 4X) ===\n');
  for (const ms of [0, 50, 100, 250, 500, 1000]) {
    const res = await testTiming(ms);
    console.log(`Delay ${ms}ms: ST count=${res.state.scrollTriggerCount}, bento=${res.state.bentoMounted}, wave=${res.state.waveMounted}, particle=${res.state.particleMounted}, errors=${res.errors.length}`);
    if (res.state.stDetails.length > 0) {
      console.log(`   Triggers: ${JSON.stringify(res.state.stDetails)}`);
    }
  }
})();
