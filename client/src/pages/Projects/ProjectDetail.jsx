import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { SEO } from '../../components/SEO';
import { projectSchema } from '../../utils/seo';
import { MarkdownView } from '../../components/common/MarkdownView';
import { playTick } from '../../utils/audio';
import { getTechIcon } from '../../components/projects/ProjectCard';
import '../../styles/pages/project-detail.css';

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { appState } = usePortfolio();
  const containerRef = useRef(null);

  const cleanSlug = String(slug || '').trim();

  // Find local published project synchronously (zero lag/flicker if already in appState)
  const localProject = (appState.projects || []).find(
    (p) =>
      p &&
      p.status === 'published' &&
      (p.slug === cleanSlug ||
        p.id === cleanSlug ||
        (p.slug && p.slug.toLowerCase() === cleanSlug.toLowerCase()))
  ) || null;

  const [apiProject, setApiProject] = useState(null);
  const [fetchSlug, setFetchSlug] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  // Authoritative API resolution if not found in local published state
  useEffect(() => {
    let isCancelled = false;

    // If already resolved via local published state, no fetch required
    if (localProject) {
      setIsFetching(false);
      setIsNotFound(false);
      return;
    }

    setIsFetching(true);
    setIsNotFound(false);

    fetch(`/api/public/projects/${encodeURIComponent(cleanSlug)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Project not found');
        }
        return res.json();
      })
      .then((data) => {
        if (isCancelled) return;
        if (data && data.project && data.project.status === 'published') {
          setApiProject(data.project);
          setFetchSlug(cleanSlug);
          setIsNotFound(false);
        } else {
          setApiProject(null);
          setFetchSlug(cleanSlug);
          setIsNotFound(true);
        }
        setIsFetching(false);
      })
      .catch(() => {
        if (isCancelled) return;
        setApiProject(null);
        setFetchSlug(cleanSlug);
        setIsNotFound(true);
        setIsFetching(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [cleanSlug, localProject]);

  // Determine active project: local project takes precedence; otherwise API project for this slug
  const activeProject = localProject || (fetchSlug === cleanSlug ? apiProject : null);
  const loading = !activeProject && !isNotFound && (isFetching || fetchSlug !== cleanSlug);
  const notFound = !activeProject && !loading;

  // Entrance GSAP animation
  useEffect(() => {
    if (!activeProject || loading || notFound) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.pd-anim-element', {
        y: 24,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all'
      });
    }, containerRef);

    return () => ctx.revert();
  }, [cleanSlug, loading, notFound, Boolean(activeProject)]);

  // Handle loading skeleton state
  if (loading) {
    return (
      <main className="project-detail-page min-h-screen">
        <div className="project-detail-container animate-pulse space-y-8">
          <div className="h-6 w-36 bg-white/10 rounded-lg" />
          <div className="space-y-4">
            <div className="h-6 w-28 bg-yellow-500/20 rounded-full" />
            <div className="h-12 w-3/4 max-w-lg bg-white/10 rounded-xl" />
            <div className="h-6 w-full max-w-2xl bg-white/5 rounded-lg" />
          </div>
          <div className="w-full h-80 rounded-3xl bg-white/5 border border-white/10" />
        </div>
      </main>
    );
  }

  // Handle Not Found state (invalid slug or draft/unpublished project)
  if (notFound || !activeProject) {
    return (
      <main className="project-detail-page min-h-screen flex items-center justify-center">
        <SEO
          title="Project Not Found | Ayush Prajapati"
          description="The requested project case study could not be found or has not been published."
        />
        <div className="max-w-xl mx-auto text-center py-16 px-8 rounded-3xl border border-white/10 bg-[#0a0f16]/90 backdrop-blur-2xl shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 text-3xl">
            <i className="fa-solid fa-folder-open" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-3.5 py-1 rounded-full border border-yellow-400/20 inline-block mb-4">
            404 · Not Found
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            Project Unavailable
          </h1>
          <p className="font-sans text-sm sm:text-base text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            The project you requested either does not exist, has been unpublished, or is currently undergoing review.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/projects"
              onClick={playTick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-yellow-500/20"
            >
              <i className="fa-solid fa-arrow-left text-[11px]" />
              <span>Browse All Projects</span>
            </Link>
            <Link
              to="/"
              onClick={playTick}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-white font-medium text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const project = activeProject;

  // Published projects sorted by displayOrder for consistent Previous / Next navigation
  const publishedProjects = (appState.projects || [])
    .filter((p) => p && p.status === 'published')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const currentIndex = publishedProjects.findIndex(
    (p) => p.id === project.id || p.slug === project.slug
  );
  const prevProject = currentIndex > 0 ? publishedProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < publishedProjects.length - 1
      ? publishedProjects[currentIndex + 1]
      : null;

  const techList = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
      ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  const cs = project.caseStudy || {};
  const problemContent = project.problemContext || cs.problem || '';
  const approachContent = project.approachArchitecture || cs.approach || '';
  const techDecisionsContent = cs.techDecisions || '';
  const learningsContent = project.lessonsLearned || cs.learnings || '';
  const features = Array.isArray(project.implementedFeatures) ? project.implementedFeatures : [];
  const metrics = Array.isArray(cs.result?.metrics) ? cs.result.metrics : [];

  const projectCoverImage =
    project.thumbnailUrl ||
    project.coverImage ||
    project.imageUrl ||
    '';

  const rawGallery = Array.isArray(project.galleryImages) && project.galleryImages.length > 0
    ? project.galleryImages
    : Array.isArray(cs.afterScreenshots) && cs.afterScreenshots.length > 0
      ? cs.afterScreenshots
      : [];
  const galleryImages = rawGallery.filter((img) => typeof img === 'string' && img.trim().length > 0);

  return (
    <main className="project-detail-page" ref={containerRef}>
      <SEO
        title={`${project.title || 'Engineering Project'} | Software Engineering Project`}
        description={
          project.shortDescription ||
          `${project.title || 'Project'} - Full-Stack software engineering project by Ayush Prajapati.`
        }
        image={projectCoverImage}
        schema={projectSchema(project)}
      />

      <div className="project-detail-container">
        {/* Navigation Breadcrumb Bar */}
        <div className="pd-breadcrumb-bar pd-anim-element">
          <Link to="/projects" className="pd-back-link" onClick={playTick}>
            <i className="fa-solid fa-arrow-left" />
            <span>Back to All Projects</span>
          </Link>
          <div className="flex items-center gap-2">
            {project.category && (
              <span className="font-mono text-[11px] text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                {project.category}
              </span>
            )}
            {project.liveDemoUrl && (
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Deployed</span>
              </span>
            )}
          </div>
        </div>

        {/* Hero Header */}
        <header className="pd-header pd-anim-element">
          {project.badge && <div className="pd-category-pill">{project.badge}</div>}
          <h1 className="pd-title">{project.title || 'Engineering Project'}</h1>
          {project.shortDescription && (
            <p className="pd-lead-desc">{project.shortDescription}</p>
          )}

          {/* Action CTAs */}
          <div className="pd-actions">
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-btn-demo"
                onClick={playTick}
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                <span>Launch Live Demo</span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-btn-code"
                onClick={playTick}
              >
                <i className="fa-brands fa-github text-sm" />
                <span>View Source Code</span>
              </a>
            )}
          </div>
        </header>

        {/* Featured Media Showcase */}
        {projectCoverImage && (
          <div className="pd-media-showcase pd-anim-element">
            <img
              src={projectCoverImage}
              alt={project.title || 'Project preview'}
              loading="eager"
              decoding="async"
            />
          </div>
        )}

        {/* Gallery Screenshots (if provided by CMS) */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 pd-anim-element">
            {galleryImages.map((imgUrl, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl"
              >
                <img
                  src={imgUrl}
                  alt={`${project.title || 'Project'} preview ${i + 1}`}
                  loading="lazy"
                  className="w-full h-48 object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* Technologies & Architectural Stack */}
        {techList.length > 0 && (
          <section className="pd-tech-section pd-anim-element">
            <div className="pd-section-label">Architectural Tech Stack</div>
            <div className="pd-tech-grid">
              {techList.map((tech, i) => (
                <span key={`${tech}-${i}`} className="pd-tech-pill">
                  {getTechIcon(tech)}
                  <span>{tech}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Detailed Content Grid (Genuine CMS fields only) */}
        <div className="pd-content-grid">
          {/* Key Implemented Features */}
          {features.length > 0 && (
            <section className="pd-card-section pd-anim-element">
              <h2 className="pd-card-heading">
                <i className="fa-solid fa-list-check" />
                <span>Key Implemented Features</span>
              </h2>
              <ul className="pd-features-list">
                {features.map((feature, idx) => (
                  <li key={idx} className="pd-feature-item">
                    <i className="fa-solid fa-circle-check" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Problem & Context */}
          {problemContent && (
            <section className="pd-card-section pd-anim-element">
              <h2 className="pd-card-heading">
                <i className="fa-solid fa-bullseye" />
                <span>Problem Statement & Context</span>
              </h2>
              <MarkdownView content={problemContent} />
            </section>
          )}

          {/* Approach & Architecture */}
          {approachContent && (
            <section className="pd-card-section pd-anim-element">
              <h2 className="pd-card-heading">
                <i className="fa-solid fa-sitemap" />
                <span>Engineering Approach & Architecture</span>
              </h2>
              <MarkdownView content={approachContent} />
            </section>
          )}

          {/* Technical Decisions */}
          {techDecisionsContent && (
            <section className="pd-card-section pd-anim-element">
              <h2 className="pd-card-heading">
                <i className="fa-solid fa-scale-balanced" />
                <span>Technical Decisions & Trade-offs</span>
              </h2>
              <MarkdownView content={techDecisionsContent} />
            </section>
          )}

          {/* Architecture Diagram */}
          {cs.architectureDiagramUrl && (
            <section className="pd-card-section pd-anim-element">
              <h2 className="pd-card-heading">
                <i className="fa-solid fa-diagram-project" />
                <span>Architecture Diagram</span>
              </h2>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60 p-2">
                <img
                  src={cs.architectureDiagramUrl}
                  alt="Architecture Diagram"
                  className="w-full h-auto object-contain max-h-[500px]"
                />
              </div>
            </section>
          )}

          {/* Results & Measured Impact */}
          {(cs.result?.summary || metrics.length > 0) && (
            <section className="pd-card-section pd-anim-element">
              <h2 className="pd-card-heading">
                <i className="fa-solid fa-chart-line" />
                <span>Results & System Impact</span>
              </h2>
              {cs.result?.summary && <MarkdownView content={cs.result.summary} />}
              {metrics.length > 0 && (
                <div className="pd-metrics-grid">
                  {metrics.map((m, idx) => (
                    <div key={idx} className="pd-metric-box">
                      <span className="pd-metric-value">{m.value}</span>
                      <span className="pd-metric-label">{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Key Learnings & Engineering Retrospective */}
          {learningsContent && (
            <section className="pd-card-section pd-anim-element">
              <h2 className="pd-card-heading">
                <i className="fa-solid fa-lightbulb" />
                <span>Key Learnings & Takeaways</span>
              </h2>
              <MarkdownView content={learningsContent} />
            </section>
          )}

          {/* Engineering Disclaimer */}
          {project.disclaimer && (
            <section className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-slate-300 text-sm leading-relaxed pd-anim-element">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-circle-info text-amber-400 mt-1" />
                <div>
                  <strong className="text-amber-300 block mb-1">Architecture Note:</strong>
                  {project.disclaimer}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Bottom Pagination & Navigation */}
        <nav className="pd-pagination pd-anim-element" aria-label="Project pagination">
          {prevProject ? (
            <Link
              to={`/projects/${prevProject.slug || prevProject.id}`}
              className="pd-nav-btn"
              onClick={playTick}
            >
              <i className="fa-solid fa-arrow-left" />
              <span>Previous: {prevProject.title}</span>
            </Link>
          ) : (
            <div />
          )}

          <Link to="/projects" className="pd-nav-btn" onClick={playTick}>
            <i className="fa-solid fa-grip" />
            <span>All Projects</span>
          </Link>

          {nextProject ? (
            <Link
              to={`/projects/${nextProject.slug || nextProject.id}`}
              className="pd-nav-btn"
              onClick={playTick}
            >
              <span>Next: {nextProject.title}</span>
              <i className="fa-solid fa-arrow-right" />
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </main>
  );
}

export default ProjectDetailPage;
