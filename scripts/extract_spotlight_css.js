const fs = require('fs');
const path = require('path');

const aboutCssPath = path.join(__dirname, '../client/src/styles/pages/about.css');
const targetPath = path.join(__dirname, '../client/src/styles/components/spotlight-slider.css');

const content = fs.readFileSync(aboutCssPath, 'utf8');
const lines = content.split('\n');

// Find start and end of spotlight section
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Luxury Milestone Spotlight Slider & Architecture Deep-Dive')) {
    startIdx = i - 3;
  }
  if (lines[i].includes('about-page .timeline-item') && startIdx !== -1) {
    endIdx = i - 1;
    break;
  }
}

console.log(`Found spotlight CSS range: line ${startIdx + 1} to line ${endIdx + 1}`);
if (startIdx !== -1 && endIdx !== -1) {
  const spotlightCss = lines.slice(startIdx, endIdx).join('\n');
  fs.writeFileSync(targetPath, spotlightCss, 'utf8');
  console.log(`Successfully created ${targetPath} (${endIdx - startIdx} lines).`);
} else {
  console.error('Could not find range!');
}
