import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { playTick } from '../../utils/audio';

export function NotFoundPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const numberRef = useRef(null);

  // GSAP Entrance & Floating Timeline
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(cardRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'back.out(1.2)'
      })
      .from('.nf-anim-item', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6
      }, '-=0.4');

      // 2. Floating 404 effect
      if (numberRef.current) {
        gsap.to(numberRef.current, {
          y: -10,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3D Card Tilt Physics
  const handleCardMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(card, {
      rotateX: ((y - rect.height / 2) / rect.height) * -6,
      rotateY: ((x - rect.width / 2) / rect.width) * 6,
      transformPerspective: 1200,
      duration: 0.35,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  // Magnetic button physics
  const handleMagneticMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;

    gsap.to(el, { x, y, duration: 0.35, ease: 'power2.out' });
  };

  const handleMagneticMouseLeave = (e) => {
    const el = e.currentTarget;
    gsap.to(el, { x: 0, y: 0, duration: 0.75, ease: 'elastic.out(1, 0.3)' });
  };

  const go = (path) => {
    playTick();
    navigate(path);
  };

  return (
    <main
      ref={containerRef}
      className="min-h-[80vh] flex items-center justify-center px-4 pt-28 pb-20 relative z-10"
    >
      <div
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        className="glass-card w-full max-w-xl rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-white/10 shadow-2xl relative overflow-hidden transition-shadow hover:shadow-cyan-500/10"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-vermilion/20 rounded-full blur-3xl pointer-events-none" />

        <div ref={numberRef} className="nf-anim-item inline-block font-display text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-vermilion via-amberwarm to-cyanglow drop-shadow-[0_0_35px_rgba(255,94,87,0.3)] select-none">
          404
        </div>

        <div className="space-y-2">
          <p className="nf-anim-item font-mono text-xs uppercase tracking-[0.2em] text-vermilion font-bold">
            ROUTE NOT FOUND · SYSTEM ERROR
          </p>
          <h1 className="nf-anim-item font-display text-3xl sm:text-4xl font-extrabold text-alabaster">
            Lost in Cyberspace?
          </h1>
          <p className="nf-anim-item text-sm sm:text-base text-stonewarm max-w-md mx-auto leading-relaxed">
            The page or resource you requested does not exist in Ayush Prajapati's portfolio. Let's get you back on track.
          </p>
        </div>

        <div className="nf-anim-item flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => go('/')}
            onMouseMove={handleMagneticMouseMove}
            onMouseLeave={handleMagneticMouseLeave}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-vermilion px-7 py-3 text-xs font-bold text-obsidian shadow-lg shadow-vermilion/25 hover:opacity-95 transition-all"
          >
            <span>← Back to Home</span>
          </button>
          <button
            type="button"
            onClick={() => go('/projects')}
            onMouseMove={handleMagneticMouseMove}
            onMouseLeave={handleMagneticMouseLeave}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-cyanglow/40 bg-charcoal px-6 py-3 text-xs font-semibold text-cyanglow hover:bg-cyanglow hover:text-obsidian transition-colors"
          >
            <span>Explore Projects →</span>
          </button>
        </div>
      </div>
    </main>
  );
}

