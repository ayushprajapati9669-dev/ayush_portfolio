const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const tmpDir = path.resolve(process.env.TEMP || 'C:\\Windows\\Temp', 'puppeteer_verify_' + Date.now());
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: tmpDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  console.log('Navigating to http://localhost:5175/journey ...');
  await page.goto('http://localhost:5175/journey', { waitUntil: 'networkidle2', timeout: 30000 });

  // Scroll down to the LeetCode section
  await page.evaluate(() => {
    const el = document.querySelector('.leetcode-section');
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });

  // Wait 1.5 seconds for GSAP animations to settle
  await new Promise(r => setTimeout(r, 1500));

  const artifactPath = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/verified_leetcode_refined.png');
  
  const el = await page.$('.leetcode-section');
  if (el) {
    await el.screenshot({ path: artifactPath });
    console.log('Captured .leetcode-section screenshot to:', artifactPath);
  } else {
    await page.screenshot({ path: artifactPath, fullPage: false });
    console.log('Captured full viewport screenshot to:', artifactPath);
  }

  // Also capture the whole page view showing how it fits into the Journey layout
  const fullViewPath = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/verified_journey_overview_refined.png');
  await page.screenshot({ path: fullViewPath, fullPage: false });
  console.log('Captured page overview screenshot to:', fullViewPath);

  await browser.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  console.log('Verification finished successfully');
})();

