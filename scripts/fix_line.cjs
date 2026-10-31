const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'client', 'src', 'pages', 'About', 'About.jsx');
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);

console.log('Line 549:', JSON.stringify(lines[548]));
console.log('Line 550:', JSON.stringify(lines[549]));
console.log('Line 551:', JSON.stringify(lines[550]));

lines[549] = '              );\n            })}';
fs.writeFileSync(p, lines.join('\n'), 'utf8');
console.log('Updated line 550 successfully');

