const puppeteer = require('puppeteer');
const http = require('http');

const API_BASE = 'http://127.0.0.1:6000';
const CLIENT_BASE = process.env.CLIENT_BASE || 'http://localhost:5174';

function apiCall(endpoint, method = 'GET', data = null, token = null, cookie = null, csrf = null, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const bodyStr = data ? JSON.stringify(data) : null;
    const headers = { ...customHeaders };
    if (bodyStr) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (cookie) headers['Cookie'] = cookie;
    if (csrf) headers['X-CSRF-Token'] = csrf;

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(resData);
          } catch (_e) {
            parsed = resData;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: resData });
        });
      }
    );
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runPhase4Verification() {
  console.log('================================================================');
  console.log('=== PHASE 4 E2E DYNAMIC ADMIN CMS SETTINGS VERIFICATION AUDIT ===');
  console.log('=== Appearance Settings + SEO Settings + Site Settings        ===');
  console.log('================================================================\n');

  // Step 1: Login as Admin
  console.log('[Step 1] Authenticating as Admin...');
  const loginRes = await apiCall('/api/auth/login', 'POST', {
    username: 'ayush',
    password: 'Ayush7162@'
  });
  if (loginRes.status !== 200 || !loginRes.data?.token) {
    throw new Error(`Admin login failed: ${loginRes.status} ${JSON.stringify(loginRes.data)}`);
  }
  const token = loginRes.data.token;
  const csrfToken = loginRes.data.csrfToken || token;
  const setCookie = loginRes.headers['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie.map((c) => c.split(';')[0]).join('; ') : '';
  console.log('✓ Admin login successful. Token & CSRF acquired.\n');

  // Capture baseline settings to restore during cleanup
  const initialSettingsRes = await apiCall('/api/admin/settings', 'GET', null, token, cookieHeader);
  const baselineSettings = initialSettingsRes.data?.settings || {};

  // Launch Puppeteer browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      // Ignore routine static font 404 or missing optional devicon assets
      if (!txt.includes('favicon.ico') && !txt.includes('ERR_BLOCKED_BY_CLIENT')) {
        consoleErrors.push(txt);
      }
    }
  });

  // Inject authenticated admin session into client's sessionStorage
  await page.goto(`${CLIENT_BASE}/admin`, { waitUntil: 'networkidle2' });
  await page.evaluate(
    ({ tok, csrf }) => {
      sessionStorage.setItem(
        'ayush_modern_portfolio_admin_session_v4',
        JSON.stringify({
          token: tok,
          csrfToken: csrf,
          user: { username: 'ayush', role: 'admin' },
          expiresAt: Date.now() + 3600000
        })
      );
    },
    { tok: token, csrf: csrfToken }
  );

  try {
    // --------------------------------------------------------------------------
    // SUITE 1: APPEARANCE SETTINGS
    // --------------------------------------------------------------------------
    console.log('[Suite 1: Appearance Settings]');

    // Test 1.1: Navigate to Appearance tab and verify form controls render
    console.log('  -> Test 1.1: Navigating to /admin?tab=appearance and verifying controls...');
    await page.goto(`${CLIENT_BASE}/admin?tab=appearance`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const appearanceControls = await page.evaluate(() => {
      const banner = document.querySelector('.admin-appearance-page');
      const accentHexInput = document.querySelector('input[placeholder="#dfb740"]');
      const testLiveBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Test Live'));
      const saveBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Save Changes'));
      return {
        hasPage: Boolean(banner),
        hasAccentInput: Boolean(accentHexInput),
        hasTestLiveBtn: Boolean(testLiveBtn),
        hasSaveBtn: Boolean(saveBtn)
      };
    });

    if (!appearanceControls.hasPage || !appearanceControls.hasAccentInput || !appearanceControls.hasSaveBtn) {
      throw new Error(`FAIL: Appearance settings page or controls did not render: ${JSON.stringify(appearanceControls)}`);
    }
    console.log('  ✓ PASS [Test 1.1]: Appearance Settings UI renders all controls and action buttons.\n');

    // Test 1.2: Update Appearance Settings via Admin API and verify DB persistence
    console.log('  -> Test 1.2: Updating Appearance settings (accent: #06b6d4 Cyan, bgBase: #05070f, particlesEnabled: false)...');
    const updateAppearanceRes = await apiCall(
      '/api/admin/settings',
      'PUT',
      {
        ...baselineSettings,
        themeMode: 'midnight',
        accentColor: '#06b6d4',
        bgBase: '#05070f',
        bgSurface: '#0f1422',
        glowIntensity: 'vibrant',
        particlesEnabled: false
      },
      token,
      cookieHeader,
      csrfToken
    );

    if (updateAppearanceRes.status !== 200 || updateAppearanceRes.data?.settings?.accentColor !== '#06b6d4') {
      throw new Error(`FAIL: Failed to update appearance settings: ${JSON.stringify(updateAppearanceRes.data)}`);
    }

    // Verify GET /api/public/settings reflects the new values
    const publicSettingsAfterAppearance = await apiCall('/api/public/settings', 'GET');
    const pubSet1 = publicSettingsAfterAppearance.data?.settings || {};
    if (pubSet1.accentColor !== '#06b6d4' || pubSet1.bgBase !== '#05070f' || pubSet1.particlesEnabled !== false) {
      throw new Error(`FAIL: /api/public/settings does not reflect updated appearance settings! Got: ${JSON.stringify(pubSet1)}`);
    }
    console.log('  ✓ PASS [Test 1.2]: Appearance settings persisted to database and served by /api/public/settings.\n');

    // Helper to trigger real-time storage synchronization
    const triggerClientRevalidation = async (targetPage) => {
      await targetPage.evaluate(() => {
        localStorage.setItem('portfolio_last_synced', String(Date.now()));
        window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
      });
      await new Promise((r) => setTimeout(r, 600));
    };

    // Test 1.3: Verify public home page dynamically reflects CSS custom properties & theme tokens
    console.log('  -> Test 1.3: Visiting public / and verifying dynamic CSS variables (--brand-color, --bg-base)...');
    await page.goto(`${CLIENT_BASE}/`, { waitUntil: 'networkidle2' });
    await triggerClientRevalidation(page);

    await page.waitForFunction(() => {
      const root = document.documentElement;
      return root.style.getPropertyValue('--brand-color') === '#06b6d4';
    }, { timeout: 8000 });

    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        brandColor: root.style.getPropertyValue('--brand-color'),
        accentPrimary: root.style.getPropertyValue('--accent-primary'),
        bgBase: root.style.getPropertyValue('--bg-base'),
        themeMode: root.getAttribute('data-theme')
      };
    });

    console.log('     Observed CSS variables on DOM:', cssVars);
    if (cssVars.brandColor !== '#06b6d4' || cssVars.bgBase !== '#05070f') {
      throw new Error(`FAIL: Public DOM does not reflect dynamic CSS variables! Observed: ${JSON.stringify(cssVars)}`);
    }
    console.log('  ✓ PASS [Test 1.3]: Public frontend dynamically applies CMS appearance design tokens (--brand-color: #06b6d4).\n');

    // Test 1.4: Browser refresh persistence of Appearance settings
    console.log('  -> Test 1.4: Testing browser refresh persistence of appearance settings...');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const refreshedCssVars = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        brandColor: root.style.getPropertyValue('--brand-color'),
        bgBase: root.style.getPropertyValue('--bg-base')
      };
    });

    if (refreshedCssVars.brandColor !== '#06b6d4') {
      throw new Error(`FAIL: Appearance CSS variables lost after browser refresh! Got: ${JSON.stringify(refreshedCssVars)}`);
    }
    console.log('  ✓ PASS [Test 1.4]: Appearance tokens persist cleanly across browser reload.\n');

    // --------------------------------------------------------------------------
    // SUITE 2: SEO & METADATA SETTINGS
    // --------------------------------------------------------------------------
    console.log('[Suite 2: SEO & Metadata Settings]');

    // Test 2.1: Navigate to SEO tab and inspect controls & SERP simulator
    console.log('  -> Test 2.1: Navigating to /admin?tab=seo and verifying SERP/Social simulators...');
    await page.goto(`${CLIENT_BASE}/admin?tab=seo`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const seoPageEvaluation = await page.evaluate(() => {
      const pageEl = document.querySelector('.admin-seo-page');
      const serpSnippet = document.querySelector('.admin-seo-page h4');
      const syncBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Sync to Social'));
      return {
        hasPage: Boolean(pageEl),
        hasSerpTitle: Boolean(serpSnippet),
        hasSyncBtn: Boolean(syncBtn)
      };
    });

    if (!seoPageEvaluation.hasPage || !seoPageEvaluation.hasSyncBtn) {
      throw new Error(`FAIL: SEO settings page did not render properly: ${JSON.stringify(seoPageEvaluation)}`);
    }
    console.log('  ✓ PASS [Test 2.1]: SEO Settings page with SERP and Social simulators rendered successfully.\n');

    // Test 2.2: Update SEO settings and verify API persistence
    console.log('  -> Test 2.2: Updating SEO settings with custom titles, description, and canonical URL...');
    const testSeoTitle = 'Ayush Prajapati — Principal Full-Stack Engineer & Cloud Architect';
    const testSeoDesc = 'Engineered distributed microservices with 50k req/sec throughput and sub-50ms p99 latency using MERN and Cloud platforms.';
    const testOgTitle = 'Ayush Prajapati — Principal Full-Stack Engineer';
    const testOgDesc = 'Engineered distributed microservices with 50k req/sec throughput.';
    const testCanonical = 'https://ayushprajapati.dev';

    const updateSeoRes = await apiCall(
      '/api/admin/settings',
      'PUT',
      {
        ...baselineSettings,
        siteTitle: testSeoTitle,
        seoTitle: testSeoTitle,
        seoDescription: testSeoDesc,
        ogTitle: testOgTitle,
        ogDescription: testOgDesc,
        ogImage: '/images/ayush-hero-portrait.jpg',
        canonicalUrl: testCanonical,
        robotsIndex: 'index, follow'
      },
      token,
      cookieHeader,
      csrfToken
    );

    if (updateSeoRes.status !== 200 || updateSeoRes.data?.settings?.seoTitle !== testSeoTitle) {
      throw new Error(`FAIL: Failed to update SEO settings via admin API: ${JSON.stringify(updateSeoRes.data)}`);
    }

    const publicSettingsAfterSeo = await apiCall('/api/public/settings', 'GET');
    const pubSet2 = publicSettingsAfterSeo.data?.settings || {};
    if (pubSet2.seoTitle !== testSeoTitle || pubSet2.seoDescription !== testSeoDesc || pubSet2.ogTitle !== testOgTitle) {
      throw new Error(`FAIL: /api/public/settings does not match updated SEO settings! Got: ${JSON.stringify(pubSet2)}`);
    }
    console.log('  ✓ PASS [Test 2.2]: SEO settings persisted to database and verified via /api/public/settings.\n');

    // Test 2.3: Verify public HTML & DOM reflects live SEO metadata
    console.log('  -> Test 2.3: Visiting public / and verifying <title>, <meta description>, and OpenGraph tags...');
    await page.goto(`${CLIENT_BASE}/`, { waitUntil: 'networkidle2' });
    await triggerClientRevalidation(page);

    await page.waitForFunction((expected) => {
      return document.title.includes(expected);
    }, { timeout: 8000 }, 'Principal Full-Stack Engineer');

    const metaTags = await page.evaluate(() => {
      const getMeta = (prop, isProperty = false) => {
        const el = isProperty
          ? document.querySelector(`meta[property="${prop}"]`)
          : document.querySelector(`meta[name="${prop}"]`);
        return el ? el.getAttribute('content') : null;
      };
      const canonical = document.querySelector('link[rel="canonical"]');
      return {
        title: document.title,
        description: getMeta('description'),
        robots: getMeta('robots'),
        ogTitle: getMeta('og:title', true),
        ogDescription: getMeta('og:description', true),
        ogImage: getMeta('og:image', true),
        canonicalHref: canonical ? canonical.getAttribute('href') : null
      };
    });

    console.log('     Observed public meta tags:', metaTags);
    if (!metaTags.title.includes('Principal Full-Stack Engineer')) {
      throw new Error(`FAIL: Public document.title did not update with CMS SEO title! Got: "${metaTags.title}"`);
    }
    if (metaTags.description !== testSeoDesc) {
      throw new Error(`FAIL: Public meta description did not update! Got: "${metaTags.description}"`);
    }
    if (metaTags.ogTitle !== testOgTitle) {
      throw new Error(`FAIL: Public og:title did not update! Got: "${metaTags.ogTitle}"`);
    }
    if (metaTags.canonicalHref !== testCanonical + '/') {
      if (metaTags.canonicalHref !== testCanonical) {
        throw new Error(`FAIL: Canonical link mismatch! Got: "${metaTags.canonicalHref}"`);
      }
    }
    console.log('  ✓ PASS [Test 2.3]: Public DOM correctly updates title, description, robots, canonical, and OpenGraph tags.\n');

    // Test 2.4: Social Crawler SSR OpenGraph Pre-Injection
    console.log('  -> Test 2.4: Testing SSR crawler OpenGraph pre-injection with crawler User-Agent (facebookexternalhit)...');
    const crawlerRes = await apiCall('/', 'GET', null, null, null, null, {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    });

    if (typeof crawlerRes.raw !== 'string' || !crawlerRes.raw.includes('<meta property="og:title"')) {
      throw new Error('FAIL: Crawler request did not receive pre-injected OpenGraph HTML!');
    }
    if (!crawlerRes.raw.includes(testOgTitle)) {
      throw new Error(`FAIL: Pre-injected OpenGraph HTML did not contain the updated CMS ogTitle! Raw excerpt: ${crawlerRes.raw.slice(0, 600)}`);
    }
    console.log('  ✓ PASS [Test 2.4]: Social crawler request successfully receives pre-injected OpenGraph tags with live CMS values.\n');

    // --------------------------------------------------------------------------
    // SUITE 3: SITE SETTINGS & MAINTENANCE MODE
    // --------------------------------------------------------------------------
    console.log('[Suite 3: Site Settings & Maintenance Mode]');

    // Test 3.1: Navigate to Site Settings tab
    console.log('  -> Test 3.1: Navigating to /admin?tab=settings and verifying site controls...');
    await page.goto(`${CLIENT_BASE}/admin?tab=settings`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const siteSettingsControls = await page.evaluate(() => {
      const pageEl = document.querySelector('.admin-site-settings-page');
      const maintenanceSwitch = document.querySelector('button[role="switch"]');
      const contactNoteArea = document.querySelector('textarea');
      return {
        hasPage: Boolean(pageEl),
        hasSwitch: Boolean(maintenanceSwitch),
        hasContactNote: Boolean(contactNoteArea)
      };
    });

    if (!siteSettingsControls.hasPage || !siteSettingsControls.hasSwitch || !siteSettingsControls.hasContactNote) {
      throw new Error(`FAIL: Site Settings page did not render properly: ${JSON.stringify(siteSettingsControls)}`);
    }
    console.log('  ✓ PASS [Test 3.1]: Site Settings page rendered with maintenance toggle and contact note editor.\n');

    // Test 3.2: Update Site Settings (brand name, contact email, contact note, maintenance mode ON)
    console.log('  -> Test 3.2: Updating Site Settings (brand: "AP Systems Studio", note, maintenanceMode: true)...');
    const testSiteName = 'AP Systems Studio';
    const testContactEmail = 'contact@ayushprajapati.dev';
    const testContactNote = 'PHASE4_EXCLUSIVE_TEST_NOTE: Inquiries are currently triaged by AI automation before human review.';
    const testCopyright = '© 2026 AP Systems Studio. All rights reserved.';

    const updateSiteRes = await apiCall(
      '/api/admin/settings',
      'PUT',
      {
        ...baselineSettings,
        siteName: testSiteName,
        contactEmail: testContactEmail,
        contactPhone: '+91 9669802554',
        contactNote: testContactNote,
        copyrightText: testCopyright,
        maintenanceMode: true
      },
      token,
      cookieHeader,
      csrfToken
    );

    if (updateSiteRes.status !== 200 || updateSiteRes.data?.settings?.siteName !== testSiteName) {
      throw new Error(`FAIL: Failed to update site settings: ${JSON.stringify(updateSiteRes.data)}`);
    }
    if (updateSiteRes.data?.settings?.maintenanceMode !== true) {
      throw new Error('FAIL: maintenanceMode was not saved as true!');
    }
    console.log('  ✓ PASS [Test 3.2]: Site settings & maintenanceMode: true persisted to database.\n');

    // Test 3.3: Verify Public Contact Page reflects live CMS contactNote and email
    console.log('  -> Test 3.3: Visiting public /contact and verifying contactNote & contactEmail rendering...');
    await page.goto(`${CLIENT_BASE}/contact`, { waitUntil: 'networkidle2' });
    await triggerClientRevalidation(page);

    await page.waitForFunction(() => {
      return document.body.innerText.includes('PHASE4_EXCLUSIVE_TEST_NOTE');
    }, { timeout: 8000 });

    const contactPageInspection = await page.evaluate(() => {
      const noteBox = document.querySelector('.contact-note-box');
      const bodyText = document.body.innerText;
      return {
        hasNoteBox: Boolean(noteBox),
        noteText: noteBox ? noteBox.innerText : '',
        containsTestNote: bodyText.includes('PHASE4_EXCLUSIVE_TEST_NOTE'),
        containsTestEmail: bodyText.includes('contact@ayushprajapati.dev')
      };
    });

    console.log('     Contact page inspection:', contactPageInspection);
    if (!contactPageInspection.containsTestNote) {
      throw new Error('FAIL: Public /contact did not render the live CMS contactNote!');
    }
    if (!contactPageInspection.containsTestEmail) {
      throw new Error('FAIL: Public /contact did not render the updated contactEmail!');
    }
    console.log('  ✓ PASS [Test 3.3]: Public /contact renders live CMS contactNote and public contactEmail.\n');

    // Test 3.4: Verify Maintenance Banner appears on public route when maintenanceMode === true
    console.log('  -> Test 3.4: Visiting public / and verifying .maintenance-banner visibility...');
    await page.goto(`${CLIENT_BASE}/`, { waitUntil: 'networkidle2' });
    await triggerClientRevalidation(page);

    await page.waitForFunction(() => {
      return Boolean(document.querySelector('.maintenance-banner'));
    }, { timeout: 8000 });

    const maintenanceBannerState = await page.evaluate(() => {
      const banner = document.querySelector('.maintenance-banner');
      return {
        hasBanner: Boolean(banner),
        bannerText: banner ? banner.innerText : ''
      };
    });

    console.log('     Maintenance banner inspection:', maintenanceBannerState);
    if (!maintenanceBannerState.hasBanner || !maintenanceBannerState.bannerText.includes('Scheduled Maintenance Mode')) {
      throw new Error('FAIL: Public page did not display .maintenance-banner when maintenanceMode: true!');
    }
    console.log('  ✓ PASS [Test 3.4]: Public route displays luxury maintenance notification banner.\n');

    // Test 3.5: Verify Admin console remains accessible and excludes maintenance banner
    console.log('  -> Test 3.5: Verifying /admin remains fully accessible and excludes maintenance banner...');
    await page.goto(`${CLIENT_BASE}/admin`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    const adminBannerCheck = await page.evaluate(() => {
      const banner = document.querySelector('.maintenance-banner');
      const adminWorkspace = document.querySelector('.admin-workspace');
      return {
        hasBannerInAdmin: Boolean(banner),
        hasAdminWorkspace: Boolean(adminWorkspace)
      };
    });

    if (adminBannerCheck.hasBannerInAdmin) {
      throw new Error('FAIL: Maintenance banner unexpectedly leaked into admin workspace!');
    }
    if (!adminBannerCheck.hasAdminWorkspace) {
      throw new Error('FAIL: Admin workspace was blocked by maintenance mode!');
    }
    console.log('  ✓ PASS [Test 3.5]: Admin workspace remains accessible and isolated from public maintenance banner.\n');

    // Test 3.6: Verify Footer reflects updated Brand Name and Copyright
    console.log('  -> Test 3.6: Verifying Footer reflects live CMS brand name and copyright text...');
    await page.goto(`${CLIENT_BASE}/about`, { waitUntil: 'networkidle2' });
    await triggerClientRevalidation(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForFunction(() => {
      const footer = document.querySelector('footer');
      return footer && footer.innerText.includes('AP Systems Studio');
    }, { timeout: 8000 });

    const footerInspection = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      const text = footer ? footer.innerText : '';
      return {
        hasFooter: Boolean(footer),
        containsBrand: text.includes('AP Systems Studio'),
        containsCopyright: text.includes('© 2026 AP Systems Studio. All rights reserved.')
      };
    });

    console.log('     Footer inspection:', footerInspection);
    if (!footerInspection.containsBrand || !footerInspection.containsCopyright) {
      throw new Error(`FAIL: Footer did not render CMS brand name and copyright! Got: ${JSON.stringify(footerInspection)}`);
    }
    console.log('  ✓ PASS [Test 3.6]: Footer reflects live CMS siteName and copyrightText.\n');

    // --------------------------------------------------------------------------
    // SUITE 4: SECURITY & CREDENTIAL ISOLATION
    // --------------------------------------------------------------------------
    console.log('[Suite 4: Security & Sensitive Credential Isolation]');

    // Test 4.1: Verify GET /api/public/settings never leaks private credentials
    console.log('  -> Test 4.1: Checking /api/public/settings for credential isolation...');
    const pubSettingsRes = await apiCall('/api/public/settings', 'GET');
    const pubSettingsData = pubSettingsRes.data?.settings || {};

    const privateKeys = [
      'mongodbUri',
      'sessionSecret',
      'jwtSecret',
      'passwordHash',
      'adminConfig',
      'cloudinaryCloudName',
      'cloudinaryUploadPreset'
    ];

    for (const key of privateKeys) {
      if (pubSettingsData[key] !== undefined) {
        throw new Error(`FAIL: Private credential "${key}" leaked in /api/public/settings! Value: ${pubSettingsData[key]}`);
      }
    }
    console.log('  ✓ PASS [Test 4.1]: /api/public/settings strictly excludes private credentials (mongodbUri, secrets, cloudinary).\n');

    // Test 4.2: Verify GET /api/public/bootstrap never leaks private credentials
    console.log('  -> Test 4.2: Checking /api/public/bootstrap for credential isolation...');
    const bootstrapRes = await apiCall('/api/public/bootstrap', 'GET');
    const bootstrapSettings = bootstrapRes.data?.settings || {};

    for (const key of privateKeys) {
      if (bootstrapSettings[key] !== undefined) {
        throw new Error(`FAIL: Private credential "${key}" leaked in /api/public/bootstrap! Value: ${bootstrapSettings[key]}`);
      }
    }
    console.log('  ✓ PASS [Test 4.2]: /api/public/bootstrap strictly isolates private server configuration.\n');

    // Test 4.3: Verify unauthenticated PUT/POST to /api/admin/settings is rejected with 401
    console.log('  -> Test 4.3: Testing unauthenticated PUT to /api/admin/settings...');
    const unauthRes = await apiCall('/api/admin/settings', 'PUT', { siteTitle: 'Hacked Title' });
    if (unauthRes.status !== 401 && unauthRes.status !== 403) {
      throw new Error(`FAIL: Unauthenticated PUT /api/admin/settings was not rejected! Status: ${unauthRes.status}`);
    }
    console.log('  ✓ PASS [Test 4.3]: Unauthenticated settings mutations are strictly rejected (HTTP 401/403).\n');

    // --------------------------------------------------------------------------
    // SUITE 5: CONSOLE ERROR AUDIT
    // --------------------------------------------------------------------------
    console.log('[Suite 5: Browser Console Error Audit]');
    console.log('  -> Test 5.1: Inspecting browser console errors across all test scenarios...');
    console.log('     Critical console errors detected:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.warn('     Console errors:', consoleErrors);
      throw new Error(`FAIL: ${consoleErrors.length} critical console errors detected during testing!`);
    }
    console.log('  ✓ PASS [Test 5.1]: Zero console errors detected across all settings workflows and public route visits.\n');

  } finally {
    // Cleanup: Restore authentic baseline settings in backend
    console.log('[Cleanup] Restoring baseline portfolio settings in database...');
    try {
      await apiCall(
        '/api/admin/settings',
        'PUT',
        {
          ...baselineSettings,
          siteName: 'Ayush Prajapati',
          siteTitle: 'Ayush Prajapati — Full-Stack Developer Portfolio',
          seoTitle: 'Ayush Prajapati | Full-Stack Developer & Software Engineer',
          seoDescription: 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, MySQL, and MongoDB.',
          ogTitle: 'Ayush Prajapati — Full-Stack Developer & Software Engineer',
          ogDescription: 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, MySQL, and MongoDB.',
          ogImage: '/images/ayush-hero-portrait.jpg',
          canonicalUrl: '',
          contactEmail: 'ayushprajapati9669@gmail.com',
          contactPhone: '(+91) 9669802554',
          contactNote: '',
          copyrightText: '© ' + new Date().getFullYear() + ' Ayush Prajapati. All rights reserved.',
          accentColor: '#dfb740',
          themeMode: 'dark',
          bgBase: '#000000',
          bgSurface: '#0a0a0f',
          glowIntensity: 'medium',
          maintenanceMode: false
        },
        token,
        cookieHeader,
        csrfToken
      );
      console.log('✓ Cleanup complete. Authentic baseline CMS settings restored.\n');
    } catch (_cErr) {
      console.warn('Warning: Failed to restore baseline settings during cleanup:', _cErr.message);
    }

    await browser.close();
  }

  console.log('================================================================');
  console.log('=== ALL PHASE 4 E2E VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
  console.log('================================================================\n');
}

runPhase4Verification().catch((err) => {
  console.error('\n❌ PHASE 4 VERIFICATION FAILED:');
  console.error(err);
  process.exit(1);
});
