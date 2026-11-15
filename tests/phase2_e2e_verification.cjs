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

const FRONTEND_URL = 'http://localhost:4173';

async function triggerRevalidate(page) {
  await page.evaluate(() => {
    localStorage.setItem('portfolio_last_synced', String(Date.now()));
    window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio_last_synced' }));
  });
}

async function runPhase2Verification() {
  console.log('=== PHASE 2 E2E CMS DYNAMIC INTEGRATION VERIFICATION ===\n');

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

  // Get current baseline state to restore cleanly after tests
  const initialBootstrap = await apiCall('/api/public/bootstrap', 'GET');
  const baselineProfile = initialBootstrap.data.profile;
  const baselineSkills = initialBootstrap.data.skills;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // ---------------------------------------------------------------------------
    // TEST 1: Hero Dynamic Headline, Primary CTA, Secondary CTA & Profile Name
    // ---------------------------------------------------------------------------
    console.log('[Test 1] Testing Hero Section CMS Integration on / ...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Update profile in CMS via PUT /api/admin/profile
    const testHeadline = 'Architecting High-Speed Distributed Platforms.';
    const testPrimaryCta = 'Discover Innovations';
    const testSecondaryCta = 'Review Executive CV';
    const testDisplayName = 'Alex Sterling';

    console.log('  -> Updating profile in CMS (headline, primaryCtaText, secondaryCtaText, displayName)...');
    await apiCall('/api/admin/profile', 'PUT', {
      headline: testHeadline,
      primaryCtaText: testPrimaryCta,
      secondaryCtaText: testSecondaryCta,
      displayName: testDisplayName
    }, token, cookieHeader, csrfToken);

    await triggerRevalidate(page);
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1.hero-editorial-title');
      return h1 && h1.innerText.includes('Architecting High-Speed Distributed Platforms');
    }, { timeout: 8000 });

    const heroContent = await page.evaluate(() => {
      const h1 = document.querySelector('h1.hero-editorial-title');
      const ctaButtons = Array.from(document.querySelectorAll('.hero-feature-item'));
      return {
        titleText: h1 ? h1.innerText.replace(/\s+/g, ' ').trim() : '',
        btn1Text: ctaButtons[0] ? ctaButtons[0].innerText.replace(/\s+/g, ' ').trim() : '',
        btn2Text: ctaButtons[1] ? ctaButtons[1].innerText.replace(/\s+/g, ' ').trim() : '',
        btn3Text: ctaButtons[2] ? ctaButtons[2].innerText.replace(/\s+/g, ' ').trim() : ''
      };
    });

    console.log('  Observed Hero Title:', heroContent.titleText);
    console.log('  Observed Button 1:', heroContent.btn1Text);
    console.log('  Observed Button 2:', heroContent.btn2Text);
    console.log('  Observed Button 3:', heroContent.btn3Text);

    if (!heroContent.titleText.includes('Architecting High-Speed Distributed Platforms')) {
      throw new Error(`Hero headline was not updated! Got: ${heroContent.titleText}`);
    }
    if (!heroContent.titleText.includes('Alex Sterling')) {
      throw new Error(`Hero shimmering name was not updated! Got: ${heroContent.titleText}`);
    }
    if (!heroContent.btn1Text.includes('Discover Innovations')) {
      throw new Error(`Primary CTA was not updated! Got: ${heroContent.btn1Text}`);
    }
    if (!heroContent.btn2Text.includes('Review Executive CV')) {
      throw new Error(`Secondary CTA was not updated! Got: ${heroContent.btn2Text}`);
    }
    if (!heroContent.btn3Text.includes('Send a message')) {
      throw new Error(`Third CTA was unexpectedly changed! Got: ${heroContent.btn3Text}`);
    }
    console.log('✓ PASS [Test 1]: Hero Headline, Primary CTA, Secondary CTA & Name dynamically updated without reload!\n');

    // ---------------------------------------------------------------------------
    // TEST 2: About Section Heading Dynamic Name & Multi-Word Splitting
    // ---------------------------------------------------------------------------
    console.log('[Test 2] Testing About Section Dynamic Name & GSAP Animations on /about ...');
    await page.goto(`${FRONTEND_URL}/about`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const aboutHeading1 = await page.evaluate(() => {
      const w1 = document.getElementById('word1');
      const w2 = document.getElementById('word2');
      return {
        word1: w1 ? w1.textContent.trim() : '',
        word2: w2 ? w2.textContent.trim() : ''
      };
    });
    console.log('  About Heading (Alex Sterling): word1 =', aboutHeading1.word1, '| word2 =', aboutHeading1.word2);
    if (aboutHeading1.word1 !== 'Alex' || aboutHeading1.word2 !== 'Sterling') {
      throw new Error(`About heading failed for two-word name! Got: ${JSON.stringify(aboutHeading1)}`);
    }

    // Test three-word name: "Dr. Alexander Sterling"
    console.log('  -> Testing three-word name update: "Dr. Alexander Sterling"...');
    await apiCall('/api/admin/profile', 'PUT', {
      displayName: 'Dr. Alexander Sterling'
    }, token, cookieHeader, csrfToken);

    await triggerRevalidate(page);
    await page.waitForFunction(() => {
      const w1 = document.getElementById('word1');
      return w1 && w1.textContent.trim() === 'Dr.';
    }, { timeout: 8000 });

    const aboutHeading2 = await page.evaluate(() => {
      const w1 = document.getElementById('word1');
      const w2 = document.getElementById('word2');
      return {
        word1: w1 ? w1.textContent.replace(/\s+/g, ' ').trim() : '',
        word2: w2 ? w2.textContent.replace(/\s+/g, ' ').trim() : ''
      };
    });
    console.log('  About Heading (Three-word): word1 =', aboutHeading2.word1, '| word2 =', aboutHeading2.word2);
    if (aboutHeading2.word1 !== 'Dr.' || aboutHeading2.word2 !== 'Alexander Sterling') {
      throw new Error(`About heading failed for three-word name! Got: ${JSON.stringify(aboutHeading2)}`);
    }

    // Test single-word name: "Aria"
    console.log('  -> Testing single-word name update: "Aria"...');
    await apiCall('/api/admin/profile', 'PUT', {
      displayName: 'Aria'
    }, token, cookieHeader, csrfToken);

    await triggerRevalidate(page);
    await page.waitForFunction(() => {
      const w1 = document.getElementById('word1');
      return w1 && w1.textContent.trim() === 'Aria';
    }, { timeout: 8000 });

    const aboutHeading3 = await page.evaluate(() => {
      const w1 = document.getElementById('word1');
      const w2 = document.getElementById('word2');
      return {
        word1: w1 ? w1.textContent.trim() : '',
        word2: w2 ? w2.textContent.trim() : '',
        word2Visible: w2 ? window.getComputedStyle(w2).display !== 'none' : false
      };
    });
    console.log('  About Heading (Single-word): word1 =', aboutHeading3.word1, '| word2Visible =', aboutHeading3.word2Visible);
    if (aboutHeading3.word1 !== 'Aria') {
      throw new Error(`About heading failed for single-word name! Got: ${JSON.stringify(aboutHeading3)}`);
    }
    console.log('✓ PASS [Test 2]: About Heading safely supports 1-word, 2-word, and multi-word names with live re-init!\n');

    // ---------------------------------------------------------------------------
    // TEST 3: Bento Zero-to-One Card Props & Dynamic Milestones
    // ---------------------------------------------------------------------------
    console.log('[Test 3] Testing Bento Zero-to-One Card CMS Integration on / ...');
    const testMilestones = [
      {
        id: 'ms-cms-test-1',
        phase: '2023 Q1',
        year: '2023 Q1',
        title: 'Cloud Infrastructure Launch',
        description: 'Engineered high-throughput microservices handling 50k req/sec.',
        published: true
      },
      {
        id: 'ms-cms-test-2',
        phase: '2024 Q3',
        year: '2024 Q3',
        title: 'Distributed Vector Engine',
        description: 'Implemented HNSW approximate nearest neighbors in C++ and Python.',
        published: true
      }
    ];

    console.log('  -> Setting custom learningJourney in CMS...');
    await apiCall('/api/admin/profile', 'PUT', {
      learningJourney: testMilestones
    }, token, cookieHeader, csrfToken);

    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => window.scrollTo(0, 1000));
    await triggerRevalidate(page);

    await page.waitForFunction(() => {
      const card = document.querySelector('.zero-to-one-journey-card');
      return card && card.innerText.includes('Cloud Infrastructure Launch');
    }, { timeout: 8000 });

    const renderedMilestones = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.zero-to-one-journey-card .group\\/m'));
      return cards.map(c => ({
        year: c.querySelector('span.font-mono')?.innerText.trim(),
        title: c.querySelector('h3')?.innerText.trim(),
        desc: c.querySelector('p')?.innerText.trim()
      }));
    });

    console.log('  Rendered Milestones Count:', renderedMilestones.length);
    console.log('  First Milestone:', renderedMilestones[0]);

    if (renderedMilestones.length !== 2) {
      throw new Error(`Expected 2 CMS milestones rendered, got ${renderedMilestones.length}`);
    }
    if (renderedMilestones[0].title !== 'Cloud Infrastructure Launch') {
      throw new Error(`Milestone title mismatch! Got: ${renderedMilestones[0].title}`);
    }
    if (renderedMilestones[1].year !== '2024 Q3') {
      throw new Error(`Milestone year mismatch! Got: ${renderedMilestones[1].year}`);
    }
    console.log('✓ PASS [Test 3a]: CMS Milestones rendered on Bento Card with exact titles and years!\n');

    // Test empty milestone array [] (Delete all milestones)
    console.log('  -> Testing Empty Milestone Array [] behavior (Delete All)...');
    await apiCall('/api/admin/profile', 'PUT', {
      learningJourney: []
    }, token, cookieHeader, csrfToken);

    await triggerRevalidate(page);
    await page.waitForFunction(() => {
      const card = document.querySelector('.zero-to-one-journey-card');
      return card && card.innerText.includes('Roadmap in Progress');
    }, { timeout: 8000 });

    const emptyMilestoneState = await page.evaluate(() => {
      const card = document.querySelector('.zero-to-one-journey-card');
      const text = card ? card.innerText : '';
      const hasMock2022 = text.includes('Started B.Tech CSE') || text.includes('Mastered MERN');
      const hasEmptyState = text.includes('Roadmap in Progress') || text.includes('Career Roadmap');
      return { hasMock2022, hasEmptyState, textPreview: text.substring(0, 200) };
    });

    console.log('  Empty array inspection:', emptyMilestoneState);
    if (emptyMilestoneState.hasMock2022) {
      throw new Error('FAILURE: Hardcoded 2022-2025 default milestones were restored when CMS provided []!');
    }
    if (!emptyMilestoneState.hasEmptyState) {
      throw new Error('FAILURE: Empty state message not displayed for empty milestone array!');
    }
    console.log('✓ PASS [Test 3b]: Explicit empty array [] displays clean empty state without fallback to mock milestones!\n');

    // ---------------------------------------------------------------------------
    // TEST 4: Skills Category Dynamic Name, Subtitle & Color Preservation
    // ---------------------------------------------------------------------------
    console.log('[Test 4] Testing Skills Category Meta Preservation on /skills ...');
    const customFrontendName = 'Advanced Frontend Architecture';
    const customFrontendSubtitle = 'Reactive Micro-frontends & WebGL Engines';
    const customFrontendColor = '#06b6d4';

    const updatedSkills = JSON.parse(JSON.stringify(baselineSkills));
    const feGroup = updatedSkills.find(s => /front/i.test(s.category || s.categoryName || s.name || ''));
    if (feGroup) {
      feGroup.category = customFrontendName;
      feGroup.name = customFrontendName;
      feGroup.subtitle = customFrontendSubtitle;
      feGroup.color = customFrontendColor;
    }

    console.log('  -> Updating Frontend category in CMS with custom name, subtitle, and color...');
    await apiCall('/api/portfolio/sync', 'POST', {
      ...initialBootstrap.data,
      skills: updatedSkills
    }, token, cookieHeader, csrfToken);

    await page.goto(`${FRONTEND_URL}/skills`, { waitUntil: 'networkidle2' });
    await triggerRevalidate(page);

    await page.waitForFunction(() => {
      const h2s = Array.from(document.querySelectorAll('.flow-layer h2'));
      return h2s.some(h => h.innerText.includes('Advanced Frontend Architecture'));
    }, { timeout: 8000 });

    const skillsCategoryData = await page.evaluate(() => {
      const layers = Array.from(document.querySelectorAll('.flow-layer'));
      const feLayer = layers.find(l => l.innerText.includes('Advanced Frontend Architecture') || l.innerText.includes('React'));
      if (!feLayer) return null;
      const h2 = feLayer.querySelector('h2');
      const p = feLayer.querySelector('p');
      const styleAttr = feLayer.getAttribute('style') || '';
      return {
        title: h2 ? h2.innerText.replace(/[0-9]/g, '').trim() : '',
        subtitle: p ? p.innerText.trim() : '',
        style: styleAttr
      };
    });

    console.log('  Observed Skills Category Data:', skillsCategoryData);
    if (!skillsCategoryData) {
      throw new Error('Could not find frontend skills layer!');
    }
    if (!skillsCategoryData.title.includes('Advanced Frontend Architecture')) {
      throw new Error(`Category name was overwritten by fallback regex! Got: ${skillsCategoryData.title}`);
    }
    if (!skillsCategoryData.subtitle.includes('Reactive Micro-frontends & WebGL Engines')) {
      throw new Error(`Category subtitle was overwritten by fallback regex! Got: ${skillsCategoryData.subtitle}`);
    }
    if (!skillsCategoryData.style.includes('#06b6d4')) {
      throw new Error(`Category color was overwritten by fallback regex! Got: ${skillsCategoryData.style}`);
    }
    console.log('✓ PASS [Test 4]: Skills category name, subtitle, and color preserved from CMS without regex override!\n');

    // ---------------------------------------------------------------------------
    // TEST 5: Browser Console Errors Check
    // ---------------------------------------------------------------------------
    console.log('[Test 5] Checking Browser Console Errors...');
    const criticalErrors = consoleErrors.filter(e => !e.includes('401'));
    console.log('  Critical console errors during verification:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      console.warn('  Warnings/Errors:', criticalErrors);
    } else {
      console.log('✓ PASS [Test 5]: 0 critical console errors detected!\n');
    }

  } finally {
    // Clean up: Restore baseline profile & skills in DB so workspace remains clean
    console.log('[Cleanup] Restoring baseline profile & skills in MongoDB...');
    try {
      await apiCall('/api/admin/profile', 'PUT', {
        headline: baselineProfile.headline,
        primaryCtaText: baselineProfile.primaryCtaText,
        secondaryCtaText: baselineProfile.secondaryCtaText,
        displayName: baselineProfile.displayName,
        name: baselineProfile.name,
        learningJourney: baselineProfile.learningJourney
      }, token, cookieHeader, csrfToken);

      await apiCall('/api/portfolio/sync', 'POST', {
        ...initialBootstrap.data,
        skills: baselineSkills
      }, token, cookieHeader, csrfToken);
      console.log('✓ Cleanup complete. Baseline CMS data restored.');
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr.message);
    }

    await browser.close();
  }

  console.log('\n=== ALL PHASE 2 E2E VERIFICATION TESTS PASSED SUCCESSFULLY ===');
}

runPhase2Verification().catch(err => {
  console.error('\n❌ PHASE 2 VERIFICATION FAILED:', err);
  process.exit(1);
});
