const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ARTIFACTS = 'C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb';
const PORT = 9401;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function capturePages() {
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-snap2');
  
  // Kill any existing Chrome on this debug port
  try { execSync(`netstat -ano | findstr :${PORT}`, { stdio: 'ignore' }); } catch(e) {}
  
  const pages = [
    { url: 'http://localhost:5175/', name: 'vslflow_01_hero', scrollY: 0 },
    { url: 'http://localhost:5175/', name: 'vslflow_02_bento', scrollY: 900 },
    { url: 'http://localhost:5175/', name: 'vslflow_03_projects', scrollY: 2000 },
    { url: 'http://localhost:5175/', name: 'vslflow_04_certs', scrollY: 3200 },
    { url: 'http://localhost:5175/projects', name: 'vslflow_05_projects_page', scrollY: 0 },
    { url: 'http://localhost:5175/about', name: 'vslflow_06_about', scrollY: 0 },
    { url: 'http://localhost:5175/skills', name: 'vslflow_07_skills', scrollY: 0 },
    { url: 'http://localhost:5175/contact', name: 'vslflow_08_contact', scrollY: 0 },
    { url: 'http://localhost:5175/admin', name: 'vslflow_09_admin', scrollY: 0 },
  ];

  for (const p of pages) {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      '--disable-gpu',
      `--remote-debugging-port=${PORT}`,
      '--window-size=1440,900',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--user-data-dir=' + tempUserData,
      p.url
    ]);

    await sleep(3000);

    try {
      let tab = null;
      for (let i = 0; i < 30; i++) {
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

      if (!tab) { console.error(`No tab for ${p.url}`); chrome.kill(); continue; }

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

      // Wait for page load
      await sleep(3000);

      // Scroll if needed
      if (p.scrollY > 0) {
        await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${p.scrollY})` });
        await sleep(1200);
      }

      const snap = await send('Page.captureScreenshot', { format: 'png' });
      const outPath = `${ARTIFACTS}/${p.name}.png`;
      fs.writeFileSync(outPath, Buffer.from(snap.result.data, 'base64'));
      console.log(`Captured: ${p.name}.png`);
      
      ws.close();
    } catch (err) {
      console.error(`Error capturing ${p.name}:`, err.message);
    } finally {
      chrome.kill();
      await sleep(1000);
    }
  }
  
  console.log('Done!');
}

capturePages();

