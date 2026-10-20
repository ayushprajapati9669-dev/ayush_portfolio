import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { CertificateCard } from '../../components/projects/CertificateCard';
import { playTick } from '../../utils/audio';

const REFERENCE_CERTIFICATES = [
  {
    id: 'cert1',
    title: 'AI & Machine Learning',
    issuer: 'Code With Harry',
    year: '2025',
    issueDate: '2025',
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
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1600&auto=format&fit=crop',
    skillsCovered: 'REACT COMPONENTS, STATE MANAGEMENT, HOOKS, ROUTING',
    downloadUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1600&auto=format&fit=crop'
  }
];

export function CertificatesPage() {
  const { appState } = usePortfolio();
  const ui = appState.uiLabels || {};

  const cmsCerts = appState.certificates || [];
  const certList = cmsCerts.length > 0 ? cmsCerts : REFERENCE_CERTIFICATES;

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
      gsap.from('.page-header > *', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });

      gsap.from('.cert-card', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        delay: 0.2,
        onComplete: () => {
          document.querySelectorAll('.cert-card').forEach((c) => {
            c.style.transform = '';
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const skillsText = activeCert ? (activeCert.skillsCovered || activeCert.skills || '').trim() : '';

  return (
    <main className="certificates-page" ref={containerRef}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-tagline">
          {ui.homeCertsEyebrow || '04 · Verified Credentials'}
        </div>
        <h1 className="page-title">
          {ui.homeCertsHeading || 'Certifications & Achievements'}
        </h1>
        <p className="page-desc">
          Click on any certificate card or "View Certificate" to inspect the full-resolution credential in the interactive viewer.
        </p>
      </div>

      {/* Dynamic Masonry Grid */}
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
                      {(activeCert.issuer || 'CREDENTIAL').toUpperCase()} · {activeCert.issueDate || activeCert.year || '2025'}
                    </span>
                    <h2 className="modal-title">{activeCert.title}</h2>
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
                    <a
                      href={activeCert.downloadUrl || activeCert.imageUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-modal"
                    >
                      <i className="fa-solid fa-download" /> Download
                    </a>
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
                    <img src={activeCert.imageUrl} alt={activeCert.title} />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <div className="modal-footer-info">
                    <h4>{activeCert.title}</h4>
                    <p>
                      Issued by <strong>{activeCert.issuer}</strong> ({activeCert.issueDate || activeCert.year || '2025'})
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
