import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
    { match: ['tailwind', 'tailwindcss'], icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', devicon: 'devicon-tailwindcss-original' },
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

  // GSAP ScrollTrigger & Entrance animation on mount / filter change
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !gridRef.current) return;

    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (_e) {}

    const cards = gridRef.current.querySelectorAll('.skill-card');
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
    }
  }, [selectedFilter, isStandalonePage]);

  return (
    <section className={`skills-section ${isStandalonePage ? 'standalone' : 'home-embedded'}`}>
      {/* Header - Only render on embedded home view to avoid double header on dedicated Skills page */}
      {!isStandalonePage && (
        <div className="skills-header">
          <span className="skills-subtitle">
            {ui.homeSkillsEyebrow || '03 · Technical Capabilities'}
          </span>
          <h2 className="skills-title">
            Interactive Skills &<br />Tech Stack
          </h2>
        </div>
      )}

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
          filteredSkills.map((skill, index) => (
            <SkillCardItem
              key={skill._id || skill.name || skill.title || index}
              skill={skill}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              onClick={handleCardClick}
            />
          ))
        )}
      </div>
    </section>
  );
}

// Resilient SkillCardItem component with dynamic SVG -> Devicon -> Monogram fallback
function SkillCardItem({ skill, onMouseMove, onMouseLeave, onClick }) {
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
      className="skill-card"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="skill-icon-wrapper">
        {!imgFailed && iconSrc ? (
          <img
            src={iconSrc}
            alt={skillName}
            className={invert ? 'invert-icon' : ''}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : deviconCls ? (
          deviconCls.startsWith('fa-') ? (
            <i className={`${deviconCls} text-cyan-400 text-xl`} />
          ) : (
            <i className={`${deviconCls} colored`} style={{ fontSize: '26px' }} />
          )
        ) : (
          <span className="font-mono font-bold text-xs text-cyan-400">
            {skillName.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="skill-text">
        <div className="skill-name" title={skillName}>{skillName}</div>
      </div>
    </div>
  );
}

export const InteractiveSkillsWidget = SkillsSection;
export default SkillsSection;
