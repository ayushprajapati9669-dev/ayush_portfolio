const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testAdminLoginAndDashboard() {
  const port = 9393;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-admin-test');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${tempUserData}`,
    'http://localhost:5174/admin/login'
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
    await new Promise((res) => ws.onopen = res);

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

    await send('Page.navigate', { url: 'http://localhost:5174/admin/login' });
    await new Promise((r) => setTimeout(r, 1500));

    // Fill in admin login form via React value setter
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          function setReactValue(input, val) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, val);
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const userInp = document.querySelector('input[type=\"text\"], input[name=\"username\"], input[type=\"email\"]');
          const passInp = document.querySelector('input[type=\"password\"]');
          const btn = document.querySelector('button[type=\"submit\"]');
          if (userInp) setReactValue(userInp, 'ayushprajapati9669@gmail.com');
          if (passInp) setReactValue(passInp, 'Ayush@2026');
          setTimeout(() => { if (btn) btn.click(); }, 100);
        })()
      `
    });

    // Wait for redirect to /admin
    await new Promise((r) => setTimeout(r, 3000));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(snap.result.data, 'base64');
    const out = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\a65f0578-4a47-4a84-8743-3af3312bebbb\\verify_admin_logged_in.png';
    fs.writeFileSync(out, buffer);
    console.log('Saved admin dashboard screenshot to:', out);

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

testAdminLoginAndDashboard();
