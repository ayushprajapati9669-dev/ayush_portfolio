import React, { useEffect, useRef } from 'react';
import '../../../styles/components/home-below-the-fold.css';
import { LazyInView } from '../../../components/common/LazyInView';
import { TiltCard } from '../../../components/ui/TiltCard';

const ZeroToOneJourneyCard = React.lazy(() =>
  import('../../../components/ui/ZeroToOneJourneyCard').then((m) => ({ default: m.ZeroToOneJourneyCard }))
);
const InteractiveMeshWave = React.lazy(() =>
  import('../../../components/ui/InteractiveMeshWave').then((m) => ({ default: m.InteractiveMeshWave }))
);
const CinematicParticleCard = React.lazy(() =>
  import('../../../components/ui/CinematicParticleCard').then((m) => ({ default: m.CinematicParticleCard }))
);
const ProjectCard = React.lazy(() =>
  import('../../../components/projects/ProjectCard').then((m) => ({ default: m.ProjectCard }))
);
const TechLogo = React.lazy(() =>
  import('../../../components/common/TechLogos').then((m) => ({ default: m.TechLogo }))
);
const ScrollWriteText = React.lazy(() =>
  import('../../../components/common/ScrollWriteText').then((m) => ({ default: m.ScrollWriteText }))
);

export function HomeBelowTheFold({
  ui = {},
  p = {},
  coreTechList = [],
  showcaseProjects = [],
  publishedProjects = [],
  allSkillItems = [],
  certificates = [],
  goTo,
  handleCardMouseMove,
  handleCardMouseLeave,
  handleCopyEmail,
  copiedEmail,
  handleMagneticMouseMove,
  handleMagneticMouseLeave
}) {
  const foldRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !foldRef.current) return;

    let ctx = null;
    let cancelled = false;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapMod, stMod]) => {
      if (cancelled || !foldRef.current) return;
      const gsap = gsapMod.default || gsapMod;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);
      if (typeof window !== 'undefined') window.ScrollTrigger = ScrollTrigger;

      ctx = gsap.context(() => {
        // 1. Bento Intro & Focus Areas
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

        const particleCard = foldRef.current?.querySelector('.particle-container');
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

        // 2. Directory Navigation Buttons
        const navBtns = foldRef.current?.querySelectorAll('.home-nav-executive-btn, .home-nav-btn');
        if (navBtns && navBtns.length > 0) {
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

        // 3. Featured Projects
        const projectCards = foldRef.current?.querySelectorAll('#featured-projects .project-card, #featured-projects .project-card-v2');
        if (projectCards && projectCards.length > 0) {
          gsap.from(projectCards, {
            scrollTrigger: {
              trigger: '#featured-projects',
              start: 'top 92%',
              once: true
            },
            y: 24,
            opacity: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all'
          });
        }

        // 4. CTA Banner
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
      }, foldRef);

      ScrollTrigger.refresh();
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div ref={foldRef} className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 space-y-24 mt-12 sm:mt-16">
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
            <LazyInView minHeight="270px" className="absolute inset-0">
              <InteractiveMeshWave className="absolute inset-0" />
            </LazyInView>
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
            <LazyInView minHeight="380px" className="h-full w-full">
              <CinematicParticleCard className="h-full min-h-[380px]" />
            </LazyInView>
          </div>
        </div>
      </section>

      {/* Core Technologies Infinite Marquee Ribbon */}
      <div className="relative overflow-hidden py-4 border-y border-white/10 bg-black/40 backdrop-blur-md rounded-2xl -mx-2 sm:mx-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#07090e] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#07090e] to-transparent z-10" />
        <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
          {[...coreTechList, ...coreTechList].map((tech, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.07] transition-all shrink-0 cursor-default group"
            >
              <TechLogo name={tech.name} className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-xs text-white/85 font-medium tracking-wide">
                {tech.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 01.5: The 0 to 1 Journey Milestone Card
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
          SECTION 02.5: Engineering Impact & Capabilities Matrix
          ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-2">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-amber-400/30 transition-all group backdrop-blur-sm">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-amber-300 block tracking-tight group-hover:scale-105 transition-transform origin-left">
            {publishedProjects.length}+
          </span>
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider block mt-1.5">
            Live Applications Deployed
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-cyan-400/30 transition-all group backdrop-blur-sm">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-cyan-300 block tracking-tight group-hover:scale-105 transition-transform origin-left">
            {allSkillItems.length}+
          </span>
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider block mt-1.5">
            Technologies & Tools
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-emerald-400/30 transition-all group backdrop-blur-sm">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-300 block tracking-tight group-hover:scale-105 transition-transform origin-left">
            {certificates.length}
          </span>
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider block mt-1.5">
            Verified Accreditations
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-rose-400/30 transition-all group backdrop-blur-sm">
          <span className="font-mono text-3xl sm:text-4xl font-extrabold text-rose-300 block tracking-tight group-hover:scale-105 transition-transform origin-left">
            100%
          </span>
          <span className="text-xs font-mono text-white/50 uppercase tracking-wider block mt-1.5">
            Code Craft & Dedication
          </span>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03: Selected Flagship Engineering Builds
          ========================================================================= */}
      <section id="featured-projects" className="border-t hairline-border pt-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <ScrollWriteText
              as="p"
              className="font-mono text-[11px] uppercase tracking-widest text-amber-400/90 font-semibold"
              mode="scramble"
              scrambleDuration={20}
            >
              03 · FEATURED ENGINEERING
            </ScrollWriteText>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Selected <em className="italic font-serif text-[#e5b869]">Flagship Builds</em>
            </h2>
            <p className="text-stonewarm text-xs sm:text-sm max-w-xl">
              Production-grade full-stack architectures engineered with real-time sync, resilient databases, and responsive modern interfaces.
            </p>
          </div>

          <button
            type="button"
            onClick={() => goTo('/projects')}
            className="inline-flex items-center gap-2 self-start sm:self-end px-4 py-2 rounded-full border border-white/10 hover:border-amber-400/50 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-white transition-all group shrink-0"
            title="Explore all engineering projects"
          >
            <span>Explore all {publishedProjects.length} projects</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseProjects.map((proj, idx) => (
            <ProjectCard
              key={proj.id || `home-proj-${idx}`}
              proj={proj}
              indexNum={idx + 1}
              onCardMouseMove={handleCardMouseMove}
              onCardMouseLeave={handleCardMouseLeave}
            />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 05: Direct Contact CTA Banner
          ========================================================================= */}
      <section className="home-cta-banner rounded-3xl border border-white/10 bg-gradient-to-r from-[#121216] via-[#161622] to-[#121216] p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="space-y-4 max-w-2xl relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-400">
              {ui.homeBannerEyebrow || 'OPEN FOR OPPORTUNITIES'}
            </span>
          </div>

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
            {ui.homeBannerSubtext || "Available for software engineering roles, full-stack development, and high-impact engineering projects."}
          </ScrollWriteText>

          {/* Quick Contact Micro-Row */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-white/60">
            <span className="flex items-center gap-1.5 text-amber-300">
              <i className="fa-regular fa-clock" /> Usually responds within 24h
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-white/70">
              <i className="fa-solid fa-location-dot" /> Bhopal, India (Open to Remote / Relocation)
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0 relative z-10 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-5 py-3 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] text-xs font-mono text-white font-medium transition-all flex items-center justify-center gap-2 group cursor-pointer"
            title="Copy Ayush's email address"
          >
            <i className={`fa-regular ${copiedEmail ? 'fa-circle-check text-emerald-400' : 'fa-copy text-amber-300'}`} />
            <span>{copiedEmail ? 'Email Copied!' : 'Copy Email'}</span>
          </button>

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
  );
}

export default HomeBelowTheFold;
