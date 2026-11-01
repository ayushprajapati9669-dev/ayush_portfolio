const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';
const BASE = 'http://localhost:5175';

async function shot(page, name, extraWait = 1000) {
  await new Promise(r => setTimeout(r, extraWait));
  const out = path.join(ARTIFACT_DIR, `final_${name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log('Saved: ' + out);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. About Page Top & Spotlight
  console.log('1. Auditing About page...');
  await page.goto(`${BASE}/about`, { waitUntil: 'networkidle2', timeout: 30000 });
  await shot(page, '01_about_top');

  await page.evaluate(() => window.scrollTo(0, 480));
  await shot(page, '02_about_spotlight');

  await page.evaluate(() => window.scrollTo(0, 1100));
  await shot(page, '03_about_bottom');

  // 2. Certificates Page
  console.log('2. Auditing Certificates page...');
  await page.goto(`${BASE}/certificates`, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 380));
  await shot(page, '04_certificates_cards');

  // 3. Admin Login & Dashboard
  console.log('3. Auditing Admin Dashboard...');
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 600));

  // Set input values cleanly via React dispatchEvent
  await page.evaluate(() => {
    const user = document.querySelector('input[type="text"], input[type="email"]');
    const pass = document.querySelector('input[type="password"]');
    if (user) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(user, 'ayushprajapati9669@gmail.com');
      user.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (pass) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(pass, 'admin123');
      pass.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await shot(page, '05_admin_login_filled');

  // Click submit
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2200));

  // Screenshot Admin Dashboard
  await shot(page, '06_admin_dashboard_overview');

  // Click Projects Tab in Admin
  await page.goto(`${BASE}/admin?tab=projects`, { waitUntil: 'networkidle2', timeout: 30000 });
  await shot(page, '07_admin_projects_cms');

  // Click Certificates Tab in Admin
  await page.goto(`${BASE}/admin?tab=certificates`, { waitUntil: 'networkidle2', timeout: 30000 });
  await shot(page, '08_admin_certificates_cms');

  await browser.close();
  console.log('Final audit complete!');
})();
