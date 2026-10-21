import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';

export function CertificateLightboxModal() {
  const { appState, activeCertLightbox, closeCertificateLightbox } = usePortfolio();
  const [zoom, setZoom] = useState(1);
  const modalBoxRef = useRef(null);

  useEffect(() => {
    setZoom(1);
    if (!activeCertLightbox) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.92, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.15)' }
      );
    }
  }, [activeCertLightbox]);

  if (!activeCertLightbox) return null;
  const cert = (appState.certificates || []).find((c) => c.id === activeCertLightbox);
  if (!cert) return null;

  const imgSrc = cert.imageUrl || '/images/apna-college-delta-certificate.jpg';

  const adjustZoom = (delta) => {
    if (delta === 0) {
      setZoom(1);
    } else {
      setZoom((prev) => Math.max(0.6, Math.min(2.4, Number((prev + delta).toFixed(2)))));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-xl"
    >
      <div ref={modalBoxRef} className="w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl border border-cyanglow/35 bg-charcoal shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline-border bg-obsidian px-6 py-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyanglow">
              {cert.issuer} · {cert.issueDate}
            </p>
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-alabaster">{cert.title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => adjustZoom(-0.2)}
              className="focus-ring rounded-full border border-white/15 bg-charcoal px-3 py-1.5 font-mono text-xs font-bold text-alabaster hover:border-cyanglow"
              title="Zoom Out"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => adjustZoom(0)}
              className="focus-ring rounded-full border border-white/15 bg-charcoal px-3 py-1.5 font-mono text-xs text-stonewarm hover:text-alabaster"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => adjustZoom(0.2)}
              className="focus-ring rounded-full border border-white/15 bg-charcoal px-3 py-1.5 font-mono text-xs font-bold text-alabaster hover:border-cyanglow"
              title="Zoom In"
            >
              +
            </button>
            <a
              href={imgSrc}
              download={`${(cert.title || 'Certificate').replace(/[^a-z0-9]+/gi, '_')}.jpg`}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-cyanglow px-4 py-1.5 font-mono text-xs font-bold text-obsidian hover:opacity-90"
            >
              <span>↓ Download</span>
            </a>
            <button
              type="button"
              onClick={closeCertificateLightbox}
              className="focus-ring rounded-full border border-white/15 bg-charcoal px-3.5 py-1.5 font-mono text-xs text-stonewarm hover:text-alabaster"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8 bg-obsidian overflow-auto flex-1 flex flex-col items-center justify-between gap-5">
          <div className="w-full overflow-auto flex items-center justify-center rounded-2xl border border-white/15 bg-[#05070E] p-3 sm:p-6 min-h-[360px]">
            <img
              src={imgSrc}
              alt={cert.title}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease'
              }}
              className="max-h-[68vh] w-auto rounded-xl object-contain shadow-2xl"
            />
          </div>
          <div className="w-full rounded-2xl border border-white/10 bg-charcoal p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-display font-bold text-white">{cert.title}</p>
              <p className="text-stonewarm">
                Issued by <strong className="text-alabaster">{cert.issuer}</strong> ({cert.issueDate})
              </p>
            </div>
            <div className="font-mono text-right space-y-1">
              {cert.credentialId && <p className="text-cyanglow">Credential ID: {cert.credentialId}</p>}
              {cert.skillsCovered && <p className="text-stonewarm">{cert.skillsCovered}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
