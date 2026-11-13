const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleMessages = [];
  const networkRequests = [];

  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      networkRequests.push({ url: req.url(), method: req.method() });
    }
  });

  console.log('--- 1. Inspecting Project Cards on Public Home Page ---');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const homeCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.project-card'));
    return cards.map(c => {
      const imgLink = c.querySelector('.project-img-wrap');
      const titleLink = c.querySelector('.project-title a');
      const hintLink = c.querySelector('.project-link-hint');
      const demoBtn = c.querySelector('.btn-demo');
      const codeBtn = c.querySelector('.btn-code');
      return {
        title: titleLink ? titleLink.innerText.trim() : 'Unknown',
        imgHref: imgLink ? imgLink.getAttribute('href') : null,
        titleHref: titleLink ? titleLink.getAttribute('href') : null,
        hintHref: hintLink ? hintLink.getAttribute('href') : null,
        hintText: hintLink ? hintLink.innerText.trim() : null,
        demoHref: demoBtn ? demoBtn.getAttribute('href') : null,
        codeHref: codeBtn ? codeBtn.getAttribute('href') : null
      };
    });
  });

  console.log('Home Page Project Cards Count:', homeCards.length);
  homeCards.forEach((c, i) => {
    console.log(`[Card ${i + 1}]: "${c.title}"`);
    console.log(`   Image Links To: ${c.imgHref}`);
    console.log(`   Title Links To: ${c.titleHref}`);
    console.log(`   Hint Link ("${c.hintText}") Links To: ${c.hintHref}`);
    console.log(`   Live Demo: ${c.demoHref} | Code: ${c.codeHref}`);
  });

  console.log('\n--- 2. Clicking Card Image Link to Test Navigation ---');
  const targetUrl = homeCards[0]?.imgHref;
  if (targetUrl) {
    await page.goto(`http://localhost:5174${targetUrl}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    const detailPageInfo = await page.evaluate(() => {
      return {
        currentUrl: window.location.pathname,
        title: document.title,
        h1: document.querySelector('h1')?.innerText || '',
        hasApiSandbox: Boolean(document.querySelector('.api-sandbox') || document.querySelector('[data-testid="api-sandbox"]')),
        hasArchDiagram: Boolean(document.querySelector('.arch-diagram') || document.querySelector('[data-testid="architecture-diagram"]')),
        hasBeforeAfterSlider: Boolean(document.querySelector('.comparison-slider') || document.querySelector('[data-testid="before-after-slider"]')),
        sections: Array.from(document.querySelectorAll('section, h2')).map(s => s.innerText.slice(0, 40).trim()).filter(Boolean).slice(0, 8)
      };
    });
    console.log('Project Detail Navigation Result:', JSON.stringify(detailPageInfo, null, 2));
  }

  console.log('\n--- 3. Testing Direct Navigation to All 5 Project Slugs ---');
  const testSlugs = [
    'airbnb-clone-2',
    'airbnb-clone-1',
    'ai-chat-boat',
    'airbnb-clone',
    'ai-agentic-workspace'
  ];

  for (const s of testSlugs) {
    await page.goto(`http://localhost:5174/projects/${s}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 400));
    const res = await page.evaluate(() => ({
      statusHeading: document.querySelector('h1')?.innerText || 'None',
      rendered: Boolean(document.querySelector('.case-study-hero') || document.querySelector('.project-detail'))
    }));
    console.log(`   /projects/${s} -> Heading: "${res.statusHeading}" | Case Study Rendered: ${res.rendered}`);
  }

  console.log('\n--- 4. Testing Invalid Project Slug ---');
  await page.goto('http://localhost:5174/projects/non-existent-invalid-slug-999', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const invalidRes = await page.evaluate(() => ({
    url: window.location.pathname,
    h1: document.querySelector('h1')?.innerText || 'None',
    bodyTextSnippet: document.body.innerText.slice(0, 200).replace(/\n+/g, ' ')
  }));
  console.log('Invalid Slug Result:', JSON.stringify(invalidRes, null, 2));

  await browser.close();
})();

