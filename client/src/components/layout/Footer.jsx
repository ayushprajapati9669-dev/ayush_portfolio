import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

export function Footer() {
  const { appState, showToast, openResumeModal } = usePortfolio();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [timeFormat, setTimeFormat] = useState('IST');
  const [liveTimeString, setLiveTimeString] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const footerRef = useRef(null);

  const p = appState.profile || {};
  const ui = appState.uiLabels || {};

  // Safe entrance animation with clearProps: 'all'
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !footerRef.current) return;

    const ctx = gsap.context(() => {
      const cols = footerRef.current.querySelectorAll('.footer-col');
      if (cols.length > 0) {
        gsap.fromTo(
          cols,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'all'
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, [location.pathname]);

  // Live Clock (IST / UTC / LOCAL)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let str = '';
      if (timeFormat === 'IST') {
        str =
          now.toLocaleTimeString('en-IN', {
            hour12: false,
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }) + ' IST';
      } else if (timeFormat === 'UTC') {
        str =
          now.toLocaleTimeString('en-GB', {
            hour12: false,
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }) + ' UTC';
      } else {
        str = now.toLocaleTimeString([], { hour12: false }) + ' LOCAL';
      }
      setLiveTimeString(str);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeFormat]);

  const handleToggleClock = () => {
    playTick();
    setTimeFormat((prev) => (prev === 'IST' ? 'UTC' : prev === 'UTC' ? 'LOCAL' : 'IST'));
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'fa-triangle-exclamation');
      return;
    }
    playTick();
    showToast(`Thank you! Connected with ${newsletterEmail}`, 'fa-paper-plane');
    setNewsletterEmail('');
  };

  const handleScrollToTop = (e) => {
    if (e) e.preventDefault();
    playTick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (path) => {
    playTick();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Render Admin Footer when in Admin CMS ──
  if (isAdmin) {
    return (
      <footer ref={footerRef} className="dashboard-footer admin-footer" id="adminFooter">
        <div className="admin-footer-bar">
          <div className="admin-footer-left">
            <div className="footer-monogram" style={{ width: '30px', height: '30px', fontSize: '13px' }}>
              {p.monogram || 'AP'}
            </div>
            <div>
              <span className="font-semibold text-xs text-white">
                {p.displayName || p.name || 'Ayush Prajapati'}
              </span>
              <span className="text-[11px] text-stone-500 ml-2 font-mono">
                CMS Studio v9.4 · Production
              </span>
            </div>
          </div>

          <div className="admin-footer-badges">
            <span className="admin-footer-badge" title="Database status">
              <span className="admin-dot admin-dot-green" />
              <span>MongoDB Atlas Connected</span>
            </span>
            <span className="admin-footer-badge" title="API Gateway">
              <span className="admin-dot admin-dot-green" />
              <span>REST API: Port 6000</span>
            </span>
            <span className="admin-footer-badge" title="Authentication status">
              <span className="admin-dot admin-dot-gold" />
              <span>HttpOnly Session Active</span>
            </span>
          </div>

          <div className="admin-footer-actions">
            <Link to="/" className="admin-footer-btn" onClick={() => playTick()}>
              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '9px' }} />
              <span>Live Site</span>
            </Link>
            <button type="button" className="admin-footer-btn" onClick={handleScrollToTop}>
              <i className="fa-solid fa-arrow-up" style={{ fontSize: '9px' }} />
              <span>Top</span>
            </button>
          </div>
        </div>
      </footer>
    );
  }

  // ── Render Full Public VSLFlow Luxury Footer ──
  return (
    <footer ref={footerRef} className="dashboard-footer" id="godFooter">
      <div className="footer-container">
        <div className="footer-main-grid">
          {/* Column 1: Brand & Contact Identity */}
          <div className="footer-col">
            <div className="footer-brand-row">
              <div className="footer-monogram">{p.monogram || 'AP'}</div>
              <div className="footer-brand-name">{p.displayName || p.name || 'Ayush Prajapati'}</div>
            </div>

            <p className="footer-bio-text">
              {p.aboutBio?.[0] ||
                p.headerSubtitle ||
                'Computer Science Engineer specializing in scalable full-stack web applications, interactive architectures, and intelligent systems.'}
            </p>

            <div className="footer-contact-list">
              <a
                href={`mailto:${p.email || 'ayushprajapati9669@gmail.com'}`}
                className="footer-contact-item"
                onClick={() => playTick()}
              >
                <i className="fa-regular fa-envelope" />
                <span>{p.email || 'ayushprajapati9669@gmail.com'}</span>
              </a>
              <a
                href={`tel:${p.phone || '+919669802554'}`}
                className="footer-contact-item"
                onClick={() => playTick()}
              >
                <i className="fa-solid fa-phone" />
                <span>{p.phone || '(+91) 9669802554'}</span>
              </a>
              <div className="footer-contact-item">
                <i className="fa-solid fa-location-dot" />
                <span>{p.location || 'SISTec, Bhopal, Madhya Pradesh, India'}</span>
              </div>
            </div>

            {/* Clickable Live Clock & Timezone Status */}
            <div
              className="footer-live-badge"
              onClick={handleToggleClock}
              title="Click to toggle timezone (IST / UTC / LOCAL)"
            >
              <span className="live-pulse-dot" />
              <span>AVAILABLE FOR ROLES</span>
              <span style={{ color: '#666' }}>·</span>
              <span style={{ color: '#d4af37' }}>{liveTimeString || '09:00 PM IST'}</span>
            </div>
          </div>

          {/* Column 2: Sitemap & Exploration */}
          <div className="footer-col">
            <div className="footer-col-title">01 / SITEMAP</div>
            <div className="footer-links-list">
              <button type="button" className="footer-nav-link" onClick={() => handleNav('/')}>
                <i className="fa-solid fa-chevron-right" />
                <span>Home Page</span>
              </button>
              <button type="button" className="footer-nav-link" onClick={() => handleNav('/about')}>
                <i className="fa-solid fa-chevron-right" />
                <span>About & Milestones</span>
              </button>
              <button type="button" className="footer-nav-link" onClick={() => handleNav('/skills')}>
                <i className="fa-solid fa-chevron-right" />
                <span>Skills & Tech Stack</span>
              </button>
              <button type="button" className="footer-nav-link" onClick={() => handleNav('/projects')}>
                <i className="fa-solid fa-chevron-right" />
                <span>Featured Projects</span>
              </button>
              <button type="button" className="footer-nav-link" onClick={() => handleNav('/certificates')}>
                <i className="fa-solid fa-chevron-right" />
                <span>Verified Certificates</span>
              </button>
              <button type="button" className="footer-nav-link" onClick={() => handleNav('/contact')}>
                <i className="fa-solid fa-chevron-right" />
                <span>Get In Touch</span>
              </button>
            </div>
          </div>

          {/* Column 3: Developer & Interactive Tools */}
          <div className="footer-col">
            <div className="footer-col-title">02 / DEVELOPER</div>
            <div className="footer-links-list">
              <button
                type="button"
                className="footer-nav-link"
                onClick={() => {
                  playTick();
                  window.dispatchEvent(new CustomEvent('ams-open-terminal'));
                }}
              >
                <i className="fa-solid fa-terminal text-yellow-400" />
                <span>&gt;_ Retro CLI Terminal</span>
              </button>
              <button
                type="button"
                className="footer-nav-link"
                onClick={() => {
                  playTick();
                  if (openResumeModal) openResumeModal();
                  else showToast('Opening Resume...');
                }}
              >
                <i className="fa-solid fa-file-pdf" />
                <span>Curriculum Vitae (PDF)</span>
              </button>
              <button
                type="button"
                className="footer-nav-link"
                onClick={() => {
                  playTick();
                  window.dispatchEvent(new CustomEvent('ams-open-ask-ai'));
                }}
              >
                <i className="fa-solid fa-wand-magic-sparkles" />
                <span>Ask Ayush AI Assistant</span>
              </button>
              <button
                type="button"
                className="footer-nav-link"
                onClick={() => handleNav('/admin')}
              >
                <i className="fa-solid fa-shield-halved" />
                <span>Admin CMS Studio</span>
              </button>
            </div>
          </div>

          {/* Column 4: Connect & Newsletter */}
          <div className="footer-col">
            <div className="footer-col-title">03 / CONNECT</div>
            <p className="footer-bio-text" style={{ fontSize: '13px' }}>
              Have an engineering opportunity or project in mind? Reach out directly or stay in touch.
            </p>

            <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                className="footer-newsletter-input"
                placeholder="Enter email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                aria-label="Email address"
              />
              <button type="submit" className="footer-newsletter-btn" aria-label="Send email">
                <i className="fa-solid fa-arrow-right" />
              </button>
            </form>

            <div className="footer-social-row">
              <a
                href={p.socialLinks?.github || 'https://github.com/ayushprajapati9669-dev'}
                target="_blank"
                rel="noreferrer"
                className="footer-social-pill"
                title="GitHub"
                onClick={() => playTick()}
              >
                <i className="fa-brands fa-github" />
              </a>
              <a
                href={p.socialLinks?.linkedin || 'https://www.linkedin.com/in/ayush-prajapati-53b9a1288'}
                target="_blank"
                rel="noreferrer"
                className="footer-social-pill"
                title="LinkedIn"
                onClick={() => playTick()}
              >
                <i className="fa-brands fa-linkedin-in" />
              </a>
              <a
                href={p.socialLinks?.instagram || 'https://www.instagram.com/prajapatiayush7162/'}
                target="_blank"
                rel="noreferrer"
                className="footer-social-pill"
                title="Instagram"
                onClick={() => playTick()}
              >
                <i className="fa-brands fa-instagram" />
              </a>
              <a
                href={`mailto:${p.email || 'ayushprajapati9669@gmail.com'}`}
                className="footer-social-pill"
                title="Direct Email"
                onClick={() => playTick()}
              >
                <i className="fa-solid fa-envelope" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © 2026 {p.displayName || p.name || 'Ayush Prajapati'}. All rights reserved.
            <span className="hidden sm:inline" style={{ color: '#444' }}> · </span>
            <span className="hidden sm:inline" style={{ color: '#888' }}>
              Engineered with MERN Stack & VSLFlow Design System.
            </span>
          </div>

          <div className="footer-bottom-links">
            <Link to="/about" onClick={() => playTick()}>About</Link>
            <Link to="/projects" onClick={() => playTick()}>Projects</Link>
            <Link to="/contact" onClick={() => playTick()}>Contact</Link>
            <button type="button" className="footer-btn-top" onClick={handleScrollToTop}>
              <span>Back to Top</span>
              <i className="fa-solid fa-arrow-up" style={{ fontSize: '9px' }} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
