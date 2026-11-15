const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const sections = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const directChildren = Array.from(main.children);
    return directChildren.map(el => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        className: el.className,
        id: el.id,
        height: rect.height,
        display: style.display,
        opacity: style.opacity,
        visibility: style.visibility
      };
    });
  });

  console.log('Main children sections on mobile:', JSON.stringify(sections, null, 2));

  // Check sections inside HomePage
  const subSections = await page.evaluate(() => {
    const hero = document.querySelector('.hero-section, .editorial-hero, [class*="hero"]');
    const cards = Array.from(document.querySelectorAll('section, [class*="section"], .home-below-the-fold > div'));
    return cards.map(c => {
      const r = c.getBoundingClientRect();
      const style = window.getComputedStyle(c);
      return {
        tag: c.tagName,
        className: c.className.slice(0, 50),
        id: c.id,
        top: Math.round(r.top),
        height: Math.round(r.height),
        opacity: style.opacity,
        display: style.display
      };
    });
  });
  console.log('Sub-sections:', JSON.stringify(subSections, null, 2));

  await browser.close();
})();
