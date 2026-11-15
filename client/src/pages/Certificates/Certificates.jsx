import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/pages/certificates.css';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { CertificateCard } from '../../components/projects/CertificateCard';
import { ScrollWriteText } from '../../components/common/ScrollWriteText';
import { playTick } from '../../utils/audio';
import { SEO } from '../../components/SEO';
import { itemListSchema } from '../../utils/seo';

export const isCanonicalPublishedCertificate = (c) => {
  if (!c || typeof c !== 'object') return false;
  if (typeof c.id === 'string' && /^cert[1-5]$/i.test(c.id)) return false;
  if (c.published !== true) return false;
  const status = String(c.status || '').trim().toLowerCase();
  return ['verified', 'accredited', 'published'].includes(status);
};

export function CertificatesPage() {
  const { appState } = usePortfolio();
  const ui = appState.uiLabels || {};

  // Public certificates must come only from verified, accredited, published CMS data (zero fake fallbacks or dummy data)
  const cmsCerts = (appState.certificates || []).filter(isCanonicalPublishedCertificate);
  const certList = cmsCerts;

  const containerRef = useRef(null);

  // Modal Lightbox state
  const [activeCert, setActiveCert] = useState(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialTouchRef = useRef({ distance: 0, zoom: 1.0 });

  const modalBodyRef = useRef(null);

  const openModal = (cert) => {
    playTick();
    setActiveCert(cert);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
  };

  const closeModal = useCallback(() => {
    setActiveCert(null);
    document.body.style.overflow = '';
  }, []);

  const zoomIn = () => {
    playTick();
    setZoom((prev) => Math.min(3.0, Number((prev + 0.25).toFixed(2))));
  };

  const zoomOut = () => {
    playTick();
    setZoom((prev) => Math.max(0.6, Number((prev - 0.25).toFixed(2))));
  };

  const resetZoom = () => {
    playTick();
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeCert) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCert, closeModal]);

  // Wheel zoom on modal body
  useEffect(() => {
    const bodyEl = modalBodyRef.current;
    if (!bodyEl || !activeCert) return;

    const handleWheel = (e) => {
      e.preventDefault();
      setZoom((prev) => {
        if (e.deltaY < 0) {
          return Math.min(3.0, Number((prev + 0.1).toFixed(2)));
        } else {
          return Math.max(0.6, Number((prev - 0.1).toFixed(2)));
        }
      });
    };

    bodyEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => bodyEl.removeEventListener('wheel', handleWheel);
  }, [activeCert]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (zoom <= 1.0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pinch & pan
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      initialTouchRef.current = { distance: dist, zoom };
    } else if (e.touches.length === 1 && zoom > 1.0) {
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
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const scale = dist / (initialTouchRef.current.distance || 1);
      const newZoom = Math.min(Math.max(0.6, initialTouchRef.current.zoom * scale), 3.0);
      setZoom(Number(newZoom.toFixed(2)));
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

  // 3D Card tilt physics
  const handleCardMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    gsap.to(card, {
      rotateX: ((y - rect.height / 2) / rect.height) * -4,
      rotateY: ((x - rect.width / 2) / rect.width) * 4,
      transformPerspective: 1500,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  // GSAP entrance animation
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.page-header > *', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo('.cert-card', 
        { y: 35, opacity: 0, scale: 0.93, filter: 'blur(4px)' }, 
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.55, 
          stagger: {
            each: 0.07,
            from: 'start',
            ease: 'power2.out'
          }, 
          ease: 'back.out(1.2)', 
          clearProps: 'all' 
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const skillsText = activeCert ? (activeCert.skillsCovered || activeCert.skills || '').trim() : '';

  return (
    <main className="certificates-page" ref={containerRef}>
      <SEO
        title="Verified Certificates & Professional Credentials"
        description="Browse accredited software engineering, MERN full-stack, AI/ML, and cloud computing certificates earned by Ayush Prajapati."
        schema={itemListSchema(certList, 'Credential')}
      />
      {/* Page Header */}
      <div className="page-header">
        <ScrollWriteText
          as="div"
          className="page-tagline"
          mode="scramble"
          scrambleDuration={20}
        >
          {ui.homeCertsEyebrow || '04 · VERIFIED ACCREDITATIONS'}
        </ScrollWriteText>
        <ScrollWriteText
          as="h1"
          className="page-title hero-editorial-title text-left !m-0 !p-0 !max-w-none"
          mode="mask"
          stagger={0.04}
          highlightWords={['Credentials']}
        >
          Certifications & *Credentials*
        </ScrollWriteText>
        <ScrollWriteText
          as="p"
          className="page-desc mt-4"
          mode="words"
          stagger={0.02}
        >
          Accredited certifications and professional credentials earned across software engineering, cloud computing, and full-stack web development.
        </ScrollWriteText>
      </div>

      {/* Dynamic Masonry Grid or Honest Empty State */}
      {certList.length === 0 ? (
        <div className="cert-empty-state max-w-xl mx-auto text-center py-16 px-6 my-10 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 text-2xl shadow-lg shadow-yellow-500/5">
            <svg
              className="w-8 h-8 text-yellow-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
            Accreditations in Progress
          </h3>
          <p className="font-sans text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto">
            Verified course completions and technical accreditations will appear here once published.
          </p>
        </div>
      ) : (
        <div className="cert-grid">
          {certList.map((cert, idx) => (
            <CertificateCard
              key={cert.id || `cert-${idx}`}
              cert={cert}
              indexNum={idx + 1}
              onOpenModal={openModal}
              onCardMouseMove={handleCardMouseMove}
              onCardMouseLeave={handleCardMouseLeave}
            />
          ))}
        </div>
      )}

      {/* Advanced Lightbox Modal rendered via Portal to document.body for true full-screen centering */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`modal-overlay ${activeCert ? 'active' : ''}`}
            onClick={(e) => {
              if (e.target.classList.contains('modal-overlay')) closeModal();
            }}
          >
            {activeCert && (
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                  <div className="modal-title-wrap">
                    <span className="modal-meta">
                      {(activeCert.issuer || 'CREDENTIAL').toUpperCase()}{Boolean(activeCert.issueDate || activeCert.year) ? ` · ${activeCert.issueDate || activeCert.year}` : ''}
                    </span>
                    <h2 className="modal-title">{activeCert.title || 'Certificate'}</h2>
                  </div>
                  <div className="modal-controls">
                    <div className="zoom-controls">
                      <button type="button" className="zoom-btn" onClick={zoomOut} title="Zoom Out">
                        <i className="fa-solid fa-minus" />
                      </button>
                      <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                      <button type="button" className="zoom-btn" onClick={zoomIn} title="Zoom In">
                        <i className="fa-solid fa-plus" />
                      </button>
                      <button
                        type="button"
                        className="zoom-btn"
                        onClick={resetZoom}
                        title="Reset Zoom"
                        style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <i className="fa-solid fa-rotate-left" />
                      </button>
                    </div>
                    {Boolean(activeCert.downloadUrl || activeCert.imageUrl) ? (
                      <a
                        href={activeCert.downloadUrl || activeCert.imageUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-modal"
                      >
                        <i className="fa-solid fa-download" /> Download
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="btn-modal opacity-40 cursor-not-allowed"
                        title="Download unavailable: no certificate file attached"
                      >
                        <i className="fa-solid fa-download" /> Download
                      </button>
                    )}
                    <button type="button" className="btn-modal-close" onClick={closeModal}>
                      <i className="fa-solid fa-xmark" /> Close
                    </button>
                  </div>
                </div>

                {/* Modal Body / Pan & Zoom Area */}
                <div
                  ref={modalBodyRef}
                  className="modal-body"
                  style={{ cursor: zoom > 1.0 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className="modal-img-container"
                    style={{
                      transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
                    }}
                  >
                    <img
                      src={activeCert.imageUrl || activeCert.downloadUrl || '/images/apna-college-delta-certificate.webp'}
                      alt={activeCert.title || 'Certificate'}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <div className="modal-footer-info">
                    <h4>{activeCert.title || 'Certificate'}</h4>
                    <p>
                      Issued by <strong>{activeCert.issuer || 'Official Credential'}</strong>
                      {Boolean(activeCert.issueDate || activeCert.year) && ` (${activeCert.issueDate || activeCert.year})`}
                    </p>
                    {skillsText && (
                      <div className="modal-skills-badge">
                        <i className="fa-solid fa-code" style={{ color: 'var(--accent-1)' }} />
                        <span>
                          <strong>Skills:</strong> {skillsText}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="modal-hint">
                    <i className="fa-solid fa-computer-mouse" /> Scroll to zoom &nbsp;·&nbsp;{' '}
                    <i className="fa-solid fa-up-down-left-right" /> Drag to pan &nbsp;·&nbsp;{' '}
                    <kbd>Esc</kbd> to close
                  </div>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </main>
  );
}
