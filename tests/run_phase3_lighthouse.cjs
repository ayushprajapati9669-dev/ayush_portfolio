const { execSync } = require('child_process');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runLighthouse(url, outputPath, isDesktop = false) {
  console.log(`Running Lighthouse for ${isDesktop ? 'DESKTOP' : 'MOBILE'}: ${outputPath}...`);
  const presetFlag = isDesktop ? '--preset=desktop' : '';
  const cmd = `npx --no-install lighthouse ${url} ${presetFlag} --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=${outputPath} --chrome-flags="--headless=new --no-sandbox" --quiet`;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      execSync(cmd, { stdio: 'inherit' });
      const raw = fs.readFileSync(outputPath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      if (attempt < 2) {
        console.warn(`Lighthouse run failed (attempt ${attempt}), cooling down for 2.5s before retry...`);
        await sleep(2500);
      } else {
        throw e;
      }
    }
  }
}

function extractMetrics(report) {
  const cats = report.categories;
  const audits = report.audits;

  // JS Transfer Size
  const networkItems = audits['network-requests']?.details?.items || [];
  let jsTransferBytes = 0;
  let cssTransferBytes = 0;
  for (const item of networkItems) {
    if (item.resourceType === 'Script') {
      jsTransferBytes += item.transferSize || 0;
    }
    if (item.resourceType === 'Stylesheet') {
      cssTransferBytes += item.transferSize || 0;
    }
  }

  // Long tasks
  const longTasks = audits['long-tasks']?.details?.items || [];

  return {
    performance: Math.round(cats.performance.score * 100),
    accessibility: Math.round(cats.accessibility.score * 100),
    bestPractices: Math.round(cats['best-practices'].score * 100),
    seo: Math.round(cats.seo.score * 100),
    fcp: audits['first-contentful-paint']?.numericValue || 0,
    fcpDisplay: audits['first-contentful-paint']?.displayValue || '',
    lcp: audits['largest-contentful-paint']?.numericValue || 0,
    lcpDisplay: audits['largest-contentful-paint']?.displayValue || '',
    tbt: audits['total-blocking-time']?.numericValue || 0,
    tbtDisplay: audits['total-blocking-time']?.displayValue || '',
    cls: audits['cumulative-layout-shift']?.numericValue || 0,
    clsDisplay: audits['cumulative-layout-shift']?.displayValue || '',
    speedIndex: audits['speed-index']?.numericValue || 0,
    speedIndexDisplay: audits['speed-index']?.displayValue || '',
    mainThreadWork: audits['mainthread-work-breakdown']?.numericValue || 0,
    mainThreadWorkDisplay: audits['mainthread-work-breakdown']?.displayValue || '',
    bootupTime: audits['bootup-time']?.numericValue || 0,
    jsTransferKb: Math.round(jsTransferBytes / 1024),
    cssTransferKb: Math.round(cssTransferBytes / 1024),
    longTasksCount: longTasks.length
  };
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

(async () => {
  const URL = 'http://localhost:4173/';
  console.log('=== COMMENCING 3-RUN PRODUCTION LIGHTHOUSE AUDIT SUITE (PHASE 3) ===\n');

  // MOBILE AUDITS
  const mobileMetrics = [];
  for (let i = 1; i <= 3; i++) {
    const reportPath = `lh-p3-mobile-run${i}.json`;
    const report = await runLighthouse(URL, reportPath, false);
    const m = extractMetrics(report);
    mobileMetrics.push(m);
    console.log(`  [Mobile Run ${i}] Score: ${m.performance} | FCP: ${m.fcpDisplay} | LCP: ${m.lcpDisplay} | TBT: ${m.tbtDisplay} | CLS: ${m.clsDisplay} | CSS: ${m.cssTransferKb}KB | MT: ${m.mainThreadWorkDisplay}`);
    await sleep(3000);
  }

  // DESKTOP AUDITS
  const desktopMetrics = [];
  for (let i = 1; i <= 3; i++) {
    const reportPath = `lh-p3-desktop-run${i}.json`;
    const report = await runLighthouse(URL, reportPath, true);
    const m = extractMetrics(report);
    desktopMetrics.push(m);
    console.log(`  [Desktop Run ${i}] Score: ${m.performance} | FCP: ${m.fcpDisplay} | LCP: ${m.lcpDisplay} | TBT: ${m.tbtDisplay} | CLS: ${m.clsDisplay} | CSS: ${m.cssTransferKb}KB | MT: ${m.mainThreadWorkDisplay}`);
    await sleep(3000);
  }

  // ADMIN CMS AUDITS
  const ADMIN_URL = 'http://localhost:4173/admin';
  const adminMetrics = [];
  for (let i = 1; i <= 3; i++) {
    const reportPath = `lh-p3-admin-run${i}.json`;
    const report = await runLighthouse(ADMIN_URL, reportPath, true);
    const m = extractMetrics(report);
    adminMetrics.push(m);
    console.log(`  [Admin Run ${i}] Score: ${m.performance} | FCP: ${m.fcpDisplay} | LCP: ${m.lcpDisplay} | TBT: ${m.tbtDisplay} | CLS: ${m.clsDisplay} | CSS: ${m.cssTransferKb}KB | MT: ${m.mainThreadWorkDisplay}`);
    await sleep(3000);
  }

  const mobileMedian = {
    performance: Math.round(median(mobileMetrics.map(m => m.performance))),
    accessibility: Math.round(median(mobileMetrics.map(m => m.accessibility))),
    bestPractices: Math.round(median(mobileMetrics.map(m => m.bestPractices))),
    seo: Math.round(median(mobileMetrics.map(m => m.seo))),
    fcp: Math.round(median(mobileMetrics.map(m => m.fcp))),
    lcp: Math.round(median(mobileMetrics.map(m => m.lcp))),
    tbt: Math.round(median(mobileMetrics.map(m => m.tbt))),
    cls: Number(median(mobileMetrics.map(m => m.cls)).toFixed(3)),
    speedIndex: Math.round(median(mobileMetrics.map(m => m.speedIndex))),
    mainThreadWork: Math.round(median(mobileMetrics.map(m => m.mainThreadWork))),
    jsTransferKb: Math.round(median(mobileMetrics.map(m => m.jsTransferKb))),
    cssTransferKb: Math.round(median(mobileMetrics.map(m => m.cssTransferKb))),
    longTasksCount: Math.round(median(mobileMetrics.map(m => m.longTasksCount)))
  };

  const desktopMedian = {
    performance: Math.round(median(desktopMetrics.map(m => m.performance))),
    accessibility: Math.round(median(desktopMetrics.map(m => m.accessibility))),
    bestPractices: Math.round(median(desktopMetrics.map(m => m.bestPractices))),
    seo: Math.round(median(desktopMetrics.map(m => m.seo))),
    fcp: Math.round(median(desktopMetrics.map(m => m.fcp))),
    lcp: Math.round(median(desktopMetrics.map(m => m.lcp))),
    tbt: Math.round(median(desktopMetrics.map(m => m.tbt))),
    cls: Number(median(desktopMetrics.map(m => m.cls)).toFixed(3)),
    speedIndex: Math.round(median(desktopMetrics.map(m => m.speedIndex))),
    mainThreadWork: Math.round(median(desktopMetrics.map(m => m.mainThreadWork))),
    jsTransferKb: Math.round(median(desktopMetrics.map(m => m.jsTransferKb))),
    cssTransferKb: Math.round(median(desktopMetrics.map(m => m.cssTransferKb))),
    longTasksCount: Math.round(median(desktopMetrics.map(m => m.longTasksCount)))
  };

  const adminMedian = {
    performance: Math.round(median(adminMetrics.map(m => m.performance))),
    accessibility: Math.round(median(adminMetrics.map(m => m.accessibility))),
    bestPractices: Math.round(median(adminMetrics.map(m => m.bestPractices))),
    seo: Math.round(median(adminMetrics.map(m => m.seo))),
    fcp: Math.round(median(adminMetrics.map(m => m.fcp))),
    lcp: Math.round(median(adminMetrics.map(m => m.lcp))),
    tbt: Math.round(median(adminMetrics.map(m => m.tbt))),
    cls: Number(median(adminMetrics.map(m => m.cls)).toFixed(3)),
    speedIndex: Math.round(median(adminMetrics.map(m => m.speedIndex))),
    mainThreadWork: Math.round(median(adminMetrics.map(m => m.mainThreadWork))),
    jsTransferKb: Math.round(median(adminMetrics.map(m => m.jsTransferKb))),
    cssTransferKb: Math.round(median(adminMetrics.map(m => m.cssTransferKb))),
    longTasksCount: Math.round(median(adminMetrics.map(m => m.longTasksCount)))
  };

  const summary = {
    mobileRuns: mobileMetrics,
    mobileMedian,
    desktopRuns: desktopMetrics,
    desktopMedian,
    adminRuns: adminMetrics,
    adminMedian
  };

  fs.writeFileSync('lh-phase3-summary.json', JSON.stringify(summary, null, 2));

  console.log('\n========================================');
  console.log('=== PHASE 3 EMPIRICAL MEDIAN RESULTS ===');
  console.log('========================================\n');
  console.log('MOBILE MEDIAN (3 runs):');
  console.log(`  Performance:     ${mobileMedian.performance}`);
  console.log(`  Accessibility:   ${mobileMedian.accessibility}`);
  console.log(`  Best Practices:  ${mobileMedian.bestPractices}`);
  console.log(`  SEO:             ${mobileMedian.seo}`);
  console.log(`  FCP:             ${(mobileMedian.fcp / 1000).toFixed(2)}s`);
  console.log(`  LCP:             ${(mobileMedian.lcp / 1000).toFixed(2)}s`);
  console.log(`  TBT:             ${mobileMedian.tbt}ms`);
  console.log(`  CLS:             ${mobileMedian.cls}`);
  console.log(`  Speed Index:     ${(mobileMedian.speedIndex / 1000).toFixed(2)}s`);
  console.log(`  Main-Thread:     ${(mobileMedian.mainThreadWork / 1000).toFixed(2)}s`);
  console.log(`  CSS Transfer:    ${mobileMedian.cssTransferKb} KB`);
  console.log(`  JS Transfer:     ${mobileMedian.jsTransferKb} KB`);
  console.log(`  Long Tasks:      ${mobileMedian.longTasksCount}`);

  console.log('\nDESKTOP MEDIAN (3 runs):');
  console.log(`  Performance:     ${desktopMedian.performance}`);
  console.log(`  Accessibility:   ${desktopMedian.accessibility}`);
  console.log(`  Best Practices:  ${desktopMedian.bestPractices}`);
  console.log(`  SEO:             ${desktopMedian.seo}`);
  console.log(`  FCP:             ${(desktopMedian.fcp / 1000).toFixed(2)}s`);
  console.log(`  LCP:             ${(desktopMedian.lcp / 1000).toFixed(2)}s`);
  console.log(`  TBT:             ${desktopMedian.tbt}ms`);
  console.log(`  CLS:             ${desktopMedian.cls}`);
  console.log(`  Speed Index:     ${(desktopMedian.speedIndex / 1000).toFixed(2)}s`);
  console.log(`  Main-Thread:     ${(desktopMedian.mainThreadWork / 1000).toFixed(2)}s`);
  console.log(`  CSS Transfer:    ${desktopMedian.cssTransferKb} KB`);
  console.log(`  JS Transfer:     ${desktopMedian.jsTransferKb} KB`);
  console.log(`  Long Tasks:      ${desktopMedian.longTasksCount}`);

  console.log('\nADMIN CMS MEDIAN (3 runs):');
  console.log(`  Performance:     ${adminMedian.performance}`);
  console.log(`  Accessibility:   ${adminMedian.accessibility}`);
  console.log(`  Best Practices:  ${adminMedian.bestPractices}`);
  console.log(`  SEO:             ${adminMedian.seo}`);
  console.log(`  FCP:             ${(adminMedian.fcp / 1000).toFixed(2)}s`);
  console.log(`  LCP:             ${(adminMedian.lcp / 1000).toFixed(2)}s`);
  console.log(`  TBT:             ${adminMedian.tbt}ms`);
  console.log(`  CLS:             ${adminMedian.cls}`);
  console.log(`  Speed Index:     ${(adminMedian.speedIndex / 1000).toFixed(2)}s`);
  console.log(`  Main-Thread:     ${(adminMedian.mainThreadWork / 1000).toFixed(2)}s`);
  console.log(`  CSS Transfer:    ${adminMedian.cssTransferKb} KB`);
  console.log(`  JS Transfer:     ${adminMedian.jsTransferKb} KB`);
  console.log(`  Long Tasks:      ${adminMedian.longTasksCount}`);
})();

