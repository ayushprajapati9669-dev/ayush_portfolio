const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function captureMorePowder() {
  const port = 9397;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-snap-more');
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
    await new Promise((r) => setTimeout(r, 2500));

    // 1. Isometric Feature Cards with Slider & Arrows
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1850)' });
    await new Promise((r) => setTimeout(r, 1000));
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/powder_03b_cards_slider.png', Buffer.from(snap1.result.data, 'base64'));

    // 2. Horizontal Scrollable Projects & Certificates
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 3100)' });
    await new Promise((r) => setTimeout(r, 1000));
    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/powder_05_horizontal_showcase.png', Buffer.from(snap2.result.data, 'base64'));

    // 3. Navigate to Projects page
    await send('Page.navigate', { url: 'http://localhost:5175/projects' });
    await new Promise((r) => setTimeout(r, 2000));
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/powder_06_projects_page.png', Buffer.from(snap3.result.data, 'base64'));

    // 4. Navigate to Certificates page
    await send('Page.navigate', { url: 'http://localhost:5175/certificates' });
    await new Promise((r) => setTimeout(r, 2000));
    const snap4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/powder_07_certificates_page.png', Buffer.from(snap4.result.data, 'base64'));

    console.log('Successfully captured powder_03b, 05, 06, 07!');
    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

captureMorePowder();
