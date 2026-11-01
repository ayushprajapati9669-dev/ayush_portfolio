import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export function BackgroundLayers() {
  const mouseLightRef = useRef(null);
  const location = useLocation();

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
      {/* VSLFlow Gold Radial Glow from Bottom-Center */}
      <div
        className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[900px] max-w-[100vw] h-[400px] z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(212, 175, 55, 0.07), rgba(212, 175, 55, 0.02) 55%, transparent 75%)'
        }}
        aria-hidden="true"
      />

      {/* Very subtle gold top ambient */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-[90vw] h-[300px] z-0"
        style={{
          background: 'radial-gradient(ellipse 55% 40% at 50% 0%, rgba(212, 175, 55, 0.04), transparent 70%)'
        }}
        aria-hidden="true"
      />

      {/* Pure Black Canvas */}
      <div className={`liquid-bg ${isCaseStudy ? 'liquid-bg-case-study' : ''}`} aria-hidden="true">
        {/* Subtle gold aurora blob bottom-left */}
        <div className="aurora-blob aurora-1" />
        {/* Subtle gold aurora blob top-right */}
        <div className="aurora-blob aurora-2" />
      </div>

      {/* Architectural 4-Column Hairline Guides */}
      <div className="editorial-grid-guides" aria-hidden="true" />

      {/* Film Grain Noise Texture Overlay */}
      <div className="bg-noise" aria-hidden="true" />

      {/* Minimal Gold-Tinted Cursor Spotlight */}
      <div className="mouse-light" id="mouseLight" ref={mouseLightRef} aria-hidden="true" />
    </>
  );
}
