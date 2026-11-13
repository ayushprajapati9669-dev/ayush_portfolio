const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const targetEvidenceDir = path.join(__dirname, '..', 'audit_evidence', 'targeted_nav_audit');
if (!fs.existsSync(targetEvidenceDir)) {
  fs.mkdirSync(targetEvidenceDir, { recursive: true });
}

const TEST_VIEWPORTS = [
  { name: '390p', width: 390, height: 844, label: '390px Standard Mobile' },
  { name: '768p', width: 768, height: 1024, label: '768px Portrait Tablet' },
  { name: '1366p', width: 1366, height: 768, label: '1366px Desktop Laptop' }
];

async function runTargetedAudit() {
  console.log('================================================================');
  console.log('STARTING TARGETED NAVIGATION AUDIT (390px, 768px, 1366px)');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const auditReport = {
    stackingContextAnalysis: {},
    scrollRestorationAnalysis: {},
    accessibilityAnalysis: {},
    viewportFindings: []
  };

  // ---------------------------------------------------------------------------
  // SECTION 1: Z-INDEX & STACKING CONTEXT INSPECTION (Admin at 390px & 768px)
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. Investigating Stacking Contexts & Z-Indices ---');
  // Log in as Admin first
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

  for (const vp of [TEST_VIEWPORTS[0], TEST_VIEWPORTS[1]]) { // 390p and 768p
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    // Stacking when closed
    const closedMetrics = await page.evaluate(() => {
      const topbar = document.querySelector('.nav-wrapper');
      const main = document.querySelector('#main-content');
      const sidebar = document.querySelector('.admin-sidebar');
      const backdrop = document.querySelector('.admin-sidebar-backdrop');

      return {
        topbarZ: topbar ? getComputedStyle(topbar).zIndex : null,
        topbarPos: topbar ? getComputedStyle(topbar).position : null,
        mainZ: main ? getComputedStyle(main).zIndex : null,
        mainPos: main ? getComputedStyle(main).position : null,
        sidebarZ: sidebar ? getComputedStyle(sidebar).zIndex : null,
        sidebarTransform: sidebar ? getComputedStyle(sidebar).transform : null,
        backdropPresent: Boolean(backdrop)
      };
    });

    // Open Sidebar Drawer
    await page.click('.mobile-nav-toggle');
    await new Promise((r) => setTimeout(r, 450));

    // Stacking when open
    const openMetrics = await page.evaluate((vpW) => {
      const topbar = document.querySelector('.nav-wrapper');
      const main = document.querySelector('#main-content');
      const sidebar = document.querySelector('.admin-sidebar');
      const backdrop = document.querySelector('.admin-sidebar-backdrop');
      const closeBtn = document.querySelector('.mobile-sidebar-close-btn');

      // Test elementFromPoint at multiple coordinates:
      // Over sidebar drawer (e.g. x=50, y=20)
      const elSidebar = document.elementFromPoint(50, 20);
      // Over close button (x=240, y=20)
      const btnRect = closeBtn ? closeBtn.getBoundingClientRect() : null;
      const elCloseBtn = btnRect ? document.elementFromPoint(btnRect.x + btnRect.width / 2, btnRect.y + btnRect.height / 2) : null;
      // Over backdrop (outside drawer: x = vpW - 30, y = 50)
      const elBackdrop = document.elementFromPoint(vpW - 30, 50);

      return {
        bodyClasses: document.body.className,
        topbarZ: topbar ? getComputedStyle(topbar).zIndex : null,
        mainZ: main ? getComputedStyle(main).zIndex : null,
        mainPos: main ? getComputedStyle(main).position : null,
        sidebarZ: sidebar ? getComputedStyle(sidebar).zIndex : null,
        sidebarTransform: sidebar ? getComputedStyle(sidebar).transform : null,
        backdropZ: backdrop ? getComputedStyle(backdrop).zIndex : null,
        backdropPresent: Boolean(backdrop),
        elementOverSidebar: elSidebar ? elSidebar.tagName + '.' + elSidebar.className : null,
        elementOverCloseBtn: elCloseBtn ? elCloseBtn.outerHTML.slice(0, 100) : null,
        elementOverBackdrop: elBackdrop ? elBackdrop.tagName + '.' + elBackdrop.className : null,
        isSidebarHitAboveTopbar: elSidebar && !elSidebar.closest('.nav-wrapper'),
        isBackdropHitAboveTopbar: elBackdrop && !elBackdrop.closest('.nav-wrapper')
      };
    }, vp.width);

    const shotPath = path.join(targetEvidenceDir, `targeted_admin_open_${vp.name}.png`);
    await page.screenshot({ path: shotPath });

    auditReport.stackingContextAnalysis[vp.name] = {
      closed: closedMetrics,
      open: openMetrics,
      screenshot: `targeted_admin_open_${vp.name}.png`
    };

    console.log(`[${vp.name} Stacking]: Topbar Z: ${openMetrics.topbarZ} | Main Z: ${openMetrics.mainZ} | Sidebar Z: ${openMetrics.sidebarZ} | Backdrop Z: ${openMetrics.backdropZ}`);
    console.log(`[${vp.name} Hits]: Over Sidebar: ${openMetrics.elementOverSidebar} | Over CloseBtn: ${openMetrics.elementOverCloseBtn} | Over Backdrop: ${openMetrics.elementOverBackdrop}`);
  }

  // ---------------------------------------------------------------------------
  // SECTION 2: BODY SCROLL RESTORATION INSPECTION
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Inspecting Body Scroll Restoration Mechanics ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 500));

  // Test 2.1: Pre-existing inline overflow preservation test
  const scrollTestResult = await page.evaluate(() => {
    // Simulate pre-existing inline overflow
    document.body.style.overflow = 'scroll';
    const initialOverflow = document.body.style.overflow;

    // Trigger toggle
    const toggle = document.querySelector('.mobile-nav-toggle');
    if (toggle) toggle.click();

    // Check during open
    const openOverflow = document.body.style.overflow;

    // Trigger close
    const closeBtn = document.querySelector('.mobile-drawer-close');
    if (closeBtn) closeBtn.click();

    // Check after close
    const restoredOverflow = document.body.style.overflow;

    // Clean up
    document.body.style.overflow = '';

    return {
      initialOverflow,
      openOverflow,
      restoredOverflow,
      preservesCustomInlineStyle: restoredOverflow === initialOverflow
    };
  });

  auditReport.scrollRestorationAnalysis = scrollTestResult;
  console.log(`Initial: "${scrollTestResult.initialOverflow}" -> Open: "${scrollTestResult.openOverflow}" -> Restored: "${scrollTestResult.restoredOverflow}"`);
  console.log(`Preserves Custom Inline Style: ${scrollTestResult.preservesCustomInlineStyle ? 'YES' : 'NO (resets to empty string)'}`);

  // ---------------------------------------------------------------------------
  // SECTION 3: ACCESSIBILITY INSPECTION (Focus Trap, ARIA, Focus Return)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Inspecting Accessibility & Keyboard Navigation ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  // Focus Public Toggle Button and inspect ARIA attributes
  const a11yPublicAttributes = await page.evaluate(() => {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-drawer');

    return {
      hasAriaLabel: Boolean(toggle && toggle.getAttribute('aria-label')),
      ariaLabel: toggle ? toggle.getAttribute('aria-label') : null,
      hasAriaExpanded: Boolean(toggle && toggle.hasAttribute('aria-expanded')),
      ariaExpandedValue: toggle ? toggle.getAttribute('aria-expanded') : null,
      hasAriaControls: Boolean(toggle && toggle.hasAttribute('aria-controls')),
      ariaControlsValue: toggle ? toggle.getAttribute('aria-controls') : null,
      drawerRole: drawer ? drawer.getAttribute('role') : null,
      drawerAriaModal: drawer ? drawer.getAttribute('aria-modal') : null
    };
  });

  // Focus Return Test (Click toggle, press Escape, check activeElement)
  await page.click('.mobile-nav-toggle');
  await new Promise((r) => setTimeout(r, 350));
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 350));

  const focusReturnTest = await page.evaluate(() => {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const active = document.activeElement;
    return {
      isFocusedOnToggle: active === toggle,
      activeTagName: active ? active.tagName : null,
      activeClassName: active ? active.className : null
    };
  });

  // Focus Trap Test (Open drawer, Tab through elements, check if focus escapes drawer)
  await page.click('.mobile-nav-toggle');
  await new Promise((r) => setTimeout(r, 350));

  let focusEscapedDrawer = false;
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    const isInsideDrawer = await page.evaluate(() => {
      const drawer = document.querySelector('.mobile-drawer');
      return drawer && drawer.contains(document.activeElement);
    });
    if (!isInsideDrawer) {
      focusEscapedDrawer = true;
      break;
    }
  }

  // Close drawer
  await page.keyboard.press('Escape');

  auditReport.accessibilityAnalysis = {
    ariaAttributes: a11yPublicAttributes,
    focusReturn: focusReturnTest,
    focusTrap: {
      hasActiveFocusTrap: !focusEscapedDrawer,
      focusEscapedToBackground: focusEscapedDrawer
    }
  };

  console.log('A11y ARIA Attributes:', JSON.stringify(a11yPublicAttributes, null, 2));
  console.log('Focus Return to Trigger:', focusReturnTest.isFocusedOnToggle ? 'PASS' : 'FAIL (focus dropped to body)');
  console.log('Focus Trapping inside Drawer:', !focusEscapedDrawer ? 'PASS' : 'FAIL (focus escapes to background links)');

  // ---------------------------------------------------------------------------
  // SECTION 4: VIEWPORT INSPECTIONS AT 390px, 768px, 1366px
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Visual Verification across 390px, 768px, 1366px ---');
  for (const vp of TEST_VIEWPORTS) {
    // Public test
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));

    const pubMetrics = await page.evaluate((vpW) => {
      const scrollW = document.documentElement.scrollWidth;
      const navCenter = document.querySelector('.nav-center');
      const toggle = document.querySelector('.mobile-nav-toggle');
      return {
        hScroll: scrollW > vpW + 1,
        scrollW,
        navCenterVisible: navCenter ? getComputedStyle(navCenter).display !== 'none' : false,
        toggleVisible: toggle ? getComputedStyle(toggle).display !== 'none' : false
      };
    }, vp.width);

    const pubShot = path.join(targetEvidenceDir, `targeted_public_${vp.name}.png`);
    await page.screenshot({ path: pubShot });

    // Admin test
    await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));

    const adminMetrics = await page.evaluate((vpW) => {
      const scrollW = document.documentElement.scrollWidth;
      const sidebar = document.querySelector('.admin-sidebar');
      const toggle = document.querySelector('.mobile-nav-toggle');
      const card = document.querySelector('.admin-content-area > *');

      return {
        hScroll: scrollW > vpW + 1,
        scrollW,
        toggleVisible: toggle ? getComputedStyle(toggle).display !== 'none' : false,
        sidebarTransform: sidebar ? getComputedStyle(sidebar).transform : null,
        cardTop: card ? card.getBoundingClientRect().top : null
      };
    }, vp.width);

    const adminShot = path.join(targetEvidenceDir, `targeted_admin_${vp.name}.png`);
    await page.screenshot({ path: adminShot });

    auditReport.viewportFindings.push({
      viewport: vp.label,
      width: vp.width,
      public: pubMetrics,
      admin: adminMetrics,
      screenshots: {
        public: `targeted_public_${vp.name}.png`,
        admin: `targeted_admin_${vp.name}.png`
      }
    });

    console.log(`[${vp.label}] Public HScroll: ${pubMetrics.hScroll} (${pubMetrics.scrollW}px) | Admin HScroll: ${adminMetrics.hScroll} (${adminMetrics.scrollW}px) | Admin CardTop: ${adminMetrics.cardTop}px`);
  }

  await browser.close();

  fs.writeFileSync(path.join(targetEvidenceDir, 'targeted_audit_results.json'), JSON.stringify(auditReport, null, 2), 'utf8');
  console.log('\n================================================================');
  console.log('TARGETED AUDIT COMPLETE: Results saved.');
  console.log('================================================================');
}

runTargetedAudit().catch((err) => {
  console.error('Targeted audit failed with error:', err);
  process.exit(1);
});

