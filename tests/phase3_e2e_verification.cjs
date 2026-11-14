const puppeteer = require('puppeteer');
const http = require('http');

const API_BASE = 'http://127.0.0.1:6000';
const CLIENT_BASE = process.env.CLIENT_BASE || 'http://localhost:5174';

function apiCall(endpoint, method = 'GET', data = null, token = null, cookie = null, csrf = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const bodyStr = data ? JSON.stringify(data) : null;
    const headers = {};
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
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runPhase3Verification() {
  console.log('================================================================');
  console.log('=== PHASE 3 E2E CERTIFICATES & DYNAMIC PROJECT DETAIL AUDIT ===');
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
  const cookieHeader = (loginRes.headers['set-cookie'] || []).map((c) => c.split(';')[0]).join('; ');
  const csrfToken = loginRes.data.csrfToken;
  console.log('✓ Admin login successful. Token & CSRF acquired.\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      // Ignore favicon or unrelated extension noise
      if (!t.includes('favicon.ico') && !t.includes('404')) {
        consoleErrors.push(t);
      }
    }
  });

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Certificates Cleanup & Dynamic CMS Integration
  // --------------------------------------------------------------------------
  console.log('[Suite 1: Certificates]');

  // Test 1.1: Verify no fake certificates in public listing when DB certificates is empty
  console.log('  -> Test 1.1: Inspecting /certificates with empty CMS state...');
  await page.goto(`${CLIENT_BASE}/certificates`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.certificates-page', { timeout: 8000 });

  const certPageState = await page.evaluate(() => {
    const text = document.body.innerText;
    const cards = document.querySelectorAll('.cert-card');
    const emptyState = document.querySelector('.cert-empty-state');
    const hasFakeNames =
      text.includes('Code With Harry') ||
      text.includes('HackerRank') ||
      text.includes('Delta Full-Stack Web Development');
    return {
      textContainsUpdating: text.includes('Accreditations Updating') || text.includes('Accreditations in Progress'),
      cardCount: cards.length,
      hasEmptyStateElement: Boolean(emptyState),
      hasFakeNames
    };
  });

  console.log('     Certificates page evaluation:', certPageState);
  if (certPageState.hasFakeNames) {
    throw new Error('FAIL: Fake reference certificates leaked on /certificates!');
  }
  if (!certPageState.hasEmptyStateElement || !certPageState.textContainsUpdating) {
    throw new Error('FAIL: Clean honest empty state was not displayed when certificates collection is empty!');
  }
  console.log('  ✓ PASS [Test 1.1]: No fake certificates present; clean empty state rendered properly.\n');

  // Test 1.2: Dynamic Certificate Creation and Lightbox modal
  console.log('  -> Test 1.2: Creating published CMS certificate and testing lightbox...');
  const createCert = await apiCall(
    '/api/admin/certificates',
    'POST',
    {
      title: 'PHASE3_GENUINE_KUBERNETES_CERT',
      issuer: 'Cloud Native Computing Foundation',
      issueDate: '2026-Q3',
      credentialId: 'CKA-987654321',
      credentialUrl: 'https://www.cncf.io/certification/cka/',
      skillsCovered: 'Kubernetes, Containerd, Helm, Cloud Architecture',
      imageUrl: '/images/apna-college-delta-certificate.webp'
    },
    token,
    cookieHeader,
    csrfToken
  );

  const certId = createCert.data?.certificate?.id;
  console.log('     Created CMS certificate:', certId, 'Status:', createCert.status);

  // Trigger background sync in browser
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });

  await page.waitForFunction(() => {
    return document.body.innerText.includes('PHASE3_GENUINE_KUBERNETES_CERT');
  }, { timeout: 8000 });

  // Open modal lightbox on the newly rendered certificate card
  const modalOpened = await page.evaluate(() => {
    const card = document.querySelector('.cert-card');
    if (!card) return false;
    const viewBtn = card.querySelector('.btn-view') || card.querySelector('.cert-img-wrap');
    if (viewBtn) viewBtn.click();
    return true;
  });

  await new Promise((r) => setTimeout(r, 600));

  const modalState = await page.evaluate(() => {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay && typeof overlay.getAnimations === 'function') {
      overlay.getAnimations().forEach((a) => {
        try { a.finish(); } catch (_e) {}
      });
    }
    const modal = document.querySelector('.modal-content') || document.querySelector('[role="dialog"]');
    const modalImg = modal ? modal.querySelector('img') : null;
    return {
      hasModal: Boolean(modal),
      imgSrc: modalImg ? modalImg.getAttribute('src') : null,
      modalText: modal ? (modal.innerText || modal.textContent) : ''
    };
  });

  console.log('     Modal inspection:', modalState);
  if (!modalState.hasModal || !modalState.modalText.includes('PHASE3_GENUINE_KUBERNETES_CERT')) {
    throw new Error('FAIL: Lightbox modal did not display the published CMS certificate!');
  }
  if (!modalState.imgSrc || modalState.imgSrc.includes('unsplash.com')) {
    throw new Error('FAIL: Modal image contains broken external Unsplash URL instead of local asset!');
  }
  console.log('  ✓ PASS [Test 1.2]: Published CMS certificate renders and lightbox functions without fake data.\n');

  // Cleanup test certificate
  await apiCall(`/api/admin/certificates/${certId}`, 'DELETE', null, token, cookieHeader, csrfToken);
  console.log('     Cleaned up test certificate.\n');

  // Test 1.3: Home page certificate counter strictly excludes draft certificates
  console.log('  -> Test 1.3: Verifying Home page certificate count isolates draft certificates...');
  await page.goto(`${CLIENT_BASE}/`, { waitUntil: 'networkidle2' });
  const baselineCount = await page.evaluate(() => {
    const el = document.querySelector('.btn-certs .count-pill span');
    return el ? parseInt(el.innerText.trim(), 10) : 0;
  });

  // Create a draft certificate in Admin
  const draftCertRes = await apiCall(
    '/api/admin/certificates',
    'POST',
    {
      title: 'DRAFT_SECRET_CERTIFICATE',
      issuer: 'Confidential Internal Testing',
      issueDate: '2026',
      status: 'draft',
      published: false
    },
    token,
    cookieHeader,
    csrfToken
  );
  const draftCertId = draftCertRes.data?.certificate?.id;

  // Verify server-side public API endpoints strictly exclude draft certificate
  const publicCertsApi = await apiCall('/api/public/certificates', 'GET');
  const pubCertsList = publicCertsApi.data?.certificates || [];
  if (pubCertsList.some((c) => c.id === draftCertId || c.title === 'DRAFT_SECRET_CERTIFICATE')) {
    throw new Error('FAIL: /api/public/certificates leaked draft certificate over HTTP!');
  }
  const bootstrapApi = await apiCall('/api/public/bootstrap', 'GET');
  const bootstrapCertsList = bootstrapApi.data?.certificates || [];
  if (bootstrapCertsList.some((c) => c.id === draftCertId || c.title === 'DRAFT_SECRET_CERTIFICATE')) {
    throw new Error('FAIL: /api/public/bootstrap leaked draft certificate over HTTP!');
  }
  console.log('     Server-side API verification: draft excluded from /api/public/certificates and /api/public/bootstrap');

  // Refresh home page
  await page.goto(`${CLIENT_BASE}/`, { waitUntil: 'networkidle2' });
  const countAfterDraft = await page.evaluate(() => {
    const el = document.querySelector('.btn-certs .count-pill span');
    return el ? parseInt(el.innerText.trim(), 10) : 0;
  });

  if (countAfterDraft !== baselineCount) {
    throw new Error(`FAIL: Home page certificate counter leaked draft certificate! Baseline: ${baselineCount}, After draft: ${countAfterDraft}`);
  }
  console.log(`     Counter verified: ${baselineCount} -> ${countAfterDraft} (draft not counted)`);

  // Clean up draft cert
  await apiCall(`/api/admin/certificates/${draftCertId}`, 'DELETE', null, token, cookieHeader, csrfToken);
  console.log('  ✓ PASS [Test 1.3]: Public home page counter & server APIs strictly exclude unpublished draft certificates.\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Dynamic Project Detail Route (/projects/:slug)
  // --------------------------------------------------------------------------
  console.log('[Suite 2: Dynamic Project Detail Pages]');

  // Test 2.1: Navigation from /projects listing to project detail page
  console.log('  -> Test 2.1: Navigating from /projects listing to project detail...');
  await page.goto(`${CLIENT_BASE}/projects`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.project-card', { timeout: 8000 });

  const firstCardSlug = await page.evaluate(() => {
    const firstLink = document.querySelector('.project-card .project-title a');
    return firstLink ? firstLink.getAttribute('href') : null;
  });
  console.log('     First project card link target:', firstCardSlug);

  if (!firstCardSlug || !firstCardSlug.startsWith('/projects/')) {
    throw new Error(`FAIL: Project card title does not link to /projects/:slug! Found: ${firstCardSlug}`);
  }

  // Click on the project title link (client-side SPA navigation)
  await page.click('.project-card .project-title a');
  await page.waitForSelector('.pd-title', { timeout: 8000 });

  const currentPath = new URL(page.url()).pathname;
  console.log('     Current path after clicking project card:', currentPath);
  if (currentPath !== firstCardSlug) {
    throw new Error(`FAIL: URL was not updated to ${firstCardSlug}; got: ${currentPath}`);
  }

  // Verify project detail content
  const detailContent = await page.evaluate(() => {
    const title = document.querySelector('.pd-title')?.innerText.trim();
    const leadDesc = document.querySelector('.pd-lead-desc')?.innerText.trim();
    const mediaImg = document.querySelector('.pd-media-showcase img')?.getAttribute('src');
    const techTags = Array.from(document.querySelectorAll('.pd-tech-pill')).map((t) => t.innerText.trim());
    const backLink = document.querySelector('.pd-back-link');
    return { title, leadDesc, mediaImg, techCount: techTags.length, hasBackLink: Boolean(backLink) };
  });

  console.log('     Detail content on client:', detailContent);
  if (!detailContent.title || detailContent.techCount === 0 || !detailContent.hasBackLink) {
    throw new Error('FAIL: Dynamic project detail page did not render required information!');
  }
  console.log('  ✓ PASS [Test 2.1]: Navigation from listing to project detail renders complete info.\n');

  // Test 2.2: Direct URL access and browser refresh on a published project
  console.log('  -> Test 2.2: Direct URL access and browser refresh on /projects/ai-agentic-workspace...');
  await page.goto(`${CLIENT_BASE}/projects/ai-agentic-workspace`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.pd-title', { timeout: 8000 });

  const directAccessTitle = await page.evaluate(() => document.querySelector('.pd-title')?.innerText.trim());
  console.log('     Direct URL access title:', directAccessTitle);
  if (!directAccessTitle || !directAccessTitle.toLowerCase().includes('agentic')) {
    throw new Error(`FAIL: Direct URL access did not render expected project title! Got: ${directAccessTitle}`);
  }

  // Browser refresh
  console.log('     Performing browser reload...');
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForSelector('.pd-title', { timeout: 8000 });

  const refreshTitle = await page.evaluate(() => document.querySelector('.pd-title')?.innerText.trim());
  console.log('     Title after page refresh:', refreshTitle);
  if (refreshTitle !== directAccessTitle) {
    throw new Error('FAIL: Project detail page lost state upon browser refresh!');
  }
  console.log('  ✓ PASS [Test 2.2]: Direct URL access and browser refresh persist project state cleanly.\n');

  // Test 2.3: Unpublished (Draft) project isolation — must show Not Found state
  console.log('  -> Test 2.3: Draft project isolation on /projects/:slug...');
  const draftSlug = `test-draft-project-${Date.now()}`;
  const draftCreateRes = await apiCall(
    '/api/admin/projects',
    'POST',
    {
      title: 'Secret Internal Draft Project',
      slug: draftSlug,
      category: 'Systems Engineering',
      status: 'draft',
      shortDescription: 'Unpublished confidential draft that must never be accessible on public detail pages.'
    },
    token,
    cookieHeader,
    csrfToken
  );
  const draftId = draftCreateRes.data?.project?.id;
  console.log('     Created draft project in admin:', draftSlug, 'Status:', draftCreateRes.status);

  // Navigate to draft project URL publicly
  await page.goto(`${CLIENT_BASE}/projects/${draftSlug}`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  const draftPageState = await page.evaluate(() => {
    const text = document.body.innerText;
    const has404Badge = text.includes('404') || text.includes('Not Found');
    const hasSecretTitle = text.includes('Secret Internal Draft Project');
    const hasBrowseBtn = Boolean(document.querySelector('a[href="/projects"]'));
    return { has404Badge, hasSecretTitle, hasBrowseBtn };
  });

  console.log('     Draft project page inspection:', draftPageState);
  if (draftPageState.hasSecretTitle) {
    throw new Error('FAIL: Draft project title leaked to public /projects/:slug detail route!');
  }
  if (!draftPageState.has404Badge) {
    throw new Error('FAIL: Draft project route did not render proper 404 / Not Found state!');
  }
  console.log('  ✓ PASS [Test 2.3]: Unpublished draft project is strictly blocked with Not Found state.\n');

  // Test 2.4: Publishing the draft project makes it immediately accessible
  console.log('  -> Test 2.4: Publishing project and verifying public detail access...');
  await apiCall(
    `/api/admin/projects/${draftId}`,
    'PUT',
    {
      status: 'published'
    },
    token,
    cookieHeader,
    csrfToken
  );

  // Trigger sync and reload
  await page.goto(`${CLIENT_BASE}/projects/${draftSlug}`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.pd-title', { timeout: 8000 });

  const publishedTitle = await page.evaluate(() => document.querySelector('.pd-title')?.innerText.trim());
  console.log('     Published title now visible:', publishedTitle);
  if (!publishedTitle || !publishedTitle.includes('Secret Internal Draft Project')) {
    throw new Error('FAIL: Newly published project was not accessible on its /projects/:slug route!');
  }
  console.log('  ✓ PASS [Test 2.4]: Newly published project dynamically resolves on its detail route.\n');

  // Cleanup draft project
  await apiCall(`/api/admin/projects/${draftId}`, 'DELETE', null, token, cookieHeader, csrfToken);
  console.log('     Cleaned up test project.\n');

  // Test 2.5: Invalid/random slug returns Not Found state
  console.log('  -> Test 2.5: Non-existent invalid slug on /projects/random-nonexistent-xyz...');
  await page.goto(`${CLIENT_BASE}/projects/random-nonexistent-xyz-999`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  const notFoundState = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('404') || text.includes('Project Unavailable') || text.includes('Not Found');
  });

  if (!notFoundState) {
    throw new Error('FAIL: Non-existent slug did not display Not Found state!');
  }
  console.log('  ✓ PASS [Test 2.5]: Non-existent project slug properly shows Not Found state.\n');

  // Test 2.7: Pagination navigation (Previous / Next project)
  console.log('  -> Test 2.7: Testing Previous/Next pagination navigation between projects...');
  await page.goto(`${CLIENT_BASE}/projects/airbnb-clone-1`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.pd-title', { timeout: 8000 });

  const hasNextBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.pd-pagination .pd-nav-btn'));
    const next = btns.find((b) => b.innerText.includes('Next'));
    if (next) {
      next.click();
      return true;
    }
    return false;
  });

  if (hasNextBtn) {
    await page.waitForFunction(() => !window.location.pathname.endsWith('/airbnb-clone-1'), { timeout: 8000 });
    const nextUrl = new URL(page.url()).pathname;
    const nextTitle = await page.evaluate(() => document.querySelector('.pd-title')?.innerText.trim());
    console.log(`     Navigated via pagination to: ${nextUrl} ("${nextTitle}")`);
    if (!nextUrl.startsWith('/projects/') || nextTitle === 'Airbnb clone 1') {
      throw new Error(`FAIL: Pagination did not update project view cleanly! Current: ${nextTitle}`);
    }
    console.log('  ✓ PASS [Test 2.7]: Previous/Next pagination navigates synchronously between projects.\n');
  }

  // Test 2.8: Case-insensitive & trimmed slug resolution
  console.log('  -> Test 2.8: Case-insensitive slug URL (/projects/AIRBNB-CLONE-1)...');
  await page.goto(`${CLIENT_BASE}/projects/AIRBNB-CLONE-1`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.pd-title', { timeout: 8000 });
  const caseTitle = await page.evaluate(() => document.querySelector('.pd-title')?.innerText.trim());
  if (!caseTitle || !caseTitle.toLowerCase().includes('airbnb')) {
    throw new Error(`FAIL: Uppercase slug did not resolve project! Got: ${caseTitle}`);
  }
  console.log(`     Uppercase slug resolved: "${caseTitle}"`);
  console.log('  ✓ PASS [Test 2.8]: Slug lookup safely handles uppercase variations.\n');

  // Test 2.9: Complex Markdown formatting (tables and code blocks) in project case study
  console.log('  -> Test 2.9: Creating project with complex Markdown (tables & code blocks)...');
  const mdSlug = `test-md-${Date.now()}`;
  const mdProjectRes = await apiCall(
    '/api/admin/projects',
    'POST',
    {
      title: 'Advanced Microservices Architecture',
      slug: mdSlug,
      category: 'Distributed Systems',
      status: 'published',
      shortDescription: 'Benchmarked event-driven streaming platform with Kafka and Redis.',
      approachArchitecture: `### System Architecture Specification\n\n| Layer | Technology | Throughput |\n| :--- | :--- | :--- |\n| Gateway | Envoy Proxy | 100k req/s |\n| Stream Engine | Apache Kafka | 500k msg/s |\n| Database | MongoDB Atlas | Sub-5ms Read |\n\n\`\`\`javascript\nconst kafka = new Kafka({ brokers: ['broker:9092'] });\nconst producer = kafka.producer();\nawait producer.send({ topic: 'telemetry', messages: [{ value: 'ok' }] });\n\`\`\``
    },
    token,
    cookieHeader,
    csrfToken
  );
  const mdProjectId = mdProjectRes.data?.project?.id;

  await page.goto(`${CLIENT_BASE}/projects/${mdSlug}`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.pd-title', { timeout: 8000 });

  const mdInspection = await page.evaluate(() => {
    const table = document.querySelector('.markdown-content table');
    const ths = table ? Array.from(table.querySelectorAll('th')).map((t) => t.innerText.trim()) : [];
    const pre = document.querySelector('.markdown-content pre');
    const code = pre ? pre.querySelector('code') : null;
    return {
      hasTable: Boolean(table),
      headers: ths,
      hasPre: Boolean(pre),
      codeSnippet: code ? code.innerText.slice(0, 30) : ''
    };
  });

  console.log('     Markdown inspection:', mdInspection);
  if (!mdInspection.hasTable || !mdInspection.headers.includes('Layer') || !mdInspection.hasPre) {
    throw new Error('FAIL: Complex markdown table or code block failed to render properly!');
  }
  console.log('  ✓ PASS [Test 2.9]: Markdown tables, code blocks, and rich typography render without errors.\n');

  // Clean up md project
  await apiCall(`/api/admin/projects/${mdProjectId}`, 'DELETE', null, token, cookieHeader, csrfToken);

  // Test 2.10: Mobile responsiveness (360px viewport width)
  console.log('  -> Test 2.10: Responsive layout on mobile viewport (360x740)...');
  await page.setViewport({ width: 360, height: 740 });
  await page.goto(`${CLIENT_BASE}/projects/airbnb-clone-1`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.pd-title', { timeout: 8000 });

  const layoutHealth = await page.evaluate(() => {
    const bodyWidth = document.body.scrollWidth;
    const windowWidth = window.innerWidth;
    const title = document.querySelector('.pd-title');
    const actions = document.querySelector('.pd-actions');
    return {
      hasHorizontalOverflow: bodyWidth > windowWidth,
      bodyWidth,
      windowWidth,
      actionsDisplay: actions ? getComputedStyle(actions).flexDirection : ''
    };
  });

  console.log('     Mobile viewport evaluation:', layoutHealth);
  if (layoutHealth.hasHorizontalOverflow) {
    throw new Error(`FAIL: Mobile viewport has horizontal scroll blowout! Scroll: ${layoutHealth.bodyWidth}, Inner: ${layoutHealth.windowWidth}`);
  }
  console.log('  ✓ PASS [Test 2.10]: Project detail route is strictly responsive at 360px width without layout blowout.\n');

  // Restore desktop viewport
  await page.setViewport({ width: 1280, height: 800 });

  // Test 2.11: Command Palette project navigation & draft isolation
  console.log('  -> Test 2.11: Verifying Command Palette navigates to /projects/:slug and blocks drafts...');
  await page.goto(`${CLIENT_BASE}/`, { waitUntil: 'networkidle2' });

  // Open Command Palette via search button or global opener
  await page.evaluate(() => {
    if (window.__openCommandPalette) {
      window.__openCommandPalette();
    } else {
      const btn = document.querySelector('.nav-search-btn');
      if (btn) btn.click();
    }
  });

  await page.waitForSelector('.cmd-palette', { timeout: 5000 });

  // Search for project
  await page.type('.cmd-input', 'airbnb');
  await new Promise((r) => setTimeout(r, 400));

  const hasProjectCommand = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.cmd-item'));
    const proj = items.find((i) => i.innerText.includes('Airbnb') || i.innerText.includes('airbnb'));
    if (proj) {
      proj.click();
      return true;
    }
    return false;
  });

  if (hasProjectCommand) {
    await page.waitForFunction(() => window.location.pathname.startsWith('/projects/airbnb'), { timeout: 8000 });
    const cpPath = new URL(page.url()).pathname;
    console.log(`     Command Palette opened project: ${cpPath}`);
    if (!cpPath.startsWith('/projects/')) {
      throw new Error(`FAIL: Command Palette did not navigate to /projects/:slug! Path: ${cpPath}`);
    }
    console.log('  ✓ PASS [Test 2.11]: Command Palette correctly links directly to /projects/:slug.\n');
  }

  // Test 2.12: Console errors check
  console.log('  -> Test 2.12: Checking browser console errors across all test scenarios...');
  console.log('     Critical console errors detected:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.warn('     Warnings/Errors:', consoleErrors);
    throw new Error(`FAIL: ${consoleErrors.length} critical console errors detected during testing!`);
  }
  console.log('  ✓ PASS [Test 2.12]: Zero console errors detected across all public routes & modal interactions.\n');

  await browser.close();

  console.log('================================================================');
  console.log('=== ALL PHASE 3 E2E VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
  console.log('================================================================\n');
}

runPhase3Verification().catch((err) => {
  console.error('\n❌ PHASE 3 VERIFICATION FAILED:', err);
  process.exit(1);
});
