import React, { useRef } from 'react';

function getTechIcon(name) {
  const n = String(name || '').toLowerCase().trim();
  if (n.includes('react')) return <i className="fa-brands fa-react" style={{ color: '#61dafb' }} />;
  if (n.includes('node')) return <i className="fa-brands fa-node-js" style={{ color: '#68a063' }} />;
  if (n.includes('express') || n.includes('server')) return <i className="fa-solid fa-server" style={{ color: '#e2e8f0' }} />;
  if (n.includes('mongo') || n.includes('database') || n.includes('sql')) return <i className="fa-solid fa-database" style={{ color: '#4db33d' }} />;
  if (n.includes('openai') || n.includes('ai') || n.includes('gemini') || n.includes('bolt')) return <i className="fa-solid fa-bolt" style={{ color: '#f59e0b' }} />;
  if (n.includes('recharts') || n.includes('chart')) return <i className="fa-solid fa-chart-line" style={{ color: '#38bdf8' }} />;
  if (n.includes('css')) return <i className="fa-brands fa-css3-alt" style={{ color: '#264de4' }} />;
  if (n.includes('next')) return <i className="fa-brands fa-react" style={{ color: '#61dafb' }} />;
  if (n.includes('stripe')) return <i className="fa-brands fa-stripe" style={{ color: '#635bff' }} />;
  if (n.includes('tailwind') || n.includes('wind')) return <i className="fa-solid fa-wind" style={{ color: '#38bdf8' }} />;
  if (n.includes('javascript') || n === 'js') return <i className="fa-brands fa-js" style={{ color: '#f7df1e' }} />;
  if (n.includes('python')) return <i className="fa-brands fa-python" style={{ color: '#3776ab' }} />;
  if (n.includes('java')) return <i className="fa-brands fa-java" style={{ color: '#ea2d2e' }} />;
  if (n.includes('git')) return <i className="fa-brands fa-github" style={{ color: '#e2e8f0' }} />;
  return <i className="fa-solid fa-code" style={{ color: '#06b6d4' }} />;
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
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    if (window.gsap) {
      window.gsap.to(card, {
        rotateX: ((y - rect.height / 2) / rect.height) * -4,
        rotateY: ((x - rect.width / 2) / rect.width) * 4,
        transformPerspective: 1500,
        duration: 0.4,
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
    if (window.gsap) {
      window.gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.3)'
      });
    }
  };

  return (
    <article
      ref={cardRef}
      className={`project-card ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/30' : ''}`}
      data-category={categoryKey}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect && onSelect(proj.id)}
    >
      <a
        href={liveHref || '#'}
        target={liveHref ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className="project-img-wrap"
        title={`Visit ${proj.title}`}
        onClick={(e) => {
          if (!liveHref || liveHref === '#') e.preventDefault();
        }}
      >
        <img src={imgSrc} alt={proj.title} loading="lazy" />
        <div className="project-badges">
          <div className="p-badge">{badgeText}</div>
          {liveHref && /^https?:\/\//i.test(liveHref) && (
            <div className="p-badge live">Live Deployed</div>
          )}
        </div>
      </a>

      <div className="project-content">
        <div className="project-meta">
          <span className="project-num">PROJECT {indexNum < 10 ? `0${indexNum}` : indexNum}</span>
          <span className="project-link-hint">
            Click to Visit <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px' }} />
          </span>
        </div>

        <h3 className="project-title">{proj.title}</h3>
        <p className="project-desc">{proj.shortDescription}</p>

        <div className="tech-stack">
          {techList.map((tech, idx) => (
            <span key={`${tech}-${idx}`} className="tech-tag">
              {getTechIcon(tech)} <span>{tech}</span>
            </span>
          ))}
        </div>

        <div className="project-actions">
          {liveHref && (
            <a
              href={liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-demo"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fa-solid fa-arrow-up-right-from-square" /> Live Demo
            </a>
          )}
          {githubHref && (
            <a
              href={githubHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-code"
              onClick={(e) => e.stopPropagation()}
            >
              <i className="fa-brands fa-github" /> {isFlagship ? 'Source Code' : 'Code'}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
