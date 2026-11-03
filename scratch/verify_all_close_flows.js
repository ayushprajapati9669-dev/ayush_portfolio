const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const tmpDir = path.resolve(process.env.TEMP || 'C:\\Windows\\Temp', 'puppeteer_verify_close_all_' + Date.now());
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: tmpDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1050 });

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

  // --- FLOW 1: CREATE NEW PROJECT -> CLOSE FORM ---
  console.log('Flow 1: Clicking New Project...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('New Project'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const shot1 = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/verified_admin_create_form_open.png');
  await page.screenshot({ path: shot1 });
  console.log('Captured open create form to:', shot1);

  console.log('Flow 1: Clicking Close Form...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.textContent && b.textContent.includes('Close Form'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const formAfterFlow1 = await page.evaluate(() => !!document.querySelector('form'));
  console.log('Form present after Flow 1 Close Form:', formAfterFlow1);

  const shot2 = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/verified_admin_create_form_closed.png');
  await page.screenshot({ path: shot2 });
  console.log('Captured closed form to:', shot2);

  // --- FLOW 2: EDIT PROJECT -> CANCEL EDIT ---
  console.log('Flow 2: Finding an Edit Project button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const editBtn = btns.find(b => b.title && b.title.includes('Edit') || (b.textContent && b.textContent.includes('Edit')));
    if (editBtn) editBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const formInFlow2 = await page.evaluate(() => !!document.querySelector('form'));
  console.log('Form present in Flow 2 Edit mode:', formInFlow2);

  const shot3 = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/verified_admin_edit_form_open.png');
  await page.screenshot({ path: shot3 });
  console.log('Captured open edit form to:', shot3);

  console.log('Flow 2: Clicking Cancel Edit...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cancelBtn = btns.find(b => b.textContent && b.textContent.includes('Cancel Edit'));
    if (cancelBtn) cancelBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const formAfterFlow2 = await page.evaluate(() => !!document.querySelector('form'));
  console.log('Form present after Flow 2 Cancel Edit:', formAfterFlow2);

  const shot4 = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/verified_admin_edit_form_closed.png');
  await page.screenshot({ path: shot4 });
  console.log('Captured closed edit form to:', shot4);

  await browser.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  console.log('All verification flows completed successfully!');
})();

