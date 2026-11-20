import React, { useState, useEffect, useRef } from 'react';
import '../../styles/pages/projects.css';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { ProjectCard } from '../../components/projects/ProjectCard';
const LazyCertificatesPage = React.lazy(() => import('../Certificates/Certificates').then(m => ({ default: m.CertificatesPage })));
import { ScrollWriteText } from '../../components/common/ScrollWriteText';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { itemListSchema } from '../../utils/seo';

function normalizeCategoryKey(cat) {
  const c = String(cat || '').toLowerCase().trim();
  if (c.includes('aiml') || c.includes('ai') || c.includes('machine') || c.includes('gpt') || c.includes('gemini')) {
    return 'aiml';
  }
  if (c.includes('front')) {
    return 'frontend';
  }
  return 'fullstack';
}

export function ProjectsPage({ viewMode = 'projects' }) {
  const { slug } = useParams();
  const { appState } = usePortfolio();
  const ui = appState.uiLabels || {};
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  // If in certificates view mode, render the dedicated CertificatesPage
  if (viewMode === 'certificates') {
    return <React.Suspense fallback={null}><LazyCertificatesPage /></React.Suspense>;
  }

  // Projects View Mode: read CMS published projects
  const cmsPublished = (appState.projects || [])
    .filter((p) => p.status === 'published')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const allProjects = cmsPublished;

  // Filter tabs
  const FILTER_TABS = [
    { key: 'all', label: 'All Projects' },
    { key: 'fullstack', label: 'Full-Stack' },
    { key: 'frontend', label: 'Frontend' },
    { key: 'aiml', label: 'AI / ML' }
  ];

  // Filter and search logic
  const filteredProjects = allProjects.filter((proj) => {
    const catKey = normalizeCategoryKey(proj.category);
    const matchesCategory = activeFilter === 'all' || catKey === activeFilter;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const techStr = Array.isArray(proj.technologies)
      ? proj.technologies.join(' ')
      : String(proj.technologies || '');

    const matchesQuery =
      proj.title.toLowerCase().includes(q) ||
      (proj.shortDescription || '').toLowerCase().includes(q) ||
      techStr.toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });

  // Magnetic button physics
  const handleMagneticMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;

    gsap.to(el, { x, y, duration: 0.4, ease: 'power2.out' });
    if (el.classList.contains('filter-btn')) {
      el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }
  };

  const handleMagneticMouseLeave = (e) => {
    const el = e.currentTarget;
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
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
      transformPerspective: 1500,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  // Initial Entrance Animation
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      // Let ScrollWriteText handle header typography cleanly without double-transform conflict

      gsap.from(".project-card:not(:first-child)", {
        y: 20,
        opacity: 0.3,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out",
        onComplete: () => {
          document.querySelectorAll('.project-card').forEach((c) => {
            c.style.transform = '';
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Filter Change Stagger Animation
  const handleFilterClick = (filterKey) => {
    playTick();
    setActiveFilter(filterKey);
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !gridRef.current) return;

    const visibleCards = gridRef.current.querySelectorAll('.project-card');
    if (visibleCards.length > 0) {
      gsap.killTweensOf(visibleCards);
      gsap.fromTo(
        visibleCards,
        { y: 35, opacity: 0, scale: 0.93, filter: 'blur(4px)' },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.55,
          stagger: {
            each: 0.075,
            from: 'start',
            ease: 'power2.out'
          },
          ease: 'back.out(1.2)',
          overwrite: true,
          clearProps: 'transform,filter,opacity'
        }
      );
    }
  }, [activeFilter, searchQuery]);

  return (
    <main className="projects-page min-h-[1400px]" ref={containerRef}>
      <link rel="preload" as="image" href="/images/airbnb-clone-preview.webp" type="image/webp" fetchpriority="high" />
      <SEO
        title="Featured Projects & Live Software"
        description="A collection of full-stack web applications, interactive dashboards, and AI-powered tools engineered and deployed by Ayush Prajapati."
        schema={itemListSchema(allProjects, 'SoftwareApplication')}
      />
      {/* Page Header */}
      <div className="page-header">
        <ScrollWriteText
          as="div"
          className="page-tagline"
          mode="scramble"
          scrambleDuration={20}
        >
          03 · FEATURED ENGINEERING WORK
        </ScrollWriteText>
        <ScrollWriteText
          as="h1"
          className="page-title hero-editorial-title text-left !m-0 !p-0 !max-w-none"
          mode="mask"
          stagger={0.04}
          highlightWords={['Projects']}
        >
          Live Deployed *Projects*
        </ScrollWriteText>
        <ScrollWriteText
          as="p"
          className="page-desc mt-4"
          mode="words"
          stagger={0.02}
        >
          A collection of full-stack web applications, interactive dashboards, and AI-powered tools I've designed, built, and deployed.
        </ScrollWriteText>
      </div>

      {/* Toolbar & Filters */}
      <div className="toolbar">
        <div className="filters">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleFilterClick(tab.key)}
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className={`filter-btn magnetic ${activeFilter === tab.key ? 'active' : ''}`}
              data-filter={tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tech or title..."
            aria-label="Search projects by tech or title"
          />
        </div>
      </div>

      {/* Dynamic Masonry Grid or Honest Empty State */}
      {allProjects.length === 0 ? (
        <div className="project-empty-state max-w-xl mx-auto text-center py-16 px-6 my-10 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl shadow-lg shadow-amber-500/5">
            <i className="fa-solid fa-layer-group text-2xl" />
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
            Projects In Development
          </h3>
          <p className="font-sans text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto">
            Production full-stack applications and software engineering systems will appear here once published via the Admin CMS.
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="project-card text-center p-12 space-y-4">
          <h3 className="project-title text-2xl">No matching projects found</h3>
          <p className="project-desc">
            No projects matched your search criteria. Try a different technology or keyword.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                playTick();
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="btn-demo inline-flex max-w-xs mx-auto"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="project-grid min-h-[500px]" id="projectGrid" ref={gridRef}>
          {filteredProjects.map((proj, idx) => (
            <ProjectCard
              key={proj.id || `proj-${idx}`}
              proj={proj}
              indexNum={idx + 1}
              priority={idx === 0}
              onCardMouseMove={handleCardMouseMove}
              onCardMouseLeave={handleCardMouseLeave}
              isSelected={highlightedId === proj.id}
              onSelect={setHighlightedId}
            />
          ))}
        </div>
      )}
    </main>
  );
}
