import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { MarkdownView } from '../../components/common/MarkdownView';
import { BeforeAfterCompare } from '../../components/projects/BeforeAfterCompare';
import { ArchBlueprintViewer } from '../../components/projects/ArchBlueprintViewer';
import { getEnrichedCaseStudy } from '../../utils/projectCaseStudyData';
import { SEO } from '../../components/SEO';
import { projectSchema } from '../../utils/seo';
import { playTick } from '../../utils/audio';

// Reference baseline project demonstration for offline / fresh boot
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
  technologies: ['React JS', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS']
};

export function ProjectDetail() {
  const { slug } = useParams();
  const { appState, showToast } = usePortfolio();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
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

  // Handle active section tracking and reading progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Reading progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }

      // Section tracking with header offset
      const sections = [
        'section-overview',
        'section-problem',
        'section-approach',
        'section-tech',
        'section-results',
        'section-architecture',
        'section-learnings'
      ];
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

  // Smooth scroll with sticky header offset
  const scrollToSection = (e, sectionId) => {
    if (e) e.preventDefault();
    playTick();
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 150; // accounts for Header (80px) + sticky subnav (55px) + padding
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId.replace('section-', ''));
    }
  };

  // Copy case study link
  const handleCopyLink = () => {
    playTick();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    if (showToast) {
      showToast('Case study link copied to clipboard!', 'fa-check');
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const animatedSlugRef = useRef(null);

  // Safe GSAP entrance animation with clearProps to prevent stuck opacity
  useEffect(() => {
    if (loading || !project) return;
    if (animatedSlugRef.current === slug) return;
    animatedSlugRef.current = slug;

    const reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.case-study-hero',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'opacity,transform'
        }
      );

      gsap.fromTo(
        '.case-study-section',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'opacity,transform'
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, project, slug]);

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

  // Enrich case study data with realistic demonstration content if CMS fields are minimal or empty
  const caseStudy = getEnrichedCaseStudy(project);

  const techList = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
      ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  const metrics = caseStudy.result?.metrics || [];

  // Project navigation helpers for footer
  const allProjects = appState.projects || [];
  const currentIdx = allProjects.findIndex((p) => p.slug === project.slug || p.id === project.id);
  const prevProject = allProjects.length > 1
    ? allProjects[(currentIdx - 1 + allProjects.length) % allProjects.length]
    : null;
  const nextProject = allProjects.length > 1
    ? allProjects[(currentIdx + 1) % allProjects.length]
    : null;

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

      {/* 0. Top Glowing Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 z-50 transition-all duration-150 pointer-events-none"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
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
          <button
            type="button"
            onClick={handleCopyLink}
            className="font-mono text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
            title="Copy case study URL to clipboard"
          >
            <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-link text-cyan-400'} text-[10px]`} />
            <span>{copied ? 'Copied!' : 'Share Case Study'}</span>
          </button>
          <span className="case-study-badge">
            <i className="fa-solid fa-book-open" /> In-Depth Case Study
          </span>
          <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hidden sm:flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Production Ready
          </span>
        </div>
      </nav>

      {/* Floating Sticky Case Study Sub-Navigation */}
      <nav aria-label="Case Study Navigation" className="case-study-subnav flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => scrollToSection(e, 'section-overview')}
            className={activeSection === 'overview' ? 'active' : ''}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={(e) => scrollToSection(e, 'section-problem')}
            className={activeSection === 'problem' ? 'active' : ''}
          >
            01. Problem
          </button>
          <button
            type="button"
            onClick={(e) => scrollToSection(e, 'section-approach')}
            className={activeSection === 'approach' ? 'active' : ''}
          >
            02. Approach
          </button>
          <button
            type="button"
            onClick={(e) => scrollToSection(e, 'section-tech')}
            className={activeSection === 'tech' ? 'active' : ''}
          >
            03. Tech Decisions
          </button>
          <button
            type="button"
            onClick={(e) => scrollToSection(e, 'section-results')}
            className={activeSection === 'results' ? 'active' : ''}
          >
            04. Results & Metrics
          </button>
          <button
            type="button"
            onClick={(e) => scrollToSection(e, 'section-architecture')}
            className={activeSection === 'architecture' ? 'active' : ''}
          >
            05. Architecture
          </button>
          <button
            type="button"
            onClick={(e) => scrollToSection(e, 'section-learnings')}
            className={activeSection === 'learnings' ? 'active' : ''}
          >
            06. Learnings
          </button>
        </div>

        {project.liveDemoUrl && (
          <a
            href={project.liveDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playTick}
            className="font-mono text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 transition-all shrink-0 flex items-center gap-1 font-bold"
          >
            <span>Live Demo</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
          </a>
        )}
      </nav>

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

      {/* Case Study Sections */}
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

            {/* Problem Executive Challenge Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-slate-100 shadow-md flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <i className="fa-solid fa-bolt text-xs" />
              </div>
              <div>
                <span className="font-mono text-[11px] text-red-400 uppercase tracking-widest font-bold block mb-1">
                  Architectural Bottlenecks Under High-Volume Workloads:
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  Concurrency collisions on multi-tenant reservation dates, high-latency unindexed search queries, and non-atomic state validation across distributed sessions.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <MarkdownView content={caseStudy.problem} />
            </div>
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

            {/* Approach Execution Strategy Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-slate-100 shadow-md flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <i className="fa-solid fa-diagram-project text-xs" />
              </div>
              <div>
                <span className="font-mono text-[11px] text-cyan-400 uppercase tracking-widest font-bold block mb-1">
                  3-Phase Execution & Delivery Methodology:
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  System design structured across ACID transaction control, indexed multi-facet aggregation search, and optimistic client UX with resilient rollback states.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <MarkdownView content={caseStudy.approach} />
            </div>
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

            {/* Tech Rationale Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-100 shadow-md flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <i className="fa-solid fa-scale-balanced text-xs" />
              </div>
              <div>
                <span className="font-mono text-[11px] text-amber-400 uppercase tracking-widest font-bold block mb-1">
                  Engineering Trade-offs & Decisions:
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  Replica set session transactions prioritized over eventual consistency, lightweight native REST middleware over bloated monolithic dependencies.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <MarkdownView content={caseStudy.techDecisions} />
            </div>
          </section>
        )}

        {/* 5. RESULT & METRICS */}
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

          {/* Modular Interactive Before & After Visual Evolution */}
          <div className="pt-6 border-t border-white/10">
            <BeforeAfterCompare
              beforeImages={caseStudy.beforeScreenshots}
              afterImages={caseStudy.afterScreenshots}
              onImageClick={(url) => setLightboxImg(url)}
            />
          </div>
        </section>

        {/* 6. ARCHITECTURE BLUEPRINT & INTERACTIVE TIER EXPLORER */}
        <section id="section-architecture" className="case-study-section case-study-card space-y-6">
          <ArchBlueprintViewer
            diagramUrl={caseStudy.architectureDiagramUrl}
            technologies={techList}
            onExpandLightbox={(url) => setLightboxImg(url)}
          />
        </section>

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

            {/* Retrospective Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-slate-100 shadow-md flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <i className="fa-solid fa-graduation-cap text-xs" />
              </div>
              <div>
                <span className="font-mono text-[11px] text-indigo-400 uppercase tracking-widest font-bold block mb-1">
                  Key Retrospective Takeaway:
                </span>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  Atomic session transactions are completely non-negotiable for booking engines; optimistic client UI updates with resilient rollback mechanisms boost perceived responsiveness by 400%.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <MarkdownView content={caseStudy.learnings} />
            </div>
          </section>
        )}
      </div>

      {/* 8. BOTTOM CTA FOOTER WITH DUAL EXPLORATION (PREV & NEXT) NAVIGATION */}
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
          {prevProject && (
            <Link
              to={`/projects/${prevProject.slug || prevProject.id}`}
              onClick={playTick}
              className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-left" />
              <span>Prev: {prevProject.title.slice(0, 16)}...</span>
            </Link>
          )}
          {nextProject && (
            <Link
              to={`/projects/${nextProject.slug || nextProject.id}`}
              onClick={playTick}
              className="px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <span>Next: {nextProject.title.slice(0, 16)}...</span>
              <i className="fa-solid fa-arrow-right" />
            </Link>
          )}
          <Link
            to="/projects"
            onClick={playTick}
            className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono transition-all"
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
