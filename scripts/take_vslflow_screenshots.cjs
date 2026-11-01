const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ARTIFACTS = 'C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb';
const PORT = 9399;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function captureVSLFlow() {
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-vslflow');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + tempUserData,
    'about:blank'
  ]);

  await sleep(2000);

  try {
    let tab = null;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
        if (res.ok) {
          const list = await res.json();
          tab = list.find((t) => t.type === 'page');
          if (tab) break;
        }
      } catch (e) {}
      await sleep(200);
    }

    if (!tab) throw new Error('No page tab');

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

    async function capture(filename, scrollY = 0) {
      if (scrollY > 0) {
        await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${scrollY})` });
        await sleep(1500);
      }
      const snap = await send('Page.captureScreenshot', { format: 'png', quality: 90 });
      fs.writeFileSync(`${ARTIFACTS}/${filename}`, Buffer.from(snap.result.data, 'base64'));
      console.log(`Captured: ${filename}`);
    }

    // 1. Hero
    await send('Page.navigate', { url: 'http://localhost:5175/' });
    await sleep(4000);
    await capture('vslflow_01_hero.png', 0);

    // 2. Below hero - bento section
    await capture('vslflow_02_bento.png', 900);

    // 3. Projects section
    await capture('vslflow_03_projects.png', 2000);

    // 4. Certificates section
    await capture('vslflow_04_certs.png', 3200);

    // 5. CTA Banner
    await capture('vslflow_05_cta.png', 4200);

    // 6. Projects page
    await send('Page.navigate', { url: 'http://localhost:5175/projects' });
    await sleep(3000);
    await capture('vslflow_06_projects_page.png', 0);

    // 7. About page
    await send('Page.navigate', { url: 'http://localhost:5175/about' });
    await sleep(3000);
    await capture('vslflow_07_about.png', 0);

    // 8. Skills page
    await send('Page.navigate', { url: 'http://localhost:5175/skills' });
    await sleep(3000);
    await capture('vslflow_08_skills.png', 0);

    // 9. Contact page
    await send('Page.navigate', { url: 'http://localhost:5175/contact' });
    await sleep(3000);
    await capture('vslflow_09_contact.png', 0);

    // 10. Admin
    await send('Page.navigate', { url: 'http://localhost:5175/admin' });
    await sleep(3500);
    await capture('vslflow_10_admin.png', 0);

    console.log('All VSLFlow screenshots captured!');
    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

captureVSLFlow();

