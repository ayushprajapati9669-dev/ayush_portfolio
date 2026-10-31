const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const REF_URL = 'https://sarthak-sharma-portfolio-six.vercel.app/';
const ARTIFACTS_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';
const PORT = 9392;
const TEMP_USER_DATA = path.join(__dirname, '..', '.tmp-chrome-ref-analysis-3');

async function analyzeReference() {
  console.log(`[Reference Analysis] Launching Chrome to inspect ${REF_URL}...`);

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${TEMP_USER_DATA}`,
    REF_URL
  ]);

  try {
    let tab = null;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
        if (res.ok) {
          const list = await res.json();
          tab = list.find((t) => t.url.includes('sarthak') || t.url.includes('vercel.app'));
          if (tab) break;
        }
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 250));
    }

    if (!tab) throw new Error('Could not find active Chrome tab');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const cb = callbacks.get(data.id);
        callbacks.delete(data.id);
        cb(data);
      }
    };

    function sendCmd(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCmd('Page.enable');
    await sendCmd('DOM.enable');
    await sendCmd('Runtime.enable');

    console.log('[Reference Analysis] Waiting 4s for initial hydration...');
    await new Promise((r) => setTimeout(r, 4000));

    // Get page full height
    const heightRes = await sendCmd('Runtime.evaluate', {
      expression: 'Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)'
    });
    const totalHeight = (heightRes?.result?.value) || 5000;
    console.log(`[Reference Analysis] Total page height: ${totalHeight}px`);

    // Capture scroll sections (every 800px)
    let idx = 0;
    for (let y = 0; y <= totalHeight; y += 800) {
      console.log(`[Reference Analysis] Scrolling to ${y}px...`);
      await sendCmd('Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` });
      await new Promise((r) => setTimeout(r, 700));
      const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
      if (shot?.result?.data) {
        fs.writeFileSync(path.join(ARTIFACTS_DIR, `ref_scroll_${idx}_${y}.png`), Buffer.from(shot.result.data, 'base64'));
      }
      idx++;
    }

    // Inspect navigation links
    const navLinksRes = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          return Array.from(document.querySelectorAll('a')).map(a => ({
            text: a.innerText.trim(),
            href: a.href,
            pathname: a.pathname
          })).filter(a => a.text && a.href);
        })()
      `,
      returnByValue: true
    });
    const allLinks = navLinksRes?.result?.value || [];
    console.log('[Reference Analysis] Links on page:', allLinks.map(l => `${l.text} -> ${l.pathname || l.href}`));
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'ref_links.json'), JSON.stringify(allLinks, null, 2));

    // Capture Mobile Screenshot
    console.log('[Reference Analysis] Capturing mobile view...');
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sendCmd('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
    await new Promise((r) => setTimeout(r, 1000));
    const mobileShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    if (mobileShot?.result?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'ref_mobile_hero.png'), Buffer.from(mobileShot.result.data, 'base64'));
    }

    await sendCmd('Runtime.evaluate', { expression: 'window.scrollTo(0, 850)' });
    await new Promise((r) => setTimeout(r, 1000));
    const mobileShot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
    if (mobileShot2?.result?.data) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'ref_mobile_work.png'), Buffer.from(mobileShot2.result.data, 'base64'));
    }

    // Reset emulation
    await sendCmd('Emulation.clearDeviceMetricsOverride');

    // Filter internal subpages (e.g., /work, /about, /content, /speaking)
    const uniqueSubpaths = Array.from(new Set(
      allLinks
        .filter(l => l.href.includes('sarthak-sharma-portfolio-six.vercel.app') && l.pathname && l.pathname !== '/')
        .map(l => l.pathname)
    ));
    console.log('[Reference Analysis] Internal subpaths to visit:', uniqueSubpaths);

    for (const subpath of uniqueSubpaths) {
      const pageUrl = new URL(subpath, REF_URL).href;
      console.log(`[Reference Analysis] Visiting ${pageUrl}...`);
      await sendCmd('Page.navigate', { url: pageUrl });
      await new Promise((r) => setTimeout(r, 3000));
      const pageShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
      if (pageShot?.result?.data) {
        const slug = subpath.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        fs.writeFileSync(path.join(ARTIFACTS_DIR, `ref_page_${slug}.png`), Buffer.from(pageShot.result.data, 'base64'));
      }
    }

    ws.close();
    chrome.kill();
    console.log('[Reference Analysis] Full deep analysis complete!');
  } catch (err) {
    console.error('[Reference Analysis] Error:', err);
    chrome.kill();
  }
}

analyzeReference();
