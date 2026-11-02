import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

// Authentic, colorful brand tech icons for top 1% developer portfolio
function getTechIcon(name) {
  const n = String(name || '').toLowerCase().trim();

  // React — Cyan Atom
  if (n.includes('react')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61dafb" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61dafb" strokeWidth="1.5" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61dafb" strokeWidth="1.5" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.8" fill="#61dafb" />
      </svg>
    );
  }

  // Node.js — Emerald Green Hexagon
  if (n.includes('node')) {
    return <i className="fa-brands fa-node-js text-[13px]" style={{ color: '#68a063' }} />;
  }

  // Express.js — Clean Ivory Server / Monogram
  if (n.includes('express') || n.includes('server')) {
    return <span className="font-mono font-bold text-[10px] text-white bg-white/10 px-1 py-0.2 rounded">ex</span>;
  }

  // MongoDB — Emerald Leaf
  if (n.includes('mongo')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#47a248">
        <path d="M12 2C12 2 7 8 7 13.5C7 17.5 9.5 20.5 12 22C14.5 20.5 17 17.5 17 13.5C17 8 12 2 12 2ZM12 20.5V14.5C11.5 14.5 11 14 11 13.5C11 11.5 12 7.5 12 7.5C12 7.5 13 11.5 13 13.5C13 14 12.5 14.5 12 14.5V20.5Z" />
      </svg>
    );
  }

  // Python — Blue & Gold Interlocking
  if (n.includes('python')) {
    return <i className="fa-brands fa-python text-[13px]" style={{ color: '#3776ab' }} />;
  }

  // JavaScript — Vivid Gold Square
  if (n.includes('javascript') || n === 'js') {
    return <i className="fa-brands fa-js text-[13px]" style={{ color: '#f7df1e' }} />;
  }

  // TypeScript — Steel Blue Square
  if (n.includes('typescript') || n === 'ts') {
    return <span className="font-mono font-bold text-[10px] text-white bg-[#3178c6] px-1 py-0.2 rounded">TS</span>;
  }

  // Tailwind CSS — Sky Waves
  if (n.includes('tailwind') || n.includes('wind')) {
    return (
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#06b6d4">
        <path d="M12 6c-3 0-5 1.5-6 4.5 1.5-1.5 3-2 4.5-1.5 1 0.3 1.8 1.1 2.6 2 1.4 1.3 2.9 2.9 6.9 2.9 3 0 5-1.5 6-4.5-1.5 1.5-3 2-4.5 1.5-1-0.3-1.8-1.1-2.6-2-1.4-1.3-2.9-2.9-6.9-2.9zM6 13c-3 0-5 1.5-6 4.5 1.5-1.5 3-2 4.5-1.5 1 0.3 1.8 1.1 2.6 2 1.4 1.3 2.9 2.9 6.9 2.9 3 0 5-1.5 6-4.5-1.5 1.5-3 2-4.5 1.5-1-0.3-1.8-1.1-2.6-2-1.4-1.3-2.9-2.9-6.9-2.9z" />
      </svg>
    );
  }

  // Next.js — Diamond Clean Mono
  if (n.includes('next')) {
    return <span className="font-mono font-bold text-[10px] text-white bg-black px-1 py-0.2 rounded border border-white/20">N</span>;
  }

  // Docker — Marine Blue Whale
  if (n.includes('docker')) {
    return <i className="fa-brands fa-docker text-[13px]" style={{ color: '#2496ed' }} />;
  }

  // AI / LLM / Gemini / OpenAI — Amber Spark
  if (n.includes('ai') || n.includes('openai') || n.includes('gemini') || n.includes('gpt')) {
    return <i className="fa-solid fa-sparkles text-[12px]" style={{ color: '#f59e0b' }} />;
  }

  // SQL / Database
  if (n.includes('sql') || n.includes('postgres') || n.includes('mysql')) {
    return <i className="fa-solid fa-database text-[12px]" style={{ color: '#38bdf8' }} />;
  }

  // Git / GitHub
  if (n.includes('git')) {
    return <i className="fa-brands fa-git-alt text-[13px]" style={{ color: '#f05032' }} />;
  }

  // Default clean code symbol
  return <i className="fa-solid fa-code text-[11px]" style={{ color: '#d4af37' }} />;
}

export function ProjectCard({
  proj,
  indexNum = 1,
  onCardMouseMove,
  onCardMouseLeave,
  isSelected,
  onSelect
}) {
  const cardRef = useRef(null);

  const imgSrc =
    proj.thumbnailUrl ||
    (indexNum === 1
      ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop'
      : indexNum === 2
      ? 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop'
      : indexNum === 3
      ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop');

  const liveHref = proj.liveDemoUrl || '';
  const githubHref = proj.githubUrl || 'https://github.com/ayushprajapati9669-dev';
  const isFlagship = indexNum === 1;

  // Normalized category key
  const catLower = String(proj.category || '').toLowerCase();
  let categoryKey = 'fullstack';
  if (catLower.includes('aiml') || catLower.includes('ai') || catLower.includes('machine') || catLower.includes('gpt')) {
    categoryKey = 'aiml';
  } else if (catLower.includes('front')) {
    categoryKey = 'frontend';
  } else if (catLower.includes('full')) {
    categoryKey = 'fullstack';
  }

  // Derive badge text
  const badgeText =
    proj.badge ||
    (isFlagship
      ? 'Flagship Full-Stack App'
      : categoryKey === 'aiml'
      ? 'AI Integration'
      : categoryKey === 'frontend'
      ? (indexNum === 3 ? 'FinTech Dashboard' : 'E-Commerce')
      : 'Full-Stack Web App');

  // Parse technologies
  const techList = Array.isArray(proj.technologies)
    ? proj.technologies
    : typeof proj.technologies === 'string'
      ? proj.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  const handleMouseMove = (e) => {
    if (onCardMouseMove) {
      onCardMouseMove(e);
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    if (!reduceMotion) {
      gsap.to(card, {
        rotateX: ((y - rect.height / 2) / rect.height) * -3,
        rotateY: ((x - rect.width / 2) / rect.width) * 3,
        transformPerspective: 1200,
        duration: 0.35,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = (e) => {
    if (onCardMouseLeave) {
      onCardMouseLeave(e);
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)'
      });
    }
  };

  const hasCaseStudy = true;
  const detailLink = `/projects/${proj.slug || proj.id}`;

  return (
    <article
      ref={cardRef}
      className={`project-card group ${isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/30' : ''}`}
      data-category={categoryKey}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect && onSelect(proj.id)}
    >
      <a
        href={liveHref || '#'}
        target={liveHref ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className="project-img-wrap block relative overflow-hidden"
        title={`Visit ${proj.title}`}
        onClick={(e) => {
          if (!liveHref || liveHref === '#') e.preventDefault();
        }}
      >
        <picture>
          {imgSrc && imgSrc.includes('airbnb-clone-preview') && (
            <source srcSet="/images/airbnb-clone-preview.webp" type="image/webp" />
          )}
          <img
            src={imgSrc}
            alt={proj.title}
            loading={indexNum === 1 ? 'eager' : 'lazy'}
            fetchpriority={indexNum === 1 ? 'high' : 'auto'}
            decoding={indexNum === 1 ? 'sync' : 'async'}
            width="600"
            height="340"
            className="w-full h-[200px] object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </picture>

        {/* Gradient shadow over bottom of image */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Badges */}
        <div className="project-badges">
          <div className="p-badge">{badgeText}</div>
          {hasCaseStudy && (
            <div className="p-badge case-study">📖 Case Study</div>
          )}
          {liveHref && /^https?:\/\//i.test(liveHref) && (
            <div className="p-badge live flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Deployed</span>
            </div>
          )}
        </div>
      </a>

      <div className="project-content flex-1 flex flex-col justify-between">
        <div>
          <div className="project-meta flex items-center justify-between mb-2">
            <span className="project-num">PROJECT {indexNum < 10 ? `0${indexNum}` : indexNum}</span>
            <span className="project-link-hint flex items-center gap-1 text-[11px] text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
            </span>
          </div>

          <h2 className="project-title group-hover:text-amber-300 transition-colors">
            {proj.title}
          </h2>

          <p className="project-desc">
            {proj.shortDescription || 'Full-stack web application engineered with modern architectural best practices, responsive UX, and scalable backend services.'}
          </p>

          {/* Tech Stack with Authentic Colorful Brand Badges */}
          <div className="tech-stack flex flex-wrap gap-1.5 my-3.5">
            {techList.map((tech, idx) => (
              <span key={`${tech}-${idx}`} className="tech-tag flex items-center gap-1.5">
                {getTechIcon(tech)}
                <span>{tech}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="project-actions flex items-center gap-2.5 pt-2 mt-auto border-t border-white/5">
          {hasCaseStudy && (
            <Link
              to={detailLink}
              className="btn-case-study"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Read Case Study</span>
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </Link>
          )}

          {liveHref && (
            <a
              href={liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-demo"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
              <span>Live Demo</span>
            </a>
          )}

          {githubHref && (
            <a
              href={githubHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-code"
              onClick={(e) => e.stopPropagation()}
              title="View Repository"
            >
              <i className="fa-brands fa-github text-[12px]" />
              <span>Code</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
