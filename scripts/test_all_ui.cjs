const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function captureAllPages() {
  const port = 9391;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-test-all');
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
          tab = list.find((t) => t.type === 'page');
          if (tab) break;
        }
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 200));
    }

    if (!tab) throw new Error('No tab');

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

    const pages = [
      { url: 'http://localhost:5174/', name: 'verify_home.png' },
      { url: 'http://localhost:5174/admin/login', name: 'verify_admin_login.png' },
      { url: 'http://localhost:5174/about', name: 'verify_about.png' },
      { url: 'http://localhost:5174/projects', name: 'verify_projects.png' },
      { url: 'http://localhost:5174/certificates', name: 'verify_certificates.png' }
    ];

    for (const p of pages) {
      console.log('Navigating to', p.url);
      await send('Page.navigate', { url: p.url });
      await new Promise((r) => setTimeout(r, 2500));
      const snap = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(snap.result.data, 'base64');
      const out = path.join('C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb', p.name);
      fs.writeFileSync(out, buffer);
      console.log('Saved', out);
    }

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

captureAllPages();

