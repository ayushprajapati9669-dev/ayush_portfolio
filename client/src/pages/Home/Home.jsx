import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { InteractiveSkillsWidget } from '../../components/ui/InteractiveSkillsWidget';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { CertificateCard } from '../../components/projects/CertificateCard';
import { TechLogo } from '../../components/common/TechLogos';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { personSchema, websiteSchema } from '../../utils/seo';

export function HomePage() {
  const { appState } = usePortfolio();
  const navigate = useNavigate();
  const [highlightedProjectId, setHighlightedProjectId] = useState(null);

  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const portraitStageRef = useRef(null);

  // Horizontal scroll refs & states for Projects
  const projectsTrackRef = useRef(null);
  const [projectsIndex, setProjectsIndex] = useState(1);
  const [projectsProgress, setProjectsProgress] = useState(25);
  const isDraggingProjectsRef = useRef(false);
  const startXProjectsRef = useRef(0);
  const scrollLeftProjectsRef = useRef(0);

  // Horizontal scroll refs & states for Certificates
  const certsTrackRef = useRef(null);
  const [certsIndex, setCertsIndex] = useState(1);
  const [certsProgress, setCertsProgress] = useState(33);
  const isDraggingCertsRef = useRef(false);
  const startXCertsRef = useRef(0);
  const scrollLeftCertsRef = useRef(0);

  const p = appState.profile || {};
  const ui = appState.uiLabels || {};

  const publishedProjects = (appState.projects || [])
    .filter((proj) => proj.status === 'published')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const featuredProjects = publishedProjects.filter((proj) => proj.featured);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : publishedProjects;
  const allSkillItems = (appState.skills || []).flatMap((g) => g.items || []);
  const doubledSkills = [...allSkillItems, ...allSkillItems];
  const certificates = appState.certificates || [];

  const goTo = (route) => {
    playTick();
    navigate(route);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const scrollToSection = (id) => {
    playTick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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

  // Projects Horizontal Track Scrolling
  const handleProjectsScroll = useCallback(() => {
    const track = projectsTrackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const progress = maxScroll > 0 ? (track.scrollLeft / maxScroll) * 100 : 0;
    setProjectsProgress(Math.max(10, Math.min(100, progress)));

    const slideWidth = track.clientWidth * 0.45 || 400;
    const currentIdx = Math.min(
      displayProjects.length,
      Math.max(1, Math.round(track.scrollLeft / slideWidth) + 1)
    );
    setProjectsIndex(currentIdx);
  }, [displayProjects.length]);

  const scrollProjects = (direction) => {
    playTick();
    const track = projectsTrackRef.current;
    if (!track) return;
    const firstSlide = track.querySelector('.project-card-slide');
    const slideWidth = firstSlide ? firstSlide.getBoundingClientRect().width + 24 : track.clientWidth * 0.5;
    track.scrollBy({ left: slideWidth * (direction === 'left' ? -1 : 1), behavior: 'smooth' });
  };

  // Drag to scroll for Projects Track
  const handleProjectsMouseDown = (e) => {
    const track = projectsTrackRef.current;
    if (!track) return;
    isDraggingProjectsRef.current = true;
    startXProjectsRef.current = e.pageX - track.offsetLeft;
    scrollLeftProjectsRef.current = track.scrollLeft;
  };

  const handleProjectsMouseMove = (e) => {
    if (!isDraggingProjectsRef.current) return;
    e.preventDefault();
    const track = projectsTrackRef.current;
    if (!track) return;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startXProjectsRef.current) * 1.5;
    track.scrollLeft = scrollLeftProjectsRef.current - walk;
  };

  const handleProjectsMouseUp = () => {
    isDraggingProjectsRef.current = false;
  };

  // Certificates Horizontal Track Scrolling
  const handleCertsScroll = useCallback(() => {
    const track = certsTrackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const progress = maxScroll > 0 ? (track.scrollLeft / maxScroll) * 100 : 0;
    setCertsProgress(Math.max(10, Math.min(100, progress)));

    const slideWidth = track.clientWidth * 0.35 || 320;
    const currentIdx = Math.min(
      certificates.length,
      Math.max(1, Math.round(track.scrollLeft / slideWidth) + 1)
    );
    setCertsIndex(currentIdx);
  }, [certificates.length]);

  const scrollCerts = (direction) => {
    playTick();
    const track = certsTrackRef.current;
    if (!track) return;
    const firstSlide = track.querySelector('.cert-card-slide');
    const slideWidth = firstSlide ? firstSlide.getBoundingClientRect().width + 24 : track.clientWidth * 0.35;
    track.scrollBy({ left: slideWidth * (direction === 'left' ? -1 : 1), behavior: 'smooth' });
  };

  // Drag to scroll for Certs Track
  const handleCertsMouseDown = (e) => {
    const track = certsTrackRef.current;
    if (!track) return;
    isDraggingCertsRef.current = true;
    startXCertsRef.current = e.pageX - track.offsetLeft;
    scrollLeftCertsRef.current = track.scrollLeft;
  };

  const handleCertsMouseMove = (e) => {
    if (!isDraggingCertsRef.current) return;
    e.preventDefault();
    const track = certsTrackRef.current;
    if (!track) return;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startXCertsRef.current) * 1.5;
    track.scrollLeft = scrollLeftCertsRef.current - walk;
  };

  const handleCertsMouseUp = () => {
    isDraggingCertsRef.current = false;
  };

  // GSAP Entrance Timeline & ScrollTrigger Animations
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (_e) {}

    const ctx = gsap.context(() => {
      // 1. Sarthak Sharma-Style Hero Entrance
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .from('.hero-top-meta', {
          y: -20,
          opacity: 0,
          duration: 0.8,
          delay: 0.1
        })
        .from(
          '.hero-presence-strip',
          {
            x: -25,
            opacity: 0,
            duration: 0.8
          },
          '-=0.5'
        )
        .from(
          '.hero-portrait-stage',
          {
            scale: 0.92,
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'power2.out'
          },
          '-=0.6'
        )
        .from(
          '.hero-sub-eyebrow',
          {
            y: 15,
            opacity: 0,
            duration: 0.6
          },
          '-=0.5'
        )
        .from(
          '.hero-name-editorial',
          {
            y: 30,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out'
          },
          '-=0.45'
        )
        .from(
          '.hero-narrative-editorial',
          {
            y: 20,
            opacity: 0,
            duration: 0.7
          },
          '-=0.4'
        )
        .fromTo(
          '.hero-actions-editorial > *',
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all'
          },
          '-=0.3'
        )
        .fromTo(
          '.hero-bottom-footer',
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
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      gsap.from('.bento-bio-card', {
        scrollTrigger: {
          trigger: '.bento-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      const bentoCards = containerRef.current.querySelectorAll('.bento-focus-card');
      if (bentoCards.length > 0) {
        gsap.from(bentoCards, {
          scrollTrigger: {
            trigger: '.bento-focus-grid',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 40,
          opacity: 0,
          scale: 0.95,
          stagger: 0.12,
          duration: 0.75,
          ease: 'back.out(1.2)'
        });
      }

      // 3. Section 02: Projects Horizontal Track Entrance
      gsap.from('.projects-home-section .showcase-header > *', {
        scrollTrigger: {
          trigger: '.projects-home-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      const projSlides = containerRef.current.querySelectorAll('.project-card-slide');
      if (projSlides.length > 0) {
        gsap.from(projSlides, {
          scrollTrigger: {
            trigger: '.projects-home-section .horizontal-scroll-track',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          x: 40,
          opacity: 0,
          scale: 0.97,
          stagger: 0.12,
          duration: 0.8,
          ease: 'power3.out'
        });
      }

      // 4. Section 03: Certificates Horizontal Track Entrance
      gsap.from('.certs-home-section .showcase-header > *', {
        scrollTrigger: {
          trigger: '.certs-home-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out'
      });

      const certSlides = containerRef.current.querySelectorAll('.cert-card-slide');
      if (certSlides.length > 0) {
        gsap.from(certSlides, {
          scrollTrigger: {
            trigger: '.certs-home-section .horizontal-scroll-track',
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          x: 40,
          opacity: 0,
          scale: 0.97,
          stagger: 0.12,
          duration: 0.8,
          ease: 'power3.out'
        });
      }

      

      // 6. Section 05: CTA Banner ScrollTrigger
      gsap.from('.home-cta-banner', {
        scrollTrigger: {
          trigger: '.home-cta-banner',
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        scale: 0.95,
        opacity: 0,
        y: 30,
        duration: 0.85,
        ease: 'power3.out'
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroPhotoSrc = '/images/ayush-portrait-new.jpg';

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

        {/* Center Editorial Showcase */}
        <div className="hero-center-showcase">
          {/* Mid-Left Presence Vertical Strip */}
          <div className="hero-presence-strip" aria-hidden="true">
            <span className="presence-num">01 / PRESENCE</span>
            <span className="presence-plus">+</span>
            <span className="presence-word">FULL-STACK</span>
            <span className="presence-word">PROBLEM SOLVING</span>
            <span className="presence-word">INTELLIGENT SYSTEMS</span>
          </div>

          {/* Masked Editorial Portrait with Ambient Backlight Glow */}
          <div
            ref={portraitStageRef}
            className="hero-portrait-stage"
            onMouseMove={handlePortraitMouseMove}
            onMouseLeave={handlePortraitMouseLeave}
          >
            <img
              src={heroPhotoSrc}
              alt={p.name || 'Ayush Prajapati'}
              className="hero-portrait-img"
              loading="eager"
            />
          </div>

          {/* Sub-Eyebrow */}
          <div className="hero-sub-eyebrow">
            A HUMAN PERSPECTIVE ON SOFTWARE
          </div>

          {/* Large Name Typography (Inter Sans-Serif) */}
          <h1 className="hero-name-editorial">
            <span className="name-first">Ayush</span>
            <span className="name-last">Prajapati</span>
          </h1>

          {/* Narrative / Tagline */}
          <p className="hero-narrative-editorial">
            {p.heroDescription || 'I build scalable full-stack products, solve algorithmic challenges, and engineer intelligent web applications.'}
          </p>

          {/* Interactive CTAs */}
          <div className="hero-actions-editorial">
            <button
              type="button"
              onClick={() => scrollToSection('featured-projects')}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="hero-btn-work"
            >
              <span>Explore my work</span>
              <span aria-hidden="true">↓</span>
            </button>

            <button
              type="button"
              onClick={() => goTo('/contact')}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="hero-btn-talk"
            >
              <span>Start a conversation</span>
              <span aria-hidden="true">↗</span>
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

      {/* Tech Stack Marquee Bar */}
      {doubledSkills.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-2 mb-16">
          <div className="hero-marquee-bar overflow-hidden rounded-2xl border hairline-border bg-charcoal/60 py-3.5 backdrop-blur-md">
            <div className="animate-marquee flex items-center gap-6 px-4">
              {doubledSkills.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-obsidian/90 px-4 py-1.5 text-xs font-semibold text-alabaster shadow-sm"
                >
                  <TechLogo name={item.logoKey || item.name} className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Home Content Sections */}
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 space-y-24">
        {/* =========================================================================
            SECTION 01: Bento Introduction & Focus Areas
            ========================================================================= */}
        <section className="bento-section space-y-10 border-t hairline-border pt-16">
          <div className="bento-header max-w-3xl space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">{ui.homeIntroEyebrow || '01 · ABOUT & MISSION'}</p>
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-alabaster leading-tight font-normal">
              Technology is the starting point.{' '}
              <span className="font-editorial-italic italic">People are the point.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div
              className="bento-bio-card lg:col-span-6 glass-card rounded-3xl p-7 sm:p-8 space-y-4 text-stonewarm leading-relaxed cursor-default transition-shadow hover:shadow-cyan-500/10"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              {(p.aboutBio || []).map((para, i) => (
                <p key={i} className="text-sm sm:text-base">{para}</p>
              ))}
              <div className="pt-3 border-t hairline-border flex flex-wrap gap-3 text-xs font-mono text-cyanglow">
                <span>✉ {p.email || 'ayushprajapati9669@gmail.com'}</span>
                <span>☎ {p.phone || '(+91) 9669802554'}</span>
              </div>
            </div>

            <div className="bento-focus-grid lg:col-span-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(p.focusAreas || []).map((area, idx) => (
                <div
                  key={idx}
                  className="bento-focus-card glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-3 cursor-default"
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-vermilion/15 font-mono text-xs font-bold text-vermilion">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-alabaster">{area.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-stonewarm">{area.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Capabilities / Skills Widget */}
        <InteractiveSkillsWidget showCta={true} onCtaClick={() => goTo('/skills')} />

        {/* =========================================================================
            SECTION 02: Horizontal Scrollable Live Deployed Projects Track
            ========================================================================= */}
        <section id="featured-projects" className="projects-home-section horizontal-showcase-section border-t hairline-border pt-16">
          <div className="showcase-header">
            <div>
              <p className="showcase-eyebrow">
                {ui.homeProjectsEyebrow || '02 · LIVE DEPLOYED PROJECTS'}
              </p>
              <h2 className="showcase-title">
                {ui.homeProjectsHeading || 'Featured Full-Stack Applications'}
              </h2>
            </div>

            <div className="showcase-controls">
              <span className="showcase-counter">
                0{projectsIndex} / 0{displayProjects.length || 1}
              </span>

              <button
                type="button"
                className="showcase-arrow-btn"
                onClick={() => scrollProjects('left')}
                title="Scroll Left"
                aria-label="Scroll projects left"
              >
                <i className="fa-solid fa-chevron-left" />
              </button>

              <button
                type="button"
                className="showcase-arrow-btn"
                onClick={() => scrollProjects('right')}
                title="Scroll Right"
                aria-label="Scroll projects right"
              >
                <i className="fa-solid fa-chevron-right" />
              </button>

              <button
                type="button"
                onClick={() => goTo('/projects')}
                className="showcase-view-all"
              >
                {ui.homeProjectsCta || 'View All Projects'} ({publishedProjects.length}) ↗
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="showcase-progress-bar">
            <div className="showcase-progress-thumb" style={{ width: `${projectsProgress}%` }} />
          </div>

          {/* Horizontal Track */}
          {displayProjects.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-stonewarm font-mono text-sm border border-white/5">
              No projects published yet. Click "Admin CMS" in the top bar to create and publish your first project.
            </div>
          ) : (
            <div
              ref={projectsTrackRef}
              className="horizontal-scroll-track"
              onScroll={handleProjectsScroll}
              onMouseDown={handleProjectsMouseDown}
              onMouseMove={handleProjectsMouseMove}
              onMouseUp={handleProjectsMouseUp}
              onMouseLeave={handleProjectsMouseUp}
            >
              {displayProjects.map((proj, idx) => (
                <div key={proj.id} className="project-card-slide">
                  <ProjectCard
                    proj={proj}
                    indexNum={idx + 1}
                    isSelected={highlightedProjectId === proj.id}
                    onSelect={setHighlightedProjectId}
                    onCardMouseMove={handleCardMouseMove}
                    onCardMouseLeave={handleCardMouseLeave}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION 03: Horizontal Scrollable Verified Certificates Track
            ========================================================================= */}
        <section className="certs-home-section horizontal-showcase-section border-t hairline-border pt-16">
          <div className="showcase-header">
            <div>
              <p className="showcase-eyebrow">
                {ui.homeCertsEyebrow || '03 · VERIFIED CREDENTIALS'}
              </p>
              <h2 className="showcase-title">
                {ui.homeCertsHeading || 'Certifications & Achievements'}
              </h2>
            </div>

            <div className="showcase-controls">
              <span className="showcase-counter">
                0{certsIndex} / 0{certificates.length || 1}
              </span>

              <button
                type="button"
                className="showcase-arrow-btn"
                onClick={() => scrollCerts('left')}
                title="Scroll Left"
                aria-label="Scroll certificates left"
              >
                <i className="fa-solid fa-chevron-left" />
              </button>

              <button
                type="button"
                className="showcase-arrow-btn"
                onClick={() => scrollCerts('right')}
                title="Scroll Right"
                aria-label="Scroll certificates right"
              >
                <i className="fa-solid fa-chevron-right" />
              </button>

              <button
                type="button"
                onClick={() => goTo('/certificates')}
                className="showcase-view-all"
              >
                {ui.homeCertsCta || 'View Certificates'} ({certificates.length}) ↗
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="showcase-progress-bar">
            <div className="showcase-progress-thumb" style={{ width: `${certsProgress}%` }} />
          </div>

          {/* Horizontal Track */}
          {certificates.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-stonewarm font-mono text-sm border border-white/5">
              No certificates added yet. Upload your credentials in the Admin CMS to showcase them here.
            </div>
          ) : (
            <div
              ref={certsTrackRef}
              className="horizontal-scroll-track"
              onScroll={handleCertsScroll}
              onMouseDown={handleCertsMouseDown}
              onMouseMove={handleCertsMouseMove}
              onMouseUp={handleCertsMouseUp}
              onMouseLeave={handleCertsMouseUp}
            >
              {certificates.map((cert, idx) => (
                <div key={cert.id} className="cert-card-slide">
                  <CertificateCard
                    cert={cert}
                    indexNum={idx + 1}
                    onCardMouseMove={handleCardMouseMove}
                    onCardMouseLeave={handleCardMouseLeave}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        

        {/* =========================================================================
            SECTION 05: Direct Contact CTA Banner
            ========================================================================= */}
        <section className="home-cta-banner rounded-3xl border border-white/10 bg-gradient-to-r from-charcoal via-graphite to-charcoal p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">
              {ui.homeBannerEyebrow || 'GET IN TOUCH'}
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-alabaster leading-tight">
              {ui.homeBannerHeading || "Let's build something extraordinary together."}
            </h2>
            <p className="text-sm sm:text-base text-stonewarm">
              {ui.homeBannerSubtext || "Available for software engineering roles, full-stack development, and ambitious client projects."}
            </p>
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
