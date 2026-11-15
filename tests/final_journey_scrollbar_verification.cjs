const puppeteer = require('puppeteer');

(async () => {
  console.log('--- Starting Final Journey Scrollbar Verification ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    ignoreDefaultArgs: ['--hide-scrollbars'],
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/journey', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Inspect computed styles on .timeline-list
  const listInfo = await page.$eval('.timeline-list', el => {
    const cs = window.getComputedStyle(el);
    return {
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      maxHeight: cs.maxHeight,
      overflowY: cs.overflowY,
      overflowX: cs.overflowX,
      overscrollBehavior: cs.overscrollBehavior,
      scrollbarWidth: cs.scrollbarWidth,
      paddingLeft: cs.paddingLeft,
      paddingRight: cs.paddingRight,
      hasCustomScrollbarClass: el.classList.contains('custom-scrollbar'),
      hasLenisPrevent: el.getAttribute('data-lenis-prevent') === 'true',
      tabIndex: el.getAttribute('tabindex')
    };
  });
  console.log('1. Timeline List Computed Info:\n', JSON.stringify(listInfo, null, 2));

  if (listInfo.maxHeight !== '380px') {
    throw new Error(`Expected maxHeight 380px but got ${listInfo.maxHeight}`);
  }
  if (listInfo.overflowY !== 'auto') {
    throw new Error(`Expected overflowY auto but got ${listInfo.overflowY}`);
  }
  if (listInfo.scrollHeight <= listInfo.clientHeight) {
    throw new Error(`Expected scrollHeight (${listInfo.scrollHeight}) > clientHeight (${listInfo.clientHeight})`);
  }

  // 2. Scroll container into view and take screenshot before scrolling
  const cardHandle = await page.$('.bottom-section .about-card');
  await page.evaluate(() => {
    const el = document.querySelector('.bottom-section .about-card');
    if (window.__lenis) {
      window.__lenis.scrollTo(el, { immediate: true });
    } else {
      el.scrollIntoView();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  await cardHandle.screenshot({ path: 'journey_achievements_with_scrollbar.png' });
  console.log('2. Saved card screenshot to journey_achievements_with_scrollbar.png');

  // 3. Test mouse wheel inside timeline list (internal scroll)
  const listHandle = await page.$('.timeline-list');
  const box = await listHandle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 40);

  const initialListY = await page.$eval('.timeline-list', el => el.scrollTop);
  const initialWindowY = await page.evaluate(() => window.scrollY);
  console.log(`3. Pre-wheel: list.scrollTop=${initialListY}, window.scrollY=${initialWindowY}`);

  // Wheel down 30px
  await page.mouse.wheel({ deltaY: 30 });
  await new Promise(r => setTimeout(r, 300));

  const midListY = await page.$eval('.timeline-list', el => el.scrollTop);
  const midWindowY = await page.evaluate(() => window.scrollY);
  console.log(`4. Mid-wheel (deltaY=30): list.scrollTop=${midListY}, window.scrollY=${midWindowY}`);

  if (midListY <= 0) {
    throw new Error(`Expected list.scrollTop > 0 after wheeling down, got ${midListY}`);
  }
  if (midWindowY !== initialWindowY) {
    throw new Error(`Expected window.scrollY to stay steady while container has scroll room, got ${midWindowY} vs ${initialWindowY}`);
  }

  // 4. Scroll to bottom of container
  await page.evaluate(() => {
    const el = document.querySelector('.timeline-list');
    el.scrollTop = el.scrollHeight - el.clientHeight;
  });
  await new Promise(r => setTimeout(r, 400));

  const bottomListY = await page.$eval('.timeline-list', el => el.scrollTop);
  const maxScroll = await page.$eval('.timeline-list', el => el.scrollHeight - el.clientHeight);
  console.log(`5. Reached bottom: list.scrollTop=${bottomListY}, maxScroll=${maxScroll}`);

  // Take screenshot at bottom of scroll
  await cardHandle.screenshot({ path: 'journey_achievements_scrolled_bottom.png' });
  console.log('6. Saved bottom screenshot to journey_achievements_scrolled_bottom.png');

  // 5. Test boundary forwarding: wheel down when at bottom (should advance window without trapping!)
  const windowYBeforeBoundary = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel({ deltaY: 150 });
  await new Promise(r => setTimeout(r, 600));

  const windowYAfterBoundary = await page.evaluate(() => window.scrollY);
  console.log(`7. Boundary test (past bottom): window.scrollY before=${windowYBeforeBoundary}, after=${windowYAfterBoundary}`);

  if (windowYAfterBoundary <= windowYBeforeBoundary) {
    throw new Error(`Expected window to scroll past bottom boundary (no scroll trap), but window.scrollY did not increase!`);
  }

  // 6. Test reverse boundary: scroll list back to top, then wheel up (should advance window up without trapping!)
  // Allow Lenis downward momentum to settle completely
  await new Promise(r => setTimeout(r, 700));

  await page.evaluate(() => {
    document.querySelector('.timeline-list').scrollTop = 0;
  });
  await new Promise(r => setTimeout(r, 300));

  // Ensure mouse cursor is over current bounding box of timeline-list
  const listHandleNow = await page.$('.timeline-list');
  const boxNow = await listHandleNow.boundingBox();
  await page.mouse.move(boxNow.x + boxNow.width / 2, boxNow.y + 40);

  const windowYBeforeUp = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel({ deltaY: -200 });
  await new Promise(r => setTimeout(r, 800));

  const windowYAfterUp = await page.evaluate(() => window.scrollY);
  console.log(`8. Reverse boundary test (past top): window.scrollY before=${windowYBeforeUp}, after=${windowYAfterUp}`);

  if (windowYAfterUp >= windowYBeforeUp) {
    throw new Error(`Expected window to scroll up past top boundary, but window.scrollY did not decrease!`);
  }

  // 7. Full page screenshot for final visual artifact
  await page.screenshot({ path: 'journey_full_page_final.png', fullPage: true });
  console.log('9. Saved full page screenshot to journey_full_page_final.png');

  console.log('--- ALL VERIFICATION CHECKS PASSED PERFECTLY ---');
  await browser.close();
})();
