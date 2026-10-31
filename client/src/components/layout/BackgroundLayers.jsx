import React, { useState, useEffect, useRef } from 'react';
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

  const [showDroplets, setShowDroplets] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowDroplets(true), 150);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Realistic 3D Deep Oceanic Liquid Background */}
      <div className={`liquid-bg ${isCaseStudy ? 'liquid-bg-case-study' : ''}`} aria-hidden="true">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
        <div className="aurora-blob aurora-3" />
      </div>

      {/* 6 Realistic 3D Floating Liquid Droplets — hidden on case study detail pages and admin to ensure 100% text legibility */}
      {!isCaseStudy && !isAdmin && showDroplets && (
        <div className="spheres-container" aria-hidden="true">
          <div className="droplet" />
          <div className="droplet" />
          <div className="droplet" />
          <div className="droplet" />
          <div className="droplet" />
          <div className="droplet" />
        </div>
      )}

      {/* Noise Texture Overlay at opacity: 0.04 */}
      <div className="bg-noise" aria-hidden="true" />

      {/* Vibrant Water Blue Mouse Light Follower */}
      <div className="mouse-light" id="mouseLight" ref={mouseLightRef} aria-hidden="true" />
    </>
  );
}

