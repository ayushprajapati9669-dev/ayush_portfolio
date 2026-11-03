const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const tmpDir = path.resolve(process.env.TEMP || 'C:\\Windows\\Temp', 'puppeteer_debug_click_' + Date.now());
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: tmpDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1050 });

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

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
  await page.goto('http://localhost:5175/admin?tab=projects', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Find and click "+ New Project" button
  console.log('Finding New Project button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('New Project'));
    if (btn) btn.click();
    else console.error('Could not find New Project button in page');
  });

  await new Promise(r => setTimeout(r, 800));

  console.log('Checking form presence...');
  const formPresent = await page.evaluate(() => !!document.querySelector('form'));
  console.log('Form present before close click:', formPresent);

  console.log('Attempting to click Close Form button...');
  const clickResult = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.textContent && b.textContent.includes('Close Form'));
    if (!closeBtn) return 'Close button not found';
    closeBtn.click();
    return 'Clicked Close Form button';
  });
  console.log('Click result:', clickResult);

  await new Promise(r => setTimeout(r, 1000));

  const formPresentAfter = await page.evaluate(() => !!document.querySelector('form'));
  console.log('Form present AFTER close click:', formPresentAfter);

  const innerHTMLOfForm = await page.evaluate(() => {
    const f = document.querySelector('form');
    return f ? f.innerHTML.substring(0, 300) : 'None';
  });
  console.log('Form innerHTML sample:', innerHTMLOfForm);

  await browser.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
})();

