import '../../styles/pages/journey.css';
import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { personSchema } from '../../utils/seo';
import { MilestoneSpotlightSlider } from '../../components/ui/MilestoneSpotlightSlider';
import { TechLogo } from '../../components/common/TechLogos';
import { LeetCodeMetricsBadge } from '../../components/ui/LeetCodeMetricsBadge';
import { ScrollWriteText } from '../../components/common/ScrollWriteText';
import { sanitizeHtml } from '../../utils/sanitize';

export function JourneyPage() {
  const { appState, refreshFromBackend } = usePortfolio();
  const navigate = useNavigate();
  const p = appState.profile || {};
  const ui = appState.uiLabels || {};
  const containerRef = useRef(null);

  // Interactive horizontal resizer state for LeetCode & Achievements panels
  const [splitRatio, setSplitRatio] = useState(() => {
    try {
      const saved = localStorage.getItem('journey_split_ratio');
      if (saved) {
        const num = Number(saved);
        if (!isNaN(num) && num >= 28 && num <= 72) return num;
      }
    } catch (_e) {}
    return 48;
  });
  const [isResizing, setIsResizing] = useState(false);
  const splitContainerRef = useRef(null);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    playTick('click');
  }, []);

  const resetSplitRatio = useCallback(() => {
    setSplitRatio(48);
    try {
      localStorage.setItem('journey_split_ratio', '48');
    } catch (_e) {}
    playTick('pop');
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e) => {
      if (!splitContainerRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = splitContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rawRatio = ((clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(28, Math.min(72, Math.round(rawRatio * 10) / 10));
      setSplitRatio(clamped);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      try {
        localStorage.setItem('journey_split_ratio', String(splitRatio));
      } catch (_e) {}
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('touchcancel', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('touchcancel', handlePointerUp);
    };
  }, [isResizing, splitRatio]);

  useEffect(() => {
    if (typeof refreshFromBackend === 'function') {
      refreshFromBackend();
    }
  }, [refreshFromBackend]);

  // Default / Baseline Milestones matching Portfolio Data
  const defaultMilestones = [
    {
      phase: 'Full-Stack Engineering',
      yearBadge: 'Year 3',
      title: 'MERN Stack & Deployed Applications',
      description:
        'Building full-stack MERN applications including a live Airbnb Clone on Render, an AI Agentic Workspace, and a Stock Trading simulation platform.'
    },
    {
      phase: 'Foundation',
      yearBadge: 'Year 1-2',
      title: 'Core Programming & CS Fundamentals',
      description:
        'Strong foundation in C, Java, Python, Data Structures & Algorithms, OOP, MySQL, and modern web development.'
    },
    {
      phase: 'Current Focus',
      yearBadge: 'Present',
      title: 'Algorithmic Problem-Solving & AI Integration',
      description:
        'Active problem solving on LeetCode (@ayush7162) and practical AI/LLM API integrations.'
    }
  ];

  // Map CMS learningJourney or fallback to defaultMilestones
  const milestones =
    p.learningJourney && Array.isArray(p.learningJourney) && p.learningJourney.length > 0
      ? p.learningJourney
          .filter((m) => m && m.published !== false)
          .map((m, idx) => ({
            ...m,
            id: m.id || `m-${idx}`,
            phase: m.phase || m.metaLabel || `Phase ${idx + 1}`,
            metaLabel: m.metaLabel || m.phase || `Phase ${idx + 1}`,
            yearBadge: m.yearBadge || m.year || (idx === 0 ? 'Year 3' : idx === 1 ? 'Year 1-2' : 'Present'),
            year: m.year || m.yearBadge || (idx === 0 ? 'Year 3' : idx === 1 ? 'Year 1-2' : 'Present'),
            title: m.title || 'Untitled Milestone',
            description: m.description || m.desc || m.detail || '',
            desc: m.desc || m.description || m.detail || '',
            icon: m.icon || 'fa-layer-group',
            status: m.status,
            metric: m.metric,
            image: m.image || (Array.isArray(m.images) && m.images[0]) || null,
            images: Array.isArray(m.images) && m.images.length > 0 ? m.images : (m.image ? [m.image] : []),
            hdImages: Array.isArray(m.hdImages) && m.hdImages.length > 0 ? m.hdImages : (Array.isArray(m.images) && m.images.length > 0 ? m.images : (m.image ? [m.image] : [])),
            link: m.link || '',
            progress: m.progress !== undefined ? Number(m.progress) : null,
            rating: m.rating !== undefined ? Number(m.rating) : 0,
            spotlight: m.spotlight !== undefined ? Boolean(m.spotlight) : Boolean(m.pinned),
            pinned: Boolean(m.pinned),
            skills: Array.isArray(m.skills) && m.skills.length > 0
              ? m.skills
              : Array.isArray(m.tags) && m.tags.length > 0
              ? m.tags
              : typeof m.skills === 'string' && m.skills.trim()
              ? m.skills.split(',').map((s) => s.trim()).filter(Boolean)
              : typeof m.tags === 'string' && m.tags.trim()
              ? m.tags.split(',').map((s) => s.trim()).filter(Boolean)
              : [],
            tags: Array.isArray(m.tags) && m.tags.length > 0
              ? m.tags
              : Array.isArray(m.skills) && m.skills.length > 0
              ? m.skills
              : []
          }))
      : defaultMilestones;

  // All verified milestones and achievements are rendered in the comprehensive timeline
  const timelineMilestones = useMemo(() => {
    return milestones;
  }, [milestones]);

  // Pass all verified milestones to spotlight slider (it prioritizes featured first)
  const spotlightMilestones = useMemo(() => {
    return milestones;
  }, [milestones]);

  // 3D Card Tilt Physics
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
      rotateX: ((y - rect.height / 2) / rect.height) * -3.5,
      rotateY: ((x - rect.width / 2) / rect.width) * 3.5,
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



  // Magnetic Button Physics
  const handleMagneticMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;

    gsap.to(el, { x, y, duration: 0.4, ease: 'power2.out' });
  };

  const handleMagneticMouseLeave = (e) => {
    const el = e.currentTarget;
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
  };

  // Entrance Animations
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.page-header > *',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo('.spotlight-section .spotlight-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.08, clearProps: 'all' }
      );

      gsap.fromTo('.leetcode-section',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.12, clearProps: 'all' }
      );

      gsap.fromTo('.bottom-section .about-card',
        { y: 35, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power2.out', delay: 0.15, clearProps: 'all' }
      );

      // Timeline items staggered slide-in
      gsap.fromTo('.timeline-item',
        { x: -20, opacity: 0 },
        { y: 0, x: 0, opacity: 1, duration: 0.5, stagger: 0.07, delay: 0.25, ease: 'power2.out', clearProps: 'all' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="journey-page" ref={containerRef}>
      <SEO
        title="Journey & Career Milestones | Ayush Prajapati"
        description="Explore Ayush Prajapati's software engineering journey, verified milestones, LeetCode progress, and academic timeline."
        schema={personSchema(p)}
      />

      {/* Page Header */}
      <div className="page-header">
        <ScrollWriteText
          as="div"
          className="page-tagline"
          mode="scramble"
          scrambleDuration={20}
        >
          {ui.journeyEyebrow || '05 · TRACK RECORD & MILESTONES'}
        </ScrollWriteText>
        <ScrollWriteText
          as="h1"
          className="page-title hero-editorial-title text-left !m-0 !p-0 !max-w-none"
          mode="mask"
          stagger={0.04}
          highlightWords={['Achievements']}
        >
          Milestones & *Achievements*
        </ScrollWriteText>
        <ScrollWriteText
          as="p"
          className="page-desc mt-4"
          mode="words"
          stagger={0.02}
        >
          Verified engineering milestones, hackathon track record, and algorithmic problem-solving progression across my undergraduate journey.
        </ScrollWriteText>
      </div>

      {/* Part 1: Featured Milestone Spotlight Carousel */}
      <div className="spotlight-section">
        <MilestoneSpotlightSlider
          milestones={spotlightMilestones}
          onCardMouseMove={handleCardMouseMove}
          onCardMouseLeave={handleCardMouseLeave}
          onMagneticMouseMove={handleMagneticMouseMove}
          onMagneticMouseLeave={handleMagneticMouseLeave}
        />
      </div>

      {/* Part 2 & 3: Horizontally Resizable Row (LeetCode & Achievements) */}
      <div
        ref={splitContainerRef}
        className={`journey-split-wrapper ${isResizing ? 'is-resizing' : ''}`}
        style={{ '--split-ratio': `${splitRatio}%` }}
      >
        {/* Left Pane: LeetCode & Problem Solving Metrics */}
        <div className="journey-split-pane journey-split-pane-left">
          <div className="leetcode-section">
            <LeetCodeMetricsBadge />
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div
          className={`journey-split-divider ${isResizing ? 'active' : ''}`}
          onMouseDown={startResizing}
          onTouchStart={startResizing}
          onDoubleClick={resetSplitRatio}
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          aria-valuenow={Math.round(splitRatio)}
          aria-valuemin={28}
          aria-valuemax={72}
          aria-label="Resize LeetCode and Achievements panels horizontally"
          title="Drag horizontally to resize · Double-click to reset (50/50)"
        >
          <div className="split-divider-line" />
          <div className="split-divider-pill" aria-hidden="true">
            <i className="fa-solid fa-grip-lines-vertical" />
          </div>
          <div className="split-divider-line" />
        </div>

        {/* Right Pane: Dynamic Achievements & Journey Timeline (from Admin CMS) */}
        <div className="journey-split-pane journey-split-pane-right">
          <div className="bottom-section">
            <div className="about-card">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 style={{ margin: 0 }}>
                  <span className="realistic-icon">
                    <i className="fa-solid fa-trophy" />
                  </span>{' '}
                  <span>Achievements & Journey</span>
                </h3>
                <span className="text-sm font-mono text-slate-300 font-medium">
                  {timelineMilestones.length} Verified Entries
                </span>
              </div>

              <div
                className="timeline-list"
                tabIndex={0}
                aria-label="Achievements and journey timeline list"
              >
                {timelineMilestones.map((item, idx) => {
                  const cleanPhase = (item.phase || item.metaLabel || '').replace(/\s*·\s*Year\s*[\d–-]+/i, '').trim();
                  const showYear = item.yearBadge && !cleanPhase.toLowerCase().includes(String(item.yearBadge).toLowerCase());
                  const displayPhase = cleanPhase || item.phase || item.metaLabel || 'Milestone';
                  const displayDesc = item.description || item.desc || '';
                  return (
                    <div key={item.id || idx} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-year">
                        <span>{displayPhase}</span>
                        {showYear && <span> · {item.yearBadge}</span>}
                        {item.status && (
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              marginLeft: 'auto',
                              background:
                                item.status === 'completed'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : item.status === 'planned'
                                    ? 'rgba(168, 85, 247, 0.15)'
                                    : 'rgba(212, 175, 55, 0.15)',
                              color:
                                item.status === 'completed'
                                  ? '#34d399'
                                  : item.status === 'planned'
                                    ? '#c084fc'
                                    : '#d4af37',
                              border: `1px solid ${item.status === 'completed'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : item.status === 'planned'
                                  ? 'rgba(168, 85, 247, 0.3)'
                                  : 'rgba(212, 175, 55, 0.3)'
                                }`
                            }}
                          >
                            {item.status === 'completed'
                              ? 'Completed'
                              : item.status === 'planned'
                                ? 'Target'
                                : 'Current Focus'}
                          </span>
                        )}
                      </div>
                      <div className="timeline-title flex items-center justify-between gap-2">
                        <span>{item.title}</span>
                        {item.metric && (
                          <span
                            style={{
                              fontSize: '12.5px',
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: '700',
                              color: 'var(--accent-1, #d4af37)',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              background: 'rgba(212, 175, 55, 0.1)',
                              border: '1px solid rgba(212, 175, 55, 0.25)',
                              flexShrink: 0
                            }}
                          >
                            {item.metric}
                          </span>
                        )}
                      </div>
                      {displayDesc && (
                        <div
                          className="timeline-desc"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(displayDesc) }}
                        />
                      )}
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="max-h-36 rounded-lg mt-2.5 border border-white/10 object-cover"
                        />
                      )}
                      {item.progress !== null && item.status === 'focus' && (
                        <div className="mt-2.5 max-w-xs">
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-blue-500 rounded-full"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-300 font-mono mt-1 block">
                            {item.progress}% progress
                          </span>
                        </div>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-yellow-400 hover:text-yellow-300 font-semibold mt-2"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                          <span>View Project Resource</span>
                        </a>
                      )}
                      {item.skills && item.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {item.skills.map((sk, skIdx) => (
                            <span
                              key={skIdx}
                              className="inline-flex items-center gap-1.5"
                              style={{
                                fontSize: '12.5px',
                                fontFamily: 'JetBrains Mono, monospace',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#e2e8f0'
                              }}
                            >
                              <TechLogo name={sk} className="w-3.5 h-3.5 shrink-0" />
                              <span>{sk}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default JourneyPage;
