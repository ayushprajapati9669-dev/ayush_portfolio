const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';

async function verifyFullUI() {
  const port = 9389;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-profile-verify');

  console.log('[Verification] Launching headless Chrome...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1440,900',
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

    async function capturePage(url, outFilename, waitMs = 2500) {
      console.log(`[Verification] Navigating to ${url}...`);
      await sendCmd('Page.navigate', { url });
      await new Promise((r) => setTimeout(r, waitMs));

      const screenshot = await sendCmd('Page.captureScreenshot', { format: 'png' });
      const localPath = path.join(__dirname, '..', outFilename);
      const artPath = path.join(ARTIFACTS_DIR, outFilename);

      fs.writeFileSync(localPath, Buffer.from(screenshot.result.data, 'base64'));
      fs.writeFileSync(artPath, Buffer.from(screenshot.result.data, 'base64'));
      console.log(`[Verification] Saved: ${outFilename}`);
    }

    // 1. Home Page
    await capturePage('http://localhost:5174/', 'screenshot_home_refined.png', 3000);

    // 2. Projects Page
    await capturePage('http://localhost:5174/projects', 'screenshot_projects_refined.png', 3000);

    // 3. Resume Modal: Click the Resume button on the navbar
    console.log('[Verification] Triggering Resume modal...');
    await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Resume'));
          if (btn) { btn.click(); return 'clicked'; }
          return 'not found';
        })()
      `
    });
    await new Promise((r) => setTimeout(r, 2000));
    const modalShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(__dirname, '..', 'screenshot_resume_modal_verified.png'), Buffer.from(modalShot.result.data, 'base64'));
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'screenshot_resume_modal_verified.png'), Buffer.from(modalShot.result.data, 'base64'));
    console.log('[Verification] Saved: screenshot_resume_modal_verified.png');

    // 4. About Page
    await capturePage('http://localhost:5174/about', 'screenshot_about_refined.png', 3000);

    ws.close();
    chrome.kill();
    console.log('[Verification] All screenshots successfully captured!');
  } catch (err) {
    console.error('[Verification] Error:', err);
    chrome.kill();
  }
}

verifyFullUI();
