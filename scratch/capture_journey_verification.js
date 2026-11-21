const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function capture() {
  const outputDir = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/mobile_audit');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test Mobile (389 x 844 - iPhone 14 / modern standard mobile)
  await page.setViewport({ width: 389, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  console.log('Navigating to http://localhost:5175/journey on mobile (389x844)...');
  await page.goto('http://localhost:5175/journey', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Mobile Spotlight Top
  await page.screenshot({
    path: path.join(outputDir, 'journey_top1percent_01_spotlight_389px.png')
  });
  console.log('Captured journey_top1percent_01_spotlight_389px.png');

  // 2. Scroll to LeetCode
  await page.evaluate(() => {
    const el = document.querySelector('.leetcode-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(outputDir, 'journey_top1percent_02_leetcode_389px.png')
  });
  console.log('Captured journey_top1percent_02_leetcode_389px.png');

  // 3. Scroll to Achievements Timeline
  await page.evaluate(() => {
    const el = document.querySelector('.bottom-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(outputDir, 'journey_top1percent_03_timeline_untrapped_389px.png')
  });
  console.log('Captured journey_top1percent_03_timeline_untrapped_389px.png');

  // 4. Scroll to Bottom Safe Area
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(outputDir, 'journey_top1percent_04_bottom_safe_area_389px.png')
  });
  console.log('Captured journey_top1percent_04_bottom_safe_area_389px.png');

  // 5. Desktop Regression Check (1280 x 800)
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5, isMobile: false, hasTouch: false });
  await page.goto('http://localhost:5175/journey', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const el = document.querySelector('.journey-split-wrapper');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(outputDir, 'journey_top1percent_05_desktop_split_1280px.png')
  });
  console.log('Captured journey_top1percent_05_desktop_split_1280px.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
