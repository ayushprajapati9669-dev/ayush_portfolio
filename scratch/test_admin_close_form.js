const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const tmpDir = path.resolve(process.env.TEMP || 'C:\\Windows\\Temp', 'puppeteer_admin_close_' + Date.now());
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: tmpDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1050 });

  // Pre-seed correct session in sessionStorage
  await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const sessionData = {
      username: 'Ayush Prajapati',
      role: 'admin',
      token: 'jwt_authorized_test',
      exp: Date.now() + 86400000,
      csrfToken: 'jwt_csrf_test'
    };
    sessionStorage.setItem('ayush_modern_portfolio_admin_session_v4', JSON.stringify(sessionData));
  });

  console.log('Navigating to http://localhost:5175/admin?tab=projects ...');
  await page.goto('http://localhost:5175/admin?tab=projects', { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, 1200));

  // Verify we are logged into Admin
  const pageTitle = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('Page header text:', pageTitle.replace(/\n+/g, ' '));

  // Find and click "+ New Project" button
  console.log('Finding New Project button...');
  const newProjBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && b.textContent.includes('New Project'));
  });

  if (!newProjBtn || !newProjBtn.asElement()) {
    throw new Error('Could not find New Project button');
  }

  console.log('Clicking New Project button...');
  await newProjBtn.asElement().click();
  await new Promise(r => setTimeout(r, 600));

  // Verify form is open
  const formElement = await page.$('form');
  console.log('Form is open:', !!formElement);
  if (!formElement) {
    throw new Error('Form did not open when clicking New Project button');
  }

  const shot1 = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/admin_project_form_opened.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Captured opened form screenshot to:', shot1);

  // Find Close Form button
  console.log('Finding Close Form button...');
  const closeBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent && b.textContent.includes('Close Form'));
  });

  if (!closeBtn || !closeBtn.asElement()) {
    throw new Error('Could not find Close Form button');
  }

  console.log('Clicking Close Form button...');
  await closeBtn.asElement().click();
  await new Promise(r => setTimeout(r, 600));

  // Verify form is closed
  const formAfterClose = await page.$('form');
  console.log('Form still in DOM after clicking Close Form?:', !!formAfterClose);

  const shot2 = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/admin_project_form_closed.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log('Captured closed form screenshot to:', shot2);

  if (formAfterClose) {
    console.error('FAILURE: Form did NOT close!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Form closed properly!');
  }

  await browser.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
})();
