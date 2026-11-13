const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const evidenceDir = path.join(__dirname, '..', 'audit_evidence', 'nav_verification');
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

const VIEWPORTS = [
  { name: '320p', width: 320, height: 568, label: '320px Ultra-compact' },
  { name: '360p', width: 360, height: 800, label: '360px Small Mobile' },
  { name: '390p', width: 390, height: 844, label: '390px Standard Mobile' },
  { name: '430p', width: 430, height: 932, label: '430px Large Mobile' },
  { name: '768p', width: 768, height: 1024, label: '768px Portrait Tablet' },
  { name: '820p', width: 820, height: 1180, label: '820px iPad Air Tablet' },
  { name: '1024p', width: 1024, height: 1366, label: '1024px Large Tablet' },
  { name: '1366p', width: 1366, height: 768, label: '1366px Laptop Desktop' },
  { name: '1920p', width: 1920, height: 1080, label: '1920px Full HD Desktop' }
];

async function runIndependentAudit() {
  console.log('================================================================');
  console.log('RUNNING COMPREHENSIVE INDEPENDENT BROWSER VERIFICATION');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const report = {
    public: {
      behaviorTests: {},
      viewportTests: []
    },
    admin: {
      behaviorTests: {},
      viewportTests: []
    },
    consoleErrors: []
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text());
    }
  });

  // ---------------------------------------------------------------------------
  // 1. PUBLIC WEBSITE: BEHAVIORAL INTERACTION TESTS (390px)
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. Testing Public Website Navigation Behaviors (390px) ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  // 1.1 Hamburger menu opens and closes via toggle button
  await page.click('.mobile-nav-toggle');
  await new Promise((r) => setTimeout(r, 350));
  const open1 = await page.evaluate(() => {
    const d = document.querySelector('.mobile-drawer');
    return d && d.classList.contains('open') && window.getComputedStyle(d).opacity === '1';
  });
  const scrollLocked1 = await page.evaluate(() => document.body.style.overflow === 'hidden');

  await page.click('.mobile-drawer-close');
  await new Promise((r) => setTimeout(r, 350));
  const closed1 = await page.evaluate(() => {
    const d = document.querySelector('.mobile-drawer');
    return d && !d.classList.contains('open');
  });
  const scrollRestored1 = await page.evaluate(() => document.body.style.overflow === '');

  report.public.behaviorTests.toggleOpenClose = open1 && closed1;
  report.public.behaviorTests.scrollLock = scrollLocked1 && scrollRestored1;
  console.log(`- Toggle Open/Close: ${report.public.behaviorTests.toggleOpenClose ? 'PASS' : 'FAIL'}`);
  console.log(`- Scroll Lock & Restore: ${report.public.behaviorTests.scrollLock ? 'PASS' : 'FAIL'}`);

  // 1.2 Escape key closes the drawer
  await page.click('.mobile-nav-toggle');
  await new Promise((r) => setTimeout(r, 350));
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 350));
  const escClosed = await page.evaluate(() => {
    const d = document.querySelector('.mobile-drawer');
    return d && !d.classList.contains('open') && document.body.style.overflow === '';
  });
  report.public.behaviorTests.escapeKeyDismiss = escClosed;
  console.log(`- Escape Key Dismiss: ${escClosed ? 'PASS' : 'FAIL'}`);

  // 1.3 Selecting a navigation link closes drawer & navigates
  const linksToTest = [
    { name: 'About', path: '/about' },
    { name: 'Journey', path: '/journey' },
    { name: 'Skills', path: '/skills' },
    { name: 'Projects', path: '/projects' },
    { name: 'Certificates', path: '/certificates' },
    { name: 'Home', path: '/' }
  ];

  let allLinksWork = true;
  for (const l of linksToTest) {
    await page.click('.mobile-nav-toggle');
    await new Promise((r) => setTimeout(r, 350));

    // Click link inside drawer
    await page.evaluate((targetPath) => {
      const link = document.querySelector(`.mobile-drawer-link[href="${targetPath}"]`);
      if (link) link.click();
    }, l.path);

    await new Promise((r) => setTimeout(r, 600));

    const check = await page.evaluate((expectedPath) => {
      const d = document.querySelector('.mobile-drawer');
      const isDrawerClosed = d && !d.classList.contains('open');
      const isScrollRestored = document.body.style.overflow === '';
      const currentPath = window.location.pathname;
      return isDrawerClosed && isScrollRestored && (currentPath === expectedPath || currentPath === expectedPath + '/');
    }, l.path);

    if (!check) {
      allLinksWork = false;
      console.log(`  x Link test failed for ${l.name} (${l.path})`);
    } else {
      console.log(`  ✓ Link test passed for ${l.name} (${l.path})`);
    }
  }
  report.public.behaviorTests.allLinksWorkAndCloseDrawer = allLinksWork;
  console.log(`- All Nav Links Navigation & Auto-Close: ${allLinksWork ? 'PASS' : 'FAIL'}`);

  // ---------------------------------------------------------------------------
  // 2. PUBLIC WEBSITE: VIEWPORT AUDIT (320p to 1920p)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Public Website Viewport Audit (9 Viewports) ---');
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));

    const metrics = await page.evaluate((vpW) => {
      const docW = document.documentElement.scrollWidth;
      const bodyW = document.body.scrollWidth;
      const hScroll = docW > vpW + 1;

      const navCenter = document.querySelector('.nav-center');
      const toggle = document.querySelector('.mobile-nav-toggle');
      const navbar = document.querySelector('.navbar');

      const isNavCenterVisible = navCenter && getComputedStyle(navCenter).display !== 'none';
      const isToggleVisible = toggle && getComputedStyle(toggle).display !== 'none' && toggle.getBoundingClientRect().width > 0;
      const navRect = navbar ? navbar.getBoundingClientRect() : null;

      return {
        docW,
        hScroll,
        isNavCenterVisible,
        isToggleVisible,
        navRight: navRect ? navRect.right : null
      };
    }, vp.width);

    const isTabletOrMobile = vp.width <= 1024;
    const pass = !metrics.hScroll &&
      (isTabletOrMobile ? (!metrics.isNavCenterVisible && metrics.isToggleVisible) : (metrics.isNavCenterVisible && !metrics.isToggleVisible));

    const shotPath = path.join(evidenceDir, `final_public_${vp.name}.png`);
    await page.screenshot({ path: shotPath });

    report.public.viewportTests.push({
      viewport: vp.label,
      width: vp.width,
      hScroll: metrics.hScroll,
      scrollWidth: metrics.docW,
      navCenterVisible: metrics.isNavCenterVisible,
      toggleVisible: metrics.isToggleVisible,
      pass,
      screenshot: `final_public_${vp.name}.png`
    });

    console.log(`- [${vp.label}] Pass: ${pass ? 'PASS' : 'FAIL'} | HScroll: ${metrics.hScroll} (${metrics.docW}px/${vp.width}px) | NavCenter: ${metrics.isNavCenterVisible} | Toggle: ${metrics.isToggleVisible}`);
  }

  // ---------------------------------------------------------------------------
  // 3. ADMIN CMS: LOGIN & BEHAVIORAL INTERACTION TESTS (390px)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Testing Admin CMS Navigation Behaviors (390px) ---');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  const emailInput = await page.$('input[type="email"], input[placeholder*="email" i], input[placeholder*="username" i]');
  const passInput = await page.$('input[type="password"]');
  if (emailInput && passInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('ayushprajapati9669@gmail.com');
    await passInput.click({ clickCount: 3 });
    await passInput.type('Ayush7162@');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Set mobile viewport 390px
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));

  // 3.1 Mobile sidebar opens and closes via close button
  await page.click('.mobile-nav-toggle');
  await new Promise((r) => setTimeout(r, 400));
  const adminOpen1 = await page.evaluate(() => {
    const sb = document.querySelector('.admin-sidebar');
    const bd = document.querySelector('.admin-sidebar-backdrop');
    return sb && sb.classList.contains('mobile-open') && Boolean(bd);
  });
  const adminScrollLocked1 = await page.evaluate(() => document.body.style.overflow === 'hidden' && document.body.classList.contains('admin-sidebar-open'));

  // Click close button inside sidebar header
  await page.click('.mobile-sidebar-close-btn');
  await new Promise((r) => setTimeout(r, 400));
  const adminClosed1 = await page.evaluate(() => {
    const sb = document.querySelector('.admin-sidebar');
    const bd = document.querySelector('.admin-sidebar-backdrop');
    return sb && !sb.classList.contains('mobile-open') && !bd;
  });
  const adminScrollRestored1 = await page.evaluate(() => document.body.style.overflow === '' && !document.body.classList.contains('admin-sidebar-open'));

  report.admin.behaviorTests.toggleAndCloseBtn = adminOpen1 && adminClosed1;
  report.admin.behaviorTests.scrollLock = adminScrollLocked1 && adminScrollRestored1;
  console.log(`- Sidebar Open & Close Button: ${report.admin.behaviorTests.toggleAndCloseBtn ? 'PASS' : 'FAIL'}`);
  console.log(`- Scroll Lock & Body Class: ${report.admin.behaviorTests.scrollLock ? 'PASS' : 'FAIL'}`);

  // 3.2 Backdrop click dismisses sidebar
  await page.click('.mobile-nav-toggle');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('.admin-sidebar-backdrop');
  await new Promise((r) => setTimeout(r, 400));
  const backdropDismissed = await page.evaluate(() => {
    const sb = document.querySelector('.admin-sidebar');
    const bd = document.querySelector('.admin-sidebar-backdrop');
    return sb && !sb.classList.contains('mobile-open') && !bd && document.body.style.overflow === '';
  });
  report.admin.behaviorTests.backdropDismiss = backdropDismissed;
  console.log(`- Backdrop Click Dismiss: ${backdropDismissed ? 'PASS' : 'FAIL'}`);

  // 3.3 Escape key dismisses sidebar
  await page.click('.mobile-nav-toggle');
  await new Promise((r) => setTimeout(r, 400));
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 400));
  const escDismissed = await page.evaluate(() => {
    const sb = document.querySelector('.admin-sidebar');
    const bd = document.querySelector('.admin-sidebar-backdrop');
    return sb && !sb.classList.contains('mobile-open') && !bd && document.body.style.overflow === '';
  });
  report.admin.behaviorTests.escapeKeyDismiss = escDismissed;
  console.log(`- Escape Key Dismiss: ${escDismissed ? 'PASS' : 'FAIL'}`);

  // 3.4 Navigation selection closes sidebar & loads active tab
  const adminTabsToTest = [
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'profile', label: 'Profile & About' },
    { id: 'dashboard', label: 'Overview' }
  ];

  let allAdminTabsWork = true;
  for (const t of adminTabsToTest) {
    await page.click('.mobile-nav-toggle');
    await new Promise((r) => setTimeout(r, 400));

    // Click nav item
    await page.evaluate((tabId) => {
      const items = Array.from(document.querySelectorAll('.admin-sidebar .nav-item'));
      const item = items.find((el) => el.textContent.toLowerCase().includes(tabId));
      if (item) item.click();
    }, t.id === 'dashboard' ? 'overview' : t.id);

    await new Promise((r) => setTimeout(r, 600));

    const check = await page.evaluate((tabId) => {
      const sb = document.querySelector('.admin-sidebar');
      const isClosed = sb && !sb.classList.contains('mobile-open');
      const activeItem = document.querySelector('.admin-sidebar .nav-item.active');
      const activeText = activeItem ? activeItem.textContent.toLowerCase() : '';
      const isRestored = document.body.style.overflow === '';
      const match = activeText.includes(tabId === 'dashboard' ? 'overview' : tabId);
      return isClosed && isRestored && match;
    }, t.id);

    if (!check) {
      allAdminTabsWork = false;
      console.log(`  x Tab test failed for ${t.label}`);
    } else {
      console.log(`  ✓ Tab test passed for ${t.label}`);
    }
  }
  report.admin.behaviorTests.tabsNavigationAndAutoClose = allAdminTabsWork;
  console.log(`- Admin Tab Selection & Auto-Close: ${allAdminTabsWork ? 'PASS' : 'FAIL'}`);

  // ---------------------------------------------------------------------------
  // 4. ADMIN CMS: VIEWPORT AUDIT (320p to 1920p)
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Admin CMS Viewport Audit (9 Viewports) ---');
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const metrics = await page.evaluate((vpW) => {
      const docW = document.documentElement.scrollWidth;
      const hScroll = docW > vpW + 1;

      const sidebar = document.querySelector('.admin-sidebar');
      const toggle = document.querySelector('.mobile-nav-toggle');
      const navCenter = document.querySelector('.nav-center');
      const firstCard = document.querySelector('.admin-content-area > *');

      const isNavCenterVisible = navCenter && getComputedStyle(navCenter).display !== 'none';
      const isToggleVisible = toggle && getComputedStyle(toggle).display !== 'none' && toggle.getBoundingClientRect().width > 0;
      const cardRect = firstCard ? firstCard.getBoundingClientRect() : null;

      return {
        docW,
        hScroll,
        isNavCenterVisible,
        isToggleVisible,
        cardTop: cardRect ? cardRect.top : null
      };
    }, vp.width);

    const isTabletOrMobile = vp.width <= 1024;
    const pass = !metrics.hScroll &&
      (isTabletOrMobile ? (!metrics.isNavCenterVisible && metrics.isToggleVisible && metrics.cardTop >= 70) : (!metrics.isToggleVisible && metrics.cardTop >= 80));

    const shotPath = path.join(evidenceDir, `final_admin_${vp.name}.png`);
    await page.screenshot({ path: shotPath });

    report.admin.viewportTests.push({
      viewport: vp.label,
      width: vp.width,
      hScroll: metrics.hScroll,
      scrollWidth: metrics.docW,
      navCenterVisible: metrics.isNavCenterVisible,
      toggleVisible: metrics.isToggleVisible,
      cardTop: metrics.cardTop,
      pass,
      screenshot: `final_admin_${vp.name}.png`
    });

    console.log(`- [${vp.label}] Pass: ${pass ? 'PASS' : 'FAIL'} | HScroll: ${metrics.hScroll} (${metrics.docW}px/${vp.width}px) | Toggle: ${metrics.isToggleVisible} | CardTop: ${metrics.cardTop}px`);
  }

  await browser.close();

  // Save report to disk
  fs.writeFileSync(path.join(evidenceDir, 'audit_summary.json'), JSON.stringify(report, null, 2), 'utf8');

  console.log('\n================================================================');
  console.log('AUDIT FINISHED: 100% INDEPENDENT TESTING COMPLETE');
  console.log('================================================================');
}

runIndependentAudit().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});

