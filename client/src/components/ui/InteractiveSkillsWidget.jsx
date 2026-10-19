import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { SkillCategoryTabIcon, TechLogo } from '../common/TechLogos';

gsap.registerPlugin(ScrollTrigger);

// Desired canonical order for Languages category
const LANGUAGE_PRIORITY = ['c', 'c++', 'cpp', 'java', 'javascript', 'js', 'python', 'py'];

function sortCategorySkills(categoryName, items) {
  if (!Array.isArray(items)) return [];
  const cName = String(categoryName || '').toLowerCase();

  if (cName.includes('language')) {
    const getRank = (item) => {
      const name = String(item.name || '').toLowerCase().trim();
      const key = String(item.logoKey || '').toLowerCase().trim();

      if (name === 'c' || key === 'c') return 0;
      if (name === 'c++' || key === 'cpp' || name === 'cpp') return 1;
      if (name.includes('java') && !name.includes('javascript')) return 2;
      if (name.includes('javascript') || name === 'js' || key === 'javascript') return 3;
      if (name.includes('python') || key === 'python' || name === 'py') return 4;

      const idx = LANGUAGE_PRIORITY.indexOf(name);
      return idx !== -1 ? idx : 999;
    };

    return [...items].sort((a, b) => getRank(a) - getRank(b));
  }

  return items;
}

export function InteractiveSkillsWidget({
  showCta = false,
  onCtaClick = null,
  isStandalonePage = false
}) {
  const { appState } = usePortfolio();
  const ui = appState.uiLabels || {};

  // Extract skills categories from state or fallbacks
  const categories = Array.isArray(appState.skills) && appState.skills.length > 0
    ? appState.skills
    : [];

  const [selectedCatId, setSelectedCatId] = useState(
    categories[0]?.id || 'skill-languages'
  );

  // Active category
  const activeCat = categories.find((c) => c.id === selectedCatId) || categories[0] || {
    id: 'skill-languages',
    category: 'Languages',
    tabIcon: 'languages',
    items: []
  };

  // Sort items if Languages (1. C, 2. C++, 3. Java, 4. JavaScript, 5. Python)
  const activeItems = sortCategorySkills(activeCat.category, activeCat.items || []);

  // Number of items currently inserted into the DOM layout (no invisible placeholders)
  const [visibleCount, setVisibleCount] = useState(0);

  // Section & Animation Refs
  const sectionRef = useRef(null);
  const glowRef = useRef(null);
  const accentLineRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingWord1Ref = useRef(null);
  const headingWord2Ref = useRef(null);
  const headingWord3Ref = useRef(null);
  const introTextRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const listRegionRef = useRef(null);
  const listHeaderRef = useRef(null);
  const itemsContainerRef = useRef(null);
  const itemElsRef = useRef([]);

  // Sequence state tracking
  const timersRef = useRef([]);
  const hasEnteredViewportRef = useRef(false);
  const activeCatIdRef = useRef(activeCat.id);

  activeCatIdRef.current = activeCat.id;

  // Clear all pending reveal timers
  const cancelSequence = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Sequential reveal function (exactly 0.8s between item start times)
  const startSequence = useCallback(() => {
    cancelSequence();

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        setVisibleCount(activeItems.length);
        return;
      }
    }

    if (activeItems.length === 0) {
      setVisibleCount(0);
      return;
    }

    const currentCatId = activeCat.id;

    // Item 0 appears immediately at t = 0.0s
    setVisibleCount(1);

    // Schedule subsequent items at exactly idx * 800ms
    for (let idx = 1; idx < activeItems.length; idx++) {
      const timer = setTimeout(() => {
        // Prevent stale callback if category changed
        if (activeCatIdRef.current === currentCatId) {
          setVisibleCount((prev) => Math.max(prev, idx + 1));
        }
      }, idx * 800);
      timersRef.current.push(timer);
    }
  }, [activeItems.length, activeCat.id, cancelSequence]);

  // When active category changes: cancel previous, clear old items, start fresh
  const handleSelectCategory = (catId) => {
    if (catId === selectedCatId) return;
    cancelSequence();
    setSelectedCatId(catId);
    setVisibleCount(0);

    // If section is already visible, immediately start sequence for new category
    if (hasEnteredViewportRef.current) {
      // Small tick to ensure clean state flush
      const t = setTimeout(() => {
        startSequence();
      }, 50);
      timersRef.current.push(t);
    }
  };

  // Manual replay button
  const handleReplay = () => {
    cancelSequence();
    setVisibleCount(0);
    const t = setTimeout(() => {
      startSequence();
    }, 60);
    timersRef.current.push(t);
  };

  // Keyboard navigation for category tabs
  const handleTabKeyDown = (e, index) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (index + 1) % categories.length;
      handleSelectCategory(categories[nextIdx].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (index - 1 + categories.length) % categories.length;
      handleSelectCategory(categories[prevIdx].id);
    }
  };

  // Animate newly added skill item when visibleCount increments
  useLayoutEffect(() => {
    if (visibleCount <= 0) return;
    const targetIdx = visibleCount - 1;
    const el = itemElsRef.current[targetIdx];

    if (el) {
      const prefersReduced = typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        gsap.set(el, { opacity: 1, y: 0, scale: 1 });
      } else {
        gsap.fromTo(
          el,
          { opacity: 0, y: 7, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.38,
            ease: 'power2.out',
            clearProps: 'transform'
          }
        );
      }
    }
  }, [visibleCount]);

  // Master GSAP ScrollTrigger Context
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return undefined;

    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ----------------------------------------------------------------------
      // Effect A — Section Entrance
      // ----------------------------------------------------------------------
      if (!prefersReduced) {
        const entranceTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionEl,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });

        // 1. Eyebrow fades in & rises slightly
        if (eyebrowRef.current) {
          entranceTl.fromTo(
            eyebrowRef.current,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
          );
        }

        // 2. Heading reveals with subtle text stagger
        const headingElements = [
          headingWord1Ref.current,
          headingWord2Ref.current,
          headingWord3Ref.current
        ].filter(Boolean);

        if (headingElements.length > 0) {
          entranceTl.fromTo(
            headingElements,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' },
            '-=0.25'
          );
        }

        // 3. Introductory line
        if (introTextRef.current) {
          entranceTl.fromTo(
            introTextRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            '-=0.2'
          );
        }

        // 4. Category tabs reveal one by one
        if (tabsContainerRef.current) {
          const tabBtns = tabsContainerRef.current.querySelectorAll('.skills-tab-btn');
          if (tabBtns.length > 0) {
            entranceTl.fromTo(
              tabBtns,
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.38, stagger: 0.05, ease: 'power2.out' },
              '-=0.2'
            );
          }
        }
      }

      // ----------------------------------------------------------------------
      // Effect B — Scroll-Linked Accent Line
      // ----------------------------------------------------------------------
      if (accentLineRef.current) {
        gsap.fromTo(
          accentLineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionEl,
              start: 'top 80%',
              end: 'bottom 35%',
              scrub: 0.6
            }
          }
        );
      }

      // ----------------------------------------------------------------------
      // Effect D — Scroll-Driven Visual Response (Subtle background glow shift)
      // ----------------------------------------------------------------------
      if (glowRef.current && !prefersReduced) {
        gsap.to(glowRef.current, {
          x: 45,
          y: 35,
          opacity: 0.16,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionEl,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }

      // ----------------------------------------------------------------------
      // Effect C — Skill-List Reveal
      // ----------------------------------------------------------------------
      if (listRegionRef.current) {
        ScrollTrigger.create({
          trigger: listRegionRef.current,
          start: 'top 85%',
          onEnter: () => {
            hasEnteredViewportRef.current = true;

            // Subtle list header reveal
            if (listHeaderRef.current && !prefersReduced) {
              gsap.fromTo(
                listHeaderRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' }
              );
            }

            // Start sequential skill reveal
            startSequence();
          },
          onLeaveBack: () => {
            // Natural reverse behavior
            hasEnteredViewportRef.current = false;
          }
        });
      }
    }, sectionRef);

    return () => {
      cancelSequence();
      ctx.revert();
    };
  }, [cancelSequence, startSequence]);

  // Only render revealed items (NO invisible placeholders)
  const revealedItems = activeItems.slice(0, visibleCount);

  return (
    <section
      ref={sectionRef}
      id="skills-section"
      className={`relative overflow-hidden ${
        isStandalonePage ? 'space-y-10' : 'scroll-reveal border-t hairline-border pt-16 space-y-10'
      }`}
    >
      {/* Effect D: Restrained decorative ambient glow responding to scroll */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute -top-24 -left-20 h-96 w-96 rounded-full bg-cyanglow/10 blur-[110px] -z-10"
        aria-hidden="true"
      />

      {/* Top Header Region */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          {/* Section Eyebrow Label */}
          <p
            ref={eyebrowRef}
            className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-cyanglow"
          >
            {ui.homeSkillsEyebrow || '03 — TECHNICAL CAPABILITIES'}
          </p>

          {/* Section Heading with 'Skills' highlighted in cyan/mint */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-alabaster">
            <span ref={headingWord1Ref} className="inline-block mr-2">
              Interactive
            </span>
            <span ref={headingWord2Ref} className="inline-block text-cyanglow mr-2">
              Skills
            </span>
            <span ref={headingWord3Ref} className="inline-block">
              & Tech Stack
            </span>
          </h2>

          {/* Introductory line */}
          <p
            ref={introTextRef}
            className="text-sm sm:text-base text-stonewarm leading-relaxed pt-1"
          >
            Curated technical stack and core competencies applied across live full-stack projects, databases, and problem solving.
          </p>
        </div>

        {/* Optional CTA button on Home page */}
        {showCta && onCtaClick && (
          <button
            type="button"
            onClick={onCtaClick}
            className="focus-ring self-start sm:self-end rounded-full border border-white/15 bg-charcoal px-5 py-2.5 font-mono text-xs font-semibold text-alabaster transition-colors hover:border-cyanglow hover:text-cyanglow"
          >
            {ui.homeSkillsCta || 'Open Full Skills View'} →
          </button>
        )}
      </div>

      {/* Effect B: Scroll-Linked Thin Accent Line (Scrubbed to scroll position) */}
      <div className="skills-accent-track">
        <div
          ref={accentLineRef}
          className="h-full w-full bg-gradient-to-r from-cyanglow via-teal-400 to-amberwarm origin-left scale-x-0"
        />
      </div>

      {/* Category Navigation Tabs */}
      <div
        ref={tabsContainerRef}
        role="tablist"
        aria-label="Skill Categories"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
      >
        {categories.map((cat, idx) => {
          const isSelected = cat.id === activeCat.id;
          return (
            <button
              key={cat.id}
              role="tab"
              id={`tab-${cat.id}`}
              aria-selected={isSelected}
              aria-controls={`tabpanel-${cat.id}`}
              tabIndex={isSelected ? 0 : -1}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              onKeyDown={(e) => handleTabKeyDown(e, idx)}
              className={`skills-tab-btn focus-ring skills-tab-card ${
                isSelected ? 'skills-tab-active' : ''
              } rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-center gap-2 text-center transition-all`}
            >
              <SkillCategoryTabIcon tabIconKey={cat.tabIcon || cat.category} isActive={isSelected} />
              <span
                className={`font-display text-xs sm:text-sm font-bold tracking-tight truncate max-w-full ${
                  isSelected ? 'text-white' : 'text-stonewarm'
                }`}
              >
                {cat.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skill List Region */}
      <div
        ref={listRegionRef}
        role="tabpanel"
        id={`tabpanel-${activeCat.id}`}
        aria-labelledby={`tab-${activeCat.id}`}
        className="rounded-3xl border border-white/10 bg-[#0B0F1C]/85 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-xl"
      >
        {/* Category Title & Skill Count Header */}
        <div
          ref={listHeaderRef}
          className="flex flex-wrap items-center justify-between gap-4 border-b hairline-border pb-4"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeCat.category}
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyanglow/30 bg-cyanglow/10 px-3 py-0.5 font-mono text-xs font-semibold text-cyanglow">
              <span className="h-1.5 w-1.5 rounded-full bg-cyanglow animate-pulse" />
              {activeItems.length} {activeItems.length === 1 ? 'skill' : 'skills'}
            </span>
          </div>

          {/* Replay animation control */}
          <button
            type="button"
            onClick={handleReplay}
            title="Replay sequential reveal animation"
            className="skills-replay-btn focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-charcoal/80 px-3.5 py-1.5 font-mono text-xs font-medium text-stonewarm"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Replay</span>
          </button>
        </div>

        {/* Compact Inline Skill List (NO cards, NO containers around logos, NO separator lines, NO placeholders) */}
        <div
          ref={itemsContainerRef}
          className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2"
        >
          {revealedItems.map((item, idx) => (
            <div
              key={`${activeCat.id}-${item.name}-${idx}`}
              ref={(el) => (itemElsRef.current[idx] = el)}
              className="inline-flex items-center gap-2 py-1 px-1.5 text-stone-200 font-display text-sm sm:text-base font-semibold select-none group transition-colors hover:text-white"
            >
              <TechLogo
                name={item.logoKey || item.name}
                className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <span className="tracking-tight">{item.name}</span>
            </div>
          ))}

          {/* Fallback empty message */}
          {activeItems.length === 0 && (
            <p className="font-mono text-xs text-stonewarm py-2">
              No skills added to this category yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
