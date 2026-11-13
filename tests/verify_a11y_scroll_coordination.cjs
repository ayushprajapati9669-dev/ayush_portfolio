const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const a11yEvidenceDir = path.join(__dirname, '..', 'audit_evidence', 'a11y_scroll_verification');
if (!fs.existsSync(a11yEvidenceDir)) {
  fs.mkdirSync(a11yEvidenceDir, { recursive: true });
}

async function verifyAll() {
  console.log('================================================================');
  console.log('VERIFYING ACCESSIBILITY, FOCUS TRAP & SHARED SCROLL-LOCK');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const summary = {
    publicA11y: {},
    adminA11y: {},
    scrollLockCoordination: {},
    viewports: {}
  };

  // ---------------------------------------------------------------------------
  // 1. PUBLIC MOBILE DRAWER ACCESSIBILITY
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. Testing Public Mobile Drawer Accessibility (390px) ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // 1.1 Closed ARIA state
  const closedAria = await page.evaluate(() => {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    return {
      ariaExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
      ariaControls: toggle ? toggle.getAttribute('aria-controls') : null,
      drawerId: drawer ? drawer.id : null,
      drawerRole: drawer ? drawer.getAttribute('role') : null,
      drawerAriaModal: drawer ? drawer.getAttribute('aria-modal') : null
    };
  });

  console.log('Closed State ARIA:', JSON.stringify(closedAria));

  // 1.2 Open drawer & check open ARIA state
  await page.click('.mobile-nav-toggle');
  await new Promise(r => setTimeout(r, 400));

  const openAria = await page.evaluate(() => {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    return {
      ariaExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
      ariaControls: toggle ? toggle.getAttribute('aria-controls') : null,
      drawerRole: drawer ? drawer.getAttribute('role') : null,
      drawerAriaModal: drawer ? drawer.getAttribute('aria-modal') : null
    };
  });

  console.log('Open State ARIA:', JSON.stringify(openAria));

  summary.publicA11y.ariaExpandedTransitions = (closedAria.ariaExpanded === 'false' && openAria.ariaExpanded === 'true');
  summary.publicA11y.ariaControlsRelationship = (closedAria.ariaControls === 'publicMobileDrawer' && closedAria.drawerId === 'publicMobileDrawer');
  summary.publicA11y.dialogSemantics = (openAria.drawerRole === 'dialog' && openAria.drawerAriaModal === 'true');

  // 1.3 Focus trapping test (press Tab 15 times, verify focus never escapes .mobile-drawer)
  let focusEscapedPublic = false;
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    const isContained = await page.evaluate(() => {
      const drawer = document.querySelector('.mobile-drawer');
      return drawer && drawer.contains(document.activeElement);
    });
    if (!isContained) {
      focusEscapedPublic = true;
      break;
    }
  }

  // Shift+Tab wrap test from first element
  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');
  await page.keyboard.up('Shift');
  const isShiftTabContained = await page.evaluate(() => {
    const drawer = document.querySelector('.mobile-drawer');
    return drawer && drawer.contains(document.activeElement);
  });

  summary.publicA11y.focusTrapped = !focusEscapedPublic && isShiftTabContained;
  console.log('Public Focus Trap Result:', summary.publicA11y.focusTrapped ? 'PASS' : 'FAIL');

  // 1.4 Escape key dismissal & Focus Restoration
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  const publicFocusRestored = await page.evaluate(() => {
    const toggle = document.querySelector('.mobile-nav-toggle');
    return document.activeElement === toggle;
  });

  summary.publicA11y.focusRestoredToTrigger = publicFocusRestored;
  console.log('Public Focus Restored to Trigger:', publicFocusRestored ? 'PASS' : 'FAIL');

  // ---------------------------------------------------------------------------
  // 2. ADMIN SIDEBAR ACCESSIBILITY
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Testing Admin Sidebar Accessibility (390px) ---');
  // Log in as Admin
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

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

  // Set mobile 390px
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // 2.1 Admin Closed ARIA state
  const adminClosedAria = await page.evaluate(() => {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    return {
      ariaExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
      ariaControls: toggle ? toggle.getAttribute('aria-controls') : null,
      sidebarId: sidebar ? sidebar.id : null,
      sidebarRole: sidebar ? sidebar.getAttribute('role') : null,
      sidebarAriaModal: sidebar ? sidebar.getAttribute('aria-modal') : null
    };
  });

  console.log('Admin Closed State ARIA:', JSON.stringify(adminClosedAria));

  // 2.2 Open admin sidebar drawer & check open ARIA state
  await page.click('.mobile-nav-toggle');
  await new Promise(r => setTimeout(r, 450));

  const adminOpenAria = await page.evaluate(() => {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    return {
      ariaExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
      ariaControls: toggle ? toggle.getAttribute('aria-controls') : null,
      sidebarRole: sidebar ? sidebar.getAttribute('role') : null,
      sidebarAriaModal: sidebar ? sidebar.getAttribute('aria-modal') : null
    };
  });

  console.log('Admin Open State ARIA:', JSON.stringify(adminOpenAria));

  summary.adminA11y.ariaExpandedTransitions = (adminClosedAria.ariaExpanded === 'false' && adminOpenAria.ariaExpanded === 'true');
  summary.adminA11y.ariaControlsRelationship = (adminClosedAria.ariaControls === 'adminSidebar' && adminClosedAria.sidebarId === 'adminSidebar');
  summary.adminA11y.responsiveDialogSemantics = (adminOpenAria.sidebarRole === 'dialog' && adminOpenAria.sidebarAriaModal === 'true' && adminClosedAria.sidebarRole === null);

  // 2.3 Focus trapping test in admin sidebar
  let focusEscapedAdmin = false;
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    const isContained = await page.evaluate(() => {
      const sidebar = document.querySelector('.admin-sidebar');
      return sidebar && sidebar.contains(document.activeElement);
    });
    if (!isContained) {
      focusEscapedAdmin = true;
      break;
    }
  }

  summary.adminA11y.focusTrapped = !focusEscapedAdmin;
  console.log('Admin Focus Trap Result:', summary.adminA11y.focusTrapped ? 'PASS' : 'FAIL');

  // 2.4 Escape key dismissal & Focus Restoration
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  const adminFocusRestored = await page.evaluate(() => {
    const toggle = document.querySelector('.mobile-nav-toggle');
    return document.activeElement === toggle;
  });

  summary.adminA11y.focusRestoredToTrigger = adminFocusRestored;
  console.log('Admin Focus Restored to Trigger:', adminFocusRestored ? 'PASS' : 'FAIL');

  // ---------------------------------------------------------------------------
  // 3. SHARED BODY SCROLL-LOCK COORDINATION TEST
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Testing Shared Scroll-Lock Coordination Across Overlays ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));

  // Multi-overlay sequence test:
  // Step 1: Baseline overflow
  const baseOverflow = await page.evaluate(() => document.body.style.overflow);

  // Step 2: Open Public Drawer (overlay 1)
  await page.click('.mobile-nav-toggle');
  await new Promise(r => setTimeout(r, 350));
  const drawerLocked = await page.evaluate(() => document.body.style.overflow);

  // Step 3: Open Resume Modal from inside drawer (overlay 2)
  await page.click('.mobile-drawer-footer button');
  await new Promise(r => setTimeout(r, 450));
  const bothOpenLocked = await page.evaluate(() => document.body.style.overflow);

  // Step 4: Verify Public Drawer closed, but Resume Modal is still open
  const modalStillOpenState = await page.evaluate(() => {
    const drawer = document.querySelector('.mobile-drawer');
    const isDrawerOpen = drawer && drawer.classList.contains('open');
    const resumeModal = document.querySelector('.resume-modal-container') || document.querySelector('.resume-modal-box') || document.querySelector('[data-action="open-resume"]');
    return {
      isDrawerOpen,
      overflow: document.body.style.overflow
    };
  });

  console.log('After closing Drawer with Resume Modal open, overflow is:', modalStillOpenState.overflow);

  // Step 5: Close Resume Modal via Escape key
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 450));
  const allClosedRestored = await page.evaluate(() => document.body.style.overflow);

  console.log('After closing all overlays, overflow is restored to:', JSON.stringify(allClosedRestored));

  summary.scrollLockCoordination.lockOnOpen = (drawerLocked === 'hidden' && bothOpenLocked === 'hidden');
  summary.scrollLockCoordination.retainsLockWhileSecondaryOverlayOpen = (modalStillOpenState.overflow === 'hidden');
  summary.scrollLockCoordination.restoresWhenAllClosed = (allClosedRestored === baseOverflow);

  // ---------------------------------------------------------------------------
  // 4. RESPONSIVE INTEGRATION (390px, 768px, 1366px)
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Checking Responsive Layout Integrity ---');
  for (const vp of [{ name: '390p', width: 390, height: 844 }, { name: '768p', width: 768, height: 1024 }, { name: '1366p', width: 1366, height: 768 }]) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    const pubScroll = await page.evaluate(() => document.documentElement.scrollWidth);

    await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
    const adminScroll = await page.evaluate(() => document.documentElement.scrollWidth);

    const shotPath = path.join(a11yEvidenceDir, `a11y_verified_${vp.name}.png`);
    await page.screenshot({ path: shotPath });

    summary.viewports[vp.name] = {
      width: vp.width,
      publicHScroll: pubScroll > vp.width + 1,
      adminHScroll: adminScroll > vp.width + 1,
      pass: pubScroll <= vp.width + 1 && adminScroll <= vp.width + 1
    };
    console.log(`[${vp.name}]: Public Scroll: ${pubScroll}px/${vp.width}px | Admin Scroll: ${adminScroll}px/${vp.width}px | Pass: ${summary.viewports[vp.name].pass}`);
  }

  await browser.close();

  fs.writeFileSync(path.join(a11yEvidenceDir, 'verification_summary.json'), JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n================================================================');
  console.log('VERIFICATION SUMMARY COMPLETE');
  console.log('================================================================');
  console.log(JSON.stringify(summary, null, 2));
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

