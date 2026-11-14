const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  
  // 1. Mobile Admin
  let page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  const userInput = await page.$('input[type="text"]');
  const passInput = await page.$('input[type="password"]');
  if (userInput && passInput) {
    await userInput.type('ayush');
    await passInput.type('Ayush7162@');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 1500));
  }
  await page.screenshot({ path: 'tests/admin_fixed_mobile.png', fullPage: true });
  await page.close();

  // 2. Tablet Admin
  page = await browser.newPage();
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'tests/admin_fixed_tablet.png', fullPage: true });
  await page.close();

  await browser.close();
  console.log('Admin screenshots captured!');
})();
