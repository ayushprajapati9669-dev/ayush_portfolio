const fs = require('fs');
const content = fs.readFileSync('client/dist/assets/index-1n38VIAV.js', 'utf8');

const matches = [];
const regex = /(?:function\s+\$\b|const\s+\$\s*=|let\s+\$\s*=|var\s+\$\s*=)/g;
let m;
while ((m = regex.exec(content)) !== null) {
  matches.push({ index: m.index, match: m[0], snippet: content.slice(Math.max(0, m.index - 50), m.index + 200) });
}

console.log('Matches for $:', matches);

