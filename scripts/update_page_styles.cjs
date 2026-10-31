const fs = require('fs');

// 1. Update projects.css
let pCss = fs.readFileSync('client/src/styles/pages/projects.css', 'utf8');

pCss = pCss.replace(
  `  --accent-glow: rgba(56, 189, 248, 0.4);\n  --border: rgba(255, 255, 255, 0.08);\n  --card-bg: linear-gradient(145deg, rgba(20, 25, 32, 0.75), rgba(8, 12, 18, 0.95));`,
  `  --accent-glow: rgba(255, 140, 89, 0.35);\n  --border: rgba(255, 255, 255, 0.08);\n  --card-bg: rgba(16, 15, 14, 0.78);`
);

pCss = pCss.replace(/rgba\(6,\s*182,\s*212,\s*0\.6\)/g, 'rgba(255, 140, 89, 0.4)');
pCss = pCss.replace(/rgba\(6,\s*182,\s*212,\s*0\.3\)/g, 'rgba(255, 140, 89, 0.25)');
pCss = pCss.replace(/rgba\(6,\s*182,\s*212,\s*0\.5\)/g, 'rgba(255, 140, 89, 0.35)');
pCss = pCss.replace(/rgba\(6,\s*182,\s*212,\s*0\.2\)/g, 'rgba(255, 140, 89, 0.2)');

fs.writeFileSync('client/src/styles/pages/projects.css', pCss, 'utf8');
console.log('projects.css updated!');

// 2. Update about.css
let aCss = fs.readFileSync('client/src/styles/pages/about.css', 'utf8');

aCss = aCss.replace(/rgba\(6,\s*182,\s*212,\s*0\.6\)/g, 'rgba(255, 140, 89, 0.4)');
aCss = aCss.replace(/rgba\(56,\s*189,\s*248,\s*0\.4\)/g, 'rgba(255, 140, 89, 0.35)');

fs.writeFileSync('client/src/styles/pages/about.css', aCss, 'utf8');
console.log('about.css updated!');

