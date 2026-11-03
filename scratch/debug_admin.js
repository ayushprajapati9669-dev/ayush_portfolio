const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const tmpDir = path.resolve(process.env.TEMP || 'C:\\Windows\\Temp', 'puppeteer_debug_' + Date.now());
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: tmpDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1050 });

  await page.goto('http://localhost:5175/admin?tab=projects', { waitUntil: 'networkidle2' });
  const userInput = await page.$('input[placeholder="ayushprajapati9669@gmail.com"]');
  if (userInput) {
    await userInput.type('ayushprajapati9669@gmail.com');
    const passInput = await page.$('input[placeholder="Enter your master password"]');
    await passInput.type('admin123');
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 3000));
  }

  const debugShot = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/admin_debug_page.png');
  await page.screenshot({ path: debugShot, fullPage: false });
  console.log('Saved debug screenshot to:', debugShot);

  const textContent = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('Page text excerpt:', textContent);

  await browser.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
})();

