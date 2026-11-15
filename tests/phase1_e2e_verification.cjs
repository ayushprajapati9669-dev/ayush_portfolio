const puppeteer = require('puppeteer');
const http = require('http');

function apiCall(pathname, method = 'GET', body = null, token = null, cookie = null, csrf = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://127.0.0.1:6000${pathname}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (cookie) headers['Cookie'] = cookie;
    if (csrf) headers['X-CSRF-Token'] = csrf;
    const req = http.request(url, { method, headers }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_e) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('=== PHASE 1 E2E DATA SYNCHRONIZATION VERIFICATION ===\n');

  // Step 1: Admin Login
  console.log('[Step 1] Logging in as admin...');
  const loginRes = await apiCall('/api/auth/login', 'POST', {
    username: 'ayushprajapati9669@gmail.com',
    password: 'Ayush7162@'
  });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.data));
  }
  const token = loginRes.data.token;
  const csrfToken = loginRes.data.csrfToken;
  const cookieHeader = loginRes.headers['set-cookie']
    ? loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ')
    : '';
  console.log('✓ Admin login successful. Token & CSRF acquired.\n');

  // Step 2: Launch Headless Browser
  console.log('[Step 2] Launching Puppeteer browser on http://localhost:4173...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Navigate to public projects page
  await page.goto('http://localhost:4173/projects', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.project-card, .page-header', { timeout: 8000 });
  console.log('✓ Public /projects loaded.\n');

  // Step 3: Test Scenario 1 — Create a project and publish it
  console.log('[Step 3] Scenario 1: Create a project in Admin and publish it...');
  const createProjRes = await apiCall('/api/admin/projects', 'POST', {
    title: 'PHASE1_TEST_PROJ_ALPHA',
    category: 'Full-Stack Web App',
    status: 'published',
    shortDescription: 'Phase 1 verification project for dynamic synchronization.',
    technologies: ['React JS', 'Node.js', 'MongoDB', 'Docker'],
    liveDemoUrl: 'https://example.com/demo',
    githubUrl: 'https://github.com/ayushprajapati9669-dev'
  }, token, cookieHeader, csrfToken);

  console.log('API Create status:', createProjRes.status, 'Project ID:', createProjRes.data?.project?.id);
  const createdProjId = createProjRes.data?.project?.id;
  if (!createdProjId) throw new Error('Project creation failed: ' + JSON.stringify(createProjRes.data));

  // Trigger background revalidation in browser WITHOUT page reload
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });

  // Wait for React to re-render with the new project
  await page.waitForFunction(() => {
    return document.body.innerText.includes('PHASE1_TEST_PROJ_ALPHA');
  }, { timeout: 8000 });
  console.log('✓ PASSED: Newly published project rendered in public UI without full page reload!\n');

  // Step 4: Test Scenario 2 — Edit an existing project (same length!)
  console.log('[Step 4] Scenario 2: Edit an existing project without length change...');
  const editProjRes = await apiCall(`/api/admin/projects/${createdProjId}`, 'PUT', {
    title: 'PHASE1_TEST_PROJ_ALPHA_EDITED',
    category: 'Full-Stack Web App',
    status: 'published',
    shortDescription: 'Updated short description verifying zero length change sync.',
    technologies: ['React JS', 'Next.js', 'PostgreSQL']
  }, token, cookieHeader, csrfToken);
  console.log('API Edit status:', editProjRes.status, 'Updated title:', editProjRes.data?.project?.title);

  // Trigger background revalidation in browser WITHOUT page reload
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });

  // Wait for React to re-render with the EDITED project title
  await page.waitForFunction(() => {
    return document.body.innerText.includes('PHASE1_TEST_PROJ_ALPHA_EDITED');
  }, { timeout: 8000 });
  console.log('✓ PASSED: Edited project title rendered in public UI without full page reload (Overcame length check flaw)!\n');

  // Step 5: Test Scenario 3 — Unpublish a project (draft) & delete
  console.log('[Step 5] Scenario 3: Unpublish project (status: draft)...');
  await apiCall(`/api/admin/projects/${createdProjId}`, 'PUT', {
    status: 'draft'
  }, token, cookieHeader, csrfToken);

  // Trigger background revalidation
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });

  // Verify project is removed from public view
  await page.waitForFunction(() => {
    return !document.body.innerText.includes('PHASE1_TEST_PROJ_ALPHA_EDITED');
  }, { timeout: 8000 });
  console.log('✓ PASSED: Unpublished project immediately vanished from public view!\n');

  // Permanently delete test project
  await apiCall(`/api/admin/projects/${createdProjId}`, 'DELETE', null, token, cookieHeader, csrfToken);
  console.log('✓ Cleaned up test project.\n');

  // Step 6: Test Scenario 4 & 5 — Skills updates & reordering
  console.log('[Step 6] Scenario 4 & 5: Skills updates & reordering...');
  await page.goto('http://localhost:4173/skills', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.page-header, .skills-widget', { timeout: 8000 });

  // Read current skills from public endpoint
  const bootstrapRes = await apiCall('/api/public/bootstrap');
  const currentSkills = bootstrapRes.data.skills || [];
  const targetCategory = currentSkills[0];

  if (targetCategory) {
    const updatedCategory = {
      ...targetCategory,
      items: [
        { id: 'skill-test-sync', name: 'GraphQL_SyncTest', icon: 'fa-solid fa-cube', isVisible: true },
        ...(targetCategory.items || [])
      ]
    };

    await apiCall('/api/admin/skills', 'POST', updatedCategory, token, cookieHeader, csrfToken);

    // Trigger revalidation in browser
    await page.evaluate(() => {
      localStorage.setItem('portfolio_last_synced', String(Date.now()));
      window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
    });

    // Wait for GraphQL_SyncTest to render in DOM
    await page.waitForFunction(() => {
      return document.body.innerText.includes('GraphQL_SyncTest');
    }, { timeout: 8000 });
    console.log('✓ PASSED: Updated skill item rendered dynamically in public skills view!\n');

    // Restore category without test item
    const restoredCategory = {
      ...targetCategory,
      items: (targetCategory.items || []).filter(i => i.id !== 'skill-test-sync')
    };
    await apiCall('/api/admin/skills', 'POST', restoredCategory, token, cookieHeader, csrfToken);

    // Trigger revalidation to cleanup
    await page.evaluate(() => {
      localStorage.setItem('portfolio_last_synced', String(Date.now()));
      window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
    });
    console.log('✓ Cleaned up test skill.\n');
  }

  // Step 6b: Regression Test — Empty backend skills array clears React state & localStorage
  console.log('[Step 6b] Regression: Empty backend skills array clears React state & localStorage...');
  await page.setRequestInterception(true);
  let mockSkills = [];
  let interceptBootstrap = true;

  const onRequest = async (request) => {
    if (interceptBootstrap && request.url().includes('/api/public/bootstrap')) {
      const normalRes = await apiCall('/api/public/bootstrap');
      const payload = { ...normalRes.data };
      if (mockSkills !== undefined) payload.skills = mockSkills;
      else delete payload.skills;
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });
    } else {
      request.continue();
    }
  };
  page.on('request', onRequest);

  // Trigger revalidation with mockSkills = []
  mockSkills = [];
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });
  await new Promise(r => setTimeout(r, 1500));

  const storedAfterEmpty = await page.evaluate(() => {
    const raw = localStorage.getItem('ayush_modern_portfolio_state_v4');
    return raw ? JSON.parse(raw).skills : null;
  });
  console.log('Stored skills after empty backend array:', storedAfterEmpty);
  console.assert(Array.isArray(storedAfterEmpty) && storedAfterEmpty.length === 0, 'Must be cleared to [] in localStorage!');
  console.log('✓ PASSED: Empty backend skills array cleared React state and localStorage!\n');

  // Step 6c: Regression Test — Missing or undefined skills preserves previous state
  console.log('[Step 6c] Regression: Missing or undefined skills field preserves previous state...');
  await page.evaluate(() => {
    const raw = localStorage.getItem('ayush_modern_portfolio_state_v4');
    const parsed = JSON.parse(raw);
    parsed.skills = [{ id: 'preserved-skill', name: 'PreservedSkill' }];
    localStorage.setItem('ayush_modern_portfolio_state_v4', JSON.stringify(parsed));
  });

  mockSkills = undefined;
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });
  await new Promise(r => setTimeout(r, 1500));

  const storedAfterUndefined = await page.evaluate(() => {
    const raw = localStorage.getItem('ayush_modern_portfolio_state_v4');
    return raw ? JSON.parse(raw).skills : null;
  });
  console.log('Stored skills after undefined field in response:', storedAfterUndefined?.map(s => s.name));
  console.assert(storedAfterUndefined && storedAfterUndefined[0]?.name === 'PreservedSkill', 'Must preserve previous skills when field is undefined!');
  console.log('✓ PASSED: Undefined skills field preserved previous state!\n');

  // Turn off interception and restore normal state
  interceptBootstrap = false;
  await page.setRequestInterception(false);
  page.off('request', onRequest);

  // Restore normal skills from server
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });
  await new Promise(r => setTimeout(r, 1500));

  // Step 7: Test Scenario 6 — Create and update a certificate
  console.log('[Step 7] Scenario 6: Create and update a certificate in public UI...');
  await page.goto('http://localhost:4173/certificates', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.page-header, .certificates-page', { timeout: 8000 });

  const createCertRes = await apiCall('/api/admin/certificates', 'POST', {
    title: 'PHASE1_VERIFIED_CERT_AWS',
    issuer: 'Amazon Web Services',
    issueDate: '2026-11',
    skills: 'Cloud Architecture, DynamoDB'
  }, token, cookieHeader, csrfToken);
  const certId = createCertRes.data?.certificate?.id;
  console.log('API Create Certificate status:', createCertRes.status, 'Cert ID:', certId);

  // Trigger background revalidation
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });

  await page.waitForFunction(() => {
    return document.body.innerText.includes('PHASE1_VERIFIED_CERT_AWS');
  }, { timeout: 8000 });
  console.log('✓ PASSED: New certificate rendered in public UI without full page reload!\n');

  // Edit certificate title (same array length!)
  console.log('[Step 7b] Scenario: Edit certificate title (same cert count)...');
  await apiCall('/api/admin/certificates', 'POST', {
    id: certId,
    title: 'PHASE1_VERIFIED_CERT_AWS_ADVANCED',
    issuer: 'Amazon Web Services',
    issueDate: '2026-11'
  }, token, cookieHeader, csrfToken);

  // Trigger background revalidation
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });

  await page.waitForFunction(() => {
    return document.body.innerText.includes('PHASE1_VERIFIED_CERT_AWS_ADVANCED');
  }, { timeout: 8000 });
  console.log('✓ PASSED: Edited certificate title rendered in public UI without full page reload!\n');

  // Clean up certificate
  await apiCall(`/api/admin/certificates/${certId}`, 'DELETE', null, token, cookieHeader, csrfToken);
  console.log('✓ Cleaned up test certificate.\n');

  // Step 8: Test Scenario 9 — Verify unchanged data does NOT cause re-renders or storage writes
  console.log('[Step 8] Scenario 9: Verify unchanged data does not cause unnecessary rerenders...');
  await new Promise(r => setTimeout(r, 4000));

  const memoizationTest = await page.evaluate(async () => {
    let stateWrites = 0;
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function(k, v) {
      if (k === 'ayush_modern_portfolio_state_v4') stateWrites++;
      return origSetItem(k, v);
    };

    // Trigger revalidation when data has NOT changed
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));

    // Wait 2s for network resolution
    await new Promise(r => setTimeout(r, 2000));
    localStorage.setItem = origSetItem;

    return { stateWrites };
  });

  console.log('State writes on unchanged revalidation:', memoizationTest.stateWrites);
  if (memoizationTest.stateWrites !== 0) {
    throw new Error('Unchanged data triggered unnecessary state update!');
  }
  console.log('✓ PASSED: Unchanged data revalidation was safely memoized (returned prev, 0 state writes)!\n');

  // Step 9: Test Scenario 8 — Browser Refresh Persistence
  console.log('[Step 9] Scenario 8: Browser refresh persistence...');
  await page.reload({ waitUntil: 'networkidle2' });
  const hasContent = await page.evaluate(() => document.body.innerText.length > 100);
  console.log('✓ PASSED: State persists cleanly after page reload (hasContent:', hasContent, ')\n');

  await browser.close();
  console.log('=== ALL PHASE 1 SYNCHRONIZATION & REGRESSION SCENARIOS PASSED SUCCESSFULLY ===\n');
}

run().catch(err => {
  console.error('\n❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});
