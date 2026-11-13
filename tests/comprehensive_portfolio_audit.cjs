const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const evidenceDir = path.join(__dirname, '..', 'audit_evidence', 'comprehensive_ui_audit');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

const VIEWPORTS = [
  { name: '320p', width: 320, height: 640, device: 'Mobile S (320px)' },
  { name: '360p', width: 360, height: 800, device: 'Mobile Base (360px)' },
  { name: '375p', width: 375, height: 812, device: 'iPhone SE/Mini (375px)' },
  { name: '390p', width: 390, height: 844, device: 'iPhone 12/13/14 (390px)' },
  { name: '430p', width: 430, height: 932, device: 'iPhone Pro Max (430px)' },
  { name: '768p', width: 768, height: 1024, device: 'iPad Portrait (768px)' },
  { name: '820p', width: 820, height: 1180, device: 'iPad Air (820px)' },
  { name: '1024p', width: 1024, height: 1366, device: 'iPad Pro / Laptop (1024px)' },
  { name: '1366p', width: 1366, height: 768, device: 'Desktop Standard (1366px)' },
  { name: '1920p', width: 1920, height: 1080, device: 'Desktop Full HD (1920px)' },
];

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('STARTING COMPREHENSIVE PORTFOLIO UI/UX AUDIT (AUDIT ONLY)');
  console.log('================================================================');

  const consoleLogs = [];
  const networkFailures = [];
  const httpErrors = [];

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      consoleLogs.push({ type, text, location: msg.location() });
    }
  });

  page.on('requestfailed', req => {
    networkFailures.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure() ? req.failure().errorText : 'Unknown'
    });
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      httpErrors.push({
        url: res.url(),
        status: res.status(),
        statusText: res.statusText()
      });
    }
  });

  const auditReport = {
    timestamp: new Date().toISOString(),
    viewportsTested: VIEWPORTS.map(v => v.width),
    publicSite: {
      viewportMetrics: {},
      sections: {},
      overlays: {},
      images: {},
      accessibility: {}
    },
    publicRoutes: {},
    adminCMS: {
      viewportMetrics: {},
      tabs: {},
      interactions: {}
    },
    projectDetail: {},
    notFoundPage: {},
    consoleSummary: { errors: [], warnings: [] },
    networkSummary: { failedRequests: [], httpErrors: [] },
    issues: []
  };

  // ---------------------------------------------------------------------------
  // STEP 1: AUTHENTICATE FOR ADMIN AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n[1/6] Authenticating Admin Session...');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await passInput.type('Ayush7162@');
    const submitBtn = await page.$('button.btn-save, button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  const adminPageTitle = await page.title();
  const isAdminAuthenticated = await page.evaluate(() => {
    return Boolean(document.querySelector('.admin-layout') || document.querySelector('.admin-sidebar') || document.querySelector('.admin-main-content'));
  });
  console.log(`Admin Authenticated: ${isAdminAuthenticated ? 'YES' : 'NO'} (Title: "${adminPageTitle}")`);

  // ---------------------------------------------------------------------------
  // STEP 2: MULTI-VIEWPORT PUBLIC HOME PAGE AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n[2/6] Auditing Public Website Across 10 Viewports...');
  for (const vp of VIEWPORTS) {
    console.log(`\n--> Testing Public Site at ${vp.name} (${vp.width}x${vp.height} - ${vp.device})`);
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    // Measure page dimensions & overflow
    const pageMetrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const clientWidth = document.documentElement.clientWidth;
      const bodyScrollWidth = document.body.scrollWidth;
      const hasHScroll = scrollWidth > innerWidth + 1 || bodyScrollWidth > innerWidth + 1;

      // Find overflowing elements if any
      const overflowingElements = [];
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > innerWidth + 2 && rect.width < innerWidth * 3) {
          overflowingElements.push({
            tag: el.tagName.toLowerCase(),
            class: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
            id: el.id || '',
            rectRight: Math.round(rect.right),
            viewportWidth: innerWidth
          });
          if (overflowingElements.length >= 5) break;
        }
      }

      // Check header bounds
      const navWrapper = document.querySelector('.nav-wrapper');
      const navRect = navWrapper ? navWrapper.getBoundingClientRect() : null;

      // Check floating audio trigger bounds
      const audioTrigger = document.querySelector('.soundscape-trigger') || document.querySelector('[data-action="soundscape-toggle"]');
      const audioRect = audioTrigger ? audioTrigger.getBoundingClientRect() : null;

      return {
        scrollWidth,
        innerWidth,
        clientWidth,
        bodyScrollWidth,
        hasHScroll,
        overflowingElements,
        navRect: navRect ? { left: Math.round(navRect.left), right: Math.round(navRect.right), width: Math.round(navRect.width) } : null,
        audioRect: audioRect ? { left: Math.round(audioRect.left), right: Math.round(audioRect.right), bottom: Math.round(audioRect.bottom) } : null
      };
    });

    auditReport.publicSite.viewportMetrics[vp.name] = pageMetrics;
    console.log(`    ScrollWidth: ${pageMetrics.scrollWidth}px / Viewport: ${vp.width}px | Horizontal Overflow: ${pageMetrics.hasHScroll ? 'FAIL (' + (pageMetrics.scrollWidth - vp.width) + 'px)' : 'PASS (0px)'}`);

    // Capture screenshot
    await page.screenshot({ path: path.join(evidenceDir, `public_home_${vp.name}.png`), fullPage: false });

    // Inspect Public Sections on 390p and 1366p
    if (vp.name === '390p' || vp.name === '1366p') {
      const sectionsStatus = await page.evaluate(() => {
        const sections = ['hero', 'about', 'journey', 'skills', 'projects', 'certificates', 'guestbook', 'contact'];
        const results = {};
        for (const sec of sections) {
          const el = document.getElementById(sec) || document.querySelector(`.${sec}-section`) || document.querySelector(`[data-section="${sec}"]`);
          if (el) {
            const rect = el.getBoundingClientRect();
            results[sec] = {
              exists: true,
              visible: rect.height > 0 && rect.width > 0,
              top: Math.round(rect.top),
              height: Math.round(rect.height),
              width: Math.round(rect.width)
            };
          } else {
            results[sec] = { exists: false };
          }
        }
        return results;
      });
      auditReport.publicSite.sections[vp.name] = sectionsStatus;
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 3: PUBLIC SUB-PAGES & PROJECT DETAIL AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n[3/6] Auditing Public Sub-Pages & Detail Views...');
  const publicRoutesToTest = [
    { route: '/about', name: 'About' },
    { route: '/journey', name: 'Journey' },
    { route: '/skills', name: 'Skills' },
    { route: '/projects', name: 'Projects' },
    { route: '/projects/ai-agentic-workspace', name: 'ProjectDetail' },
    { route: '/certificates', name: 'Certificates' },
    { route: '/contact', name: 'Contact' },
    { route: '/non-existent-route-audit', name: 'NotFound' }
  ];

  for (const item of publicRoutesToTest) {
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(`http://localhost:5174${item.route}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const state1366 = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
      heading: document.querySelector('h1, h2')?.innerText || ''
    }));

    await page.screenshot({ path: path.join(evidenceDir, `route_${item.name}_1366p.png`) });

    // Mobile 390p check
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 500));
    const state390 = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      hasHScroll: document.documentElement.scrollWidth > window.innerWidth
    }));
    await page.screenshot({ path: path.join(evidenceDir, `route_${item.name}_390p.png`) });

    auditReport.publicRoutes[item.name] = {
      route: item.route,
      desktop: state1366,
      mobile: state390
    };
    console.log(`    Route [${item.name} (${item.route})]: Desktop Overflow: ${state1366.hasHScroll ? 'FAIL' : 'PASS'} | Mobile Overflow: ${state390.hasHScroll ? 'FAIL' : 'PASS'}`);
  }

  // ---------------------------------------------------------------------------
  // STEP 4: INTERACTIVE MODALS, DRAWERS & ASSETS AUDIT
  // ---------------------------------------------------------------------------
  console.log('\n[4/6] Auditing Interactive Modals, Drawers & Assets...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // 4.1 Mobile Drawer
  const mobileToggle = await page.$('.mobile-nav-toggle');
  if (mobileToggle) {
    await mobileToggle.click();
    await new Promise(r => setTimeout(r, 450));
    const drawerState = await page.evaluate(() => {
      const drawer = document.querySelector('.mobile-drawer');
      return {
        open: drawer && drawer.classList.contains('open'),
        ariaRole: drawer?.getAttribute('role'),
        ariaModal: drawer?.getAttribute('aria-modal'),
        bodyOverflow: document.body.style.overflow
      };
    });
    auditReport.publicSite.overlays.mobileDrawer = drawerState;
    await page.screenshot({ path: path.join(evidenceDir, 'overlay_mobile_drawer.png') });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  }

  // 4.2 Resume Modal
  const resumeOpened = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const btn = btns.find(b => b.innerText && b.innerText.toLowerCase().includes('resume'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (resumeOpened) {
    await new Promise(r => setTimeout(r, 500));
    const resumeState = await page.evaluate(() => {
      const modal = document.querySelector('.resume-modal-container') || document.querySelector('.resume-modal-box');
      return {
        isOpen: Boolean(modal),
        bodyOverflow: document.body.style.overflow
      };
    });
    auditReport.publicSite.overlays.resumeModal = resumeState;
    await page.screenshot({ path: path.join(evidenceDir, 'overlay_resume_modal.png') });
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  }

  // 4.3 Soundscape Studio
  const soundOpened = await page.evaluate(() => {
    const trigger = document.querySelector('.soundscape-trigger') || document.querySelector('[data-action="soundscape-toggle"]');
    if (trigger) {
      trigger.click();
      return true;
    }
    return false;
  });
  if (soundOpened) {
    await new Promise(r => setTimeout(r, 500));
    const soundState = await page.evaluate(() => {
      const panel = document.querySelector('.soundscape-studio') || document.querySelector('.soundscape-panel') || document.querySelector('[data-panel="soundscape"]');
      return {
        isOpen: Boolean(panel),
        rect: panel ? panel.getBoundingClientRect() : null
      };
    });
    auditReport.publicSite.overlays.soundscape = soundState;
    await page.screenshot({ path: path.join(evidenceDir, 'overlay_soundscape_studio.png') });
    // Toggle close
    await page.evaluate(() => {
      const trigger = document.querySelector('.soundscape-trigger') || document.querySelector('[data-action="soundscape-toggle"]');
      if (trigger) trigger.click();
    });
    await new Promise(r => setTimeout(r, 400));
  }

  // 4.4 Image Asset Scan
  console.log('Auditing Image Assets & Natural Dimensions...');
  const imageHealth = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({
      src: img.src.slice(0, 120),
      alt: img.alt || '',
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      isBroken: img.naturalWidth === 0 && img.src !== ''
    }));
  });
  const brokenImages = imageHealth.filter(img => img.isBroken);
  auditReport.publicSite.images = {
    totalImages: imageHealth.length,
    brokenCount: brokenImages.length,
    brokenImages
  };
  console.log(`Image Health: Scanned ${imageHealth.length} images; Broken: ${brokenImages.length}`);

  // ---------------------------------------------------------------------------
  // STEP 5: MULTI-VIEWPORT ADMIN CMS AUDIT & TAB INSPECTION
  // ---------------------------------------------------------------------------
  console.log('\n[5/6] Auditing Admin CMS Across Viewports & Tabs...');
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const adminMetrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const hasHScroll = scrollWidth > innerWidth + 1;
      const sidebar = document.querySelector('.admin-sidebar');
      const mobileToggle = document.querySelector('.mobile-nav-toggle');

      return {
        scrollWidth,
        innerWidth,
        hasHScroll,
        sidebarVisible: Boolean(sidebar && window.getComputedStyle(sidebar).display !== 'none'),
        mobileToggleVisible: Boolean(mobileToggle && window.getComputedStyle(mobileToggle).display !== 'none')
      };
    });

    auditReport.adminCMS.viewportMetrics[vp.name] = adminMetrics;
    console.log(`    Admin at ${vp.name} (${vp.width}px): ScrollWidth: ${adminMetrics.scrollWidth}px | Overflow: ${adminMetrics.hasHScroll ? 'FAIL' : 'PASS'}`);

    if (['320p', '360p', '390p', '768p', '1024p', '1366p'].includes(vp.name)) {
      await page.screenshot({ path: path.join(evidenceDir, `admin_dashboard_${vp.name}.png`), fullPage: false });
    }
  }

  // Admin CMS Sub-Tabs on Desktop (1366p)
  console.log('Auditing Admin CMS Tabs on Desktop...');
  await page.setViewport({ width: 1366, height: 768 });
  const adminTabs = [
    { tab: 'overview', url: 'http://localhost:5174/admin' },
    { tab: 'projects', url: 'http://localhost:5174/admin?tab=projects' },
    { tab: 'skills', url: 'http://localhost:5174/admin?tab=skills' },
    { tab: 'certificates', url: 'http://localhost:5174/admin?tab=certificates' },
    { tab: 'milestones', url: 'http://localhost:5174/admin?tab=milestones' },
    { tab: 'profile', url: 'http://localhost:5174/admin?tab=profile' },
    { tab: 'media', url: 'http://localhost:5174/admin?tab=media' },
    { tab: 'messages', url: 'http://localhost:5174/admin?tab=messages' },
    { tab: 'security', url: 'http://localhost:5174/admin?tab=security' },
    { tab: 'guide', url: 'http://localhost:5174/admin/guide' },
    { tab: 'api-docs', url: 'http://localhost:5174/admin/api-docs' }
  ];

  for (const t of adminTabs) {
    await page.goto(t.url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const tabState = await page.evaluate(() => {
      return {
        heading: document.querySelector('h1, h2, h3')?.innerText || '',
        scrollWidth: document.documentElement.scrollWidth,
        hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
        cardsCount: document.querySelectorAll('.glass-card-admin, .rounded-2xl, .rounded-3xl').length
      };
    });

    auditReport.adminCMS.tabs[t.tab] = tabState;
    await page.screenshot({ path: path.join(evidenceDir, `admin_tab_${t.tab}.png`) });
    console.log(`    Admin Tab [${t.tab}]: Heading: "${tabState.heading.slice(0, 30)}" | Cards: ${tabState.cardsCount} | Overflow: ${tabState.hasHScroll ? 'FAIL' : 'PASS'}`);
  }

  // ---------------------------------------------------------------------------
  // STEP 6: COMPILE CONSOLE LOGS & SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n[6/6] Finalizing Audit Findings...');
  auditReport.consoleSummary.errors = consoleLogs.filter(l => l.type === 'error').slice(0, 20);
  auditReport.consoleSummary.warnings = consoleLogs.filter(l => l.type === 'warning').slice(0, 20);
  auditReport.networkSummary.failedRequests = networkFailures.slice(0, 20);
  auditReport.networkSummary.httpErrors = httpErrors.slice(0, 20);

  fs.writeFileSync(path.join(evidenceDir, 'audit_results.json'), JSON.stringify(auditReport, null, 2), 'utf8');

  await browser.close();

  console.log('================================================================');
  console.log('COMPREHENSIVE AUDIT COMPLETE. EVIDENCE RECORDED.');
  console.log('================================================================');
}

runComprehensiveAudit().catch(err => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
