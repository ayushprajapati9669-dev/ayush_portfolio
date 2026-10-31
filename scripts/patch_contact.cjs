const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'client', 'src', 'styles', 'pages', 'contact.css');
let content = fs.readFileSync(cssPath, 'utf8');

const oldBlock = `.info-text .value {
  font-size: 15px;
  color: white;
  font-weight: 600;
  word-break: break-all;
  display: flex;
  align-items: center;
  gap: 8px;
}`;

const newBlock = `.info-text .value {
  font-size: 15px;
  color: white;
  font-weight: 600;
  word-break: normal;
  overflow-wrap: break-word;
  hyphens: none;
  display: flex;
  align-items: center;
  gap: 8px;
}`;

const normalizeLf = (s) => s.replace(/\r\n/g, '\n');
let norm = normalizeLf(content);
norm = norm.replace(normalizeLf(oldBlock), normalizeLf(newBlock));
fs.writeFileSync(cssPath, norm, 'utf8');
console.log('Updated contact.css word-break!');

