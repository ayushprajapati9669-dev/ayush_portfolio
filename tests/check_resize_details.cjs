const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 900, devicePixelRatio: 1 });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll to 150
  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(150, { immediate: true });
    } else {
      window.scrollTo(0, 150);
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const checkState = async (label) => {
    return await page.evaluate((lbl) => {
      const canvas = document.querySelector('.hero-photo-wrapper canvas');
      const img = document.querySelector('#himg');
      const ctx = canvas ? canvas.getContext('2d') : null;
      let nonZero = 0;
      if (ctx && canvas && canvas.width > 0) {
        try {
          const idata = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100)).data;
          for (let i = 3; i < idata.length; i += 4) {
            if (idata[i] > 0) nonZero++;
          }
        } catch (e) {}
      }
      return {
        label: lbl,
        scrollY: window.scrollY,
        lenisScroll: window.__lenis?.scroll,
        canvasW: canvas?.width,
        canvasH: canvas?.height,
        imgRect: img ? { w: img.getBoundingClientRect().width, h: img.getBoundingClientRect().height } : null,
        nonZeroPixels: nonZero
      };
    }, label);
  };

  console.log('State at 800px:', await checkState('800px'));

  // Sequence: 800 -> 760 -> 780 -> 740 -> 900
  const seq = [760, 780, 740, 900];
  for (const w of seq) {
    await page.setViewport({ width: w, height: 900, devicePixelRatio: 1 });
    await new Promise(r => setTimeout(r, 100));
    console.log(`State at ${w}px (immediate):`, await checkState(`${w}px-immediate`));
    await new Promise(r => setTimeout(r, 300));
    console.log(`State at ${w}px (+300ms):`, await checkState(`${w}px-settled`));
  }

  await browser.close();
})();

