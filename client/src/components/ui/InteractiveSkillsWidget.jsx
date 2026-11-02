import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';
import { ScrollWriteText } from '../common/ScrollWriteText';
import { TechLogo } from '../common/TechLogos';

// SVG Icon Render Map from deepseek_html_20261102_24e765.html
const SKILL_SVGS = {
  c: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#A8B9CC" strokeWidth="2" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  ),
  java: (
    <svg viewBox="0 0 24 24" fill="#f89820" aria-hidden="true">
      <path d="M12 2s-3 3-3 6c0 2.5 2 4 2 6.5 0 2-1.5 3.5-1.5 3.5h5s-1.5-1.5-1.5-3.5c0-2.5 2-4 2-6.5 0-3-3-6-3-6z" />
    </svg>
  ),
  python: (
    <svg viewBox="0 0 24 24" fill="#3776AB" aria-hidden="true">
      <path d="M12 2c-5.5 0-5 2.5-5 2.5v3h5v1H5.5S2 9 2 14.5c0 5.5 3 5.5 3 5.5h2.5v-3.5s0-2.5 2.5-2.5h5s2.5 0 2.5-2.5V4.5S18 2 12 2zm-2.5 2.5a1 1 0 110 2 1 1 0 010-2z" />
    </svg>
  ),
  js: (
    <svg viewBox="0 0 24 24" fill="#F7DF1E" aria-hidden="true">
      <rect width="24" height="24" rx="3" />
      <path d="M12 18.5c0 2-1.5 3.5-3.5 3.5S5 20.5 5 18.5h3c0 .5.5 1 1 1s1-.5 1-1v-4h2v4zm5.5 2c-2 0-3.5-1.5-3.5-3.5h3c0 .5.5 1 1 1s1-.5 1-1c0-1-1.5-1.5-2.5-2-1.5-.5-2.5-1.5-2.5-3 0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5h-3c0-.5-.5-1-1-1s-1 .5-1 1c0 1 1.5 1.5 2.5 2 1.5.5 2.5 1.5 2.5 3 0 2-1.5 3.5-3.5 3.5z" fill="#000" />
    </svg>
  ),
  ts: (
    <svg viewBox="0 0 24 24" fill="#3178C6" aria-hidden="true">
      <rect width="24" height="24" rx="3" />
      <path d="M18.5 12v2.5c0 2-1.5 3.5-3.5 3.5s-3.5-1.5-3.5-3.5h3c0 .5.5 1 1 1s1-.5 1-1c0-1-1.5-1.5-2.5-2-1.5-.5-2.5-1.5-2.5-3 0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5h-3c0-.5-.5-1-1-1s-1 .5-1 1c0 1 1.5 1.5 2.5 2 1.5.5 2.5 1.5 2.5 3zM5.5 7.5h7v3h-2v7h-3v-7h-2v-3z" fill="#fff" />
    </svg>
  ),
  html: (
    <svg viewBox="0 0 24 24" fill="#E34F26" aria-hidden="true">
      <path d="M2 2l2 18 8 2 8-2 2-18H2zm14 6H8v2h8v-2zM8 12h8v2H8v-2zm8 4H8v2h8v-2z" />
    </svg>
  ),
  css: (
    <svg viewBox="0 0 24 24" fill="#1572B6" aria-hidden="true">
      <path d="M2 2l2 18 8 2 8-2 2-18H2zm14 6H8v2h8v-2zM8 12h8v2H8v-2zm8 4H8v2h8v-2z" />
    </svg>
  ),
  react: (
    <svg viewBox="0 0 24 24" fill="#61DAFB" aria-hidden="true">
      <circle cx="12" cy="12" r="2.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(120 12 12)" />
    </svg>
  ),
  tailwind: (
    <svg viewBox="0 0 24 24" fill="#38BDF8" aria-hidden="true">
      <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5 1.13.28 2.13 1.28 2.5 2.5 1.5 1.5 3 2 5 2 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-1.13-.28-2.13-1.28-2.5-2.5-1.5-1.5-3-2-5-2zM7 12c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5 1.13.28 2.13 1.28 2.5 2.5 1.5 1.5 3 2 5 2 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-1.13-.28-2.13-1.28-2.5-2.5-1.5-1.5-3-2-5-2z" />
    </svg>
  ),
  responsive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <line x1="8" y1="22" x2="16" y2="22" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  ),
  node: (
    <svg viewBox="0 0 24 24" fill="#339933" aria-hidden="true">
      <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.5l7.5 4.5L12 13.5 4.5 9 12 4.5zm-7.5 6l7.5 4.5v7.5l-7.5-4.5V10.5zm15 0v7.5l-7.5 4.5V15l7.5-4.5z" />
    </svg>
  ),
  express: (
    <svg viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
      <text x="3" y="17" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#ffffff">EX</text>
    </svg>
  ),
  api: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  mongo: (
    <svg viewBox="0 0 24 24" fill="#47A248" aria-hidden="true">
      <path d="M12 2c-2 3-5 8-5 12 0 4 2.5 8 5 8s5-4 5-8c0-4-3-9-5-12z" />
    </svg>
  ),
  mysql: (
    <svg viewBox="0 0 24 24" fill="#00758F" aria-hidden="true">
      <path d="M2 16c2-2 5-2 8-1 2 .5 3-1 5-1 3 0 4 2 7 1-2 2-5 2-8 1-2-.5-3 1-5 1-3 0-4-2-7-1z" />
    </svg>
  ),
  postgres: (
    <svg viewBox="0 0 24 24" fill="#336791" aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
  git: (
    <svg viewBox="0 0 24 24" fill="#F05032" aria-hidden="true">
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  postman: (
    <svg viewBox="0 0 24 24" fill="#FF6C37" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 16l4-8 4 8H8z" fill="#fff" />
    </svg>
  ),
  docker: (
    <svg viewBox="0 0 24 24" fill="#2496ED" aria-hidden="true">
      <path d="M22 11h-3V8h-2v3h-3V8h-2v3H9V8H7v3H4V8H2v3H1v2h1v3h2v2h12c3 0 5-2 5-5v-2h1v-2zM5 11h2v2H5v-2z" />
    </svg>
  ),
  cpp: (
    <svg viewBox="0 0 24 24" fill="#00599C" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  ),
  dsa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
};

// 22 Reference Baseline Skills Dataset (matching deepseek_html_20261102_24e765.html)
const REFERENCE_SKILLS = [
  { name: 'C', category: 'languages', iconKey: 'c', color: '#A8B9CC' },
  { name: 'Java', category: 'languages', iconKey: 'java', color: '#f89820' },
  { name: 'Python', category: 'languages', iconKey: 'python', color: '#3776AB' },
  { name: 'JavaScript', category: 'languages', iconKey: 'js', color: '#F7DF1E' },
  { name: 'TypeScript', category: 'languages', iconKey: 'ts', color: '#3178C6' },
  { name: 'HTML5', category: 'frontend', iconKey: 'html', color: '#E34F26' },
  { name: 'CSS3', category: 'frontend', iconKey: 'css', color: '#1572B6' },
  { name: 'React.js', category: 'frontend', iconKey: 'react', color: '#61DAFB' },
  { name: 'Tailwind CSS', category: 'frontend', iconKey: 'tailwind', color: '#38BDF8' },
  { name: 'Responsive UI', category: 'frontend', iconKey: 'responsive', color: '#ffffff' },
  { name: 'Node.js', category: 'backend', iconKey: 'node', color: '#339933' },
  { name: 'Express.js', category: 'backend', iconKey: 'express', color: '#ffffff' },
  { name: 'REST APIs', category: 'backend', iconKey: 'api', color: '#fbbf24' },
  { name: 'MongoDB', category: 'databases', iconKey: 'mongo', color: '#47A248' },
  { name: 'MySQL', category: 'databases', iconKey: 'mysql', color: '#00758F' },
  { name: 'PostgreSQL', category: 'databases', iconKey: 'postgres', color: '#336791' },
  { name: 'Git', category: 'tools', iconKey: 'git', color: '#F05032' },
  { name: 'GitHub', category: 'tools', iconKey: 'github', color: '#ffffff' },
  { name: 'Postman', category: 'tools', iconKey: 'postman', color: '#FF6C37' },
  { name: 'Docker', category: 'tools', iconKey: 'docker', color: '#2496ED' },
  { name: 'C++', category: 'languages', iconKey: 'cpp', color: '#00599C' },
  { name: 'Data Structures', category: 'languages', iconKey: 'dsa', color: '#ffffff' }
];

// Normalize skill name to match reference dataset
const normalizeSkillKey = (name) => {
  const lower = (name || '').toLowerCase().trim();
  if (lower === 'html' || lower === 'html5') return 'html5';
  if (lower === 'css' || lower === 'css3') return 'css3';
  if (lower === 'js' || lower === 'javascript' || lower === 'es6') return 'javascript';
  if (lower === 'ts' || lower === 'typescript') return 'typescript';
  if (lower === 'react' || lower === 'react.js' || lower === 'reactjs') return 'react.js';
  if (lower === 'node' || lower === 'nodejs' || lower === 'node.js') return 'node.js';
  if (lower === 'express' || lower === 'expressjs' || lower === 'express.js') return 'express.js';
  if (lower === 'tailwindcss' || lower === 'tailwind css' || lower === 'tailwind') return 'tailwind css';
  if (lower.includes('rest api') || lower === 'api' || lower === 'rest') return 'rest apis';
  if (lower === 'mongo' || lower === 'mongodb') return 'mongodb';
  if (lower === 'postgres' || lower === 'postgresql') return 'postgresql';
  if (lower === 'cpp' || lower === 'c++') return 'c++';
  if (lower === 'c') return 'c';
  if (lower.includes('data struct') || lower === 'dsa') return 'data structures';
  if (lower.includes('responsive')) return 'responsive ui';
  return lower;
};

// Skill icon mapper to key
const getSkillKeyFromItem = (item) => {
  const n = normalizeSkillKey(item.name || item.title || '');
  if (n === 'c') return 'c';
  if (n === 'c++') return 'cpp';
  if (n === 'java') return 'java';
  if (n === 'python') return 'python';
  if (n === 'javascript') return 'js';
  if (n === 'typescript') return 'ts';
  if (n === 'html5') return 'html';
  if (n === 'css3') return 'css';
  if (n === 'react.js') return 'react';
  if (n === 'tailwind css') return 'tailwind';
  if (n === 'responsive ui') return 'responsive';
  if (n === 'node.js') return 'node';
  if (n === 'express.js') return 'express';
  if (n === 'rest apis') return 'api';
  if (n === 'mongodb') return 'mongo';
  if (n === 'mysql') return 'mysql';
  if (n === 'postgresql') return 'postgres';
  if (n === 'git') return 'git';
  if (n === 'github') return 'github';
  if (n === 'postman') return 'postman';
  if (n === 'docker') return 'docker';
  if (n === 'data structures') return 'dsa';
  return null;
};

export function SkillsSection({ isStandalonePage = false, showCta = false, onCtaClick = null }) {
  const { appState } = usePortfolio();
  const ui = appState?.uiLabels || {};
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const gridRef = useRef(null);

  // Signature brand colors for dynamic skill ambient underglow
const SKILL_BRAND_COLORS = {
  javascript: '#F7DF1E',
  typescript: '#3178C6',
  react: '#61DAFB',
  'react.js': '#61DAFB',
  python: '#3776AB',
  java: '#f89820',
  c: '#A8B9CC',
  'c++': '#00599C',
  cpp: '#00599C',
  html: '#E34F26',
  html5: '#E34F26',
  css: '#1572B6',
  css3: '#1572B6',
  tailwind: '#38BDF8',
  'tailwind css': '#38BDF8',
  nodejs: '#339933',
  'node.js': '#339933',
  express: '#ffffff',
  'express.js': '#ffffff',
  mongodb: '#47A248',
  mysql: '#00758F',
  postgresql: '#336791',
  git: '#F05032',
  github: '#ffffff',
  postman: '#FF6C37',
  docker: '#2496ED',
  'rest apis': '#fbbf24',
  'rest api development': '#fbbf24',
  'data structures': '#ffffff',
  'data structures & algorithms': '#ffffff',
  'responsive ui': '#38BDF8',
  'responsive ui development': '#38BDF8'
};

const getSkillBrandColor = (name, logoKey) => {
  const n = (name || '').toLowerCase().trim();
  const k = (logoKey || '').toLowerCase().trim();
  if (SKILL_BRAND_COLORS[n]) return SKILL_BRAND_COLORS[n];
  if (SKILL_BRAND_COLORS[k]) return SKILL_BRAND_COLORS[k];
  for (const [key, color] of Object.entries(SKILL_BRAND_COLORS)) {
    if (n.includes(key) || key.includes(n)) return color;
  }
  return '#fcd34d';
};

  // Extract real skills dynamically from Admin CMS categories (honoring isVisible & custom icons)
  const allSkills = useMemo(() => {
    const rawSkills = appState?.skills || [];
    const list = [];

    if (Array.isArray(rawSkills) && rawSkills.length > 0) {
      rawSkills.forEach((catGroup) => {
        if (catGroup && Array.isArray(catGroup.items)) {
          const categoryName = (catGroup.category || 'tools').toLowerCase();
          let catKey = 'tools';
          if (categoryName.includes('lang') || categoryName.includes('problem')) catKey = 'languages';
          else if (categoryName.includes('front') || categoryName.includes('ui')) catKey = 'frontend';
          else if (categoryName.includes('back') || categoryName.includes('api') || categoryName.includes('server')) catKey = 'backend';
          else if (categoryName.includes('data') || categoryName.includes('sql') || categoryName.includes('db')) catKey = 'databases';
          else if (categoryName.includes('tool') || categoryName.includes('devops') || categoryName.includes('workflow')) catKey = 'tools';

          catGroup.items.forEach((item) => {
            if (item && item.isVisible !== false) {
              const name = item.name || '';
              list.push({
                id: item.id || name,
                name: name,
                category: catKey,
                categoryName: catGroup.category || 'Tools',
                icon: item.icon,
                logoKey: item.logoKey,
                color: item.color || getSkillBrandColor(name, item.logoKey)
              });
            }
          });
        }
      });
    }

    if (list.length > 0) {
      return list;
    }

    return REFERENCE_SKILLS;
  }, [appState?.skills]);

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: allSkills.length, languages: 0, frontend: 0, backend: 0, databases: 0, tools: 0 };
    allSkills.forEach((s) => {
      const cat = (s.category || '').toLowerCase();
      if (cat === 'languages' || cat.includes('lang')) counts.languages++;
      else if (cat === 'frontend') counts.frontend++;
      else if (cat === 'backend') counts.backend++;
      else if (cat === 'databases' || cat.includes('data') || cat.includes('sql')) counts.databases++;
      else counts.tools++;
    });
    return counts;
  }, [allSkills]);

  const filterOptions = [
    { id: 'all', label: 'All', count: categoryCounts.all },
    { id: 'languages', label: 'Languages', count: categoryCounts.languages },
    { id: 'frontend', label: 'Frontend', count: categoryCounts.frontend },
    { id: 'backend', label: 'Backend', count: categoryCounts.backend },
    { id: 'databases', label: 'Databases', count: categoryCounts.databases },
    { id: 'tools', label: 'Tools', count: categoryCounts.tools }
  ];

  // Live filter & search
  const filteredSkills = useMemo(() => {
    return allSkills.filter((s) => {
      if (selectedFilter !== 'all') {
        const cat = (s.category || '').toLowerCase();
        if (selectedFilter === 'databases') {
          if (cat !== 'databases' && !cat.includes('data') && !cat.includes('sql') && !cat.includes('db')) return false;
        } else if (selectedFilter === 'languages') {
          if (cat !== 'languages' && !cat.includes('lang')) return false;
        } else if (cat !== selectedFilter && !cat.includes(selectedFilter)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const n = (s.name || '').toLowerCase();
        return n.includes(q);
      }
      return true;
    });
  }, [selectedFilter, searchQuery, allSkills]);

  // Smooth entrance animation with guarantee that elements remain visible
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.skill-card');
    if (!cards || cards.length === 0) return;

    gsap.killTweensOf(cards);

    const animateIn = () => {
      gsap.from(cards, {
        opacity: 0,
        y: 16,
        scale: 0.95,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power2.out',
        clearProps: 'opacity,transform'
      });
    };

    if (isStandalonePage) {
      animateIn();
    } else {
      let triggered = false;
      try {
        gsap.registerPlugin(ScrollTrigger);
        const st = ScrollTrigger.create({
          trigger: gridRef.current,
          start: 'top 92%',
          once: true,
          onEnter: () => {
            if (!triggered) {
              triggered = true;
              animateIn();
            }
          }
        });

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !triggered) {
                triggered = true;
                animateIn();
                observer.disconnect();
              }
            });
          },
          { threshold: 0.1 }
        );

        observer.observe(gridRef.current);

        return () => {
          st.kill();
          observer.disconnect();
        };
      } catch (_e) {
        animateIn();
      }
    }
  }, [selectedFilter, searchQuery, isStandalonePage, filteredSkills.length]);

  return (
    <div className={`skills-section ${isStandalonePage ? 'standalone' : 'home-embedded'}`}>
      {/* Home Header - Only displayed when embedded on Home Page */}
      {!isStandalonePage && (
        <div className="showcase-header mb-8">
          <div>
            <ScrollWriteText
              as="p"
              className="showcase-eyebrow"
              mode="scramble"
              scrambleDuration={20}
            >
              {(ui.homeSkillsEyebrow || '02 · TECHNICAL CAPABILITIES').replace(/^03\b/, '02')}
            </ScrollWriteText>
            <ScrollWriteText
              as="h2"
              className="showcase-title"
              mode="mask"
              stagger={0.038}
              highlightWords={['Skills', 'Tech Stack']}
            >
              Interactive Skills & Tech Stack
            </ScrollWriteText>
          </div>

          <div className="showcase-controls">
            {showCta && onCtaClick && (
              <button
                type="button"
                onClick={() => {
                  playTick('click');
                  onCtaClick();
                }}
                className="showcase-view-all"
              >
                <span>View Full Skills Directory ({allSkills.length})</span>
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Controls Area: Filter Scroll + Rounded Search Pill */}
      <div className="skills-controls-area">
        <div className="filter-scroll">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`filter-btn ${selectedFilter === opt.id ? 'active' : ''}`}
              onClick={() => {
                playTick('click');
                setSelectedFilter(opt.id);
              }}
            >
              <span>{opt.label}</span>
              <span className="count">{opt.count}</span>
            </button>
          ))}
        </div>

        <div className="skills-search-wrapper">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            className="skills-search-input"
            placeholder="Search stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Skills Grid: Sleek Inline Horizontal Chips with Guaranteed Inline SVGs */}
      <div className="skills-grid" ref={gridRef}>
        {filteredSkills.length === 0 ? (
          <div className="skills-empty-state">
            No technologies found matching &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          filteredSkills.map((skill, index) => (
            <SkillChipItem
              key={skill.name || index}
              skill={skill}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Inline Chip Component with 34x34 Circular Lens Pod & 3D Tilt Physics
function SkillChipItem({ skill }) {
  const color = skill.color || '#fcd34d';

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    const tiltX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const tiltY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale(1.035)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = '';
  };

  // Render the exact icon chosen/managed in Admin
  const renderIcon = () => {
    // 1. If admin provided an image URL (http, /, data:)
    if (typeof skill.icon === 'string' && (skill.icon.startsWith('http') || skill.icon.startsWith('/') || skill.icon.startsWith('data:'))) {
      return <img src={skill.icon} alt={skill.name} className="w-[18px] h-[18px] object-contain" />;
    }

    // 2. If admin specified an icon class (Devicon or FontAwesome)
    if (typeof skill.icon === 'string' && skill.icon.trim()) {
      let iconClass = skill.icon.trim();
      if (iconClass.includes('devicon-') && !iconClass.includes('colored')) {
        iconClass = `${iconClass} colored`;
      }
      return <i className={`${iconClass} text-[19px] leading-none`} aria-hidden="true" />;
    }

    // 3. Fallback to built-in SVG map if available
    const key = skill.logoKey || skill.iconKey || getSkillKeyFromItem(skill);
    if (key && SKILL_SVGS[key]) {
      return SKILL_SVGS[key];
    }

    // 4. Try TechLogo component
    return <TechLogo name={skill.name} className="w-[18px] h-[18px]" />;
  };

  return (
    <div
      className="skill-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--brand-color': color,
        '--icon-color': color
      }}
    >
      <div className="icon-container skill-icon-wrapper">
        {renderIcon()}
      </div>
      <div className="skill-text">
        <span className="skill-name">{skill.name}</span>
      </div>
    </div>
  );
}

export const InteractiveSkillsWidget = SkillsSection;
export default SkillsSection;
