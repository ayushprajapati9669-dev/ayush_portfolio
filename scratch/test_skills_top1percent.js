const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/mobile_audit';
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

(async () => {
  console.log('Starting Skills Tab Top 1% Audit...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test Mobile Viewport (iPhone 12 Pro: 389x844)
  await page.setViewport({ width: 389, height: 844, isMobile: true, hasTouch: true });
  
  // Go to skills page
  let targetUrl = 'http://localhost:5175/skills';
  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 10000 });
  } catch (e) {
    targetUrl = 'http://localhost:5174/skills';
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 10000 });
  }

  // Force in-view for all layers
  await page.evaluate(() => {
    document.querySelectorAll('.flow-layer').forEach(el => el.classList.add('in'));
    document.querySelectorAll('.flow-link').forEach(el => el.classList.add('in'));
  });

  await new Promise(r => setTimeout(r, 800));

  // 1. Audit Category Chips
  const categoryChips = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.flow-category-chip')).map(chip => ({
      name: chip.querySelector('.cat-name')?.textContent?.trim() || '',
      count: chip.querySelector('.cat-count')?.textContent?.trim() || '',
      isActive: chip.classList.contains('active')
    }));
  });

  console.log('=== DYNAMIC CATEGORY CHIPS AUDIT ===', categoryChips);

  // Screenshot 1: Filter bar on mobile (389px)
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'skills_top1percent_01_filter_bar_389px.png'),
    fullPage: false
  });
  console.log('Saved skills_top1percent_01_filter_bar_389px.png');

  // Scroll down to 3-tier pipeline
  await page.evaluate(() => {
    const el = document.getElementById('flow-layer-frontend');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 2: 3-tier pipeline (Frontend, Backend, Connectors)
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'skills_top1percent_02_pipeline_389px.png'),
    fullPage: false
  });
  console.log('Saved skills_top1percent_02_pipeline_389px.png');

  // Scroll to Base Grid (Languages, Tools, Problem Solving)
  await page.evaluate(() => {
    const el = document.getElementById('flow-layer-languages');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 3: Base grid
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'skills_top1percent_03_base_grid_389px.png'),
    fullPage: false
  });
  console.log('Saved skills_top1percent_03_base_grid_389px.png');

  // Test Click on Category Chip (Backend)
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.flow-category-chip'));
    const backendChip = chips.find(c => c.textContent.includes('Backend'));
    if (backendChip) backendChip.click();
  });
  await new Promise(r => setTimeout(r, 700));

  const activeChipAfterClick = await page.evaluate(() => {
    const active = document.querySelector('.flow-category-chip.active');
    return active ? active.textContent.trim() : null;
  });
  console.log('Active chip after click:', activeChipAfterClick);

  // Test Search Filter
  await page.type('.flow-search-box input', 'React');
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 4: Search filter in action
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'skills_top1percent_05_search_filter_389px.png'),
    fullPage: false
  });
  console.log('Saved skills_top1percent_05_search_filter_389px.png');

  // Clear search
  await page.click('.flow-search-box button[aria-label="Clear search"]');
  await new Promise(r => setTimeout(r, 400));

  // Desktop Viewport (1280x850)
  await page.setViewport({ width: 1280, height: 850, isMobile: false, hasTouch: false });
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelectorAll('.flow-layer').forEach(el => el.classList.add('in'));
    document.querySelectorAll('.flow-link').forEach(el => el.classList.add('in'));
  });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot 5: Desktop overview
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'skills_top1percent_04_desktop_1280px.png'),
    fullPage: false
  });
  console.log('Saved skills_top1percent_04_desktop_1280px.png');

  await browser.close();
  console.log('Audit completed successfully!');
})();
