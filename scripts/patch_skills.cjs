const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'components', 'ui', 'InteractiveSkillsWidget.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add normalizeSkillKey before getSkillVisuals
const helperCode = `// Helper to normalize skill names and avoid duplicate alias cards
const normalizeSkillKey = (name) => {
  const lower = (name || '').toLowerCase().trim();
  if (lower === 'html' || lower === 'html5') return 'html5';
  if (lower === 'css' || lower === 'css3') return 'css3';
  if (lower === 'js' || lower === 'javascript' || lower === 'es6') return 'javascript';
  if (lower === 'ts' || lower === 'typescript') return 'typescript';
  if (lower === 'react' || lower === 'react.js' || lower === 'reactjs') return 'react.js';
  if (lower === 'node' || lower === 'node.js' || lower === 'nodejs') return 'node.js';
  if (lower === 'express' || lower === 'express.js' || lower === 'expressjs') return 'express.js';
  if (lower.includes('rest api')) return 'rest apis';
  if (lower === 'mongo' || lower === 'mongodb') return 'mongodb';
  return lower;
};

// Helper to map dynamic Database / CMS skill name to official Devicon SVG`;

content = content.replace(
  '// Helper to map dynamic Database / CMS skill name to official Devicon SVG',
  helperCode
);

// 2. Update map building in allSkills
const oldMapBlock = `    // Combine unique skills by name
    const map = new Map();
    REFERENCE_SKILLS.forEach((s) => map.set(s.name.toLowerCase(), s));

    flattened.forEach((item) => {
      const name = item.name || item.title || '';
      if (!name) return;
      const key = name.toLowerCase();
      const existing = map.get(key);
      const visuals = getSkillVisuals(item);

      const validIconUrl =
        typeof item.icon === 'string' &&
        (item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.startsWith('data:'))
          ? item.icon
          : typeof existing?.icon === 'string' &&
            (existing.icon.startsWith('http') || existing.icon.startsWith('/'))
          ? existing.icon
          : visuals.iconUrl;

      const deviconCls =
        typeof item.icon === 'string' && item.icon.startsWith('devicon-')
          ? item.icon
          : visuals.deviconClass;

      map.set(key, {
        name,
        category: item.category || existing?.category || 'tools',
        icon: validIconUrl,
        deviconClass: deviconCls,
        invert: item.invert !== undefined ? item.invert : (existing?.invert ?? visuals.invertIcon)
      });
    });`;

const newMapBlock = `    // Combine unique skills by normalized alias
    const map = new Map();
    REFERENCE_SKILLS.forEach((s) => map.set(normalizeSkillKey(s.name), s));

    flattened.forEach((item) => {
      const name = item.name || item.title || '';
      if (!name) return;
      const key = normalizeSkillKey(name);
      const existing = map.get(key);
      const visuals = getSkillVisuals(item);

      const validIconUrl =
        typeof item.icon === 'string' &&
        (item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.startsWith('data:'))
          ? item.icon
          : typeof existing?.icon === 'string' &&
            (existing.icon.startsWith('http') || existing.icon.startsWith('/'))
          ? existing.icon
          : visuals.iconUrl;

      const deviconCls =
        typeof item.icon === 'string' && item.icon.startsWith('devicon-')
          ? item.icon
          : visuals.deviconClass;

      const canonicalName = existing?.name || name;

      map.set(key, {
        name: canonicalName,
        category: item.category || existing?.category || 'tools',
        icon: validIconUrl,
        deviconClass: deviconCls,
        invert: item.invert !== undefined ? item.invert : (existing?.invert ?? visuals.invertIcon)
      });
    });`;

// 3. Update useEffect animation logic
const oldAnimBlock = `    const cards = gridRef.current.querySelectorAll('.skill-card');
    if (cards.length > 0) {
      if (isStandalonePage) {
        gsap.fromTo(
          cards,
          { y: 35, opacity: 0, scale: 0.92, rotateY: -6 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            duration: 0.55,
            stagger: 0.03,
            ease: 'back.out(1.2)',
            clearProps: 'transform,opacity',
            overwrite: 'auto'
          }
        );
      } else {
        gsap.fromTo(
          cards,
          { y: 35, opacity: 0, scale: 0.92, rotateY: -6 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            duration: 0.55,
            stagger: 0.03,
            ease: 'back.out(1.2)',
            clearProps: 'transform,opacity',
            overwrite: 'auto',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }`;

const newAnimBlock = `    const cards = gridRef.current.querySelectorAll('.skill-card');
    if (cards.length > 0) {
      const rect = gridRef.current.getBoundingClientRect();
      const inView = rect.top < (window.innerHeight || 800);

      if (isStandalonePage || inView) {
        gsap.fromTo(
          cards,
          { y: 20, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.4,
            stagger: 0.025,
            ease: 'power2.out',
            clearProps: 'all',
            overwrite: 'auto'
          }
        );
      } else {
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0, scale: 0.94 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.025,
            ease: 'back.out(1.2)',
            clearProps: 'all',
            overwrite: 'auto',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          }
        );
      }
    }`;

const normalizeLf = (s) => s.replace(/\r\n/g, '\n');
let norm = normalizeLf(content);
norm = norm.replace(normalizeLf(oldMapBlock), normalizeLf(newMapBlock));
norm = norm.replace(normalizeLf(oldAnimBlock), normalizeLf(newAnimBlock));

fs.writeFileSync(filePath, norm, 'utf8');
console.log('Successfully patched InteractiveSkillsWidget.jsx!');

