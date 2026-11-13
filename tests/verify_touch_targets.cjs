const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const VIEWPORTS = [320, 360, 375, 390, 430, 768, 820, 1024, 1366, 1920];

async function verifyTouchTargets() {
  console.log('================================================================');
  console.log('VERIFYING 3 TOUCH TARGET FIXES ACROSS 10 VIEWPORTS');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const results = {
    viewports: {},
    measurements: {},
    interactions: {},
    pass: true
  };

  for (const width of VIEWPORTS) {
    await page.setViewport({ width, height: 844 });
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const metrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const hasHScroll = scrollWidth > innerWidth + 1;

      // 1. Particle Indicators
      const particleButtons = Array.from(document.querySelectorAll('button[aria-label^="Morph to particle scene"]'));
      const particleMetrics = particleButtons.map(btn => {
        const r = btn.getBoundingClientRect();
        const dot = btn.querySelector('span');
        const dotR = dot ? dot.getBoundingClientRect() : null;
        return {
          btnW: Math.round(r.width),
          btnH: Math.round(r.height),
          dotW: dotR ? Math.round(dotR.width) : null,
          dotH: dotR ? Math.round(dotR.height) : null
        };
      });

      // 2. Journey Carousel Buttons
      const leftBtn = document.querySelector('button[aria-label="Scroll milestones left"]');
      const rightBtn = document.querySelector('button[aria-label="Scroll milestones right"]');
      const leftR = leftBtn ? leftBtn.getBoundingClientRect() : null;
      const rightR = rightBtn ? rightBtn.getBoundingClientRect() : null;

      // 3. Project Case Study Links
      const caseStudyLinks = Array.from(document.querySelectorAll('.project-link-hint'));
      const linkMetrics = caseStudyLinks.map(link => {
        const r = link.getBoundingClientRect();
        return {
          w: Math.round(r.width),
          h: Math.round(r.height)
        };
      });

      return {
        hasHScroll,
        scrollWidth,
        innerWidth,
        particleMetrics,
        journeyLeft: leftR ? { w: Math.round(leftR.width), h: Math.round(leftR.height) } : null,
        journeyRight: rightR ? { w: Math.round(rightR.width), h: Math.round(rightR.height) } : null,
        caseStudyLinks: linkMetrics.slice(0, 3)
      };
    });

    const vPass = !metrics.hasHScroll &&
      metrics.particleMetrics.every(m => m.btnW >= 44 && m.btnH >= 44) &&
      (!metrics.journeyLeft || (metrics.journeyLeft.w >= 36 && metrics.journeyLeft.h >= 36)) &&
      (!metrics.journeyRight || (metrics.journeyRight.w >= 36 && metrics.journeyRight.h >= 36)) &&
      (metrics.caseStudyLinks.length === 0 || metrics.caseStudyLinks.every(l => l.h >= 36));

    results.viewports[width] = {
      ...metrics,
      pass: vPass
    };

    console.log(`[${width}px] Overflow: ${metrics.hasHScroll ? 'FAIL' : 'PASS (0px)'} | Particle Target: ${metrics.particleMetrics[0]?.btnW}x${metrics.particleMetrics[0]?.btnH}px | Journey Target: ${metrics.journeyRight?.w}x${metrics.journeyRight?.h}px | Case Study Height: ${metrics.caseStudyLinks[0]?.h}px | Result: ${vPass ? 'PASS' : 'FAIL'}`);

    if (!vPass) results.pass = false;
  }

  // Test Interaction: Clicking particle button 2
  console.log('\n--- Testing Particle Indicator Interaction ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));

  const particleInteraction = await page.evaluate(async () => {
    const btn2 = document.querySelector('button[aria-label="Morph to particle scene 2"]');
    if (btn2) {
      btn2.click();
      await new Promise(r => setTimeout(r, 200));
      const activeBtn = document.querySelector('button[aria-label="Morph to particle scene 2"] span');
      return {
        clicked: true,
        hasActiveGlow: activeBtn ? activeBtn.className.includes('bg-[#e5b869]') : false
      };
    }
    return { clicked: false };
  });
  console.log('Particle Interaction Result:', JSON.stringify(particleInteraction));

  // Test Interaction: Clicking Journey carousel scroll button
  console.log('\n--- Testing Journey Carousel Interaction ---');
  const journeyInteraction = await page.evaluate(async () => {
    const rightBtn = document.querySelector('button[aria-label="Scroll milestones right"]');
    if (rightBtn) {
      rightBtn.click();
      return { clicked: true, disabled: rightBtn.disabled };
    }
    return { clicked: false };
  });
  console.log('Journey Carousel Interaction Result:', JSON.stringify(journeyInteraction));

  // Test Interaction: Case study navigation
  console.log('\n--- Testing Project Case Study Link Navigation ---');
  const navResult = await page.evaluate(() => {
    const link = document.querySelector('.project-link-hint');
    return {
      href: link ? link.getAttribute('href') : null,
      visible: link ? window.getComputedStyle(link).display !== 'none' : false
    };
  });
  console.log('Case Study Link Target:', JSON.stringify(navResult));

  await browser.close();

  console.log('\nConsole Errors:', consoleErrors.length === 0 ? '0 (None)' : consoleErrors);
  console.log('Overall Verification Status:', results.pass ? 'ALL PASS' : 'FAIL');
}

verifyTouchTargets().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

