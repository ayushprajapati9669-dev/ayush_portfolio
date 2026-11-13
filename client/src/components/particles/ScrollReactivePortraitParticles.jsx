import React, { useEffect, useRef } from 'react';
import { useSmoothScroll } from '../common/SmoothScrollProvider';
import { runOnIdle, cancelIdle } from '../../utils/idle';

/**
 * ScrollReactivePortraitParticles — Razorpay AI Builders Image Particle Dissolve Engine
 *
 * Performance Safeguards:
 * 1. Bounded-batch incremental pixel sampling: Never blocks the main thread with monolithic tasks.
 * 2. Complete RAF state machine: runs ONLY when isMounted && inViewport && isTabVisible && scroll > 25.
 * 3. Graceful early scroll handling: if user scrolls before sampling completes, existing batch dissolves seamlessly.
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

    // State machine flags
    const isMounted = { current: true };
    const inViewport = { current: true };
    const isTabVisible = { current: typeof document !== 'undefined' ? !document.hidden : true };
    const isLoopRunning = { current: false };

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let particles = [];
    let isSampled = false;
    let isSampling = false;
    let samplingIdleHandle = null;
    let samplingGen = 0; // Generation token to prevent race conditions & stale callbacks

    // Initialize Web Worker for off-thread pixel data processing
    let worker = null;
    try {
      if (typeof Worker !== 'undefined') {
        worker = new Worker(new URL('../../workers/portraitParticleWorker.js', import.meta.url), { type: 'module' });
      }
    } catch (_workerErr) {
      worker = null;
    }

    // Offscreen sampling canvas
    const sampleCanvas = document.createElement('canvas');
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    // Bounded-batch sampling function
    const startSampling = () => {
      if (isSampling) return;
      if (!imgEl.complete || imgEl.naturalWidth === 0) return;

      const rect = imgEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        // Layout bounding box not ready yet; safely reschedule for next idle frame
        cancelIdle(samplingIdleHandle);
        samplingIdleHandle = runOnIdle(startSampling, { timeout: 150, minBudget: 8 });
        return;
      }

      const newWidth = Math.floor(rect.width);
      const newHeight = Math.floor(rect.height);
      const newDpr = Math.min(window.devicePixelRatio || 1, 2);

      // If already sampled and dimensions have not changed, reuse existing particles
      if (isSampled && newWidth === width && newHeight === height && newDpr === dpr) {
        return;
      }

      // Cancel any pending stand-by idle handles before initiating batches
      cancelIdle(samplingIdleHandle);
      isSampling = true;
      const currentGen = ++samplingGen;

      // If dimensions changed and we already have particles, scale them immediately
      // to maintain 60 FPS animation continuity with zero blanking or visual pops
      if (width > 0 && height > 0 && (newWidth !== width || newHeight !== height) && particles.length > 0) {
        const sx = newWidth / width;
        const sy = newHeight / height;
        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i];
          pt.ox *= sx;
          pt.oy *= sy;
          pt.x *= sx;
          pt.y *= sy;
          pt.ampX *= sx;
          pt.ampY *= sy;
        }
      }

      width = newWidth;
      height = newHeight;
      dpr = newDpr;

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
        isSampling = false;
        return;
      }

      // Sample step: 4px on desktop, 6px on small screens
      const step = width > 480 ? 4 : 6;
      const pts = [];
      let currentY = 0;
      const rowsPerBatch = 28; // Bounded slice: 28 rows per batch (~2-4ms execution)

      const processBatch = (deadline) => {
        if (!isMounted.current || currentGen !== samplingGen) {
          isSampling = false;
          return;
        }

        try {
          const batchStart = performance.now();

          while (currentY < height) {
            const targetY = Math.min(height, currentY + rowsPerBatch);

            for (let y = currentY; y < targetY; y += step) {
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

            currentY = targetY;

            // Only expose progressively if we didn't already have particles (initial load)
            // If we already had particles (e.g. during resize), maintain scaled particles until sample finishes
            if (particles.length === 0) {
              particles = pts;
            }

            // Yield to maintain main thread budget
            const elapsed = performance.now() - batchStart;
            const hasTimeRemaining = deadline && typeof deadline.timeRemaining === 'function' ? deadline.timeRemaining() > 2 : true;

            if (elapsed > 8 || !hasTimeRemaining) {
              break;
            }
          }

          if (currentY < height) {
            samplingIdleHandle = runOnIdle((d) => processBatch(d), { timeout: 250, minBudget: 8 });
          } else {
            // Sampling complete: atomically replace with pixel-perfect sample
            if (currentGen === samplingGen) {
              particles = pts;
              isSampled = true;
              isSampling = false;
              if (onPhotoFit) onPhotoFit();
            }
          }
        } catch (batchErr) {
          console.error('[ScrollReactivePortraitParticles] Error processing batch:', batchErr);
          isSampling = false;
        }
      };

      if (worker) {
        const bufferCopy = imgData.buffer.slice(0);

        worker.onmessage = (e) => {
          const res = e.data;
          if (!res || res.gen !== currentGen || !isMounted.current) return;
          if (res.type === 'SAMPLING_RESULT') {
            particles = res.particles;
            isSampled = true;
            isSampling = false;
            if (onPhotoFit) onPhotoFit();
          } else if (res.type === 'SAMPLING_ERROR') {
            fallbackToMainThread();
          }
        };

        worker.onerror = () => {
          fallbackToMainThread();
        };

        const fallbackToMainThread = () => {
          if (!isMounted.current || currentGen !== samplingGen) return;
          samplingIdleHandle = runOnIdle((d) => processBatch(d), { timeout: 800, minBudget: 12 });
        };

        try {
          worker.postMessage(
            {
              type: 'SAMPLE_IMAGE',
              width,
              height,
              step,
              imgBuffer: bufferCopy,
              gen: currentGen
            },
            [bufferCopy]
          );
          return;
        } catch (_postErr) {
          fallbackToMainThread();
          return;
        }
      }

      samplingIdleHandle = runOnIdle((d) => processBatch(d), { timeout: 800, minBudget: 12 });
    };

    // Stagger sampling on idle after image load, OR immediately on user scroll
    const handleImageLoad = () => {
      cancelIdle(samplingIdleHandle);
      if (scrollState.targetY > 10) {
        startSampling();
      } else {
        samplingIdleHandle = runOnIdle(startSampling, { timeout: 3500, minBudget: 12 });
      }
      if (onPhotoFit) onPhotoFit();
    };
    imgEl.addEventListener('load', handleImageLoad);

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      samplingIdleHandle = runOnIdle(startSampling, { timeout: 3500, minBudget: 12 });
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
      if (scrollState.targetY > 10 && !isSampled && !isSampling) {
        cancelIdle(samplingIdleHandle);
        startSampling();
      }
      updateLoopState();
    };

    let lenisOff = null;
    if (lenis && typeof lenis.on === 'function') {
      const onLenisScroll = (e) => {
        if (typeof e.scroll === 'number') {
          scrollState.targetY = e.scroll;
          if (scrollState.targetY > 10 && !isSampled && !isSampling) {
            cancelIdle(samplingIdleHandle);
            startSampling();
          }
          updateLoopState();
        }
      };
      lenis.on('scroll', onLenisScroll);
      lenisOff = () => {
        if (typeof lenis.off === 'function') lenis.off('scroll', onLenisScroll);
      };
    }

    window.addEventListener('scroll', onNativeScroll, { passive: true });

    // Visibility Observer
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport.current = entry ? entry.isIntersecting : false;
        updateLoopState();
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;
      updateLoopState();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Resize handling: debounced with immediate particle scaling & safe cancellation
    let resizeTimer = null;
    const onResize = () => {
      cancelIdle(samplingIdleHandle);
      clearTimeout(resizeTimer);

      const rect = imgEl.getBoundingClientRect();
      const newW = Math.floor(rect.width);
      const newH = Math.floor(rect.height);
      const newD = Math.min(window.devicePixelRatio || 1, 2);

      // If dimensions haven't changed, retain existing sample without re-sampling
      if (isSampled && newW === width && newH === height && newD === dpr) {
        return;
      }

      // If dimensions changed, scale existing particles immediately to prevent glitching/blanking
      if (width > 0 && height > 0 && (newW !== width || newH !== height) && particles.length > 0) {
        const sx = newW / width;
        const sy = newH / height;
        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i];
          pt.ox *= sx;
          pt.oy *= sy;
          pt.x *= sx;
          pt.y *= sy;
          pt.ampX *= sx;
          pt.ampY *= sy;
        }
        width = newW;
        height = newH;
        dpr = newD;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      // Invalidate current sample token so stale batch callbacks cannot overwrite particles
      isSampled = false;
      isSampling = false;
      samplingGen++;

      resizeTimer = setTimeout(() => {
        if (isMounted.current) {
          startSampling();
        }
      }, 150);
    };
    window.addEventListener('resize', onResize);

    // Complete RAF State Machine
    let animId = null;
    let lastRenderTime = 0;

    const render = (now) => {
      if (!isLoopRunning.current) return;

      const timeDelta = Math.min(0.05, (now - lastRenderTime) * 0.001);
      lastRenderTime = now;

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
      if (scrollState.currentY <= 25) {
        if (imgEl) {
          imgEl.style.opacity = '1';
          imgEl.style.transform = 'translate3d(0, 0, 0)';
        }
        ctx.clearRect(0, 0, width, height);
        // Pause RAF loop while at resting state
        isLoopRunning.current = false;
        if (animId) cancelAnimationFrame(animId);
        animId = null;
        return;
      }

      const dissolveFactor = prefersReducedMotion ? 0 : Math.min(1, Math.max(0, (scrollState.currentY - 25) / 355));

      // Synchronize image opacity with dissolve wave
      if (imgEl) {
        const imgOpacity = Math.max(0, 1 - dissolveFactor * 1.55);
        imgEl.style.opacity = imgOpacity.toFixed(3);
        imgEl.style.transform = `translate3d(0, ${(-dissolveFactor * 24).toFixed(1)}px, 0)`;
      }

      if (particles.length > 0) {
        const time = prefersReducedMotion ? 0 : now * 0.0018;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'screen';
        ctx.font = '9px "JetBrains Mono", monospace';

        const mouseRadius = 140;
        const count = particles.length;

        for (let i = 0; i < count; i++) {
          const pt = particles[i];

          const driftX = prefersReducedMotion ? 0 : Math.sin(time * pt.freq + pt.phase) * pt.ampX;
          const driftY = prefersReducedMotion ? 0 : Math.cos(time * pt.freq * 0.8 + pt.phase) * pt.ampY;

          const yNorm = pt.oy / height;
          const ptThreshold = Math.max(0, (dissolveFactor * 1.35) - ((1 - yNorm) * 0.35));

          const scatterDist = Math.pow(ptThreshold, 1.5) * 240 * pt.speed * pt.z;
          const scatterX = Math.cos(pt.angle) * scatterDist;
          const scatterY = Math.sin(pt.angle) * scatterDist - (dissolveFactor * 120 * pt.z);

          const targetX = pt.ox + driftX + scatterX;
          const targetY = pt.oy + driftY + scatterY;

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

          pt.x += (targetX + pt.dispX - pt.x) * 0.18;
          pt.y += (targetY + pt.dispY - pt.y) * 0.18;

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
      }

      if (isLoopRunning.current) {
        animId = requestAnimationFrame(render);
      }
    };

    function updateLoopState() {
      const liveScroll = lenis && typeof lenis.scroll === 'number' ? lenis.scroll : (window.scrollY || 0);
      const shouldRun = isMounted.current && inViewport.current && isTabVisible.current && (liveScroll > 25);

      if (shouldRun && !isLoopRunning.current) {
        isLoopRunning.current = true;
        lastRenderTime = performance.now();
        animId = requestAnimationFrame(render);
      } else if (!shouldRun && isLoopRunning.current) {
        isLoopRunning.current = false;
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }
    }

    return () => {
      isMounted.current = false;
      isLoopRunning.current = false;
      if (animId) cancelAnimationFrame(animId);
      cancelIdle(samplingIdleHandle);
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('scroll', onNativeScroll);
      window.removeEventListener('resize', onResize);
      imgEl.removeEventListener('load', handleImageLoad);
      if (worker) {
        worker.terminate();
        worker = null;
      }
      if (lenisOff) lenisOff();
      clearTimeout(resizeTimer);
    };
  }, [lenis, onPhotoFit]);

  return (
    <div ref={containerRef} className={`hero-photo-wrapper relative ${className}`}>
      {/* Original Pristine Photo */}
      <img
        ref={imgRef}
        id="himg"
        src={imageUrl}
        srcSet={
          imageUrl && imageUrl.includes('hero_cutout_1794562459704_847.webp')
            ? '/uploads/hero_cutout_1794562459704_847_mobile.webp 600w, /uploads/hero_cutout_1794562459704_847.webp 1200w'
            : undefined
        }
        sizes="(max-width: 768px) 300px, 600px"
        width={1200}
        height={1600}
        alt={alt}
        className={imgClassName}
        loading="eager"
        fetchpriority="high"
        decoding="async"
        onLoad={() => {
          if (onPhotoFit) onPhotoFit();
        }}
      />

      {/* Scroll-Reactive Dissolve Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 block select-none"
        aria-hidden="true"
      />
    </div>
  );
}

export default ScrollReactivePortraitParticles;
