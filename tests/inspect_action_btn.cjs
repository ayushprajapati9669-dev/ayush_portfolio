const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  
  // Check if login modal is present
  const userInput = await page.$('input[placeholder*="username" i], input[type="text"]');
  const passInput = await page.$('input[type="password"]');
  if (userInput && passInput) {
    await userInput.type('ayush');
    await passInput.type('Ayush7162@');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 2000));
  }

  // Ensure Overview tab is active
  const btns = await page.$$('.action-btn');
  console.log('Action buttons count:', btns.length);
  if (btns.length > 0) {
    // Scroll action-btn into view
    await page.evaluate(el => el.scrollIntoView({ block: 'center' }), btns[0]);
    await new Promise(r => setTimeout(r, 500));

    const beforeHover = await page.evaluate(el => {
      const h4 = el.querySelector('h4');
      const p = el.querySelector('p');
      const rect = el.getBoundingClientRect();
      return {
        box: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        opacity: window.getComputedStyle(el).opacity,
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility,
        h4Color: window.getComputedStyle(h4).color,
        h4Opacity: window.getComputedStyle(h4).opacity,
        pColor: window.getComputedStyle(p).color,
        pOpacity: window.getComputedStyle(p).opacity,
        bg: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color
      };
    }, btns[0]);
    console.log('Before hover:', JSON.stringify(beforeHover, null, 2));

    await page.screenshot({ path: 'tests/screenshot_before_hover.png' });

    // Hover over the first action-btn
    await btns[0].hover();
    await new Promise(r => setTimeout(r, 600));

    const afterHover = await page.evaluate(el => {
      const h4 = el.querySelector('h4');
      const p = el.querySelector('p');
      const rect = el.getBoundingClientRect();
      return {
        box: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        opacity: window.getComputedStyle(el).opacity,
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility,
        h4Color: window.getComputedStyle(h4).color,
        h4Opacity: window.getComputedStyle(h4).opacity,
        pColor: window.getComputedStyle(p).color,
        pOpacity: window.getComputedStyle(p).opacity,
        bg: window.getComputedStyle(el).backgroundColor,
        color: window.getComputedStyle(el).color
      };
    }, btns[0]);
    console.log('After hover:', JSON.stringify(afterHover, null, 2));

    await page.screenshot({ path: 'tests/screenshot_after_hover.png' });
    console.log('Saved screenshots.');
  } else {
    await page.screenshot({ path: 'tests/screenshot_no_btns.png' });
    console.log('No buttons found.');
  }

  await browser.close();
})();
