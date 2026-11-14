const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('=== RUNNING CHROME CDP CPU PROFILE (MOBILE THROTTLED) ===');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const client = await page.target().createCDPSession();

  // Emulate Moto G4 / mobile 4x CPU throttle
  await page.setViewport({ width: 360, height: 640, isMobile: true, hasTouch: true, devicePixelRatio: 2 });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Network emulation (Simulated 4G)
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8           // 750 Kbps
  });

  await client.send('Profiler.enable');
  await client.send('Profiler.setSamplingInterval', { interval: 1000 }); // 1ms
  await client.send('Profiler.start');

  console.log('Navigating to http://127.0.0.1:4173/...');
  const navStart = performance.now();
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
  
  // Wait 4 seconds to capture post-load idle tasks and WebGL inits
  await new Promise(r => setTimeout(r, 4500));
  const navEnd = performance.now();
  console.log(`Navigation & settled duration: ${(navEnd - navStart).toFixed(0)} ms`);

  const { profile } = await client.send('Profiler.stop');
  fs.writeFileSync('cpu_profile.json', JSON.stringify(profile, null, 2));

  // Analyze top functions by self-time and hit count
  const nodes = profile.nodes;
  const samples = profile.samples || [];
  const timeDeltas = profile.timeDeltas || [];

  const nodeMap = new Map();
  for (const n of nodes) {
    nodeMap.set(n.id, {
      ...n,
      hitCount: 0,
      selfTime: 0
    });
  }

  for (let i = 0; i < samples.length; i++) {
    const nodeId = samples[i];
    const delta = timeDeltas[i] || 1000;
    const node = nodeMap.get(nodeId);
    if (node) {
      node.hitCount++;
      node.selfTime += delta;
    }
  }

  const sorted = Array.from(nodeMap.values())
    .filter(n => n.callFrame.functionName && !n.callFrame.functionName.startsWith('(root)') && !n.callFrame.functionName.startsWith('(idle)'))
    .sort((a, b) => b.selfTime - a.selfTime);

  console.log('\n=== TOP 20 CPU CONSUMING FUNCTIONS (SELF TIME) ===');
  for (const n of sorted.slice(0, 20)) {
    const fn = n.callFrame.functionName || '(anonymous)';
    const url = (n.callFrame.url || '').split('/').pop().split('?')[0];
    const line = n.callFrame.lineNumber;
    const selfMs = (n.selfTime / 1000).toFixed(1);
    console.log(`  ${selfMs} ms | ${fn} @ ${url}:${line}`);
  }

  await browser.close();
})();

