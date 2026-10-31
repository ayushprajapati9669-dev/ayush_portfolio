import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { DeveloperWorkbench } from '../../components/ui/DeveloperWorkbench';
import { CertificateCard } from '../../components/projects/CertificateCard';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { personSchema, websiteSchema } from '../../utils/seo';

export function HomePage() {
  const { appState, openResumeModal, showToast } = usePortfolio();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const cgpaStatRef = useRef(null);
  const leetcodeStatRef = useRef(null);

  const p = appState.profile || {};

  const publishedProjects = (appState.projects || [])
    .filter((proj) => proj.status === 'published')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const flagshipProject = publishedProjects[0] || null;
  const secondProject = publishedProjects[1] || null;
  const certificates = appState.certificates || [];

  const goTo = (route) => {
    playTick();
    navigate(route);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Animated CGPA and Stat Counters using IntersectionObserver
  useEffect(() => {
    const statElements = [
      { ref: cgpaStatRef, target: 8.42, decimals: 2 },
      { ref: leetcodeStatRef, target: 500, decimals: 0, suffix: '+' }
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const item = statElements.find((s) => s.ref.current === entry.target);
            if (item && item.ref.current) {
              animateCounter(item.ref.current, item.target, item.decimals, item.suffix || '');
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    statElements.forEach((s) => {
      if (s.ref.current) observer.observe(s.ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const animateCounter = (element, target, decimals = 2, suffix = '') => {
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = target * easeOut;

      if (element) {
        element.textContent = `${current.toFixed(decimals)}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else if (element) {
        element.textContent = `${target.toFixed(decimals)}${suffix}`;
      }
    };

    requestAnimationFrame(update);
  };

  // GSAP Entrance Transitions (animations only where needed, per user directive)
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (_e) {}

    const ctx = gsap.context(() => {
      // 1. Hero Entrance
      gsap.from('.hero-bento-eyebrow', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.1
      });

      gsap.from('.hero-bento-title', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.2
      });

      gsap.from('.hero-bento-footer', {
        y: 25,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.35
      });

      // 2. Scroll Reveals for Bento Cards
      const bentoCards = containerRef.current.querySelectorAll('.bento-card');
      bentoCards.forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          y: 28,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out'
        });
      });

      // 3. CTA Section ScrollTrigger
      gsap.from('.cta-ref-section', {
        scrollTrigger: {
          trigger: '.cta-ref-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        scale: 0.96,
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="container max-w-[1120px] mx-auto px-6 pt-24 pb-20 sm:pt-28">
      <SEO
        title="Ayush Prajapati — Software Engineer"
        description={
          p.headline ||
          p.heroDescription ||
          'Ayush Prajapati - Software Engineer specializing in full-stack development, building scalable and performant web applications.'
        }
        schema={[personSchema(p), websiteSchema(p)]}
      />

      {/* --- HERO SECTION --- */}
      <header className="hero-bento-stage" ref={heroRef}>
        <div className="hero-bento-eyebrow">
          <span className="serif">01</span> — Software Engineer &amp; Full-Stack Developer
        </div>
        <h1 className="hero-bento-title">
          Building digital<br />
          experiences with <span className="serif">code</span><br />
          &amp; <span className="serif">precision</span>.
        </h1>
        <div className="hero-bento-footer">
          <p className="hero-bento-description">
            {p.heroDescription ||
              "I'm Ayush Prajapati, a Software Engineer specializing in full-stack development. I focus on building scalable, performance-driven web applications with clean architecture and thoughtful design."}
          </p>
          <div className="hero-bento-cta">
            <Link to="/contact" className="btn-ref btn-ref-primary" onClick={() => playTick()}>
              <span>Let's Talk</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#work" className="btn-ref btn-ref-outline" onClick={() => playTick()}>
              View Work
            </a>
          </div>
        </div>
      </header>

      {/* --- WORK SECTION (BENTO GRID) --- */}
      <section id="work" className="mb-28">
        <div className="section-title">Selected Work</div>

        <div className="bento-grid">
          {/* Card 1: Large Flagship Full-Stack Platform */}
          <div className="bento-card large">
            <div>
              <div className="card-label">01 — Full-Stack Development</div>
              <div className="card-image-wrapper">
                <img
                  src={
                    flagshipProject?.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={flagshipProject?.title || 'StayFinder Platform'}
                  loading="lazy"
                />
              </div>
              <h3 className="card-title">
                {flagshipProject?.title || 'StayFinder — Accommodation Platform'}
              </h3>
              <p className="card-text">
                {flagshipProject?.shortDescription ||
                  "A full-stack booking platform replicating Airbnb's core functionality. Implemented secure JWT authentication, dynamic pricing engine, and a custom admin dashboard. Optimized MongoDB queries for a 20% faster load time."}
              </p>
            </div>
            <div>
              <div className="tag-row">
                {(flagshipProject?.technologies || ['React.js', 'Node.js', 'MongoDB', 'Express', 'Tailwind']).map(
                  (tech, idx) => (
                    <span key={idx} className="tag">
                      {tech}
                    </span>
                  )
                )}
              </div>
              <div className="flex items-center gap-6 mt-4">
                {flagshipProject ? (
                  <Link
                    to={`/projects/${flagshipProject.slug || flagshipProject.id}`}
                    className="arrow-link"
                    onClick={() => playTick()}
                  >
                    <span>View Case Study</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <Link to="/projects" className="arrow-link">
                    <span>View Case Study</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                {flagshipProject?.liveDemoUrl && (
                  <a
                    href={flagshipProject.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="arrow-link text-slate-400 hover:text-white"
                  >
                    <span>Live App ↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Real-time Systems */}
          <div className="bento-card">
            <div>
              <div className="card-label">02 — Real-time Systems</div>
              <h3 className="card-title">
                {secondProject?.title || 'Zerodha Trading Dashboard'}
              </h3>
              <p className="card-text">
                {secondProject?.shortDescription ||
                  'A real-time stock market dashboard featuring WebSocket integration for live price updates and interactive charts.'}
              </p>
            </div>
            <div>
              <div className="tag-row">
                {(secondProject?.technologies || ['React', 'Socket.io', 'Chart.js']).map((tech, idx) => (
                  <span key={idx} className="tag">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4">
                {secondProject ? (
                  <Link
                    to={`/projects/${secondProject.slug || secondProject.id}`}
                    className="arrow-link"
                    onClick={() => playTick()}
                  >
                    <span>Case Study</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <Link to="/projects" className="arrow-link">
                    <span>Live Demo</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                {secondProject?.liveDemoUrl && (
                  <a
                    href={secondProject.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="arrow-link text-slate-400 hover:text-white"
                  >
                    <span>Demo ↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Education & Academic Merit */}
          <div className="bento-card">
            <div>
              <div className="card-label">Education</div>
              <div className="card-stat" ref={cgpaStatRef}>
                0.00
              </div>
              <p className="card-text">
                CGPA out of 10.0<br />
                B.Tech in Computer Science &amp; Engineering<br />
                SISTec, Bhopal
              </p>
            </div>
            <div className="pt-4 border-t border-[#26262a]">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Batch of 2026 · 6th Semester
              </span>
            </div>
          </div>

          {/* Card 4: Featured Milestone (Wide 2-col) */}
          <div className="bento-card wide">
            <div>
              <div className="card-label">Featured Milestone</div>
              <h3 className="card-title serif">
                Lead Speaker — MERN Stack Workshop
              </h3>
              <p className="card-text">
                Conducted a hands-on technical workshop for 50+ computer science students covering REST API design,
                React component lifecycle, database normalization, and deploying scalable Node applications.
              </p>
            </div>
            <div>
              <div className="tag-row">
                <span className="tag">Public Speaking</span>
                <span className="tag">Mentorship</span>
                <span className="tag">MERN Stack</span>
                <span className="tag">Architecture</span>
              </div>
            </div>
          </div>
        </div>

        {/* View All Projects Pill */}
        {publishedProjects.length > 2 && (
          <div className="text-center -mt-16 mb-24">
            <Link
              to="/projects"
              className="btn-ref btn-ref-outline"
              onClick={() => playTick()}
            >
              <span>Explore All {publishedProjects.length} Projects</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </section>

      {/* --- SKILLS & ABOUT SECTION (2-COL BENTO) --- */}
      <section id="skills" className="mb-28">
        <div className="section-title">Expertise &amp; Background</div>

        <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {/* Card 1: Technical Stack */}
          <div className="bento-card">
            <div>
              <div className="card-label">Technical Stack</div>
              <div className="skills-list">
                <div className="skill-item">
                  <span className="skill-name">JavaScript / TypeScript</span>
                  <span className="skill-level">Advanced</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">React.js &amp; Next.js</span>
                  <span className="skill-level">Advanced</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Node.js &amp; Express</span>
                  <span className="skill-level">Advanced</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">MongoDB &amp; SQL</span>
                  <span className="skill-level">Intermediate</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Python / Java</span>
                  <span className="skill-level">Intermediate</span>
                </div>
                <div className="skill-item">
                  <span className="skill-name">Git &amp; CI/CD</span>
                  <span className="skill-level">Intermediate</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#26262a]">
              <Link to="/skills" className="arrow-link" onClick={() => playTick()}>
                <span>View Full Skills Matrix</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 2: About Me */}
          <div className="bento-card" id="about">
            <div>
              <div className="card-label">About Me</div>
              <h3 className="card-title serif">
                Designing with logic, building with empathy.
              </h3>
              <p className="card-text">
                I believe great software is born at the intersection of clean code and thoughtful design. When I'm not
                building web apps, I'm exploring AI/ML models, contributing to open-source, or mentoring junior developers.
              </p>
              <p className="card-text mt-4">
                Currently pursuing B.Tech in Computer Science and Engineering at SISTec, Bhopal (CGPA: 8.42). Passionate
                about building distributed systems, real-time architectures, and high-performance user experiences.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                type="button"
                className="arrow-link"
                onClick={() => {
                  playTick();
                  if (openResumeModal) openResumeModal();
                  else showToast('Opening Resume...');
                }}
              >
                <span>Download Resume</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
              <Link to="/about" className="arrow-link text-slate-400 hover:text-white" onClick={() => playTick()}>
                <span>Read Full Story ↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- LIVE INTERACTIVE SYSTEMS & BENCHMARK (PRESERVED FUNCTIONALITY) --- */}
      <section className="mb-28">
        <div className="section-title">Developer Workbench &amp; Algorithmic Foundation</div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Developer Workbench Interactive Terminal (8 cols) */}
          <div className="lg:col-span-8">
            <DeveloperWorkbench />
          </div>

          {/* Right: Problem Solving & LeetCode Proof (4 cols) */}
          <div className="lg:col-span-4 bento-card flex flex-col justify-between">
            <div>
              <div className="card-label">Algorithmic Decomposition</div>
              <div className="card-stat text-cyan-400" ref={leetcodeStatRef}>
                0
              </div>
              <h3 className="card-title text-xl mt-2">Problems Solved Across Platforms</h3>
              <p className="card-text mt-2">
                Active problem solving on LeetCode &amp; HackerRank focusing on Data Structures, Algorithms, Dynamic
                Programming, and Tree/Graph traversal with optimal time-space complexity.
              </p>
            </div>
            <div className="pt-6 border-t border-[#26262a] mt-6">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Language: C++ / Java / Python</span>
                <span className="text-emerald-400 font-bold">Top 15% Rank</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VERIFIED CREDENTIALS (IF AVAILABLE) --- */}
      {certificates.length > 0 && (
        <section className="mb-28">
          <div className="section-title">Verified Certifications</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certificates.slice(0, 3).map((cert, idx) => (
              <CertificateCard key={cert.id} cert={cert} indexNum={idx + 1} />
            ))}
          </div>
          {certificates.length > 3 && (
            <div className="text-center mt-8">
              <Link to="/certificates" className="btn-ref btn-ref-outline" onClick={() => playTick()}>
                View All {certificates.length} Certificates ↗
              </Link>
            </div>
          )}
        </section>
      )}

      {/* --- CTA SECTION --- */}
      <section className="cta-ref-section" id="contact">
        <h2>
          Let's build something<br />
          <span className="serif">extraordinary</span> together.
        </h2>
        <p>
          I'm currently open to new opportunities, software engineering roles, and collaborations. Let's talk about how
          we can work together.
        </p>
        <div className="cta-ref-buttons">
          <Link to="/contact" className="btn-ref btn-ref-primary" onClick={() => playTick()}>
            <span>Get in Touch</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <button
            type="button"
            className="btn-ref btn-ref-outline"
            onClick={() => {
              playTick();
              if (openResumeModal) openResumeModal();
              else showToast('Opening Resume...');
            }}
          >
            <span>View Resume</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>
        </div>
      </section>

      {/* --- SOCIAL PROOF FOOTER BAR --- */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-8 border-t border-[#26262a] text-xs font-mono text-slate-500">
        <div>© {new Date().getFullYear()} Ayush Prajapati. Crafted with care &amp; precision.</div>
        <div className="flex items-center gap-5">
          <a
            href={p.socialLinks?.github || 'https://github.com/ayushprajapati9669-dev'}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href={p.socialLinks?.linkedin || 'https://linkedin.com/in/ayushprajapati'}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={p.socialLinks?.twitter || 'https://twitter.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Twitter
          </a>
          <a
            href={`mailto:${p.email || 'ayushprajapati9669@gmail.com'}`}
            className="hover:text-white transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
