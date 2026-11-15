const fs = require('fs');

const content = fs.readFileSync('client/dist/assets/index-1n38VIAV.js', 'utf8');
const lines = content.split('\n');
console.log('Total lines in index bundle:', lines.length);

// Let's inspect line 38 to 42
for (let i = 38; i <= Math.min(lines.length - 1, 45); i++) {
  console.log(`--- Line ${i} (length: ${lines[i].length}) ---`);
  console.log(lines[i].slice(0, 300));
}

