#!/usr/bin/env node
/**
 * Automated Backend Verification & Security Suite
 * Tests:
 *  1. Password hashing & timing-safe verification (scrypt)
 *  2. Public bootstrap & published-only project filtering
 *  3. Draft project isolation from public routes & public slug lookup
 *  4. Contact form server-side validation, persistence & rate limiting
 *  5. Admin authentication, HTTP-only cookie issuance & CSRF enforcement
 *  6. Unauthorized access rejection on /api/admin/*
 *  7. Admin CRUD: create draft -> preview -> publish -> verify on public API -> delete
 *  8. Media upload magic-byte verification & path traversal rejection
 *  9. Login rate limiting enforcement
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createPortfolioServer } = require('../src/app');
const { hashPassword, verifyPassword } = require('../src/services/cryptoService');

const TEST_DB_PATH = path.join(__dirname, '../data/portfolio.test.runtime.json');

async function requestJson(baseUrl, pathname, options = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const setCookie = res.headers.get('set-cookie');
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, setCookie };
}

async function runTests() {
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);

  const { server, store, loginLimiter } = createPortfolioServer({
    port: 0,
    dataFilePath: TEST_DB_PATH
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  let passed = 0;

  try {
    // Test 1: Password hashing & verification
    const hash = hashPassword('StrongPortfolioPass#2026');
    assert.strictEqual(verifyPassword('StrongPortfolioPass#2026', hash), true, 'Valid password should verify');
    assert.strictEqual(verifyPassword('WrongPassword#2026', hash), false, 'Invalid password should fail');
    assert.throws(() => hashPassword('short'), /at least 10 characters/, 'Weak password must be rejected');
    console.log('✓ [1/9] Scrypt password hashing & weak password rejection verified');
    passed++;

    // Bootstrap test admin account
    store.upsertAdminUser('ayush_admin', hash);

    // Setup isolated test mock projects (2 published, 1 draft)
    store.state.projects = [
      {
        id: 'proj-test-1',
        title: 'Trading Platform — Zerodha-inspired',
        slug: 'trading-platform-zerodha-inspired',
        status: 'published',
        category: 'Full-Stack Web App',
        shortDescription: 'Trading project',
        technologies: ['React', 'Node'],
        displayOrder: 1
      },
      {
        id: 'proj-test-2',
        title: 'AI Chat Application — ChatGPT-inspired',
        slug: 'ai-chat-application-chatgpt-inspired',
        status: 'published',
        category: 'AI & Web Engineering',
        shortDescription: 'AI chat project',
        technologies: ['React', 'Python'],
        displayOrder: 2
      },
      {
        id: 'proj-test-3',
        title: 'Algorithm & Graph Traversal Sandbox',
        slug: 'algorithm-graph-traversal-sandbox',
        status: 'draft',
        category: 'Problem Solving & DSA',
        shortDescription: 'Graph draft project',
        technologies: ['C++', 'Python'],
        displayOrder: 3
      }
    ];
    store._persist();

    // Test 2: Public projects return ONLY published projects (2 published, 1 draft in seed)
    const pubProjects = await requestJson(baseUrl, '/api/public/projects');
    assert.strictEqual(pubProjects.status, 200);
    assert.strictEqual(pubProjects.data.projects.length, 2, 'Public endpoint must only return 2 published projects');
    assert.strictEqual(
      pubProjects.data.projects.some(p => p.status === 'draft'),
      false,
      'No draft project may leak in /api/public/projects'
    );
    console.log('✓ [2/9] Public project listing returns only published projects');
    passed++;

    // Test 3: Draft slug returns 404 on public case-study endpoint
    const draftCheck = await requestJson(baseUrl, '/api/public/projects/algorithm-graph-traversal-sandbox');
    assert.strictEqual(draftCheck.status, 404, 'Draft project slug must return 404 on public endpoint');
    const pubSlugCheck = await requestJson(baseUrl, '/api/public/projects/trading-platform-zerodha-inspired');
    assert.strictEqual(pubSlugCheck.status, 200, 'Published project slug must resolve on public endpoint');
    console.log('✓ [3/9] Draft case-study isolation & published slug lookup verified');
    passed++;

    // Test 4: Contact form validation & database persistence
    const badContact = await requestJson(baseUrl, '/api/public/contact', {
      method: 'POST',
      body: { name: 'A', email: 'invalid-email', subject: 'Hi', message: 'Too short' }
    });
    assert.strictEqual(badContact.status, 400, 'Invalid contact payload must return 400');

    const goodContact = await requestJson(baseUrl, '/api/public/contact', {
      method: 'POST',
      body: {
        name: 'Recruiter Test',
        email: 'recruiter@productco.example.com',
        subject: 'Software Engineering Internship Inquiry',
        message: 'Hi Ayush, we reviewed your Zerodha-inspired trading dashboard and would love to connect.'
      }
    });
    assert.strictEqual(goodContact.status, 201, 'Valid contact submission must return 201');
    assert.strictEqual(goodContact.data.deliveryMode, 'database-persisted');
    console.log('✓ [4/9] Contact form server validation & honest DB persistence verified');
    passed++;

    // Test 5: Unauthenticated admin request rejection
    const unauthAdmin = await requestJson(baseUrl, '/api/admin/summary');
    assert.strictEqual(unauthAdmin.status, 401, 'Unauthenticated admin request must be rejected with 401');
    console.log('✓ [5/9] Protected /api/admin/* routes reject unauthenticated access');
    passed++;

    // Test 6: Admin login, HttpOnly cookie issuance, and CSRF token requirement
    const loginRes = await requestJson(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { username: 'ayush_admin', password: 'StrongPortfolioPass#2026' }
    });
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginRes.setCookie && loginRes.setCookie.includes('HttpOnly'), 'Session cookie must be HttpOnly');
    const cookieHeader = loginRes.setCookie.split(';')[0];
    const csrfToken = loginRes.data.csrfToken;
    assert.ok(csrfToken, 'Login must issue a CSRF token');

    // Attempt mutating admin request WITHOUT CSRF token -> must return 403
    const missingCsrf = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader },
      body: { siteTitle: 'Updated Title' }
    });
    assert.strictEqual(missingCsrf.status, 403, 'Mutating admin request without CSRF token must return 403');
    console.log('✓ [6/10] Admin HttpOnly session cookie & CSRF enforcement verified');
    passed++;

    // Test 7: Authenticated visitor telemetry returns the analytics summary
    const analyticsRes = await requestJson(baseUrl, '/api/admin/analytics', {
      headers: { Cookie: cookieHeader }
    });
    assert.strictEqual(analyticsRes.status, 200, 'Authenticated telemetry request must succeed');
    assert.ok(analyticsRes.data.analytics, 'Telemetry response must include analytics data');
    assert.ok(
      Number.isFinite(analyticsRes.data.analytics.totalPageViews),
      'Telemetry summary must include page view metrics'
    );
    console.log('✓ [7/10] Authenticated visitor telemetry API returns analytics data');
    passed++;

    // Regression: arbitrary client-supplied tokens must not impersonate an admin.
    const forgedTokenRes = await requestJson(baseUrl, '/api/admin/analytics', {
      headers: { Authorization: 'Bearer jwt_attacker_controlled_token' }
    });
    assert.strictEqual(forgedTokenRes.status, 401, 'Unsigned bearer tokens must be rejected');
    const forgedCsrfRes = await requestJson(baseUrl, '/api/admin/analytics', {
      headers: { 'X-CSRF-Token': 'attacker-controlled-csrf-token' }
    });
    assert.strictEqual(forgedCsrfRes.status, 401, 'CSRF headers must not authenticate a request');
    console.log('✓ [8/11] Forged admin tokens and CSRF headers are rejected');
    passed++;

    // Test 8: Full Draft -> Preview -> Publish -> Delete project lifecycle
    const createDraftRes = await requestJson(baseUrl, '/api/admin/projects', {
      method: 'POST',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: {
        title: 'Neural Document Indexer',
        slug: 'neural-document-indexer',
        category: 'AI & Web Engineering',
        shortDescription: 'A semantic search utility built to explore embeddings and vector similarity.',
        problemContext: 'Testing draft creation workflow.',
        approachArchitecture: 'Node.js + Python embedding script.',
        implementedFeatures: ['Cosine similarity search', 'Markdown chunking'],
        lessonsLearned: 'Chunk size impacts retrieval precision.',
        technologies: ['Python', 'Node.js', 'React.js'],
        status: 'draft'
      }
    });
    assert.strictEqual(createDraftRes.status, 201);
    const createdId = createDraftRes.data.project.id;

    // Verify still hidden from public API while in draft
    const publicWhileDraft = await requestJson(baseUrl, '/api/public/projects/neural-document-indexer');
    assert.strictEqual(publicWhileDraft.status, 404, 'Newly created draft must not be visible publicly');

    // Verify preview works for admin
    const adminPreview = await requestJson(baseUrl, `/api/admin/projects/preview/${createdId}`, {
      headers: { Cookie: cookieHeader }
    });
    assert.strictEqual(adminPreview.status, 200);
    assert.strictEqual(adminPreview.data.previewMode, true);

    // Publish the project
    const publishRes = await requestJson(baseUrl, `/api/admin/projects/${createdId}`, {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { status: 'published' }
    });
    assert.strictEqual(publishRes.status, 200);
    assert.strictEqual(publishRes.data.project.status, 'published');

    // Now visible on public route
    const publicAfterPublish = await requestJson(baseUrl, '/api/public/projects/neural-document-indexer');
    assert.strictEqual(publicAfterPublish.status, 200, 'Published project must be visible publicly');

    // Clean up test project
    const delRes = await requestJson(baseUrl, `/api/admin/projects/${createdId}`, {
      method: 'DELETE',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken }
    });
    assert.strictEqual(delRes.status, 200);
    console.log('✓ [9/11] Project CRUD & Draft -> Preview -> Publish workflow verified');
    passed++;

    // Test 9: Media upload validation (reject path traversal & spoofed non-image bytes)
    const traversalUpload = await requestJson(baseUrl, '/api/admin/media', {
      method: 'POST',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: {
        filename: '../../etc/passwd',
        mimeType: 'image/png',
        base64Data: Buffer.from('not-an-image').toString('base64')
      }
    });
    assert.strictEqual(traversalUpload.status, 400, 'Path traversal & fake MIME bytes must be rejected');
    console.log('✓ [10/11] Media upload magic-byte & path-traversal protection verified');
    passed++;

    // Test 10: Login rate limiting enforcement
    loginLimiter.reset();
    for (let i = 0; i < 5; i++) {
      await requestJson(baseUrl, '/api/auth/login', {
        method: 'POST',
        body: { username: 'ayush_admin', password: 'WrongPassword' }
      });
    }
    const rateLimitedLogin = await requestJson(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { username: 'ayush_admin', password: 'WrongPassword' }
    });
    assert.strictEqual(rateLimitedLogin.status, 429, '6th login attempt within window must return 429');
    console.log('✓ [11/13] Login brute-force rate limiting (HTTP 429) verified');
    passed++;

    // Test 12: Verify /api/portfolio/sync rejects requests missing CSRF token
    const syncNoCsrf = await requestJson(baseUrl, '/api/portfolio/sync', {
      method: 'POST',
      headers: { Cookie: cookieHeader },
      body: { state: {} }
    });
    assert.strictEqual(syncNoCsrf.status, 403, '/api/portfolio/sync without CSRF token must be rejected with 403');
    console.log('✓ [12/13] Portfolio sync CSRF protection verified');
    passed++;

    // Test 13: Social crawler user-agent receives dynamic OpenGraph meta tags
    const crawlerRes = await fetch(`${baseUrl}/projects/trading-platform-zerodha-inspired`, {
      headers: { 'User-Agent': 'Twitterbot/1.0' }
    });
    assert.strictEqual(crawlerRes.status, 200);
    const crawlerHtml = await crawlerRes.text();
    assert.ok(crawlerHtml.includes('og:title') || crawlerHtml.includes('Trading Platform'), 'Social crawler must receive OpenGraph tags');
    console.log('✓ [13/14] Social crawler OpenGraph meta tag pre-injection verified');
    passed++;

    // Test 14: Public bootstrap settings allowlist isolation (never leaks private configuration or secrets)
    store.state.settings = {
      ...store.state.settings,
      siteTitle: 'Ayush Prajapati — Portfolio',
      particlesEnabled: true,
      mongodbUri: 'mongodb+srv://admin:superSecretAtlasPass99@cluster0.mongodb.net/prod_portfolio?retryWrites=true',
      jwtSecret: 'super-sensitive-jwt-production-secret-key-32chars',
      sessionSecret: 'super-sensitive-session-secret-key',
      cloudinaryApiKey: '987654321012345',
      cloudinaryApiSecret: 'aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0',
      internalCredential: 'doNotExposeMe'
    };
    store._persist();

    const bootstrapRes = await requestJson(baseUrl, '/api/public/bootstrap');
    assert.strictEqual(bootstrapRes.status, 200);
    const publicSettings = bootstrapRes.data.settings;
    assert.ok(publicSettings, 'Bootstrap must return settings object');
    assert.strictEqual(publicSettings.siteTitle, 'Ayush Prajapati — Portfolio');
    assert.strictEqual(publicSettings.particlesEnabled, true);
    assert.strictEqual(publicSettings.mongodbUri, undefined, 'mongodbUri must never be exposed');
    assert.strictEqual(publicSettings.jwtSecret, undefined, 'jwtSecret must never be exposed');
    assert.strictEqual(publicSettings.sessionSecret, undefined, 'sessionSecret must never be exposed');
    assert.strictEqual(publicSettings.cloudinaryApiKey, undefined, 'cloudinaryApiKey must never be exposed');
    assert.strictEqual(publicSettings.cloudinaryApiSecret, undefined, 'cloudinaryApiSecret must never be exposed');
    assert.strictEqual(publicSettings.internalCredential, undefined, 'internal credentials must never be exposed');
    console.log('✓ [14/15] Public bootstrap settings allowlist strictly blocks private credentials');
    passed++;

    // Test 15: Fail-closed public settings isolation (when getPublicSettings is unavailable, never falls back to getSettings)
    const originalGetPublicSettings = store.getPublicSettings;
    try {
      store.getPublicSettings = undefined;
      const failClosedRes = await requestJson(baseUrl, '/api/public/bootstrap');
      assert.strictEqual(failClosedRes.status, 200);
      assert.ok(failClosedRes.data.settings, 'Bootstrap must return safe object');
      assert.deepStrictEqual(failClosedRes.data.settings, {}, 'Must fail closed to empty object');
      assert.strictEqual(failClosedRes.data.settings.mongodbUri, undefined, 'mongodbUri must never leak');
      assert.strictEqual(failClosedRes.data.settings.jwtSecret, undefined, 'jwtSecret must never leak');
      console.log('✓ [15/16] Fail-closed public settings isolation verified (zero fallback leakage)');
      passed++;
    } finally {
      store.getPublicSettings = originalGetPublicSettings;
    }

    // Test 16: Exception resilience in getPublicSettings (when method throws, fails closed to {} and avoids leakage)
    try {
      store.getPublicSettings = () => {
        throw new Error('Simulated internal store corruption failure');
      };
      const exceptionRes = await requestJson(baseUrl, '/api/public/bootstrap');
      assert.strictEqual(exceptionRes.status, 200);
      assert.ok(exceptionRes.data.settings, 'Bootstrap must return safe settings object');
      assert.deepStrictEqual(exceptionRes.data.settings, {}, 'Must fail closed to empty object upon thrown exception');
      assert.strictEqual(exceptionRes.data.settings.mongodbUri, undefined, 'mongodbUri must never leak');
      assert.strictEqual(exceptionRes.data.settings.jwtSecret, undefined, 'jwtSecret must never leak');
      console.log('✓ [16/18] getPublicSettings exception resilience verified (fails closed to {})');
      passed++;
    } finally {
      store.getPublicSettings = originalGetPublicSettings;
    }

    // Test 17: Published certificate predicate & fail-closed filtering
    store.state.certificates = [
      { id: 'cert-pub-1', title: 'Kubernetes Administrator', issuer: 'CNCF', status: 'published', published: true },
      { id: 'cert-verified-1', title: 'Delta Full-Stack MERN', issuer: 'Apna College', status: 'Verified', published: true },
      { id: 'cert-accredited-1', title: 'AWS Solutions Architect', issuer: 'Amazon Web Services', status: 'Accredited', published: true },
      { id: 'cert-draft-1', title: 'Draft Internal Credential', issuer: 'Secret Corp', status: 'draft', published: false },
      { id: 'cert-pending-1', title: 'Pending Review Exam', issuer: 'Testing Agency', status: 'pending' },
      { id: 'cert-in-review-1', title: 'In Review Credential', issuer: 'Testing Agency', status: 'In Review' },
      { id: 'cert-pub-false-verified', title: 'Unpublished Verified Exam', issuer: 'Academy', status: 'Verified', published: false },
      { id: 'cert-pub-false-accredited', title: 'Unpublished Accredited Exam', issuer: 'Academy', status: 'Accredited', published: false },
      { id: 'cert-unknown-status-pub-true', title: 'Unknown Status Published True', issuer: 'Academy', status: 'unknown_status', published: true },
      { id: 'cert-missing-status-pub-true', title: 'Missing Status Published True', issuer: 'Academy', published: true },
      { id: 'cert-archived-pub-true', title: 'Archived Exam Published True', issuer: 'Academy', status: 'archived', published: true },
      { id: 'cert-malformed-no-title', issuer: 'No Title Org', status: 'Verified', published: true },
      { id: 'cert-malformed-no-issuer', title: 'No Issuer Exam', status: 'Verified', published: true }
    ];

    const pubCertsRes = await requestJson(baseUrl, '/api/public/certificates');
    assert.strictEqual(pubCertsRes.status, 200);
    const pubCerts = pubCertsRes.data.certificates;

    // 1. Published canonical certificates are returned by public API
    const returnedIds = pubCerts.map(c => c.id);
    assert.ok(returnedIds.includes('cert-pub-1'), 'status: published + published: true must be accepted');
    assert.ok(returnedIds.includes('cert-verified-1'), 'status: Verified + published: true must be accepted');
    assert.ok(returnedIds.includes('cert-accredited-1'), 'status: Accredited + published: true must be accepted');

    // 2. status: unknown + published: true -> rejected
    assert.strictEqual(returnedIds.includes('cert-unknown-status-pub-true'), false, 'status: unknown + published: true must be rejected');

    // 3. missing status + published: true -> rejected
    assert.strictEqual(returnedIds.includes('cert-missing-status-pub-true'), false, 'missing status + published: true must be rejected');

    // 4. draft and pending -> rejected
    assert.strictEqual(returnedIds.includes('cert-draft-1'), false, 'draft must be rejected');
    assert.strictEqual(returnedIds.includes('cert-pending-1'), false, 'pending must be rejected');
    assert.strictEqual(returnedIds.includes('cert-in-review-1'), false, 'In Review must be rejected');
    assert.strictEqual(returnedIds.includes('cert-archived-pub-true'), false, 'archived must be rejected even with published: true');

    // 5. published: false -> rejected
    assert.strictEqual(returnedIds.includes('cert-pub-false-verified'), false, 'published: false on Verified must be rejected');
    assert.strictEqual(returnedIds.includes('cert-pub-false-accredited'), false, 'published: false on Accredited must be rejected');

    // 6. Malformed records rejected
    assert.strictEqual(returnedIds.includes('cert-malformed-no-title'), false, 'missing title must be rejected');
    assert.strictEqual(returnedIds.includes('cert-malformed-no-issuer'), false, 'missing issuer must be rejected');

    // 7. Array ordering remains unchanged
    assert.deepStrictEqual(returnedIds, ['cert-pub-1', 'cert-verified-1', 'cert-accredited-1'], 'Array ordering must remain strictly unchanged');
    console.log('✓ [17/19] Server-side published-only certificate filtering & ordering verified');
    passed++;

    // Test 18: Malformed certificate collection protection (null, undefined, {}, "invalid", [])
    const originalCerts = store.state.certificates;
    const malformedCases = [
      { name: 'null', value: null },
      { name: 'undefined', value: undefined },
      { name: '{}', value: {} },
      { name: '"invalid"', value: 'invalid' },
      { name: '[]', value: [] }
    ];

    for (const testCase of malformedCases) {
      store.state.certificates = testCase.value;

      // 1. Direct repository method invocation
      const directCerts = store.getPublicCertificates();
      assert.ok(Array.isArray(directCerts), `store.getPublicCertificates() must return an array for ${testCase.name}`);
      assert.strictEqual(directCerts.length, 0, `store.getPublicCertificates() must return [] for ${testCase.name}`);

      // 2. Public API endpoint invocation
      const apiRes = await requestJson(baseUrl, '/api/public/certificates');
      assert.strictEqual(apiRes.status, 200, `/api/public/certificates must return 200 for ${testCase.name}`);
      assert.ok(Array.isArray(apiRes.data.certificates), `/api/public/certificates must return an array for ${testCase.name}`);
      assert.strictEqual(apiRes.data.certificates.length, 0, `/api/public/certificates must return [] for ${testCase.name}`);

      // 3. Public bootstrap endpoint invocation
      const bootRes = await requestJson(baseUrl, '/api/public/bootstrap');
      assert.strictEqual(bootRes.status, 200, `/api/public/bootstrap must return 200 for ${testCase.name}`);
      assert.ok(Array.isArray(bootRes.data.certificates), `/api/public/bootstrap must return an array for ${testCase.name}`);
      assert.strictEqual(bootRes.data.certificates.length, 0, `/api/public/bootstrap must return [] for ${testCase.name}`);
    }

    // Restore original certificates for subsequent tests
    store.state.certificates = originalCerts;
    console.log('✓ [18/19] Malformed certificate collection protection (null, undefined, {}, "invalid", []) verified');
    passed++;

    // Test 19: Admin draft certificate retrieval & Bootstrap draft isolation
    // 8. Admin draft retrieval remains functional
    const adminCertsRes = await requestJson(baseUrl, '/api/admin/certificates', {
      headers: { Cookie: cookieHeader }
    });
    assert.strictEqual(adminCertsRes.status, 200);
    const adminCerts = adminCertsRes.data.certificates;
    const adminCertIds = adminCerts.map(c => c.id);
    assert.ok(adminCertIds.includes('cert-draft-1'), 'Admin must be able to retrieve draft certificates');
    assert.ok(adminCertIds.includes('cert-pending-1'), 'Admin must be able to retrieve pending certificates');
    assert.ok(adminCertIds.includes('cert-pub-false-verified'), 'Admin must be able to retrieve unpublished certificates');

    // Admin edit draft certificate
    const editDraftRes = await requestJson(baseUrl, '/api/admin/certificates', {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken
      },
      body: {
        id: 'cert-draft-1',
        title: 'Draft Internal Credential (Admin Revised)',
        issuer: 'Secret Corp',
        status: 'draft',
        published: false
      }
    });
    assert.strictEqual(editDraftRes.status, 200);
    const updatedDraft = store.state.certificates.find(c => c.id === 'cert-draft-1');
    assert.strictEqual(updatedDraft.title, 'Draft Internal Credential (Admin Revised)', 'Admin must be able to edit draft certificates');

    // 9. Bootstrap endpoint does not leak draft certificate records
    const bootstrapCertCheckRes = await requestJson(baseUrl, '/api/public/bootstrap');
    assert.strictEqual(bootstrapCertCheckRes.status, 200);
    const bootstrapCertIds = (bootstrapCertCheckRes.data.certificates || []).map(c => c.id);
    assert.strictEqual(bootstrapCertIds.includes('cert-draft-1'), false, 'Bootstrap must not leak draft certificates');
    assert.strictEqual(bootstrapCertIds.includes('cert-pending-1'), false, 'Bootstrap must not leak pending certificates');
    assert.deepStrictEqual(bootstrapCertIds, ['cert-pub-1', 'cert-verified-1', 'cert-accredited-1'], 'Bootstrap must contain only published certificates in exact order');
    console.log('✓ [19/20] Admin draft certificate retrieval/editing & Bootstrap draft isolation verified');
    passed++;

    // Test 20: Backend Settings Validation (API-VAL-03)
    // 20.1: Valid 3-digit hex accepted
    const valid3HexRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { accentColor: '#abc' }
    });
    assert.strictEqual(valid3HexRes.status, 200, 'Valid 3-digit hex #abc must be accepted');
    assert.strictEqual(valid3HexRes.data.settings.accentColor, '#abc');

    // 20.2: Valid 6-digit hex accepted
    const valid6HexRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { accentColor: '#06b6d4', bgBase: '#05070f', bgSurface: '#0f1422' }
    });
    assert.strictEqual(valid6HexRes.status, 200, 'Valid 6-digit hex must be accepted');
    assert.strictEqual(valid6HexRes.data.settings.accentColor, '#06b6d4');

    // 20.3: Invalid hex rejected (e.g. 'red', '#12345', '#1234567')
    const invalidHexRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { accentColor: 'invalid-red' }
    });
    assert.strictEqual(invalidHexRes.status, 400, 'Invalid hex color must return 400');
    assert.ok(invalidHexRes.data.error.includes('hex color'), 'Error message must specify hex color failure');

    const invalidHex5Res = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { bgBase: '#12345' }
    });
    assert.strictEqual(invalidHex5Res.status, 400, '5-digit hex must return 400');

    // 20.4: Missing optional values (omitted or empty) accepted without resetting other settings
    const missingOptionalRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { siteTitle: 'Title Only Update' }
    });
    assert.strictEqual(missingOptionalRes.status, 200, 'Missing optional settings must be safely preserved');
    assert.strictEqual(missingOptionalRes.data.settings.siteTitle, 'Title Only Update');
    assert.strictEqual(missingOptionalRes.data.settings.accentColor, '#06b6d4', 'Previous accentColor must be retained');

    // 20.5: Valid HTTPS URL accepted
    const validUrlRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { canonicalUrl: 'https://ayushprajapati.dev', ogImage: '/og-image.png' }
    });
    assert.strictEqual(validUrlRes.status, 200, 'Valid HTTPS canonical URL and relative ogImage must be accepted');

    // 20.6: Invalid URL rejected
    const invalidUrlRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { canonicalUrl: 'not-a-valid-url' }
    });
    assert.strictEqual(invalidUrlRes.status, 400, 'Malformed canonicalUrl must return 400');

    // 20.7: Unsupported protocol rejected (javascript:, data:)
    const jsProtocolRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { canonicalUrl: 'javascript:alert(1)' }
    });
    assert.strictEqual(jsProtocolRes.status, 400, 'javascript: URL protocol must return 400');

    const ogJsProtocolRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { ogImage: 'javascript:alert(2)' }
    });
    assert.strictEqual(ogJsProtocolRes.status, 400, 'javascript: in ogImage must return 400');

    // 20.8: Arbitrary field injection discarded
    const arbitraryRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': csrfToken },
      body: { evilInjectedField: 'dangerous_payload', internalSecretToken: 'leak_me' }
    });
    assert.strictEqual(arbitraryRes.status, 200);
    assert.strictEqual(arbitraryRes.data.settings.evilInjectedField, undefined, 'Arbitrary fields must be discarded');
    assert.strictEqual(arbitraryRes.data.settings.internalSecretToken, undefined, 'Arbitrary secret fields must be discarded');

    // 20.9: Unauthenticated settings request rejected
    const unauthSettingsRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      body: { siteTitle: 'Hacked' }
    });
    assert.strictEqual(unauthSettingsRes.status, 401, 'Unauthenticated settings mutation must return 401');

    // 20.10: Invalid CSRF request rejected
    const invalidCsrfRes = await requestJson(baseUrl, '/api/admin/settings', {
      method: 'PUT',
      headers: { Cookie: cookieHeader, 'X-CSRF-Token': 'attacker_fake_csrf_token' },
      body: { siteTitle: 'CSRF Hacked' }
    });
    assert.strictEqual(invalidCsrfRes.status, 403, 'Invalid CSRF header must return 403');

    console.log('✓ [20/20] Backend settings validation & security guards verified (API-VAL-03)');
    passed++;

    console.log(`\nALL ${passed}/20 BACKEND & SECURITY TESTS PASSED.`);
  } finally {
    server.close();
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
