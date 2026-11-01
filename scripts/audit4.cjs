const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';
const BASE = 'http://localhost:5175';

async function shot(page, name, extraWait = 1800) {
  await new Promise(r => setTimeout(r, extraWait));
  const out = path.join(ARTIFACT_DIR, `audit4_${name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved: ' + out);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 860 });

  // Projects top
  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle2', timeout: 30000 });
  await shot(page, '01_projects_top');

  // Projects scrolled to cards
  await page.evaluate(() => window.scrollTo(0, 400));
  await shot(page, '02_projects_cards', 600);

  // Certs
  await page.goto(`${BASE}/certificates`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));
  await page.evaluate(() => window.scrollTo(0, 200));
  await shot(page, '03_certs', 600);

  // About page scrolled
  await page.goto(`${BASE}/about`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await shot(page, '04_about', 600);

  await browser.close();
  console.log('ALL DONE');
})();

