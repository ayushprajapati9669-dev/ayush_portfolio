import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { playTick } from '../../utils/audio';
import { TechLogo } from '../common/TechLogos';

// High-quality showcase image presets for demonstration if custom upload is pending
const SHOWCASE_DEFAULTS = [
  {
    id: 'spotlight-hackathon-win',
    title: '🏆 1st Place: National Innovation Hackathon',
    categoryBadge: '🏆 1st Place Winner',
    metaLabel: 'Hackathon · National Finals',
    yearBadge: 'Year 3 · 2025',
    metric: '₹1,00,000 Cash Prize · Top 1% of 150+ Teams',
    description:
      'Engineered a scalable full-stack real-time collaboration ecosystem under high-pressure 36-hour sprint. Pitched the architectural design and live demo to industry jury members, winning 1st place out of 150+ competing engineering teams.',
    imageUrl:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'Hackathon Winner Stage Showcase',
    technologies: ['React JS', 'Node.js', 'MongoDB', 'Socket.io', 'Tailwind CSS'],
    link: '/projects',
    githubUrl: 'https://github.com/ayushprajapati9669-dev'
  },
  {
    id: 'spotlight-sde-internship',
    title: '💼 Software Engineering Intern — Production API & Systems',
    categoryBadge: '💼 SDE Internship',
    metaLabel: 'Industry Experience · Full-Stack',
    yearBadge: 'Year 3 · 2025',
    metric: 'Shipped to 10k+ Users · 40% Latency Reduction',
    description:
      'Spearheaded production-grade feature development, building modular REST endpoints and optimizing database aggregations. Collaborated with senior engineers on code reviews, CI/CD pipelines, and high-availability server architecture.',
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'Software Engineering Team Workspace',
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'Redis', 'Docker', 'AWS'],
    link: '/projects',
    githubUrl: 'https://github.com/ayushprajapati9669-dev'
  },
  {
    id: 'spotlight-tech-talk',
    title: '🎤 Full-Stack Web Architecture Workshop Lead',
    categoryBadge: '🎤 Speaker & Mentor',
    metaLabel: 'Community Leadership · Technical Workshop',
    yearBadge: 'Year 2–3 · 2024–2025',
    metric: '120+ Student Attendees · Hands-on Coding Lab',
    description:
      'Organized and delivered a comprehensive 2-day technical bootcamp on MERN stack architecture, asynchronous JavaScript, and Git/GitHub collaboration workflows for aspiring student engineers at SISTec Bhopal.',
    imageUrl:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'Technical Presentation on Stage',
    technologies: ['MERN Stack', 'System Design', 'Git & GitHub', 'REST APIs'],
    link: '/skills',
    githubUrl: 'https://github.com/ayushprajapati9669-dev'
  }
];

export function MilestoneSpotlightSlider({
  milestones = [],
  onCardMouseMove,
  onCardMouseLeave,
  onMagneticMouseMove,
  onMagneticMouseLeave
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const slideContentRef = useRef(null);

  // Extract spotlight items: items that either have an image, or are tagged Hackathon/Internship/Pinned
  const realSpotlightItems = (milestones || [])
    .filter((m) => {
      if (!m || m.published === false) return false;
      const isPinned = m.pinned === true;
      const hasImage = Boolean(m.image && m.image.trim() !== '');
      const isHighRating = m.rating >= 5;
      const isHackathonOrIntern =
        (m.tags && m.tags.some((t) => /hackathon|internship|award|win|talk/i.test(t))) ||
        (m.metaLabel && /hackathon|internship|achievement|award/i.test(m.metaLabel)) ||
        (m.title && /hackathon|intern|place|winner|award/i.test(m.title));
      return hasImage || isPinned || isHighRating || isHackathonOrIntern;
    })
    .map((m, idx) => {
      // Map to standardized structure, using high-res fallback image if none uploaded yet
      const fallbackPreset = SHOWCASE_DEFAULTS[idx % SHOWCASE_DEFAULTS.length];
      return {
        id: m.id || `spotlight-${idx}`,
        title: m.title || fallbackPreset.title,
        categoryBadge:
          (m.tags && m.tags[0]) ||
          (m.title && m.title.includes('🏆') ? '🏆 1st Place Winner' : m.title && m.title.includes('💼') ? '💼 SDE Internship' : '🏆 Major Achievement'),
        metaLabel: m.metaLabel || m.year || 'Flagship Milestone',
        yearBadge: m.yearBadge || m.year || 'Year 3',
        metric: m.metric || (m.status === 'completed' ? 'Verified Achievement · 100% Completed' : 'Current Active Focus'),
        description: m.desc || m.description || fallbackPreset.description,
        imageUrl: m.image && m.image.trim() !== '' ? m.image : fallbackPreset.imageUrl,
        imageAlt: m.imageAlt || m.title || 'Milestone visual showcase',
        technologies: m.tags && m.tags.length > 0 ? m.tags : fallbackPreset.technologies,
        link: m.link || '/projects',
        githubUrl: m.githubUrl || 'https://github.com/ayushprajapati9669-dev'
      };
    });

  // Use real items if at least 1 exists, otherwise display default showcase presets
  const displayItems = realSpotlightItems.length > 0 ? realSpotlightItems : SHOWCASE_DEFAULTS;
  const totalSlides = displayItems.length;
  const currentSlide = displayItems[currentIndex] || displayItems[0];

  // Slide transition animation
  useEffect(() => {
    if (!slideContentRef.current) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.fromTo(
      slideContentRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', clearProps: 'transform' }
    );
  }, [currentIndex]);

  // Navigate next / prev with audio
  const handleNext = () => {
    playTick();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    playTick();
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleJump = (idx) => {
    if (idx === currentIndex) return;
    playTick();
    setCurrentIndex(idx);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxImage) {
        if (e.key === 'Escape') setLightboxImage(null);
        return;
      }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, totalSlides]);

  // Lock body scroll when Lightbox is active
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxImage]);

  return (
    <>
      <div
        className="about-card spotlight-card relative overflow-hidden"
        onMouseMove={onCardMouseMove}
        onMouseLeave={onCardMouseLeave}
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <span className="realistic-icon !text-amber-400">
              <i className="fa-solid fa-trophy" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span
                  className="font-mono text-xs uppercase tracking-widest font-bold"
                  style={{ color: 'var(--brand-color, #06b6d4)' }}
                >
                  FEATURED SPOTLIGHT · HIGH-IMPACT WINS
                </span>
              </div>
              <h3 className="!mb-0 text-xl font-bold text-white tracking-tight">
                Flagship Achievements & Experience
              </h3>
            </div>
          </div>

          {/* Slide Navigation Arrows & Counter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-400 mr-2">
              0{currentIndex + 1} <span className="text-slate-600">/</span> 0{totalSlides}
            </span>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous achievement"
              className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              onMouseMove={onMagneticMouseMove}
              onMouseLeave={onMagneticMouseLeave}
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next achievement"
              className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              onMouseMove={onMagneticMouseMove}
              onMouseLeave={onMagneticMouseLeave}
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>
        </div>

        {/* Main Slide Stage (2 Columns on Desktop) */}
        <div
          ref={slideContentRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center relative z-10"
        >
          {/* Left Column: Big Photo Stage (5 Cols) */}
          <div className="lg:col-span-5 relative group">
            <div
              className="relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 bg-obsidian cursor-pointer shadow-2xl shadow-black/80"
              onClick={() => {
                playTick();
                setLightboxImage(currentSlide);
              }}
              title="Click to zoom full-screen"
            >
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.imageAlt}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Victory Tag */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/50 text-amber-300 font-mono text-xs font-bold tracking-wide shadow-lg flex items-center gap-1.5">
                  <i className="fa-solid fa-medal text-amber-400" />
                  <span>{currentSlide.categoryBadge}</span>
                </span>
              </div>

              {/* Floating Click-to-Zoom CTA */}
              <div className="absolute bottom-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
                <span className="px-3 py-1.5 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 font-mono text-[11px] font-semibold flex items-center gap-1.5 shadow-lg group-hover:border-cyan-400 transition-colors">
                  <i className="fa-solid fa-magnifying-glass-plus text-xs" />
                  <span>Full HD Zoom</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative, Impact & Metrics (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Academic Year */}
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: 'rgba(6, 182, 212, 0.12)',
                    color: 'var(--brand-color, #06b6d4)',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}
                >
                  {currentSlide.metaLabel}
                </span>

                <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-calendar-check text-[10px] text-slate-500" />
                  {currentSlide.yearBadge}
                </span>
              </div>

              {/* Slide Title */}
              <h4 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug tracking-tight">
                {currentSlide.title}
              </h4>

              {/* Key Metric Highlight */}
              {currentSlide.metric && (
                <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-xs font-bold">
                  <i className="fa-solid fa-bolt text-emerald-400" />
                  <span>{currentSlide.metric}</span>
                </div>
              )}

              {/* Description Body */}
              <div
                className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal"
                dangerouslySetInnerHTML={{ __html: currentSlide.description }}
              />

              {/* Technology Tags */}
              {currentSlide.technologies && currentSlide.technologies.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
                    Skills:
                  </span>
                  {currentSlide.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-xs text-slate-200 hover:border-cyan-400/30 hover:bg-white/10 transition-colors shadow-sm"
                    >
                      <TechLogo name={tech} className="w-3.5 h-3.5 shrink-0" />
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              {currentSlide.link && (
                <a
                  href={currentSlide.link}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-obsidian flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--brand-color, #06b6d4), var(--accent-2, #3b82f6))',
                    boxShadow: '0 4px 15px var(--brand-glow, rgba(6,182,212,0.3))'
                  }}
                >
                  <span>Explore Connected Projects</span>
                  <i className="fa-solid fa-arrow-right text-[11px]" />
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  playTick();
                  setLightboxImage(currentSlide);
                }}
                className="px-4 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 font-mono text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-expand text-[11px]" />
                <span>View Full Photo (HD)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Thumbnail Fast-Jump Navigation Tabs */}
        {totalSlides > 1 && (
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10 flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mr-2">
              All Wins:
            </span>
            {displayItems.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => handleJump(idx)}
                  className={`px-3.5 py-2 rounded-xl font-mono text-xs font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-cyan-500/15 border border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span className="truncate max-w-[200px]">{slide.title.replace(/^[🏆💼🎤🚀🎖️\s]+/, '')}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-Screen HD Lightbox Modal mounted in body portal */}
      {lightboxImage &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/92 backdrop-blur-2xl p-4 sm:p-8 animate-fadeIn"
            onClick={() => setLightboxImage(null)}
          >
            <div
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar with Title and Close Button */}
              <div className="w-full flex items-center justify-between pb-3 text-white border-b border-white/15 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold">
                    {lightboxImage.categoryBadge}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md sm:max-w-xl">
                    {lightboxImage.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110"
                  title="Close (Esc)"
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>

              {/* High-Res Image Container */}
              <div className="relative rounded-2xl overflow-hidden border border-white/20 max-h-[75vh] w-auto shadow-2xl shadow-black">
                <img
                  src={lightboxImage.imageUrl}
                  alt={lightboxImage.imageAlt}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl"
                />
              </div>

              {/* Bottom Caption Pill */}
              <p className="mt-3 font-mono text-xs text-slate-400 text-center">
                {lightboxImage.metric} · Click outside or press Esc to close
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
