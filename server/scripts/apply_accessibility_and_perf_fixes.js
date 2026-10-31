const fs = require('fs');
const path = require('path');

// 1. Header.jsx
const headerPath = path.resolve('client/src/components/layout/Header.jsx');
let headerContent = fs.readFileSync(headerPath, 'utf8');
if (!headerContent.includes('aria-label="Close navigation menu"')) {
  headerContent = headerContent.replace(
    /className="text-slate-400 hover:text-white text-xl p-2"(\r?\n\s*)onClick=\{/g,
    'className="text-slate-400 hover:text-white text-xl p-2"$1aria-label="Close navigation menu"$1onClick={'
  );
  fs.writeFileSync(headerPath, headerContent);
  console.log('Fixed Header.jsx');
}

// 2. DeveloperCliDrawer.jsx
const cliPath = path.resolve('client/src/components/ui/DeveloperCliDrawer.jsx');
let cliContent = fs.readFileSync(cliPath, 'utf8');
cliContent = cliContent.replace(
  /className="w-3 h-3 rounded-full bg-rose-500\/80 hover:bg-rose-400 transition-colors flex items-center justify-center group"(\r?\n\s*)title="Close terminal \(Esc\)"/g,
  'className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-400 transition-colors flex items-center justify-center group"$1title="Close terminal (Esc)"$1aria-label="Close terminal"'
);
cliContent = cliContent.replace(
  /className="w-3 h-3 rounded-full bg-amber-500\/80 hover:bg-amber-400 transition-colors flex items-center justify-center group"(\r?\n\s*)title="Toggle maximize"/g,
  'className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-400 transition-colors flex items-center justify-center group"$1title="Toggle maximize"$1aria-label="Toggle maximize terminal"'
);
cliContent = cliContent.replace(
  /className="w-3 h-3 rounded-full bg-emerald-500\/80 hover:bg-emerald-400 transition-colors flex items-center justify-center group"(\r?\n\s*)title="Clear terminal buffer"/g,
  'className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400 transition-colors flex items-center justify-center group"$1title="Clear terminal buffer"$1aria-label="Clear terminal buffer"'
);
cliContent = cliContent.replace(
  /className="text-white\/40 hover:text-white px-1\.5 py-0\.5 rounded hover:bg-white\/10 transition"(\r?\n\s*)>(\r?\n\s*)<i className="fa-solid fa-xmark"/g,
  'className="text-white/40 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition"$1aria-label="Close terminal"$1>$2<i className="fa-solid fa-xmark"'
);
fs.writeFileSync(cliPath, cliContent);
console.log('Fixed DeveloperCliDrawer.jsx');

// 3. AskAyushAiWidget.jsx
const aiPath = path.resolve('client/src/components/ui/AskAyushAiWidget.jsx');
let aiContent = fs.readFileSync(aiPath, 'utf8');
aiContent = aiContent.replace(
  /className="w-7 h-7 rounded-lg hover:bg-white\/10 text-white\/50 hover:text-white transition flex items-center justify-center"(\r?\n\s*)title="Close AI Assistant"/g,
  'className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition flex items-center justify-center"$1title="Close AI Assistant"$1aria-label="Close AI Assistant"'
);
aiContent = aiContent.replace(
  /className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black flex items-center justify-center transition-all shadow-\[0_0_15px_rgba\(0,240,255,0\.3\)\] shrink-0"(\r?\n\s*)>/g,
  'className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black flex items-center justify-center transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0"$1aria-label="Send message"$1>'
);
fs.writeFileSync(aiPath, aiContent);
console.log('Fixed AskAyushAiWidget.jsx');

// 4. ProjectCard.jsx
const cardPath = path.resolve('client/src/components/projects/ProjectCard.jsx');
let cardContent = fs.readFileSync(cardPath, 'utf8');
// Heading order: h3 -> h2
cardContent = cardContent.replace(/<h3 className="project-title">/g, '<h2 className="project-title">');
cardContent = cardContent.replace(/<\/h3>/g, '</h2>');
// Explicit width/height & aspect-ratio to kill CLS
cardContent = cardContent.replace(
  /<img src=\{imgSrc\} alt=\{proj\.title\} loading="lazy" \/>/g,
  '<img src={imgSrc} alt={proj.title} loading="lazy" width="600" height="340" style={{ aspectRatio: \'16/9\', objectFit: \'cover\' }} />'
);
fs.writeFileSync(cardPath, cardContent);
console.log('Fixed ProjectCard.jsx');

// 5. Projects.jsx
const projectsPath = path.resolve('client/src/pages/Projects/Projects.jsx');
let projectsContent = fs.readFileSync(projectsPath, 'utf8');
projectsContent = projectsContent.replace(
  /<div className="project-grid" id="projectGrid" ref=\{gridRef\}>/g,
  '<div className="project-grid min-h-[500px]" id="projectGrid" ref={gridRef}>'
);
fs.writeFileSync(projectsPath, projectsContent);
console.log('Fixed Projects.jsx');

// 6. effects.css
const effectsPath = path.resolve('client/src/styles/effects.css');
let effectsContent = fs.readFileSync(effectsPath, 'utf8');
effectsContent = effectsContent.replace(
  /\.spheres-container \{/g,
  '.spheres-container {\n  contain: paint layout;'
);
effectsContent = effectsContent.replace(
  /@keyframes floatDroplet \{[\s\S]*?transform: translateY\(0\) scale\(1\);[\s\S]*?transform: translateY\(-60px\) scale\(1\.05\);[\s\S]*?transform: translateY\(0\) scale\(1\);[\s\S]*?\}/g,
  `@keyframes floatDroplet {
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -45px, 0);
  }
  100% {
    transform: translate3d(0, 0, 0);
  }
}`
);
fs.writeFileSync(effectsPath, effectsContent);
console.log('Fixed effects.css');

