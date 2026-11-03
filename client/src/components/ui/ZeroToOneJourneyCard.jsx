import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { playTick } from '../../utils/audio';

const DEFAULT_MILESTONES = [
  {
    year: '2022',
    title: 'Started B.Tech CSE',
    desc: 'Began the Computer Science journey at SISTec, Bhopal.'
  },
  {
    year: '2023',
    title: 'Mastered MERN',
    desc: 'Built full-stack apps and launched my first SaaS.'
  },
  {
    year: '2024',
    title: 'Full Stack Engineer',
    desc: 'Working on scalable backend systems and production-ready web apps.'
  },
  {
    year: '2025',
    title: 'AI/ML Integration',
    desc: 'Learning ML models and how to deploy them in web applications.'
  }
];

// Helper to strip HTML tags from descriptions (e.g. from rich-text CMS inputs)
const stripHtml = (html) => {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export function ZeroToOneJourneyCard({ items, onExploreJourney, className = '' }) {
  const panelRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const trackRef = useRef(null);

  const [inView, setInView] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidthPercent, setThumbWidthPercent] = useState(25);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);

  // Dynamic dev/runtime milestone override support
  const [dynamicMilestones, setDynamicMilestones] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__setJourneyMilestones = (customItems) => {
        setDynamicMilestones(customItems);
      };
    }
  }, []);

  // Normalize milestone list: dynamic > passed items > default
  const milestones = useMemo(() => {
    const source = dynamicMilestones || items;
    if (Array.isArray(source) && source.length > 0) {
      const valid = source
        .filter((item) => item && item.published !== false)
        .map((item, idx) => ({
          id: item.id || `ms-${idx}`,
          year: item.year || item.yearBadge || item.phase || `Year ${idx + 1}`,
          title: item.title || item.name || 'Milestone',
          desc: stripHtml(item.desc || item.description || item.detail || '')
        }));
      if (valid.length > 0) return valid;
    }
    return DEFAULT_MILESTONES;
  }, [dynamicMilestones, items]);

  // Observer to trigger top progress track animation
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Update scroll metrics and scrollbar progress
  const updateScrollMetrics = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const overflow = maxScroll > 4;

    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < maxScroll - 6);

    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollLeft / maxScroll)) : 0;
    setScrollProgress(progress);

    const visibleRatio = scrollWidth > 0 ? clientWidth / scrollWidth : 1;
    const thumbPct = Math.min(80, Math.max(18, Math.round(visibleRatio * 100)));
    setThumbWidthPercent(thumbPct);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return undefined;

    updateScrollMetrics();
    el.addEventListener('scroll', updateScrollMetrics, { passive: true });
    window.addEventListener('resize', updateScrollMetrics, { passive: true });

    const rafId = requestAnimationFrame(updateScrollMetrics);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('scroll', updateScrollMetrics);
      window.removeEventListener('resize', updateScrollMetrics);
    };
  }, [updateScrollMetrics, milestones]);

  // Handle Spotlight Mouse Move
  const handleMouseMove = (e) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    panel.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    panel.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  // Header and arrow scroll helper
  const handleScrollBy = (amount) => {
    if (scrollContainerRef.current) {
      try {
        playTick();
      } catch {
        /* audio fallback */
      }
      scrollContainerRef.current.scrollBy({
        left: amount,
        behavior: 'smooth'
      });
    }
  };

  // Custom Track Click to Scroll
  const handleTrackClick = (e) => {
    const track = trackRef.current;
    const el = scrollContainerRef.current;
    if (!track || !el) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.min(1, Math.max(0, clickX / rect.width));
    const maxScroll = el.scrollWidth - el.clientWidth;

    try {
      playTick();
    } catch {
      /* audio fallback */
    }

    el.scrollTo({
      left: clickRatio * maxScroll,
      behavior: 'smooth'
    });
  };

  // Draggable Thumb Handlers
  const handleThumbMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStartX(e.clientX);
    if (scrollContainerRef.current) {
      setDragStartScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMouseMove = (e) => {
      const el = scrollContainerRef.current;
      const track = trackRef.current;
      if (!el || !track) return;

      const trackRect = track.getBoundingClientRect();
      const deltaX = e.clientX - dragStartX;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const scrollDelta = (deltaX / trackRect.width) * maxScroll;

      el.scrollLeft = dragStartScrollLeft + scrollDelta;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartScrollLeft]);

  // Current milestone in view index
  const activeMilestoneIndex = useMemo(() => {
    if (milestones.length <= 1) return 1;
    return Math.min(
      milestones.length,
      Math.max(1, Math.round(scrollProgress * (milestones.length - 1)) + 1)
    );
  }, [scrollProgress, milestones.length]);

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      className={`zero-to-one-journey-card relative rounded-3xl p-6 sm:p-10 border border-white/10 overflow-hidden transition-all duration-500 hover:border-amber-400/30 ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(16, 17, 24, 0.75) 0%, rgba(9, 10, 15, 0.88) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 20px 45px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)'
      }}
    >
      {/* Dynamic Mouse Radial Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 hover:opacity-100 zero-to-one-glow"
        aria-hidden="true"
      />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-[11px] font-semibold text-amber-400/90 uppercase tracking-widest block mb-1">
            CAREER TRAJECTORY
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-white font-medium tracking-tight">
            The 0 to 1 <em className="text-[#e5b869] italic font-serif">Journey</em>
          </h2>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[#e5b869] text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
            <span>Learning AI/ML</span>
          </div>

          {/* Horizontal Scroll Navigation Arrows */}
          <div
            className={`flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-full border border-white/10 transition-opacity duration-300 ${
              hasOverflow ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <button
              type="button"
              onClick={() => handleScrollBy(-300)}
              disabled={!canScrollLeft}
              aria-label="Scroll milestones left"
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-300 hover:text-amber-300 hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-500 disabled:cursor-not-allowed transition-all"
              title="Scroll left"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleScrollBy(300)}
              disabled={!canScrollRight}
              aria-label="Scroll milestones right"
              className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-300 hover:text-amber-300 hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-500 disabled:cursor-not-allowed transition-all"
              title="Scroll right"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Full Timeline Link */}
          {onExploreJourney && (
            <button
              type="button"
              onClick={onExploreJourney}
              className="text-xs font-mono text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/40"
            >
              <span>Full Timeline</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative z-10 w-full h-[2px] bg-white/[0.08] rounded-full mb-8">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: inView ? '100%' : '0%',
            background: 'linear-gradient(90deg, rgba(229,184,105,0.2) 0%, #e5b869 100%)',
            boxShadow: '0 0 16px rgba(229, 184, 105, 0.4)'
          }}
        >
          {/* Head Indicator Dot */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#e5b869] shadow-[0_0_12px_#e5b869,0_0_0_3px_rgba(229,184,105,0.2)]" />
        </div>
      </div>

      {/* Milestones Container with Edge Gradient Masks */}
      <div className="relative z-10">
        {/* Subtle Fade Edge Masks when overflow is present */}
        <div
          className={`pointer-events-none absolute left-0 top-0 bottom-2 w-8 sm:w-12 bg-gradient-to-r from-[rgba(12,13,18,0.95)] to-transparent z-20 rounded-l-2xl transition-opacity duration-300 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />
        <div
          className={`pointer-events-none absolute right-0 top-0 bottom-2 w-8 sm:w-12 bg-gradient-to-l from-[rgba(12,13,18,0.95)] to-transparent z-20 rounded-r-2xl transition-opacity duration-300 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Horizontally scrollable flex container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto zero-journey-scrollbar pb-2 pt-1 scroll-smooth"
        >
          {milestones.map((m, idx) => (
            <div
              key={m.id || idx}
              className="group/m p-5 rounded-2xl transition-all duration-300 bg-white/[0.03] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.06] hover:-translate-y-1 shadow-lg min-w-[250px] sm:min-w-[260px] max-w-[340px] flex-1 flex-shrink-0"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#e5b869] tracking-wider">
                  {m.year}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#e5b869] shadow-[0_0_8px_#e5b869]" />
              </div>
              <h3 className="font-display text-base font-semibold text-white group-hover/m:text-amber-200 transition-colors mb-1.5">
                {m.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans font-normal">
                {m.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Custom Luxury Scrollbar: Appears gracefully when content overflows or on smaller screens */}
        {hasOverflow && (
          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center gap-3 sm:gap-4 transition-all duration-300">
            {/* Label with amber pulsing dot */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400 select-none">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse" />
              <span className="text-[11px] uppercase tracking-wider text-amber-400/90 font-medium">
                Scroll Timeline
              </span>
            </div>

            {/* Clickable & Draggable Luxury Glass Track */}
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              className="relative flex-1 h-2 rounded-full bg-white/[0.06] border border-white/10 cursor-pointer overflow-hidden group/track"
              title="Click or drag to scroll timeline"
            >
              {/* Glowing Gold Luxury Thumb */}
              <div
                onMouseDown={handleThumbMouseDown}
                className="absolute top-0 bottom-0 rounded-full cursor-grab active:cursor-grabbing transition-transform duration-75"
                style={{
                  left: `${scrollProgress * (100 - thumbWidthPercent)}%`,
                  width: `${thumbWidthPercent}%`,
                  background:
                    'linear-gradient(90deg, rgba(229,184,105,0.7) 0%, #e5b869 50%, #fbbf24 100%)',
                  boxShadow:
                    '0 0 12px rgba(229, 184, 105, 0.6), inset 0 1px 0 rgba(255,255,255,0.4)'
                }}
              />
            </div>

            {/* Milestone Position Indicator */}
            <div className="text-[11px] font-mono text-zinc-400 select-none flex items-center gap-1">
              <span className="text-amber-300 font-bold">{activeMilestoneIndex}</span>
              <span>/</span>
              <span>{milestones.length} Milestones</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ZeroToOneJourneyCard;
