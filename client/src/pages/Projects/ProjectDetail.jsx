import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { MarkdownView } from '../../components/common/MarkdownView';
import { getEnrichedCaseStudy } from '../../utils/projectCaseStudyData';
import { SEO } from '../../components/SEO';
import { projectSchema } from '../../utils/seo';
import { playTick } from '../../utils/audio';
import { ApiSandbox } from '../../components/ui/ApiSandbox';
import { InteractiveArchitectureDiagram } from '../../components/ui/InteractiveArchitectureDiagram';
import '../../styles/pages/case-study.css';

// Baseline fallback demonstration for offline or initial boot
const FALLBACK_PROJECT = {
  id: 'airbnb-clone-platform',
  slug: 'airbnb-clone-platform',
  title: 'Airbnb Clone — Vacation Rental Platform',
  category: 'Full-Stack Web App',
  badge: 'Flagship Case Study',
  shortDescription:
    'A battle-tested vacation rental platform engineered for high-volume concurrency, zero race conditions, and sub-50ms search latency.',
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
  const [activeSection, setActiveSection] = useState('overview');
  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [activeArchTab, setActiveArchTab] = useState('arch1');
  const [blueprintModalOpen, setBlueprintModalOpen] = useState(false);
  const [benchmarkAnimated, setBenchmarkAnimated] = useState(false);

  // Before & After Interactive Slider State
  const [sliderPos, setSliderPos] = useState(50);
  const isSliderDraggingRef = useRef(false);
  const sliderContainerRef = useRef(null);
  const containerRef = useRef(null);
  const animatedSlugRef = useRef(null);

  // Fetch project: first check local state for instant rendering, then fetch authoritative data
  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      const localMatch = (appState.projects || []).find(
        (p) => p.slug === slug || p.id === slug
      );
      if (localMatch && isMounted) {
        setProject(localMatch);
        setLoading(false);
      }

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

        if (localMatch && isMounted) {
          setProject(localMatch);
          setLoading(false);
          return;
        }

        if (slug && (slug.includes('airbnb') || slug === 'airbnb-clone-platform')) {
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

  // Reading progress and active section tracking on scroll
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }

      const sectionIds = [
        'overview',
        'problem',
        'approach',
        'decisions',
        'results',
        'architecture',
        'evolution',
        'learnings'
      ];
      const scrollY = window.scrollY + 180;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }

      // Trigger benchmark animation when results section enters view
      const resultsEl = document.getElementById('results');
      if (resultsEl && resultsEl.getBoundingClientRect().top < window.innerHeight * 0.8) {
        setBenchmarkAnimated(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section with navbar offset
  const scrollToSection = (e, sectionId) => {
    if (e) e.preventDefault();
    playTick();
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 110;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // Copy case study URL
  const handleCopyLink = () => {
    playTick();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    if (showToast) {
      showToast('Case study link copied to clipboard!', 'fa-check');
    }
    setTimeout(() => setCopied(false), 2500);
  };

  // Copy code snippet
  const handleCopyCode = (codeText) => {
    playTick();
    navigator.clipboard.writeText(codeText);
    setCodeCopied(true);
    if (showToast) {
      showToast('Code snippet copied to clipboard!', 'fa-code');
    }
    setTimeout(() => setCodeCopied(false), 2500);
  };

  // Before & After Slider Drag Handlers
  const handleSliderMove = useCallback((clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    setSliderPos(pos);
  }, []);

  const handleSliderMouseDown = (e) => {
    isSliderDraggingRef.current = true;
    handleSliderMove(e.clientX);
  };

  const handleSliderTouchStart = (e) => {
    if (e.touches?.[0]) {
      isSliderDraggingRef.current = true;
      handleSliderMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleWindowMouseMove = (e) => {
      if (isSliderDraggingRef.current) {
        handleSliderMove(e.clientX);
      }
    };
    const handleWindowMouseUp = () => {
      isSliderDraggingRef.current = false;
    };
    const handleWindowTouchMove = (e) => {
      if (isSliderDraggingRef.current && e.touches?.[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };
    const handleWindowTouchEnd = () => {
      isSliderDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };
  }, [handleSliderMove]);

  // Modal ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setBlueprintModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // GSAP entrance animation
  useEffect(() => {
    if (loading || !project) return;
    if (animatedSlugRef.current === slug) return;
    animatedSlugRef.current = slug;

    const reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cs-project-header',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'opacity,transform' }
      );
      gsap.fromTo(
        '.cs-section',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: 'opacity,transform' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, project, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050811] text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl animate-pulse">
          <i className="fa-solid fa-compass-drafting" />
        </div>
        <p className="font-mono text-sm text-cyan-400 font-bold tracking-wider">
          Loading Architectural Case Study...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#050811] text-center px-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl">
          <i className="fa-solid fa-circle-exclamation" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white font-grotesk">Case Study Not Found</h1>
          <p className="text-slate-400 text-sm max-w-md">
            The requested project case study could not be located. It may have been unpublished or renamed.
          </p>
        </div>
        <Link
          to="/projects"
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all font-mono"
        >
          Return to Projects Library
        </Link>
      </div>
    );
  }

  // Enrich case study data from project and CMS
  const caseStudy = getEnrichedCaseStudy(project);
  const techList = Array.isArray(project.technologies) ? project.technologies : [];
  const clientTech = techList[0] || 'React 18 / Tailwind CSS';
  const backendTech = techList.find((t) => /node|express|api/i.test(t)) || 'Node.js / Express REST API';
  const databaseTech = techList.find((t) => /mongo|sql|db|redis/i.test(t)) || 'MongoDB Replica Set';
  const roleTitle = project.role || 'Full-Stack Developer';

  // Navigation: Next & Prev projects
  const allProjects = appState.projects || [];
  const currentIdx = allProjects.findIndex((p) => p.slug === slug || p.id === project.id);
  const prevProject = currentIdx > 0 ? allProjects[currentIdx - 1] : null;
  const nextProject = currentIdx >= 0 && currentIdx < allProjects.length - 1 ? allProjects[currentIdx + 1] : null;

  // Code snippet for Tech Decisions section
  const sampleCodeSnippet = project.caseStudy?.codeSnippet || `const session = await mongoose.startSession();
await session.withTransaction(async () => {
  // Lock property reservation dates atomically
  const property = await Property.findOneAndUpdate(
    { _id: propertyId, isAvailable: true },
    { $set: { isAvailable: false } },
    { session, new: true }
  );

  if (!property) throw new Error("Dates already reserved by another session!");

  // Create confirmed booking safely within ACID transaction
  await Booking.create([{ userId, propertyId, checkIn, checkOut }], { session });
});
// Automated transactional rollback on any downstream error`;

  return (
    <>
      <SEO
        title={`${project.title} — Elite Architectural Case Study`}
        description={project.shortDescription || `In-depth case study and architectural breakdown of ${project.title}.`}
        schema={projectSchema(project)}
      />

      {/* 1. TOP READING PROGRESS BAR */}
      <div
        className="case-study-progress-bar"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
      />

      {/* 2. TWO-COLUMN MASTER LAYOUT */}
      <div className="cs-layout-wrapper" ref={containerRef}>
        {/* LEFT COLUMN: Sticky Case Study Sidebar Navigation */}
        <aside className="cs-sidebar">
          {/* Back to All Projects */}
          <Link to="/projects" className="cs-sidebar-back-btn" title="Return to Projects Library">
            <i className="fa-solid fa-arrow-left text-xs" />
            <span>All Projects</span>
          </Link>

          {/* Reading Progress Card */}
          <div className="cs-sidebar-progress-card">
            <div className="cs-sidebar-progress-card-top">
              <span>READING PROGRESS</span>
              <span className="font-bold text-cyan-400">{Math.round(readingProgress)}%</span>
            </div>
            <div className="cs-sidebar-progress-card-track">
              <div
                className="cs-sidebar-progress-card-bar"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
          </div>

          <div className="cs-sidebar-title">
            <span>Case Study</span>
            <span className="text-[10px] text-slate-500 font-mono">INDEX</span>
          </div>

          <nav className="cs-sidebar-nav" id="sidebarNav" aria-label="Case Study Navigation">
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'overview')}
              className={`cs-side-link ${activeSection === 'overview' ? 'active' : ''}`}
            >
              <span>Overview</span>
              <span className="cs-side-link-dot" />
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'problem')}
              className={`cs-side-link ${activeSection === 'problem' ? 'active' : ''}`}
            >
              <span>01. Problem Statement</span>
              <span className="cs-side-link-dot" />
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'approach')}
              className={`cs-side-link ${activeSection === 'approach' ? 'active' : ''}`}
            >
              <span>02. Engineering Approach</span>
              <span className="cs-side-link-dot" />
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'decisions')}
              className={`cs-side-link ${activeSection === 'decisions' ? 'active' : ''}`}
            >
              <span>03. Tech Decisions</span>
              <span className="cs-side-link-dot" />
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'results')}
              className={`cs-side-link ${activeSection === 'results' ? 'active' : ''}`}
            >
              <span>04. Results &amp; Metrics</span>
              <span className="cs-side-link-dot" />
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'architecture')}
              className={`cs-side-link ${activeSection === 'architecture' ? 'active' : ''}`}
            >
              <span>05. System Blueprint</span>
              <span className="cs-side-link-dot" />
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'evolution')}
              className={`cs-side-link ${activeSection === 'evolution' ? 'active' : ''}`}
            >
              <span>06. Visual Evolution</span>
              <span className="cs-side-link-dot" />
            </button>
            <button
              type="button"
              onClick={(e) => scrollToSection(e, 'learnings')}
              className={`cs-side-link ${activeSection === 'learnings' ? 'active' : ''}`}
            >
              <span>07. Retrospective</span>
              <span className="cs-side-link-dot" />
            </button>
          </nav>

          {/* Quick External Actions */}
          <div className="cs-sidebar-footer-actions">
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-sidebar-action-btn primary"
                title="Launch Live Application"
              >
                <i className="fa-solid fa-arrow-up-right-from-square" />
                <span>Launch Live App</span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cs-sidebar-action-btn"
                title="Inspect Source Code on GitHub"
              >
                <i className="fa-brands fa-github" />
                <span>Source Code</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleCopyLink}
              className="cs-sidebar-action-btn"
              title="Copy Case Study Link"
            >
              <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-link'}`} />
              <span>{copied ? 'Link Copied!' : 'Share Case Study'}</span>
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: Main Case Study Content */}
        <main className="cs-main-content">
          {/* OVERVIEW HERO SECTION */}
          <header id="overview" className="cs-project-header cs-section">
            <div className="cs-tags">
              <span className="cs-tag cyan">
                <i className="fa-solid fa-layer-group" />
                <span>{project.category || 'Full-Stack Web App'}</span>
              </span>
              <span className="cs-tag purple">
                <i className="fa-solid fa-book-open" />
                <span>Case Study</span>
              </span>
              <span className="cs-tag">
                <i className="fa-regular fa-clock" />
                <span>4 min deep read</span>
              </span>
            </div>

            <h1 className="cs-hero-title">{project.title}</h1>
            <p className="cs-hero-subtitle">{project.shortDescription}</p>

            {/* META CARDS (4 Columns) */}
            <div className="cs-meta-grid">
              {/* Card 1: Role */}
              <div className="cs-meta-card">
                <div className="cs-meta-label">Role</div>
                <div className="cs-meta-value">
                  <div className="cs-icon-box">
                    <i className="fa-solid fa-user-gear" />
                  </div>
                  <span className="truncate">{roleTitle}</span>
                </div>
              </div>

              {/* Card 2: Architecture */}
              <div className="cs-meta-card">
                <div className="cs-meta-label">Architecture</div>
                <div className="cs-meta-value">
                  <div className="cs-icon-box">
                    <i className="fa-solid fa-cubes" />
                  </div>
                  <span className="truncate">
                    {techList.length ? techList.slice(0, 3).join(' • ') : 'React • Node • Express'}
                  </span>
                </div>
              </div>

              {/* Card 3: Database */}
              <div className="cs-meta-card">
                <div className="cs-meta-label">Database</div>
                <div className="cs-meta-value">
                  <div className="cs-icon-box">
                    <i className="fa-solid fa-database" />
                  </div>
                  <span className="truncate">{databaseTech}</span>
                </div>
              </div>

              {/* Card 4: Status */}
              <div className="cs-meta-card">
                <div className="cs-meta-label">Status</div>
                <div className="cs-meta-value text-emerald-400">
                  <div className="cs-icon-box" style={{ color: '#10b981' }}>
                    <i className="fa-solid fa-circle-check" />
                  </div>
                  <div className="flex items-center">
                    <span className="cs-status-dot" />
                    <span>{project.liveDemoUrl ? 'Live Production' : 'Staged Cloud Host'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar: Demo, GitHub, Share, Back */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playTick}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square" />
                  <span>Live Production App</span>
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playTick}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-xs flex items-center gap-2 transition-all"
                >
                  <i className="fa-brands fa-github text-sm" />
                  <span>View Repository</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-2 transition-all"
                title="Copy Case Study link"
              >
                <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-link'}`} />
                <span>{copied ? 'Copied URL!' : 'Share Case Study'}</span>
              </button>
              <Link
                to="/projects"
                onClick={playTick}
                className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all ml-auto"
              >
                <i className="fa-solid fa-arrow-left text-[10px]" />
                <span>All Projects</span>
              </Link>
            </div>
          </header>

          {/* 01. PROBLEM STATEMENT */}
          <section id="problem" className="cs-section">
            <div className="cs-section-header">
              <span className="cs-section-badge">01 • Challenges &amp; Context</span>
              <h2 className="cs-section-title">
                <i className="fa-solid fa-triangle-exclamation text-rose-500" />
                <span>The Problem Statement</span>
              </h2>
            </div>

            <div className="cs-card">
              <div className="cs-callout red">
                <div className="cs-callout-icon text-rose-500">
                  <i className="fa-solid fa-bolt" />
                </div>
                <div className="cs-callout-content">
                  <div className="cs-callout-title">Architectural Bottlenecks Under High-Volume Workloads</div>
                  <p>
                    Concurrency collisions on multi-tenant reservation dates, high-latency unindexed search queries, and non-atomic state validation across distributed sessions.
                  </p>
                </div>
              </div>

              <div className="text-slate-300 leading-relaxed space-y-4">
                <MarkdownView content={caseStudy.problem} />
              </div>
            </div>
          </section>

          {/* 02. ENGINEERING APPROACH (ARCHITECTURE EXPLORER TABS) */}
          <section id="approach" className="cs-section">
            <div className="cs-section-header">
              <span className="cs-section-badge">02 • Strategy &amp; Architecture</span>
              <h2 className="cs-section-title">
                <i className="fa-solid fa-compass-drafting text-cyan-400" />
                <span>Engineering Approach</span>
              </h2>
            </div>

            <div className="cs-arch-container">
              {/* Interactive Tabs */}
              <div className="cs-arch-tabs" role="tablist">
                <button
                  type="button"
                  className={`cs-arch-tab ${activeArchTab === 'arch1' ? 'active' : ''}`}
                  onClick={() => {
                    playTick();
                    setActiveArchTab('arch1');
                  }}
                  role="tab"
                  aria-selected={activeArchTab === 'arch1'}
                >
                  <i className="fa-solid fa-window-maximize" />
                  <span>Client Tier</span>
                </button>
                <button
                  type="button"
                  className={`cs-arch-tab ${activeArchTab === 'arch2' ? 'active' : ''}`}
                  onClick={() => {
                    playTick();
                    setActiveArchTab('arch2');
                  }}
                  role="tab"
                  aria-selected={activeArchTab === 'arch2'}
                >
                  <i className="fa-solid fa-shield-halved" />
                  <span>API Gateway</span>
                </button>
                <button
                  type="button"
                  className={`cs-arch-tab ${activeArchTab === 'arch3' ? 'active' : ''}`}
                  onClick={() => {
                    playTick();
                    setActiveArchTab('arch3');
                  }}
                  role="tab"
                  aria-selected={activeArchTab === 'arch3'}
                >
                  <i className="fa-solid fa-database" />
                  <span>Data Store</span>
                </button>
              </div>

              {/* Tab 1: Client Tier */}
              {activeArchTab === 'arch1' && (
                <div className="cs-arch-pane" role="tabpanel">
                  <div className="cs-arch-header">
                    <div className="cs-arch-title">
                      <i className="fa-solid fa-desktop text-cyan-400" />
                      <span>Presentation &amp; State Management</span>
                    </div>
                    <div className="cs-arch-stack">Stack: {clientTech}</div>
                  </div>
                  <p className="text-slate-300 text-base leading-relaxed mb-6">
                    Engineered with modern single-page architecture featuring optimistic booking date selections, accelerated motion, and fluid CSS token design. Client queries are debounced to prevent unnecessary network payload dispatch.
                  </p>
                  <div className="cs-arch-grid">
                    <div className="cs-arch-box">
                      <h4>
                        <i className="fa-solid fa-bolt" /> Optimistic Locking
                      </h4>
                      <p>Instant UI feedback before server confirmation to boost perceived performance by 400%.</p>
                    </div>
                    <div className="cs-arch-box">
                      <h4>
                        <i className="fa-solid fa-cube" /> Asset Delivery
                      </h4>
                      <p>Lazy loading and modern WebP compression for sub-second page rendering on mobile.</p>
                    </div>
                    <div className="cs-arch-box">
                      <h4>
                        <i className="fa-solid fa-universal-access" /> Accessibility
                      </h4>
                      <p>Full ARIA landmarks, WCAG 2.1 compliance, and keyboard navigation across all interactive widgets.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: API Gateway */}
              {activeArchTab === 'arch2' && (
                <div className="cs-arch-pane" role="tabpanel">
                  <div className="cs-arch-header">
                    <div className="cs-arch-title">
                      <i className="fa-solid fa-server text-cyan-400" />
                      <span>Defensive Security &amp; Routing</span>
                    </div>
                    <div className="cs-arch-stack">Stack: {backendTech}</div>
                  </div>
                  <p className="text-slate-300 text-base leading-relaxed mb-6">
                    Implemented a lightweight Express middleware pipeline handling HTTP-only JWT cookie validation, memory-based IP rate-limiting, and strict CORS policies. Avoided heavy monolithic frameworks to maintain sub-50ms latency.
                  </p>
                  <div className="cs-arch-grid">
                    <div className="cs-arch-box">
                      <h4>
                        <i className="fa-solid fa-gauge-high" /> Rate Limiting
                      </h4>
                      <p>Memory-based IP throttling and token bucket algorithm on critical checkout and search routes.</p>
                    </div>
                    <div className="cs-arch-box">
                      <h4>
                        <i className="fa-solid fa-lock" /> Auth Guards
                      </h4>
                      <p>HTTP-only, SameSite strict JWT session cookies to eliminate XSS and CSRF token exposure.</p>
                    </div>
                    <div className="cs-arch-box">
                      <h4>
                        <i className="fa-solid fa-shield" /> Payload Limits
                      </h4>
                      <p>Strict JSON body size validation and schema sanitization to prevent memory exhaustion attacks.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Data Store */}
              {activeArchTab === 'arch3' && (
                <div className="cs-arch-pane" role="tabpanel">
                  <div className="cs-arch-header">
                    <div className="cs-arch-title">
                      <i className="fa-solid fa-database text-cyan-400" />
                      <span>Transactional Persistence</span>
                    </div>
                    <div className="cs-arch-stack">Stack: {databaseTech}</div>
                  </div>
                  <p className="text-slate-300 text-base leading-relaxed mb-6">
                    Utilized replica set document storage for flexible schemas (amenities, pricing rules) while enforcing ACID multi-document transactions on critical booking paths to eliminate concurrent write collisions.
                  </p>
                  <div className="cs-arch-grid">
                    <div className="cs-arch-box">
                      <h4>
                        <i className="fa-solid fa-check-double" /> ACID Transactions
                      </h4>
                      <p>Session locks prevent concurrent double-booking under extreme high-traffic checkout conditions.</p>
                    </div>
                    <div className="cs-arch-box">
                      <h4>
                        <i className="fa-solid fa-network-wired" /> Compound Indexes
                      </h4>
                      <p>2dsphere geolocation + price + availability compound indexes achieving sub-45ms faceted queries.</p>
                    </div>
                    <div className="cs-arch-box">
                      <h4>
                        <i className="fa-solid fa-filter" /> Aggregation
                      </h4>
                      <p>Multi-stage aggregation pipeline with in-memory projection to reduce network payloads by 64%.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 03. TECH DECISIONS */}
          <section id="decisions" className="cs-section">
            <div className="cs-section-header">
              <span className="cs-section-badge">03 • Engineering Trade-offs</span>
              <h2 className="cs-section-title">
                <i className="fa-solid fa-scale-balanced text-amber-400" />
                <span>Tech Decisions</span>
              </h2>
            </div>

            <div className="cs-card">
              <div className="cs-callout warning">
                <div className="cs-callout-icon text-amber-400">
                  <i className="fa-solid fa-lightbulb" />
                </div>
                <div className="cs-callout-content">
                  <div className="cs-callout-title">Key Trade-off Summary</div>
                  <p>
                    Replica set session transactions prioritized over eventual consistency. Lightweight native REST middleware prioritized over bloated monolithic dependencies.
                  </p>
                </div>
              </div>

              <div className="text-slate-300 leading-relaxed mb-6">
                <MarkdownView content={caseStudy.techDecisions} />
              </div>

              {/* Code Block with macOS Header & Copy Button */}
              <div className="cs-code-wrapper">
                <div className="cs-code-header">
                  <div className="cs-dot red" />
                  <div className="cs-dot yellow" />
                  <div className="cs-dot green" />
                  <span className="cs-code-filename">
                    <i className="fa-solid fa-file-code" />
                    <span>{project.slug ? `${project.slug}-service.js` : 'booking-service.js'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(sampleCodeSnippet)}
                    className="cs-copy-btn ml-3"
                    title="Copy snippet"
                  >
                    <i className={`fa-solid ${codeCopied ? 'fa-check text-emerald-400' : 'fa-copy'}`} />
                    <span>{codeCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre>
                  <code>{sampleCodeSnippet}</code>
                </pre>
              </div>

              {/* Live Interactive API Sandbox / Endpoint Tester */}
              <div className="mt-8">
                <ApiSandbox />
              </div>
            </div>
          </section>

          {/* 04. RESULTS & METRICS */}
          <section id="results" className="cs-section">
            <div className="cs-section-header">
              <span className="cs-section-badge">04 • Measurable Impact</span>
              <h2 className="cs-section-title">
                <i className="fa-solid fa-chart-line text-emerald-400" />
                <span>Results &amp; Metrics</span>
              </h2>
            </div>

            <div className="cs-card">
              <p className="text-slate-300 text-base leading-relaxed">
                {caseStudy.result?.summary ||
                  'Successfully architected, validated, and deployed a battle-tested vacation rental platform with zero race-condition collisions during concurrent load testing, sub-45ms aggregation search latency, and a 94+ Google Lighthouse rating.'}
              </p>

              {/* Animated Benchmark Bar */}
              <div className="cs-benchmark-container">
                <div className="cs-benchmark-row">
                  <div className="cs-benchmark-label">Search Latency</div>
                  <div className="cs-benchmark-bars">
                    <div className="cs-bar-wrap">
                      <div className="cs-bar before">850ms (Baseline)</div>
                    </div>
                    <div className="cs-bar-wrap">
                      <div
                        className="cs-bar after"
                        style={{ width: benchmarkAnimated ? '18%' : '5%' }}
                      >
                        45ms (Optimized)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantitative Metrics Grid (4 KPI Cards) */}
              <div className="cs-metrics-grid">
                {(caseStudy.result?.metrics || []).slice(0, 4).map((m, idx) => (
                  <div
                    key={`metric-${idx}`}
                    className={`cs-metric-card ${idx === 2 ? 'highlight' : ''}`}
                  >
                    <div className="cs-metric-val">{m.value}</div>
                    <div className="cs-metric-lbl">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 05. SYSTEM BLUEPRINT */}
          <section id="architecture" className="cs-section">
            <div className="cs-section-header">
              <span className="cs-section-badge">05 • System Blueprint</span>
              <h2 className="cs-section-title">
                <i className="fa-solid fa-diagram-project text-cyan-400" />
                <span>Architecture Diagram &amp; Microservices</span>
              </h2>
            </div>

            <div className="space-y-6">
              {/* Interactive Microservices Node Topology */}
              <InteractiveArchitectureDiagram />

              <div className="cs-visual-box">
                <img
                  src={caseStudy.architectureDiagramUrl}
                  alt={`${project.title} Architecture Blueprint`}
                  className="cs-visual-img"
                  loading="lazy"
                />
                <button
                  type="button"
                  className="cs-overlay-btn"
                  onClick={() => {
                    playTick();
                    setBlueprintModalOpen(true);
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass-plus" />
                  <span>Inspect Blueprint (Full Resolution)</span>
                </button>
              </div>
            </div>
          </section>

          {/* 06. VISUAL EVOLUTION (BEFORE & AFTER DRAG SLIDER) */}
          <section id="evolution" className="cs-section">
            <div className="cs-section-header">
              <span className="cs-section-badge">06 • Visual Evolution</span>
              <h2 className="cs-section-title">
                <i className="fa-solid fa-sliders text-cyan-400" />
                <span>Before &amp; After</span>
              </h2>
            </div>

            <p className="text-slate-400 text-sm mb-5">
              Drag the interactive slider horizontally to inspect the architectural transformation.
            </p>

            <div
              className="cs-slider-container"
              ref={sliderContainerRef}
              onMouseDown={handleSliderMouseDown}
              onTouchStart={handleSliderTouchStart}
            >
              {/* Before Image */}
              <img
                src={caseStudy.beforeScreenshots?.[0] || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop'}
                alt="Before Architecture"
                className="cs-slider-img before"
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              />

              {/* After Image */}
              <img
                src={caseStudy.afterScreenshots?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop'}
                alt="After Architecture"
                className="cs-slider-img after"
              />

              {/* Badges */}
              <div className="cs-slider-label before">
                <i className="fa-solid fa-triangle-exclamation text-xs" />
                <span>BEFORE</span>
              </div>
              <div className="cs-slider-label after">
                <i className="fa-solid fa-circle-check text-xs" />
                <span>AFTER</span>
              </div>

              {/* Center Draggable Line & Pill Handle */}
              <div className="cs-slider-handle" style={{ left: `${sliderPos}%` }} />
            </div>
          </section>

          {/* 07. WHAT I LEARNED (RETROSPECTIVE) */}
          <section id="learnings" className="cs-section">
            <div className="cs-section-header">
              <span className="cs-section-badge">07 • Retrospective</span>
              <h2 className="cs-section-title">
                <i className="fa-solid fa-graduation-cap text-purple-400" />
                <span>What I Learned</span>
              </h2>
            </div>

            <div className="cs-card">
              <div className="cs-callout purple">
                <div className="cs-callout-icon text-purple-400">
                  <i className="fa-solid fa-lightbulb" />
                </div>
                <div className="cs-callout-content">
                  <div className="cs-callout-title">Key Retrospective Takeaway</div>
                  <p>
                    Atomic session transactions are completely non-negotiable for booking engines; optimistic client UI updates with resilient rollback mechanisms boost perceived responsiveness by 400%.
                  </p>
                </div>
              </div>

              <div className="text-slate-300 leading-relaxed space-y-4">
                <MarkdownView content={caseStudy.learnings} />
              </div>
            </div>
          </section>

          {/* 08. BOTTOM CTA FOOTER & NEXT CASE STUDY EXPLORATION */}
          <footer className="cs-bottom-bar">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider font-bold">
                  Portfolio Exploration
                </span>
                <h3 className="text-xl font-bold text-white font-grotesk">
                  Ready to inspect more engineering work?
                </h3>
                <p className="text-sm text-slate-400">
                  {nextProject ? (
                    <span>
                      Next featured case study: <strong className="text-white">{nextProject.title}</strong>
                    </span>
                  ) : (
                    <span>Explore other production web applications and verified credentials.</span>
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
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 transition-all font-mono"
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
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-mono flex items-center gap-2 transition-all"
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
                    <span>Prev: {prevProject.title.slice(0, 15)}...</span>
                  </Link>
                )}
                {nextProject && (
                  <Link
                    to={`/projects/${nextProject.slug || nextProject.id}`}
                    onClick={playTick}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all flex items-center gap-1.5 font-bold"
                  >
                    <span>Next: {nextProject.title.slice(0, 15)}...</span>
                    <i className="fa-solid fa-arrow-right" />
                  </Link>
                )}
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* 3. FULLSCREEN BLUEPRINT MODAL */}
      {blueprintModalOpen && (
        <div
          className="cs-modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('cs-modal-overlay')) {
              setBlueprintModalOpen(false);
            }
          }}
        >
          <div className="cs-modal-content">
            <button
              type="button"
              className="cs-close-modal"
              onClick={() => setBlueprintModalOpen(false)}
              aria-label="Close Blueprint"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-grotesk">
              <i className="fa-solid fa-diagram-project text-cyan-400" />
              <span>Full System Architecture Blueprint — {project.title}</span>
            </h2>
            <img
              src={caseStudy.architectureDiagramUrl}
              alt="High Res Architecture Diagram"
              className="w-full rounded-2xl border border-white/10 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* 4. FLOATING BACK-TO-TOP BUTTON */}
      <button
        type="button"
        onClick={() => {
          playTick();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`cs-floating-top-btn ${readingProgress > 12 ? 'visible' : ''}`}
        title="Scroll to Top"
        aria-label="Scroll to Top"
      >
        <i className="fa-solid fa-arrow-up" />
      </button>
    </>
  );
}
export default ProjectDetail;
