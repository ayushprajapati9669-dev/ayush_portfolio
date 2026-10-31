const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';

async function verifyBentoUI() {
  const port = 9488;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-profile-bento');

  console.log('[Bento Verification] Launching Chrome CDP...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1440,960',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempUserData}`,
    'http://localhost:5174/'
  ]);

  try {
    let tab = null;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/list`);
        if (res.ok) {
          const list = await res.json();
          tab = list.find((t) => t.url.includes('5174'));
          if (tab) break;
        }
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 250));
    }

    if (!tab) throw new Error('Target tab not found');

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

    async function capturePage(url, outFilename, waitMs = 3000, scrollY = 0) {
      console.log(`[Bento Verification] Navigating to ${url}...`);
      await sendCmd('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, waitMs));

      if (scrollY > 0) {
        await sendCmd('Runtime.evaluate', {
          expression: `window.scrollTo({ top: ${scrollY}, behavior: 'instant' })`
        });
        await new Promise((r) => setTimeout(r, 800));
      }

      const screenshot = await sendCmd('Page.captureScreenshot', { format: 'png' });
      const artPath = path.join(ARTIFACTS_DIR, outFilename);
      fs.writeFileSync(artPath, Buffer.from(screenshot.result.data, 'base64'));
      console.log(`[Bento Verification] Saved: ${outFilename}`);
    }

    // 1. Hero Section & Nav
    await capturePage('http://localhost:5174/', 'screenshot_bento_hero.png', 3000, 0);

    // 2. Selected Work (Bento Grid)
    await capturePage('http://localhost:5174/', 'screenshot_bento_work.png', 1500, 500);

    // 3. Skills & About (2-Col Bento)
    await capturePage('http://localhost:5174/', 'screenshot_bento_skills_about.png', 1500, 1500);

    // 4. Developer Workbench & Algorithmic LeetCode Stats
    await capturePage('http://localhost:5174/', 'screenshot_bento_workbench.png', 1500, 2200);

    // 5. CTA Section & Minimal Footer
    await capturePage('http://localhost:5174/', 'screenshot_bento_cta.png', 1500, 2800);

    // 6. Mobile Viewport (390x844)
    console.log('[Bento Verification] Capturing mobile viewport...');
    await sendCmd('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await capturePage('http://localhost:5174/', 'screenshot_bento_mobile.png', 2000, 0);

    ws.close();
    chrome.kill();
    console.log('[Bento Verification] ALL SCREENSHOTS SUCCESSFULLY CAPTURED!');
  } catch (err) {
    console.error('[Bento Verification] Error:', err);
    chrome.kill();
  }
}

verifyBentoUI();
