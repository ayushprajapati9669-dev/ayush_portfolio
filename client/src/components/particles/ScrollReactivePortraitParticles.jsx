import React, { useEffect, useRef, useState } from 'react';
import { useSmoothScroll } from '../common/SmoothScrollProvider';

/**
 * ScrollReactivePortraitParticles — Razorpay AI Builders Image Particle Dissolve Engine
 * Reference: https://razorpay.com/ai-builders/
 *
 * Behavior:
 * 1. Resting State (ScrollY = 0):
 *    - Pristine studio photo is 100% visible, sharp, and clean.
 *    - Subtle stardust aura floats gently around silhouette contours.
 * 2. On Scroll (ScrollY: 0 -> 400px):
 *    - The photograph deconstructs into 1,200+ glowing golden and amber particles
 *      sampled directly from Ayush's portrait image.
 *    - Multi-depth 3D parallax: foreground particles drift upward and scatter into the cosmos.
 * 3. Scroll Reverse:
 *    - Particles magnetically converge back to their original pixel positions,
 *      reconstructing the crisp photograph.
 * 4. Interactive Mouse Physics:
 *    - Nearby particles are pushed away elastically by the cursor and spring back smoothly.
 */

const MATRIX_GLYPHS = ['0', '1', '+', '*', '·', 'x', ':', '•', '◇', '▲'];

export function ScrollReactivePortraitParticles({
  imageUrl,
  alt = 'Ayush Prajapati',
  className = '',
  imgClassName = '',
  onPhotoFit
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const lenis = useSmoothScroll();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const imgEl = imgRef.current;
    if (!container || !canvas || !imgEl) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles = [];
    let isSampled = false;

    // Offscreen sampling canvas
    const sampleCanvas = document.createElement('canvas');
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    const sampleImagePixels = () => {
      if (!imgEl.complete || imgEl.naturalWidth === 0) return;

      const rect = imgEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      sampleCanvas.width = width;
      sampleCanvas.height = height;

      sampleCtx.clearRect(0, 0, width, height);

      // Fit image onto offscreen canvas preserving contain alignment
      const nw = imgEl.naturalWidth;
      const nh = imgEl.naturalHeight;
      const scale = Math.min(width / nw, height / nh);
      const dw = nw * scale;
      const dh = nh * scale;
      const dx = (width - dw) / 2;
      const dy = height - dh; // bottom aligned

      sampleCtx.drawImage(imgEl, dx, dy, dw, dh);

      let imgData;
      try {
        imgData = sampleCtx.getImageData(0, 0, width, height).data;
      } catch (e) {
        return;
      }

      // Sample step: 4px on desktop, 6px on small screens
      const step = width > 480 ? 4 : 6;
      const pts = [];

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          const a = imgData[idx + 3];

          // Only keep subject silhouette pixels
          if (a > 45) {
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            // Spatial depth: 0.25 (deep) to 1.0 (foreground)
            const z = 0.25 + (y / height) * 0.45 + Math.random() * 0.3;

            // Scatter trajectory: outward and upward fan
            const angle = -Math.PI * 0.5 + ((x / width) - 0.5) * 1.1 + (Math.random() - 0.5) * 0.6;
            const speed = 0.8 + Math.random() * 1.1;

            // 18% matrix glyphs, 82% circular stardust points
            const isChar = Math.random() < 0.18;
            const char = isChar ? MATRIX_GLYPHS[Math.floor(Math.random() * MATRIX_GLYPHS.length)] : null;

            // Subtle warm golden highlight tint for celestial AI builder theme
            let finalR = r;
            let finalG = g;
            let finalB = b;
            if (luma > 130) {
              finalR = Math.min(255, Math.floor(r * 1.1 + 25));
              finalG = Math.min(255, Math.floor(g * 1.05 + 15));
              finalB = Math.max(0, Math.floor(b * 0.82));
            }

            pts.push({
              ox: x,
              oy: y,
              x,
              y,
              z,
              r: finalR,
              g: finalG,
              b: finalB,
              baseAlpha: Math.min(1, (a / 255) * (0.65 + (luma / 255) * 0.35)),
              radius: 1.1 + (luma / 255) * 1.7 * z,
              char,
              angle,
              speed,
              freq: 0.5 + Math.random() * 0.8,
              phase: Math.random() * Math.PI * 2,
              ampX: (4 + Math.random() * 10) * z,
              ampY: (4 + Math.random() * 8) * z,
              dispX: 0,
              dispY: 0
            });
          }
        }
      }

      particles = pts;
      isSampled = true;
    };

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      sampleImagePixels();
    } else {
      imgEl.onload = () => {
        sampleImagePixels();
        if (onPhotoFit) onPhotoFit();
      };
    }

    // Pointer Tracking
    const mouse = {
      x: -9999,
      y: -9999,
      active: false
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = (
        mouse.x >= -60 && mouse.x <= rect.width + 60 &&
        mouse.y >= -60 && mouse.y <= rect.height + 60
      );
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    // Scroll tracking
    const scrollState = {
      currentY: window.scrollY || 0,
      targetY: window.scrollY || 0
    };

    const onNativeScroll = () => {
      scrollState.targetY = window.scrollY || 0;
    };

    let lenisOff = null;
    if (lenis && typeof lenis.on === 'function') {
      const onLenisScroll = (e) => {
        if (typeof e.scroll === 'number') {
          scrollState.targetY = e.scroll;
        }
      };
      lenis.on('scroll', onLenisScroll);
      lenisOff = () => {
        if (typeof lenis.off === 'function') lenis.off('scroll', onLenisScroll);
      };
    }

    window.addEventListener('scroll', onNativeScroll, { passive: true });

    // Resize observer
    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sampleImagePixels();
      }, 150);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId = null;

    const render = (now) => {
      animId = requestAnimationFrame(render);

      if (!isSampled || particles.length === 0) return;

      const time = prefersReducedMotion ? 0 : now * 0.0018;

      // Determine live scroll position from Lenis or window
      const getLiveScroll = () => {
        if (lenis && typeof lenis.scroll === 'number') return lenis.scroll;
        return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      };

      const liveScroll = getLiveScroll();
      scrollState.targetY = liveScroll;

      // Smooth scroll interpolation
      if (!lenis) {
        scrollState.currentY += (scrollState.targetY - scrollState.currentY) * 0.16;
      } else {
        scrollState.currentY = scrollState.targetY;
      }

      // RESTING STATE CHECK: If scroll is <= 25px, photo is 100% static & pristine.
      // Absolutely ZERO particles render without scrolling!
      if (scrollState.currentY <= 25) {
        if (imgEl) {
          imgEl.style.opacity = '1';
          imgEl.style.transform = 'translate3d(0, 0, 0)';
        }
        ctx.clearRect(0, 0, width, height);
        return; // Early return: NO particle animation runs without scrolling!
      }

      // Dissolve factor: 0.0 at 25px scroll, 1.0 at 380px scroll
      const dissolveFactor = prefersReducedMotion ? 0 : Math.min(1, Math.max(0, (scrollState.currentY - 25) / 355));

      // Synchronize image opacity with dissolve wave
      if (imgEl) {
        const imgOpacity = Math.max(0, 1 - dissolveFactor * 1.55);
        imgEl.style.opacity = imgOpacity.toFixed(3);
        // Gentle micro-parallax on photo
        imgEl.style.transform = `translate3d(0, ${(-dissolveFactor * 24).toFixed(1)}px, 0)`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Additive screen blend for glowing stardust luminescence
      ctx.globalCompositeOperation = 'screen';
      ctx.font = '9px "JetBrains Mono", monospace';

      const mouseRadius = 140;
      const count = particles.length;

      for (let i = 0; i < count; i++) {
        const pt = particles[i];

        // Harmonic Brownian breathing drift
        const driftX = prefersReducedMotion ? 0 : Math.sin(time * pt.freq + pt.phase) * pt.ampX;
        const driftY = prefersReducedMotion ? 0 : Math.cos(time * pt.freq * 0.8 + pt.phase) * pt.ampY;

        // Wave dissolve threshold (sweeps across image based on Y position)
        const yNorm = pt.oy / height;
        const ptThreshold = Math.max(0, (dissolveFactor * 1.35) - ((1 - yNorm) * 0.35));

        // Dispersion displacement on scroll
        const scatterDist = Math.pow(ptThreshold, 1.5) * 240 * pt.speed * pt.z;
        const scatterX = Math.cos(pt.angle) * scatterDist;
        const scatterY = Math.sin(pt.angle) * scatterDist - (dissolveFactor * 120 * pt.z);

        // Target coordinates
        const targetX = pt.ox + driftX + scatterX;
        const targetY = pt.oy + driftY + scatterY;

        // Mouse displacement & repulsion (only active during scroll when particles exist)
        if (mouse.active && !prefersReducedMotion && dissolveFactor > 0.05) {
          const dx = pt.x - mouse.x;
          const dy = pt.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseRadius && dist > 0.001) {
            const force = Math.pow(1 - dist / mouseRadius, 1.6) * 38 * pt.z;
            const nx = dx / dist;
            const ny = dy / dist;
            pt.dispX += (nx * force - pt.dispX) * 0.16;
            pt.dispY += (ny * force - pt.dispY) * 0.16;
          } else {
            pt.dispX *= 0.90;
            pt.dispY *= 0.90;
          }
        } else {
          pt.dispX *= 0.88;
          pt.dispY *= 0.88;
        }

        // Smooth spring interpolation towards target
        pt.x += (targetX + pt.dispX - pt.x) * 0.18;
        pt.y += (targetY + pt.dispY - pt.y) * 0.18;

        // Dynamic alpha:
        // Strictly only glowing particles when scrolling (dissolveFactor > 0.02)
        let alpha = 0;
        if (dissolveFactor > 0.02) {
          const fadeTail = Math.max(0, 1 - Math.max(0, ptThreshold - 0.75) * 4);
          alpha = pt.baseAlpha * Math.min(1, (dissolveFactor - 0.02) * 3.2) * fadeTail;
        }

        if (alpha < 0.01) continue;

        ctx.globalAlpha = alpha;

        if (pt.char) {
          ctx.fillStyle = `rgb(${pt.r}, ${pt.g}, ${pt.b})`;
          ctx.fillText(pt.char, pt.x, pt.y);
        } else {
          ctx.fillStyle = `rgb(${pt.r}, ${pt.g}, ${pt.b})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('scroll', onNativeScroll);
      window.removeEventListener('resize', onResize);
      if (lenisOff) lenisOff();
      clearTimeout(resizeTimer);
    };
  }, [lenis, onPhotoFit]);

  return (
    <div ref={containerRef} className={`hero-photo-wrapper relative ${className}`}>
      {/* 1. Original Pristine Photo (100% Quality & Sharpness at resting state) */}
      <img
        ref={imgRef}
        id="himg"
        src={imageUrl}
        alt={alt}
        className={imgClassName}
        loading="eager"
        fetchpriority="high"
        decoding="async"
        onLoad={() => {
          if (onPhotoFit) onPhotoFit();
        }}
      />

      {/* 2. Scroll-Reactive Dissolve & Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 block select-none"
        aria-hidden="true"
      />
    </div>
  );
}

export default ScrollReactivePortraitParticles;
