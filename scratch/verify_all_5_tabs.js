const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const tabs = [
  { url: 'http://localhost:5175/journey', name: 'verified_journey_fonts.png' },
  { url: 'http://localhost:5175/skills', name: 'verified_skills_fonts.png' },
  { url: 'http://localhost:5175/projects', name: 'verified_projects_fonts.png' },
  { url: 'http://localhost:5175/certificates', name: 'verified_certificates_fonts.png' },
  { url: 'http://localhost:5175/contact', name: 'verified_contact_fonts.png' }
];

(async () => {
  const tmpDir = path.resolve(process.env.TEMP || 'C:\\Windows\\Temp', 'puppeteer_tabs_' + Date.now());
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: tmpDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1050 });

  for (const tab of tabs) {
    console.log(`Navigating to ${tab.url} ...`);
    try {
      await page.goto(tab.url, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 1000));
      const outPath = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb', tab.name);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved screenshot: ${tab.name}`);
    } catch (err) {
      console.error(`Error on ${tab.url}:`, err.message);
    }
  }

  await browser.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  console.log('All 5 tabs screenshot verification finished');
})();

