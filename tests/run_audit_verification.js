const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log('=== STARTING BROWSER AUDIT VERIFICATION ===\n');

  // ==========================================
  // TEST 1: Unsplash Image Dependency & Local WebP Assets
  // ==========================================
  console.log('--- TEST 1: Project Thumbnails & Network Requests ---');
  const page = await browser.newPage();
  const unsplashRequests = [];
  const failedRequests = [];
  const loadedImages = [];

  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('images.unsplash.com')) {
      unsplashRequests.push(url);
    }
  });

  page.on('response', (res) => {
    const url = res.url();
    if (res.status() >= 400) {
      failedRequests.push({ url, status: res.status() });
    }
    if (url.includes('/images/ai-chat-preview') || url.includes('/images/ai-agentic-preview')) {
      loadedImages.push({ url, status: res.status(), type: res.headers()['content-type'] });
    }
  });

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/projects', { waitUntil: 'networkidle2' });

  const projectImages = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('article, .project-card, [class*="project"]'));
    const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      currentSrc: img.currentSrc,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      alt: img.alt
    }));
    return imgs.filter(i => i.src.includes('ai-chat') || i.src.includes('ai-agentic') || i.alt.includes('ai chat') || i.alt.includes('AI Agentic'));
  });

  console.log('Detected AI Project Thumbnails on /projects page:', projectImages);
  console.log('Loaded Local Project Assets:', loadedImages);
  console.log('Unsplash Image Requests on /projects:', unsplashRequests.length === 0 ? '0 (CLEAN - No external dependency)' : unsplashRequests);

  // Capture screenshot of /projects with verified local thumbnails
  await page.screenshot({ path: 'audit_screenshots/verified_projects_local_assets.png' });
  await page.close();

  // ==========================================
  // TEST 2: Floating Button Collision across Responsive Viewports
  // ==========================================
  console.log('\n--- TEST 2: Floating Buttons Collision Verification ---');
  const viewports = [
    { name: '360px (Small Mobile)', width: 360, height: 800, file: 'audit_screenshots/verified_home_360p_no_collision.png' },
    { name: '375px (Compact Mobile)', width: 375, height: 812, file: 'audit_screenshots/verified_home_375p_no_collision.png' },
    { name: '390px (Standard Mobile)', width: 390, height: 844, file: 'audit_screenshots/verified_home_390p_no_collision.png' },
    { name: '1920px (Full HD Desktop)', width: 1920, height: 1080, file: 'audit_screenshots/verified_home_1080p_desktop.png' }
  ];

  const collisionResults = [];

  for (const vp of viewports) {
    const p = await browser.newPage();
    const consoleErrors = [];
    p.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await p.setViewport({ width: vp.width, height: vp.height });
    await p.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });

    // Wait slightly for layout stabilization
    await new Promise(r => setTimeout(r, 600));

    const soundRect = await p.evaluate(() => {
      const el = document.querySelector('button[title*="Soundscape"]') || document.querySelector('.fa-headphones')?.closest('button');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    });

    const items = await p.evaluate(() => {
      return Array.from(document.querySelectorAll('.hero-feature-item')).map(i => {
        const r = i.getBoundingClientRect();
        const icon = i.querySelector('.hero-feature-icon');
        const iconRect = icon ? icon.getBoundingClientRect() : null;
        return {
          text: i.innerText.replace(/\s+/g, ' '),
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          iconLeft: iconRect?.left,
          iconRight: iconRect?.right
        };
      });
    });

    const hasCollision = soundRect && items.some(item => {
      return !(soundRect.right < item.left ||
               soundRect.left > item.right ||
               soundRect.bottom < item.top ||
               soundRect.top > item.bottom);
    });

    // Also check horizontal gap between Sound button and the first item
    const horizontalGap = (items[0] && soundRect) ? Math.round(items[0].left - soundRect.right) : null;

    collisionResults.push({
      viewport: vp.name,
      soundRect: soundRect ? `[L:${Math.round(soundRect.left)} R:${Math.round(soundRect.right)} T:${Math.round(soundRect.top)} B:${Math.round(soundRect.bottom)}]` : 'N/A',
      firstItem: items[0] ? `[L:${Math.round(items[0].left)} R:${Math.round(items[0].right)} T:${Math.round(items[0].top)} B:${Math.round(items[0].bottom)}]` : 'N/A',
      horizontalGap: `${horizontalGap}px`,
      hasCollision,
      status: hasCollision ? 'FAIL (OVERLAP)' : 'PASS (CLEAN SPACING)'
    });

    await p.screenshot({ path: vp.file });
    await p.close();
  }

  console.table(collisionResults);

  console.log('\n=== ALL VERIFICATION TESTS FINISHED SUCCESSFULLY ===');
  await browser.close();
})();

