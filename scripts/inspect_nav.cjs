const { spawn } = require('child_process');
const path = require('path');

async function checkNavbar() {
  const port = 9390;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-nav');
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

    await new Promise((r) => setTimeout(r, 2000));

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const navWrapper = document.querySelector('.nav-wrapper');
          const navbar = document.querySelector('.navbar');
          const navLeft = document.querySelector('.nav-left');
          const navCenter = document.querySelector('.nav-center');
          const navRight = document.querySelector('.nav-right');
          const btnPrimary = document.querySelector('.btn-primary');

          return JSON.stringify({
            windowWidth: window.innerWidth,
            navWrapper: navWrapper ? { width: navWrapper.offsetWidth, scrollWidth: navWrapper.scrollWidth } : null,
            navbar: navbar ? { width: navbar.offsetWidth, scrollWidth: navbar.scrollWidth } : null,
            navLeftWidth: navLeft ? navLeft.offsetWidth : null,
            navCenterWidth: navCenter ? navCenter.offsetWidth : null,
            navRightWidth: navRight ? navRight.offsetWidth : null,
            navCenterChildren: navCenter ? Array.from(navCenter.children).map(c => ({
              tag: c.tagName,
              cls: c.className,
              text: (c.innerText || '').trim()
            })) : [],
            navRightChildren: navRight ? Array.from(navRight.children).map(c => ({
              tag: c.tagName,
              cls: c.className,
              text: (c.innerText || '').trim().slice(0, 30),
              width: c.offsetWidth
            })) : [],
            btnPrimary: btnPrimary ? {
              text: (btnPrimary.innerText || '').trim(),
              width: btnPrimary.offsetWidth,
              rect: btnPrimary.getBoundingClientRect()
            } : null
          });
        })()
      `
    });

    console.log('NAVBAR INSPECTION:', JSON.parse(evalRes.result?.result?.value || '{}'));
    ws.close();
  } finally {
    chrome.kill();
  }
}

checkNavbar();
