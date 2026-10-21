import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

export function CertificateLightboxModal() {
  const { appState, activeCertLightbox, closeCertificateLightbox } = usePortfolio();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const modalBoxRef = useRef(null);
  const viewportRef = useRef(null);
  const imgContainerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialTouchRef = useRef({ distance: 0, zoom: 1 });

  // Reset zoom & pan when active cert changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);

    if (!activeCertLightbox) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.94, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.2)' }
      );
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [activeCertLightbox]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeCertLightbox) {
        closeCertificateLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCertLightbox, closeCertificateLightbox]);

  const REFERENCE_FALLBACKS = [
    {
      id: 'cert1',
      title: 'AI & Machine Learning',
      issuer: 'Code With Harry',
      year: '2025',
      issueDate: '2025',
      category: 'Artificial Intelligence & ML',
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1600&auto=format&fit=crop',
      skillsCovered: 'PYTHON, TENSORFLOW, SCIKIT-LEARN, DATA SCIENCE, NLP',
      downloadUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1600&auto=format&fit=crop'
    },
    {
      id: 'cert2',
      title: 'MERN Stack Development',
      issuer: 'Apna College',
      year: '2025',
      issueDate: '2025',
      category: 'Full Stack Development',
      imageUrl: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?q=80&w=1600&auto=format&fit=crop',
      skillsCovered: 'HTML, CSS, JAVASCRIPT, NODE.JS, EXPRESS, MONGODB',
      downloadUrl: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?q=80&w=1600&auto=format&fit=crop'
    },
    {
      id: 'cert3',
      title: 'Frontend Developer Professional',
      issuer: 'Meta',
      year: '2024',
      issueDate: '2024',
      category: 'Frontend Engineering',
      imageUrl: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=1600&auto=format&fit=crop',
      skillsCovered: 'REACT, REDUX, TAILWIND CSS, UI/UX PRINCIPLES',
      downloadUrl: 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=1600&auto=format&fit=crop'
    },
    {
      id: 'cert4',
      title: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      year: '2024',
      issueDate: '2024',
      category: 'Cloud Computing',
      imageUrl: 'https://images.unsplash.com/photo-1542744094-24638ea0b3b8?q=80&w=1600&auto=format&fit=crop',
      skillsCovered: 'CLOUD COMPUTING, AWS EC2, S3, LAMBDA, IAM',
      downloadUrl: 'https://images.unsplash.com/photo-1542744094-24638ea0b3b8?q=80&w=1600&auto=format&fit=crop'
    },
    {
      id: 'cert5',
      title: 'React (Basic) Certificate',
      issuer: 'HackerRank',
      year: '2024',
      issueDate: '2024',
      category: 'Frontend Engineering',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1600&auto=format&fit=crop',
      skillsCovered: 'REACT COMPONENTS, STATE MANAGEMENT, HOOKS, ROUTING',
      downloadUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1600&auto=format&fit=crop'
    }
  ];

  const cert =
    typeof activeCertLightbox === 'object' && activeCertLightbox !== null
      ? activeCertLightbox
      : (appState.certificates || []).find((c) => c.id === activeCertLightbox) ||
        REFERENCE_FALLBACKS.find((c) => c.id === activeCertLightbox);

  // Zoom controls
  const handleZoomIn = () => {
    playTick();
    setZoom((prev) => Math.min(3.0, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    playTick();
    setZoom((prev) => Math.max(0.6, Number((prev - 0.25).toFixed(2))));
  };

  const handleResetZoom = () => {
    playTick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !activeCertLightbox) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom((prev) => Math.min(3.0, Number((prev + 0.1).toFixed(2))));
      } else {
        setZoom((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(2))));
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [activeCertLightbox]);

  // Mouse drag-to-pan
  const handleMouseDown = (e) => {
    if (zoom <= 0.65) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Touch pinch & pan
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      initialTouchRef.current = { distance: dist, zoom };
    } else if (e.touches.length === 1 && zoom > 0.65) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      if (initialTouchRef.current.distance > 0) {
        const scale = currentDist / initialTouchRef.current.distance;
        const newZoom = Math.min(Math.max(0.6, initialTouchRef.current.zoom * scale), 3.0);
        setZoom(Number(newZoom.toFixed(2)));
      }
    } else if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      setPan({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!activeCertLightbox || !cert) return null;

  const imgSrc =
    cert.imageUrl ||
    cert.downloadUrl ||
    'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1200&auto=format&fit=crop';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-3 sm:p-6 backdrop-blur-2xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playTick();
          closeCertificateLightbox();
        }
      }}
    >
      <div
        ref={modalBoxRef}
        className="w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl border border-cyan-500/30 bg-[#0a0f16] shadow-2xl overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/50 px-5 sm:px-7 py-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                {cert.issuer || 'Credential'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {cert.issueDate || cert.year || '2025'}
              </span>
              {cert.credentialId && (
                <span className="font-mono text-[10px] text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded bg-purple-500/10">
                  ID: {cert.credentialId}
                </span>
              )}
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-white line-clamp-1">
              {cert.title}
            </h3>
          </div>

          {/* Controls: Zoom, Actions & Close */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center rounded-xl border border-white/15 bg-black/60 p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.6}
                className="w-8 h-8 flex items-center justify-center rounded-lg font-mono text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Zoom Out (−)"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2.5 h-8 flex items-center justify-center font-mono text-xs font-medium text-cyan-300 hover:bg-white/10 transition-all border-x border-white/10"
                title="Reset Zoom (100%)"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3.0}
                className="w-8 h-8 flex items-center justify-center rounded-lg font-mono text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Zoom In (+)"
              >
                +
              </button>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-3 py-1.5 rounded-xl border border-white/15 bg-black/40 text-xs font-mono text-slate-300 hover:text-white hover:border-white/30 transition-all"
              title="Reset Zoom and Pan"
            >
              ↺ Reset
            </button>

            {/* External Verification */}
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <span>Verify ↗</span>
              </a>
            )}

            {/* Download */}
            <a
              href={imgSrc}
              target="_blank"
              rel="noreferrer"
              download={`${(cert.title || 'Certificate').replace(/[^a-z0-9]+/gi, '_')}.jpg`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-3.5 py-1.5 font-mono text-xs font-bold text-black hover:opacity-90 transition-all shadow-md shadow-cyan-500/20"
            >
              <i className="fa-solid fa-arrow-down" />
              <span>Download</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                playTick();
                closeCertificateLightbox();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/15 transition-all"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Pan & Zoom Viewport */}
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: zoom > 0.65 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          className="relative flex-1 min-h-[380px] sm:min-h-[460px] max-h-[66vh] overflow-hidden bg-[#03060b] flex items-center justify-center p-4 select-none"
        >
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          <div
            ref={imgContainerRef}
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
            className="relative will-change-transform max-w-full max-h-full flex items-center justify-center"
          >
            <img
              src={imgSrc}
              alt={cert.title}
              draggable={false}
              className="max-h-[60vh] max-w-[90vw] sm:max-w-4xl w-auto object-contain rounded-xl border border-white/15 shadow-2xl pointer-events-none"
            />
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/50 px-5 sm:px-7 py-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-400">
              <i className="fa-solid fa-circle-check" /> Verified Credential
            </span>
            {cert.skillsCovered && (
              <span className="font-mono text-[11px] text-slate-400">
                Skills: <strong className="text-slate-200">{cert.skillsCovered}</strong>
              </span>
            )}
          </div>

          {/* Interactive Keyboard / Mouse Hints */}
          <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span>
              <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-slate-300">
                Wheel
              </kbd>{' '}
              to zoom
            </span>
            <span>
              <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-slate-300">
                Drag
              </kbd>{' '}
              to pan
            </span>
            <span>
              <kbd className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-slate-300">
                Esc
              </kbd>{' '}
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificateLightboxModal;
