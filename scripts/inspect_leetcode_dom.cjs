const { spawn } = require('child_process');
const path = require('path');

async function inspectLeetCodeDOM() {
  const port = 9395;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-lc');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempUserData}`,
    'http://localhost:5174/about'
  ]);

  try {
    let tab = null;
    for (let i = 0; i < 30; i++) {
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

    await new Promise((r) => setTimeout(r, 2500));

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const badge = document.querySelector('a[href*="leetcode.com/u/ayush7162"]') ? document.querySelector('a[href*="leetcode.com/u/ayush7162"]').closest('div.relative.overflow-hidden') : null;
          return JSON.stringify({
            found: !!badge,
            text: badge ? badge.innerText : null
          });
        })()
      `
    });

    console.log('LEETCODE BADGE DOM:', JSON.parse(evalRes.result?.result?.value || '{}'));
    ws.close();
  } finally {
    chrome.kill();
  }
}

inspectLeetCodeDOM();

