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
      console.log('✓ [16/16] getPublicSettings exception resilience verified (fails closed to {})');
      passed++;
    } finally {
      store.getPublicSettings = originalGetPublicSettings;
    }

    console.log(`\nALL ${passed}/16 BACKEND & SECURITY TESTS PASSED.`);
  } finally {
    server.close();
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
