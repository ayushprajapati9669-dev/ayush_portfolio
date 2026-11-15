const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1350, height: 940 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle2' });
  
  const beforeScroll = await page.evaluate(() => {
    const wave = document.querySelector('[aria-label="Interactive 3D Terrain Wave Displacement"]');
    const particle = document.querySelector('.particle-container');
    return { wave: Boolean(wave), particle: Boolean(particle) };
  });
  console.log('Before scroll:', beforeScroll);

  await page.evaluate(() => window.scrollTo(0, 1400));
  await new Promise(r => setTimeout(r, 2000));
  
  const afterScroll = await page.evaluate(() => {
    const bento = document.querySelector('#bento-section');
    const wave = document.querySelector('[aria-label="Interactive 3D Terrain Wave Displacement"]');
    const particle = document.querySelector('.particle-container');
    const r = bento ? bento.getBoundingClientRect() : null;
    return {
      scrollY: window.scrollY,
      bentoTop: r ? r.top : null,
      bentoBottom: r ? r.bottom : null,
      wave: Boolean(wave),
      particle: Boolean(particle)
    };
  });
  console.log('After scroll to 1400:', afterScroll);
  await browser.close();
})();
