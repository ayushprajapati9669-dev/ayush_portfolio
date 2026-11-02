import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useSmoothScroll } from '../common/SmoothScrollProvider';
import { VantaBirdsBackground } from '../ui/VantaBirdsBackground';

// Deterministic cosmic starfield coordinates to ensure zero SSR/hydration mismatch
const COSMIC_STARS = [
  { id: 1,  top: '8%',  left: '14%', size: 1.5, type: 'cosmic-star-gold',    twinkle: 'twinkle-1' },
  { id: 2,  top: '15%', left: '82%', size: 2,   type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 3,  top: '22%', left: '46%', size: 1.2, type: 'cosmic-star-gold',    twinkle: 'twinkle-3' },
  { id: 4,  top: '29%', left: '8%',  size: 2.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-1' },
  { id: 5,  top: '35%', left: '74%', size: 1.4, type: 'cosmic-star-gold',    twinkle: 'twinkle-2' },
  { id: 6,  top: '42%', left: '28%', size: 1.8, type: 'cosmic-star-diamond', twinkle: 'twinkle-3' },
  { id: 7,  top: '49%', left: '92%', size: 1.2, type: 'cosmic-star-gold',    twinkle: 'twinkle-1' },
  { id: 8,  top: '56%', left: '19%', size: 2.4, type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 9,  top: '63%', left: '62%', size: 1.5, type: 'cosmic-star-gold',    twinkle: 'twinkle-3' },
  { id: 10, top: '71%', left: '38%', size: 1.2, type: 'cosmic-star-gold',    twinkle: 'twinkle-1' },
  { id: 11, top: '78%', left: '85%', size: 2.0, type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 12, top: '85%', left: '12%', size: 1.6, type: 'cosmic-star-gold',    twinkle: 'twinkle-3' },
  { id: 13, top: '92%', left: '53%', size: 2.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-1' },
  { id: 14, top: '12%', left: '65%', size: 1.2, type: 'cosmic-star-gold',    twinkle: 'twinkle-2' },
  { id: 15, top: '25%', left: '22%', size: 1.5, type: 'cosmic-star-diamond', twinkle: 'twinkle-3' },
  { id: 16, top: '39%', left: '88%', size: 1.8, type: 'cosmic-star-gold',    twinkle: 'twinkle-1' },
  { id: 17, top: '51%', left: '4%',  size: 1.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 18, top: '67%', left: '78%', size: 2.0, type: 'cosmic-star-gold',    twinkle: 'twinkle-3' },
  { id: 19, top: '74%', left: '24%', size: 1.4, type: 'cosmic-star-diamond', twinkle: 'twinkle-1' },
  { id: 20, top: '88%', left: '70%', size: 1.6, type: 'cosmic-star-gold',    twinkle: 'twinkle-2' },
  { id: 21, top: '18%', left: '36%', size: 1.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-3' },
  { id: 22, top: '32%', left: '95%', size: 1.8, type: 'cosmic-star-gold',    twinkle: 'twinkle-1' },
  { id: 23, top: '46%', left: '50%', size: 1.5, type: 'cosmic-star-diamond', twinkle: 'twinkle-2' },
  { id: 24, top: '59%', left: '33%', size: 2.2, type: 'cosmic-star-gold',    twinkle: 'twinkle-3' },
  { id: 25, top: '81%', left: '44%', size: 1.2, type: 'cosmic-star-diamond', twinkle: 'twinkle-1' },
  { id: 26, top: '95%', left: '20%', size: 1.7, type: 'cosmic-star-gold',    twinkle: 'twinkle-2' },
  { id: 27, top: '6%',  left: '50%', size: 1.4, type: 'cosmic-star-diamond', twinkle: 'twinkle-3' },
  { id: 28, top: '96%', left: '88%', size: 1.9, type: 'cosmic-star-gold',    twinkle: 'twinkle-1' },
];

export function BackgroundLayers() {
  
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Detect individual project case study page
  const isCaseStudy = Boolean(
    location.pathname &&
    location.pathname.startsWith('/projects/') &&
    location.pathname !== '/projects'
  );

  // Detect admin or login pages — no public background effects
  const isAdmin = Boolean(
    location.pathname &&
    (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login'))
  );

  const lenis = useSmoothScroll();

  // Scroll Progress Tracking for Hairline Progress Bar & Subtle Parallax (Frame-locked with Lenis)
  useEffect(() => {
    if (typeof window === 'undefined' || isAdmin) return;

    if (lenis) {
      const onLenisScroll = (e) => {
        if (typeof e.progress === 'number') {
          setScrollProgress(e.progress);
        }
      };
      lenis.on('scroll', onLenisScroll);
      return () => {
        if (typeof lenis.off === 'function') {
          lenis.off('scroll', onLenisScroll);
        }
      };
    }

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalScroll)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdmin, lenis]);

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

      {/* ══════════════════════════════════════════════════════════════════
          PUBLIC 3D CINEMATIC BACKGROUND SYSTEM
          Hidden on /admin and /login routes
      ══════════════════════════════════════════════════════════════════ */}
      {!isAdmin && (
        <div
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
          aria-hidden="true"
        >
          {/* Layer 0: Base Ambient Twilight Deep Obsidian Sky Canvas */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 140% 90% at 50% -10%, #121422 0%, #08090f 40%, #040507 100%)'
            }}
          />

          {/* Layer 1: High-Resolution Cinematic Dusk Landscape (Matches Uploaded Reference Photo)
              Softly dissolves on scroll so content sections rest on pure high-contrast obsidian */}
          <img
            src="/images/cinematic-dusk-landscape.jpg"
            alt=""
            className="w-full h-full object-cover object-bottom transition-all duration-700 ease-out"
            style={{
              transform: `translate3d(0, ${Math.min(100, scrollProgress * 120)}px, 0) scale(1.02)`,
              filter: 'contrast(112%) brightness(92%) saturate(108%)',
              opacity: Math.max(0.08, 0.92 - scrollProgress * 2.8)
            }}
            loading="eager"
            fetchpriority="high"
          />

          {/* Layer 2: Dynamic Living Horizon Warmth Breath */}
          <div
            className="dusk-horizon-breath pointer-events-none transition-opacity duration-500"
            style={{ opacity: Math.max(0, 1 - scrollProgress * 3.5) }}
            aria-hidden="true"
          />

          {/* Layer 3: Peaceful Twilight Birds Flocking Engine */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{ opacity: Math.max(0, 1 - scrollProgress * 3.2) }}
            aria-hidden="true"
          >
            <VantaBirdsBackground scrollProgress={scrollProgress} />
          </div>

          
          {/* Layer 4: Precision Readability Veil
              Softens center area so foreground typography and 3D UI cards pop with WCAG AAA clarity */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 75% 62% at 50% 38%, rgba(4, 5, 8, 0.78) 0%, rgba(4, 5, 8, 0.48) 50%, rgba(4, 5, 8, 0.12) 80%, transparent 100%)'
            }}
          />

          {/* Layer 5: Top Navbar Scrim for crisp header readability */}
          <div
            className="absolute inset-x-0 top-0 h-40 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(4, 5, 7, 0.88) 0%, rgba(4, 5, 7, 0.4) 60%, transparent 100%)'
            }}
          />

          {/* Layer 6: Smooth Horizon Blend into Subsequent Content Sections */}
          <div
            className="absolute inset-x-0 bottom-0 h-56 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(4, 5, 7, 0.6) 45%, #040507 100%)'
            }}
          />
        </div>
      )}

      {/* Gold Radial Horizon Ambient Base Glow */}
      <div
        className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-[900px] max-w-[100vw] h-[360px] z-0 transition-opacity duration-500"
        style={{
          opacity: Math.max(0, 1 - scrollProgress * 3.2),
          background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(212, 175, 55, 0.06), rgba(212, 175, 55, 0.015) 55%, transparent 75%)'
        }}
        aria-hidden="true"
      />

      {/* Living Atmospheric Aurora Nebulae */}
      <div className={`liquid-bg ${isCaseStudy ? 'liquid-bg-case-study' : ''}`} aria-hidden="true">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
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

      {/* High-End Micro-Film Grain Overlay */}
      <div className="bg-noise" aria-hidden="true" />

    </>
  );
}
