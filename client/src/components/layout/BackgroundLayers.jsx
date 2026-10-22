import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function BackgroundLayers() {
  const mouseLightRef = useRef(null);

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
      <div className="liquid-bg" aria-hidden="true">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
        <div className="aurora-blob aurora-3" />
      </div>

      {/* 6 Realistic 3D Floating Liquid Droplets */}
      <div className="spheres-container" aria-hidden="true">
        <div className="droplet" />
        <div className="droplet" />
        <div className="droplet" />
        <div className="droplet" />
        <div className="droplet" />
        <div className="droplet" />
      </div>

      {/* Noise Texture Overlay at opacity: 0.04 */}
      <div className="bg-noise" aria-hidden="true" />

      {/* Vibrant Water Blue Mouse Light Follower */}
      <div className="mouse-light" id="mouseLight" ref={mouseLightRef} aria-hidden="true" />
    </>
  );
}

