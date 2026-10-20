import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

// Reference Baseline Skills Dataset from Reference HTML
const REFERENCE_SKILLS = [
  { name: 'C', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
  { name: 'Java', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'Python', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'JavaScript', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'TypeScript', category: 'languages', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'HTML5', category: 'frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
  { name: 'CSS3', category: 'frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
  { name: 'React.js', category: 'frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Tailwind', category: 'frontend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Node.js', category: 'backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'Express.js', category: 'backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', invert: true },
  { name: 'REST APIs', category: 'backend', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
  { name: 'MongoDB', category: 'database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
  { name: 'MySQL', category: 'database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
  { name: 'PostgreSQL', category: 'database', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'Git', category: 'tools', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'GitHub', category: 'tools', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', invert: true },
  { name: 'Postman', category: 'tools', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' },
  { name: 'Docker', category: 'tools', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' }
];

// Helper to map dynamic Database / CMS skill name to official Devicon SVG
export const getSkillVisuals = (skillObj) => {
  const rawName = (typeof skillObj === 'string' ? skillObj : skillObj?.name || skillObj?.title || '').toLowerCase();
  const customDbIcon = typeof skillObj === 'object' ? (skillObj?.icon || skillObj?.image || skillObj?.logo) : null;

  const brandMap = [
    { match: ['javascript', 'js', 'es6'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
    { match: ['typescript', 'ts'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
    { match: ['react', 'reactjs', 'react.js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
    { match: ['next', 'nextjs', 'next.js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', invert: true },
    { match: ['node', 'nodejs', 'node.js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
    { match: ['express', 'expressjs', 'express.js'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', invert: true },
    { match: ['mongo', 'mongodb'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
    { match: ['java', 'core java'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
    { match: ['spring', 'spring boot', 'springboot'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
    { match: ['tailwind', 'tailwindcss'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
    { match: ['python'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
    { match: ['git'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
    { match: ['github'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', invert: true },
    { match: ['postman'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' },
    { match: ['docker'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
    { match: ['html', 'html5'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
    { match: ['css', 'css3'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
    { match: ['mysql'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
    { match: ['postgres', 'postgresql'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
    { match: ['redux'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg' },
    { match: ['c++', 'cpp'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
    { match: ['c', 'c language'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
    { match: ['bootstrap'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg' },
    { match: ['vite', 'vitejs'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg' },
    { match: ['vscode', 'vs code'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' }
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
    invertIcon: found?.invert || false
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

    // Flatten if grouped
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

    // Combine unique skills by name
    const map = new Map();
    REFERENCE_SKILLS.forEach((s) => map.set(s.name.toLowerCase(), s));

    flattened.forEach((item) => {
      const name = item.name || item.title || '';
      if (!name) return;
      const key = name.toLowerCase();
      const existing = map.get(key);
      const visuals = getSkillVisuals(item);

      map.set(key, {
        name,
        category: item.category || existing?.category || 'tools',
        icon: item.icon || existing?.icon || visuals.iconUrl,
        invert: item.invert !== undefined ? item.invert : (existing?.invert ?? visuals.invertIcon)
      });
    });

    return Array.from(map.values());
  }, [dbSkills, appState.skills]);

  // Standard category tabs matching reference HTML
  const filterOptions = [
    { id: 'all', label: 'All Stack' },
    { id: 'languages', label: 'Languages' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'database', label: 'Databases' },
    { id: 'tools', label: 'Tools' }
  ];

  // Filter skills based on active filter
  const filteredSkills = useMemo(() => {
    if (selectedFilter === 'all') return allSkills;
    return allSkills.filter((s) => {
      const cat = (s.category || '').toLowerCase();
      if (selectedFilter === 'database' || selectedFilter === 'databases') {
        return cat.includes('data') || cat.includes('sql') || cat.includes('db');
      }
      return cat.includes(selectedFilter);
    });
  }, [selectedFilter, allSkills]);

  // Magnetic button physics on filter buttons
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
          x: (x - rect.width / 2) * 0.25,
          y: (y - rect.height / 2) * 0.25,
          duration: 0.4,
          ease: 'power2.out'
        });
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
      };

      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
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

    const rotateX = ((y - rect.height / 2) / rect.height) * -14;
    const rotateY = ((x - rect.width / 2) / rect.width) * 14;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.4,
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
      duration: 1,
      ease: 'elastic.out(1, 0.4)'
    });
  };

  // Card click ripple animation
  const handleCardClick = (e) => {
    playTick();
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '30px';
    ripple.style.height = '30px';

    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };

  // GSAP Entrance animation on mount / filter change
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.skill-card');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { y: 35, opacity: 0, scale: 0.92, rotateY: -6 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 0.55,
          stagger: 0.04,
          ease: 'back.out(1.2)',
          clearProps: 'transform,opacity'
        }
      );
    }
  }, [selectedFilter]);

  return (
    <section className={`skills-section ${isStandalonePage ? 'standalone' : 'home-embedded'}`}>
      {/* Header */}
      <div className="skills-header">
        <span className="skills-subtitle">
          {ui.homeSkillsEyebrow || '03 · Technical Capabilities'}
        </span>
        <h2 className="skills-title">
          {ui.homeSkillsHeading || 'Interactive Skills & Tech Stack'}
        </h2>
      </div>

      {/* Filter Buttons */}
      <div className="filter-container" ref={filterContainerRef}>
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
            {opt.label}
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
            style={{ borderColor: 'rgba(6, 182, 212, 0.4)', color: '#06b6d4' }}
          >
            Full View →
          </button>
        )}
      </div>

      {/* Uniform Skills Grid */}
      <div className="skills-grid" id="skillsGrid" ref={gridRef}>
        {filteredSkills.length === 0 ? (
          <div className="no-results">
            ✨ No skills found in this category — check back soon.
          </div>
        ) : (
          filteredSkills.map((skill, index) => {
            const skillName = skill.name || skill.title;
            const iconSrc = skill.icon || getSkillVisuals(skill).iconUrl;
            const invert = skill.invert !== undefined ? skill.invert : getSkillVisuals(skill).invertIcon;

            return (
              <div
                key={skill._id || skillName || index}
                className="skill-card"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                onClick={handleCardClick}
              >
                <div className="skill-icon-wrapper">
                  <img
                    src={iconSrc}
                    alt={skillName}
                    className={invert ? 'invert-icon' : ''}
                    loading="lazy"
                  />
                </div>
                <div className="skill-text">
                  <div className="skill-name">{skillName}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export const InteractiveSkillsWidget = SkillsSection;
export default SkillsSection;
