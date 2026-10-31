const fs = require('fs');
const path = require('path');

// 1. Patch about.css for avatar crop
const cssPath = path.join(__dirname, '..', 'client', 'src', 'styles', 'pages', 'about.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('object-position: center 20%;')) {
  cssContent = cssContent.replace(
    '.profile-img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;',
    '.profile-img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  object-position: center 20%;'
  ).replace(
    '.profile-img {\r\n  width: 100%;\r\n  height: 100%;\r\n  object-fit: cover;',
    '.profile-img {\r\n  width: 100%;\r\n  height: 100%;\r\n  object-fit: cover;\r\n  object-position: center 20%;'
  );
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('Updated about.css avatar object-position!');
} else {
  console.log('about.css already has object-position');
}

// 2. Patch About.jsx for spotlight GSAP target and timeline deduplication
const aboutPath = path.join(__dirname, '..', 'client', 'src', 'pages', 'About', 'About.jsx');
let aboutContent = fs.readFileSync(aboutPath, 'utf8');

// Replace spotlight GSAP target
aboutContent = aboutContent.replace(
  "gsap.from('.spotlight-section .about-card'",
  "gsap.from('.spotlight-section .spotlight-card'"
);

// Replace timeline phase / yearBadge rendering
const oldTimeline = `{timelineMilestones.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-year">
                  <span>{item.phase}</span>
                  <span>· {item.yearBadge}</span>`;

const newTimeline = `{timelineMilestones.map((item, idx) => {
              const cleanPhase = (item.phase || '').replace(/\\s*·\\s*Year\\s*[\\d–-]+/i, '').trim();
              const showYear = item.yearBadge && !cleanPhase.toLowerCase().includes(item.yearBadge.toLowerCase());
              return (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-year">
                    <span>{cleanPhase || item.phase}</span>
                    {showYear && <span> · {item.yearBadge}</span>}`;

const normalizeLf = (s) => s.replace(/\r\n/g, '\n');
let normAbout = normalizeLf(aboutContent);

if (normAbout.includes(normalizeLf(oldTimeline))) {
  normAbout = normAbout.replace(normalizeLf(oldTimeline), normalizeLf(newTimeline));
  // Also close the return statement inside map: check closing of map
  normAbout = normAbout.replace(
    `                <p>{item.description}</p>
              </div>
            ))}`,
    `                <p>{item.description}</p>
                </div>
              );
            })}`
  );
  fs.writeFileSync(aboutPath, normAbout, 'utf8');
  console.log('Updated About.jsx timeline & spotlight GSAP target!');
} else {
  console.log('oldTimeline block not found directly, checking About.jsx content');
}

