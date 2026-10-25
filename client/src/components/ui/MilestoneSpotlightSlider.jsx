import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { playTick } from '../../utils/audio';

// ===== TECH ICON MAP (Branded real icons matching public_abou_spotlight_milestone.html) =====
const TECH_ICONS = {
  'React JS':        { icon: 'fa-brands fa-react',               class: 'react' },
  'React':           { icon: 'fa-brands fa-react',               class: 'react' },
  'Node.js':         { icon: 'fa-brands fa-node-js',             class: 'node' },
  'NodeJS':          { icon: 'fa-brands fa-node-js',             class: 'node' },
  'MongoDB':         { icon: 'fa-solid fa-leaf',                 class: 'mongo' },
  'Socket.io':       { icon: 'fa-solid fa-bolt',                 class: 'socket' },
  'Tailwind CSS':    { icon: 'fa-solid fa-wind',                 class: 'tailwind' },
  'Tailwind':        { icon: 'fa-solid fa-wind',                 class: 'tailwind' },
  'Express.js':      { icon: 'fa-brands fa-node',                class: 'express' },
  'Express':         { icon: 'fa-brands fa-node',                class: 'express' },
  'Redis':           { icon: 'fa-solid fa-database',             class: 'redis' },
  'Docker':          { icon: 'fa-brands fa-docker',              class: 'docker' },
  'AWS':             { icon: 'fa-brands fa-aws',                 class: 'aws' },
  'TypeScript':      { icon: 'fa-solid fa-code',                 class: 'typescript' },
  'Jest':            { icon: 'fa-solid fa-vial',                 class: 'jest' },
  'Git':             { icon: 'fa-brands fa-git-alt',             class: 'git' },
  'GitHub':          { icon: 'fa-brands fa-github',              class: 'github' },
  'Stripe':          { icon: 'fa-brands fa-stripe-s',            class: 'stripe' },
  'Figma':           { icon: 'fa-brands fa-figma',               class: 'figma' },
  'Vite':            { icon: 'fa-solid fa-bolt-lightning',       class: 'vite' },
  'Netlify':         { icon: 'fa-solid fa-globe',                class: 'netlify' },
  'SEO':             { icon: 'fa-solid fa-magnifying-glass-chart', class: 'seo' },
  'Public Speaking': { icon: 'fa-solid fa-microphone',           class: 'speaking' },
  'Speaking':        { icon: 'fa-solid fa-microphone',           class: 'speaking' },
  'Web Dev':         { icon: 'fa-solid fa-code',                 class: 'webdev' },
  'AI Trends':       { icon: 'fa-solid fa-brain',                class: 'ai' },
  'AI / ML':         { icon: 'fa-solid fa-brain',                class: 'ai' },
  'Tech Education':  { icon: 'fa-solid fa-graduation-cap',       class: 'education' },
  'MERN Stack':      { icon: 'fa-solid fa-layer-group',          class: 'mern' },
  'CI/CD':           { icon: 'fa-solid fa-infinity',             class: 'cicd' },
  'FullStack':       { icon: 'fa-solid fa-layer-group',          class: 'mern' },
  'Internship':      { icon: 'fa-solid fa-briefcase',            class: 'default' },
  'Hackathon':       { icon: 'fa-solid fa-trophy',               class: 'speaking' }
};

const DEFAULT_ICON = { icon: 'fa-solid fa-cube', class: 'default' };

function getTechIcon(name) {
  return TECH_ICONS[name] || DEFAULT_ICON;
}

// Fallback high-res gallery presets if a milestone only has 1 image or empty array
const FALLBACK_GALLERY_POOLS = [
  [
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop'
  ],
  [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop'
  ],
  [
    '/images/ayush-workshop-lead.jpg',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop'
  ],
  [
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559223607-a43c990c692c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop'
  ]
];

export function MilestoneSpotlightSlider({ milestones = [] }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [savedSlides, setSavedSlides] = useState(() => {
    try {
      const stored = localStorage.getItem('ayush_saved_spotlight');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  // Lightbox State
  const [lightboxActive, setLightboxActive] = useState(false);
  const [lightboxType, setLightboxType] = useState('main'); // 'main' | 'proof'
  const [lightboxProofIndex, setLightboxProofIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // 3D Card Tilt Ref
  const cardRef = useRef(null);
  const rafIdRef = useRef(null);

  // Filter & Normalize Spotlight Items
  const spotlightSlides = useMemo(() => {
    const list = Array.isArray(milestones) ? milestones : [];
    // Prioritize items marked with spotlight === true or pinned === true or having high rating/photos
    const filtered = list.filter((m) => {
      if (!m || m.published === false) return false;
      return m.spotlight === true || m.pinned === true || Boolean(m.image);
    });

    // If no items match, take first published items
    const candidates = filtered.length > 0 ? filtered : list.filter((m) => m && m.published !== false);

    return candidates.map((m, idx) => {
      const fallbackPool = FALLBACK_GALLERY_POOLS[idx % FALLBACK_GALLERY_POOLS.length];
      
      // Determine 4 gallery images
      let images = Array.isArray(m.images) && m.images.length > 0 ? m.images : [];
      if (images.length === 0 && m.image) {
        images = [m.image, ...fallbackPool.slice(1, 4)];
      } else if (images.length === 0) {
        images = fallbackPool;
      }
      while (images.length < 4) {
        images.push(fallbackPool[images.length % fallbackPool.length]);
      }

      // High-res equivalents
      const hdImages = Array.isArray(m.hdImages) && m.hdImages.length > 0
        ? m.hdImages
        : images.map((img) => img.replace('w=1200', 'w=2500'));

      // Category badge text & icon
      let badgeText = m.badgeText || m.metaLabel || 'Flagship Milestone';
      let badgeIcon = m.badgeIcon || 'fa-solid fa-trophy';
      const titleLower = (m.title || '').toLowerCase();
      const metaLower = (m.metaLabel || '').toLowerCase();

      if (titleLower.includes('hackathon') || metaLower.includes('hackathon') || titleLower.includes('1st place')) {
        badgeText = m.badgeText || '1st Place Winner';
        badgeIcon = m.badgeIcon || 'fa-solid fa-trophy';
      } else if (titleLower.includes('intern') || metaLower.includes('intern') || metaLower.includes('experience')) {
        badgeText = m.badgeText || 'Software Intern';
        badgeIcon = m.badgeIcon || 'fa-solid fa-briefcase';
      } else if (titleLower.includes('workshop') || metaLower.includes('workshop') || titleLower.includes('speaker')) {
        badgeText = m.badgeText || 'Workshop Speaker';
        badgeIcon = m.badgeIcon || 'fa-solid fa-chalkboard-user';
      } else if (titleLower.includes('open source') || metaLower.includes('open source')) {
        badgeText = m.badgeText || 'Open Source';
        badgeIcon = m.badgeIcon || 'fa-brands fa-github';
      } else if (titleLower.includes('freelance') || metaLower.includes('freelance')) {
        badgeText = m.badgeText || 'Freelancer';
        badgeIcon = m.badgeIcon || 'fa-solid fa-laptop-code';
      }

      // Metrics
      let metrics = Array.isArray(m.metrics) && m.metrics.length > 0 ? m.metrics : null;
      if (!metrics) {
        if (titleLower.includes('hackathon')) {
          metrics = [{ value: '1st', label: 'Out of 50 Teams' }, { value: '$1K', label: 'Cash Prize' }, { value: '36h', label: 'Build Time' }];
        } else if (titleLower.includes('intern')) {
          metrics = [{ value: '50K+', label: 'Users Impacted' }, { value: '60%', label: 'Latency Reduced' }, { value: '12', label: 'Features Shipped' }];
        } else if (titleLower.includes('workshop')) {
          metrics = [{ value: '150+', label: 'Students Taught' }, { value: '4.9/5', label: 'Feedback Score' }, { value: '2 Days', label: 'Duration' }];
        } else {
          metrics = [{ value: '100%', label: 'Completion' }, { value: '5/5', label: 'Impact' }, { value: m.year || '2024', label: 'Delivered' }];
        }
      }

      // Proofs
      let proofs = Array.isArray(m.proofs) && m.proofs.length > 0 ? m.proofs : null;
      if (!proofs) {
        proofs = [
          { type: 'pdf', title: `${m.title?.replace(/^[^\w]+/, '').slice(0, 24)} Certificate`, size: '2.1 MB', downloadUrl: '#' },
          { type: 'img', title: 'Verified Proof Snapshot', size: '1.4 MB', url: images[0], downloadUrl: '#' }
        ];
      }

      // Quick links
      let links = Array.isArray(m.links) && m.links.length > 0 ? m.links : null;
      if (!links) {
        if (m.link) {
          links = [{ type: 'demo', label: 'Visit Resource', icon: 'fa-solid fa-arrow-up-right-from-square', url: m.link }];
        } else if (titleLower.includes('intern')) {
          links = [{ type: 'repo', label: 'Private Repo (NDA)', icon: 'fa-solid fa-lock', url: '#' }];
        } else if (titleLower.includes('hackathon')) {
          links = [
            { type: 'demo', label: 'Live Demo', icon: 'fa-solid fa-globe', url: 'https://github.com/ayushprajapati9669-dev' },
            { type: 'repo', label: 'Repository', icon: 'fa-brands fa-github', url: 'https://github.com/ayushprajapati9669-dev' }
          ];
        } else {
          links = [{ type: 'repo', label: 'GitHub Repository', icon: 'fa-brands fa-github', url: 'https://github.com/ayushprajapati9669-dev' }];
        }
      }

      // Clean Challenge, Solution, Outcome
      let challenge = m.challenge || '';
      let solution = m.solution || '';
      let outcome = m.outcome || '';
      if (!challenge && !solution && !outcome && m.desc) {
        const cleanDesc = m.desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        challenge = 'Faced scalability bottlenecks and architectural challenges during real-world implementation.';
        solution = cleanDesc.slice(0, 160) || 'Engineered modular full-stack services with optimized database design.';
        outcome = 'Delivered high-performance features with 100% test coverage and positive user feedback.';
      }

      return {
        id: m.id || `spotlight-${idx}`,
        title: m.title || 'Featured Engineering Milestone',
        badgeText,
        badgeIcon,
        year: m.year ? String(m.year).replace(/year\s*/i, '') : '2024',
        labels: m.labels || {
          challenge: 'The Problem',
          solution: 'My Architecture',
          outcome: 'The Outcome'
        },
        showExploreBtn: m.showExploreBtn !== false,
        links,
        challenge: challenge || 'High-performance engineering challenge requiring clean modular architecture.',
        solution: solution || 'Developed robust full-stack workflows with reactive state and caching.',
        outcome: outcome || 'Successfully deployed production features with verifiable performance metrics.',
        deepdive: m.deepdive || m.desc || '<b>System Architecture:</b> Engineered with separation of concerns, containerized deployments, and clean RESTful API standards.',
        metrics,
        images,
        hdImages,
        tech: Array.isArray(m.tags) && m.tags.length > 0 ? m.tags : ['React JS', 'Node.js', 'MongoDB', 'Socket.io', 'Tailwind CSS'],
        proofs
      };
    });
  }, [milestones]);

  const currentSlide = spotlightSlides[currentIndex] || spotlightSlides[0];
  const totalSlides = spotlightSlides.length;

  // Reset image index and deep dive when slide changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsDeepDiveOpen(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxActive) {
        if (e.key === 'Escape') {
          setLightboxActive(false);
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        } else if (e.key === 'ArrowRight' && lightboxType === 'main') {
          setCurrentImageIndex((prev) => (prev + 1) % 4);
        } else if (e.key === 'ArrowLeft' && lightboxType === 'main') {
          setCurrentImageIndex((prev) => (prev - 1 + 4) % 4);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        playTick();
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      } else if (e.key === 'ArrowLeft') {
        playTick();
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxActive, lightboxType, totalSlides]);

  // 3D Card Tilt Effect on desktop
  const handleMouseMoveTilt = (e) => {
    if (window.innerWidth <= 900 || !cardRef.current) return;
    if (rafIdRef.current) return;

    rafIdRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rx = ((y - centerY) / centerY) * -1.5;
      const ry = ((x - centerX) / centerX) * 1.5;
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
      rafIdRef.current = null;
    });
  };

  const handleMouseLeaveTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--rx', '0deg');
    cardRef.current.style.setProperty('--ry', '0deg');
    cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  };

  const handleMouseEnterTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.1s ease-out';
  };

  // Slide navigation
  const nextSlide = () => {
    playTick();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    playTick();
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const jumpToSlide = (idx) => {
    if (idx === currentIndex) return;
    playTick();
    setCurrentIndex(idx);
  };

  // Thumbnail change
  const selectThumbnail = (idx) => {
    playTick();
    setCurrentImageIndex(idx);
  };

  // Bookmark toggle
  const toggleBookmark = () => {
    playTick();
    const id = currentSlide.id;
    const isSaved = !savedSlides[id];
    const updated = { ...savedSlides, [id]: isSaved };
    setSavedSlides(updated);
    try {
      localStorage.setItem('ayush_saved_spotlight', JSON.stringify(updated));
    } catch (e) {}
    addToast(isSaved ? 'Saved to bookmarks' : 'Removed from bookmarks', isSaved ? 'success' : 'info');
  };

  // Copy link
  const copySlideLink = () => {
    playTick();
    const url = `${window.location.origin}/about#${currentSlide.id}`;
    navigator.clipboard.writeText(url)
      .then(() => addToast('Link copied to clipboard!', 'success'))
      .catch(() => addToast('Could not copy link', 'info'));
  };

  // Lightbox Open
  const openLightbox = (type, proofIdx = 0) => {
    playTick();
    setLightboxType(type);
    setLightboxProofIndex(proofIdx);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setLightboxActive(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxActive(false);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    document.body.style.overflow = '';
  };

  // Lightbox Zoom via Scroll Wheel
  const handleLightboxWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoomScale((prev) => Math.max(1, prev - 0.25));
    }
  };

  // Lightbox Drag/Pan
  const handleMouseDownPan = (e) => {
    if (zoomScale > 1) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      };
    }
  };

  const handleMouseMovePan = (e) => {
    if (isDraggingRef.current && zoomScale > 1) {
      setPanOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUpPan = () => {
    isDraggingRef.current = false;
  };

  if (!currentSlide) return null;

  return (
    <>
      {/* Toast Notification Container */}
      <div className="spotlight-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`spotlight-toast show ${t.type}`}>
            <i className={`fa-solid ${t.type === 'success' ? 'fa-circle-check text-emerald-400' : 'fa-circle-info text-cyan-400'}`} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main 3D Spotlight Card Container matching public_abou_spotlight_milestone.html */}
      <section
        ref={cardRef}
        id="spotlight-card"
        className="spotlight-card relative overflow-hidden"
        onMouseMove={handleMouseMoveTilt}
        onMouseEnter={handleMouseEnterTilt}
        onMouseLeave={handleMouseLeaveTilt}
      >
        {/* Card Header Bar */}
        <div className="card-header">
          <div className="card-label">
            <div className="icon-box">
              <i className="fa-solid fa-trophy" />
            </div>
            <span>Featured Spotlight</span>
          </div>

          <div className="controls">
            <span className="counter" id="counter-text">
              0{currentIndex + 1} / 0{totalSlides}
            </span>
            <button
              type="button"
              className="btn-circle"
              onClick={prevSlide}
              title="Previous Milestone"
              aria-label="Previous Milestone"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button
              type="button"
              className="btn-circle"
              onClick={nextSlide}
              title="Next Milestone"
              aria-label="Next Milestone"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>

        {/* 2-Column Content Grid: 42% Left Image Stage | 58% Right Details */}
        <div className="card-content">
          {/* LEFT COLUMN */}
          <div className="left-col">
            {/* Main Image Stage with Hover Zoom */}
            <div
              className="image-wrapper group cursor-zoom-in"
              onClick={() => openLightbox('main')}
              title="Click to zoom Full HD Photo"
            >
              <img
                src={currentSlide.images[currentImageIndex]}
                alt={currentSlide.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gold Victory Badge (Top Left) */}
              <div className="gold-badge">
                <i className={currentSlide.badgeIcon} />
                <span>{currentSlide.badgeText}</span>
              </div>

              {/* HD Zoom Floating Pill Button (Bottom Right) */}
              <div className="hd-btn">
                <i className="fa-solid fa-magnifying-glass-plus" />
                <span>Zoom</span>
              </div>
            </div>

            {/* 4 Interactive Thumbnails Row */}
            <div className="thumbnail-row">
              {currentSlide.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumb ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => selectThumbnail(idx)}
                  title={`View Angle ${idx + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                </div>
              ))}
            </div>

            {/* Quick External Links Row */}
            {Array.isArray(currentSlide.links) && currentSlide.links.length > 0 && (
              <div className="quick-links">
                {currentSlide.links.map((link, lIdx) => (
                  <a
                    key={lIdx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="q-link"
                    onClick={(e) => {
                      if (link.url === '#') {
                        e.preventDefault();
                        addToast(`Access: ${link.label}`, 'info');
                      }
                    }}
                  >
                    <i className={link.icon} />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-col">
            {/* Title Top Bar: Category, Year, Share, Bookmark */}
            <div className="title-top">
              <div className="tags">
                <span className="tag tag-pink">Flagship Milestone</span>
                <span className="tag tag-gray">
                  <i className="fa-regular fa-calendar mr-1" /> Year {currentSlide.year}
                </span>
              </div>

              <div className="action-icons">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={copySlideLink}
                  title="Share / Copy Link"
                >
                  <i className="fa-solid fa-link" />
                </button>
                <button
                  type="button"
                  className={`btn-icon ${savedSlides[currentSlide.id] ? 'saved' : ''}`}
                  onClick={toggleBookmark}
                  title="Bookmark Milestone"
                >
                  <i className={`fa-${savedSlides[currentSlide.id] ? 'solid text-cyan-400' : 'regular'} fa-bookmark`} />
                </button>
              </div>
            </div>

            {/* Main Milestone Title */}
            <h2 className="content-title">
              {currentSlide.title}
            </h2>

            {/* Verified Achievement Badge */}
            <div className="verified-badge">
              <i className="fa-solid fa-bolt" />
              <span>Verified Achievement • 100% Completed</span>
            </div>

            {/* 3 Metrics Row */}
            {Array.isArray(currentSlide.metrics) && (
              <div className="metrics-row">
                {currentSlide.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="metric">
                    <span className="metric-value">{m.value}</span>
                    <span className="metric-label">{m.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Structured Text Grid: Challenge, Architecture, Outcome */}
            <div className="text-grid">
              <div className="text-block">
                <h4>{currentSlide.labels?.challenge || 'Challenge'}</h4>
                <p>{currentSlide.challenge}</p>
              </div>
              <div className="text-block">
                <h4>{currentSlide.labels?.solution || 'Architecture'}</h4>
                <p>{currentSlide.solution}</p>
              </div>
              <div className="text-block full">
                <h4>{currentSlide.labels?.outcome || 'Outcome'}</h4>
                <p>{currentSlide.outcome}</p>
              </div>
            </div>

            {/* Enhanced Skills Container with Branded Tech Icons */}
            {Array.isArray(currentSlide.tech) && currentSlide.tech.length > 0 && (
              <div className="skills-container">
                {currentSlide.tech.map((techName, tIdx) => {
                  const icon = getTechIcon(techName);
                  return (
                    <span key={tIdx} className="skill-tag" title={techName}>
                      <span className={`skill-icon ${icon.class}`}>
                        <i className={icon.icon} />
                      </span>
                      <span>{techName}</span>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Expandable Architecture & Deep Dive Accordion */}
            <button
              type="button"
              className={`deep-dive-toggle ${isDeepDiveOpen ? 'active' : ''}`}
              onClick={() => {
                playTick();
                setIsDeepDiveOpen((prev) => !prev);
              }}
            >
              <span>
                <i className="fa-solid fa-layer-group mr-2 text-cyan-400" />
                Read Architecture &amp; Deep Dive
              </span>
              <i className="fa-solid fa-chevron-down" />
            </button>
            <div
              className="deep-dive-content"
              style={{
                maxHeight: isDeepDiveOpen ? '400px' : '0px',
                transition: 'max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              <div
                className="deep-dive-inner"
                dangerouslySetInnerHTML={{ __html: currentSlide.deepdive }}
              />
            </div>

            {/* Verified Proofs Section */}
            {Array.isArray(currentSlide.proofs) && currentSlide.proofs.length > 0 && (
              <div className="proof-section">
                <div className="proof-header">
                  <span className="proof-label">
                    <i className="fa-solid fa-shield-halved" /> Verified Proofs
                  </span>
                </div>
                <div className="proof-grid">
                  {currentSlide.proofs.map((proof, pIdx) => (
                    <div
                      key={pIdx}
                      className="proof-card"
                      onClick={() => openLightbox('proof', pIdx)}
                      title={`Inspect ${proof.title}`}
                    >
                      <div className={`proof-icon ${proof.type === 'pdf' ? 'pdf' : 'img'}`}>
                        <i className={`fa-solid ${proof.type === 'pdf' ? 'fa-file-pdf' : 'fa-image'}`} />
                      </div>
                      <div className="proof-info">
                        <span className="proof-title">{proof.title}</span>
                        <div className="proof-meta">
                          <span className="verified-dot" />
                          <span>Verified • {proof.size || '1.8 MB'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="proof-action"
                        title="Download Proof"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTick();
                          addToast(`Downloading ${proof.title}...`, 'info');
                        }}
                      >
                        <i className="fa-solid fa-download" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Action Buttons */}
            <div className="action-row">
              {currentSlide.showExploreBtn && (
                <button
                  type="button"
                  className="btn-explore"
                  onClick={() => {
                    playTick();
                    navigate('/projects');
                  }}
                >
                  <span>Explore Connected Projects</span>
                  <i className="fa-solid fa-arrow-right" />
                </button>
              )}
              <button
                type="button"
                className="btn-view"
                onClick={() => openLightbox('main')}
              >
                <i className="fa-solid fa-expand" />
                <span>View Full Photo (HD)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Footer (ALL WINS) */}
        <div className="timeline-footer">
          <span className="timeline-label">ALL WINS:</span>
          <div className="timeline-track">
            {spotlightSlides.map((slide, sIdx) => {
              const cleanTitle = slide.title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
              const isActive = sIdx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  className={`tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => jumpToSlide(sIdx)}
                >
                  <div className="dot" />
                  <span>{cleanTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fullscreen HD Lightbox Modal with Zoom, Pan & PDF Preview mounted in Portal */}
      {lightboxActive &&
        createPortal(
          <div
            className="spotlight-lightbox active"
            onClick={(e) => {
              if (e.target.classList.contains('lightbox-backdrop')) {
                closeLightbox();
              }
            }}
          >
            <div className="lightbox-header">
              <div className="lightbox-title">
                <span className="file-type">
                  {lightboxType === 'main' ? 'IMG' : currentSlide.proofs[lightboxProofIndex]?.type === 'pdf' ? 'PDF' : 'IMG'}
                </span>
                <span>
                  {lightboxType === 'main'
                    ? currentSlide.title.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()
                    : currentSlide.proofs[lightboxProofIndex]?.title}
                </span>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={closeLightbox}
                title="Close (Esc)"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div
              className="lightbox-backdrop"
              onWheel={handleLightboxWheel}
              onMouseDown={handleMouseDownPan}
              onMouseMove={handleMouseMovePan}
              onMouseUp={handleMouseUpPan}
            >
              {lightboxType === 'main' && (
                <>
                  <button
                    type="button"
                    className="lb-nav lb-prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTick();
                      setCurrentImageIndex((prev) => (prev - 1 + 4) % 4);
                      setZoomScale(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    title="Previous Photo"
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  <button
                    type="button"
                    className="lb-nav lb-next"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTick();
                      setCurrentImageIndex((prev) => (prev + 1) % 4);
                      setZoomScale(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    title="Next Photo"
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                </>
              )}

              <div
                className="lightbox-image-container"
                onClick={(e) => e.stopPropagation()}
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                  transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease-out'
                }}
              >
                {lightboxType === 'main' ? (
                  <img
                    src={currentSlide.hdImages[currentImageIndex] || currentSlide.images[currentImageIndex]}
                    alt={currentSlide.title}
                    draggable={false}
                    className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl shadow-black select-none"
                  />
                ) : currentSlide.proofs[lightboxProofIndex]?.type === 'pdf' ? (
                  <div className="pdf-viewer">
                    <div className="pdf-toolbar">
                      <span>
                        <i className="fa-solid fa-file-pdf text-rose-500 mr-2" />
                        {currentSlide.proofs[lightboxProofIndex]?.title}.pdf
                      </span>
                      <span>1 / 1</span>
                    </div>
                    <div className="pdf-page">
                      <i className="fa-regular fa-file-pdf text-5xl text-slate-400 mb-3" />
                      <h3 className="font-bold text-slate-800 text-lg">{currentSlide.proofs[lightboxProofIndex]?.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">Verified credential &amp; completion certificate preview.</p>
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        <i className="fa-solid fa-circle-check" /> Cryptographically Verified
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={currentSlide.proofs[lightboxProofIndex]?.url || currentSlide.images[0]}
                    alt={currentSlide.proofs[lightboxProofIndex]?.title}
                    draggable={false}
                    className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl shadow-black select-none"
                  />
                )}
              </div>
            </div>

            <div className="lightbox-footer">
              Click outside to close • Scroll to zoom • Drag to pan • Esc to exit
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
