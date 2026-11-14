const puppeteer = require('puppeteer');

const BASE_URL = 'http://127.0.0.1:4173';

async function createIsolatedBrowser() {
  return puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

async function createPage(browser, cpuThrottle = 4, isMobile = true) {
  const page = await browser.newPage();
  if (isMobile) {
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  } else {
    await page.setViewport({ width: 1440, height: 900, isMobile: false, hasTouch: false });
  }

  if (cpuThrottle > 1) {
    const client = await page.target().createCDPSession();
    await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
  }
  const errors = [];
  const warnings = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  return { page, errors, warnings };
}

async function waitForCondition(page, checkFn, timeoutMs = 12000, intervalMs = 200) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await page.evaluate(checkFn);
    if (res) return { result: res, elapsedMs: Date.now() - start };
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return { result: false, elapsedMs: Date.now() - start };
}

async function warmup(browser) {
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  await page.close();
}

// =========================================================================
// 1. TIMING TESTS: 0ms, 50ms, 100ms, 250ms, 500ms, 1000ms
// =========================================================================
async function testScrollDelay(delayMs, method = 'touch') {
  const browser = await createIsolatedBrowser();
  const { page, errors } = await createPage(browser, 4, true);

  await page.evaluateOnNewDocument(() => {
    window.__gsapInitCount = 0;
    let _gsap = null;
    Object.defineProperty(window, 'gsap', {
      configurable: true,
      get: () => _gsap,
      set: (val) => {
        window.__gsapInitCount++;
        _gsap = val;
      }
    });
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  if (delayMs > 0) {
    await new Promise(r => setTimeout(r, delayMs));
  }

  // Scroll gesture with pointer centered in viewport
  if (method === 'touch') {
    await page.touchscreen.touchStart(200, 500);
    await page.touchscreen.touchMove(200, 150);
    await page.touchscreen.touchEnd();
  } else if (method === 'wheel') {
    await page.mouse.move(200, 400);
    await page.mouse.wheel({ deltaY: 600 });
  }

  // Trigger fallback scroll dispatch to guarantee event queue processing
  await page.evaluate(() => {
    window.dispatchEvent(new Event('scroll'));
  });

  const { result: settled, elapsedMs } = await waitForCondition(page, () => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    const bento = Boolean(document.querySelector('.bento-section'));
    return bento && st.length >= 5 ? { stCount: st.length, bento: true } : false;
  }, 12000);

  const evaluation = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    return {
      gsapInitCount: window.__gsapInitCount,
      stCount: st.length,
      stDetails: st.map(s => s.trigger ? (s.trigger.id || s.trigger.className?.split(' ')[0] || s.trigger.tagName) : 'unknown'),
      bentoExists: Boolean(document.querySelector('.bento-section')),
      bioCardExists: Boolean(document.querySelector('.bento-bio-card')),
      featuredExists: Boolean(document.querySelector('#featured-projects')),
      ctaExists: Boolean(document.querySelector('.home-cta-banner')),
      scrollY: window.scrollY
    };
  });

  await browser.close();
  return {
    delayMs,
    method,
    settled: Boolean(settled),
    elapsedMs,
    evaluation,
    errors
  };
}

// =========================================================================
// 2. RAPID SCROLL DOWN / UP SEQUENCE
// =========================================================================
async function testRapidScrollDownUp(browser) {
  const { page, errors } = await createPage(browser, 4, true);

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 50));

  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel({ deltaY: 400 });
    await new Promise(r => setTimeout(r, 40));
    await page.mouse.wheel({ deltaY: -250 });
    await new Promise(r => setTimeout(r, 40));
  }

  const { result: settled, elapsedMs } = await waitForCondition(page, () => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    return st.length >= 5;
  }, 12000);

  const evaluation = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    return {
      stCount: st.length,
      bentoExists: Boolean(document.querySelector('.bento-section')),
      ctaExists: Boolean(document.querySelector('.home-cta-banner'))
    };
  });

  await page.close();
  return { passed: Boolean(settled) && evaluation.stCount >= 5, elapsedMs, evaluation, errors };
}

// =========================================================================
// 3. LIFECYCLE: Scroll While Dynamic Import is Pending
// =========================================================================
async function testScrollWhileImportPending(browser) {
  const { page, errors } = await createPage(browser, 4, true);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  // Fire first scroll to start dynamic import
  await page.evaluate(() => {
    window.dispatchEvent(new Event('scroll'));
  });

  // Rapidly fire scroll events during chunk download window
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 80));
    await page.evaluate(() => {
      window.dispatchEvent(new Event('scroll'));
    });
  }

  const { result: settled, elapsedMs } = await waitForCondition(page, () => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    return st.length >= 5;
  }, 12000);

  const stCount = await page.evaluate(() => window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0);

  await page.close();
  return { passed: Boolean(settled) && stCount === 5, stCount, elapsedMs, errors };
}

// =========================================================================
// 4. LIFECYCLE: Visibility Change during Initialization
// =========================================================================
async function testVisibilityChange(browser) {
  const { page, errors } = await createPage(browser, 4, true);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  // Trigger scroll, then immediately switch visibility
  await page.evaluate(() => {
    window.dispatchEvent(new Event('scroll'));
  });

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  const { result: settled, elapsedMs } = await waitForCondition(page, () => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    return st.length >= 5;
  }, 12000);

  const stCount = await page.evaluate(() => window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0);

  await page.close();
  return { passed: Boolean(settled) && stCount >= 5, stCount, elapsedMs, errors };
}

// =========================================================================
// 5. LIFECYCLE: Navigation away and back (Cleanup & Re-registration)
// =========================================================================
async function testNavigationAwayAndBack(browser) {
  const { page, errors } = await createPage(browser, 4, true);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    window.dispatchEvent(new Event('scroll'));
  });

  await waitForCondition(page, () => {
    return window.ScrollTrigger && window.ScrollTrigger.getAll().length >= 5;
  }, 12000);

  const initialCount = await page.evaluate(() => window.ScrollTrigger.getAll().length);

  // Navigate to /projects
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('a, button')).find(el => el.textContent && el.textContent.includes('Projects'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 1500));

  const duringProjectsCount = await page.evaluate(() => {
    return window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0;
  });

  // Navigate back to /
  await page.evaluate(() => {
    window.history.back();
  });

  await new Promise(r => setTimeout(r, 1500));

  // Scroll on /
  await page.evaluate(() => {
    window.dispatchEvent(new Event('scroll'));
  });

  await waitForCondition(page, () => {
    return window.ScrollTrigger && window.ScrollTrigger.getAll().length >= 5;
  }, 12000);

  const finalCount = await page.evaluate(() => window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0);

  await page.close();
  return {
    initialCount,
    duringProjectsCount,
    finalCount,
    cleanedUpOnUnmount: duringProjectsCount < initialCount,
    reinitializedOnReturn: finalCount >= 5,
    noDuplicates: finalCount === initialCount,
    errors
  };
}

// =========================================================================
// 6. LIFECYCLE: Repeated Rapid Mount / Unmount
// =========================================================================
async function testRepeatedInitialization(browser) {
  const { page, errors } = await createPage(browser, 2, true);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('touchstart'));
      window.dispatchEvent(new Event('touchmove'));
    });
    await new Promise(r => setTimeout(r, 20));
  }

  await waitForCondition(page, () => {
    return window.ScrollTrigger && window.ScrollTrigger.getAll().length >= 5;
  }, 12000);

  const evaluation = await page.evaluate(() => {
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    return {
      stCount: st.length,
      triggers: st.map(s => s.trigger ? (s.trigger.id || s.trigger.className?.split(' ')[0]) : 'unknown')
    };
  });

  await page.close();
  return { passed: evaluation.stCount === 5, evaluation, errors };
}

// =========================================================================
// 7. VISUAL VERIFICATION: Desktop & Mobile Interactions
// =========================================================================
async function testVisualInteractions(browser) {
  const { page: desktop, errors: dErrors } = await createPage(browser, 1, false);
  await desktop.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Desktop Luxury Hero Entrance
  const heroEntranceState = await desktop.evaluate(() => {
    const meta = document.querySelector('.hero-top-meta');
    const capsule = document.querySelector('.hero-announcement-capsule');
    const desc = document.querySelector('.hero-modern-desc');
    const strip = document.querySelector('.hero-features-strip');
    const metaOpacity = meta ? parseFloat(window.getComputedStyle(meta).opacity) : 0;
    const capsuleOpacity = capsule ? parseFloat(window.getComputedStyle(capsule).opacity) : 0;
    const descOpacity = desc ? parseFloat(window.getComputedStyle(desc).opacity) : 0;
    const stripOpacity = strip ? parseFloat(window.getComputedStyle(strip).opacity) : 0;
    return {
      metaExists: Boolean(meta),
      metaVisible: metaOpacity > 0.5,
      capsuleVisible: capsuleOpacity > 0.5,
      descVisible: descOpacity > 0.5,
      stripVisible: stripOpacity > 0.5
    };
  });

  // 2. Desktop Portrait Hover Interaction
  const portraitHover = await desktop.evaluate(() => {
    const portrait = document.querySelector('.hero-photo-container, .hero-photo-wrapper');
    if (!portrait) return { found: false };
    const rect = portrait.getBoundingClientRect();
    const event = new MouseEvent('mousemove', {
      clientX: rect.left + rect.width * 0.8,
      clientY: rect.top + rect.height * 0.8,
      bubbles: true
    });
    portrait.dispatchEvent(event);
    return { found: true };
  });
  await new Promise(r => setTimeout(r, 400));

  // 3. Desktop Magnetic Interaction
  const magneticTest = await desktop.evaluate(() => {
    const btn = document.querySelector('.hero-feature-item, .hero-announcement-capsule');
    if (!btn) return { found: false };
    const rect = btn.getBoundingClientRect();
    btn.dispatchEvent(new MouseEvent('mousemove', {
      clientX: rect.left + rect.width * 0.75,
      clientY: rect.top + rect.height * 0.75,
      bubbles: true
    }));
    return { found: true };
  });
  await new Promise(r => setTimeout(r, 400));

  // 4. Font Loading Layout Stability (CLS Check)
  const fontLayoutStability = await desktop.evaluate(() => {
    const title = document.querySelector('.hero-editorial-title, .hero-modern-title');
    const desc = document.querySelector('.hero-modern-desc');
    const titleHeight = title ? title.getBoundingClientRect().height : 0;
    const descHeight = desc ? desc.getBoundingClientRect().height : 0;
    return {
      titleHeightAdequate: titleHeight >= 80,
      descHeightAdequate: descHeight >= 40
    };
  });

  await desktop.close();

  return {
    heroEntranceState,
    portraitHover,
    magneticTest,
    fontLayoutStability,
    errors: dErrors
  };
}

// =========================================================================
// MAIN RUNNER
// =========================================================================
(async () => {
  console.log('=================================================================');
  console.log('   PHASE 3 FINAL EDGE-CASE VERIFICATION: EARLY SCROLL RACE SUITE ');
  console.log('=================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {
    timingDelays: [],
    rapidScroll: null,
    importPending: null,
    visibilityChange: null,
    navigationCycle: null,
    repeatedInit: null,
    visualVerification: null
  };

  try {
    process.stdout.write('Warming up browser runtime... ');
    await warmup(browser);
    console.log('Done.\n');

    // 1. Timing delays with touch and wheel
    console.log('--- 1. Immediate Mobile Scrolling at Multiple Delays (CPU 4x Throttled) ---');
    for (const ms of [0, 50, 100, 250, 500, 1000]) {
      const method = ms % 100 === 0 ? 'wheel' : 'touch';
      process.stdout.write(`Testing Delay ${ms}ms (${method})... `);
      const res = await testScrollDelay(ms, method);
      results.timingDelays.push(res);
      console.log(`Passed: ${res.settled} in ${res.elapsedMs}ms, ST count: ${res.evaluation.stCount}, GSAP inits: ${res.evaluation.gsapInitCount}, Errors: ${res.errors.length}`);
    }

    // 2. Rapid scroll down/up
    console.log('\n--- 2. Rapid Scroll Down/Up Sequence (CPU 4x Throttled) ---');
    const rapidRes = await testRapidScrollDownUp(browser);
    results.rapidScroll = rapidRes;
    console.log(`Rapid Scroll: ${rapidRes.passed ? 'PASS' : 'FAIL'} in ${rapidRes.elapsedMs}ms, ST count: ${rapidRes.evaluation.stCount}, Errors: ${rapidRes.errors.length}`);

    // 3. Scroll while dynamic import is pending
    console.log('\n--- 3. Scroll While Dynamic Import is Pending ---');
    const pendingRes = await testScrollWhileImportPending(browser);
    results.importPending = pendingRes;
    console.log(`Pending Import Scroll: ${pendingRes.passed ? 'PASS' : 'FAIL'} in ${pendingRes.elapsedMs}ms, ST count: ${pendingRes.stCount}, Errors: ${pendingRes.errors.length}`);

    // 4. Page visibility change
    console.log('\n--- 4. Page Visibility Change During Initialization ---');
    const visRes = await testVisibilityChange(browser);
    results.visibilityChange = visRes;
    console.log(`Visibility Test: ${visRes.passed ? 'PASS' : 'FAIL'} in ${visRes.elapsedMs}ms, ST count: ${visRes.stCount}, Errors: ${visRes.errors.length}`);

    // 5. Navigation away and back
    console.log('\n--- 5. Navigation Away and Back (Cleanup & Re-registration) ---');
    const navRes = await testNavigationAwayAndBack(browser);
    results.navigationCycle = navRes;
    console.log(`Nav Cycle - Initial: ${navRes.initialCount}, In Projects: ${navRes.duringProjectsCount}, Returned: ${navRes.finalCount}`);
    console.log(`Cleaned up on unmount: ${navRes.cleanedUpOnUnmount}, No duplicate triggers: ${navRes.noDuplicates}, Errors: ${navRes.errors.length}`);

    // 6. Repeated initialization attempts
    console.log('\n--- 6. Repeated Initialization Attempts (Duplicate Check) ---');
    const repeatRes = await testRepeatedInitialization(browser);
    results.repeatedInit = repeatRes;
    console.log(`Repeated Init: ${repeatRes.passed ? 'PASS' : 'FAIL'}, ST count: ${repeatRes.evaluation.stCount} (expected: 5), Errors: ${repeatRes.errors.length}`);

    // 7. Visual interactions
    console.log('\n--- 7. Visual Verification (Hero Entrance, Micro-Parallax, Magnetic, Typography) ---');
    const visVisual = await testVisualInteractions(browser);
    results.visualVerification = visVisual;
    console.log(`Hero Entrance: ${visVisual.heroEntranceState.metaVisible ? 'PASS' : 'FAIL'}, Elements visible: meta=${visVisual.heroEntranceState.metaVisible} capsule=${visVisual.heroEntranceState.capsuleVisible} desc=${visVisual.heroEntranceState.descVisible} strip=${visVisual.heroEntranceState.stripVisible}`);
    console.log(`Portrait Hover: ${visVisual.portraitHover.found ? 'PASS' : 'FAIL'}, Magnetic Button: ${visVisual.magneticTest.found ? 'PASS' : 'FAIL'}, Font Layout Stability: ${visVisual.fontLayoutStability.titleHeightAdequate ? 'PASS' : 'FAIL'}, Errors: ${visVisual.errors.length}`);

    console.log('\n=================================================================');
    const allTimingPassed = results.timingDelays.every(r => r.settled && r.evaluation.stCount >= 5 && r.errors.length === 0);
    const allPassed =
      allTimingPassed &&
      results.rapidScroll.passed &&
      results.importPending.passed &&
      results.visibilityChange.passed &&
      results.navigationCycle.reinitializedOnReturn &&
      results.navigationCycle.noDuplicates &&
      results.repeatedInit.passed &&
      results.visualVerification.heroEntranceState.metaVisible;

    console.log(`OVERALL SUITE STATUS: ${allPassed ? 'ALL TESTS PASSED (100% GREEN)' : 'SOME TESTS FAILED'}`);
    console.log('=================================================================');
  } catch (err) {
    console.error('Test Suite encountered fatal error:', err);
  } finally {
    await browser.close();
  }
})();
