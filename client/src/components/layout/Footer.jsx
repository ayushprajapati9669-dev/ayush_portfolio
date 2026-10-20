import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

export function Footer() {
  const { appState, showToast } = usePortfolio();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [timeFormat, setTimeFormat] = useState('IST');
  const [liveTimeString, setLiveTimeString] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const footerRef = useRef(null);

  // GSAP ScrollTrigger Entrance for Footer Columns
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !footerRef.current) return;

    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (_e) {}

    const ctx = gsap.context(() => {
      const cols = footerRef.current.querySelectorAll('.footer-col');
      gsap.from(cols, {
        y: 25,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      });
    }, footerRef);

    return () => ctx.revert();
  }, [location.pathname]);

  // Subtle Parallax on Footer Background Grid & Orb
  const handleFooterMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.03;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.03;
    const grid = footerRef.current.querySelector('#footerGrid');
    const orb = footerRef.current.querySelector('#footerOrb');
    if (grid) grid.style.transform = `translate(${x}px, ${y}px) translateZ(-10px)`;
    if (orb) orb.style.transform = `translate(${-x * 1.5}px, ${-y * 1.5}px)`;
  };

  const p = appState.profile || {};
  const ui = appState.uiLabels || {};

  // Live Clock (IST / UTC / LOCAL)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let str = '';
      if (timeFormat === 'IST') {
        str = now.toLocaleTimeString('en-IN', {
          hour12: false,
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' IST';
      } else if (timeFormat === 'UTC') {
        str = now.toLocaleTimeString('en-GB', {
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
    showToast(`Thanks for connecting! Confirmation sent to ${newsletterEmail}`, 'fa-paper-plane');
    setNewsletterEmail('');
  };

  const handleScrollToTop = (e) => {
    e.preventDefault();
    playTick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (path) => {
    playTick();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={footerRef}
      onMouseMove={handleFooterMouseMove}
      className={`dashboard-footer ${isAdmin ? 'admin-footer' : ''}`}
      id="godFooter"
    >
      <div className="footer-grid-bg" id="footerGrid" aria-hidden="true" />
      <div className="footer-orb" id="footerOrb" aria-hidden="true" />
      <div className="footer-glow-line" aria-hidden="true" />

      <div className="footer-content">
        {/* Left: Brand & Bio */}
        <div className="footer-col">
          <div className="footer-brand">
            <div className="footer-logo">{p.monogram || 'AP'}</div>
            <span className="footer-brand-name">{p.displayName || p.name || 'Ayush Prajapati'}</span>
          </div>
          <div className="footer-desc">
            <span>{p.headerSubtitle || 'Full-Stack Developer & UI/UX Designer.'}</span>
            <a href={`mailto:${p.email || 'ayushprajapati9669@gmail.com'}`}>
              {p.email || 'ayushprajapati9669@gmail.com'}
            </a>
            <span>
              {p.phone || '(+91) 9669802554'} · {p.location || 'SISTec, Bhopal'}
            </span>
          </div>
          <div className="footer-live-info">
            <div
              className="live-badge"
              onClick={handleToggleClock}
              style={{ cursor: 'pointer', userSelect: 'none', width: 'fit-content' }}
              title="Click to toggle timezone (IST / UTC / LOCAL)"
            >
              <i className="fa-regular fa-clock" />
              <span className="time-text">{liveTimeString || 'Loading clock...'}</span>
            </div>
          </div>
        </div>

        {/* Center: Explore Links */}
        <div className="footer-col">
          <div className="footer-title">Explore</div>
          <div className="footer-links">
            <button
              type="button"
              className="footer-link"
              onClick={() => handleNav('/')}
            >
              <i className="fa-solid fa-chevron-right" /> Home
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => handleNav('/about')}
            >
              <i className="fa-solid fa-chevron-right" /> About Me
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => handleNav('/skills')}
            >
              <i className="fa-solid fa-chevron-right" /> Skills & Tech
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => handleNav('/projects')}
            >
              <i className="fa-solid fa-chevron-right" /> Featured Projects
            </button>
            <button
              type="button"
              className="footer-link"
              onClick={() => handleNav('/certificates')}
            >
              <i className="fa-solid fa-chevron-right" /> Certificates
            </button>
            <button
              type="button"
              className="footer-link admin-link"
              onClick={() => handleNav('/admin')}
            >
              <i className="fa-solid fa-lock" /> Admin CMS
            </button>
          </div>
        </div>

        {/* Right: Premium Connect Box */}
        <div className="footer-col">
          <div className="footer-connect-box">
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                className="newsletter-input"
                placeholder="Enter email to connect..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe to updates">
                <i className="fa-solid fa-paper-plane" />
              </button>
            </form>

            <div className="footer-socials">
              <a
                href={p.socialLinks?.github || 'https://github.com/ayushprajapati9669-dev'}
                target="_blank"
                rel="noreferrer"
                className="social-icon github"
                title="GitHub"
                onClick={() => playTick()}
              >
                <i className="fa-brands fa-github" />
              </a>
              <a
                href={p.socialLinks?.linkedin || 'https://www.linkedin.com/in/ayush-prajapati-53b9a1288'}
                target="_blank"
                rel="noreferrer"
                className="social-icon linkedin"
                title="LinkedIn"
                onClick={() => playTick()}
              >
                <i className="fa-brands fa-linkedin-in" />
              </a>
              <a
                href={p.socialLinks?.instagram || 'https://www.instagram.com/prajapatiayush7162/'}
                target="_blank"
                rel="noreferrer"
                className="social-icon instagram"
                title="Instagram"
                onClick={() => playTick()}
              >
                <i className="fa-brands fa-instagram" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div>© 2026 {p.displayName || 'Ayush Prajapati'}. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/about" className="hover:text-white transition-colors" onClick={() => playTick()}>
            About
          </Link>
          <span style={{ color: '#333' }}>|</span>
          <Link to="/contact" className="hover:text-white transition-colors" onClick={() => playTick()}>
            Contact
          </Link>
          <button
            type="button"
            className="back-to-top"
            onClick={handleScrollToTop}
          >
            Back to Top <i className="fa-solid fa-arrow-up" />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
