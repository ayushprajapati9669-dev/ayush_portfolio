const fs = require('fs');
const js = fs.readFileSync('client/dist/assets/index-BsP6bbUr.js', 'utf8');

const regexes = [/\bct\b/g, /\bdt\b/g, /\bVe\b/g, /\but\b/g];
for (const re of regexes) {
  let m;
  let matches = [];
  while ((m = re.exec(js)) !== null) {
    matches.push(m.index);
  }
  console.log(re, 'count:', matches.length);
  for (const idx of matches.slice(0, 5)) {
    console.log(`  at ${idx}:`, js.substring(Math.max(0, idx - 40), Math.min(js.length, idx + 40)));
  }
}
