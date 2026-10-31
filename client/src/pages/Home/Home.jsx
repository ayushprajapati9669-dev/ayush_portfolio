import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { PortraitParticles } from '../../components/particles/PortraitParticles';
import { DeveloperWorkbench } from '../../components/ui/DeveloperWorkbench';
import { InteractiveSkillsWidget } from '../../components/ui/InteractiveSkillsWidget';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { CertificateCard } from '../../components/projects/CertificateCard';
import { SocialIconButtons, TechLogo } from '../../components/common/TechLogos';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { personSchema, websiteSchema } from '../../utils/seo';

export function HomePage() {
  const { appState } = usePortfolio();
  const navigate = useNavigate();
  const [highlightedProjectId, setHighlightedProjectId] = useState(null);
  const [activePerspective, setActivePerspective] = useState('build');

  const containerRef = useRef(null);
  const heroRef = useRef(null);

  const p = appState.profile || {};
  const ui = appState.uiLabels || {};
  const publishedProjects = (appState.projects || [])
    .filter((proj) => proj.status === 'published')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const featuredProjects = publishedProjects.filter((proj) => proj.featured);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : publishedProjects;
  const flagshipProject = displayProjects[0] || null;
  const secondaryProjects = displayProjects.slice(1);

  const allSkillItems = (appState.skills || []).flatMap((g) => g.items || []);
  const doubledSkills = [...allSkillItems, ...allSkillItems];
  const certificates = appState.certificates || [];

  const goTo = (route) => {
    playTick();
    navigate(route);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Perspective statements for interactive discipline switcher
  const PERSPECTIVES = {
    build: {
      title: 'Give an idea structure.',
      subtitle: 'Products and interfaces that connect real needs to working software.',
      desc: 'Developing full-stack web applications featuring secure authentication, dynamic data filtering, responsive design, and intuitive interaction architecture with the MERN stack.',
      actionText: 'Explore the projects',
      actionRoute: '/projects'
    },
    architect: {
      title: 'Design for resilience & scale.',
      subtitle: 'Clean schemas, defensive APIs, and honest state persistence.',
      desc: 'Architecting modular backend services with Node.js and Express, normalizing MongoDB collections, implementing rate limiting, CSRF protection, and Scrypt password security.',
      actionText: 'View architecture & APIs',
      actionRoute: '/projects'
    },
    solve: {
      title: 'Deconstruct complexity with algorithms.',
      subtitle: 'Rigorous problem solving in C, Java, and Python.',
      desc: 'Actively solving Data Structures & Algorithms challenges on LeetCode and HackerRank, optimizing time complexity, memory allocation, and algorithmic decomposition.',
      actionText: 'Inspect LeetCode stats',
      actionRoute: '/skills'
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
      // 1. Hero Entrance Timeline
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .from('.hero-meta-stamp', {
          y: -15,
          opacity: 0,
          duration: 0.6,
          delay: 0.1
        })
        .from(
          '.hero-eyebrow',
          {
            y: 20,
            opacity: 0,
            duration: 0.5
          },
          '-=0.3'
        )
        .from(
          '.hero-headline',
          {
            y: 35,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.1)'
          },
          '-=0.35'
        )
        .from(
          '.hero-marquee-badge',
          {
            scale: 0.94,
            opacity: 0,
            duration: 0.6
          },
          '-=0.45'
        )
        .from(
          '.hero-desc',
          {
            y: 25,
            opacity: 0,
            duration: 0.7
          },
          '-=0.4'
        )
        .fromTo(
          '.hero-cta-btn',
          {
            y: 20,
            opacity: 0,
            scale: 0.95
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: 'back.out(1.2)',
            clearProps: 'all'
          },
          '-=0.35'
        )
        .from(
          '.hero-social-wrap',
          {
            y: 20,
            opacity: 0,
            duration: 0.5
          },
          '-=0.3'
        )
        .from(
          '.hero-portrait-col',
          {
            scale: 0.92,
            opacity: 0,
            duration: 0.9,
            ease: 'power2.out'
          },
          0.2
        )
        .from(
          '.hero-workbench-col',
          {
            x: 35,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out'
          },
          0.35
        )
        .from(
          '.hero-marquee-bar',
          {
            y: 30,
            opacity: 0,
            duration: 0.75
          },
          0.6
        );

      // Proof Strip ScrollTrigger
      gsap.from('.proof-metric-col', {
        scrollTrigger: {
          trigger: '.proof-strip',
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Section 01: About & Perspective ScrollTrigger
      gsap.from('.about-editorial-section .section-header > *', {
        scrollTrigger: {
          trigger: '.about-editorial-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Section 02: Projects Showcase ScrollTrigger
      gsap.from('.projects-home-section .section-header > *', {
        scrollTrigger: {
          trigger: '.projects-home-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Section 03: Process Pipeline ScrollTrigger
      gsap.from('.process-home-section .section-header > *', {
        scrollTrigger: {
          trigger: '.process-home-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Section 04: Certificates Showcase ScrollTrigger
      gsap.from('.certs-home-section .section-header > *', {
        scrollTrigger: {
          trigger: '.certs-home-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Section 05: Academic Journey ScrollTrigger
      gsap.from('.journey-home-section .section-header > *', {
        scrollTrigger: {
          trigger: '.journey-home-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      // Section 06: CTA Banner ScrollTrigger
      gsap.from('.home-cta-banner', {
        scrollTrigger: {
          trigger: '.home-cta-banner',
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        scale: 0.94,
        opacity: 0,
        y: 35,
        duration: 0.85,
        ease: 'power3.out'
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <SEO
        title="Ayush Prajapati | Full-Stack Developer & Systems Builder"
        description={p.headline || p.heroDescription || 'Full-Stack Developer crafting high-performance web products, scalable backend systems, and interactive architectures.'}
        schema={[personSchema(p), websiteSchema(p)]}
      />

      {/* Hero Stage with Editorial Architecture & Studio Spheres */}
      <section ref={heroRef} className="mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8 sm:pt-28 lg:pt-28 lg:pb-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Editorial Headline & Identity (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Top Coordinate Stamp */}
            <div className="hero-meta-stamp flex items-center justify-between flex-wrap gap-2">
              <div className="meta-coordinate">
                <span className="meta-square" />
                <span>01 / PRESENCE</span>
              </div>
              <span className="font-mono text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                BASED IN BHOPAL · THINKING BEYOND
              </span>
            </div>

            {/* Availability Pill */}
            <div className="hero-badge inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0c121e]/80 px-3.5 py-1 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-mono text-xs font-medium text-slate-200">{p.availabilityLabel || 'Open to Full-Time & Remote Roles'}</span>
            </div>

            <div className="space-y-3">
              <p className="hero-eyebrow font-mono text-[11px] font-bold uppercase tracking-[2px] text-vermilion">
                {p.eyebrow || 'COMPUTER SCIENCE STUDENT · DEVELOPER · BUILDER'}
              </p>

              {/* Grand Editorial Headline with Upright Serif + Flowing Cursive Italic */}
              <h1 className="hero-headline font-editorial text-4xl sm:text-5xl lg:text-[3.2rem] xl:text-[3.6rem] font-semibold tracking-tight text-white leading-[1.05]">
                <span>Ayush </span>
                <span className="font-editorial-italic font-normal text-cyanglow">Prajapati</span>
              </h1>

              {/* Ticker Subtitle */}
              <div className="hero-marquee-badge overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-black/60 via-slate-900/60 to-black/60 py-2 px-3 shadow-inner">
                <div className="animate-hero-text-scroll flex items-center gap-8 whitespace-nowrap">
                  <span className="font-sans text-sm sm:text-base font-bold text-cyanglow">Full-Stack MERN Developer &amp; Systems Builder</span>
                  <span className="text-vermilion font-mono text-xs">✦</span>
                  <span className="font-sans text-sm sm:text-base font-bold text-slate-200">B.Tech CSE (CGPA: 8.42) · Batch of 2026</span>
                  <span className="text-vermilion font-mono text-xs">✦</span>
                  <span className="font-sans text-sm sm:text-base font-bold text-cyanglow">Problem Solver &amp; Systems Builder</span>
                  <span className="text-vermilion font-mono text-xs">✦</span>
                </div>
              </div>
            </div>

            <p className="hero-desc text-sm sm:text-base leading-relaxed text-slate-300 max-w-xl font-sans">
              {p.heroDescription || "I build resilient web platforms, design intuitive interfaces, and engineer scalable full-stack applications. Third-year Computer Science student exploring modern software engineering."}
            </p>

            {/* Editorial Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => goTo('/projects')}
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
                className="hero-cta-btn inline-flex items-center gap-2 rounded-full bg-vermilion px-6 py-3 text-sm font-bold text-obsidian shadow-lg shadow-vermilion/25 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Explore my work</span>
                <span aria-hidden="true">↓</span>
              </button>
              <button
                type="button"
                onClick={() => goTo('/contact')}
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
                className="hero-cta-btn inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-cyanglow active:scale-95 backdrop-blur-md"
              >
                <span>Start a conversation</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>

            <div className="hero-social-wrap pt-4 border-t hairline-border flex items-center gap-3.5">
              <SocialIconButtons socialLinks={p.socialLinks} />
            </div>
          </div>

          {/* Center Column: Portrait & Particle FX (4 Cols) */}
          <div className="hero-portrait-col lg:col-span-4 flex flex-col items-center">
            <PortraitParticles
              imageUrl={p.portrait?.url || '/images/ayush-hero-portrait.jpg'}
              alt={p.portrait?.alt || p.name}
              name={p.name}
              roleLabel={`${p.education?.stage || 'CGPA: 8.42 · Batch of 2026'} · SISTec, Bhopal`}
              offsetX={p.portrait?.offsetX || 0}
              offsetY={p.portrait?.offsetY || 0}
              sampleGap={p.portrait?.particleDensity || 4}
              toggleOffLabel={ui.particleToggleOff}
              toggleOnLabel={ui.particleToggleOn}
            />
          </div>

          {/* Right Column: Developer Workbench (3 Cols) */}
          <div className="hero-workbench-col lg:col-span-3">
            <DeveloperWorkbench />
          </div>
        </div>

        {/* Infinite Tech Stack Marquee */}
        {doubledSkills.length > 0 && (
          <div className="hero-marquee-bar mt-12 overflow-hidden rounded-2xl border hairline-border bg-black/40 py-3.5 backdrop-blur-md">
            <div className="animate-marquee flex items-center gap-6 px-4">
              {doubledSkills.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-obsidian/90 px-4 py-1.5 text-xs font-semibold text-slate-200 shadow-sm"
                >
                  <TechLogo name={item.logoKey || item.name} className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4-Column Proof Strip (Impact Metrics Inspired by Reference) */}
      <div className="proof-strip">
        <div className="proof-strip-grid">
          <div className="proof-metric-col">
            <div className="proof-metric-num">15<span className="proof-metric-accent">+</span></div>
            <div className="proof-metric-label">Production &amp; full-stack web applications built</div>
          </div>
          <div className="proof-metric-col">
            <div className="proof-metric-num">8.42<span className="proof-metric-accent">/10</span></div>
            <div className="proof-metric-label">CGPA in Computer Science &amp; Engineering (SISTec, Bhopal)</div>
          </div>
          <div className="proof-metric-col">
            <div className="proof-metric-num">500<span className="proof-metric-accent">+</span></div>
            <div className="proof-metric-label">Algorithmic problems solved across LeetCode &amp; HackerRank</div>
          </div>
          <div className="proof-metric-col flex flex-col justify-between">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              <div>THE CRAFT.</div>
              <div className="text-white font-bold">THE REAL-WORLD IMPACT.</div>
            </div>
            <button
              type="button"
              onClick={() => goTo('/projects')}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyanglow hover:text-white transition-colors mt-2"
            >
              <span>EXPLORE ALL WORK</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Content */}
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 space-y-24 pt-12">
        {/* Section 01: The Person Behind The Work (About & Perspective Switcher) */}
        <section className="about-editorial-section space-y-10 border-t hairline-border pt-16">
          <div className="section-header max-w-4xl space-y-3">
            <div className="meta-coordinate">
              <span className="meta-square" />
              <span>01 / THE PERSON BEHIND THE WORK</span>
              <span className="text-white/20">|</span>
              <span>A CONNECTED PERSPECTIVE</span>
            </div>
            <h2 className="editorial-headline text-white">
              Technology is the foundation. <span className="font-editorial-italic font-normal text-cyanglow">Experience is the point.</span>
            </h2>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400 pt-1">
              THREE DISCIPLINES. ONE PERSPECTIVE.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Left: Perspective Switcher & Focus Statement (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Perspective Tabs: Build / Architect / Solve */}
              <div className="perspective-tabs">
                <button
                  type="button"
                  onClick={() => { playTick(); setActivePerspective('build'); }}
                  className={`perspective-tab ${activePerspective === 'build' ? 'active' : ''}`}
                >
                  <span>Build</span>
                  <span>↗</span>
                </button>
                <button
                  type="button"
                  onClick={() => { playTick(); setActivePerspective('architect'); }}
                  className={`perspective-tab ${activePerspective === 'architect' ? 'active' : ''}`}
                >
                  <span>Architect</span>
                  <span>↗</span>
                </button>
                <button
                  type="button"
                  onClick={() => { playTick(); setActivePerspective('solve'); }}
                  className={`perspective-tab ${activePerspective === 'solve' ? 'active' : ''}`}
                >
                  <span>Solve</span>
                  <span>↗</span>
                </button>
              </div>

              {/* Dynamic Perspective Content Box */}
              <div
                className="glass-card rounded-2xl p-7 space-y-4 border-l-4 border-l-cyan-500 transition-all duration-300"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <h3 className="font-editorial text-2xl font-semibold text-white">
                  {PERSPECTIVES[activePerspective].title}
                </h3>
                <p className="text-sm font-medium text-cyanglow">
                  {PERSPECTIVES[activePerspective].subtitle}
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  {PERSPECTIVES[activePerspective].desc}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => goTo(PERSPECTIVES[activePerspective].actionRoute)}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-vermilion hover:underline"
                  >
                    <span>{PERSPECTIVES[activePerspective].actionText}</span>
                    <span>↗</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Personal Narrative & SISTec Academic Bio (6 Cols) */}
            <div
              className="lg:col-span-6 glass-card rounded-3xl p-7 sm:p-8 space-y-4 text-slate-300 leading-relaxed cursor-default"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div className="flex items-center gap-2 font-mono text-xs text-cyanglow font-bold uppercase tracking-wider">
                <i className="fa-solid fa-graduation-cap" />
                <span>B.Tech Computer Science &amp; Engineering · SISTec, Bhopal</span>
              </div>
              {(p.aboutBio || []).map((para, i) => (
                <p key={i} className="text-sm sm:text-base leading-relaxed">{para}</p>
              ))}
              <div className="pt-3 border-t hairline-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
                <span>✉ {p.email || 'ayushprajapati9669@gmail.com'}</span>
                <button
                  type="button"
                  onClick={() => goTo('/about')}
                  className="text-cyanglow hover:text-white font-bold transition-colors"
                >
                  Read full story ↗
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 02: Selected Work (Flagship 60/40 Browser Chrome Presentation) */}
        <section className="projects-home-section border-t hairline-border pt-16 space-y-10">
          <div className="section-header flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3 max-w-3xl">
              <div className="meta-coordinate">
                <span className="meta-square" />
                <span>02 / SELECTED WORK</span>
                <span className="text-white/20">|</span>
                <span>BUILT. ARCHITECTED. PUT INTO PRODUCTION.</span>
              </div>
              <h2 className="editorial-headline text-white">
                Ideas are a start. <span className="font-editorial-italic font-normal text-cyanglow">This is the work.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                From full-stack web applications to AI-powered interfaces. Featured systems I've designed, architected, and deployed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => goTo('/projects')}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="focus-ring rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-mono text-xs font-semibold text-white transition-all hover:border-cyanglow hover:bg-white/10"
            >
              All work ({publishedProjects.length}) ↗
            </button>
          </div>

          {/* Flagship Hero Browser Chrome Mockup (Inspired by Reference LMS Presentation) */}
          {flagshipProject && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-black/30 rounded-3xl p-6 sm:p-8 border border-white/10">
              {/* Left Column: Browser Mockup Viewport (7 Cols) */}
              <div className="lg:col-span-7">
                <div className="browser-chrome">
                  <div className="browser-chrome-header">
                    <div className="browser-dots">
                      <span className="browser-dot browser-dot-red" />
                      <span className="browser-dot-yellow browser-dot" />
                      <span className="browser-dot-green browser-dot" />
                    </div>
                    <div className="browser-url-pill">
                      <i className="fa-solid fa-lock text-[9px] text-emerald-400" />
                      <span>{flagshipProject.liveDemoUrl ? new URL(flagshipProject.liveDemoUrl).hostname : 'airbnb-clone.dev'}</span>
                    </div>
                    <a
                      href={flagshipProject.liveDemoUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="browser-circle-btn"
                      aria-label="Open live demo"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square" />
                    </a>
                  </div>
                  <div className="browser-viewport">
                    <img
                      src={flagshipProject.thumbnailUrl || '/images/airbnb-clone-preview.webp'}
                      alt={flagshipProject.title}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Narrative & Tech Meta (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="font-mono text-xs font-bold text-vermilion uppercase tracking-widest">
                  01 / Flagship Full-Stack Platform
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-white leading-tight">
                  {flagshipProject.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  {flagshipProject.shortDescription || "A comprehensive property rental platform featuring secure JWT authentication, dynamic search filters, booking management, and a custom cloud image upload system."}
                </p>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {(flagshipProject.technologies || ['React JS', 'Node.js', 'Express.js', 'MongoDB']).map((t, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t hairline-border">
                  <button
                    type="button"
                    onClick={() => goTo(`/projects/${flagshipProject.slug || flagshipProject.id}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyanglow hover:text-white transition-colors"
                  >
                    <span>Explore Case Study</span>
                    <span>↗</span>
                  </button>
                  {flagshipProject.liveDemoUrl && (
                    <a
                      href={flagshipProject.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      <span>Live Site</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Secondary Projects: Asymmetric 2-Column Grid */}
          {secondaryProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {secondaryProjects.slice(0, 2).map((proj, idx) => (
                <ProjectCard
                  key={proj.id}
                  proj={proj}
                  indexNum={idx + 2}
                  isSelected={highlightedProjectId === proj.id}
                  onSelect={setHighlightedProjectId}
                  onCardMouseMove={handleCardMouseMove}
                  onCardMouseLeave={handleCardMouseLeave}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 03: How I Think & Work (3-Step Engineering Pipeline Inspired by Reference) */}
        <section className="process-home-section border-t hairline-border pt-16 space-y-10">
          <div className="section-header max-w-4xl space-y-3">
            <div className="meta-coordinate">
              <span className="meta-square" />
              <span>03 / HOW I THINK &amp; WORK</span>
              <span className="text-white/20">|</span>
              <span>DEPTH MEETS PERSPECTIVE</span>
            </div>
            <h2 className="editorial-headline text-white">
              How I build. <span className="font-editorial-italic font-normal text-cyanglow">From idea to production.</span>
            </h2>
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400">
              CHOOSE A DISCIPLINE. FOLLOW THE ARCHITECTURE.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: 3-Step Connected Pipeline (6 Cols) */}
            <div className="lg:col-span-6 process-pipeline">
              <div className="process-step-item">
                <div className="process-step-node">01</div>
                <div>
                  <h3 className="process-step-title">Deconstruct the Problem</h3>
                  <p className="text-xs text-slate-400 mt-1">Understanding business constraints, edge cases, and algorithmic complexity before writing code.</p>
                </div>
              </div>

              <div className="process-step-item">
                <div className="process-step-node">02</div>
                <div>
                  <h3 className="process-step-title">Architect the Data &amp; APIs</h3>
                  <p className="text-xs text-slate-400 mt-1">Designing normalized MongoDB schemas, indexing query paths, and securing REST endpoints with CSRF &amp; rate limiting.</p>
                </div>
              </div>

              <div className="process-step-item">
                <div className="process-step-node">03</div>
                <div>
                  <h3 className="process-step-title">Engineer the Full-Stack Solution</h3>
                  <p className="text-xs text-slate-400 mt-1">Building responsive React interfaces with GSAP motion, resilient error boundaries, and production-tested state management.</p>
                </div>
              </div>
            </div>

            {/* Right: Technical Focus Card with Vermilion Accent (6 Cols) */}
            <div className="lg:col-span-6 process-focus-card space-y-4">
              <div className="font-mono text-xs font-bold text-vermilion uppercase tracking-widest">
                PRODUCT &amp; FULL-STACK ARCHITECTURE
              </div>
              <h3 className="font-editorial text-2xl font-semibold text-white">
                Build with perspective.
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                I connect what users experience with what backend systems must sustain. From the first schema requirement to the smooth, animated interaction people touch.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-slate-300">
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-md">JavaScript (ES6+)</span>
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-md">React.js</span>
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-md">Node.js</span>
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-md">Express.js</span>
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-md">MongoDB</span>
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-md">RESTful APIs</span>
              </div>
              <div className="pt-3 border-t hairline-border">
                <button
                  type="button"
                  onClick={() => goTo('/skills')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyanglow hover:text-white transition-colors"
                >
                  <span>Explore full technical matrix</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 04: Technical Capabilities & Interactive Skills Matrix */}
        <InteractiveSkillsWidget showCta={true} onCtaClick={() => goTo('/skills')} />

        {/* Section 05: Verified Credentials & Certificates */}
        <section className="certs-home-section border-t hairline-border pt-16 space-y-10">
          <div className="section-header flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3 max-w-3xl">
              <div className="meta-coordinate">
                <span className="meta-square" />
                <span>04 / VERIFIED CREDENTIALS</span>
                <span className="text-white/20">|</span>
                <span>AUTHENTICATED MERIT</span>
              </div>
              <h2 className="editorial-headline text-white">
                Certifications &amp; <span className="font-editorial-italic font-normal text-cyanglow">Achievements.</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => goTo('/certificates')}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="focus-ring rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-mono text-xs font-semibold text-white transition-all hover:border-cyanglow hover:bg-white/10"
            >
              All certificates ({certificates.length}) ↗
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400 font-mono text-sm border border-white/5">
              No certificates added yet. Upload your credentials in the Admin CMS to showcase them here.
            </div>
          ) : (
            <div className={`certs-home-grid grid grid-cols-1 gap-8 ${certificates.length === 1 ? 'max-w-2xl' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {certificates.slice(0, 3).map((cert, idx) => (
                <CertificateCard
                  key={cert.id}
                  cert={cert}
                  indexNum={idx + 1}
                  onCardMouseMove={handleCardMouseMove}
                  onCardMouseLeave={handleCardMouseLeave}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 06: Academic Journey */}
        <section className="journey-home-section border-t hairline-border pt-16 space-y-10">
          <div className="section-header space-y-3 max-w-3xl">
            <div className="meta-coordinate">
              <span className="meta-square" />
              <span>INTERLUDE / STILL BECOMING</span>
              <span className="text-white/20">|</span>
              <span>A JOURNEY IN MOTION</span>
            </div>
            <h2 className="editorial-headline text-white">
              Started with code. <span className="font-editorial-italic font-normal text-cyanglow">Kept building forward.</span>
            </h2>
          </div>
          <div className="journey-grid grid grid-cols-1 gap-6 md:grid-cols-3">
            {(p.learningJourney || []).map((step, i) => (
              <div
                key={i}
                className="journey-card glass-card glass-card-hover rounded-3xl p-7 space-y-3 cursor-default"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <span className="inline-block rounded-full bg-vermilion/15 px-3 py-1 font-mono text-xs font-semibold text-vermilion">
                  {step.phase}
                </span>
                <h3 className="font-editorial text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 07: The Next Chapter / Direct Contact CTA */}
        <section className="home-cta-banner rounded-3xl border border-white/10 bg-gradient-to-r from-black/80 via-slate-900/80 to-black/80 p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-3 max-w-2xl">
            <div className="meta-coordinate">
              <span className="meta-square" />
              <span>06 / THE NEXT CHAPTER</span>
              <span className="text-white/20">|</span>
              <span>LET'S MAKE IT MATTER</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-semibold text-white leading-tight">
              Something great starts with a hello. <span className="font-editorial-italic font-normal text-cyanglow">Let's connect.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Open to full-stack engineering roles, software internships, and high-impact web products. If our worlds overlap, let's build something lasting.
            </p>
          </div>
          <div className="flex flex-wrap gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => goTo('/contact')}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="focus-ring rounded-full bg-vermilion px-7 py-3.5 text-sm font-bold text-obsidian shadow-lg shadow-vermilion/25 transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Start a conversation →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
