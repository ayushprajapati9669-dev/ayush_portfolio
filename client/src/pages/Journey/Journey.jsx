import React, { useEffect, useRef, useMemo } from 'react';
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

export function JourneyPage() {
  const { appState } = usePortfolio();
  const navigate = useNavigate();
  const p = appState.profile || {};
  const ui = appState.uiLabels || {};
  const containerRef = useRef(null);

  // Default / Baseline Milestones matching Portfolio Data
  const defaultMilestones = [
    {
      phase: 'Full-Stack Practice',
      yearBadge: 'Year 3',
      title: 'MERN Stack & Interactive Systems',
      description:
        'Building a Zerodha-inspired trading dashboard and a ChatGPT-inspired conversational AI workspace.'
    },
    {
      phase: 'Foundation',
      yearBadge: 'Year 1-2',
      title: 'Core Programming & CS Fundamentals',
      description:
        'Strong foundation in C, Java, Python, OOP, MySQL, and HTML/CSS.'
    },
    {
      phase: 'Current Focus',
      yearBadge: 'Present',
      title: 'Algorithmic Depth & AI Integration',
      description:
        'Deepening DSA fluency and exploring practical AI/ML integration.'
    }
  ];

  // Map CMS learningJourney or fallback to defaultMilestones
  const milestones =
    p.learningJourney && Array.isArray(p.learningJourney) && p.learningJourney.length > 0
      ? p.learningJourney
          .filter((m) => m.published !== false)
          .map((m, idx) => ({
            ...m,
            id: m.id || `m-${idx}`,
            phase: m.phase || m.metaLabel || `Phase ${idx + 1}`,
            yearBadge: m.yearBadge || m.year || (idx === 0 ? 'Year 3' : idx === 1 ? 'Year 1-2' : 'Present'),
            title: m.title,
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
            skills: Array.isArray(m.skills)
              ? m.skills
              : Array.isArray(m.tags)
              ? m.tags
              : m.skills
              ? m.skills.split(',').map((s) => s.trim()).filter(Boolean)
              : m.tags
              ? m.tags.split(',').map((s) => s.trim()).filter(Boolean)
              : []
          }))
      : defaultMilestones;

  // Separate into spotlight highlights vs journey timeline items
  const spotlightMilestones = useMemo(() => {
    const list = milestones.filter((m) => m.spotlight === true || (m.spotlight === undefined && m.pinned === true));
    return list.length > 0 ? list : milestones;
  }, [milestones]);

  const timelineMilestones = useMemo(() => {
    const nonSpotlight = milestones.filter((m) => !m.spotlight && !m.pinned);
    return nonSpotlight.length > 0 ? nonSpotlight : milestones;
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
    <main className="journey-page about-page" ref={containerRef}>
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
          {ui.journeyEyebrow || '02 · TRACK RECORD & MILESTONES'}
        </ScrollWriteText>
        <ScrollWriteText
          as="h1"
          className="page-title"
          mode="mask"
          stagger={0.04}
          highlightWords={['Milestones', 'Achievements']}
        >
          {ui.journeyHeading || 'Milestones & Achievements'}
        </ScrollWriteText>
        <ScrollWriteText
          as="p"
          className="page-desc"
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

      {/* Part 2: LeetCode & Problem Solving Metrics with Dedicated Spacing */}
      <div className="leetcode-section">
        <LeetCodeMetricsBadge />
      </div>

      {/* Part 3: Dynamic Achievements & Journey Timeline (from Admin CMS) */}
      <div className="bottom-section">
        <div
          className="about-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
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
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            tabIndex={0}
            onWheel={(e) => {
              e.stopPropagation();
              e.currentTarget.scrollTop += e.deltaY;
            }}
          >
            {timelineMilestones.map((item, idx) => {
              const cleanPhase = (item.phase || '').replace(/\s*·\s*Year\s*[\d–-]+/i, '').trim();
              const showYear = item.yearBadge && !cleanPhase.toLowerCase().includes(item.yearBadge.toLowerCase());
              return (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-year">
                    <span>{cleanPhase || item.phase}</span>
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
                          border: `1px solid ${
                            item.status === 'completed'
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
                  <div
                    className="timeline-desc"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
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
    </main>
  );
}

export default JourneyPage;
