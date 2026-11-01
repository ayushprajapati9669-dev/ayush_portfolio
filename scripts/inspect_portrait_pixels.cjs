const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function inspectPortraitPixels() {
  const chromePort = 9568;
  const tempUserData = path.join(__dirname, '..', '.tmp-chrome-profile-' + Date.now());
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${chromePort}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1000,1250',
    `--user-data-dir=${tempUserData}`,
    'about:blank'
  ]);

  try {
    let tab = null;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${chromePort}/json/list`);
        if (res.ok) {
          const list = await res.json();
          tab = list.find((t) => t.type === 'page');
          if (tab) break;
        }
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 200));
    }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r) => ws.onopen = r);

    let id = 1;
    const send = (method, params = {}) => new Promise((res) => {
      const curId = id++;
      const onMsg = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === curId) {
          ws.removeEventListener('message', onMsg);
          res(data);
        }
      };
      ws.addEventListener('message', onMsg);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    const imgPath = path.join(__dirname, '..', 'client', 'public', 'images', 'ayush-portrait-new.jpg');
    const b64 = fs.readFileSync(imgPath).toString('base64');
    const dataUri = `data:image/jpeg;base64,${b64}`;

    const res = await send('Runtime.evaluate', {
      expression: `
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Sample top-left (wall), top-center (wall), top-right (wall), hair, skin, sweater
            const pWallTL = ctx.getImageData(10, 10, 1, 1).data;
            const pWallTR = ctx.getImageData(img.width - 10, 10, 1, 1).data;
            const pHair = ctx.getImageData(Math.round(img.width * 0.5), Math.round(img.height * 0.25), 1, 1).data;
            const pForehead = ctx.getImageData(Math.round(img.width * 0.5), Math.round(img.height * 0.35), 1, 1).data;
            const pSweater = ctx.getImageData(Math.round(img.width * 0.5), Math.round(img.height * 0.7), 1, 1).data;

            resolve({
              width: img.width,
              height: img.height,
              wallTL: Array.from(pWallTL),
              wallTR: Array.from(pWallTR),
              hair: Array.from(pHair),
              forehead: Array.from(pForehead),
              sweater: Array.from(pSweater)
            });
          };
          img.src = '${dataUri}';
        })
      `,
      awaitPromise: true
    });

    console.log('Sampled pixels:', res.result?.result?.value || res.result?.value);
    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chromeProc.kill();
    try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
  }
}
inspectPortraitPixels();

