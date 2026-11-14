const puppeteer = require('puppeteer');

const BASE_URL = 'http://127.0.0.1:4173';

// Network profile configurations
const NETWORK_PROFILES = {
  slow3G: {
    name: 'Slow 3G',
    latency: 400,
    downloadThroughput: Math.floor((500 * 1024) / 8), // 500 Kbps
    uploadThroughput: Math.floor((500 * 1024) / 8)
  },
  verySlow3G: {
    name: 'Very Slow 3G',
    latency: 800,
    downloadThroughput: Math.floor((250 * 1024) / 8), // 250 Kbps
    uploadThroughput: Math.floor((150 * 1024) / 8)
  },
  simulated2G: {
    name: 'Simulated 2G',
    latency: 1500,
    downloadThroughput: Math.floor((100 * 1024) / 8), // 100 Kbps
    uploadThroughput: Math.floor((50 * 1024) / 8)
  }
};

async function setupPage(browser, { networkProfile = null, cpuThrottle = 4, delayChunkMs = 0, failChunk = false } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const client = await page.target().createCDPSession();

  // Setup CPU throttling
  if (cpuThrottle > 1) {
    await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
  }

  // Setup Network throttling
  if (networkProfile) {
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: networkProfile.latency,
      downloadThroughput: networkProfile.downloadThroughput,
      uploadThroughput: networkProfile.uploadThroughput
    });
  }

  // Setup layout-shift observer to track CLS exactly as Lighthouse does
  await page.evaluateOnNewDocument(() => {
    window.__clsScore = 0;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__clsScore += entry.value;
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (_e) {}
  });

  const errors = [];
  const warnings = [];
  const chunkRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') errors.push(text);
    if (msg.type() === 'warning') warnings.push(text);
  });

  page.on('pageerror', err => errors.push(err.message));

  // Request interception for chunk delay or simulated failure
  if (delayChunkMs > 0 || failChunk) {
    await page.setRequestInterception(true);
    page.on('request', async (req) => {
      const url = req.url();
      if (url.includes('HomeBelowTheFold')) {
        const start = Date.now();
        chunkRequests.push({ url, startTime: start });

        if (failChunk) {
          req.abort('failed');
          return;
        }

        if (delayChunkMs > 0) {
          await new Promise(r => setTimeout(r, delayChunkMs));
          chunkRequests[chunkRequests.length - 1].delayApplied = Date.now() - start;
          req.continue();
          return;
        }
      }
      req.continue();
    });
  }

  return { page, client, errors, warnings, chunkRequests };
}

// =========================================================================
// TEST 1, 2, 3: Network Throttling (Slow 3G, Very Slow 3G, Simulated 2G)
// =========================================================================
async function testNetworkThrottling(browser, profileKey) {
  const profile = NETWORK_PROFILES[profileKey];
  const { page, errors } = await setupPage(browser, {
    networkProfile: profile,
    cpuThrottle: 4
  });

  const startTime = Date.now();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  // Measure initial CLS and placeholder height before user scroll
  const initialMetrics = await page.evaluate(() => {
    const placeholder = document.querySelector('[aria-hidden="true"].min-h-\\[1200px\\], .min-h-\\[1200px\\]');
    return {
      clsBefore: window.__clsScore || 0,
      placeholderHeight: placeholder ? placeholder.getBoundingClientRect().height : 0,
      scrollHeight: document.documentElement.scrollHeight
    };
  });

  // Trigger user scroll
  await page.evaluate(() => {
    window.scrollTo({ top: 400, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });

  // Repeated scrolling during constrained download
  for (let i = 0; i < 4; i++) {
    await new Promise(r => setTimeout(r, 400));
    await page.evaluate(() => {
      window.scrollBy(0, 100);
      window.dispatchEvent(new Event('scroll'));
    });
  }

  // Poll until HomeBelowTheFold mounts and ScrollTriggers register
  let mounted = false;
  let settleElapsed = 0;
  const pollStart = Date.now();
  while (Date.now() - pollStart < 25000) {
    const status = await page.evaluate(() => {
      const bento = Boolean(document.querySelector('.bento-section'));
      const st = window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0;
      return { bento, st };
    });
    if (status.bento && status.st >= 5) {
      mounted = true;
      settleElapsed = Date.now() - pollStart;
      break;
    }
    await new Promise(r => setTimeout(r, 250));
  }

  const finalMetrics = await page.evaluate(() => {
    const bento = Boolean(document.querySelector('.bento-section'));
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    return {
      clsAfter: window.__clsScore || 0,
      bentoMounted: bento,
      stCount: st.length,
      finalScrollHeight: document.documentElement.scrollHeight
    };
  });

  await page.close();

  const totalDuration = Date.now() - startTime;
  const clsDelta = finalMetrics.clsAfter - initialMetrics.clsBefore;

  return {
    profile: profile.name,
    mounted,
    totalDuration,
    chunkResolutionElapsed: settleElapsed,
    clsBefore: initialMetrics.clsBefore,
    clsAfter: finalMetrics.clsAfter,
    clsDelta: Number(clsDelta.toFixed(4)),
    placeholderHeightBefore: initialMetrics.placeholderHeight,
    scrollHeightBefore: initialMetrics.scrollHeight,
    scrollHeightAfter: finalMetrics.finalScrollHeight,
    stCount: finalMetrics.stCount,
    errors
  };
}

// =========================================================================
// TEST 4: Delayed HomeBelowTheFold Chunk Response (>10 Seconds)
// =========================================================================
async function testDelayedChunkResponse(browser) {
  const DELAY_MS = 10500; // 10.5 seconds delay
  const { page, errors, chunkRequests } = await setupPage(browser, {
    cpuThrottle: 4,
    delayChunkMs: DELAY_MS
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  // Trigger scroll to initiate dynamic import
  await page.evaluate(() => {
    window.scrollTo({ top: 300, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });

  // Check placeholder reservation DURING the 10.5 second delay
  await new Promise(r => setTimeout(r, 2000));
  const duringDelayState = await page.evaluate(() => {
    const placeholder = document.querySelector('.min-h-\\[1200px\\]');
    const bento = Boolean(document.querySelector('.bento-section'));
    return {
      placeholderPresent: Boolean(placeholder),
      placeholderHeight: placeholder ? placeholder.getBoundingClientRect().height : 0,
      bentoMounted: bento,
      clsDuringDelay: window.__clsScore || 0,
      scrollHeight: document.documentElement.scrollHeight
    };
  });

  // Perform user scrolls up and down during the pending delay
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 1200));
    const scrollDelta = (i % 2 === 0 ? 150 : -100);
    await page.evaluate((d) => {
      window.scrollBy(0, d);
      window.dispatchEvent(new Event('scroll'));
    }, scrollDelta);
  }

  // Poll for resolution after the 10.5s delay releases
  let mountedAfterDelay = false;
  const pollStart = Date.now();
  while (Date.now() - pollStart < 15000) {
    const status = await page.evaluate(() => {
      const bento = Boolean(document.querySelector('.bento-section'));
      const st = window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0;
      return { bento, st };
    });
    if (status.bento && status.st >= 5) {
      mountedAfterDelay = true;
      break;
    }
    await new Promise(r => setTimeout(r, 250));
  }

  const postResolutionState = await page.evaluate(() => {
    const bento = Boolean(document.querySelector('.bento-section'));
    const st = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    return {
      bentoMounted: bento,
      stCount: st.length,
      clsFinal: window.__clsScore || 0,
      finalScrollHeight: document.documentElement.scrollHeight
    };
  });

  await page.close();

  return {
    delayedDurationMs: DELAY_MS,
    duringDelayState,
    mountedAfterDelay,
    postResolutionState,
    clsDelta: Number((postResolutionState.clsFinal - duringDelayState.clsDuringDelay).toFixed(4)),
    errors
  };
}

// =========================================================================
// TEST 5: Failed / Interrupted Chunk Request (Graceful Recoverable Fallback)
// =========================================================================
async function testFailedChunkRequest(browser) {
  const { page, errors } = await setupPage(browser, {
    cpuThrottle: 2,
    failChunk: true
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  // Trigger scroll to attempt loading
  await page.evaluate(() => {
    window.scrollTo({ top: 300, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  });

  // Wait for retry cycle to complete and recoverable fallback to mount
  let fallbackFound = false;
  const pollStart = Date.now();
  while (Date.now() - pollStart < 8000) {
    const hasFallback = await page.evaluate(() => {
      const text = document.body.innerText;
      const retryBtn = Array.from(document.querySelectorAll('button')).some(b =>
        b.textContent && (b.textContent.includes('Retry') || b.textContent.includes('Recovered'))
      );
      return retryBtn || text.includes('interrupted') || text.includes('Recovered');
    });
    if (hasFallback) {
      fallbackFound = true;
      break;
    }
    await new Promise(r => setTimeout(r, 250));
  }

  const fallbackDetails = await page.evaluate(() => {
    const heroStillVisible = Boolean(document.querySelector('.hero-editorial-stage'));
    const retryButtons = Array.from(document.querySelectorAll('button'))
      .filter(b => b.textContent && (b.textContent.includes('Retry') || b.textContent.includes('Connection')))
      .map(b => b.textContent.trim());
    return {
      heroStillVisible,
      retryButtons,
      pageCrashed: Boolean(document.querySelector('body > #root:empty'))
    };
  });

  await page.close();

  // Filter expected network aborted errors (net::ERR_FAILED) from actual JS crashes
  const jsCrashes = errors.filter(e => !e.includes('net::ERR_FAILED') && !e.includes('Failed to fetch'));

  return {
    fallbackFound,
    fallbackDetails,
    jsCrashesCount: jsCrashes.length,
    jsCrashes
  };
}

// =========================================================================
// MAIN RUNNER
// =========================================================================
(async () => {
  console.log('=================================================================');
  console.log('   PHASE 3: FINAL SLOW-NETWORK & CHUNK RESILIENCE VERIFICATION   ');
  console.log('=================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {};

  try {
    // 1. Slow 3G
    console.log('--- 1. Testing Slow 3G Network Throttling ---');
    const s3g = await testNetworkThrottling(browser, 'slow3G');
    results.slow3G = s3g;
    console.log(`Slow 3G: Mounted=${s3g.mounted}, Duration=${s3g.totalDuration}ms, CLS Before=${s3g.clsBefore}, CLS After=${s3g.clsAfter} (delta=${s3g.clsDelta}), ST Count=${s3g.stCount}, Errors=${s3g.errors.length}`);

    // 2. Very Slow 3G
    console.log('\n--- 2. Testing Very Slow 3G Network Throttling ---');
    const vs3g = await testNetworkThrottling(browser, 'verySlow3G');
    results.verySlow3G = vs3g;
    console.log(`Very Slow 3G: Mounted=${vs3g.mounted}, Duration=${vs3g.totalDuration}ms, CLS Before=${vs3g.clsBefore}, CLS After=${vs3g.clsAfter} (delta=${vs3g.clsDelta}), ST Count=${vs3g.stCount}, Errors=${vs3g.errors.length}`);

    // 3. Simulated 2G
    console.log('\n--- 3. Testing Simulated 2G Extremely Constrained Network ---');
    const sim2g = await testNetworkThrottling(browser, 'simulated2G');
    results.simulated2G = sim2g;
    console.log(`Simulated 2G: Mounted=${sim2g.mounted}, Duration=${sim2g.totalDuration}ms, CLS Before=${sim2g.clsBefore}, CLS After=${sim2g.clsAfter} (delta=${sim2g.clsDelta}), ST Count=${sim2g.stCount}, Errors=${sim2g.errors.length}`);

    // 4. Delayed Chunk (>10 seconds)
    console.log('\n--- 4. Testing Delayed Chunk Response (>10 seconds delay) ---');
    const delayed = await testDelayedChunkResponse(browser);
    results.delayedChunk = delayed;
    console.log(`Delayed Chunk (10.5s): Placeholder reserved=${delayed.duringDelayState.placeholderPresent} (${delayed.duringDelayState.placeholderHeight}px), Mounted After Delay=${delayed.mountedAfterDelay}, Final ST Count=${delayed.postResolutionState.stCount}, CLS Delta=${delayed.clsDelta}, Errors=${delayed.errors.length}`);

    // 5. Interrupted / Failed Chunk Request
    console.log('\n--- 5. Testing Interrupted / Failed Chunk Request (Recoverability) ---');
    const failed = await testFailedChunkRequest(browser);
    results.failedChunk = failed;
    console.log(`Failed Chunk: Recoverable Fallback=${failed.fallbackFound}, Hero Visible=${failed.fallbackDetails.heroStillVisible}, Page Crashed=${failed.fallbackDetails.pageCrashed}, Action Buttons=${JSON.stringify(failed.fallbackDetails.retryButtons)}, Unhandled JS Crashes=${failed.jsCrashesCount}`);

    console.log('\n=================================================================');
    const allPassed =
      results.slow3G.mounted &&
      results.verySlow3G.mounted &&
      results.simulated2G.mounted &&
      results.delayedChunk.mountedAfterDelay &&
      results.delayedChunk.duringDelayState.placeholderPresent &&
      results.failedChunk.fallbackFound &&
      !results.failedChunk.fallbackDetails.pageCrashed &&
      results.failedChunk.jsCrashesCount === 0;

    console.log(`OVERALL SLOW-NETWORK RESILIENCE STATUS: ${allPassed ? 'ALL SCENARIOS PASSED (100% GREEN)' : 'SOME SCENARIOS FAILED'}`);
    console.log('=================================================================');
  } catch (err) {
    console.error('Fatal error during slow-network suite:', err);
  } finally {
    await browser.close();
  }
})();
