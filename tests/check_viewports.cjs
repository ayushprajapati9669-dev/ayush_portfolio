const puppeteer = require('puppeteer');

(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));

  for (const w of [400, 740, 760, 780, 800, 900, 1050, 1200]) {
    await p.setViewport({ width: w, height: 800 });
    await new Promise(r => setTimeout(r, 300));
    const data = await p.evaluate(() => {
      const img = document.querySelector('#himg');
      const container = document.querySelector('.hero-photo-container');
      const wrapper = document.querySelector('.hero-photo-wrapper');
      return {
        img: img ? { w: Math.round(img.getBoundingClientRect().width), h: Math.round(img.getBoundingClientRect().height) } : null,
        wrapper: wrapper ? { w: Math.round(wrapper.getBoundingClientRect().width), h: Math.round(wrapper.getBoundingClientRect().height) } : null,
        container: container ? { w: Math.round(container.getBoundingClientRect().width), h: Math.round(container.getBoundingClientRect().height) } : null
      };
    });
    console.log(`${w}px:`, JSON.stringify(data));
  }
  await b.close();
})();

