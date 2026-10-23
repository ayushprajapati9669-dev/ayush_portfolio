import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { CertificatesPage } from '../Certificates/Certificates';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { itemListSchema, projectSchema } from '../../utils/seo';

// Baseline Reference Projects from Reference HTML
const REFERENCE_PROJECTS = [
  {
    id: 'airbnb-clone-platform',
    title: 'Airbnb Clone Platform',
    category: 'Full-Stack',
    badge: 'Flagship Full-Stack App',
    shortDescription:
      'A comprehensive property rental platform featuring secure JWT authentication, dynamic search filters, booking management, and a custom cloud image upload system.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
    liveDemoUrl: 'https://airbnb-clone-demo.vercel.app',
    githubUrl: 'https://github.com/ayushprajapati9669-dev',
    technologies: ['React JS', 'Node.js', 'Express.js', 'MongoDB'],
    displayOrder: 1,
    status: 'published'
  },
  {
    id: 'ai-conversational-workspace',
    title: 'AI Conversational Workspace',
    category: 'AI / ML',
    badge: 'AI Integration',
    shortDescription:
      'A ChatGPT-inspired conversational AI interface featuring real-time streaming responses, markdown rendering, chat history persistence, and a sleek dark-mode UI.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
    liveDemoUrl: 'https://ai-workspace-demo.vercel.app',
    githubUrl: 'https://github.com/ayushprajapati9669-dev',
    technologies: ['React JS', 'OpenAI API', 'MongoDB'],
    displayOrder: 2,
    status: 'published'
  },
  {
    id: 'zerodha-trading-dashboard',
    title: 'Zerodha Trading Dashboard',
    category: 'Frontend',
    badge: 'FinTech Dashboard',
    shortDescription:
      'A responsive trading dashboard clone featuring interactive charts, portfolio tracking, dynamic data tables, and a seamless user interface built for high-density data.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    liveDemoUrl: 'https://zerodha-dashboard-demo.vercel.app',
    githubUrl: 'https://github.com/ayushprajapati9669-dev',
    technologies: ['React JS', 'Recharts', 'CSS Modules'],
    displayOrder: 3,
    status: 'published'
  },
  {
    id: 'modern-ecommerce-storefront',
    title: 'Modern E-Commerce Storefront',
    category: 'Frontend',
    badge: 'E-Commerce',
    shortDescription:
      'A blazing-fast headless e-commerce frontend with cart persistence, Stripe checkout integration, and fully responsive design.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop',
    liveDemoUrl: 'https://ecommerce-demo.vercel.app',
    githubUrl: 'https://github.com/ayushprajapati9669-dev',
    technologies: ['Next.js', 'Stripe API', 'Tailwind'],
    displayOrder: 4,
    status: 'published'
  }
];

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
    return <CertificatesPage />;
  }

  // Projects View Mode: read CMS published projects or fallback to reference baseline
  const cmsPublished = (appState.projects || [])
    .filter((p) => p.status === 'published')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const allProjects = cmsPublished.length > 0 ? cmsPublished : REFERENCE_PROJECTS;
  const currentProject = slug ? allProjects.find((p) => p.slug === slug || p.id === slug) : null;

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
      gsap.from('.page-header > *', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });

      gsap.from('.project-card', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        delay: 0.2,
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
      gsap.fromTo(
        visibleCards,
        { y: 30, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'back.out(1.2)',
          overwrite: true,
          onComplete: () => {
            visibleCards.forEach((c) => {
              c.style.transform = '';
            });
          }
        }
      );
    }
  }, [activeFilter, searchQuery]);

  return (
    <main className="projects-page" ref={containerRef}>
      {currentProject ? (
        <SEO
          title={`${currentProject.title} | Case Study`}
          description={currentProject.shortDescription || `Case study and architecture overview for ${currentProject.title} built with ${(currentProject.technologies || []).join(', ')}.`}
          image={currentProject.thumbnailUrl}
          schema={projectSchema(currentProject)}
        />
      ) : (
        <SEO
          title="Featured Projects & Live Software"
          description="A collection of full-stack web applications, interactive dashboards, and AI-powered tools engineered and deployed by Ayush Prajapati."
          schema={itemListSchema(allProjects, 'SoftwareApplication')}
        />
      )}
      {/* Page Header */}
      <div className="page-header">
        <div className="page-tagline">02 · Featured Work</div>
        <h1 className="page-title">Live Deployed Projects</h1>
        <p className="page-desc">
          A collection of full-stack web applications, interactive dashboards, and AI-powered tools I've designed, built, and deployed.
        </p>
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

      {/* Dynamic Masonry Grid */}
      {filteredProjects.length === 0 ? (
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
        <div className="project-grid" id="projectGrid" ref={gridRef}>
          {filteredProjects.map((proj, idx) => (
            <ProjectCard
              key={proj.id || `proj-${idx}`}
              proj={proj}
              indexNum={idx + 1}
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
