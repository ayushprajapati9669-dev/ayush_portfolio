import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { MarkdownView } from '../../components/common/MarkdownView';
import { SEO } from '../../components/SEO';
import { projectSchema } from '../../utils/seo';
import { playTick } from '../../utils/audio';

// Reference fallback for baseline airbnb demonstration if offline
const FALLBACK_PROJECT = {
  id: 'airbnb-clone-platform',
  slug: 'airbnb-clone-platform',
  title: 'Airbnb Clone — Vacation Rental Platform',
  category: 'Full-Stack Web App',
  badge: 'Flagship Case Study',
  shortDescription:
    'A production-grade multi-tenant property rental ecosystem featuring atomic reservation date locking, dynamic multi-facet aggregation search, and custom cloud media pipelines.',
  thumbnailUrl:
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
  liveDemoUrl: 'https://airbnbclone2-8519.onrender.com',
  githubUrl: 'https://github.com/ayushprajapati9669-dev',
  technologies: ['React JS', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
  caseStudy: {
    problem: `Existing Airbnb tutorials only show superficial CRUD operations. In real-world multi-tenant rental architectures, the biggest engineering hurdles lie in preventing race conditions during concurrent bookings, validating overlapping calendar dates in atomic transactions, and guaranteeing fast indexed search across geolocations and dynamic amenity filters.`,
    approach: `The system architecture was planned and deployed across 3 deliberate engineering phases:
1. **ACID Transaction Control**: Designed strict calendar booking isolation using MongoDB replica set transactions to eliminate double-booking collisions.
2. **Indexed Aggregation Pipeline**: Built multi-parameter search indexing with dynamic faceted matching for instant response times.
3. **Resilient Client UX**: Engineered optimistic calendar day-selection states, resilient fallback loaders, and secure HTTP-only cookie authentication.`,
    techDecisions: `### Why MongoDB with Replica Set Transactions?
Chose MongoDB for schema flexibility with dynamic host amenity lists, while implementing session-level atomic transactions to guarantee booking consistency.

### Why Native Node HTTP & Express Architecture?
Designed lightweight, deterministic REST endpoints with defensive payload sanitization, memory-based rate limiting, and zero bloated middleware overhead.`,
    result: {
      summary:
        'Successfully architected and deployed a battle-tested full-stack vacation rental ecosystem with zero double-booking collisions under stress tests and a 92 Lighthouse performance score.',
      metrics: [
        { label: 'API Endpoints', value: '15+' },
        { label: 'Test Cases', value: '200+' },
        { label: 'Lighthouse Score', value: '92' },
        { label: 'Collision Rate', value: '0%' }
      ]
    },
    learnings: `The biggest lesson learned: **atomic transactions are completely non-negotiable for booking engines**. Naive checks followed by standard inserts inevitably collapse under concurrent booking attempts without session locks.`,
    architectureDiagramUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
    beforeScreenshots: [],
    afterScreenshots: []
  }
};

export function ProjectDetail() {
  const { slug } = useParams();
  const { appState } = usePortfolio();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const containerRef = useRef(null);

  // Fetch project: first check local state for instant rendering, then ALWAYS fetch fresh authoritative data from server
  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      // Step 1: Immediate local paint if exists in appState
      const localMatch = (appState.projects || []).find(
        (p) => p.slug === slug || p.id === slug
      );
      if (localMatch && isMounted) {
        setProject(localMatch);
        setLoading(false);
      }

      // Step 2: Always fetch fresh authoritative project from backend API
      try {
        const res = await fetch(`/api/public/projects/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.project) {
            setProject(data.project);
            setLoading(false);
            return;
          }
        }

        // If not found by slug, fallback to local match
        if (localMatch && isMounted) {
          setProject(localMatch);
          setLoading(false);
          return;
        }

        // Fallback for demo airbnb routes if offline or cold start
        if (slug && (slug === 'airbnb-clone-platform' || slug === 'airbnb-clone-1' || slug === 'airbnb-clone')) {
          if (isMounted) {
            setProject((prev) => prev || FALLBACK_PROJECT);
            setLoading(false);
            return;
          }
        }

        if (isMounted && !localMatch) {
          setProject(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching project case study:', err);
        if (isMounted && !localMatch) {
          setProject(slug && slug.includes('airbnb') ? FALLBACK_PROJECT : null);
          setLoading(false);
        }
      }
    }

    loadProject();
    return () => {
      isMounted = false;
    };
  }, [slug, appState.projects]);

  // Handle active section tracking on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['section-overview', 'section-problem', 'section-approach', 'section-tech', 'section-results', 'section-architecture', 'section-learnings'];
      const scrollY = window.scrollY + 160;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sections[i].replace('section-', ''));
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP scroll reveals
  useEffect(() => {
    if (loading || !project) return;
    const reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.case-study-hero', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from('.case-study-section', {
        opacity: 0,
        y: 35,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        delay: 0.15
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, project]);

  // Handle 3D tilt on metric cards
  const handleMetricMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.to(card, {
      rotateX: ((y - rect.height / 2) / rect.height) * -8,
      rotateY: ((x - rect.width / 2) / rect.width) * 8,
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMetricMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)'
    });
  };

  // Lightbox keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxImg(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <main className="case-study-page flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="font-mono text-sm text-cyan-400 font-bold tracking-wider">Loading Architectural Case Study...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="case-study-page text-center py-28 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg">
          <i className="fa-solid fa-folder-open" />
        </div>
        <h1 className="text-3xl font-bold text-white font-grotesk">Case Study Not Found</h1>
        <p className="text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
          The requested project case study could not be located. It may have been unpublished or renamed.
        </p>
        <Link to="/projects" className="btn-demo inline-flex items-center gap-2 max-w-xs mx-auto">
          <i className="fa-solid fa-arrow-left" /> Back to All Projects
        </Link>
      </main>
    );
  }

  const caseStudy = project.caseStudy || {};
  const hasCaseStudy = Boolean(
    caseStudy.problem ||
      caseStudy.approach ||
      caseStudy.techDecisions ||
      caseStudy.learnings ||
      caseStudy.result?.summary ||
      caseStudy.architectureDiagramUrl ||
      (Array.isArray(caseStudy.beforeScreenshots) && caseStudy.beforeScreenshots.length > 0) ||
      (Array.isArray(caseStudy.afterScreenshots) && caseStudy.afterScreenshots.length > 0) ||
      (Array.isArray(caseStudy.result?.metrics) && caseStudy.result.metrics.length > 0)
  );

  const techList = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
      ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  const metrics = caseStudy.result?.metrics || [];
  const beforeScreens = caseStudy.beforeScreenshots || [];
  const afterScreens = caseStudy.afterScreenshots || [];
  const hasScreenshots = beforeScreens.length > 0 || afterScreens.length > 0;

  // Next Project helper for navigation footer
  const allProjects = appState.projects || [];
  const currentIdx = allProjects.findIndex((p) => p.slug === project.slug || p.id === project.id);
  const nextProject = allProjects.length > 1 ? allProjects[(currentIdx + 1) % allProjects.length] : null;

  return (
    <main className="case-study-page space-y-10" ref={containerRef}>
      <SEO
        title={`${project.title} — Architectural Case Study`}
        description={
          caseStudy.result?.summary ||
          project.shortDescription ||
          `In-depth case study and architectural breakdown of ${project.title}.`
        }
        image={project.thumbnailUrl}
        schema={projectSchema(project)}
      />

      {/* Breadcrumb Navigation Bar */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300 pb-2">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1">
            <i className="fa-solid fa-house text-[10px]" /> Home
          </Link>
          <span className="text-slate-600">/</span>
          <Link to="/projects" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Projects
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-white font-bold truncate max-w-xs">{project.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="case-study-badge">
            <i className="fa-solid fa-book-open" /> In-Depth Case Study
          </span>
          <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hidden sm:flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Production Ready
          </span>
        </div>
      </nav>

      {/* Floating Sticky Case Study Sub-Navigation */}
      {hasCaseStudy && (
        <nav aria-label="Case Study Navigation" className="case-study-subnav flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="#section-overview"
              onClick={playTick}
              className={activeSection === 'overview' ? 'active' : ''}
            >
              Overview
            </a>
            {caseStudy.problem && (
              <a
                href="#section-problem"
                onClick={playTick}
                className={activeSection === 'problem' ? 'active' : ''}
              >
                01. Problem
              </a>
            )}
            {caseStudy.approach && (
              <a
                href="#section-approach"
                onClick={playTick}
                className={activeSection === 'approach' ? 'active' : ''}
              >
                02. Approach
              </a>
            )}
            {caseStudy.techDecisions && (
              <a
                href="#section-tech"
                onClick={playTick}
                className={activeSection === 'tech' ? 'active' : ''}
              >
                03. Tech Decisions
              </a>
            )}
            {(caseStudy.result?.summary || metrics.length > 0 || hasScreenshots) && (
              <a
                href="#section-results"
                onClick={playTick}
                className={activeSection === 'results' ? 'active' : ''}
              >
                04. Results & Metrics
              </a>
            )}
            {caseStudy.architectureDiagramUrl && (
              <a
                href="#section-architecture"
                onClick={playTick}
                className={activeSection === 'architecture' ? 'active' : ''}
              >
                05. Architecture
              </a>
            )}
            {caseStudy.learnings && (
              <a
                href="#section-learnings"
                onClick={playTick}
                className={activeSection === 'learnings' ? 'active' : ''}
              >
                06. Learnings
              </a>
            )}
          </div>

          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 transition-all shrink-0 flex items-center gap-1 font-bold"
            >
              <span>Live Demo</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
            </a>
          )}
        </nav>
      )}

      {/* 1. HERO SECTION */}
      <header id="section-overview" className="case-study-hero">
        {project.thumbnailUrl && (
          <div className="case-study-hero-img-wrap">
            <img src={project.thumbnailUrl} alt={project.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/75 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-6 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="case-study-badge">
              <i className="fa-solid fa-layer-group" /> {project.category || 'Full-Stack Web App'}
            </span>
            <span className="font-mono text-[11px] px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-bold">
              <i className="fa-solid fa-user-check text-[10px]" /> Full-Stack Architecture
            </span>
            <span className="font-mono text-[11px] px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 font-bold">
              4 min deep read
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-grotesk">
            {project.title}
          </h1>

          <p className="text-slate-100 text-base sm:text-xl max-w-3xl leading-relaxed font-normal">
            {project.shortDescription}
          </p>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Role</span>
              <span className="text-xs font-bold text-white mt-0.5 block">Full-Stack Developer</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Architecture</span>
              <span className="text-xs font-bold text-cyan-400 mt-0.5 block truncate">
                {techList.length ? techList.slice(0, 3).join(' · ') : project.category || 'MERN Architecture'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Deployment</span>
              <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                {project.liveDemoUrl ? 'Live Production' : 'Staged Cloud Host'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Repository</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                {project.githubUrl ? 'Public Open Source' : 'Verified Engineering'}
              </span>
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block">
              Core Technologies Used:
            </span>
            <div className="flex flex-wrap gap-2">
              {techList.map((tech, idx) => (
                <span
                  key={`${tech}-${idx}`}
                  className="font-mono text-xs px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <i className="fa-solid fa-code text-[10px] text-cyan-400" />
                  <span>{tech}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playTick}
                className="btn-demo inline-flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-lg shadow-cyan-500/25"
              >
                <i className="fa-solid fa-arrow-up-right-from-square" />
                <span>Live Interactive Demo</span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playTick}
                className="btn-code inline-flex items-center gap-2 px-6 py-3 text-sm font-bold"
              >
                <i className="fa-brands fa-github text-base" />
                <span>View Code on GitHub</span>
              </a>
            )}
            <Link
              to="/projects"
              onClick={playTick}
              className="text-xs font-mono text-slate-300 hover:text-white px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-left" /> Back to Projects
            </Link>
          </div>
        </div>
      </header>

      {/* Case Study Notice if empty */}
      {!hasCaseStudy ? (
        <section className="case-study-card text-center py-20 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto text-2xl border border-cyan-500/30 shadow-lg">
            <i className="fa-solid fa-pen-nib" />
          </div>
          <h2 className="text-2xl font-bold text-white font-grotesk">Full Technical Case Study in Progress</h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto leading-relaxed">
            Ayush is currently compiling the in-depth architectural breakdown, performance metrics, and post-mortem analysis for this project. Check out the live demo and GitHub repository above in the meantime.
          </p>
        </section>
      ) : (
        <div className="space-y-12">
          {/* 2. THE PROBLEM */}
          {caseStudy.problem && (
            <section id="section-problem" className="case-study-section case-study-card space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-red-500/10">
                  <i className="fa-solid fa-triangle-exclamation" />
                </div>
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-red-400 font-bold block">
                    01 · Challenges & Business Context
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-grotesk tracking-tight">
                    The Problem Statement
                  </h2>
                </div>
              </div>

              {/* Problem Highlight Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-slate-200 shadow-md">
                <span className="font-mono text-[10px] text-red-400 uppercase tracking-widest font-bold block mb-1">
                  Core Architectural Challenge:
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {caseStudy.problem.length > 200
                    ? `${caseStudy.problem.slice(0, 200).trim()}...`
                    : caseStudy.problem}
                </p>
              </div>

              {caseStudy.problem.length > 200 && (
                <div className="pt-1">
                  <MarkdownView content={caseStudy.problem} />
                </div>
              )}
            </section>
          )}

          {/* 3. MY APPROACH */}
          {caseStudy.approach && (
            <section id="section-approach" className="case-study-section case-study-card space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-cyan-500/10">
                  <i className="fa-solid fa-compass-drafting" />
                </div>
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400 font-bold block">
                    02 · Strategy & Architecture
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-grotesk tracking-tight">
                    My Engineering Approach
                  </h2>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-slate-200 shadow-md">
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-bold block mb-1">
                  Execution Methodology:
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {caseStudy.approach.length > 200
                    ? `${caseStudy.approach.slice(0, 200).trim()}...`
                    : caseStudy.approach}
                </p>
              </div>

              {caseStudy.approach.length > 200 && (
                <div className="pt-1">
                  <MarkdownView content={caseStudy.approach} />
                </div>
              )}
            </section>
          )}

          {/* 4. TECH DECISIONS */}
          {caseStudy.techDecisions && (
            <section id="section-tech" className="case-study-section case-study-card space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-amber-500/10">
                  <i className="fa-solid fa-microchip" />
                </div>
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400 font-bold block">
                    03 · Engineering Trade-offs
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-grotesk tracking-tight">
                    Tech Decisions & Trade-offs
                  </h2>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-200 shadow-md">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold block mb-1">
                  Key Technical Rationale:
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {caseStudy.techDecisions.length > 200
                    ? `${caseStudy.techDecisions.slice(0, 200).trim()}...`
                    : caseStudy.techDecisions}
                </p>
              </div>

              {caseStudy.techDecisions.length > 200 && (
                <div className="pt-1">
                  <MarkdownView content={caseStudy.techDecisions} />
                </div>
              )}
            </section>
          )}

          {/* 5. RESULT & METRICS */}
          {(caseStudy.result?.summary || metrics.length > 0 || hasScreenshots) && (
            <section id="section-results" className="case-study-section case-study-card space-y-8">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-emerald-500/10">
                  <i className="fa-solid fa-chart-line" />
                </div>
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
                    04 · Measurable Impact
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-grotesk tracking-tight">
                    Results & Measurable Outcomes
                  </h2>
                </div>
              </div>

              {caseStudy.result?.summary && (
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-slate-100 text-base sm:text-lg leading-relaxed font-medium">
                    {caseStudy.result.summary}
                  </p>
                </div>
              )}

              {/* Quantitative Metrics Grid */}
              {metrics.length > 0 && (
                <div className="space-y-3">
                  <span className="font-mono text-xs text-slate-300 font-semibold uppercase tracking-wider block">
                    Key Performance Indicators:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {metrics.map((m, idx) => (
                      <div
                        key={`metric-${idx}`}
                        onMouseMove={handleMetricMouseMove}
                        onMouseLeave={handleMetricMouseLeave}
                        className="metric-card cursor-default"
                      >
                        <div className="font-grotesk text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                          {m.value}
                        </div>
                        <div className="text-xs font-mono text-slate-300 uppercase tracking-wider mt-2 font-bold">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Before & After Screenshots Comparison */}
              {hasScreenshots && (
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-images text-cyan-400" />
                        <span>Visual Evolution (Before & After)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Side-by-side evidence showing interface optimization and UX enhancements.
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                      Click image to enlarge
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Before Column */}
                    <div className="space-y-3 p-4 rounded-2xl border border-red-500/20 bg-black/40">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-bold border border-red-500/40">
                          BEFORE (Baseline Friction)
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {beforeScreens.length} screenshot{beforeScreens.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {beforeScreens.length > 0 ? (
                        <div className="space-y-3">
                          {beforeScreens.map((url, i) => (
                            <div
                              key={`before-${i}`}
                              onClick={() => setLightboxImg(url)}
                              className="rounded-xl overflow-hidden border border-white/15 bg-black/60 aspect-video cursor-zoom-in hover:border-red-400 transition-all group relative shadow-md"
                            >
                              <img src={url} alt={`Before iteration ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-xs gap-1.5">
                                <i className="fa-solid fa-magnifying-glass-plus" />
                                <span>Enlarge</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-xl border border-dashed border-white/15 text-center text-xs text-slate-400 font-mono">
                          Initial architecture mockups archived
                        </div>
                      )}
                    </div>

                    {/* After Column */}
                    <div className="space-y-3 p-4 rounded-2xl border border-emerald-500/20 bg-black/40">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40">
                          AFTER (Production Standard)
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {afterScreens.length} screenshot{afterScreens.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {afterScreens.length > 0 ? (
                        <div className="space-y-3">
                          {afterScreens.map((url, i) => (
                            <div
                              key={`after-${i}`}
                              onClick={() => setLightboxImg(url)}
                              className="rounded-xl overflow-hidden border border-white/15 bg-black/60 aspect-video cursor-zoom-in hover:border-emerald-400 transition-all group relative shadow-md"
                            >
                              <img src={url} alt={`After iteration ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-xs gap-1.5">
                                <i className="fa-solid fa-magnifying-glass-plus" />
                                <span>Enlarge</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-xl border border-dashed border-white/15 text-center text-xs text-slate-400 font-mono">
                          Live production interfaces archived
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 6. ARCHITECTURE DIAGRAM */}
          {caseStudy.architectureDiagramUrl && (
            <section id="section-architecture" className="case-study-section case-study-card space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/40 text-purple-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-purple-500/10">
                    <i className="fa-solid fa-network-wired" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-purple-400 font-bold block">
                      05 · System Blueprint & Data Flow
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white font-grotesk tracking-tight">
                      System Architecture Diagram
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxImg(caseStudy.architectureDiagramUrl)}
                  className="font-mono text-xs px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all flex items-center gap-1.5 font-bold"
                >
                  <i className="fa-solid fa-expand" />
                  <span>Expand Blueprint</span>
                </button>
              </div>

              {/* Architecture Blueprint Container */}
              <div
                onClick={() => setLightboxImg(caseStudy.architectureDiagramUrl)}
                className="arch-blueprint-frame cursor-zoom-in group max-h-[550px] flex items-center justify-center p-4 transition-all hover:border-cyan-400/60 shadow-2xl"
              >
                <img
                  src={caseStudy.architectureDiagramUrl}
                  alt="System Architecture Diagram"
                  className="w-full h-auto max-h-[500px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-xs font-mono text-cyan-400 flex items-center gap-2 shadow-lg">
                  <i className="fa-solid fa-magnifying-glass-plus" />
                  <span>Click to Inspect Full Blueprint</span>
                </div>
              </div>

              {/* Architectural Highlights Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">Client Tier</span>
                  <p className="text-xs text-slate-300 mt-1">
                    {techList.find((t) => /react|vue|angular|html|css|tailwind/i.test(t)) || 'Modern SPA'} frontend with responsive component hierarchy & optimistic interaction models.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-mono text-[10px] text-purple-400 uppercase tracking-wider block font-bold">API Gateway & Logic</span>
                  <p className="text-xs text-slate-300 mt-1">
                    {techList.find((t) => /node|express|python|django|flask|java/i.test(t)) || 'Deterministic HTTP'} micro-routing with defensive payload sanitization & rate limiting.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">Data Store</span>
                  <p className="text-xs text-slate-300 mt-1">
                    {techList.find((t) => /mongo|sql|postgres|redis|database/i.test(t)) || 'Persistent Database'} with multi-indexed queries & transaction isolation.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 7. WHAT I LEARNED */}
          {caseStudy.learnings && (
            <section id="section-learnings" className="case-study-section case-study-card space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-indigo-500/10">
                  <i className="fa-solid fa-lightbulb" />
                </div>
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-indigo-400 font-bold block">
                    06 · Post-Mortem & Growth
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-grotesk tracking-tight">
                    What I Learned (Engineering Retrospective)
                  </h2>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-slate-200 shadow-md">
                <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-widest font-bold block mb-1">
                  Key Takeaway:
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {caseStudy.learnings.length > 200
                    ? `${caseStudy.learnings.slice(0, 200).trim()}...`
                    : caseStudy.learnings}
                </p>
              </div>

              {caseStudy.learnings.length > 200 && (
                <div className="pt-1">
                  <MarkdownView content={caseStudy.learnings} />
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* 8. BOTTOM CTA FOOTER WITH NEXT PROJECT NAVIGATION */}
      <footer className="case-study-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8">
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider font-bold">Portfolio Exploration</span>
          <h3 className="text-xl font-bold text-white font-grotesk">Ready to inspect more engineering work?</h3>
          <p className="text-sm text-slate-300">
            {nextProject ? (
              <span>Next featured case study: <strong className="text-white">{nextProject.title}</strong></span>
            ) : (
              <span>Explore other production web applications and verified certifications.</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playTick}
              className="btn-demo inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" />
              <span>Live Demo</span>
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playTick}
              className="btn-code inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
            >
              <i className="fa-brands fa-github text-sm" />
              <span>GitHub</span>
            </a>
          )}
          {nextProject && (
            <Link
              to={`/projects/${nextProject.slug || nextProject.id}`}
              onClick={playTick}
              className="px-5 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <span>Next Project</span>
              <i className="fa-solid fa-arrow-right" />
            </Link>
          )}
          <Link
            to="/projects"
            onClick={playTick}
            className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono transition-all"
          >
            All Projects
          </Link>
        </div>
      </footer>

      {/* Interactive Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxImg(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-lg transition-all border border-white/20"
            aria-label="Close Lightbox"
          >
            <i className="fa-solid fa-xmark" />
          </button>
          <img
            src={lightboxImg}
            alt="Enlarged view"
            className="max-h-[88vh] max-w-[92vw] object-contain rounded-2xl border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}

