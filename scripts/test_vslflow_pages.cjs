const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';
const BASE = 'http://localhost:5175';

async function shot(page, name, extraWait = 1000) {
  await new Promise(r => setTimeout(r, extraWait));
  const out = path.join(ARTIFACT_DIR, `vslflow_${name}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log('Saved: ' + out);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. About page (Top)
  console.log('Testing About page...');
  await page.goto(`${BASE}/about`, { waitUntil: 'networkidle2', timeout: 30000 });
  await shot(page, '10_about_top');

  // 1b. About page (Bottom)
  await page.evaluate(() => window.scrollTo(0, 500));
  await shot(page, '11_about_bottom');

  // 2. Certificates page
  console.log('Testing Certificates page...');
  await page.goto(`${BASE}/certificates`, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => window.scrollTo(0, 250));
  await shot(page, '12_certificates_grid');

  // 3. Admin Login & Dashboard
  console.log('Testing Admin login...');
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));

  // Clear username
  const userInput = await page.$('input[type="text"], input[type="email"]');
  if (userInput) {
    await userInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await userInput.type('ayushprajapati9669@gmail.com');
  }

  // Clear password
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await passInput.type('admin123');
  }

  await shot(page, '13_admin_login_filled');

  // Click Submit
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  await shot(page, '14_admin_dashboard_overview');

  // Navigate to Admin Projects
  const projectsTab = await page.$('button[data-tab="projects"], a[href*="tab=projects"]');
  if (projectsTab) {
    await projectsTab.click();
    await new Promise(r => setTimeout(r, 1000));
    await shot(page, '15_admin_projects_tab');
  } else {
    await page.goto(`${BASE}/admin?tab=projects`, { waitUntil: 'networkidle2', timeout: 30000 });
    await shot(page, '15_admin_projects_tab');
  }

  await browser.close();
  console.log('Audit complete!');
})();

