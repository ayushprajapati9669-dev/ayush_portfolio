import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

// Deterministic cosmic starfield coordinates to ensure zero SSR/hydration mismatch
const COSMIC_STARS = [
  { id: 1, top: '8%', left: '14%', size: 1.5, type: 'cosmic-star-gold', twinkle: 'twinkle-1' },
  { id: 2, top: '15%', left: '82%', size: 2, type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 3, top: '22%', left: '46%', size: 1.2, type: 'cosmic-star-gold', twinkle: 'twinkle-3' },
  { id: 4, top: '29%', left: '8%', size: 2.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-1' },
  { id: 5, top: '35%', left: '74%', size: 1.4, type: 'cosmic-star-gold', twinkle: 'twinkle-2' },
  { id: 6, top: '42%', left: '28%', size: 1.8, type: 'cosmic-star-diamond', twinkle: 'twinkle-3' },
  { id: 7, top: '49%', left: '92%', size: 1.2, type: 'cosmic-star-gold', twinkle: 'twinkle-1' },
  { id: 8, top: '56%', left: '19%', size: 2.4, type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 9, top: '63%', left: '62%', size: 1.5, type: 'cosmic-star-gold', twinkle: 'twinkle-3' },
  { id: 10, top: '71%', left: '38%', size: 1.2, type: 'cosmic-star-gold', twinkle: 'twinkle-1' },
  { id: 11, top: '78%', left: '85%', size: 2.0, type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 12, top: '85%', left: '12%', size: 1.6, type: 'cosmic-star-gold', twinkle: 'twinkle-3' },
  { id: 13, top: '92%', left: '53%', size: 2.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-1' },
  { id: 14, top: '12%', left: '65%', size: 1.2, type: 'cosmic-star-gold', twinkle: 'twinkle-2' },
  { id: 15, top: '25%', left: '22%', size: 1.5, type: 'cosmic-star-diamond', twinkle: 'twinkle-3' },
  { id: 16, top: '39%', left: '88%', size: 1.8, type: 'cosmic-star-gold', twinkle: 'twinkle-1' },
  { id: 17, top: '51%', left: '4%', size: 1.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 18, top: '67%', left: '78%', size: 2.0, type: 'cosmic-star-gold', twinkle: 'twinkle-3' },
  { id: 19, top: '74%', left: '24%', size: 1.4, type: 'cosmic-star-diamond', twinkle: 'twinkle-1' },
  { id: 20, top: '88%', left: '70%', size: 1.6, type: 'cosmic-star-gold', twinkle: 'twinkle-2' },
  { id: 21, top: '18%', left: '36%', size: 1.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-3' },
  { id: 22, top: '32%', left: '95%', size: 1.8, type: 'cosmic-star-gold', twinkle: 'twinkle-1' },
  { id: 23, top: '46%', left: '50%', size: 1.5, type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 24, top: '59%', left: '33%', size: 2.2, type: 'cosmic-star-gold', twinkle: 'twinkle-3' },
  { id: 25, top: '81%', left: '44%', size: 1.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-1' },
  { id: 26, top: '95%', left: '20%', size: 1.7, type: 'cosmic-star-gold', twinkle: 'twinkle-2' },
  { id: 27, top: '6%', left: '50%', size: 1.4, type: 'cosmic-star-diamond', twinkle: 'twinkle-3' },
  { id: 28, top: '96%', left: '88%', size: 1.9, type: 'cosmic-star-gold', twinkle: 'twinkle-1' }
];

export function BackgroundLayers() {
  const mouseLightRef = useRef(null);
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Detect individual project case study page (e.g. /projects/airbnb-clone)
  const isCaseStudy = Boolean(
    location.pathname &&
    location.pathname.startsWith('/projects/') &&
    location.pathname !== '/projects'
  );

  // Detect admin or login pages
  const isAdmin = Boolean(
    location.pathname &&
    (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login'))
  );

  // Scroll Progress Tracking for Hairline Progress Bar
  useEffect(() => {
    if (typeof window === 'undefined' || isAdmin) return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalScroll)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdmin]);

  // Cursor Spotlight Tracking with GSAP QuickTo
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const el = mouseLightRef.current;
    if (!el) return;

    // Smooth cursor interpolation with quickTo
    const xTo = gsap.quickTo(el, 'left', { duration: 0.35, ease: 'power2.out' });
    const yTo = gsap.quickTo(el, 'top', { duration: 0.35, ease: 'power2.out' });

    const handleMouseMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Top Hairline Scroll Progress Bar */}
      {!isAdmin && (
        <div
          className="scroll-progress-bar"
          style={{ transform: `scaleX(${scrollProgress})` }}
          aria-hidden="true"
        />
      )}

      {/* VSLFlow Gold Radial Glow from Bottom-Center */}
      <div
        className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[900px] max-w-[100vw] h-[400px] z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02) 55%, transparent 75%)'
        }}
        aria-hidden="true"
      />

      {/* Very subtle gold top ambient */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-[90vw] h-[300px] z-0"
        style={{
          background: 'radial-gradient(ellipse 55% 40% at 50% 0%, rgba(212, 175, 55, 0.05), transparent 70%)'
        }}
        aria-hidden="true"
      />

      {/* Pure Black Canvas with Living Breathing Nebulae */}
      <div className={`liquid-bg ${isCaseStudy ? 'liquid-bg-case-study' : ''}`} aria-hidden="true">
        {/* Living breathing gold aurora blob bottom-left */}
        <div className="aurora-blob aurora-1" />
        {/* Living breathing gold aurora blob top-right */}
        <div className="aurora-blob aurora-2" />
        {/* Celestial center-top subtle platinum nebula */}
        <div className="aurora-blob aurora-3" />
      </div>

      {/* Cosmic Starlight Twinkle Field */}
      {!isAdmin && (
        <div className="cosmic-starfield" aria-hidden="true">
          {COSMIC_STARS.map((star) => (
            <div
              key={star.id}
              className={`cosmic-star ${star.type} ${star.twinkle}`}
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`
              }}
            />
          ))}
        </div>
      )}

      {/* Architectural 4-Column Hairline Guides */}
      <div className="editorial-grid-guides" aria-hidden="true" />

      {/* Film Grain Noise Texture Overlay */}
      <div className="bg-noise" aria-hidden="true" />

      {/* Dual-Stage Gold-Tinted Cursor Spotlight */}
      <div className="mouse-light" id="mouseLight" ref={mouseLightRef} aria-hidden="true" />
    </>
  );
}
