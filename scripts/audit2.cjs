const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';
const BASE = 'http://localhost:5175';

async function shot(page, name, extraWait = 1500) {
  await new Promise(r => setTimeout(r, extraWait));
  const out = path.join(ARTIFACT_DIR, `audit2_${name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved: ' + out);
  return out;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 860 });

  // ── Contact page (after CSS fix) ──────────────────────────────────────────
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle2', timeout: 30000 });
  await shot(page, '01_contact');

  // ── Projects page (after CSS fix) ─────────────────────────────────────────
  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle2', timeout: 30000 });
  await shot(page, '02_projects');

  // ── Certs page (scroll down a bit to see cards) ───────────────────────────
  await page.goto(`${BASE}/certificates`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await shot(page, '03_certs');

  // ── Admin: sign in ────────────────────────────────────────────────────────
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  
  // Fill credentials
  await page.type('input[type="text"], input[type="email"]', 'ayushprajapati9669@gmail.com');
  await page.type('input[type="password"]', 'Admin@9669');
  await shot(page, '04_admin_auth_filled');
  
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2500));
  await shot(page, '05_admin_dashboard', 500);

  // ── Admin scroll to see more ──────────────────────────────────────────────
  await page.evaluate(() => window.scrollTo(0, 400));
  await shot(page, '06_admin_dashboard_scroll', 500);

  await browser.close();
  console.log('ALL DONE');
})();

