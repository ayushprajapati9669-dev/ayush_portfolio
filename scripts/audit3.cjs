const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';
const BASE = 'http://localhost:5175';

async function shot(page, name, extraWait = 1200) {
  await new Promise(r => setTimeout(r, extraWait));
  const out = path.join(ARTIFACT_DIR, `audit3_${name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved: ' + out);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 860 });

  // ── Projects page (after CSS fix) ─────────────────────────────────────────
  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await shot(page, '01_projects_fixed');

  // ── Projects page - scroll to see the cards ────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 500));
  await shot(page, '02_projects_cards', 500);

  // ── Certificates page  ─────────────────────────────────────────────────────
  await page.goto(`${BASE}/certificates`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));
  await shot(page, '03_certs_fixed');

  // ── Admin with cleared inputs ─────────────────────────────────────────────
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // Clear and fill username
  const emailInput = await page.$('input[type="text"], input[type="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('ayushprajapati9669@gmail.com');
  }

  // Clear and fill password
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await passInput.type('Admin@9669');
  }

  await shot(page, '04_admin_auth', 500);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3500));
  await shot(page, '05_admin_dashboard', 500);

  // Scroll admin a bit
  await page.evaluate(() => window.scrollTo(0, 400));
  await shot(page, '06_admin_scroll', 500);

  await browser.close();
  console.log('ALL DONE');
})();

