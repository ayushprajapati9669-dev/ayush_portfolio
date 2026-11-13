const puppeteer = require('puppeteer');

async function runVerification() {
  console.log('================================================================');
  console.log('VERIFYING DECOMMISSIONED CASE STUDY & REDIRECT BEHAVIOR');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 1. Inspect Home Page Project Cards
  console.log('\n--- 1. Inspecting Project Cards on Home Page ---');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const homeCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.project-card'));
    return cards.map(c => {
      const imgLink = c.querySelector('.project-img-wrap');
      const titleLink = c.querySelector('.project-title a');
      const caseStudyPill = c.querySelector('.project-link-hint');
      const categoryTag = c.querySelector('.project-meta span:nth-child(2)');
      const demoBtn = c.querySelector('.btn-demo');
      const codeBtn = c.querySelector('.btn-code');
      return {
        title: titleLink ? titleLink.innerText.trim() : c.querySelector('.project-title')?.innerText.trim(),
        imgHref: imgLink ? imgLink.getAttribute('href') : null,
        imgTarget: imgLink ? imgLink.getAttribute('target') : null,
        titleHref: titleLink ? titleLink.getAttribute('href') : null,
        titleTarget: titleLink ? titleLink.getAttribute('target') : null,
        hasCaseStudyPill: Boolean(caseStudyPill),
        category: categoryTag ? categoryTag.innerText.trim() : null,
        demoHref: demoBtn ? demoBtn.getAttribute('href') : null,
        codeHref: codeBtn ? codeBtn.getAttribute('href') : null
      };
    });
  });

  console.log(`Verified ${homeCards.length} project cards on Home page:`);
  let hasCaseStudyLeaked = false;
  homeCards.forEach((c, i) => {
    console.log(`[Card ${i + 1}]: "${c.title}"`);
    console.log(`   Image href: ${c.imgHref} (target: ${c.imgTarget})`);
    console.log(`   Title href: ${c.titleHref} (target: ${c.titleTarget})`);
    console.log(`   Category: "${c.category}" | Case Study Pill Present: ${c.hasCaseStudyPill}`);
    if (c.hasCaseStudyPill || (c.imgHref && c.imgHref.includes('/projects/')) || (c.titleHref && c.titleHref.includes('/projects/'))) {
      hasCaseStudyLeaked = true;
    }
  });

  console.log('Case Study Leak on Home Page:', hasCaseStudyLeaked ? 'FAIL' : 'PASS (0 leaks)');

  // 2. Testing Redirection from Legacy /projects/:slug URLs
  console.log('\n--- 2. Testing Automatic Redirection from Legacy URLs ---');
  const testSlugs = ['airbnb-clone-2', 'ai-agentic-workspace', 'non-existent-random-slug'];
  let allRedirectPassed = true;

  for (const s of testSlugs) {
    await page.goto(`http://localhost:5174/projects/${s}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    const currentUrl = page.url();
    const pathname = new URL(currentUrl).pathname;
    const isRedirectedToProjects = pathname === '/projects';
    console.log(`   Navigating to /projects/${s} -> Current Path: ${pathname} | Redirected: ${isRedirectedToProjects ? 'PASS' : 'FAIL'}`);
    if (!isRedirectedToProjects) allRedirectPassed = false;
  }

  // 3. Inspecting Projects Page (/projects)
  console.log('\n--- 3. Inspecting /projects Page ---');
  await page.goto('http://localhost:5174/projects', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const projectsPageCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const pills = Array.from(document.querySelectorAll('.project-link-hint'));
    const internalLinks = Array.from(document.querySelectorAll('a[href^="/projects/"]')).filter(a => a.getAttribute('href') !== '/projects');
    return {
      cardCount: cards.length,
      pillsCount: pills.length,
      internalProjectDetailLinks: internalLinks.map(a => a.getAttribute('href'))
    };
  });

  console.log('Projects Page Inspection:', JSON.stringify(projectsPageCards));

  await browser.close();

  console.log('\n================================================================');
  console.log('VERIFICATION COMPLETE');
  console.log('Console Errors:', consoleErrors.length === 0 ? '0 (None)' : consoleErrors);
  console.log('Overall Status:', (!hasCaseStudyLeaked && allRedirectPassed && projectsPageCards.pillsCount === 0 && projectsPageCards.internalProjectDetailLinks.length === 0) ? 'ALL VERIFICATIONS PASSED' : 'FAIL');
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

