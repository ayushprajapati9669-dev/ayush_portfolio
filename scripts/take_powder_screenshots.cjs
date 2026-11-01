const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function capturePowder() {
  const port = 9396;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-snap-powder');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + tempUserData,
    'http://localhost:5175/'
  ]);

  try {
    let tab = null;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/list`);
        if (res.ok) {
          const list = await res.json();
          tab = list.find((t) => t.type === 'page');
          if (tab) break;
        }
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 200));
    }

    if (!tab) throw new Error('No page tab');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((res) => {
        const curId = id++;
        const onMsg = (event) => {
          const d = JSON.parse(event.data);
          if (d.id === curId) {
            ws.removeEventListener('message', onMsg);
            res(d);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Page.navigate', { url: 'http://localhost:5175/' });
    await new Promise((r) => setTimeout(r, 3500));

    // 1. Capture Hero
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/powder_01_hero.png', Buffer.from(snap1.result.data, 'base64'));

    // 2. Scroll to Agent Workbench & Retorno metrics
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 750)' });
    await new Promise((r) => setTimeout(r, 1200));
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/powder_02_workbench.png', Buffer.from(snap2.result.data, 'base64'));

    // 3. Scroll to Isometric Wireframe Cards
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1600)' });
    await new Promise((r) => setTimeout(r, 1200));
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/powder_03_features.png', Buffer.from(snap3.result.data, 'base64'));

    // 4. Scroll to Bento & 3D Wave Mesh
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 2450)' });
    await new Promise((r) => setTimeout(r, 1200));
    const snap4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/powder_04_mesh.png', Buffer.from(snap4.result.data, 'base64'));

    console.log('Successfully captured all 4 Powder screenshots!');
    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

capturePowder();
