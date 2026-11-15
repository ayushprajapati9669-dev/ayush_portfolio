import React, { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';
import { ScrollWriteText } from '../common/ScrollWriteText';
import { TechLogo } from '../common/TechLogos';
import { useInView } from '../../hooks/useInView';

try {
  gsap.registerPlugin(ScrollTrigger);
} catch (_e) { }

/* ─────────────────────────────────────────────────────────────────────────────
   LayerCard: wraps a .flow-layer <section> and toggles the "in" CSS class
   using the bidirectional useInView IntersectionObserver hook.
   All mouse-move hover props are forwarded from the parent.
───────────────────────────────────────────────────────────────────────────── */
function LayerCard({ style, onMouseMove, onMouseLeave, children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <section
      ref={ref}
      className={`flow-layer${inView ? ' in' : ''}${className ? ` ${className}` : ''}`}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FlowLink: wraps a .flow-link connector and fades it in after its
   preceding LayerCard enters the viewport. It observes itself with a
   simple IntersectionObserver (threshold 0 / 0.5) so when ANY part of
   the link is visible, it gets the "in" class (delayed 300ms via CSS).
───────────────────────────────────────────────────────────────────────────── */
function FlowLink({ className = '', children }) {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <div ref={ref} className={`flow-link${className ? ` ${className}` : ''}${inView ? ' in' : ''}`}>
      {children}
    </div>
  );
}

// SVG Icon Render Map - Ultra-Crisp, High-Contrast Vector Emblems from Reference Architecture
const SKILL_SVGS = {
  typescript: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="4" fill="#3178c6" />
      <text x="12" y="15.96" fontSize="11" fill="#fff" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" textAnchor="middle">TS</text>
    </svg>
  ),
  javascript: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="4" fill="#f7df1e" />
      <text x="12" y="15.96" fontSize="11" fill="#111" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" textAnchor="middle">JS</text>
    </svg>
  ),
  python: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M12 2C7.5 2 7.5 4 7.5 4v2.5H12V7.5H5.5S2 7.2 2 12s3 4.5 3 4.5H7v-2.3s-.1-3 3-3h5s2.5 0 2.5-2.4V4.5S18 2 12 2z" fill="#3776ab" />
      <path d="M12 22c4.5 0 4.5-2 4.5-2v-2.5H12v-1h6.5S22 16.8 22 12s-3-4.5-3-4.5h-2v2.3s.1 3-3 3H9s-2.5 0-2.5 2.4v3.3S6 22 12 22z" fill="#ffd43b" />
      <circle cx="9.3" cy="4.8" r="0.8" fill="#fff" />
      <circle cx="14.7" cy="19.2" r="0.8" fill="#fff" />
    </svg>
  ),
  java: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M9 3c2 2-2 3 0 5M13 2c2 2-2 3 0 6" stroke="#5382a1" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M4 11h13v3c0 3-2 5-6.5 5S4 17 4 14z" fill="#f89820" />
      <path d="M17 12h1.5a2 2 0 010 4H17" stroke="#f89820" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M5 21h12" stroke="#5382a1" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  cpp: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M12 1.5l9 5.2v10.6l-9 5.2-9-5.2V6.7z" fill="#00599c" />
      <text x="12" y="15.2" fontSize="8.5" fill="#fff" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" textAnchor="middle">C++</text>
    </svg>
  ),
  c: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M12 1.5l9 5.2v10.6l-9 5.2-9-5.2V6.7z" fill="#00599c" />
      <text x="12" y="15.2" fontSize="9" fill="#fff" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" textAnchor="middle">C</text>
    </svg>
  ),
  html: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M3 2l1.6 18L12 22l7.4-2L21 2z" fill="#e44d26" />
      <path d="M12 20.3l6-1.7L19.4 3.7H12z" fill="#f16529" />
      <text x="12" y="16" fontSize="10.5" fill="#fff" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" textAnchor="middle">5</text>
    </svg>
  ),
  css: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M3 2l1.6 18L12 22l7.4-2L21 2z" fill="#1572b6" />
      <path d="M12 20.3l6-1.7L19.4 3.7H12z" fill="#33a9dc" />
      <text x="12" y="16" fontSize="10.5" fill="#fff" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" textAnchor="middle">3</text>
    </svg>
  ),
  react: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#61dafb" strokeWidth="1.2" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1.8" fill="#61dafb" stroke="none" />
    </svg>
  ),
  responsive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <rect x="2" y="4" width="14" height="10" rx="1.5" />
      <path d="M6 18h6M9 14v4" />
      <rect x="17.5" y="8" width="4.5" height="10" rx="1" />
    </svg>
  ),
  node: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M12 1.5l9 5.2v10.6l-9 5.2-9-5.2V6.7z" fill="#5fa04e" />
      <text x="12" y="15.3" fontSize="8.5" fill="#fff" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" textAnchor="middle">JS</text>
    </svg>
  ),
  express: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="4" fill="#2b2b33" stroke="#888" strokeWidth="1" />
      <text x="12" y="15.96" fontSize="11" fill="#fff" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontWeight="700" textAnchor="middle">ex</text>
    </svg>
  ),
  api: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M8 5C5 5 6.5 9 4 12c2.5 3 1 7 4 7M16 5c3 0 1.5 4 4 7-2.5 3-1 7-4 7" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  mongo: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M12 1.5c3 3.5 5.5 6 5.5 10.5a5.5 5.5 0 01-4.4 5.4L12.6 22h-1.2l-.5-4.6A5.5 5.5 0 016.5 12C6.5 7.5 9 5 12 1.5z" fill="#47a248" />
      <path d="M12 3v17" stroke="#b8e0a8" strokeWidth="0.8" />
    </svg>
  ),
  mysql: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <ellipse cx="12" cy="5.5" rx="8" ry="3" fill="#4479a1" />
      <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13c0 1.7-3.6 3-8 3s-8-1.3-8-3z" fill="#00758f" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" stroke="#f29111" strokeWidth="1.4" fill="none" />
    </svg>
  ),
  git: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="2.5" transform="rotate(45 12 12)" fill="#f05133" />
      <g stroke="#fff" strokeWidth="1.5" fill="#fff">
        <path d="M9 8.5l5 5M9.5 8.5v7" fill="none" />
        <circle cx="9.5" cy="8.5" r="1.5" />
        <circle cx="9.5" cy="15.5" r="1.5" />
        <circle cx="14.5" cy="13.5" r="1.5" />
      </g>
    </svg>
  ),
  github: (
    <svg viewBox="0 0 16 16" fill="#f4f4f6" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  postman: (
    <svg viewBox="0 0 24 24" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="#ff6c37" />
      <path d="M7 17l8.5-8.5M12 8.5h3.5V12" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  dsa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M11 7l-4 9M13 7l4 9" />
    </svg>
  ),
  tailwind: (
    <svg viewBox="0 0 24 24" fill="#38bdf8" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
    </svg>
  ),
  docker: (
    <svg viewBox="0 0 24 24" fill="#2496ed" className="w-[24px] h-[24px] flex-none" aria-hidden="true">
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186zm0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186zm-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186zm-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186zm5.893 2.715h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186H8.1a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.186.186 0 00-.186.186v1.888c0 .102.084.185.186.185m21.75 1.543c-.482-.372-1.397-.502-2.174-.407-.217.027-.433.08-.636.16-.144-.897-.568-1.579-1.282-2.03-.497-.314-1.09-.48-1.745-.48h-.274c-.062-.258-.168-.504-.316-.732a3.864 3.864 0 00-1.127-1.122c-.628-.39-1.36-.6-2.138-.6H.272a.272.272 0 00-.272.272v7.195c.01.556.126 1.106.345 1.62.775 1.815 2.302 3.238 4.195 3.908 2.213.784 4.887.828 7.32.12a14.28 14.28 0 004.81-2.656 12.3 12.3 0 002.56-2.684c.328-.517.587-1.077.77-1.664.922-.128 1.968-.53 2.193-1.08a.86.86 0 00-.236-.88z" />
    </svg>
  )
};

// Skill Brand Glow Colors matching skills-pro.html and brand palettes
const SKILL_PILL_COLORS = {
  html: '#f97316',
  html5: '#f97316',
  css: '#60a5fa',
  css3: '#60a5fa',
  'react.js': '#22d3ee',
  react: '#22d3ee',
  'responsive ui development': '#38bdf8',
  'responsive ui': '#38bdf8',
  responsive: '#38bdf8',
  'node.js': '#4ade80',
  nodejs: '#4ade80',
  node: '#4ade80',
  'express.js': '#d4d4d8',
  express: '#d4d4d8',
  'rest api development': '#38bdf8',
  'rest api': '#38bdf8',
  api: '#38bdf8',
  mongodb: '#22c55e',
  mongo: '#22c55e',
  mysql: '#38bdf8',
  typescript: '#3178c6',
  ts: '#3178c6',
  python: '#3776ab',
  java: '#f89820',
  javascript: '#f7df1e',
  js: '#f7df1e',
  'c++': '#00599c',
  cpp: '#00599c',
  c: '#659ad2',
  git: '#f05133',
  github: '#e4e4e7',
  postman: '#ff6c37',
  'data structures & algorithms': '#a78bfa',
  'data structures': '#a78bfa',
  dsa: '#a78bfa',
  tailwind: '#38bdf8',
  'tailwind css': '#38bdf8',
  docker: '#2496ed'
};

const normalizeSkillKey = (name) => {
  const lower = (name || '').toLowerCase().trim();
  if (lower === 'html' || lower === 'html5') return 'html';
  if (lower === 'css' || lower === 'css3') return 'css';
  if (lower === 'js' || lower === 'javascript' || lower === 'es6') return 'javascript';
  if (lower === 'ts' || lower === 'typescript') return 'typescript';
  if (lower === 'react' || lower === 'react.js' || lower === 'reactjs') return 'react';
  if (lower === 'node' || lower === 'nodejs' || lower === 'node.js') return 'node';
  if (lower === 'express' || lower === 'expressjs' || lower === 'express.js') return 'express';
  if (lower === 'tailwindcss' || lower === 'tailwind css' || lower === 'tailwind') return 'tailwind';
  if (lower.includes('rest api') || lower === 'api' || lower === 'rest') return 'api';
  if (lower === 'mongo' || lower === 'mongodb') return 'mongo';
  if (lower === 'cpp' || lower === 'c++' || lower.includes('cplusplus')) return 'cpp';
  if (lower === 'c') return 'c';
  if (lower.includes('data struct') || lower === 'dsa' || lower.includes('algorithm')) return 'dsa';
  if (lower.includes('responsive')) return 'responsive';
  if (lower === 'github') return 'github';
  if (lower === 'git') return 'git';
  if (lower === 'postman') return 'postman';
  if (lower === 'docker') return 'docker';
  if (lower === 'mysql') return 'mysql';
  if (lower === 'java') return 'java';
  if (lower === 'python') return 'python';
  return lower;
};

export const getSkillVisuals = (item) => {
  const key = normalizeSkillKey(item?.name || item?.logoKey || '');
  const color = SKILL_PILL_COLORS[key] || item?.color || '#38bdf8';
  return { key, color, svg: SKILL_SVGS[key] || null };
};

const getCanonicalCategoryColor = (name, customColor) => {
  if (customColor && customColor !== '#d4af37' && customColor !== '#e8c547') return customColor;
  const n = String(name || '').toLowerCase();
  if (/front/i.test(n)) return '#38bdf8'; // Sky Cyan
  if (/back/i.test(n)) return '#4ade80'; // Emerald Green
  if (/data.*base|db/i.test(n)) return '#10b981'; // Forest Green
  if (/lang/i.test(n)) return '#818cf8'; // Indigo Blue
  if (/tool/i.test(n)) return '#f97316'; // Coral Orange
  if (/problem|dsa|algo|structure/i.test(n)) return '#a855f7'; // Purple
  return '#38bdf8';
};

export function SkillsSection({ isStandalonePage = false, showCta = false, onCtaClick = null }) {
  const { appState } = usePortfolio();
  const ui = appState?.uiLabels || {};

  const boardRef = useRef(null);
  const [activePillId, setActivePillId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract real categories & skills dynamically from Admin CMS (appState.skills)
  const categorizedData = useMemo(() => {
    const rawSkills = appState?.skills;
    const allCategories = [];

    if (Array.isArray(rawSkills) && rawSkills.length > 0) {
      rawSkills.forEach((catGroup, cIdx) => {
        if (!catGroup) return;
        const catName = catGroup.category || catGroup.categoryName || catGroup.name || `Category ${cIdx + 1}`;
        const catId = String(catGroup.id || `cat-${cIdx}`);
        const catColor = getCanonicalCategoryColor(catName, catGroup.color);
        const items = Array.isArray(catGroup.items) ? catGroup.items : [];
        const visibleItems = items.filter((item) => item && item.isVisible !== false);

        const mappedItems = visibleItems.map((item, iIdx) => {
          const name = item.name || '';
          const normKey = normalizeSkillKey(name);
          const brandColor = SKILL_PILL_COLORS[normKey] || (item.color && item.color !== '#e8c547' && item.color !== '#d4af37' ? item.color : catColor);
          return {
            id: item.id || `skill-${catId}-${iIdx}`,
            name,
            normKey,
            icon: item.icon,
            logoKey: item.logoKey || normKey,
            color: brandColor
          };
        });

        allCategories.push({
          id: catId,
          name: catName,
          subtitle: catGroup.subtitle || catGroup.description || '',
          color: catColor,
          items: mappedItems
        });
      });
    }

    // Baseline fallbacks matching skills-pro.html exactly
    const findCategory = (regex, fallback) => {
      const match = allCategories.find((c) => regex.test(c.name || ''));
      if (match && Array.isArray(match.items) && match.items.length > 0) {
        const resolvedName = (match.name && typeof match.name === 'string' && match.name.trim())
          ? match.name.trim()
          : fallback.name;
        const resolvedSubtitle = (match.subtitle && typeof match.subtitle === 'string' && match.subtitle.trim())
          ? match.subtitle.trim()
          : ((match.description && typeof match.description === 'string' && match.description.trim())
            ? match.description.trim()
            : fallback.subtitle);
        const resolvedColor = (match.color && typeof match.color === 'string' && match.color.trim() && match.color !== '#d4af37' && match.color !== '#e8c547')
          ? match.color.trim()
          : fallback.color;

        return {
          ...fallback,
          ...match,
          name: resolvedName,
          subtitle: resolvedSubtitle,
          color: resolvedColor
        };
      }
      return fallback;
    };

    const frontendCat = findCategory(/front/i, {
      id: 'frontend',
      name: 'Frontend',
      subtitle: 'What users see and tap',
      color: '#38bdf8',
      items: [
        { id: 'f-1', name: 'HTML', normKey: 'html', color: '#f97316' },
        { id: 'f-2', name: 'CSS', normKey: 'css', color: '#60a5fa' },
        { id: 'f-3', name: 'React.js', normKey: 'react', color: '#22d3ee' },
        { id: 'f-4', name: 'Responsive UI Development', normKey: 'responsive', color: '#38bdf8' }
      ]
    });

    const backendCat = findCategory(/back/i, {
      id: 'backend',
      name: 'Backend',
      subtitle: 'Logic and APIs',
      color: '#4ade80',
      items: [
        { id: 'b-1', name: 'Node.js', normKey: 'node', color: '#4ade80' },
        { id: 'b-2', name: 'Express.js', normKey: 'express', color: '#d4d4d8' },
        { id: 'b-3', name: 'REST API Development', normKey: 'api', color: '#38bdf8' }
      ]
    });

    const databasesCat = findCategory(/data.*base|db/i, {
      id: 'databases',
      name: 'Databases',
      subtitle: 'Where the data lives',
      color: '#22c55e',
      items: [
        { id: 'd-1', name: 'MongoDB', normKey: 'mongo', color: '#22c55e' },
        { id: 'd-2', name: 'MySQL', normKey: 'mysql', color: '#38bdf8' }
      ]
    });

    const languagesCat = findCategory(/lang/i, {
      id: 'languages',
      name: 'Languages',
      subtitle: 'What I write code in',
      color: '#818cf8',
      items: [
        { id: 'l-1', name: 'TypeScript', normKey: 'typescript', color: '#3178c6' },
        { id: 'l-2', name: 'Python', normKey: 'python', color: '#3776ab' },
        { id: 'l-3', name: 'Java', normKey: 'java', color: '#f89820' },
        { id: 'l-4', name: 'JavaScript', normKey: 'javascript', color: '#f7df1e' },
        { id: 'l-5', name: 'C++', normKey: 'cpp', color: '#00599c' }
      ]
    });

    const toolsCat = findCategory(/tool/i, {
      id: 'tools',
      name: 'Tools',
      subtitle: 'How I work',
      color: '#f05133',
      items: [
        { id: 't-1', name: 'Git', normKey: 'git', color: '#f05133' },
        { id: 't-2', name: 'GitHub', normKey: 'github', color: '#e4e4e7' },
        { id: 't-3', name: 'Postman', normKey: 'postman', color: '#ff6c37' }
      ]
    });

    const problemSolvingCat = findCategory(/problem|algo|dsa|structure/i, {
      id: 'dsa',
      name: 'Problem Solving',
      subtitle: 'How I think',
      color: '#a78bfa',
      items: [
        { id: 'p-1', name: 'Data Structures & Algorithms', normKey: 'dsa', color: '#a78bfa' }
      ]
    });

    // Find any additional custom categories created by admin
    const knownIds = new Set([
      frontendCat.id,
      backendCat.id,
      databasesCat.id,
      languagesCat.id,
      toolsCat.id,
      problemSolvingCat.id
    ]);

    const extraCategories = allCategories.filter((c) => !knownIds.has(c.id) && c.items.length > 0);

    return {
      frontendCat,
      backendCat,
      databasesCat,
      languagesCat,
      toolsCat,
      problemSolvingCat,
      extraCategories
    };
  }, [appState?.skills]);

  // Pointer subtle spotlight lighting on cards (rock-solid, user-friendly, no 3D wobble)
  const handleLayerMouseMove = (e) => {
    const layer = e.currentTarget;
    const rect = layer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    layer.style.setProperty('--mx', `${x}px`);
    layer.style.setProperty('--my', `${y}px`);
  };

  const handleLayerMouseLeave = (e) => {
    const layer = e.currentTarget;
    layer.style.removeProperty('--mx');
    layer.style.removeProperty('--my');
  };

  // Render high-contrast, crystal-clear icon
  const renderSkillIcon = (skill) => {
    // 1. Admin provided image URL (http, /, data:)
    if (typeof skill.icon === 'string' && (skill.icon.startsWith('http') || skill.icon.startsWith('/') || skill.icon.startsWith('data:'))) {
      return <img src={skill.icon} alt={skill.name} className="w-[24px] h-[24px] object-contain flex-none" />;
    }

    // 2. High-contrast crisp vector SVG
    const key = skill.normKey || normalizeSkillKey(skill.name);
    if (key && SKILL_SVGS[key]) {
      return SKILL_SVGS[key];
    }

    // 3. Admin specified Devicon or FontAwesome icon class
    if (typeof skill.icon === 'string' && skill.icon.trim()) {
      let iconClass = skill.icon.trim();
      const lowerName = (skill.name || '').toLowerCase().trim();
      if ((lowerName.includes('c++') || lowerName === 'cpp') && iconClass === 'devicon-c-plain') {
        iconClass = 'devicon-cplusplus-plain';
      }
      if (iconClass.includes('devicon-') && !iconClass.includes('colored')) {
        iconClass = `${iconClass} colored`;
      }
      return <i className={`${iconClass} text-[20px] leading-none flex-none`} aria-hidden="true" />;
    }

    // 4. Fallback to TechLogo component
    return <TechLogo name={skill.name} className="w-[24px] h-[24px] flex-none" />;
  };

  // Render individual skill pill — index is passed for CSS stagger variable --i
  const renderPill = (skill, layerDefaultColor, index = 0) => {
    const pillColor = skill.color || layerDefaultColor || '#38bdf8';
    const isSearchActive = Boolean(searchQuery.trim());
    const isSearchMatch = isSearchActive
      ? skill.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      : false;
    const isHovered = activePillId === skill.id;
    // Dim ONLY during active search when not matching
    const isDimmed = isSearchActive && !isSearchMatch;

    return (
      <button
        key={skill.id}
        type="button"
        className={`flow-pill ${isHovered || isSearchMatch ? 'on' : ''}`}
        style={{
          '--c': pillColor,
          '--i': index,
          ...(isDimmed ? { opacity: 0.35, filter: 'grayscale(0.3)' } : {})
        }}
        tabIndex={0}
        onMouseEnter={() => setActivePillId(skill.id)}
        onMouseLeave={() => setActivePillId(null)}
        onFocus={() => setActivePillId(skill.id)}
        onBlur={() => setActivePillId(null)}
      >
        {renderSkillIcon(skill)}
        <span>{skill.name}</span>
      </button>
    );
  };

  const {
    frontendCat,
    backendCat,
    databasesCat,
    languagesCat,
    toolsCat,
    problemSolvingCat,
    extraCategories
  } = categorizedData;

  // Board is in focus mode only when searching
  const isBoardFocused = Boolean(searchQuery.trim());

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
              highlightWords={['Tech', 'Stack']}
            >
              Skills & *Tech Stack*
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
                <span>View Full Skills Directory</span>
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '12px' }} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Architecture Flow Board */}
      <div
        ref={boardRef}
        className={`skills-flow-board ${isBoardFocused ? 'focus' : ''}`}
      >
        {/* Subtle Live Search / Filter bar */}
        <div className="flow-search-wrap">
          <div className="flow-search-box">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Search stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#9a9aa8] hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* 3-Tier Pipeline Container */}
        <div className="skills-flow-pipeline">
          {/* Layer 1: Frontend */}
          {frontendCat && (
            <LayerCard
              style={{ '--c': frontendCat.color || '#38bdf8' }}
              onMouseMove={handleLayerMouseMove}
              onMouseLeave={handleLayerMouseLeave}
            >
              <div className="flow-layer-header">
                <h2>
                  {frontendCat.name}
                  <span className="flow-count">{frontendCat.items.length}</span>
                </h2>
                <p>{frontendCat.subtitle}</p>
              </div>
              <div className="flow-pills">
                {frontendCat.items.map((skill, idx) => renderPill(skill, frontendCat.color || '#38bdf8', idx))}
              </div>
            </LayerCard>
          )}

          {/* Link 1: sends requests */}
          <FlowLink className="link-1">sends requests</FlowLink>

          {/* Layer 2: Backend */}
          {backendCat && (
            <LayerCard
              style={{ '--c': backendCat.color || '#4ade80' }}
              onMouseMove={handleLayerMouseMove}
              onMouseLeave={handleLayerMouseLeave}
            >
              <div className="flow-layer-header">
                <h2>
                  {backendCat.name}
                  <span className="flow-count">{backendCat.items.length}</span>
                </h2>
                <p>{backendCat.subtitle}</p>
              </div>
              <div className="flow-pills">
                {backendCat.items.map((skill, idx) => renderPill(skill, backendCat.color || '#4ade80', idx))}
              </div>
            </LayerCard>
          )}

          {/* Link 2: reads and writes */}
          <FlowLink className="link-2">reads and writes</FlowLink>

          {/* Layer 3: Databases */}
          {databasesCat && (
            <LayerCard
              style={{ '--c': databasesCat.color || '#22c55e' }}
              onMouseMove={handleLayerMouseMove}
              onMouseLeave={handleLayerMouseLeave}
            >
              <div className="flow-layer-header">
                <h2>
                  {databasesCat.name}
                  <span className="flow-count">{databasesCat.items.length}</span>
                </h2>
                <p>{databasesCat.subtitle}</p>
              </div>
              <div className="flow-pills">
                {databasesCat.items.map((skill, idx) => renderPill(skill, databasesCat.color || '#22c55e', idx))}
              </div>
            </LayerCard>
          )}
        </div>

        {/* Section Label: Behind every layer */}
        <p className="flow-section-label">✦ BEHIND EVERY LAYER</p>

        {/* Base Grid: Languages, Tools, Problem Solving, + Extra CMS Categories */}
        <div className="flow-base">
          {/* Base Card 1: Languages */}
          {languagesCat && (
            <LayerCard
              style={{ '--c': languagesCat.color || '#818cf8' }}
              onMouseMove={handleLayerMouseMove}
              onMouseLeave={handleLayerMouseLeave}
            >
              <div className="flow-layer-header">
                <h2>
                  {languagesCat.name}
                  <span className="flow-count">{languagesCat.items.length}</span>
                </h2>
                <p>{languagesCat.subtitle}</p>
              </div>
              <div className="flow-pills">
                {languagesCat.items.map((skill, idx) => renderPill(skill, languagesCat.color || '#818cf8', idx))}
              </div>
            </LayerCard>
          )}

          {/* Base Card 2: Tools */}
          {toolsCat && (
            <LayerCard
              style={{ '--c': toolsCat.color || '#f05133' }}
              onMouseMove={handleLayerMouseMove}
              onMouseLeave={handleLayerMouseLeave}
            >
              <div className="flow-layer-header">
                <h2>
                  {toolsCat.name}
                  <span className="flow-count">{toolsCat.items.length}</span>
                </h2>
                <p>{toolsCat.subtitle}</p>
              </div>
              <div className="flow-pills">
                {toolsCat.items.map((skill, idx) => renderPill(skill, toolsCat.color || '#f05133', idx))}
              </div>
            </LayerCard>
          )}

          {/* Base Card 3: Problem Solving */}
          {problemSolvingCat && (
            <LayerCard
              style={{ '--c': problemSolvingCat.color || '#a78bfa' }}
              onMouseMove={handleLayerMouseMove}
              onMouseLeave={handleLayerMouseLeave}
            >
              <div className="flow-layer-header">
                <h2>
                  {problemSolvingCat.name}
                  <span className="flow-count">{problemSolvingCat.items.length}</span>
                </h2>
                <p>{problemSolvingCat.subtitle}</p>
              </div>
              <div className="flow-pills">
                {problemSolvingCat.items.map((skill, idx) => renderPill(skill, problemSolvingCat.color || '#a78bfa', idx))}
              </div>
            </LayerCard>
          )}

          {/* Extra CMS Categories if created by admin */}
          {extraCategories.map((cat, idx) => {
            const catColor = cat.color || '#38bdf8';
            return (
              <LayerCard
                key={cat.id || idx}
                style={{ '--c': catColor }}
                onMouseMove={handleLayerMouseMove}
                onMouseLeave={handleLayerMouseLeave}
              >
                <div className="flow-layer-header">
                  <h2>
                    {cat.name}
                    <span className="flow-count">{cat.items.length}</span>
                  </h2>
                  <p>{cat.subtitle || 'Supporting technologies'}</p>
                </div>
                <div className="flow-pills">
                  {cat.items.map((skill, sIdx) => renderPill(skill, catColor, sIdx))}
                </div>
              </LayerCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const InteractiveSkillsWidget = SkillsSection;
export default SkillsSection;
