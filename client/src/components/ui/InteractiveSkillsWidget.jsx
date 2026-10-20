import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';

// Helper to map any dynamic Database skill name to official Devicon SVG & brand glow
export const getSkillVisuals = (skillObj) => {
  const rawName = (typeof skillObj === 'string' ? skillObj : skillObj?.name || skillObj?.title || '').toLowerCase();
  const customDbIcon = typeof skillObj === 'object' ? (skillObj?.icon || skillObj?.image || skillObj?.logo) : null;

  const brandMap = [
    { match: ['javascript', 'js', 'es6'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg', glow: 'hover:border-yellow-400/50 hover:shadow-[0_0_25px_rgba(250,204,21,0.25)]' },
    { match: ['typescript', 'ts'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg', glow: 'hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]' },
    { match: ['react', 'reactjs', 'react.js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', glow: 'hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]' },
    { match: ['next', 'nextjs', 'next.js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg', invert: true, glow: 'hover:border-white/50 hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]' },
    { match: ['node', 'nodejs', 'node.js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', glow: 'hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]' },
    { match: ['express', 'expressjs', 'express.js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg', invert: true, glow: 'hover:border-slate-300/50 hover:shadow-[0_0_25px_rgba(226,232,240,0.2)]' },
    { match: ['mongo', 'mongodb'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg', glow: 'hover:border-green-500/50 hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]' },
    { match: ['java', 'core java'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg', glow: 'hover:border-orange-500/50 hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]' },
    { match: ['spring', 'spring boot', 'springboot'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg', glow: 'hover:border-lime-500/50 hover:shadow-[0_0_25px_rgba(132,204,22,0.25)]' },
    { match: ['tailwind', 'tailwindcss'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', glow: 'hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]' },
    { match: ['python'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', glow: 'hover:border-blue-400/50 hover:shadow-[0_0_25px_rgba(96,165,250,0.25)]' },
    { match: ['git', 'github'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', glow: 'hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]' },
    { match: ['postman'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg', glow: 'hover:border-orange-400/50 hover:shadow-[0_0_25px_rgba(251,146,60,0.25)]' },
    { match: ['docker'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg', glow: 'hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]' },
    { match: ['html', 'html5'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg', glow: 'hover:border-orange-500/50 hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]' },
    { match: ['css', 'css3'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg', glow: 'hover:border-blue-400/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]' },
    { match: ['sql', 'mysql', 'postgres', 'postgresql'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg', glow: 'hover:border-sky-500/50 hover:shadow-[0_0_25px_rgba(14,165,233,0.25)]' },
    { match: ['redux'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redux/redux-original.svg', glow: 'hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]' },
    { match: ['c++', 'cpp'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg', glow: 'hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]' },
    { match: ['c', 'c language'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg', glow: 'hover:border-blue-600/50 hover:shadow-[0_0_25px_rgba(37,99,235,0.25)]' },
    { match: ['bootstrap'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg', glow: 'hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(147,51,234,0.25)]' },
    { match: ['vite', 'vitejs'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg', glow: 'hover:border-purple-400/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]' },
    { match: ['vscode', 'vs code'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg', glow: 'hover:border-blue-400/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]' },
    { match: ['cloudinary'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/devicon/devicon-original.svg', glow: 'hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]' },
    { match: ['dsa', 'algorithms', 'data structures', 'problem solving'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/devicon/devicon-original.svg', glow: 'hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]' }
  ];

  const found = brandMap.find((b) =>
    b.match.some((keyword) => {
      if (keyword === 'c') {
        return rawName === 'c' || rawName.split(/[\s,./\-_]+/).includes('c');
      }
      return rawName.includes(keyword);
    })
  );

  return {
    iconUrl:
      customDbIcon && typeof customDbIcon === 'string' && customDbIcon.startsWith('http')
        ? customDbIcon
        : found?.icon || 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/devicon/devicon-original.svg',
    invertIcon: found?.invert || false,
    glowClass: found?.glow || 'hover:border-orange-500/50 hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]',
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

  // 1. Resolve skills array from props or dynamic ThemeProvider (MongoDB / CMS bootstrap)
  const sourceSkills = useMemo(() => {
    if (dbSkills && Array.isArray(dbSkills) && dbSkills.length > 0) {
      return dbSkills;
    }
    return appState.skills || [];
  }, [dbSkills, appState.skills]);

  // 2. Flatten if grouped by categories, while preserving category name for filtering
  const allSkills = useMemo(() => {
    if (!Array.isArray(sourceSkills)) return [];
    if (sourceSkills.length > 0 && Array.isArray(sourceSkills[0]?.items)) {
      return sourceSkills.flatMap((cat) =>
        (cat.items || []).map((item, idx) => ({
          ...item,
          category: cat.category || 'General',
          catId: cat.id,
          _id: item._id || item.id || `${cat.id}-${item.name}-${idx}`,
        }))
      );
    }
    return sourceSkills.map((s, idx) => ({
      ...(typeof s === 'string' ? { name: s } : s),
      category: s.category || 'General',
      _id: s._id || s.id || `${s.name || s}-${idx}`,
    }));
  }, [sourceSkills]);

  // 3. Dynamically derive categories from DB skills
  const categories = useMemo(() => {
    if (sourceSkills.length > 0 && Array.isArray(sourceSkills[0]?.items)) {
      const distinctCats = sourceSkills.map((c) => c.category).filter(Boolean);
      return ['All', ...distinctCats];
    }
    const distinct = Array.from(new Set(allSkills.map((s) => s.category).filter(Boolean)));
    return ['All', ...distinct];
  }, [sourceSkills, allSkills]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(0);

  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') return allSkills;
    return allSkills.filter((s) => s.category === selectedCategory);
  }, [selectedCategory, allSkills]);

  const timersRef = useRef([]);

  // Smooth One-by-One Sequential Opening Animation when DB data loads or category changes
  useEffect(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setVisibleCount(0);

    if (!filteredSkills.length) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisibleCount(filteredSkills.length);
      return;
    }

    timersRef.current = filteredSkills.map((_, index) =>
      setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, (index + 1) * 160) // 160ms stagger between each skill opening
    );

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, [selectedCategory, filteredSkills.length]);

  const replayAnimation = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setVisibleCount(0);

    const restartTimer = setTimeout(() => {
      timersRef.current = filteredSkills.map((_, index) =>
        setTimeout(() => {
          setVisibleCount((prev) => prev + 1);
        }, (index + 1) * 160)
      );
    }, 50);
    timersRef.current.push(restartTimer);
  }, [filteredSkills]);

  return (
    <section className={`max-w-6xl mx-auto px-4 ${isStandalonePage ? 'py-8' : 'py-16'}`}>
      {/* Header & Dynamic Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-orange-500 block mb-2">
            {ui.homeSkillsEyebrow || '01 · TECHNICAL ARSENAL'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {ui.homeSkillsHeading || 'Skills & Technologies'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                  : 'bg-white/[0.04] text-slate-400 border border-white/10 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            type="button"
            onClick={replayAnimation}
            title="Replay One-by-One Animation"
            className="ml-1 px-3 py-1.5 rounded-full text-xs font-mono bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-all cursor-pointer"
          >
            ↻ Replay
          </button>

          {showCta && onCtaClick && (
            <button
              type="button"
              onClick={onCtaClick}
              className="ml-1 px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:border-orange-500/40 transition-all cursor-pointer"
            >
              {ui.homeSkillsCta || 'Full View'} →
            </button>
          )}
        </div>
      </div>

      {/* BOX-LESS FLOATING SKILL CLOUD (No outer box container) */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 py-6">
        {filteredSkills.map((skill, index) => {
          const skillName = typeof skill === 'string' ? skill : skill.name || skill.title;
          const { iconUrl, invertIcon, glowClass } = getSkillVisuals(skill);
          const isVisible = index < visibleCount;

          return (
            <div
              key={skill._id || skill.id || skillName || index}
              style={{
                transition:
                  'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className={`group flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-[#0d1322]/80 backdrop-blur-md border border-white/[0.08] cursor-pointer select-none ${glowClass} ${
                isVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-7 scale-90 pointer-events-none'
              } hover:-translate-y-1.5`}
            >
              <img
                src={iconUrl}
                alt={skillName}
                className={`w-7 h-7 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  invertIcon ? 'invert brightness-200' : ''
                }`}
                loading="lazy"
              />
              <span className="text-sm font-semibold text-slate-200 group-hover:text-white tracking-wide">
                {skillName}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const InteractiveSkillsWidget = SkillsSection;
export default SkillsSection;
