const { spawn } = require('child_process');
const path = require('path');

async function checkNavDom() {
  const port = 9396;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-snap');
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

    await send('Page.navigate', { url: 'http://localhost:5174/' });
    await new Promise((r) => setTimeout(r, 2000));

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const nb = document.querySelector('.navbar');
          const nl = document.querySelector('.nav-left');
          const nc = document.querySelector('.nav-center');
          const nr = document.querySelector('.nav-right');
          const nw = document.querySelector('.nav-wrapper');
          return {
            nw_width: nw ? nw.offsetWidth : 0,
            nb_width: nb ? nb.offsetWidth : 0,
            nb_height: nb ? nb.offsetHeight : 0,
            nb_flex_wrap: nb ? getComputedStyle(nb).flexWrap : null,
            nb_display: nb ? getComputedStyle(nb).display : null,
            nl_width: nl ? nl.offsetWidth : 0,
            nc_width: nc ? nc.offsetWidth : 0,
            nr_width: nr ? nr.offsetWidth : 0,
            nr_top: nr ? nr.offsetTop : 0,
            nl_top: nl ? nl.offsetTop : 0,
            nc_top: nc ? nc.offsetTop : 0,
          };
        })()
      `,
      returnByValue: true
    });

    console.log('NAV METRICS:', evalRes.result?.result?.value || evalRes.result?.value);
    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

checkNavDom();

