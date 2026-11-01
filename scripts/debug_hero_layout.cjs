const { spawn } = require('child_process');
const path = require('path');

async function debugHeroLayout() {
  const port = 9397;
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
          const main = document.getElementById('main-content');
          const stage = document.querySelector('.hero-editorial-stage');
          const meta = document.querySelector('.hero-top-meta');
          const showcase = document.querySelector('.hero-center-showcase');
          const portrait = document.querySelector('.hero-portrait-stage');
          const name = document.querySelector('.hero-name-editorial');
          const actions = document.querySelector('.hero-actions-editorial');
          const footer = document.querySelector('.hero-bottom-footer');

          return {
            window_innerHeight: window.innerHeight,
            main_top: main ? Math.round(main.getBoundingClientRect().top) : null,
            stage_top: stage ? Math.round(stage.getBoundingClientRect().top) : null,
            stage_height: stage ? Math.round(stage.getBoundingClientRect().height) : null,
            meta_top: meta ? Math.round(meta.getBoundingClientRect().top) : null,
            showcase_top: showcase ? Math.round(showcase.getBoundingClientRect().top) : null,
            portrait_top: portrait ? Math.round(portrait.getBoundingClientRect().top) : null,
            name_top: name ? Math.round(name.getBoundingClientRect().top) : null,
            actions_top: actions ? Math.round(actions.getBoundingClientRect().top) : null,
            footer_top: footer ? Math.round(footer.getBoundingClientRect().top) : null
          };
        })()
      `,
      returnByValue: true
    });

    console.log('LAYOUT DEBUG:\n', JSON.stringify(evalRes.result?.result?.value || evalRes.result?.value, null, 2));
    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

debugHeroLayout();
