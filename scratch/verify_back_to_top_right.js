const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function verify() {
  const outputDir = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/mobile_audit');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop Test (1280 x 800)
  console.log('Testing Desktop 1280x800...');
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Scroll down so Back to Top is active and footer is in view
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  // Type newsletter email and submit
  await page.type('.footer-newsletter-input', 'ayushprajapati9669@gmail.com');
  await page.click('.footer-newsletter-btn');
  console.log('Submitted newsletter form on desktop. Waiting for toast...');
  await new Promise(r => setTimeout(r, 700));

  await page.screenshot({
    path: path.join(outputDir, 'desktop_back_to_top_right_with_toast.png')
  });
  console.log('Captured desktop_back_to_top_right_with_toast.png');

  // 2. Mobile Test (389 x 844)
  console.log('Testing Mobile 389x844...');
  await page.setViewport({ width: 389, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Trigger touch and scroll down
  await page.touchscreen.tap(200, 300);
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));

  // Type newsletter email on mobile and submit
  await page.type('.footer-newsletter-input', 'testmobile@gmail.com');
  await page.click('.footer-newsletter-btn');
  console.log('Submitted newsletter form on mobile. Waiting for toast...');
  await new Promise(r => setTimeout(r, 700));

  await page.screenshot({
    path: path.join(outputDir, 'mobile_back_to_top_right_with_toast.png')
  });
  console.log('Captured mobile_back_to_top_right_with_toast.png');

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
