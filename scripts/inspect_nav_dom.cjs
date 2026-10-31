const fs = require('fs');

async function testNavbarElements() {
  const res = await fetch('http://127.0.0.1:9334/json/list').catch(() => null);
  // We can evaluate in capture.js
}

