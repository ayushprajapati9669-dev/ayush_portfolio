import React, { useState, useEffect, useRef } from 'react';
import '../../styles/components/editorial-hero.css';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { useSmoothScroll } from '../../components/common/SmoothScrollProvider';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

const loadHomeBelowTheFold = () => {
  return import('./components/HomeBelowTheFold')
    .then((m) => ({ default: m.HomeBelowTheFold }))
    .catch((err) => {
      // Retry after a brief interval if network was interrupted
      return new Promise((resolve) => setTimeout(resolve, 1500))
        .then(() => import('./components/HomeBelowTheFold'))
        .then((m) => ({ default: m.HomeBelowTheFold }))
        .catch(() => {
          // If retry also fails (e.g. completely offline), return recoverable fallback
          return {
            default: function BelowFoldRecoverableFallback() {
              return (
                <div className="mx-auto max-w-7xl px-4 py-20 text-center min-h-[400px] flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-amber-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-stonewarm text-sm font-mono max-w-md">
                    Connection interrupted while loading portfolio sections.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') window.location.reload();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-mono text-xs transition-all cursor-pointer"
                  >
                    <span>Retry Connection</span>
                    <span>↻</span>
                  </button>
                </div>
              );
            }
          };
        });
    });
};

const HomeBelowTheFold = React.lazy(loadHomeBelowTheFold);
import { playTick } from '../../utils/audio';
import { runOnIdle, cancelIdle } from '../../utils/idle';
import { SEO } from '../../components/SEO';
import { personSchema, websiteSchema } from '../../utils/seo';

let _gsapInstance = null;
const getGsap = async () => {
  if (_gsapInstance) return _gsapInstance;
  if (typeof window !== 'undefined' && window.gsap) {
    _gsapInstance = window.gsap;
    return _gsapInstance;
  }
  const mod = await import('gsap');
  _gsapInstance = mod.default || mod;
  if (typeof window !== 'undefined') window.gsap = _gsapInstance;
  return _gsapInstance;
};

export function HomePage() {
  const { appState, openResumeModal, showToast } = usePortfolio();
  const lenis = useSmoothScroll();
  const navigate = useNavigate();
  const p = appState.profile || {};
  const s = appState.settings || {};
  const [highlightedProjectId, setHighlightedProjectId] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [shouldRenderBelowFold, setShouldRenderBelowFold] = useState(true);

  useEffect(() => {
    if (shouldRenderBelowFold) return;

    if (typeof window !== 'undefined' && (window.scrollY > 10 || window.__earlyUserInteraction)) {
      setShouldRenderBelowFold(true);
      return;
    }

    const triggerMount = () => {
      setShouldRenderBelowFold(true);
      window.removeEventListener('scroll', triggerMount);
      window.removeEventListener('touchstart', triggerMount);
      window.removeEventListener('touchmove', triggerMount);
      window.removeEventListener('pointerdown', triggerMount);
      window.removeEventListener('wheel', triggerMount);
      window.removeEventListener('keydown', triggerMount);
      window.removeEventListener('lenis-scroll', triggerMount);
    };

    window.addEventListener('scroll', triggerMount, { passive: true, once: true });
    window.addEventListener('touchstart', triggerMount, { passive: true, once: true });
    window.addEventListener('touchmove', triggerMount, { passive: true, once: true });
    window.addEventListener('pointerdown', triggerMount, { passive: true, once: true });
    window.addEventListener('wheel', triggerMount, { passive: true, once: true });
    window.addEventListener('keydown', triggerMount, { passive: true, once: true });
    window.addEventListener('lenis-scroll', triggerMount, { passive: true, once: true });

    let lenisUnsub = null;
    if (lenis && typeof lenis.on === 'function') {
      const onLenis = () => triggerMount();
      lenis.on('scroll', onLenis);
      lenisUnsub = () => {
        if (typeof lenis.off === 'function') lenis.off('scroll', onLenis);
      };
    }

    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
    let idleHandle = null;
    const timer = setTimeout(() => {
      idleHandle = runOnIdle(triggerMount, { timeout: 2000 });
    }, isMobileDevice ? 8500 : 3000);

    return () => {
      clearTimeout(timer);
      cancelIdle(idleHandle);
      if (lenisUnsub) lenisUnsub();
      window.removeEventListener('scroll', triggerMount);
      window.removeEventListener('touchstart', triggerMount);
      window.removeEventListener('touchmove', triggerMount);
      window.removeEventListener('pointerdown', triggerMount);
      window.removeEventListener('wheel', triggerMount);
      window.removeEventListener('keydown', triggerMount);
      window.removeEventListener('lenis-scroll', triggerMount);
    };
  }, [shouldRenderBelowFold, lenis]);

  const handleCopyEmail = () => {
    const email = p.email || 'ayushprajapati9669@gmail.com';
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    if (showToast) showToast('Email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const coreTechList = [
    { name: 'React', label: 'React.js' },
    { name: 'Node.js', label: 'Node.js' },
    { name: 'TypeScript', label: 'TypeScript' },
    { name: 'Express.js', label: 'Express.js' },
    { name: 'MongoDB', label: 'MongoDB' },
    { name: 'JavaScript', label: 'JavaScript' },
    { name: 'Python', label: 'Python' },
    { name: 'Tailwind CSS', label: 'Tailwind CSS' },
    { name: 'PostgreSQL', label: 'PostgreSQL' },
    { name: 'Git', label: 'Git & GitHub' },
    { name: 'Docker', label: 'Docker' },
    { name: 'REST APIs', label: 'REST APIs' }
  ];

  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const portraitStageRef = useRef(null);
  const heroImgRef = useRef(null);
  const heroPhotoBoxRef = useRef(null);
  const [isPhotoWide, setIsPhotoWide] = useState(false);

  const checkPhotoFit = React.useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1000) return;
    if (heroImgRef.current && heroPhotoBoxRef.current) {
      const img = heroImgRef.current;
      const box = heroPhotoBoxRef.current;
      if (img.naturalWidth && img.naturalHeight && box.clientHeight) {
        setIsPhotoWide(img.naturalWidth / img.naturalHeight > box.clientWidth / box.clientHeight);
      }
    }
  }, []);

  useEffect(() => {
    const idleHandle = runOnIdle(checkPhotoFit, { timeout: 1500 });
    window.addEventListener('resize', checkPhotoFit);
    return () => {
      cancelIdle(idleHandle);
      window.removeEventListener('resize', checkPhotoFit);
    };
  }, []);

  const isLegacyCeiling = (u) => !u || (typeof u === 'string' && (u.startsWith('data:image/webp;base64,UklGRt5SAABXRUJQV') || u === '/images/ayush-portrait-new.jpg' || u === '/images/ayush-portrait-new.webp'));
  const heroPortraitUrl =
    (p.portrait?.url && !isLegacyCeiling(p.portrait.url))
      ? p.portrait.url
      : (p.photoUrl && !isLegacyCeiling(p.photoUrl))
      ? p.photoUrl
      : '/uploads/hero_cutout_1794562459704_847.webp';
  const ui = appState.uiLabels || {};

  const publishedProjects = (appState.projects || [])
    .filter((proj) => proj.status === 'published')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const featuredProjects = publishedProjects.filter((proj) => proj.featured);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : publishedProjects;

  // Deduplicate and pick 3 distinct, high-impact flagship engineering builds
  const uniqueProjects = [];
  const seenTypes = new Set();
  for (const proj of displayProjects) {
    const isAirbnb = (proj.title || '').toLowerCase().includes('airbnb');
    const isAgentic = (proj.title || '').toLowerCase().includes('agentic');
    const isChat = (proj.title || '').toLowerCase().includes('chat') || (proj.title || '').toLowerCase().includes('boat');
    const key = isAirbnb ? 'airbnb' : isAgentic ? 'agentic' : isChat ? 'chat' : proj.id;
    if (!seenTypes.has(key)) {
      seenTypes.add(key);
      uniqueProjects.push(proj);
    }
  }
  const showcaseProjects = (uniqueProjects.length >= 3 ? uniqueProjects : displayProjects).slice(0, 3);
  const allSkillItems = (appState.skills || []).flatMap((g) => g.items || []);
  const certificates = (appState.certificates || []).filter(
    (c) =>
      c &&
      typeof c === 'object' &&
      c.id &&
      !/^cert[1-5]$/i.test(String(c.id)) &&
      c.published === true &&
      ['verified', 'accredited', 'published'].includes(String(c.status || '').toLowerCase())
  );

  const goTo = (route) => {
    playTick();
    navigate(route);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const scrollToSection = (id) => {
    playTick();
    const targetEl = document.getElementById(id) || document.querySelector(`.${id}`);
    if (lenis && targetEl) {
      lenis.scrollTo(targetEl, {
        offset: -70,
        duration: 1.35,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    } else if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      goTo('/projects');
    }
  };

  // Helper to run gsap action safely (using cached instance or dynamic import)
  const runGsap = (callback) => {
    if (_gsapInstance) {
      callback(_gsapInstance);
    } else {
      getGsap().then(callback).catch(() => {});
    }
  };

  // 3D Card tilt physics
  const handleCardMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    runGsap((gsap) => {
      gsap.to(card, {
        rotateX: ((y - rect.height / 2) / rect.height) * -4,
        rotateY: ((x - rect.width / 2) / rect.width) * 4,
        transformPerspective: 1200,
        duration: 0.35,
        ease: 'power2.out'
      });
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    runGsap((gsap) => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  };

  // Portrait Micro-Parallax
  const handlePortraitMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const stage = portraitStageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.05;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.05;

    runGsap((gsap) => {
      gsap.to('.hero-portrait-img', {
        x,
        y,
        rotateY: x * 0.6,
        rotateX: -y * 0.6,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  };

  const handlePortraitMouseLeave = () => {
    runGsap((gsap) => {
      gsap.to('.hero-portrait-img', {
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });
  };

  // Magnetic Button Physics
  const handleMagneticMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.28;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.28;

    runGsap((gsap) => {
      gsap.to(el, { x, y, duration: 0.35, ease: 'power2.out' });
    });
  };

  const handleMagneticMouseLeave = (e) => {
    const el = e.currentTarget;
    runGsap((gsap) => {
      gsap.to(el, { x: 0, y: 0, duration: 0.75, ease: 'elastic.out(1, 0.3)' });
    });
  };

  // Desktop Luxury Editorial Hero Entrance Timeline
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
    if (reduceMotion || isMobileDevice || !containerRef.current) return;

    let cancelled = false;
    let heroRaf = null;
    let ctx = null;

    getGsap().then((gsap) => {
      if (cancelled || !containerRef.current) return;
      ctx = gsap.context(() => {
        heroRaf = requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', force3D: true } });
          const d1 = 0.4;
          const d2 = 0.35;
          const d3 = 0.35;
          const d4 = 0.35;

          heroTl
            .from('.hero-top-meta', {
              y: -16,
              opacity: 0,
              duration: d1,
              delay: 0.05
            })
            .from(
              '.hero-announcement-capsule',
              {
                y: 12,
                opacity: 0,
                duration: d2
              },
              '-=0.5'
            )
            .from(
              '.hero-modern-desc',
              {
                y: 16,
                opacity: 0,
                duration: d3
              },
              '-=0.4'
            )
            .fromTo(
              '.hero-features-strip',
              { y: 16, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: d4,
                ease: 'power2.out',
                clearProps: 'all'
              },
              '-=0.3'
            );
        });
      }, containerRef);
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (heroRaf) cancelAnimationFrame(heroRaf);
      if (ctx) ctx.revert();
    };
  }, []);



  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <SEO
        title={s.seoTitle || s.siteTitle || "Ayush Prajapati | Full-Stack Developer & Software Engineer"}
        description={s.seoDescription || p.headline || p.heroDescription || 'Full-Stack Developer crafting high-performance web products, scalable backend systems, and interactive architectures.'}
        schema={[personSchema(p), websiteSchema(p)]}
      />

      {/* =========================================================================
          HERO SECTION (Image 1 Sarthak Sharma Composition + Image 4 Photo)
          ========================================================================= */}
      <section ref={heroRef} className="hero-editorial-stage">
        {/* Architectural 4-column guide lines */}
        <div className="hero-editorial-guides" aria-hidden="true">
          <div />
          <div />
          <div />
          <div />
        </div>

        {/* Hero Right-Side Portrait with Ambient Aura & Status Badge (Original Pristine Composition) */}
        <div ref={heroPhotoBoxRef} className="hero-photo-container">
          <div className="hero-photo-ambient-aura" aria-hidden="true" />
          <img
            ref={heroImgRef}
            id="himg"
            src={heroPortraitUrl}
            alt={p.portrait?.alt || p.name || 'Ayush Prajapati'}
            className={`hero-photo-img ${isPhotoWide ? 'wide' : ''}`}
            onLoad={checkPhotoFit}
            decoding="async"
            fetchpriority="high"
          />
          <div className="hero-photo-status-badge" aria-hidden="true">
            <span className="hero-photo-pulse-dot" />
            <span className="hero-photo-badge-text">{p.availabilityLabel ? (p.availabilityLabel.length > 25 ? 'Available for hire' : p.availabilityLabel) : 'Available for hire'}</span>
          </div>
        </div>

        {/* Top Eyebrow Meta Row */}
        <div className="hero-top-meta">
          <div className="hero-meta-left">
            <span className="hero-meta-dot">▪</span>
            <span>ENGINEER. DEVELOPER. BUILDER.</span>
          </div>
          
        </div>

        {/* Center / Left-Aligned Showcase matching Reference Image 1 & index (14).html */}
        <div className="hero-center-showcase">
          {/* Top Announcement Capsule Pill with Pulsing Green Indicator */}
          <div
            className="hero-announcement-capsule"
            onClick={() => scrollToSection('home-cta-banner')}
            role="button"
            tabIndex={0}
          >
            <span className="hero-status-dot" aria-hidden="true" />
            <span>{p.availabilityLabel || 'Available for full-stack & engineering roles'}</span>
            <span className="capsule-arrow" aria-hidden="true">→</span>
          </div>

          {/* Hero Editorial Headline matching Image 1 & index (14).html */}
          <h1 className="hero-modern-title hero-editorial-title">
            {(!p.headline || /from\s+blank\s+screen/i.test(p.headline)) ? (
              <>
                <span className="hero-title-line">
                  From <em className="hero-title-accent">blank screen</em>
                </span>
                <span className="hero-title-line">
                  to <em className="hero-title-accent">live product.</em>
                </span>
              </>
            ) : (
              (() => {
                const cleanHeadline = (p.headline || '').replace(/(?:,\s*|\.\s*|\s+)(?:That’s|That's)[\s\S]*$/i, '').trim();
                const parts = cleanHeadline.split(/\n+|\.\s+/).filter(Boolean);
                if (parts.length > 1) {
                  return parts.map((part, idx) => (
                    <span key={idx} className="hero-title-line">
                      {part}{idx === parts.length - 1 && !part.endsWith('.') ? '.' : ''}
                    </span>
                  ));
                }
                return (
                  <span className="hero-title-line">
                    {cleanHeadline}
                  </span>
                );
              })()
            )}
            <span className="hero-title-name">
              That’s{' '}
              <span className="hero-name-shimmer">
                <span className="sr-only">{p.displayName || p.name || 'Ayush Prajapati'}</span>
                <span aria-hidden="true">
                  {(p.displayName || p.name || 'Ayush Prajapati').split('').map((char, i) => (
                    <span
                      key={i}
                      className={`hero-name-letter${char === ' ' ? ' hero-name-space' : ''}`}
                      style={{ '--i': i }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
              </span>.
            </span>
          </h1>

          {/* Modern Description matching Reference Image 1 & index (14).html */}
          <p className="hero-modern-desc">
            {p.heroDescription || "I’m a Computer Science student from Bhopal exploring web engineering, problem-solving, and intelligent applications."}
          </p>

          </div>

        {/* Bottom Hero Features Strip matching Image 1 & index (14).html */}
        <div className="hero-features-strip">
          <button
            type="button"
            onClick={() => {
              playTick();
              navigate('/projects');
            }}
            className="hero-feature-item"
            title="Go to Projects Page"
          >
            <span className="hero-feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <span>{p.primaryCtaText ? p.primaryCtaText : <>See my <strong>projects</strong></>}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTick();
              if (openResumeModal) openResumeModal();
            }}
            className="hero-feature-item"
            title="Open Interactive Resume"
          >
            <span className="hero-feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <polyline points="14 3 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <span>{p.secondaryCtaText ? p.secondaryCtaText : <>Download my <strong>resume</strong></>}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTick();
              navigate('/contact');
            }}
            className="hero-feature-item"
            title="Send Ayush a direct message"
          >
            <span className="hero-feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <span>Send a <strong>message</strong></span>
          </button>
        </div>
      </section>



      {/* Main Home Content Sections — Lazy-loaded so Hero paints instantaneously with zero main-thread contention */}
      {shouldRenderBelowFold ? (
        <ErrorBoundary
          title="Portfolio Modules Recovered"
          message="Network constraints interrupted chunk delivery. Click below to retry loading."
        >
          <React.Suspense fallback={<div className="min-h-[1200px]" />}>
            <HomeBelowTheFold
              ui={ui}
              p={p}
              coreTechList={coreTechList}
              showcaseProjects={showcaseProjects}
              publishedProjects={publishedProjects}
              allSkillItems={allSkillItems}
              certificates={certificates}
              goTo={goTo}
              handleCardMouseMove={handleCardMouseMove}
              handleCardMouseLeave={handleCardMouseLeave}
              handleCopyEmail={handleCopyEmail}
              copiedEmail={copiedEmail}
              handleMagneticMouseMove={handleMagneticMouseMove}
              handleMagneticMouseLeave={handleMagneticMouseLeave}
            />
          </React.Suspense>
        </ErrorBoundary>
      ) : (
        <div className="min-h-[1200px] w-full" aria-hidden="true" />
      )}
    </div>
  );
}
