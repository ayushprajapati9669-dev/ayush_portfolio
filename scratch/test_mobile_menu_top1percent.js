const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/mobile_audit');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const viewports = [
    { name: '389px', width: 389, height: 844 },
    { name: '375px', width: 375, height: 667 },
    { name: '320px', width: 320, height: 568 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    // Find and click hamburger button
    const burger = await page.$('.mobile-nav-toggle.burger, .nav-toggle-btn');
    if (!burger) {
      console.error(`Could not find burger button for ${vp.name}`);
      await page.close();
      continue;
    }

    await burger.click();
    await page.waitForSelector('.mobile-drawer.open', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 800)); // wait for stagger animations

    const auditData = await page.evaluate(() => {
      const drawer = document.querySelector('.mobile-drawer');
      const navLinks = Array.from(document.querySelectorAll('.mobile-drawer .nav a')).map(a => ({
        index: a.querySelector('.nav-index')?.textContent?.trim(),
        name: a.querySelector('.nav-name')?.textContent?.trim(),
        badge: a.querySelector('.nav-badge')?.textContent?.trim(),
        hasChev: !!a.querySelector('.chev'),
        isActive: a.classList.contains('active')
      }));

      const profileStrip = document.querySelector('.mobile-drawer .drawer-profile-strip');
      const profileInfo = profileStrip ? {
        exists: true,
        headline: profileStrip.querySelector('.drawer-profile-headline')?.textContent?.trim(),
        sub: profileStrip.querySelector('.drawer-profile-sub')?.textContent?.trim(),
        hasMailBtn: !!profileStrip.querySelector('.drawer-profile-mail-btn')
      } : { exists: false };

      const hireBtn = document.querySelector('.mobile-drawer .btn-hire-full');
      const hireBtnComputed = hireBtn ? {
        exists: true,
        gridColumn: window.getComputedStyle(hireBtn).gridColumn,
        width: hireBtn.getBoundingClientRect().width,
        height: hireBtn.getBoundingClientRect().height,
        parentWidth: hireBtn.parentElement?.getBoundingClientRect().width
      } : { exists: false };

      const statusPill = document.querySelector('.mobile-drawer .status');
      const statusText = statusPill?.textContent?.trim();

      return {
        navLinks,
        profileInfo,
        hireBtnComputed,
        statusText
      };
    });

    console.log(`\n=== AUDIT RESULTS (${vp.name}) ===`);
    console.log('Status Pill:', auditData.statusText);
    console.log('Nav Links Count:', auditData.navLinks.length);
    console.log('Nav Items:', JSON.stringify(auditData.navLinks, null, 2));
    console.log('Profile Strip:', JSON.stringify(auditData.profileInfo, null, 2));
    console.log('Hire Button Spanning:', JSON.stringify(auditData.hireBtnComputed, null, 2));

    const shotPath = path.join(OUT_DIR, `public_mobile_menu_top1percent_${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);

    await page.close();
  }

  await browser.close();
  console.log('\nAudit complete!');
})();
