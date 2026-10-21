import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function BackgroundLayers() {
  const mouseLightRef = useRef(null);
  const spheresRef = useRef(null);

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

    // Subtle gentle floating drift for the spheres
    let spheresAnim = null;
    if (spheresRef.current) {
      const spheres = spheresRef.current.querySelectorAll('.sphere');
      spheresAnim = gsap.to(spheres, {
        y: 'random(-15, 15)',
        x: 'random(-10, 10)',
        rotation: 'random(-8, 8)',
        duration: 'random(3.5, 6)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.6,
          from: 'random'
        }
      });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (spheresAnim) spheresAnim.kill();
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
      <div ref={spheresRef} className="spheres-container" aria-hidden="true">
        <div className="sphere" />
        <div className="sphere" />
        <div className="sphere" />
        <div className="sphere" />
      </div>

      {/* Subtle Noise Texture */}
      <div className="bg-noise" aria-hidden="true" />

      {/* Mouse Glowing Light Follower */}
      <div className="mouse-light" id="mouseLight" ref={mouseLightRef} aria-hidden="true" />
    </>
  );
}

