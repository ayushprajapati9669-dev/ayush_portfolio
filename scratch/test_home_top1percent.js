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

  const page = await browser.newPage();
  await page.setViewport({ width: 389, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Audit Hero at top
  const heroData = await page.evaluate(() => {
    const title = document.querySelector('.hero-editorial-title')?.textContent?.trim();
    const capsule = document.querySelector('.hero-announcement-capsule')?.textContent?.trim();
    const features = Array.from(document.querySelectorAll('.hero-feature-item')).map(el => el.textContent?.trim());
    return { title, capsule, features };
  });
  console.log('=== HERO SECTION AUDIT ===', heroData);
  await page.screenshot({ path: path.join(OUT_DIR, 'home_top1percent_01_hero_389px.png') });

  // Trigger immediate mount of below-fold sections
  await page.evaluate(() => {
    window.__earlyUserInteraction = true;
    window.scrollTo(0, 150);
    window.dispatchEvent(new Event('scroll'));
  });
  await new Promise(r => setTimeout(r, 1200));

  // 2. Audit Section 01 Bento & 3D Wave
  await page.waitForSelector('#bento-section', { timeout: 8000 });
  await page.evaluate(() => {
    document.getElementById('bento-section')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));

  const bentoData = await page.evaluate(() => {
    const ripplePrompt = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.includes('to ripple'))?.textContent?.trim();
    const contactLinks = Array.from(document.querySelectorAll('.bento-bio-card a')).map(a => a.textContent?.trim());
    return { ripplePrompt, contactLinks };
  });
  console.log('=== BENTO SECTION AUDIT ===', bentoData);
  await page.screenshot({ path: path.join(OUT_DIR, 'home_top1percent_02_bento_389px.png') });

  // 3. Audit Section 02 Quick Directory (4 buttons with count badges)
  await page.waitForSelector('#portfolio-directories', { timeout: 8000 });
  await page.evaluate(() => {
    document.getElementById('portfolio-directories')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));

  const dirData = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.home-nav-executive-btn')).map(b => ({
      title: b.querySelector('.btn-title')?.textContent?.trim(),
      subtitle: b.querySelector('.btn-subtitle')?.textContent?.trim(),
      count: b.querySelector('.count-pill span:first-child')?.textContent?.trim()
    }));
    return btns;
  });
  console.log('=== QUICK DIRECTORY AUDIT ===', dirData);
  await page.screenshot({ path: path.join(OUT_DIR, 'home_top1percent_03_directory_389px.png') });

  // 4. Audit Section 03 CTA Banner
  await page.waitForSelector('.home-cta-banner', { timeout: 8000 });
  await page.evaluate(() => {
    document.querySelector('.home-cta-banner')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));

  const ctaData = await page.evaluate(() => {
    const ctaBanner = document.querySelector('.home-cta-banner');
    if (!ctaBanner) return null;
    const contactBtn = Array.from(ctaBanner.querySelectorAll('button')).find(b => b.textContent?.includes('Contact Me'));
    const copyBtn = Array.from(ctaBanner.querySelectorAll('button')).find(b => b.textContent?.includes('Email'));
    const contactStyle = contactBtn ? window.getComputedStyle(contactBtn) : null;
    return {
      contactBtnText: contactBtn?.textContent?.trim(),
      contactBackground: contactStyle?.backgroundImage || contactStyle?.backgroundColor,
      contactColor: contactStyle?.color,
      copyBtnText: copyBtn?.textContent?.trim()
    };
  });
  console.log('=== CTA BANNER AUDIT ===', ctaData);
  await page.screenshot({ path: path.join(OUT_DIR, 'home_top1percent_04_cta_banner_389px.png') });

  // 5. Audit Public Footer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 1500));

  const footerData = await page.evaluate(() => {
    const sitemapLinks = Array.from(document.querySelectorAll('.footer-col:nth-child(2) .footer-nav-link span')).map(s => s.textContent?.trim());
    const devLinks = Array.from(document.querySelectorAll('.footer-col:nth-child(3) .footer-nav-link span')).map(s => s.textContent?.trim());
    return { sitemapLinks, devLinks };
  });
  console.log('=== FOOTER AUDIT ===', footerData);
  await page.screenshot({ path: path.join(OUT_DIR, 'home_top1percent_05_footer_389px.png') });

  // 6. Test Smart Scroll Floating Buttons Hiding & Restoring
  console.log('=== TESTING SMART SCROLL HIDING ===');
  await page.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 400));
  // Scroll down smoothly
  await page.evaluate(() => window.scrollBy(0, 300));
  await new Promise(r => setTimeout(r, 500));

  const hiddenState = await page.evaluate(() => {
    const soundscape = document.querySelector('.soundscape-studio-floating');
    const askAi = document.querySelector('.fixed.bottom-4.right-4, .fixed.bottom-6.right-6');
    return {
      soundscapeHidden: soundscape?.classList?.contains('translate-y-20') || soundscape?.classList?.contains('opacity-0'),
      askAiHidden: askAi?.classList?.contains('translate-y-20') || askAi?.classList?.contains('opacity-0')
    };
  });
  console.log('Downward scroll floating hidden state:', hiddenState);
  await page.screenshot({ path: path.join(OUT_DIR, 'home_top1percent_06_scrolling_down_unobstructed_389px.png') });

  // Scroll back up by 200px
  await page.evaluate(() => window.scrollBy(0, -200));
  await new Promise(r => setTimeout(r, 500));
  const restoredState = await page.evaluate(() => {
    const soundscape = document.querySelector('.soundscape-studio-floating');
    const askAi = document.querySelector('.fixed.bottom-4.right-4, .fixed.bottom-6.right-6');
    return {
      soundscapeRestored: soundscape?.classList?.contains('translate-y-0') && soundscape?.classList?.contains('opacity-100'),
      askAiRestored: askAi?.classList?.contains('translate-y-0') && askAi?.classList?.contains('opacity-100')
    };
  });
  console.log('Upward scroll floating restored state:', restoredState);

  await page.close();
  await browser.close();
  console.log('\nAudit completed successfully!');
})();
