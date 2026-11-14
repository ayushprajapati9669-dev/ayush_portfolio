const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  
  // Login
  const userInput = await page.$('input[placeholder*="username" i], input[type="text"]');
  const passInput = await page.$('input[type="password"]');
  if (userInput && passInput) {
    await userInput.type('ayush');
    await passInput.type('Ayush7162@');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 2000));
  }

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1000));

  const quickActionsCard = await page.$('.quick-actions');
  if (!quickActionsCard) {
    console.log('Quick actions card not found!');
    await browser.close();
    return;
  }

  const btns = await page.$$('.action-btn');
  console.log(`Found ${btns.length} action buttons.`);

  for (let i = 0; i < btns.length; i++) {
    const btn = btns[i];
    const text = await page.evaluate(el => el.innerText.replace(/\n/g, ' '), btn);
    console.log(`\nTesting button ${i}: "${text}"`);
    
    // Screenshot before hover
    const boxBefore = await page.evaluate(el => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, left: r.left };
    }, btn);
    console.log('Box before hover:', boxBefore);

    // Hover
    await btn.hover();
    await new Promise(r => setTimeout(r, 300));

    const boxHover = await page.evaluate(el => {
      const r = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const h4 = el.querySelector('h4');
      const p = el.querySelector('p');
      const icon = el.querySelector('.action-icon');
      return {
        box: { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, left: r.left },
        opacity: style.opacity,
        visibility: style.visibility,
        display: style.display,
        bg: style.backgroundColor,
        color: style.color,
        h4Color: h4 ? window.getComputedStyle(h4).color : null,
        pColor: p ? window.getComputedStyle(p).color : null,
        iconDisplay: icon ? window.getComputedStyle(icon).display : null,
      };
    }, btn);
    console.log('Box & styles during hover:', boxHover);

    // Screenshot during hover
    await page.screenshot({ path: `tests/hover_btn_${i}.png` });

    // Move mouse away
    await page.mouse.move(0, 0);
    await new Promise(r => setTimeout(r, 200));
  }

  // Full page screenshot of overview
  await page.screenshot({ path: 'tests/overview_full.png', fullPage: true });
  console.log('Finished testing.');
  await browser.close();
})();
