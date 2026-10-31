import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { playTick } from '../../utils/audio';
import { CommandPalette } from '../ui/CommandPalette';

export function Header() {
  const { appState, showToast, openResumeModal } = usePortfolio();
  const { session } = useAuth();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState([]);

  const navWrapperRef = useRef(null);
  const navbarRef = useRef(null);
  const navCenterRef = useRef(null);
  const activePillRef = useRef(null);
  const notifWrapRef = useRef(null);

  const p = appState.profile || {};
  const ui = appState.uiLabels || {};

  // Theme & Accent controls for Admin Top Navbar
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('admin_theme_v9') || 'theme-midnight');
  const [currentAccent, setCurrentAccent] = useState(() => localStorage.getItem('admin_accent_v9') || 'accent-cyan');
  const [currentDensity, setCurrentDensity] = useState(() => localStorage.getItem('admin_density_v9') || 'comfortable');
  const [accentPaletteOpen, setAccentPaletteOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const THEME_CLASSES = [
    'theme-midnight',
    'theme-ocean',
    'theme-forest',
    'theme-sunset',
    'theme-cyberpunk',
    'theme-gold',
    'theme-dracula',
    'theme-nord',
    'theme-synthwave',
    'theme-tokyo'
  ];
  const ACCENT_CLASSES = ['accent-cyan', 'accent-violet', 'accent-rose', 'accent-emerald', 'accent-amber', 'accent-pink', 'accent-lime', 'accent-blue'];

  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [liveTime, setLiveTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setLiveTime(`${hours}:${minutes} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  const toolsMenuRef = useRef(null);
  const accentPickerRef = useRef(null);

  useEffect(() => {
    let savedTheme = localStorage.getItem('portfolio_theme') || localStorage.getItem('admin_theme_v9') || 'theme-midnight';
    if (savedTheme === 'theme-light') savedTheme = 'theme-midnight';
    const savedAccent = localStorage.getItem('portfolio_accent') || localStorage.getItem('admin_accent_v9') || 'accent-cyan';

    document.body.classList.remove('theme-light', ...THEME_CLASSES);
    document.body.classList.add(savedTheme);
    setCurrentTheme(savedTheme);

    document.body.classList.remove(...ACCENT_CLASSES);
    document.body.classList.add(savedAccent);
    setCurrentAccent(savedAccent);
  }, []);

  const handleThemeChange = (newTheme) => {
    playTick();
    setCurrentTheme(newTheme);
    document.body.classList.remove('theme-light', ...THEME_CLASSES);
    document.body.classList.add(newTheme);
    try {
      localStorage.setItem('portfolio_theme', newTheme);
      localStorage.setItem('admin_theme_v9', newTheme);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('admin-theme-changed', { detail: { theme: newTheme } }));
    showToast(`Switched theme to ${newTheme.replace('theme-', '')}`);
  };

  const handleAccentChange = (newAccent) => {
    playTick();
    setCurrentAccent(newAccent);
    document.body.classList.remove(...ACCENT_CLASSES);
    document.body.classList.add(newAccent);
    try {
      localStorage.setItem('portfolio_accent', newAccent);
      localStorage.setItem('admin_accent_v9', newAccent);
    } catch (e) {}
    setAccentPaletteOpen(false);
    window.dispatchEvent(new CustomEvent('admin-accent-changed', { detail: { accent: newAccent } }));
    showToast('Updated accent color');
  };

  const handleToggleFocus = () => {
    playTick();
    setIsFocusMode((prev) => {
      const next = !prev;
      if (next) document.body.classList.add('focus-mode');
      else document.body.classList.remove('focus-mode');
      return next;
    });
  };

  // Keyboard shortcut listener for Esc / F to exit focus mode
  useEffect(() => {
    const handleKey = (e) => {
      const isInput =
        ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) ||
        document.activeElement?.isContentEditable;

      // F key: Toggle Focus Mode & Full Screen
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !isInput) {
        e.preventDefault();
        playTick();
        const willFocus = !document.body.classList.contains('focus-mode');
        if (willFocus) {
          document.body.classList.add('focus-mode');
          setIsFocusMode(true);
          showToast('Focus Mode & Full Screen Enabled (Press F or Esc to exit)', 'fa-expand');
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } else {
          document.body.classList.remove('focus-mode');
          setIsFocusMode(false);
          showToast('Exited Focus Mode', 'fa-compress');
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      }

      // Escape key: Exit Focus Mode & Full Screen
      if (e.key === 'Escape') {
        if (document.body.classList.contains('focus-mode')) {
          document.body.classList.remove('focus-mode');
          setIsFocusMode(false);
          showToast('Exited Focus Mode', 'fa-compress');
        }
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }

      // ? key: Open Keyboard Shortcuts
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        playTick();
        window.dispatchEvent(new CustomEvent('ams-open-shortcuts'));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showToast]);

  const handleToggleVoice = () => {
    playTick();
    window.dispatchEvent(new CustomEvent('ams-toggle-voice'));
  };

  const handleOpenShortcuts = () => {
    playTick();
    window.dispatchEvent(new CustomEvent('ams-open-shortcuts'));
  };

  // Register global command palette opener for shortcuts
  useEffect(() => {
    window.__openCommandPalette = (opts) => {
      if (opts?.query) {
        window.__cmdPaletteInitialQuery = opts.query;
      }
      setCmdOpen(true);
    };
    return () => {
      delete window.__openCommandPalette;
    };
  }, []);

  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

  const navItems = [
    { name: ui.navHome || 'Home', path: '/', icon: 'fa-solid fa-house' },
    { name: ui.navAbout || 'About', path: '/about', icon: 'fa-regular fa-user' },
    { name: ui.navSkills || 'Skills', path: '/skills', icon: 'fa-solid fa-code' },
    { name: ui.navProjects || 'Projects', path: '/projects', icon: 'fa-solid fa-layer-group' },
    { name: isAdmin ? 'Certs' : (ui.navCertificates || 'Certificates'), path: '/certificates', icon: 'fa-solid fa-certificate' }
  ];

  // Outside click listener for tools popover
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
        setToolsMenuOpen(false);
      }
    };
    if (toolsMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [toolsMenuOpen]);

  // Dynamic notifications from messages & portfolio state
  const rawNotifications = [
    ...(appState.messages || []).slice(0, 3).map((m) => ({
      id: 'msg-' + m.id,
      title: `Message from ${m.name || 'Visitor'}`,
      desc: m.subject || m.message?.slice(0, 45) + '...',
      time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
      icon: 'fa-envelope',
      iconBg: 'rgba(245,158,11,0.1)',
      iconColor: '#f59e0b',
      unread: m.status === 'unread' && !readNotifIds.includes('msg-' + m.id)
    })),
    {
      id: 'stat-project-live',
      title: 'Portfolio Projects Live',
      desc: `${(appState.projects || []).length} interactive full-stack projects online.`,
      time: 'Live',
      icon: 'fa-rocket',
      iconBg: 'rgba(0,255,136,0.1)',
      iconColor: 'var(--accent-2, #00ff88)',
      unread: !readNotifIds.includes('stat-project-live')
    },
    {
      id: 'stat-cert-verified',
      title: 'Certificates Verified',
      desc: `${(appState.certificates || []).length} accredited credentials ready to inspect.`,
      time: 'Verified',
      icon: 'fa-shield-halved',
      iconBg: 'rgba(0,240,255,0.1)',
      iconColor: 'var(--accent-1, #00f0ff)',
      unread: !readNotifIds.includes('stat-cert-verified')
    }
  ];

  const unreadCount = rawNotifications.filter((n) => n.unread).length;

  // Active pill sliding calculation
  const updatePill = (targetEl) => {
    const navCenter = navCenterRef.current;
    const pill = activePillRef.current;
    if (!navCenter || !pill) return;

    const el = targetEl || navCenter.querySelector('.nav-link.active');
    if (!el) {
      pill.style.opacity = '0';
      return;
    }

    const navRect = navCenter.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    if (navRect.width === 0) return;

    pill.style.opacity = '1';
    pill.style.width = `${elRect.width}px`;
    pill.style.left = `${elRect.left - navRect.left}px`;

    // Smooth double-pill hover system matching 3D liquid droplets theme
    if (targetEl && !targetEl.classList.contains('active')) {
      pill.style.background = 'rgba(255, 255, 255, 0.2)';
      pill.style.boxShadow = 'none';
    } else {
      pill.style.background = 'linear-gradient(135deg, #38bdf8, #0ea5e9)';
      pill.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.4)';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePill();
    }, 80);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Window resize handler for pill
  useEffect(() => {
    const handleResize = () => updatePill();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3D Tilt, Scroll Shrink & Magnetic GSAP effects (matching uploaded HTML)
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const navWrapper = navWrapperRef.current;
    const navbar = navbarRef.current;
    if (!navWrapper || !navbar) return;

    // In Admin mode, keep navbar solid and stable without 3D tilting
    if (isAdmin) {
      gsap.set(navbar, { rotateX: 0, rotateY: 0, x: 0, y: 0 });
      return;
    }

    // 1. Entrance drop-in
    gsap.from(navWrapper, {
      y: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.15,
      clearProps: 'all'
    });

    // 2. 3D Tilt on mouse move
    const handleMouseMove = (e) => {
      const rect = navbar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(navbar, {
        rotateX: ((y - rect.height / 2) / rect.height) * -6,
        rotateY: ((x - rect.width / 2) / rect.width) * 6,
        x: (x - rect.width / 2) * 0.02,
        y: (y - rect.height / 2) * 0.02,
        transformPerspective: 1200,
        duration: 0.35,
        ease: 'power2.out'
      });

      navbar.style.setProperty('--mouse-x', `${x}px`);
      navbar.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseLeave = () => {
      gsap.to(navbar, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)'
      });
    };

    navWrapper.addEventListener('mousemove', handleMouseMove);
    navWrapper.addEventListener('mouseleave', handleMouseLeave);

    // 3. Navbar scroll shrink & background elevation
    let scrollState = false;
    const handleScroll = () => {
      const s = window.scrollY > 50;
      if (s === scrollState) return;
      scrollState = s;

      if (s) {
        navWrapper.classList.add('scrolled');
        gsap.to(navbar, { backgroundColor: 'rgba(5, 8, 12, 0.95)', duration: 0.4, ease: 'power2.out' });
      } else {
        navWrapper.classList.remove('scrolled');
        gsap.to(navbar, { backgroundColor: 'rgba(10, 15, 20, 0.7)', duration: 0.4, ease: 'power2.out' });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 4. Magnetic buttons hover physics
    const magneticEls = navWrapper.querySelectorAll('.magnetic');
    const magneticCleanups = [];

    magneticEls.forEach((el) => {
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - rect.left - rect.width / 2) * 0.25,
          y: (e.clientY - rect.top - rect.height / 2) * 0.25,
          duration: 0.4,
          ease: 'power2.out'
        });
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      magneticCleanups.push(() => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      navWrapper.removeEventListener('mousemove', handleMouseMove);
      navWrapper.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      magneticCleanups.forEach((fn) => fn());
    };
  }, [isAdmin]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
        setToolsMenuOpen(false);
      }
      if (accentPickerRef.current && !accentPickerRef.current.contains(e.target)) {
        setAccentPaletteOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    playTick();
    setReadNotifIds(rawNotifications.map((n) => n.id));
    showToast('All notifications marked as read', 'fa-check-double');
  };

  return (
    <>
      <header className="nav-wrapper" id="navWrapper" ref={navWrapperRef}>
        <div className="nav-beam-container">
          <div className="nav-beam-clip">
            <div className="nav-beam" />
          </div>
          <nav className="navbar" id="navbar" ref={navbarRef}>
            {/* Left: Brand / Monogram */}
            <Link to="/" className="nav-left" onClick={() => playTick()}>
              <div className="nav-logo-box">
                {p.monogram || 'AP'}
              </div>
              <div className="nav-logo-text">
                {p.displayName || p.name || 'Ayush Prajapati'}
              </div>
            </Link>

            {/* Center: Sliding Active Pill Nav (Desktop) */}
            <div className="nav-center" id="navCenter" ref={navCenterRef}>
              <div className="active-pill" id="activePill" ref={activePillRef} />
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => playTick()}
                  onMouseEnter={(e) => {
                    playTick();
                    updatePill(e.currentTarget);
                  }}
                  onMouseLeave={() => updatePill()}
                >
                  {({ isActive }) => (
                    <>
                      <i className={item.icon} />
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="nav-active-dot" aria-hidden="true" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right: Notification Bell, Search (⌘K), Hire CTA, Admin CMS, Mobile Toggle */}
            <div className="nav-right">
              {/* Notification Bell (Only visible on Admin Dashboard) */}
              {isAdmin && (
                <div className="notif-wrap" ref={notifWrapRef}>
                  <button
                    type="button"
                    className={`notif-btn ${notifOpen ? 'open' : ''}`}
                    onClick={() => {
                      playTick();
                      setNotifOpen((prev) => !prev);
                    }}
                    aria-label="Toggle notifications"
                  >
                    <i className="fa-regular fa-bell" />
                    {unreadCount > 0 && (
                      <span className="notif-badge">{unreadCount}</span>
                    )}
                  </button>

                  <div className={`notif-dropdown ${notifOpen ? 'open' : ''}`}>
                    <div className="notif-head">
                      <h4>
                        <i className="fa-solid fa-bolt" style={{ color: 'var(--accent-1)' }} />
                        Notifications
                        <span className="count-pill">{unreadCount} new</span>
                      </h4>
                      <button
                        type="button"
                        className="notif-mark-read"
                        onClick={handleMarkAllRead}
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="notif-list">
                      {rawNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${n.unread ? 'unread' : ''}`}
                          onClick={() => {
                            playTick();
                            if (!readNotifIds.includes(n.id)) {
                              setReadNotifIds((prev) => [...prev, n.id]);
                            }
                          }}
                        >
                          <div className="notif-ico" style={{ background: n.iconBg, color: n.iconColor }}>
                            <i className={`fa-solid ${n.icon}`} />
                          </div>
                          <div className="notif-body">
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-desc">{n.desc}</div>
                            <div className="notif-time">
                              <i className="fa-regular fa-clock" /> {n.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="notif-foot">
                      <Link
                        to="/admin"
                        onClick={() => {
                          playTick();
                          setNotifOpen(false);
                        }}
                      >
                        <i className="fa-solid fa-arrow-right" /> View all in Admin CMS
                      </Link>
                    </div>
                  </div>
                </div>
              )}                {/* Live IST Clock */}
              <div className="nav-time-stamp hidden lg:inline-flex items-center text-xs text-slate-400 font-mono mr-1">
                {liveTime}
              </div>

              {/* Theme & Accent Controls (Available across ALL pages: Public & Admin) */}
              <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                {/* Theme Selector Dropdown (10 Curated Dark Themes - No Light) */}
                <select
                  className="theme-selector"
                  value={currentTheme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  aria-label="Theme Selector"
                >
                  <option value="theme-midnight">🌙 Midnight</option>
                  <option value="theme-ocean">🌊 Ocean</option>
                  <option value="theme-forest">🌲 Forest</option>
                  <option value="theme-sunset">🌅 Sunset</option>
                  <option value="theme-cyberpunk">⚡ Cyberpunk</option>
                  <option value="theme-gold">👑 Luxury Gold</option>
                  <option value="theme-dracula">🧛 Dracula</option>
                  <option value="theme-nord">❄️ Nord Frost</option>
                  <option value="theme-synthwave">👾 Synthwave 84</option>
                  <option value="theme-tokyo">🌌 Tokyo Night</option>
                </select>

                {/* Accent Color Palette (8 vibrant colors) */}
                <div className="accent-picker-wrapper relative" ref={accentPickerRef}>
                  <button
                    type="button"
                    className="accent-picker-btn"
                    onClick={() => setAccentPaletteOpen((prev) => !prev)}
                    title="Accent Color"
                    aria-label="Accent color"
                  />
                  {accentPaletteOpen && (
                    <div className="accent-palette active" style={{ display: 'flex' }}>
                      <div className={`accent-swatch ${currentAccent === 'accent-cyan' ? 'selected' : ''}`} style={{ background: '#06b6d4' }} onClick={() => handleAccentChange('accent-cyan')} title="Electric Cyan" />
                      <div className={`accent-swatch ${currentAccent === 'accent-violet' ? 'selected' : ''}`} style={{ background: '#a855f7' }} onClick={() => handleAccentChange('accent-violet')} title="Neon Violet" />
                      <div className={`accent-swatch ${currentAccent === 'accent-rose' ? 'selected' : ''}`} style={{ background: '#f43f5e' }} onClick={() => handleAccentChange('accent-rose')} title="Crimson Rose" />
                      <div className={`accent-swatch ${currentAccent === 'accent-emerald' ? 'selected' : ''}`} style={{ background: '#10b981' }} onClick={() => handleAccentChange('accent-emerald')} title="Cyber Emerald" />
                      <div className={`accent-swatch ${currentAccent === 'accent-amber' ? 'selected' : ''}`} style={{ background: '#f59e0b' }} onClick={() => handleAccentChange('accent-amber')} title="Royal Amber" />
                      <div className={`accent-swatch ${currentAccent === 'accent-pink' ? 'selected' : ''}`} style={{ background: '#ec4899' }} onClick={() => handleAccentChange('accent-pink')} title="Hot Pink" />
                      <div className={`accent-swatch ${currentAccent === 'accent-lime' ? 'selected' : ''}`} style={{ background: '#84cc16' }} onClick={() => handleAccentChange('accent-lime')} title="Toxic Lime" />
                      <div className={`accent-swatch ${currentAccent === 'accent-blue' ? 'selected' : ''}`} style={{ background: '#3b82f6' }} onClick={() => handleAccentChange('accent-blue')} title="Sapphire Blue" />
                    </div>
                  )}
                </div>

                {/* Admin Quick Settings & Tools Dropdown */}
                {isAdmin && (
                  <div className="relative" ref={toolsMenuRef}>
                    <button
                      type="button"
                      className={`btn-icon ${toolsMenuOpen ? 'active' : ''}`}
                      onClick={() => {
                        playTick();
                        setToolsMenuOpen((prev) => !prev);
                      }}
                      title="Quick Settings & Tools"
                      aria-label="Quick Settings & Tools"
                    >
                      <i className="fa-solid fa-sliders text-xs" />
                    </button>

                    {toolsMenuOpen && (
                      <div className="admin-tools-popover">
                        <div className="popover-title">Quick Settings & Tools</div>
                        <button
                          type="button"
                          className="popover-item"
                          onClick={() => {
                            handleToggleVoice();
                            setToolsMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-microphone text-xs" />
                          <span>Voice Commands</span>
                        </button>
                        <button
                          type="button"
                          className="popover-item"
                          onClick={() => {
                            handleToggleFocus();
                            setToolsMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-expand text-xs" />
                          <span>{isFocusMode ? 'Exit Focus Mode' : 'Focus Mode (Zoom)'}</span>
                          <kbd className="ml-auto text-[9px] bg-white/10 px-1 py-0.5 rounded">F</kbd>
                        </button>
                        <button
                          type="button"
                          className="popover-item"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('ams-open-terminal'));
                            setToolsMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-terminal text-xs text-cyan-400" />
                          <span>Developer Terminal</span>
                          <kbd className="ml-auto text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono">Ctrl+~</kbd>
                        </button>
                        <button
                          type="button"
                          className="popover-item"
                          onClick={() => {
                            handleOpenShortcuts();
                            setToolsMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-keyboard text-xs" />
                          <span>Keyboard Shortcuts</span>
                          <kbd className="ml-auto text-[9px] bg-white/10 px-1 py-0.5 rounded">?</kbd>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Command Palette Trigger (Search ⌘K) (Positioned with safe right padding) */}
              {isAdmin && (
                <div className="magnetic mr-1 shrink-0">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      playTick();
                      setCmdOpen(true);
                    }}
                  >
                    <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '11px' }} />
                    <span>Search</span>
                    <span className="cmd-kbd">⌘K</span>
                  </button>
                </div>
              )}

              {/* Subtle divider before CTA (matching reference image) */}
              {isAdmin && <span className="nav-v-divider" aria-hidden="true" />}

              {/* Developer CLI Terminal Trigger (Retro Cyberpunk >_ Terminal) */}
              {!isAdmin && (
                <div className="magnetic">
                  <button
                    type="button"
                    className="btn-outline font-mono"
                    onClick={() => {
                      playTick('click');
                      window.dispatchEvent(new CustomEvent('ams-open-terminal'));
                    }}
                    title="Open Retro Developer Terminal (Ctrl + ~)"
                  >
                    <i className="fa-solid fa-terminal text-cyan-400" style={{ fontSize: '10px' }} />
                    <span className="hidden sm:inline">&gt;_ Terminal</span>
                    <span className="cmd-kbd hidden xl:inline">Ctrl+~</span>
                  </button>
                </div>
              )}

              {/* Resume Button (Only visible on Public pages per reference) */}
              {!isAdmin && (
                <div className="magnetic">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      playTick();
                      if (openResumeModal) {
                        openResumeModal();
                      } else {
                        showToast('Opening Resume...');
                      }
                    }}
                  >
                    <span>Resume</span>
                    <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px' }} />
                  </button>
                </div>
              )}

              {/* Hire / Connect CTA (Visible only on Public pages, hidden on admin side) */}
              {!isAdmin && (
                <div className="magnetic">
                  <Link
                    to="/contact"
                    className="btn-primary"
                    onClick={() => playTick()}
                  >
                    <i className="fa-solid fa-paper-plane" style={{ fontSize: '11px' }} />
                    <span>Hire / Connect</span>
                  </Link>
                </div>
              )}

              {/* Admin CMS Button (Visible when on Admin Dashboard) */}
              {isAdmin && (
                <div className="magnetic">
                  <Link
                    to="/admin"
                    className={`btn-admin-cms ${isAdmin ? 'active' : ''}`}
                    onClick={() => playTick()}
                  >
                    <i className="fa-solid fa-shield-halved text-black" />
                    <span>Admin CMS</span>
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                type="button"
                className="mobile-nav-toggle"
                onClick={() => {
                  playTick();
                  setMobileMenuOpen(true);
                }}
                aria-label="Open navigation menu"
              >
                <i className="fa-solid fa-bars" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="flex items-center gap-3">
            <div className="nav-logo-box">{p.monogram || 'AP'}</div>
            <div className="text-white font-bold">{p.displayName || 'Ayush Prajapati'}</div>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-white text-xl p-2"
            aria-label="Close navigation menu"
            onClick={() => {
              playTick();
              setMobileMenuOpen(false);
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="mobile-drawer-links">
          <div className="mobile-drawer-theme-box mb-3 pb-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Theme Palette:</span>
            <select
              className="theme-selector-mobile text-xs py-1.5 px-3 rounded-lg bg-black/60 border border-white/20 text-white outline-none"
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              aria-label="Mobile Theme Selector"
            >
              <option value="theme-midnight">🌙 Midnight</option>
              <option value="theme-ocean">🌊 Ocean</option>
              <option value="theme-forest">🌲 Forest</option>
              <option value="theme-sunset">🌅 Sunset</option>
              <option value="theme-cyberpunk">⚡ Cyberpunk</option>
              <option value="theme-gold">👑 Luxury Gold</option>
              <option value="theme-dracula">🧛 Dracula</option>
              <option value="theme-nord">❄️ Nord Frost</option>
              <option value="theme-synthwave">👾 Synthwave 84</option>
              <option value="theme-tokyo">🌌 Tokyo Night</option>
            </select>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mobile-drawer-link ${isActive ? 'active' : ''} ${item.isAdmin ? 'text-orange-400 font-bold' : ''}`
              }
              onClick={() => {
                playTick();
                setMobileMenuOpen(false);
              }}
            >
              <i className={item.icon} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between gap-2">
          {!isAdmin ? (
            <button
              type="button"
              className="btn-outline"
              style={{ display: 'flex', fontSize: '12px', padding: '8px 14px' }}
              onClick={() => {
                playTick();
                setMobileMenuOpen(false);
                if (openResumeModal) {
                  openResumeModal();
                } else {
                  showToast('Opening Resume...');
                }
              }}
            >
              Resume <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px' }} />
            </button>
          ) : (
            <button
              type="button"
              className="btn-outline"
              style={{ display: 'flex', fontSize: '12px', padding: '8px 14px' }}
              onClick={() => {
                playTick();
                setMobileMenuOpen(false);
                setCmdOpen(true);
              }}
            >
              <i className="fa-solid fa-magnifying-glass" /> Search ⌘K
            </button>
          )}
          <Link
            to="/contact"
            className="btn-primary"
            style={{ fontSize: '12px', padding: '8px 16px' }}
            onClick={() => {
              playTick();
              setMobileMenuOpen(false);
            }}
          >
            Hire / Connect
          </Link>
        </div>
      </div>

      {/* Floating Exit Focus Mode Button */}
      {isFocusMode && (
        <button
          type="button"
          className="exit-focus-btn"
          onClick={handleToggleFocus}
          title="Exit Focus Mode (Esc or F)"
          aria-label="Exit Focus Mode"
        >
          <i className="fa-solid fa-compress" />
          <span>Exit Focus Mode</span>
          <kbd>Esc</kbd>
        </button>
      )}

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
      />
    </>
  );
}

export const Navbar = Header;
export default Header;
