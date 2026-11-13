const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '..', 'audit_screenshots', 'nav_responsive');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const VIEWPORTS = [
  { name: '320p', width: 320, height: 568, label: '320px Ultra-compact' },
  { name: '360p', width: 360, height: 800, label: '360px Small Mobile' },
  { name: '375p', width: 375, height: 812, label: '375px Compact Mobile' },
  { name: '390p', width: 390, height: 844, label: '390px Standard Mobile' },
  { name: '430p', width: 430, height: 932, label: '430px Large Mobile' },
  { name: '768p', width: 768, height: 1024, label: '768px Portrait Tablet' },
  { name: '820p', width: 820, height: 1180, label: '820px iPad Air Tablet' },
  { name: '1024p', width: 1024, height: 1366, label: '1024px Large Tablet' },
  { name: '1366p', width: 1366, height: 768, label: '1366px Laptop' },
  { name: '1920p', width: 1920, height: 1080, label: '1920px Desktop' }
];

async function runAudit() {
  console.log('Starting Complete Navigation Responsiveness Audit...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const results = {
    public: [],
    admin: []
  };

  // -------------------------------------------------------------------------
  // 1. PUBLIC WEBSITE NAVIGATION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- 1. Testing Public Website Navigation ---');
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 600));

    const check = await page.evaluate((vpWidth) => {
      const docScrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;
      const hasHScroll = docScrollWidth > vpWidth + 1;

      const navWrapper = document.querySelector('.nav-wrapper');
      const navbar = document.querySelector('.navbar');
      const navCenter = document.querySelector('.nav-center');
      const toggle = document.querySelector('.mobile-nav-toggle');

      let navCenterVisible = false;
      if (navCenter) {
        const style = window.getComputedStyle(navCenter);
        navCenterVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }

      let toggleVisible = false;
      let toggleRect = null;
      if (toggle) {
        const style = window.getComputedStyle(toggle);
        const r = toggle.getBoundingClientRect();
        toggleVisible = style.display !== 'none' && style.visibility !== 'hidden' && r.width > 0;
        toggleRect = { left: r.left, right: r.right, width: r.width, height: r.height };
      }

      const navRect = navbar ? navbar.getBoundingClientRect() : null;

      return {
        docScrollWidth,
        bodyScrollWidth,
        hasHScroll,
        navCenterVisible,
        toggleVisible,
        toggleRect,
        navRight: navRect ? navRect.right : null
      };
    }, vp.width);

    // Test mobile drawer interaction on <= 1024px
    let drawerOpened = false;
    let drawerClosed = false;
    let drawerLinksCount = 0;

    if (vp.width <= 1024) {
      // Click hamburger
      await page.click('.mobile-nav-toggle');
      await new Promise(r => setTimeout(r, 400));

      const drawerState = await page.evaluate(() => {
        const drawer = document.querySelector('.mobile-drawer');
        const isOpen = drawer && drawer.classList.contains('open');
        const style = drawer ? window.getComputedStyle(drawer) : null;
        const links = drawer ? drawer.querySelectorAll('.mobile-drawer-link').length : 0;
        return {
          isOpen,
          opacity: style ? style.opacity : 0,
          pointerEvents: style ? style.pointerEvents : 'none',
          links
        };
      });

      drawerOpened = drawerState.isOpen && drawerState.opacity === '1';
      drawerLinksCount = drawerState.links;

      // Close drawer with Escape
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));

      const drawerAfterEsc = await page.evaluate(() => {
        const drawer = document.querySelector('.mobile-drawer');
        return drawer ? !drawer.classList.contains('open') : true;
      });
      drawerClosed = drawerAfterEsc;
    }

    const shotPath = path.join(screenshotDir, `public_${vp.name}.png`);
    await page.screenshot({ path: shotPath });

    const status = {
      viewport: vp.label,
      width: vp.width,
      hasHScroll: check.hasHScroll,
      docScrollWidth: check.docScrollWidth,
      navCenterVisible: check.navCenterVisible,
      toggleVisible: check.toggleVisible,
      drawerOpened: vp.width <= 1024 ? drawerOpened : 'N/A (Desktop)',
      drawerClosed: vp.width <= 1024 ? drawerClosed : 'N/A (Desktop)',
      drawerLinksCount,
      pass: !check.hasHScroll && (vp.width <= 1024 ? (!check.navCenterVisible && check.toggleVisible && drawerOpened && drawerClosed) : (check.navCenterVisible && !check.toggleVisible))
    };

    results.public.push(status);
    console.log(`[Public ${vp.name}] Pass: ${status.pass} | HScroll: ${check.hasHScroll} (${check.docScrollWidth}px / ${vp.width}px) | NavCenter: ${check.navCenterVisible} | Toggle: ${check.toggleVisible} | DrawerOpen/Close: ${drawerOpened}/${drawerClosed}`);
  }

  // -------------------------------------------------------------------------
  // 2. ADMIN CMS NAVIGATION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Testing Admin CMS Navigation ---');
  // First, log in as Admin
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Enter credentials
  const emailInput = await page.$('input[type="email"], input[placeholder*="email" i], input[placeholder*="username" i]');
  const passInput = await page.$('input[type="password"]');

  if (emailInput && passInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('ayushprajapati9669@gmail.com');
    await passInput.click({ clickCount: 3 });
    await passInput.type('Ayush7162@');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2000));
  }

  // Navigate to /admin
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    const check = await page.evaluate((vpWidth) => {
      const docScrollWidth = document.documentElement.scrollWidth;
      const hasHScroll = docScrollWidth > vpWidth + 1;

      const sidebar = document.querySelector('.admin-sidebar');
      const toggle = document.querySelector('.mobile-nav-toggle');
      const navCenter = document.querySelector('.nav-center');
      const firstCard = document.querySelector('.admin-content-area > *');

      let sidebarTransform = '';
      if (sidebar) {
        const style = window.getComputedStyle(sidebar);
        sidebarTransform = style.transform;
      }

      let toggleVisible = false;
      let toggleRect = null;
      if (toggle) {
        const style = window.getComputedStyle(toggle);
        const r = toggle.getBoundingClientRect();
        toggleVisible = style.display !== 'none' && r.width > 0 && r.right <= vpWidth;
        toggleRect = { left: r.left, right: r.right, width: r.width, height: r.height };
      }

      let navCenterVisible = false;
      if (navCenter) {
        const style = window.getComputedStyle(navCenter);
        navCenterVisible = style.display !== 'none' && style.visibility !== 'hidden';
      }

      const cardRect = firstCard ? firstCard.getBoundingClientRect() : null;

      return {
        docScrollWidth,
        hasHScroll,
        sidebarTransform,
        toggleVisible,
        toggleRect,
        navCenterVisible,
        cardTop: cardRect ? cardRect.top : null
      };
    }, vp.width);

    let drawerOpened = false;
    let drawerClosed = false;

    if (vp.width <= 1024) {
      // Click toggle in admin topbar
      const toggleBtn = await page.$('.mobile-nav-toggle');
      if (toggleBtn) {
        await toggleBtn.click();
        await new Promise(r => setTimeout(r, 400));

        const openState = await page.evaluate(() => {
          const sidebar = document.querySelector('.admin-sidebar');
          const backdrop = document.querySelector('.admin-sidebar-backdrop');
          const isMobileOpen = sidebar && sidebar.classList.contains('mobile-open');
          const hasBackdrop = Boolean(backdrop);
          return { isMobileOpen, hasBackdrop };
        });

        drawerOpened = openState.isMobileOpen && openState.hasBackdrop;

        // Click close button inside sidebar header
        const closeBtn = await page.$('.mobile-sidebar-close-btn');
        if (closeBtn) {
          await closeBtn.click();
          await new Promise(r => setTimeout(r, 400));
        } else {
          await page.keyboard.press('Escape');
          await new Promise(r => setTimeout(r, 400));
        }

        const closedState = await page.evaluate(() => {
          const sidebar = document.querySelector('.admin-sidebar');
          return sidebar ? !sidebar.classList.contains('mobile-open') : true;
        });
        drawerClosed = closedState;
      }
    }

    const shotPath = path.join(screenshotDir, `admin_${vp.name}.png`);
    await page.screenshot({ path: shotPath });

    const status = {
      viewport: vp.label,
      width: vp.width,
      hasHScroll: check.hasHScroll,
      docScrollWidth: check.docScrollWidth,
      navCenterVisible: check.navCenterVisible,
      toggleVisible: check.toggleVisible,
      drawerOpened: vp.width <= 1024 ? drawerOpened : 'N/A (Desktop)',
      drawerClosed: vp.width <= 1024 ? drawerClosed : 'N/A (Desktop)',
      cardTop: check.cardTop,
      pass: !check.hasHScroll && (vp.width <= 1024 ? (!check.navCenterVisible && check.toggleVisible && drawerOpened && drawerClosed && check.cardTop >= 70) : true)
    };

    results.admin.push(status);
    console.log(`[Admin ${vp.name}] Pass: ${status.pass} | HScroll: ${check.hasHScroll} (${check.docScrollWidth}px / ${vp.width}px) | Toggle: ${check.toggleVisible} | DrawerOpen/Close: ${drawerOpened}/${drawerClosed} | CardTop: ${check.cardTop}px`);
  }

  await browser.close();

  console.log('\n========================================');
  console.log('AUDIT COMPLETE: All results generated.');
  console.log('========================================');
  console.log(JSON.stringify(results, null, 2));
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});

