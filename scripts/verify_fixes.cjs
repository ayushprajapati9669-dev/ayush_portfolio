const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ARTIFACTS = 'C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb';
const PORT = 9403;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function capture(pages) {
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-snap3');
  
  for (const p of pages) {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new', '--disable-gpu',
      `--remote-debugging-port=${PORT}`,
      '--window-size=1440,900', '--no-first-run', '--no-default-browser-check',
      '--user-data-dir=' + tempUserData, p.url
    ]);

    await sleep(2500);

    try {
      let tab = null;
      for (let i = 0; i < 25; i++) {
        try {
          const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
          if (res.ok) {
            const list = await res.json();
            tab = list.find((t) => t.type === 'page');
            if (tab) break;
          }
        } catch (e) {}
        await sleep(300);
      }
      if (!tab) { console.error(`No tab for ${p.name}`); chrome.kill(); await sleep(800); continue; }

      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

      let msgId = 1;
      function send(method, params = {}) {
        return new Promise((res) => {
          const curId = msgId++;
          const onMsg = (event) => {
            const d = JSON.parse(event.data);
            if (d.id === curId) { ws.removeEventListener('message', onMsg); res(d); }
          };
          ws.addEventListener('message', onMsg);
          ws.send(JSON.stringify({ id: curId, method, params }));
        });
      }

      await sleep(3000);
      if (p.scrollY > 0) {
        await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${p.scrollY})` });
        await sleep(1200);
      }
      const snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`${ARTIFACTS}/${p.name}.png`, Buffer.from(snap.result.data, 'base64'));
      console.log(`Captured: ${p.name}.png`);
      ws.close();
    } catch (err) {
      console.error(`Error on ${p.name}: ${err.message}`);
    } finally {
      chrome.kill();
      await sleep(1000);
    }
  }
  console.log('Done!');
}

capture([
  { url: 'http://localhost:5175/skills', name: 'fix_v2_skills', scrollY: 0 },
  { url: 'http://localhost:5175/about', name: 'fix_v2_about', scrollY: 0 },
  { url: 'http://localhost:5175/admin', name: 'fix_v2_admin', scrollY: 0 },
  { url: 'http://localhost:5175/', name: 'fix_v2_home', scrollY: 0 },
]);

