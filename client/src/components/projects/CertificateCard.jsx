import React, { useRef } from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

export function CertificateCard({
  cert,
  indexNum = 1,
  onOpenModal,
  onCardMouseMove,
  onCardMouseLeave
}) {
  const { openCertificateLightbox } = usePortfolio();
  const cardRef = useRef(null);

  const imgSrc =
    cert.imageUrl ||
    (indexNum === 1
      ? 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=1200&auto=format&fit=crop'
      : indexNum === 2
      ? 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?q=80&w=1000&auto=format&fit=crop'
      : indexNum === 3
      ? 'https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=1000&auto=format&fit=crop'
      : indexNum === 4
      ? 'https://images.unsplash.com/photo-1542744094-24638ea0b3b8?q=80&w=1000&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop');

  const issuer = cert.issuer || 'Code With Harry';
  const year = cert.issueDate || cert.year || '2025';
  const skills = cert.skillsCovered || cert.skills || 'FULL-STACK, REACT, WEB ENGINEERING';

  const handleOpen = () => {
    playTick();
    if (onOpenModal) {
      onOpenModal(cert);
    } else if (openCertificateLightbox) {
      openCertificateLightbox(cert.id);
    }
  };

  const handleMouseMove = (e) => {
    if (onCardMouseMove) {
      onCardMouseMove(e);
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    if (window.gsap) {
      window.gsap.to(card, {
        rotateX: ((y - rect.height / 2) / rect.height) * -4,
        rotateY: ((x - rect.width / 2) / rect.width) * 4,
        transformPerspective: 1500,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = (e) => {
    if (onCardMouseLeave) {
      onCardMouseLeave(e);
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    if (window.gsap) {
      window.gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.3)'
      });
    }
  };

  return (
    <article
      ref={cardRef}
      className="cert-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="cert-img-wrap" onClick={handleOpen} title={`View ${cert.title}`}>
        <img src={imgSrc} alt={cert.title} loading="lazy" />
        <div className="cert-overlay">
          <i className="fa-solid fa-expand" />
        </div>
      </div>

      <div className="cert-content">
        <div className="cert-meta">
          <span className="cert-issuer">{issuer}</span>
          <span className="cert-year">{year}</span>
        </div>

        <h3 className="cert-title">{cert.title}</h3>
        <div className="cert-desc">Skills: {skills}</div>

        <div className="cert-actions">
          <button type="button" className="btn-view" onClick={handleOpen}>
            <i className="fa-solid fa-eye" /> View Certificate
          </button>
          <span className="verified-badge">
            <i className="fa-solid fa-check-circle" /> Verified
          </span>
        </div>
      </div>
    </article>
  );
}
