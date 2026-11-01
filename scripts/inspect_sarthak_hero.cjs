const fs = require('fs');
const html = fs.readFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/a65f0578-4a47-4a84-8743-3af3312bebbb/sarthak_live.html', 'utf8');

// Find header / nav
const headerIdx = html.indexOf('<header');
const headerEnd = html.indexOf('</header>');
if (headerIdx !== -1 && headerEnd !== -1) {
  console.log('=== HEADER / NAVBAR ===\n', html.substring(headerIdx, headerEnd + 9));
}

// Find hero section
const heroIdx = html.indexOf('hero');
console.log('\n=== HERO SNIPPET ===\n', html.substring(heroIdx - 50, heroIdx + 3000));

