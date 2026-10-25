import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Real Image-to-Particle Dissolve & Reconstruction Engine
 * Supports both hover/tap interactive particle dispersion and manual Particle FX toggle.
 */
export function PortraitParticles({
  imageUrl,
  alt,
  name,
  roleLabel,
  offsetX = 0,
  offsetY = 0,
  sampleGap = 4,
  toggleOffLabel = 'Particle FX',
  toggleOnLabel = 'Photo View'
}) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [manualDissolve, setManualDissolve] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !manualDissolve || reducedMotion) return undefined;
    const ctx = canvas.getContext('2d');
    let animId = null;
    let particles = [];

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const buildParticles = () => {
      if (!img.complete || img.naturalWidth === 0 || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const width = Math.max(260, Math.floor(rect.width || 340));
      const height = Math.max(380, Math.floor(rect.height || 440));
      canvas.width = width;
      canvas.height = height;

      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      const offCtx = off.getContext('2d', { willReadFrequently: true });

      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (width - dw) / 2 + (Number(offsetX) || 0);
      const dy = (height - dh) / 2 + (Number(offsetY) || 0);

      offCtx.drawImage(img, dx, dy, dw, dh);
      let data;
      try {
        data = offCtx.getImageData(0, 0, width, height).data;
      } catch (_err) {
        return;
      }

      const gap = Math.max(4, Math.min(8, Number(sampleGap) || 5));
      const pts = [];
      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          const i = (y * width + x) * 4;
          if (data[i + 3] > 40) {
            pts.push({
              ox: x,
              oy: y,
              x: x + (Math.random() - 0.5) * 18,
              y: y + (Math.random() - 0.5) * 18,
              color: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`,
              r: gap * 0.42,
              phase: Math.random() * Math.PI * 2
            });
          }
        }
      }
      particles = pts;
    };

    const stepParticles = (ts) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = ts * 0.0025;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const tx = p.ox + Math.sin(t + p.phase) * 5;
        const ty = p.oy + Math.cos(t + p.phase) * 5;
        p.x += (tx - p.x) * 0.12;
        p.y += (ty - p.y) * 0.12;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(stepParticles);
    };

    img.onload = () => {
      buildParticles();
      animId = requestAnimationFrame(stepParticles);
    };
    img.src = imageUrl;

    window.addEventListener('resize', buildParticles);
    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', buildParticles);
    };
  }, [imageUrl, offsetX, offsetY, sampleGap, manualDissolve, reducedMotion]);

  return (
    <div className="group relative w-full max-w-[380px] rounded-3xl border border-white/15 bg-gradient-to-b from-charcoal via-obsidian to-charcoal p-2.5 shadow-2xl transition-all duration-300 hover:border-cyanglow/40">
      <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-tr from-vermilion/20 via-transparent to-cyanglow/20 opacity-70 blur-xl transition-opacity group-hover:opacity-100" />
      <div className="relative h-[430px] sm:h-[460px] w-full overflow-hidden rounded-2xl bg-charcoal">
        <img
          src={imageUrl}
          alt={alt || name}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className={`h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-[1.03] ${manualDissolve ? 'opacity-20' : ''}`}
        />
        <canvas
          ref={canvasRef}
          className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ${manualDissolve ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-obsidian/85 px-3.5 py-2.5 backdrop-blur-md">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold text-alabaster">{name}</p>
            <p className="truncate font-mono text-[11px] text-stonewarm">{roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setManualDissolve((prev) => !prev)}
            className="focus-ring shrink-0 rounded-lg border border-vermilion/40 bg-charcoal px-2.5 py-1 font-mono text-[11px] font-medium text-vermilion transition-colors hover:bg-vermilion hover:text-obsidian"
          >
            {manualDissolve ? toggleOnLabel : toggleOffLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
