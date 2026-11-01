const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';
const BASE = 'http://localhost:5175';

async function shot(page, name, url, scrollY = 0, extraWait = 1200) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, extraWait));
  if (scrollY > 0) {
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await new Promise(r => setTimeout(r, 600));
  }
  const out = path.join(ARTIFACT_DIR, `audit_${name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved: ' + out);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 860 });

  // Public pages
  await shot(page, '01_home_hero', `${BASE}/`, 0);
  await shot(page, '02_home_bento', `${BASE}/`, 700);
  await shot(page, '03_home_projects', `${BASE}/`, 1800);
  await shot(page, '04_about', `${BASE}/about`, 0);
  await shot(page, '05_skills', `${BASE}/skills`, 0);
  await shot(page, '06_projects', `${BASE}/projects`, 0);
  await shot(page, '07_certs', `${BASE}/certificates`, 0);
  await shot(page, '08_contact', `${BASE}/contact`, 0);
  // Admin
  await shot(page, '09_admin_auth', `${BASE}/admin`, 0);

  await browser.close();
  console.log('ALL DONE');
})();

