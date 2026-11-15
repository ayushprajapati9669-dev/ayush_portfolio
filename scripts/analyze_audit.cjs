const fs = require('fs');
const r = JSON.parse(fs.readFileSync('lh-current-mobile.json', 'utf8'));
const a = r.audits;

console.log('=== Render Blocking Resources ===');
console.log(JSON.stringify(a['render-blocking-resources']?.details?.items || a['render-blocking-insight']?.details?.items, null, 2));

console.log('=== LCP Audit ===');
console.log('Numeric value:', a['largest-contentful-paint']?.numericValue);
console.log('Details:', JSON.stringify(a['largest-contentful-paint']?.details, null, 2));

console.log('=== LCP Element Details ===');
for (const key of Object.keys(a)) {
  if (key.includes('largest-contentful-paint') || key.includes('lcp')) {
    console.log(key, '->', a[key]?.details?.items || a[key]?.displayValue);
  }
}

console.log('=== Style & Layout breakdown / forced reflows ===');
for (const key of Object.keys(a)) {
  if (key.includes('layout') || key.includes('reflow') || key.includes('dom')) {
    console.log(key, '->', a[key]?.displayValue || a[key]?.score);
  }
}
