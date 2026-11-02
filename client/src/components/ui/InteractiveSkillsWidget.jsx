import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

// Reference Baseline Skills Dataset with High-Res Brand SVGs
const REFERENCE_SKILLS = [
  { name: 'C', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg', level: 'Core' },
  { name: 'Java', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', level: 'OOP' },
  { name: 'Python', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', level: 'Advanced' },
  { name: 'JavaScript', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', level: 'ES6+' },
  { name: 'TypeScript', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', level: 'Typed' },
  { name: 'HTML5', category: 'frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', level: 'Semantic' },
  { name: 'CSS3', category: 'frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', level: 'Modern' },
  { name: 'React.js', category: 'frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', level: 'V18/Hooks' },
  { name: 'Tailwind CSS', category: 'frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', level: 'Utility' },
  { name: 'Node.js', category: 'backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', level: 'Runtime' },
  { name: 'Express.js', category: 'backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', invert: true, level: 'REST APIs' },
  { name: 'REST APIs', category: 'backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg', level: 'Architecture' },
  { name: 'MongoDB', category: 'database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', level: 'NoSQL' },
  { name: 'MySQL', category: 'database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', level: 'RDBMS' },
  { name: 'PostgreSQL', category: 'database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', level: 'SQL' },
  { name: 'Git', category: 'tools', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', level: 'VCS' },
  { name: 'GitHub', category: 'tools', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', invert: true, level: 'CI/CD' },
  { name: 'Postman', category: 'tools', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg', level: 'API Testing' },
  { name: 'Docker', category: 'tools', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', level: 'DevOps' }
];

// Helper to normalize skill names and avoid duplicate alias cards
const normalizeSkillKey = (name) => {
  const lower = (name || '').toLowerCase().trim();
  if (lower === 'html' || lower === 'html5') return 'html5';
  if (lower === 'css' || lower === 'css3') return 'css3';
  if (lower === 'js' || lower === 'javascript' || lower === 'es6') return 'javascript';
  if (lower === 'ts' || lower === 'typescript') return 'typescript';
  if (lower === 'react' || lower === 'react.js' || lower === 'reactjs') return 'react.js';
  if (lower === 'node' || lower === 'node.js' || lower === 'nodejs') return 'node.js';
  if (lower === 'express' || lower === 'express.js' || lower === 'expressjs') return 'express.js';
  if (lower === 'tailwind' || lower === 'tailwindcss' || lower === 'tailwind css') return 'tailwind css';
  if (lower.includes('rest api')) return 'rest apis';
  if (lower === 'mongo' || lower === 'mongodb') return 'mongodb';
  return lower;
};

// Helper to map dynamic Database / CMS skill name to official Devicon SVG
export const getSkillVisuals = (skillObj) => {
  const rawName = (typeof skillObj === 'string' ? skillObj : skillObj?.name || skillObj?.title || '').toLowerCase().trim();
  const customDbIcon = typeof skillObj === 'object' ? (skillObj?.icon || skillObj?.image || skillObj?.logo || skillObj?.logoKey) : null;

  const brandMap = [
    { match: ['javascript', 'js', 'es6'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', devicon: 'devicon-javascript-plain' },
    { match: ['typescript', 'ts'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', devicon: 'devicon-typescript-plain' },
    { match: ['react', 'reactjs', 'react.js', 'react js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', devicon: 'devicon-react-original' },
    { match: ['next', 'nextjs', 'next.js', 'next js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', invert: true, devicon: 'devicon-nextjs-original' },
    { match: ['node', 'nodejs', 'node.js', 'node js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', devicon: 'devicon-nodejs-plain' },
    { match: ['express', 'expressjs', 'express.js', 'express js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', invert: true, devicon: 'devicon-express-original' },
    { match: ['mongo', 'mongodb'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', devicon: 'devicon-mongodb-plain' },
    { match: ['java', 'core java'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', devicon: 'devicon-java-plain' },
    { match: ['spring', 'spring boot', 'springboot'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg', devicon: 'devicon-spring-plain' },
    { match: ['tailwind', 'tailwindcss', 'tailwind css'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', devicon: 'devicon-tailwindcss-original' },
    { match: ['python'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', devicon: 'devicon-python-plain' },
    { match: ['git'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', devicon: 'devicon-git-plain' },
    { match: ['github'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', invert: true, devicon: 'devicon-github-original' },
    { match: ['postman'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg', devicon: 'devicon-postman-plain' },
    { match: ['docker'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', devicon: 'devicon-docker-plain' },
    { match: ['html', 'html5'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', devicon: 'devicon-html5-plain' },
    { match: ['css', 'css3'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', devicon: 'devicon-css3-plain' },
    { match: ['mysql'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', devicon: 'devicon-mysql-plain' },
    { match: ['postgres', 'postgresql'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', devicon: 'devicon-postgresql-plain' },
    { match: ['redux'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg', devicon: 'devicon-redux-original' },
    { match: ['c++', 'cpp', 'cplusplus'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg', devicon: 'devicon-cplusplus-plain' },
    { match: ['c', 'c language'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg', devicon: 'devicon-c-plain' },
    { match: ['bootstrap'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg', devicon: 'devicon-bootstrap-plain' },
    { match: ['vite', 'vitejs', 'vite js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg', devicon: 'devicon-vitejs-plain' },
    { match: ['vscode', 'vs code'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', devicon: 'devicon-vscode-plain' },
    { match: ['dsa', 'data structures', 'algorithms', 'problem solving'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/devicon/devicon-original.svg', devicon: 'fa-solid fa-brain' },
    { match: ['rest', 'api', 'apis', 'rest api', 'rest apis'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg', devicon: 'devicon-fastapi-plain' },
    { match: ['cloudinary'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg', devicon: 'devicon-googlecloud-plain' },
    { match: ['responsive', 'ui', 'interface'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', devicon: 'devicon-figma-plain' }
  ];

  const deviconMatch = (typeof customDbIcon === 'string' && customDbIcon.startsWith('devicon-'))
    ? customDbIcon.replace('devicon-', '').replace('-plain', '').replace('-original', '').replace('-wordmark', '')
    : '';

  const found = brandMap.find((b) =>
    b.match.some((keyword) => {
      if (keyword === 'c') {
        return rawName === 'c' || rawName.split(/[\s,./\-_]+/).includes('c') || deviconMatch === 'c';
      }
      return rawName.includes(keyword) || (deviconMatch && deviconMatch.includes(keyword));
    })
  );

  const hasHttpUrl = customDbIcon && typeof customDbIcon === 'string' && (customDbIcon.startsWith('http') || customDbIcon.startsWith('/') || customDbIcon.startsWith('data:'));

  return {
    iconUrl: hasHttpUrl
      ? customDbIcon
      : found?.icon || 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/devicon/devicon-original.svg',
    invertIcon: found?.invert || false,
    deviconClass: (typeof customDbIcon === 'string' && customDbIcon.startsWith('devicon-'))
      ? customDbIcon
      : (found?.devicon || null)
  };
};

export function SkillsSection({
  dbSkills = null,
  showCta = false,
  onCtaClick = null,
  isStandalonePage = false,
}) {
  const { appState } = usePortfolio();
  const ui = appState.uiLabels || {};

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const gridRef = useRef(null);
  const filterContainerRef = useRef(null);

  // 1. Merge baseline skills with any dynamic CMS database skills
  const allSkills = useMemo(() => {
    const customList = (dbSkills && Array.isArray(dbSkills) && dbSkills.length > 0)
      ? dbSkills
      : (appState.skills || []);

    if (!customList || customList.length === 0) {
      return REFERENCE_SKILLS;
    }

    // Flatten if grouped by category
    let flattened = [];
    if (customList.length > 0 && Array.isArray(customList[0]?.items)) {
      flattened = customList.flatMap((cat) =>
        (cat.items || []).map((item) => ({
          ...item,
          category: (cat.category || 'tools').toLowerCase()
        }))
      );
    } else {
      flattened = customList.map((s) => ({
        ...(typeof s === 'string' ? { name: s } : s),
        category: (s.category || 'tools').toLowerCase()
      }));
    }

    // Combine unique skills by normalized alias
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
        invert: item.invert !== undefined ? item.invert : (existing?.invert ?? visuals.invertIcon),
        level: item.level || existing?.level || 'Core'
      });
    });

    return Array.from(map.values());
  }, [dbSkills, appState.skills]);

  // Compute category counts for user-friendly filter badges
  const categoryCounts = useMemo(() => {
    const counts = { all: allSkills.length, languages: 0, frontend: 0, backend: 0, database: 0, tools: 0 };
    allSkills.forEach((s) => {
      const cat = (s.category || '').toLowerCase();
      if (cat.includes('lang')) counts.languages++;
      else if (cat.includes('front') || cat.includes('ui')) counts.frontend++;
      else if (cat.includes('back') || cat.includes('api')) counts.backend++;
      else if (cat.includes('data') || cat.includes('sql') || cat.includes('db')) counts.database++;
      else counts.tools++;
    });
    return counts;
  }, [allSkills]);

  // Standard category tabs with dynamic counts
  const filterOptions = [
    { id: 'all', label: 'All Stack', count: categoryCounts.all },
    { id: 'languages', label: 'Languages', count: categoryCounts.languages },
    { id: 'frontend', label: 'Frontend', count: categoryCounts.frontend },
    { id: 'backend', label: 'Backend', count: categoryCounts.backend },
    { id: 'database', label: 'Databases', count: categoryCounts.database },
    { id: 'tools', label: 'Tools', count: categoryCounts.tools }
  ];

  // Filter skills based on category and live search query
  const filteredSkills = useMemo(() => {
    return allSkills.filter((s) => {
      // Category check
      if (selectedFilter !== 'all') {
        const cat = (s.category || '').toLowerCase();
        if (selectedFilter === 'database') {
          if (!cat.includes('data') && !cat.includes('sql') && !cat.includes('db')) return false;
        } else if (!cat.includes(selectedFilter)) {
          return false;
        }
      }
      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const n = (s.name || '').toLowerCase();
        const c = (s.category || '').toLowerCase();
        return n.includes(q) || c.includes(q);
      }
      return true;
    });
  }, [selectedFilter, searchQuery, allSkills]);

  // Magnetic button physics
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !filterContainerRef.current) return;

    const btns = filterContainerRef.current.querySelectorAll('.filter-btn');
    const cleanups = [];

    btns.forEach((el) => {
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        gsap.to(el, {
          x: (x - rect.width / 2) * 0.2,
          y: (y - rect.height / 2) * 0.2,
          duration: 0.35,
          ease: 'power2.out'
        });
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [filterOptions.length]);

  // 3D Card Hover Physics
  const handleCardMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y - rect.height / 2) / rect.height) * -8;
    const rotateY = ((x - rect.width / 2) / rect.width) * 8;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.35,
      ease: 'power2.out'
    });
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.4)'
    });
  };

  return (
    <section className={`skills-section ${isStandalonePage ? 'standalone' : 'home-embedded'}`}>
      {/* Header - Only render on embedded home view */}
      {!isStandalonePage && (
        <div className="skills-header mb-8">
          <span className="skills-subtitle">
            {ui.homeSkillsEyebrow || '03 · Technical Capabilities'}
          </span>
          <h2 className="skills-title">
            Interactive Skills & Tech Stack
          </h2>
        </div>
      )}

      {/* Filter Buttons & Live Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-7">
        <div className="filter-container !mb-0" ref={filterContainerRef}>
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`filter-btn ${selectedFilter === opt.id ? 'active' : ''}`}
              onClick={() => {
                playTick();
                setSelectedFilter(opt.id);
              }}
            >
              <span>{opt.label}</span>
              <span className="filter-count">{opt.count}</span>
            </button>
          ))}

          {showCta && onCtaClick && (
            <button
              type="button"
              onClick={() => {
                playTick();
                onCtaClick();
              }}
              className="filter-btn"
              style={{ borderColor: 'rgba(212, 175, 55, 0.35)', color: '#d4af37' }}
            >
              Full View →
            </button>
          )}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-gold/50 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 outline-none transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Uniform High-End Skills Grid */}
      <div className="skills-grid" id="skillsGrid" ref={gridRef}>
        {filteredSkills.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <p className="text-amber-300 font-mono text-xs mb-1">✦ NO MATCHING SKILLS</p>
            <p>No technologies found matching &ldquo;{searchQuery}&rdquo; in this category.</p>
          </div>
        ) : (
          filteredSkills.map((skill, index) => (
            <SkillCardItem
              key={skill._id || skill.name || skill.title || index}
              skill={skill}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            />
          ))
        )}
      </div>
    </section>
  );
}

// Resilient SkillCardItem component
function SkillCardItem({ skill, onMouseMove, onMouseLeave }) {
  const [imgFailed, setImgFailed] = useState(false);
  const skillName = skill.name || skill.title || '';
  const visuals = getSkillVisuals(skill);
  const hasHttpIcon =
    typeof skill.icon === 'string' &&
    (skill.icon.startsWith('http') || skill.icon.startsWith('/') || skill.icon.startsWith('data:'));
  const iconSrc = hasHttpIcon ? skill.icon : visuals.iconUrl;
  const deviconCls = skill.deviconClass || visuals.deviconClass;
  const invert = skill.invert !== undefined ? skill.invert : visuals.invertIcon;

  return (
    <div
      className="skill-card group"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="skill-icon-wrapper">
        {!imgFailed && iconSrc ? (
          <img
            src={iconSrc}
            alt={skillName}
            className={`${invert ? 'invert-icon' : ''} transition-transform duration-300 group-hover:scale-110`}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : deviconCls ? (
          deviconCls.startsWith('fa-') ? (
            <i className={`${deviconCls} text-2xl transition-transform duration-300 group-hover:scale-110`} style={{ color: '#d4af37' }} />
          ) : (
            <i className={`${deviconCls} colored text-2xl transition-transform duration-300 group-hover:scale-110`} />
          )
        ) : (
          <span className="font-mono font-bold text-sm text-gold">
            {skillName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="skill-text">
        <div className="skill-name" title={skillName}>{skillName}</div>
        <span className="skill-badge-level">{skill.level || 'Core'}</span>
      </div>
    </div>
  );
}

export const InteractiveSkillsWidget = SkillsSection;
export default SkillsSection;
