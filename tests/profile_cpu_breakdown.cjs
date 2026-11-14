const fs = require('fs');

const run1 = JSON.parse(fs.readFileSync('lh-p3-mobile-run1.json', 'utf8'));
const run2 = JSON.parse(fs.readFileSync('lh-p3-mobile-run2.json', 'utf8'));
const run3 = JSON.parse(fs.readFileSync('lh-p3-mobile-run3.json', 'utf8'));

function summarizeLighthouse(report, label) {
  console.log(`\n=== LIGHTHOUSE PROFILE: ${label} ===`);
  const audits = report.audits;
  
  // 1. Main-thread work breakdown
  const mt = audits['mainthread-work-breakdown']?.details?.items || [];
  console.log('\n--- Main-Thread Work Breakdown ---');
  let totalMt = 0;
  for (const item of mt) {
    totalMt += item.duration;
    console.log(`  ${item.groupLabel || item.group}: ${(item.duration).toFixed(1)} ms`);
  }
  console.log(`  TOTAL: ${totalMt.toFixed(1)} ms`);

  // 2. Bootup time (Script evaluation costs per file)
  const bootup = audits['bootup-time']?.details?.items || [];
  console.log('\n--- Script Bootup Evaluation Times ---');
  for (const item of bootup.slice(0, 10)) {
    const filename = item.url.split('/').pop().split('?')[0];
    console.log(`  ${filename}: total ${(item.total).toFixed(1)} ms | scriptEval ${(item.scripting).toFixed(1)} ms`);
  }

  // 3. Long tasks
  const longTasks = audits['long-tasks']?.details?.items || [];
  console.log(`\n--- Long Tasks Count: ${longTasks.length} ---`);
  for (const t of longTasks.slice(0, 8)) {
    console.log(`  Start: ${(t.startTime).toFixed(1)} ms | Duration: ${(t.duration).toFixed(1)} ms`);
  }

  // 4. LCP details
  const lcpAudit = audits['largest-contentful-paint-element'];
  console.log('\n--- LCP Element ---');
  const lcpItem = lcpAudit?.details?.items?.[0];
  console.log('  Node:', lcpItem?.node?.nodeLabel);
  console.log('  Snippet:', lcpItem?.node?.snippet);

  // 5. Diagnostics
  const diag = audits['diagnostics']?.details?.items?.[0];
  if (diag) {
    console.log('\n--- Diagnostics ---');
    console.log(`  numTasks: ${diag.numTasks}`);
    console.log(`  numTasksOver50ms: ${diag.numTasksOver50ms}`);
    console.log(`  totalTaskTime: ${diag.totalTaskTime.toFixed(1)} ms`);
    console.log(`  maxRtt: ${diag.maxRtt} ms`);
  }
}

summarizeLighthouse(run1, 'Mobile Run 1');
summarizeLighthouse(run2, 'Mobile Run 2');

