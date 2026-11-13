import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { useSmoothScroll } from '../../components/common/SmoothScrollProvider';
import { HeroCosmosCanvas } from '../../components/ui/HeroCosmosCanvas';
import { InteractiveMeshWave } from '../../components/ui/InteractiveMeshWave';
import { MagneticButton } from '../../components/ui/MagneticButton';
import { TiltCard } from '../../components/ui/TiltCard';
import { CinematicParticleCard } from '../../components/ui/CinematicParticleCard';
import { ZeroToOneJourneyCard } from '../../components/ui/ZeroToOneJourneyCard';

import { ProjectCard } from '../../components/projects/ProjectCard';
import { CertificateCard } from '../../components/projects/CertificateCard';
import { TechLogo } from '../../components/common/TechLogos';
import { ScrollWriteText } from '../../components/common/ScrollWriteText';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { personSchema, websiteSchema } from '../../utils/seo';

export function HomePage() {
  const { appState, openResumeModal } = usePortfolio();
  const navigate = useNavigate();
  const [highlightedProjectId, setHighlightedProjectId] = useState(null);

  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const portraitStageRef = useRef(null);
  const heroImgRef = useRef(null);
  const heroPhotoBoxRef = useRef(null);
  const [isPhotoWide, setIsPhotoWide] = useState(false);

  const checkPhotoFit = () => {
    if (heroImgRef.current && heroPhotoBoxRef.current) {
      const img = heroImgRef.current;
      const box = heroPhotoBoxRef.current;
      if (img.naturalWidth && img.naturalHeight && box.clientHeight) {
        setIsPhotoWide(img.naturalWidth / img.naturalHeight > box.clientWidth / box.clientHeight);
      }
    }
  };

  useEffect(() => {
    checkPhotoFit();
    window.addEventListener('resize', checkPhotoFit);
    return () => window.removeEventListener('resize', checkPhotoFit);
  }, []);

  const p = appState.profile || {};
  const isLegacyCeiling = (u) => !u || (typeof u === 'string' && (u.startsWith('data:image/webp;base64,UklGRt5SAABXRUJQV') || u === '/images/ayush-portrait-new.jpg' || u === '/images/ayush-portrait-new.webp'));
  const heroPortraitUrl =
    (p.portrait?.url && !isLegacyCeiling(p.portrait.url))
      ? p.portrait.url
      : (p.photoUrl && !isLegacyCeiling(p.photoUrl))
      ? p.photoUrl
      : '/images/ayush-hero-portrait.png';
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
  const certificates = appState.certificates || [];

  const goTo = (route) => {
    playTick();
    navigate(route);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const lenis = useSmoothScroll();

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

    gsap.to(card, {
      rotateX: ((y - rect.height / 2) / rect.height) * -4,
      rotateY: ((x - rect.width / 2) / rect.width) * 4,
      transformPerspective: 1200,
      duration: 0.35,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
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

    gsap.to('.hero-portrait-img', {
      x,
      y,
      rotateY: x * 0.6,
      rotateX: -y * 0.6,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handlePortraitMouseLeave = () => {
    gsap.to('.hero-portrait-img', {
      x: 0,
      y: 0,
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: 'power3.out'
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

    gsap.to(el, { x, y, duration: 0.35, ease: 'power2.out' });
  };

  const handleMagneticMouseLeave = (e) => {
    const el = e.currentTarget;
    gsap.to(el, { x: 0, y: 0, duration: 0.75, ease: 'elastic.out(1, 0.3)' });
  };

  // GSAP Entrance Timeline & ScrollTrigger Animations
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (_e) {}

    const ctx = gsap.context(() => {
      // 1. Luxury Editorial Hero Entrance
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .from('.hero-top-meta', {
          y: -20,
          opacity: 0,
          duration: 0.8,
          delay: 0.1
        })
        .from(
          '.hero-photo-container',
          {
            scale: 0.95,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
          },
          '-=0.6'
        )
        .from(
          '.hero-announcement-capsule',
          {
            y: 15,
            opacity: 0,
            duration: 0.6
          },
          '-=0.5'
        )
        .from(
          '.hero-modern-desc',
          {
            y: 20,
            opacity: 0,
            duration: 0.7
          },
          '-=0.4'
        )
        .fromTo(
          '.hero-features-strip',
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all'
          },
          '-=0.3'
        );

      // 2. Section 01: Bento Intro & Focus Areas ScrollTrigger
      gsap.from('.bento-section .bento-header > *', {
        scrollTrigger: {
          trigger: '.bento-section',
          start: 'top 92%',
          once: true
        },
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'all'
      });

      gsap.from('.bento-bio-card', {
        scrollTrigger: {
          trigger: '.bento-section',
          start: 'top 90%',
          once: true
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'all'
      });

      const particleCard = containerRef.current.querySelector('.particle-container');
      if (particleCard) {
        gsap.from(particleCard, {
          scrollTrigger: {
            trigger: '.bento-section',
            start: 'top 90%',
            once: true
          },
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }

      // 3. Section 02: Directory Navigation Buttons Entrance
      const navBtns = containerRef.current.querySelectorAll('.home-nav-executive-btn, .home-nav-btn');
      if (navBtns.length > 0) {
        gsap.from(navBtns, {
          scrollTrigger: {
            trigger: '#portfolio-directories',
            start: 'top 92%',
            once: true
          },
          y: 16,
          opacity: 0,
          stagger: 0.08,
          duration: 0.5,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }

      // 5. Section 04: CTA Banner ScrollTrigger
      gsap.from('.home-cta-banner', {
        scrollTrigger: {
          trigger: '.home-cta-banner',
          start: 'top 92%',
          once: true
        },
        scale: 0.98,
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'all'
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);



  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <SEO
        title="Ayush Prajapati | Full-Stack Developer & Software Engineer"
        description={p.headline || p.heroDescription || 'Full-Stack Developer crafting high-performance web products, scalable backend systems, and interactive architectures.'}
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

        {/* Hero Right-Side Portrait with Gradient Fade Masks (matching index 14 & Image 1) */}
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
          />
          <div className="hero-photo-status-badge" aria-hidden="true">
            <span className="hero-photo-pulse-dot" />
            <span className="hero-photo-badge-text">Full-Stack Engineer</span>
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
            <span className="hero-title-line">
              From <em className="hero-title-accent">blank screen</em>
            </span>
            <span className="hero-title-line">
              to <em className="hero-title-accent">live product.</em>
            </span>
            <span className="hero-title-name">
              That’s {p.name || 'Ayush Prajapati'}.
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
            <span>See my <strong>projects</strong></span>
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
            <span>Download my <strong>resume</strong></span>
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



      {/* Main Home Content Sections */}
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 space-y-24 mt-12 sm:mt-16">
        {/* =========================================================================
            SECTION 01: Bento Introduction & Focus Areas
            ========================================================================= */}
        <section id="bento-section" className="bento-section space-y-10 border-t hairline-border pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="bento-header lg:col-span-6 space-y-4">
              <ScrollWriteText
                as="p"
                className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion"
                mode="scramble"
                scrambleDuration={20}
              >
                {ui.homeIntroEyebrow || '01 · THE PERSON BEHIND THE WORK'}
              </ScrollWriteText>
              <ScrollWriteText
                as="h2"
                className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-alabaster leading-tight font-normal"
                mode="mask"
                stagger={0.035}
                highlightWords={['Technology', 'People']}
              >
                Technology is the starting point. *People are the point.*
              </ScrollWriteText>
              <ScrollWriteText
                as="p"
                className="text-stonewarm text-sm sm:text-base leading-relaxed"
                mode="words"
                stagger={0.02}
              >
                Engineering intelligent web applications, scalable cloud backends, and responsive interactive products with clean craft.
              </ScrollWriteText>
            </div>

            {/* Interactive 3D Three.js GLSL Undulating Wave Displacement */}
            <div className="lg:col-span-6 h-[270px] sm:h-[310px] rounded-3xl border border-white/10 hover:border-gold/40 bg-gradient-to-b from-[#13131c]/95 via-[#0a0a0f]/98 to-[#060608] backdrop-blur-xl relative overflow-hidden group shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] transition-all duration-500">
              {/* Subtle ambient warm gold glow behind 3D wave */}
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_65%,rgba(180,165,130,0.035),transparent_72%)]"
                aria-hidden="true"
              />
              {/* Minimalist Micro-Badge: User-friendly indicator */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider">3D Topography</span>
              </div>
              <div className="absolute bottom-3 right-4 z-10 font-mono text-xs text-slate-400 pointer-events-none">
                Hover to ripple
              </div>
              <React.Suspense fallback={<div className="absolute inset-0 bg-[#060810]/60" />}>
                <InteractiveMeshWave className="absolute inset-0" />
              </React.Suspense>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
            <TiltCard
              className="bento-bio-card lg:col-span-6 glass-card rounded-3xl p-7 sm:p-8 space-y-4 text-stonewarm leading-relaxed cursor-default transition-shadow hover:shadow-cyan-500/10 flex flex-col justify-between"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="space-y-4">
                {(p.aboutBio || []).map((para, i) => (
                  <p key={i} className="text-sm sm:text-base leading-relaxed">{para}</p>
                ))}
              </div>
              <div className="pt-4 border-t hairline-border flex flex-wrap gap-4 text-xs font-mono text-cyanglow">
                <span>✉ {p.email || 'ayushprajapati9669@gmail.com'}</span>
                <span>☎ {p.phone || '(+91) 9669802554'}</span>
              </div>
            </TiltCard>

            <div className="lg:col-span-6 flex items-stretch">
              <React.Suspense fallback={<div className="h-full min-h-[380px] w-full rounded-3xl bg-white/[0.02] border border-white/5" />}>
                <CinematicParticleCard className="h-full min-h-[380px]" />
              </React.Suspense>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 01.5: The 0 to 1 Journey Milestone Card (Reference: deepseek_html_20261103_4b0347.html)
            ========================================================================= */}
        <section className="pt-2">
          <ZeroToOneJourneyCard
            items={p.zeroToOneMilestones || p.learningJourneyBrief}
            onExploreJourney={() => goTo('/journey')}
          />
        </section>

        {/* =========================================================================
            SECTION 02: Quick Directory Executive Buttons
            ========================================================================= */}
        <section id="portfolio-directories" className="border-t hairline-border pt-12 pb-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="showcase-eyebrow font-mono text-[11px] uppercase tracking-widest text-amber-400/90 font-semibold">
                02 · QUICK DIRECTORY
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Explore <em className="italic font-serif text-[#e5b869]">The Portfolio</em>
              </h2>
              <p className="text-stonewarm text-xs sm:text-sm mt-1 max-w-xl">
                Direct access to live deployed applications, interactive skills matrix, verified accreditations, and developer journey.
              </p>
            </div>
          </div>

          {/* 4 Executive Buttons with Real Icons, Better Fonts, and Luxury Styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Button 1: See My Projects */}
            <button
              type="button"
              onClick={() => goTo('/projects')}
              className="home-nav-executive-btn btn-projects group"
              title="Explore all production engineering projects"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="icon-box bg-amber-400/10 border border-amber-400/20 text-amber-400">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="btn-title block group-hover:text-amber-200 transition-colors">
                    See My Projects
                  </span>
                  <span className="btn-subtitle block">
                    Live Builds
                  </span>
                </div>
              </div>

              <div className="count-pill">
                <span>{publishedProjects.length}</span>
                <span className="arrow">→</span>
              </div>
            </button>

            {/* Button 2: See My Skills */}
            <button
              type="button"
              onClick={() => goTo('/skills')}
              className="home-nav-executive-btn btn-skills group"
              title="Explore full interactive skills matrix"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="icon-box bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="9" y="9" width="6" height="6" />
                    <line x1="9" y1="1" x2="9" y2="4" />
                    <line x1="15" y1="1" x2="15" y2="4" />
                    <line x1="9" y1="20" x2="9" y2="23" />
                    <line x1="15" y1="20" x2="15" y2="23" />
                    <line x1="20" y1="9" x2="23" y2="9" />
                    <line x1="20" y1="14" x2="23" y2="14" />
                    <line x1="1" y1="9" x2="4" y2="9" />
                    <line x1="1" y1="14" x2="4" y2="14" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="btn-title block group-hover:text-cyan-200 transition-colors">
                    See My Skills
                  </span>
                  <span className="btn-subtitle block">
                    Tech Stack
                  </span>
                </div>
              </div>

              <div className="count-pill">
                <span>{allSkillItems.length}+</span>
                <span className="arrow">→</span>
              </div>
            </button>

            {/* Button 3: See My Certificates */}
            <button
              type="button"
              onClick={() => goTo('/certificates')}
              className="home-nav-executive-btn btn-certs group"
              title="Inspect verified credentials and accreditations"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="icon-box bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="btn-title block group-hover:text-emerald-200 transition-colors">
                    See My Certificates
                  </span>
                  <span className="btn-subtitle block">
                    Verified
                  </span>
                </div>
              </div>

              <div className="count-pill">
                <span>{certificates.length}</span>
                <span className="arrow">→</span>
              </div>
            </button>

            {/* Button 4: My Journey */}
            <button
              type="button"
              onClick={() => goTo('/journey')}
              className="home-nav-executive-btn btn-journey group"
              title="Discover milestones and algorithmic achievements"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="icon-box bg-rose-400/10 border border-rose-400/20 text-rose-400">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="btn-title block group-hover:text-rose-200 transition-colors">
                    My Journey
                  </span>
                  <span className="btn-subtitle block">
                    Milestones
                  </span>
                </div>
              </div>

              <div className="count-pill">
                <span className="arrow">→</span>
              </div>
            </button>
          </div>
        </section>

        

        {/* =========================================================================
            SECTION 05: Direct Contact CTA Banner
            ========================================================================= */}
        <section className="home-cta-banner rounded-3xl border border-white/10 bg-gradient-to-r from-charcoal via-graphite to-charcoal p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-2xl">
            <ScrollWriteText
              as="p"
              className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion"
              mode="scramble"
              scrambleDuration={20}
            >
              {ui.homeBannerEyebrow || 'GET IN TOUCH'}
            </ScrollWriteText>
            <ScrollWriteText
              as="h2"
              className="font-display text-2xl sm:text-4xl font-extrabold text-alabaster leading-tight"
              mode="mask"
              stagger={0.035}
              highlightWords={['extraordinary', 'together']}
            >
              {ui.homeBannerHeading || "Let's build something extraordinary together."}
            </ScrollWriteText>
            <ScrollWriteText
              as="p"
              className="text-sm sm:text-base text-stonewarm"
              mode="words"
              stagger={0.02}
            >
              {ui.homeBannerSubtext || "Available for software engineering roles, full-stack development, and ambitious client projects."}
            </ScrollWriteText>
          </div>
          <div className="flex flex-wrap gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => goTo('/contact')}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="btn-primary"
            >
              Contact Me ↗
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
