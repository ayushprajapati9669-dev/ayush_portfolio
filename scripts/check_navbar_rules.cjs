const { spawn } = require('child_process');
const path = require('path');

async function checkNavbarRules() {
  const port = 9398;
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
          const el = document.querySelector('.navbar');
          const styleSheets = Array.from(document.styleSheets);
          const matched = [];
          for (const sheet of styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                if (rule.selectorText && el.matches(rule.selectorText)) {
                  matched.push({ selector: rule.selectorText, cssText: rule.cssText });
                }
              }
            } catch (e) {}
          }
          return matched;
        })()
      `,
      returnByValue: true
    });

    console.log('MATCHED RULES ON .navbar:\n', JSON.stringify(evalRes.result?.result?.value || evalRes.result?.value, null, 2));
    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

checkNavbarRules();

