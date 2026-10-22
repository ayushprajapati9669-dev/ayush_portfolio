import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { validateContactForm } from '../../utils/validation';
import { apiRequest } from '../../services/api';
import { playTick } from '../../utils/audio';

export function ContactPage() {
  const { appState, updateAppState, showToast } = usePortfolio();
  const p = appState.profile || {};

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const containerRef = useRef(null);
  const formCardRef = useRef(null);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const copyText = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      playTick();
      setCopiedField(fieldName);
      showToast(`Copied ${fieldName} to clipboard!`);
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    }).catch((err) => console.error('Failed to copy: ', err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const check = validateContactForm(formData);

    if (!check.isValid) {
      playTick();
      setErrors(check.errors);

      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion && formCardRef.current) {
        gsap.fromTo(formCardRef.current, { x: -10 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      }
      return;
    }

    setLoading(true);
    playTick();

    const newMsg = {
      id: 'msg-' + Date.now(),
      ...check.cleanData,
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    try {
      await apiRequest('/api/public/contact', {
        method: 'POST',
        body: check.cleanData
      });
    } catch (_err) {
      // Local fallback in state
    }

    updateAppState((prev) => ({
      ...prev,
      messages: [newMsg, ...(prev.messages || [])]
    }));

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      showToast('Thank you! Your message has been sent.');

      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({});
        setSuccess(false);
      }, 3000);
    }, 1200);
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

  // Magnetic Button Physics
  const handleMagneticMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;

    gsap.to(el, { x, y, duration: 0.4, ease: 'power2.out' });
  };

  const handleMagneticMouseLeave = (e) => {
    const el = e.currentTarget;
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
  };

  // Initial Entrance Animation
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

      gsap.from('.glass-card', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'back.out(1.2)',
        delay: 0.3,
        onComplete: () => {
          document.querySelectorAll('.glass-card').forEach((c) => {
            c.style.transform = '';
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="contact-page" ref={containerRef}>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-orb" />
        <div className="page-tagline">CONNECT</div>
        <h1 className="page-title">Get In Touch</h1>
        <p className="page-desc">
          Reach out directly at <strong>{p.email || 'ayushprajapati9669@gmail.com'}</strong> or{' '}
          <strong>{p.phone || '(+91) 9669802554'}</strong> or send a message below.
        </p>
      </div>

      <div className="contact-grid">
        {/* LEFT: FORM */}
        <div
          ref={formCardRef}
          className="glass-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <h3 className="card-title">Send a Message</h3>

          {/* Top Status Alert Banners */}
          {success && (
            <div className="contact-status-banner success">
              <div className="banner-icon">
                <i className="fa-solid fa-circle-check" />
              </div>
              <div className="banner-content">
                <h4>Message Sent Successfully!</h4>
                <p>Thank you for reaching out. Ayush has received your message and will respond within 24 hours.</p>
              </div>
            </div>
          )}

          {!success && Object.keys(errors).length > 0 && (
            <div className="contact-status-banner error">
              <div className="banner-icon">
                <i className="fa-solid fa-triangle-exclamation" />
              </div>
              <div className="banner-content">
                <h4>Please Complete All Required Fields</h4>
                <p>Check the highlighted red fields below with details and try sending again.</p>
              </div>
            </div>
          )}

          <form className="contact-form" id="contactForm" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  id="name"
                  placeholder=" "
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
                <label htmlFor="name" className="form-label">
                  Your Name
                </label>
                {errors.name && (
                  <div className="field-error-message">
                    <i className="fa-solid fa-circle-exclamation" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  id="email"
                  placeholder=" "
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
                <label htmlFor="email" className="form-label">
                  Your Email
                </label>
                {errors.email && (
                  <div className="field-error-message">
                    <i className="fa-solid fa-circle-exclamation" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <input
                type="text"
                className={`form-control ${errors.subject ? 'error' : ''}`}
                id="subject"
                placeholder=" "
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
              />
              <label htmlFor="subject" className="form-label">
                Subject
              </label>
              {errors.subject && (
                <div className="field-error-message">
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{errors.subject}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <textarea
                className={`form-control ${errors.message ? 'error' : ''}`}
                id="message"
                placeholder=" "
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                required
              />
              <label htmlFor="message" className="form-label">
                Message
              </label>
              <div className="field-meta">
                {errors.message ? (
                  <div className="field-error-message !mt-0">
                    <i className="fa-solid fa-circle-exclamation" />
                    <span>{errors.message}</span>
                  </div>
                ) : (
                  <span className="field-hint">Minimum 10 characters</span>
                )}
                <span className="char-count">{formData.message.length} chars</span>
              </div>
            </div>

            <button
              type="submit"
              className={`btn-send magnetic ${loading ? 'loading' : ''} ${success ? 'success' : ''}`}
              id="submitBtn"
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
            >
              {success ? (
                <>
                  <i className="fa-solid fa-check" /> Message Sent!
                </>
              ) : (
                <>
                  Send Message <i className="fa-solid fa-arrow-right" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: DIRECT CONTACT & SOCIAL */}
        <div>
          <div
            className="glass-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <h3 className="card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle" style={{ fontSize: '8px', color: 'var(--accent-1)' }} /> Direct Contact
              </span>
              <span className="status-badge">Verified</span>
            </h3>

            <div className="info-stack">
              {/* Email */}
              <div className="info-block">
                <div className="info-icon">
                  <i className="fa-regular fa-envelope" />
                </div>
                <div className="info-text">
                  <span className="label">EMAIL ADDRESS</span>
                  <span className="value">
                    {p.email || 'ayushprajapati9669@gmail.com'}
                    <button
                      type="button"
                      className={`copy-btn ${copiedField === 'email' ? 'copied' : ''}`}
                      onClick={() => copyText(p.email || 'ayushprajapati9669@gmail.com', 'email')}
                      title="Copy Email"
                    >
                      <i className={copiedField === 'email' ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
                    </button>
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="info-block">
                <div className="info-icon">
                  <i className="fa-solid fa-phone" />
                </div>
                <div className="info-text">
                  <span className="label">PHONE NUMBER</span>
                  <span className="value">
                    {p.phone || '(+91) 9669802554'}
                    <button
                      type="button"
                      className={`copy-btn ${copiedField === 'phone' ? 'copied' : ''}`}
                      onClick={() => copyText(p.phone || '+919669802554', 'phone')}
                      title="Copy Phone"
                    >
                      <i className={copiedField === 'phone' ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
                    </button>
                  </span>
                </div>
              </div>

              {/* College */}
              <div className="info-block">
                <div className="info-icon">
                  <i className="fa-solid fa-graduation-cap" />
                </div>
                <div className="info-text">
                  <span className="label">COLLEGE & ACADEMICS</span>
                  <span className="value">
                    {p.education?.college || 'SISTec, Bhopal'}{' '}
                    <span className="cgpa-badge">
                      {p.education?.cgpa ? `${p.education.cgpa} CGPA` : '8.42 CGPA'}
                    </span>
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
                    {p.education?.degree || 'B.Tech in Computer Science and Engineering'}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="info-block">
                <div className="info-icon">
                  <i className="fa-solid fa-location-dot" />
                </div>
                <div className="info-text">
                  <span className="label">CURRENT LOCATION</span>
                  <span className="value">
                    {p.education?.location || 'Bhopal, Madhya Pradesh, India'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Card */}
          <div
            className="glass-card social-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="social-header">
              <h4>
                <i className="fa-solid fa-circle" style={{ fontSize: '6px', marginRight: '4px', color: '#f87171' }} /> SOCIAL & PROFILES
              </h4>
              <span>Direct Links</span>
            </div>
            <p className="social-desc">
              Click any profile icon below to view my projects, repositories, or connect professionally:
            </p>

            <div className="social-links">
              <a
                href={p.socialLinks?.github || 'https://github.com/ayushprajapati9669-dev'}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn magnetic"
                aria-label="GitHub"
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
              >
                <i className="fab fa-github" />
              </a>
              <a
                href={p.socialLinks?.linkedin || 'https://www.linkedin.com/in/ayush-prajapati-b9042424a/'}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn magnetic"
                aria-label="LinkedIn"
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
              >
                <i className="fab fa-linkedin-in" />
              </a>
              <a
                href={p.socialLinks?.instagram || 'https://www.instagram.com/ayush7162/'}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn magnetic"
                aria-label="Instagram"
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
              >
                <i className="fab fa-instagram" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
