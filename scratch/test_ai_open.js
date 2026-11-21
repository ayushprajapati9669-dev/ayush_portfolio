const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.click('button[aria-label="Open Ask Ayush AI Assistant"]');
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: 'C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/mobile_audit/desktop_ask_ai_opened.png' });
  await browser.close();
  console.log('Captured desktop ask ai opened');
})();
