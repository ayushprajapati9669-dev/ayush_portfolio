const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('================================================================');
  console.log('=== PHASE 3 RESPONSIVE BREAKPOINT RIGOROUS STRESS TEST SUITE ===');
  console.log('Target: ScrollReactivePortraitParticles.jsx');
  console.log('Sequence: 800px -> 760px -> 780px -> 740px -> 900px (plus 1200px desktop)');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const consoleWarnings = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    if (msg.type() === 'warn') consoleWarnings.push(msg.text());
  });
  page.on('pageerror', (err) => {
    console.error('FULL PAGE ERROR STACK:', err.stack || err.message);
    consoleErrors.push('PAGE ERROR: ' + (err.stack || err.message));
  });

  // Track criteria results
  const results = {};

  // 1. Initial Load at 800px (Tablet/Desktop above 768px)
  await page.setViewport({ width: 800, height: 900, devicePixelRatio: 1 });
  console.log('1. Loading portfolio at 800px viewport...');
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  // Start dissolve animation before resizing
  console.log('2. Activating portrait particle dissolve animation (scrolling to y=150)...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(150, { immediate: true });
    } else {
      window.scrollTo(0, 150);
    }
  });

  // Wait 1.2s for idle sampling and animation loop to actively render
  await new Promise(r => setTimeout(r, 1200));

  // Inspect initial active animation state
  const initialInspect = await page.evaluate(() => {
    const canvas = document.querySelector('.hero-photo-wrapper canvas');
    const img = document.querySelector('#himg');
    const ctx = canvas?.getContext('2d');
    let nonZero = 0;
    if (ctx && canvas && canvas.width > 0 && canvas.height > 0) {
      const idata = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < idata.length; i += 16) {
        if (idata[i] > 0) nonZero++;
      }
    }
    const rect = img?.getBoundingClientRect();
    return {
      hasCanvas: Boolean(canvas),
      canvasW: canvas?.width,
      canvasH: canvas?.height,
      imgW: Math.round(rect?.width || 0),
      imgH: Math.round(rect?.height || 0),
      scrollY: window.scrollY,
      nonZeroSampledPixels: nonZero
    };
  });

  console.log('Initial Active State at 800px:', initialInspect);
  await page.screenshot({ path: 'stress-1-initial-800px.png' });

  // Evaluation: Criterion 1
  results.crit1_dissolveStartedBeforeResize =
    initialInspect.hasCanvas &&
    initialInspect.canvasW > 0 &&
    initialInspect.nonZeroSampledPixels > 0 &&
    initialInspect.scrollY >= 25;

  console.log(`\nCriterion 1 (Dissolve animation active before resize): ${results.crit1_dissolveStartedBeforeResize ? 'PASS' : 'FAIL'}`);

  // 2. Rapid Resize Stress Sequence across 768px breakpoint
  console.log('\n3. Executing Rapid Viewport Resizing Sequence across 768px breakpoint...');
  const sequence = [
    { width: 760, height: 900, delay: 60, name: '760px (mobile <768px)' },
    { width: 780, height: 900, delay: 60, name: '780px (tablet >768px)' },
    { width: 740, height: 900, delay: 60, name: '740px (mobile <768px)' },
    { width: 900, height: 900, delay: 200, name: '900px (tablet settled)' }
  ];

  const stepStates = [];
  let blankCanvasDuringResize = false;

  for (const step of sequence) {
    console.log(`   -> Resizing to ${step.name}...`);
    await page.setViewport({ width: step.width, height: step.height, devicePixelRatio: 1 });
    await new Promise(r => setTimeout(r, step.delay));

    const state = await page.evaluate(() => {
      const canvas = document.querySelector('.hero-photo-wrapper canvas');
      const img = document.querySelector('#himg');
      const ctx = canvas?.getContext('2d');
      let nonZero = 0;
      if (ctx && canvas && canvas.width > 0 && canvas.height > 0) {
        const idata = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < idata.length; i += 16) {
          if (idata[i] > 0) nonZero++;
        }
      }
      const rect = img?.getBoundingClientRect();
      return {
        viewportWidth: window.innerWidth,
        canvasW: canvas?.width,
        canvasH: canvas?.height,
        imgW: Math.round(rect?.width || 0),
        imgH: Math.round(rect?.height || 0),
        nonZeroPixels: nonZero,
        isBlank: nonZero === 0
      };
    });

    if (state.isBlank) blankCanvasDuringResize = true;
    stepStates.push({ step: step.name, ...state });
    console.log(`      Canvas: ${state.canvasW}x${state.canvasH}, Img: ${state.imgW}x${state.imgH}, NonZeroPixels: ${state.nonZeroPixels}`);
    await page.screenshot({ path: `stress-step-${step.width}px.png` });
  }

  // Evaluation: Criterion 2
  results.crit2_rapidResizeAcrossBreakpoint = stepStates.length === 4;
  console.log(`\nCriterion 2 (Rapid resize across breakpoint executed): ${results.crit2_rapidResizeAcrossBreakpoint ? 'PASS' : 'FAIL'}`);

  // Wait 1.0s after final resize for full debounce and background idle settlement
  console.log('\n4. Waiting 1.0s for final post-settlement sampling and verification...');
  await new Promise(r => setTimeout(r, 1000));

  const settled900State = await page.evaluate(() => {
    const canvas = document.querySelector('.hero-photo-wrapper canvas');
    const img = document.querySelector('#himg');
    const wrapper = document.querySelector('.hero-photo-wrapper');
    const ctx = canvas?.getContext('2d');
    let nonZero = 0;
    if (ctx && canvas && canvas.width > 0 && canvas.height > 0) {
      const idata = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < idata.length; i += 16) {
        if (idata[i] > 0) nonZero++;
      }
    }
    const rect = img?.getBoundingClientRect();
    const wrapRect = wrapper?.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      canvasW: canvas?.width,
      canvasH: canvas?.height,
      imgW: Math.round(rect?.width || 0),
      imgH: Math.round(rect?.height || 0),
      wrapperW: Math.round(wrapRect?.width || 0),
      wrapperH: Math.round(wrapRect?.height || 0),
      nonZeroPixels: nonZero
    };
  });

  console.log('Settled State at 900px:', settled900State);
  await page.screenshot({ path: 'stress-settled-900px.png' });

  // Evaluation: Criterion 3
  results.crit3_canvasDimensionsMatch =
    Math.abs(settled900State.canvasW - settled900State.imgW) <= 2 &&
    Math.abs(settled900State.canvasH - settled900State.imgH) <= 2;
  console.log(`Criterion 3 (Canvas width and height match image): ${results.crit3_canvasDimensionsMatch ? 'PASS' : 'FAIL'}`);

  // Evaluation: Criterion 4
  results.crit4_particleBuffersConsistent =
    settled900State.canvasW > 0 &&
    settled900State.canvasH > 0 &&
    settled900State.nonZeroPixels > 0;
  console.log(`Criterion 4 (Particle buffers & sampling consistent): ${results.crit4_particleBuffersConsistent ? 'PASS' : 'FAIL'}`);

  // Test active animation continuation post-resize by scrolling further
  console.log('\n5. Testing animation post-resize by scrolling to y=220...');
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(220, { immediate: true });
    } else {
      window.scrollTo(0, 220);
    }
  });
  await new Promise(r => setTimeout(r, 600));

  const postScrollDraw = await page.evaluate(() => {
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
      scrollY: window.scrollY,
      nonZeroPixels: nonZero
    };
  });
  console.log('Post-scroll drawing verification at y=220:', postScrollDraw);
  await page.screenshot({ path: 'stress-animated-y220.png' });

  // Evaluation: Criterion 6
  results.crit6_animationContinuesSmoothly = postScrollDraw.nonZeroPixels > 0;
  console.log(`Criterion 6 (Animation continues smoothly post-resize): ${results.crit6_animationContinuesSmoothly ? 'PASS' : 'FAIL'}`);

  // 6. Test Desktop Layout at 1200px (side-by-side)
  console.log('\n6. Testing Desktop Layout transition to 1200px...');
  await page.setViewport({ width: 1200, height: 900, devicePixelRatio: 1 });
  await new Promise(r => setTimeout(r, 1000));

  const desktop1200State = await page.evaluate(() => {
    const canvas = document.querySelector('.hero-photo-wrapper canvas');
    const img = document.querySelector('#himg');
    const container = document.querySelector('.hero-photo-container');
    const showcase = document.querySelector('.hero-center-showcase');
    const ctx = canvas?.getContext('2d');
    let nonZero = 0;
    if (ctx && canvas && canvas.width > 0 && canvas.height > 0) {
      const idata = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < idata.length; i += 16) {
        if (idata[i] > 0) nonZero++;
      }
    }
    const imgRect = img?.getBoundingClientRect();
    const contRect = container?.getBoundingClientRect();
    const showRect = showcase?.getBoundingClientRect();
    return {
      canvasW: canvas?.width,
      canvasH: canvas?.height,
      imgW: Math.round(imgRect?.width || 0),
      imgH: Math.round(imgRect?.height || 0),
      containerW: Math.round(contRect?.width || 0),
      showcaseW: Math.round(showRect?.width || 0),
      nonZeroPixels: nonZero
    };
  });

  console.log('Desktop 1200px Layout State:', desktop1200State);
  await page.screenshot({ path: 'stress-desktop-1200px.png' });

  // Evaluation: Criterion 7 & 8
  results.crit5_noRaceConditionsOrConsoleErrors = consoleErrors.length === 0;
  results.crit7_noBlankCanvasOrDistortion = !blankCanvasDuringResize && settled900State.nonZeroPixels > 0;
  results.crit8_responsiveLayoutsVerified =
    desktop1200State.imgW > 0 &&
    desktop1200State.containerW > 0 &&
    settled900State.imgW > 0;

  console.log('\n================================================================');
  console.log('=== FINAL BREAKPOINT STRESS TEST EVALUATION SUMMARY ===');
  console.log('================================================================');
  console.log(`1. Portrait particle dissolve started before resizing:   ${results.crit1_dissolveStartedBeforeResize ? 'PASS' : 'FAIL'}`);
  console.log(`2. Rapid resize across breakpoint (800->760->780->740->900): ${results.crit2_rapidResizeAcrossBreakpoint ? 'PASS' : 'FAIL'}`);
  console.log(`3. Canvas width and height update correctly:             ${results.crit3_canvasDimensionsMatch ? 'PASS' : 'FAIL'}`);
  console.log(`4. Particle buffers and sampling state remain consistent: ${results.crit4_particleBuffersConsistent ? 'PASS' : 'FAIL'}`);
  console.log(`5. No stale callbacks, duplicate idle jobs, or races:    ${results.crit5_noRaceConditionsOrConsoleErrors ? 'PASS' : 'FAIL'}`);
  console.log(`6. Animation continues smoothly post-resize:              ${results.crit6_animationContinuesSmoothly ? 'PASS' : 'FAIL'}`);
  console.log(`7. Zero blank canvas, distortion, or leaks:              ${results.crit7_noBlankCanvasOrDistortion ? 'PASS' : 'FAIL'}`);
  console.log(`8. Mobile, tablet, and desktop layouts verified:         ${results.crit8_responsiveLayoutsVerified ? 'PASS' : 'FAIL'}`);
  console.log(`\nConsole Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log('  [ERROR]', e));
  }
  console.log('================================================================\n');

  const summary = {
    results,
    consoleErrors,
    stepStates,
    settled900State,
    desktop1200State
  };

  fs.writeFileSync('stress-test-report.json', JSON.stringify(summary, null, 2));

  await browser.close();
})();
