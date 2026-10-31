const fs = require('fs');
const path = require('path');

// 1. ProjectCard.jsx
const cardPath = path.resolve('client/src/components/projects/ProjectCard.jsx');
let card = fs.readFileSync(cardPath, 'utf8');
card = card.replace(
  /<img src=\{imgSrc\} alt=\{proj\.title\} loading="lazy" width="600" height="340" style=\{\{ aspectRatio: '16\/9', objectFit: 'cover' \}\} \/>/,
  '<img src={imgSrc} alt={proj.title} loading={indexNum === 1 ? "eager" : "lazy"} fetchPriority={indexNum === 1 ? "high" : "auto"} decoding={indexNum === 1 ? "sync" : "async"} width="600" height="340" style={{ aspectRatio: "16/9", objectFit: "cover" }} />'
);
fs.writeFileSync(cardPath, card);
console.log('Updated ProjectCard.jsx');

// 2. Projects.jsx
const projPath = path.resolve('client/src/pages/Projects/Projects.jsx');
let proj = fs.readFileSync(projPath, 'utf8');
proj = proj.replace(
  /gsap\.from\('\.project-card', \{\r?\n\s*y: 60,\r?\n\s*opacity: 0,\r?\n\s*duration: 1,\r?\n\s*stagger: 0\.15,\r?\n\s*ease: 'back\.out\(1\.2\)',\r?\n\s*delay: 0\.2,/g,
  'gsap.from(".project-card:not(:first-child)", {\n        y: 20,\n        opacity: 0.3,\n        duration: 0.35,\n        stagger: 0.05,\n        ease: "power2.out",'
);
fs.writeFileSync(projPath, proj);
console.log('Updated Projects.jsx');

// 3. index.html font display
const htmlPath = path.resolve('client/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace(/&display=swap/g, '&display=optional');
fs.writeFileSync(htmlPath, html);
console.log('Updated index.html font display');

