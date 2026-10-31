const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testResumeModal() {
  const url = 'http://localhost:5174/';
  const outPath = path.join(__dirname, '..', 'screenshot_resume_modal_verified.png');
  const port = 9388;
  const tempUserData = path.join(__dirname, `../.tmp-chrome-profile-resume`);

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempUserData}`,
    url
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
      await new Promise((r) => setTimeout(r, 200));
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
    await sendCmd('Runtime.enable');

    // Wait 2s for page initial render
    await new Promise((r) => setTimeout(r, 2000));

    // Find and click the Resume button
    const clickRes = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const resumeBtn = buttons.find(b => b.textContent.includes('Resume'));
          if (resumeBtn) {
            resumeBtn.click();
            return { found: true, text: resumeBtn.textContent };
          }
          return { found: false };
        })()
      `,
      returnByValue: true
    });
    console.log('Resume button click result:', clickRes.result.value);

    // Wait 1.5s for modal GSAP animation
    await new Promise((r) => setTimeout(r, 1500));

    // Inspect modal state
    const modalState = await sendCmd('Runtime.evaluate', {
      expression: `
        (() => {
          const modal = document.querySelector('[role="dialog"]');
          if (!modal) return { open: false };
          const title = modal.querySelector('h2')?.textContent || '';
          const meta = modal.querySelector('span')?.textContent || '';
          const downloadBtn = modal.querySelector('a[download]')?.textContent || '';
          const iframe = modal.querySelector('iframe')?.src || '';
          return { open: true, title, meta, downloadBtn, iframe };
        })()
      `,
      returnByValue: true
    });
    console.log('Modal DOM State:', modalState.result.value);

    // Capture screenshot
    const shotRes = await sendCmd('Page.captureScreenshot', { format: 'png' });
    if (shotRes.result && shotRes.result.data) {
      fs.writeFileSync(outPath, Buffer.from(shotRes.result.data, 'base64'));
      console.log('Saved screenshot to:', outPath);

      // Copy to artifact directory
      const artifactDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb';
      const artifactDest = path.join(artifactDir, 'screenshot_resume_modal_verified.png');
      try {
        fs.copyFileSync(outPath, artifactDest);
        console.log('Copied to artifact dir:', artifactDest);
      } catch (err) {
        console.error('Artifact copy error:', err.message);
      }
    }

    ws.close();
  } finally {
    chrome.kill();
    try {
      fs.rmSync(tempUserData, { recursive: true, force: true });
    } catch (e) {}
  }
}

testResumeModal().then(() => console.log('Done')).catch(console.error);

