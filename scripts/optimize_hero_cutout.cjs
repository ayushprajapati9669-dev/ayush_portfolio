const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Optimizing hero portrait cutout...');

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const sourcePath = path.resolve('server/uploads/hero_cutout_1794562459704_847.webp.bak');
  const base64Data = fs.readFileSync(sourcePath).toString('base64');
  const dataUri = `data:image/webp;base64,${base64Data}`;

  const { fullData, mobileData } = await page.evaluate(async (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // 1. Full 1200x1600 High-Quality Lossy WebP (preserves alpha cutout)
        const cFull = document.createElement('canvas');
        cFull.width = img.naturalWidth;
        cFull.height = img.naturalHeight;
        const ctxFull = cFull.getContext('2d');
        ctxFull.drawImage(img, 0, 0);
        const fullUri = cFull.toDataURL('image/webp', 0.92);

        // 2. Mobile 600x800 Retina-2x Cutout (super fast 4G download)
        const cMob = document.createElement('canvas');
        cMob.width = 600;
        cMob.height = 800;
        const ctxMob = cMob.getContext('2d');
        ctxMob.drawImage(img, 0, 0, 600, 800);
        const mobUri = cMob.toDataURL('image/webp', 0.88);

        resolve({
          fullData: fullUri.replace(/^data:image\/webp;base64,/, ''),
          mobileData: mobUri.replace(/^data:image\/webp;base64,/, '')
        });
      };
      img.src = src;
    });
  }, dataUri);

  await browser.close();

  const fullBuf = Buffer.from(fullData, 'base64');
  const mobBuf = Buffer.from(mobileData, 'base64');

  const targetFull = path.resolve('server/uploads/hero_cutout_1794562459704_847.webp');
  const targetMob = path.resolve('server/uploads/hero_cutout_1794562459704_847_mobile.webp');

  fs.writeFileSync(targetFull, fullBuf);
  fs.writeFileSync(targetMob, mobBuf);

  console.log(`Wrote full desktop asset: ${targetFull} (${Math.round(fullBuf.length / 1024)} KB)`);
  console.log(`Wrote mobile asset: ${targetMob} (${Math.round(mobBuf.length / 1024)} KB)`);

  // Also ensure client/public/uploads or client/dist/uploads gets copied if present
  const clientPublicUploads = path.resolve('client/public/uploads');
  if (fs.existsSync(clientPublicUploads)) {
    fs.writeFileSync(path.join(clientPublicUploads, 'hero_cutout_1794562459704_847.webp'), fullBuf);
    fs.writeFileSync(path.join(clientPublicUploads, 'hero_cutout_1794562459704_847_mobile.webp'), mobBuf);
  }

  const clientDistUploads = path.resolve('client/dist/uploads');
  if (fs.existsSync(clientDistUploads)) {
    fs.writeFileSync(path.join(clientDistUploads, 'hero_cutout_1794562459704_847.webp'), fullBuf);
    fs.writeFileSync(path.join(clientDistUploads, 'hero_cutout_1794562459704_847_mobile.webp'), mobBuf);
  }
})();

