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

  const containerRef = useRef(null);
  const heroRef = useRef(null);

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
      rotateX: ((y - rect.height / 2) / rect.height) * -5,
      rotateY: ((x - rect.width / 2) / rect.width) * 5,
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
        .from('.hero-badge', {
          y: -20,
          opacity: 0,
          scale: 0.9,
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
            scale: 0.92,
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
        .from(
          '.hero-cta-btn',
          {
            y: 25,
            opacity: 0,
            scale: 0.95,
            stagger: 0.12,
            duration: 0.6,
            ease: 'back.out(1.2)'
          },
          '-=0.4'
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
            scale: 0.9,
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

      gsap.from('.bento-focus-card', {
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

      // 3. Section 03: Projects Showcase ScrollTrigger
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

      gsap.from('.projects-home-grid .project-card', {
        scrollTrigger: {
          trigger: '.projects-home-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        scale: 0.96,
        stagger: 0.15,
        duration: 0.85,
        ease: 'back.out(1.2)'
      });

      // 4. Section 04: Certificates Showcase ScrollTrigger
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

      gsap.from('.certs-home-grid .cert-card', {
        scrollTrigger: {
          trigger: '.certs-home-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 45,
        opacity: 0,
        scale: 0.96,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.2)'
      });

      // 5. Section 05: Academic Journey ScrollTrigger
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

      gsap.from('.journey-card', {
        scrollTrigger: {
          trigger: '.journey-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        scale: 0.96,
        stagger: 0.14,
        duration: 0.8,
        ease: 'back.out(1.2)'
      });

      // 6. Section 06: CTA Banner ScrollTrigger
      gsap.from('.home-cta-banner', {
        scrollTrigger: {
          trigger: '.home-cta-banner',
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        scale: 0.93,
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
        title="Ayush Prajapati | Full-Stack Developer & Software Engineer"
        description={p.headline || p.heroDescription || 'Full-Stack Developer crafting high-performance web products, scalable backend systems, and interactive architectures.'}
        schema={[personSchema(p), websiteSchema(p)]}
      />
      {/* Hero & Bento Stage */}
      <section ref={heroRef} className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8 sm:pt-32 lg:pt-36">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="hero-badge inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-charcoal/90 px-3.5 py-1.5 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sage" />
              </span>
              <span className="font-mono text-xs font-medium text-alabaster">{p.availabilityLabel}</span>
            </div>

            <div className="space-y-3.5">
              <p className="hero-eyebrow font-mono text-xs font-semibold uppercase tracking-[0.16em] text-vermilion">{p.eyebrow}</p>
              <h1 className="hero-headline font-display text-4xl font-extrabold tracking-tight text-alabaster sm:text-5xl lg:text-[3.35rem] leading-[1.08]">
                {p.headline}
              </h1>

              <div className="hero-marquee-badge overflow-hidden rounded-2xl border border-cyanglow/30 bg-gradient-to-r from-charcoal via-graphite to-charcoal py-2.5 px-3 shadow-inner">
                <div className="animate-hero-text-scroll flex items-center gap-10 whitespace-nowrap">
                  <span className="font-display text-lg sm:text-xl font-bold text-cyanglow">{p.supportingHeadline}</span>
                  <span className="text-vermilion font-mono text-sm">✦</span>
                  <span className="font-display text-lg sm:text-xl font-bold text-alabaster">{p.supportingHeadline}</span>
                  <span className="text-vermilion font-mono text-sm">✦</span>
                  <span className="font-display text-lg sm:text-xl font-bold text-cyanglow">{p.supportingHeadline}</span>
                  <span className="text-vermilion font-mono text-sm">✦</span>
                </div>
              </div>
            </div>

            <p className="hero-desc text-base leading-relaxed text-stonewarm max-w-xl">{p.heroDescription}</p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => goTo('/projects')}
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
                className="hero-cta-btn focus-ring inline-flex items-center gap-2.5 rounded-full bg-vermilion px-6 py-3.5 text-sm font-bold text-obsidian shadow-lg shadow-vermilion/25 transition-all hover:opacity-95"
              >
                <span>{p.primaryCtaText || 'Explore Live Projects'}</span>
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                onClick={() => goTo('/contact')}
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
                className="hero-cta-btn focus-ring inline-flex items-center gap-2 rounded-full border border-cyanglow/40 bg-charcoal px-5 py-3.5 text-sm font-semibold text-cyanglow transition-colors hover:bg-cyanglow hover:text-obsidian"
              >
                <span>{p.secondaryCtaText && p.secondaryCtaText !== 'Download Resume' ? p.secondaryCtaText : "Let's Connect"}</span>
                <span aria-hidden="true">→</span>
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

          {/* Right Column: Developer Workbench & Bento Cards (3 Cols) */}
          <div className="hero-workbench-col lg:col-span-3">
            <DeveloperWorkbench />
          </div>
        </div>

        {/* Infinite Tech Stack Marquee Bar */}
        {doubledSkills.length > 0 && (
          <div className="hero-marquee-bar mt-14 overflow-hidden rounded-2xl border hairline-border bg-charcoal/60 py-4 backdrop-blur-md">
            <div className="animate-marquee flex items-center gap-6 px-4">
              {doubledSkills.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-obsidian/90 px-4 py-2 text-xs font-semibold text-alabaster shadow-sm"
                >
                  <TechLogo name={item.logoKey || item.name} className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Main Home Content Sections */}
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 space-y-24 pt-6">
        {/* Section 01: Bento Introduction & Education */}
        <section className="bento-section space-y-10 border-t hairline-border pt-16">
          <div className="bento-header max-w-3xl space-y-3">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">{ui.homeIntroEyebrow}</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-alabaster leading-tight">{ui.homeIntroHeading}</h2>
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

        {/* Section 02: Technical Capabilities / Skills Section */}
        <InteractiveSkillsWidget showCta={true} onCtaClick={() => goTo('/skills')} />

        {/* Section 03: Live Deployed Projects */}
        <section className="projects-home-section border-t hairline-border pt-16 space-y-10">
          <div className="section-header flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">{ui.homeProjectsEyebrow}</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-alabaster">{ui.homeProjectsHeading}</h2>
            </div>
            <button
              type="button"
              onClick={() => goTo('/projects')}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="focus-ring rounded-full border border-white/15 bg-charcoal px-5 py-2.5 font-mono text-xs font-semibold text-alabaster transition-colors hover:border-vermilion"
            >
              {ui.homeProjectsCta} ({publishedProjects.length}) →
            </button>
          </div>

          {displayProjects.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-stonewarm font-mono text-sm border border-white/5">
              No projects published yet. Click "Admin CMS" in the top bar to create and publish your first project.
            </div>
          ) : (
            <div className={`projects-home-grid grid grid-cols-1 gap-8 ${displayProjects.length === 1 ? 'max-w-3xl' : 'lg:grid-cols-2'}`}>
              {displayProjects.map((proj, idx) => (
                <ProjectCard
                  key={proj.id}
                  proj={proj}
                  indexNum={idx + 1}
                  isSelected={highlightedProjectId === proj.id}
                  onSelect={setHighlightedProjectId}
                  onCardMouseMove={handleCardMouseMove}
                  onCardMouseLeave={handleCardMouseLeave}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 04: Verified Certificates Showcase */}
        <section className="certs-home-section border-t hairline-border pt-16 space-y-10">
          <div className="section-header flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyanglow">
                {ui.homeCertsEyebrow || '04 · VERIFIED CREDENTIALS'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-alabaster">
                {ui.homeCertsHeading || 'Certifications & Achievements'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => goTo('/certificates')}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="focus-ring rounded-full border border-white/15 bg-charcoal px-5 py-2.5 font-mono text-xs font-semibold text-alabaster transition-colors hover:border-cyanglow"
            >
              {ui.homeCertsCta || 'View Certificates'} ({certificates.length}) →
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-stonewarm font-mono text-sm border border-white/5">
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

        {/* Section 05: Education & Academic Projects */}
        <section className="journey-home-section border-t hairline-border pt-16 space-y-10">
          <div className="section-header space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">{ui.homeJourneyEyebrow}</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-alabaster">{ui.homeJourneyHeading}</h2>
          </div>
          <div className="journey-grid grid grid-cols-1 gap-6 md:grid-cols-3">
            {(p.learningJourney || []).map((step, i) => (
              <div
                key={i}
                className="journey-card glass-card glass-card-hover rounded-3xl p-7 space-y-3 cursor-default"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <span className="inline-block rounded-full bg-amberwarm/15 px-3 py-1 font-mono text-xs font-semibold text-amberwarm">
                  {step.phase}
                </span>
                <h3 className="font-display text-xl font-bold text-alabaster">{step.title}</h3>
                <p className="text-sm leading-relaxed text-stonewarm">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 06: Direct Resume Download & Contact CTA */}
        <section className="home-cta-banner rounded-3xl border border-vermilion/30 bg-gradient-to-r from-charcoal via-graphite to-charcoal p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">{ui.homeBannerEyebrow}</p>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-alabaster leading-tight">{ui.homeBannerHeading}</h2>
            <p className="text-sm sm:text-base text-stonewarm">{ui.homeBannerSubtext}</p>
          </div>
          <div className="flex flex-wrap gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => goTo('/contact')}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="focus-ring rounded-full bg-vermilion px-7 py-3.5 text-sm font-bold text-obsidian shadow-lg shadow-vermilion/25 transition-transform hover:-translate-y-0.5"
            >
              Contact Me →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

