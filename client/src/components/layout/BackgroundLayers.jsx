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

    const handleMouseMove = (e) => {
      gsap.to(el, {
        x: e.clientX,
        y: e.clientY,
        duration: 1.2,
        ease: 'power3.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Aurora Ambient Background Blobs */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
        <div className="aurora-blob aurora-3" />
      </div>

      {/* 3D Floating Glass Spheres */}
      <div className="spheres-container" aria-hidden="true">
        <div className="sphere" />
        <div className="sphere" />
        <div className="sphere" />
        <div className="sphere" />
      </div>

      {/* Subtle Noise Texture */}
      <div className="bg-noise" aria-hidden="true" />

      {/* Mouse Glowing Light Follower */}
      <div className="mouse-light" ref={mouseLightRef} aria-hidden="true" />
    </>
  );
}
