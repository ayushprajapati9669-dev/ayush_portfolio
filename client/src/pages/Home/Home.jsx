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

  const p = appState.profile || {};
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

  // Keep the hero entrance and section reveals on one restrained motion system.
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    let refreshOnLayout = () => {};

    const ctx = gsap.context(() => {
      const revealOnScroll = (targets, trigger, options = {}) => {
        const elements = gsap.utils.toArray(targets, containerRef.current);
        if (elements.length === 0) return;

        gsap.fromTo(
          elements,
          {
            autoAlpha: 0,
            y: options.y ?? 20,
            scale: options.scale ?? 0.99
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: options.duration ?? 0.62,
            stagger: options.stagger ?? 0,
            ease: 'power3.out',
            clearProps: 'opacity,transform,visibility',
            scrollTrigger: {
              trigger,
              start: 'top 88%',
              once: true,
              fastScrollEnd: true,
              invalidateOnRefresh: true
            }
          }
        );
      };

      const heroTimeline = gsap.timeline({
        delay: 0.08,
        defaults: { ease: 'power3.out' }
      });

      heroTimeline
        .fromTo('.hero-top-meta', { autoAlpha: 0, y: -12 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          clearProps: 'opacity,transform,visibility'
        })
        .fromTo('.hero-announcement-capsule', { autoAlpha: 0, y: 14 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          clearProps: 'opacity,transform,visibility'
        }, '-=0.3')
        .fromTo('.hero-title-line', { autoAlpha: 0, y: 22 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
          stagger: 0.09,
          clearProps: 'opacity,transform,visibility'
        }, '-=0.25')
        .fromTo('.hero-modern-desc', { autoAlpha: 0, y: 18 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          clearProps: 'opacity,transform,visibility'
        }, '-=0.3')
        .fromTo('.hero-modern-actions > *', { autoAlpha: 0, y: 14, scale: 0.98 }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          clearProps: 'opacity,transform,visibility'
        }, '-=0.3')
        .fromTo('.hero-bottom-footer > *', { autoAlpha: 0, y: 14 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          clearProps: 'opacity,transform,visibility'
        }, '-=0.2');

      revealOnScroll(
        '.bento-section .home-scroll-visual, .bento-section .bento-bio-card, .bento-section .particle-container',
        '.bento-section',
        { stagger: 0.08 }
      );
      revealOnScroll('.zero-to-one-journey-card', '.zero-to-one-journey-card');
      revealOnScroll(
        '#portfolio-directories .showcase-eyebrow, #portfolio-directories h2, #portfolio-directories .max-w-xl',
        '#portfolio-directories',
        { stagger: 0.06, y: 16 }
      );
      revealOnScroll(
        '#portfolio-directories .home-nav-executive-btn, #portfolio-directories .home-nav-btn',
        '#portfolio-directories',
        { stagger: 0.08, y: 18 }
      );
      revealOnScroll('.home-cta-banner', '.home-cta-banner', { y: 18 });

      refreshOnLayout = () => ScrollTrigger.refresh();
      window.addEventListener('load', refreshOnLayout, { once: true });
      document.fonts?.ready.then(() => {
        if (!disposed) refreshOnLayout();
      });
    }, containerRef);

    return () => {
      disposed = true;
      window.removeEventListener('load', refreshOnLayout);
      ctx.revert();
    };
  }, []);

  const heroPhotoSrc = '/images/ayush-editorial-portrait.png';

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

        {/* Top Eyebrow Meta Row */}
        <div className="hero-top-meta">
          <div className="hero-meta-left">
            <span className="hero-meta-dot">▪</span>
            <span>ENGINEER. DEVELOPER. BUILDER.</span>
          </div>
          <div className="hero-meta-right">
            BASED IN BHOPAL · THINKING BEYOND
          </div>
        </div>

        {/* Center Showcase matching uploaded reference photo */}
        <div className="hero-center-showcase">
          {/* Top Announcement Capsule Pill */}
          <div
            className="hero-announcement-capsule"
            onClick={() => scrollToSection('home-cta-banner')}
            role="button"
            tabIndex={0}
          >
            <span className="capsule-icon">✦</span>
            <span>Available for Full-Stack & Engineering Roles</span>
            <span className="capsule-arrow">→</span>
          </div>

          {/* Modern Hero Headline Matching Image 4 */}
          <h1 className="hero-modern-title hero-editorial-title">
            <span className="hero-title-line">Solid Full-Stack</span>
            <span className="hero-title-line hero-title-accent">Engineering</span>
            <span className="hero-title-line">That Turns Ideas Into</span>
            <span className="hero-title-line hero-title-accent">Software</span>
          </h1>

          {/* Modern Subtitle Matching Image 4 */}
          <p className="hero-modern-desc">
            I’m a Computer Science student exploring the intersection of web engineering, problem solving, and intelligent applications. I enjoy turning ideas into useful digital products and continuously improving how I build them.
          </p>

          {/* Modern Action Buttons: Solid White Pill + Circular Glass Play Button */}
          <div className="hero-modern-actions">
            <MagneticButton
              onClick={() => scrollToSection('portfolio-directories')}
              className="hero-btn-solid-white"
            >
              <span>Explore work</span>
              <span aria-hidden="true" className="text-xs ml-0.5">↓</span>
            </MagneticButton>

            <button
              type="button"
              onClick={() => {
                playTick();
                if (openResumeModal) openResumeModal();
              }}
              className="hero-btn-play-circle"
              title="Open Interactive Resume"
              aria-label="Open Interactive Resume"
            >
              <i className="fa-regular fa-file-lines text-sm" />
            </button>
          </div>
        </div>

        {/* Bottom Hero Footer Strip */}
        <div className="hero-bottom-footer">
          <div className="hero-footer-left">
            <span>SCROLL TO DISCOVER</span>
            <span className="animate-bounce inline-block">↓</span>
          </div>
          <div>
            BUILDING & SHIPPING SINCE 2022
          </div>
          <div>
            AN ONGOING EXPLORATION
          </div>
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
              <InteractiveMeshWave className="absolute inset-0" />
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
              <CinematicParticleCard className="h-full min-h-[380px]" />
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
