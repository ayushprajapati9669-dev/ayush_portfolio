import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import '../../styles/footer.css';
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
  const [showBackToTop, setShowBackToTop] = useState(false);

  const footerRef = useRef(null);

  const p = appState.profile || {};
  const ui = appState.uiLabels || {};
  const s = appState.settings || {};
  const brandName = s.siteName || p.displayName || p.name || 'Ayush Prajapati';
  const effectiveEmail = s.contactEmail || p.email || 'ayushprajapati9669@gmail.com';
  const effectivePhone = s.contactPhone || p.phone || '(+91) 9669802554';

  // Viewport-gated entrance animation with clearProps: 'all'
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !footerRef.current) return;

    let ctx = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        observer.disconnect();
        ctx = gsap.context(() => {
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
      }
    }, { rootMargin: '100px 0px' });

    observer.observe(footerRef.current);

    return () => {
      observer.disconnect();
      if (ctx) ctx.revert();
    };
  }, [location.pathname]);

  // Live Clock (IST / UTC / LOCAL) — active only when footer is in view
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

    let interval = null;
    let observer = null;

    const startClock = () => {
      updateTime();
      if (!interval) interval = setInterval(updateTime, 1000);
    };

    const stopClock = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    if (footerRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        if (entry && entry.isIntersecting) {
          startClock();
        } else {
          stopClock();
        }
      }, { threshold: 0.01 });
      observer.observe(footerRef.current);
    } else {
      startClock();
    }

    return () => {
      stopClock();
      if (observer) observer.disconnect();
    };
  }, [timeFormat]);

  // Track scroll position on Admin CMS to reveal Back to Top button dynamically
  useEffect(() => {
    if (!isAdmin) return;

    const checkScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const contentArea = document.querySelector('.admin-content-area, .admin-main-wrapper, .admin-workspace');
      const innerScrollY = contentArea ? contentArea.scrollTop : 0;
      const currentScroll = Math.max(scrollY, innerScrollY);
      setShowBackToTop(currentScroll > 120);
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    const contentArea = document.querySelector('.admin-content-area, .admin-main-wrapper, .admin-workspace');
    if (contentArea) contentArea.addEventListener('scroll', checkScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkScroll);
      if (contentArea) contentArea.removeEventListener('scroll', checkScroll);
    };
  }, [isAdmin, location.pathname]);

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
    playTick('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
    const contentArea = document.querySelector('.admin-content-area, .admin-main-wrapper, .admin-workspace');
    if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (path) => {
    playTick();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Render Fixed Floating Controls on Admin CMS (Split Left & Right) ──
  if (isAdmin) {
    return (
      <aside
        id="adminFloatingActions"
        aria-label="Admin quick actions"
        className="fixed inset-x-0 bottom-4 sm:bottom-6 px-3.5 sm:px-6 z-[990] pointer-events-none flex items-center justify-between"
      >
        {/* Bottom-Left: Live Site Button */}
        <div className="admin-floating-left pointer-events-auto">
          <Link
            to="/"
            onClick={() => playTick()}
            className="group relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#080e1a]/92 hover:bg-[#0c1526] border border-yellow-500/30 hover:border-yellow-400 text-white shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_15px_rgba(212,175,55,0.1)] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 text-xs font-mono font-semibold"
            title="View Live Portfolio Site"
            aria-label="View Live Portfolio Site"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-xs text-yellow-400 group-hover:rotate-12 transition-transform" />
            <span className="font-mono text-xs font-semibold tracking-wide">Live Site</span>
          </Link>
        </div>

        {/* Bottom-Right: Back to Top Button (Scroll-Triggered) */}
        <div className="admin-floating-right pointer-events-auto">
          <button
            type="button"
            onClick={handleScrollToTop}
            className={`group relative flex items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-[#080e1a]/92 hover:bg-[#0c1526] border border-yellow-500/30 hover:border-yellow-400 text-yellow-400 hover:text-white shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_15px_rgba(212,175,55,0.1)] backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              showBackToTop ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
            }`}
            title="Back to Top"
            aria-label="Back to top"
          >
            <i className="fa-solid fa-arrow-up text-xs transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </aside>
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
              <div className="footer-brand-name">{brandName}</div>
            </div>

            <div className="footer-contact-list">
              <a
                href={`mailto:${effectiveEmail}`}
                className="footer-contact-item"
                onClick={() => playTick()}
              >
                <i className="fa-regular fa-envelope" />
                <span>{effectiveEmail}</span>
              </a>
              <a
                href={`tel:${effectivePhone}`}
                className="footer-contact-item"
                onClick={() => playTick()}
              >
                <i className="fa-solid fa-phone" />
                <span>{effectivePhone}</span>
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
              <button type="button" className="footer-nav-link" onClick={() => handleNav('/journey')}>
                <i className="fa-solid fa-chevron-right" />
                <span>Journey & Milestones</span>
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
            {s.copyrightText || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
