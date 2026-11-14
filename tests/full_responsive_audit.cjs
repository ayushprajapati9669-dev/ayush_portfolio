const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1440, height: 900 }
];

const routes = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'journey', path: '/journey' },
  { name: 'skills', path: '/skills' },
  { name: 'projects', path: '/projects' },
  { name: 'certificates', path: '/certificates' },
  { name: 'contact', path: '/contact' },
  { name: 'admin', path: '/admin' }
];

const outputDir = path.join(__dirname, 'responsive_audit_output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = [];

  for (const vp of viewports) {
    console.log(`\n=================== Viewport: ${vp.name} (${vp.width}x${vp.height}) ===================`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });

    for (const r of routes) {
      const url = `http://localhost:5174${r.path}`;
      consoleErrors.length = 0; // reset for this route

      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(res => setTimeout(res, 800));

        // If admin and login modal is shown, fill in credentials once
        if (r.name === 'admin') {
          const userInput = await page.$('input[placeholder*="username" i], input[type="text"]');
          const passInput = await page.$('input[type="password"]');
          if (userInput && passInput) {
            await userInput.type('ayush');
            await passInput.type('Ayush7162@');
            const submitBtn = await page.$('button[type="submit"]');
            if (submitBtn) await submitBtn.click();
            await new Promise(res => setTimeout(res, 1500));
          }
        }

        // Check horizontal overflow
        const overflowInfo = await page.evaluate((vpWidth) => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const hasHorizontalOverflow = scrollWidth > vpWidth + 2;

          let offendingElements = [];
          if (hasHorizontalOverflow) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.right > vpWidth + 2 || rect.left < -2) {
                // Ignore elements that are hidden or offscreen fixed/absolute drawers when closed
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                  const tag = el.tagName.toLowerCase();
                  const cls = (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0, 3).join('.') : '';
                  const id = el.id ? `#${el.id}` : '';
                  offendingElements.push({
                    selector: `${tag}${id}${cls ? '.' + cls : ''}`,
                    right: Math.round(rect.right),
                    left: Math.round(rect.left),
                    width: Math.round(rect.width),
                    overflowPx: Math.round(rect.right - vpWidth)
                  });
                }
              }
            }
          }

          return {
            scrollWidth,
            clientWidth,
            vpWidth,
            hasHorizontalOverflow,
            offendingElements: offendingElements.slice(0, 8)
          };
        }, vp.width);

        // Screenshot
        const screenshotFileName = `${vp.name}_${r.name}.png`;
        const screenshotPath = path.join(outputDir, screenshotFileName);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const routeResult = {
          viewport: vp.name,
          route: r.name,
          path: r.path,
          hasHorizontalOverflow: overflowInfo.hasHorizontalOverflow,
          scrollWidth: overflowInfo.scrollWidth,
          clientWidth: overflowInfo.clientWidth,
          offendingElements: overflowInfo.offendingElements,
          consoleErrors: [...consoleErrors],
          screenshot: screenshotFileName
        };

        results.push(routeResult);

        const statusIcon = overflowInfo.hasHorizontalOverflow ? '❌ OVERFLOW' : '✅ OK';
        console.log(`[${vp.name}] ${r.name} (${r.path}): ${statusIcon} (scrollWidth: ${overflowInfo.scrollWidth}, clientWidth: ${overflowInfo.clientWidth})`);
        if (overflowInfo.hasHorizontalOverflow) {
          console.log('   Offending elements:', JSON.stringify(overflowInfo.offendingElements, null, 2));
        }
        if (consoleErrors.length > 0) {
          console.log('   Console errors:', consoleErrors);
        }

      } catch (err) {
        console.error(`Error auditing ${r.name} at ${vp.name}:`, err.message);
        results.push({
          viewport: vp.name,
          route: r.name,
          error: err.message
        });
      }
    }

    await page.close();
  }

  await browser.close();

  fs.writeFileSync(path.join(outputDir, 'audit_summary.json'), JSON.stringify(results, null, 2));
  console.log(`\nAudit finished! Summary written to tests/responsive_audit_output/audit_summary.json`);
})();
