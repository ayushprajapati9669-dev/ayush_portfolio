const fs = require('fs');
const content = fs.readFileSync('client/dist/assets/index-1n38VIAV.js', 'utf8');

// Find function definitions or variable declarations matching ce and $
const matches = [];
const regex = /(?:function\s+ce\b|const\s+ce\s*=|let\s+ce\s*=|var\s+ce\s*=)/g;
let m;
while ((m = regex.exec(content)) !== null) {
  matches.push({ index: m.index, match: m[0], snippet: content.slice(Math.max(0, m.index - 50), m.index + 200) });
}

console.log('Matches for ce:', matches);

