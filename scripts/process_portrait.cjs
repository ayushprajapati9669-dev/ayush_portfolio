const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function processPortrait() {
  const chromePort = 9566;
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

    const result = await send('Runtime.evaluate', {
      expression: `
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const cropX = img.width * 0.15;
            const cropY = img.height * 0.10;
            const cropW = img.width * 0.70;
            const cropH = img.height * 0.70;

            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 1000;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#030303';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const width = canvas.width;
            const height = canvas.height;

            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                const brightness = (r + g + b) / 3;
                const maxC = Math.max(r, g, b);
                const minC = Math.min(r, g, b);
                const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

                const isWall = (brightness > 155 && sat < 0.3) || (brightness > 185);

                if (isWall) {
                  data[idx] = 3;
                  data[idx + 1] = 3;
                  data[idx + 2] = 3;
                  data[idx + 3] = 255;
                } else {
                  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                  let norm = lum / 255;
                  norm = (norm - 0.5) * 1.35 + 0.5;
                  norm = Math.max(0, Math.min(1, norm));
                  const newLum = norm * 255;

                  const rightRim = Math.max(0, (x - width * 0.52) / (width * 0.48));
                  const amberR = rightRim * 50;
                  const amberG = rightRim * 24;

                  data[idx] = Math.min(255, newLum * 0.95 + amberR);
                  data[idx + 1] = Math.min(255, newLum * 0.92 + amberG);
                  data[idx + 2] = Math.min(255, newLum * 0.88);
                }

                if (y > height * 0.70) {
                  const fade = 1 - (y - height * 0.70) / (height * 0.30);
                  const f = Math.max(0, Math.min(1, fade));
                  data[idx] = Math.round(data[idx] * f + 3 * (1 - f));
                  data[idx + 1] = Math.round(data[idx + 1] * f + 3 * (1 - f));
                  data[idx + 2] = Math.round(data[idx + 2] * f + 3 * (1 - f));
                }
              }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.src = '${dataUri}';
        })
      `,
      awaitPromise: true
    });

    const dataUrl = result.result?.result?.value || result.result?.value;
    if (dataUrl && dataUrl.startsWith('data:image/png;base64,')) {
      const b64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const outPath = path.join(__dirname, '..', 'client', 'public', 'images', 'ayush-sarthak-portrait.png');
      fs.writeFileSync(outPath, Buffer.from(b64Data, 'base64'));
      console.log('Saved processed portrait to', outPath);
    } else {
      console.error('Failed to get dataUrl:', result);
    }

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chromeProc.kill();
    try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
  }
}

processPortrait();
