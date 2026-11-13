const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const dir = path.join(__dirname, '..', 'audit_evidence', 'comparison_screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // 1. Public Mobile 390px closed
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(dir, 'public_mobile_closed_390p.png') });

  // 2. Public Mobile 390px open drawer
  await page.click('.mobile-nav-toggle');
  await new Promise(r => setTimeout(r, 450));
  await page.screenshot({ path: path.join(dir, 'public_mobile_drawer_open_390p.png') });

  // 3. Admin login and view at 390px
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  const emailInput = await page.$('input[type="email"], input[placeholder*="email" i], input[placeholder*="username" i]');
  const passInput = await page.$('input[type="password"]');
  if (emailInput && passInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('ayushprajapati9669@gmail.com');
    await passInput.click({ clickCount: 3 });
    await passInput.type('Ayush7162@');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2000));
  }

  // Admin Mobile 390px closed
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(dir, 'admin_mobile_closed_390p.png') });

  // Admin Mobile 390px open drawer
  await page.click('.mobile-nav-toggle');
  await new Promise(r => setTimeout(r, 450));
  await page.screenshot({ path: path.join(dir, 'admin_mobile_sidebar_open_390p.png') });

  await browser.close();
  console.log('Comparison screenshots successfully saved to:', dir);
})();

