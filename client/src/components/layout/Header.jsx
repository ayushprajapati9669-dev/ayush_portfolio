import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import '../../styles/navbar.css';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { playTick } from '../../utils/audio';
import { useScrollLock } from '../../utils/scrollLock';
import { useFocusTrap } from '../../utils/focusTrap';
import { runOnIdle, cancelIdle } from '../../utils/idle';

const CommandPalette = React.lazy(() =>
  import('../ui/CommandPalette').then((m) => ({ default: m.CommandPalette }))
);
const KeyboardShortcutsModal = React.lazy(() =>
  import('../ui/KeyboardShortcutsModal').then((m) => ({ default: m.KeyboardShortcutsModal }))
);
const AdminVoiceAssistant = React.lazy(() =>
  import('../ui/AdminVoiceAssistant').then((m) => ({ default: m.AdminVoiceAssistant }))
);

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Recent';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diffMs) || diffMs < 0) return 'Just now';
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function Header() {
  const { appState, updateAppState, showToast, openResumeModal } = usePortfolio();
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);
  const mobileDrawerRef = useRef(null);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_read_notifs_v9');
      return stored ? JSON.parse(stored) : [];
    } catch (_e) {
      return [];
    }
  });

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
  const toolsMenuRef = useRef(null);
  const accentPickerRef = useRef(null);

  useEffect(() => {
    let savedTheme = localStorage.getItem('portfolio_theme') || localStorage.getItem('admin_theme_v9') || 'theme-midnight';
    if (savedTheme === 'theme-light') savedTheme = 'theme-midnight';
    const savedAccent = localStorage.getItem('portfolio_accent') || localStorage.getItem('admin_accent_v9') || 'accent-cyan';

    if (!document.body.classList.contains(savedTheme)) {
      document.body.classList.remove('theme-light', ...THEME_CLASSES);
      document.body.classList.add(savedTheme);
      setCurrentTheme(savedTheme);
    }

    if (!document.body.classList.contains(savedAccent)) {
      document.body.classList.remove(...ACCENT_CLASSES);
      document.body.classList.add(savedAccent);
      setCurrentAccent(savedAccent);
    }
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

      // ⌘K / Ctrl+K: Open Command Palette & Global Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        playTick();
        setCmdOpen((prev) => !prev);
      }

      // ? key: Open Keyboard Shortcuts
      if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        playTick();
        setShortcutsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showToast]);

  useEffect(() => {
    const onShortcuts = () => setShortcutsModalOpen(true);
    const onVoice = () => setVoiceOpen((prev) => !prev);
    const onVoiceActive = (e) => setIsVoiceActive(Boolean(e.detail?.active));

    window.addEventListener('ams-open-shortcuts', onShortcuts);
    window.addEventListener('ams-toggle-voice', onVoice);
    window.addEventListener('ams-voice-active', onVoiceActive);

    return () => {
      window.removeEventListener('ams-open-shortcuts', onShortcuts);
      window.removeEventListener('ams-toggle-voice', onVoice);
      window.removeEventListener('ams-voice-active', onVoiceActive);
    };
  }, []);

  const handleToggleVoice = () => {
    playTick();
    setVoiceOpen((prev) => !prev);
  };

  const handleOpenShortcuts = () => {
    playTick();
    setShortcutsModalOpen(true);
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

  const isAdmin = Boolean(session) && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login'));

  const navItems = [
    { name: ui.navHome || 'Home', path: '/', icon: 'fa-solid fa-house' },
    { name: ui.navAbout || 'About', path: '/about', icon: 'fa-regular fa-user' },
    { name: ui.navJourney || 'Journey', path: '/journey', icon: 'fa-solid fa-trophy' },
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
  const allMessages = (appState.messages || []).slice(0, 5);
  const rawNotifications = [
    // 1. Real Contact Form Messages
    ...allMessages.map((m) => ({
      id: 'msg-' + (m.id || m._id),
      title: `Inquiry: ${m.name || 'New Lead'}`,
      desc: m.subject || (m.message ? m.message.slice(0, 55) + (m.message.length > 55 ? '...' : '') : 'New portfolio inquiry message received.'),
      time: m.createdAt ? formatRelativeTime(m.createdAt) : 'Recent',
      icon: 'fa-envelope',
      iconBg: 'rgba(245, 158, 11, 0.12)',
      iconColor: '#f59e0b',
      unread: m.status === 'unread' && !readNotifIds.includes('msg-' + (m.id || m._id)),
      targetTab: 'messages',
      badge: 'Message'
    })),
    // 2. Real Live Projects
    {
      id: 'stat-project-live',
      title: 'Production Projects Live',
      desc: `${(appState.projects || []).filter((p) => p.status === 'published').length} builds active in production gallery.`,
      time: 'Live',
      icon: 'fa-rocket',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      iconColor: '#10b981',
      unread: !readNotifIds.includes('stat-project-live'),
      targetTab: 'projects',
      badge: 'Projects'
    },
    // 3. Real Certificates
    {
      id: 'stat-cert-verified',
      title: 'Accredited Credentials',
      desc: `${(appState.certificates || []).filter((c) => c.published).length} verified credentials available to inspect.`,
      time: 'Verified',
      icon: 'fa-shield-halved',
      iconBg: 'rgba(6, 182, 212, 0.12)',
      iconColor: '#06b6d4',
      unread: !readNotifIds.includes('stat-cert-verified'),
      targetTab: 'certificates',
      badge: 'Credentials'
    },
    // 4. System Storage Health
    {
      id: 'stat-system-active',
      title: 'Backend Storage Connected',
      desc: 'CSRF security guards & MongoDB store synchronized.',
      time: 'System',
      icon: 'fa-server',
      iconBg: 'rgba(168, 85, 247, 0.12)',
      iconColor: '#a855f7',
      unread: !readNotifIds.includes('stat-system-active'),
      targetTab: 'settings',
      badge: 'System'
    }
  ];

  const unreadCount = rawNotifications.filter((n) => n.unread).length;
  const filteredNotifications = notifFilter === 'unread' ? rawNotifications.filter((n) => n.unread) : rawNotifications;

  const markNotifRead = (id) => {
    setReadNotifIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try {
        localStorage.setItem('admin_read_notifs_v9', JSON.stringify(next));
      } catch (_e) {}
      return next;
    });

    if (id && id.startsWith('msg-') && typeof updateAppState === 'function') {
      const msgId = id.replace('msg-', '');
      updateAppState((prev) => ({
        ...prev,
        messages: (prev.messages || []).map((m) =>
          String(m.id || m._id) === String(msgId) ? { ...m, status: 'read' } : m
        )
      }));

      // Persist read status in backend if running
      fetch(`/api/admin/messages/${msgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      }).catch(() => {});
    }
  };

  const handleNotificationClick = (item) => {
    playTick();
    markNotifRead(item.id);
    setNotifOpen(false);
    if (item.targetTab) {
      window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab: item.targetTab } }));
      if (item.id && item.id.startsWith('msg-')) {
        const rawMsgId = item.id.replace('msg-', '');
        window.dispatchEvent(new CustomEvent('ams-select-message', { detail: { messageId: rawMsgId } }));
      }
      navigate(item.targetTab === 'dashboard' ? '/admin' : `/admin?tab=${item.targetTab}`);
    }
  };

  // Active pill sliding calculation
  const updatePill = (targetEl) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const navCenter = navCenterRef.current;
    const pill = activePillRef.current;
    if (!navCenter || !pill) return;

    // Validate that targetEl is a real DOM element (guard against IdleDeadline or Event objects)
    const validTarget = targetEl && typeof targetEl.getBoundingClientRect === 'function' ? targetEl : null;
    const el = validTarget || navCenter.querySelector('.nav-link.active');
    if (!el || typeof el.getBoundingClientRect !== 'function') {
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
    if (validTarget && !validTarget.classList.contains('active')) {
      pill.style.background = 'rgba(255, 255, 255, 0.2)';
      pill.style.boxShadow = 'none';
    } else {
      pill.style.background = 'rgba(255, 255, 255, 0.12)';
      pill.style.boxShadow = 'none';
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const idleHandle = runOnIdle(() => updatePill(), { timeout: 1500 });
    return () => cancelIdle(idleHandle);
  }, [location.pathname]);

  // Window resize handler for pill
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const handleResize = () => updatePill();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Escape key listener to close mobile menu and notification popover
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Sync admin sidebar state for dynamic aria-expanded on toggle
  useEffect(() => {
    const handleAdminSidebarState = (e) => {
      if (e.detail && typeof e.detail.isOpen === 'boolean') {
        setAdminSidebarOpen(e.detail.isOpen);
      }
    };
    window.addEventListener('admin-sidebar-state-changed', handleAdminSidebarState);
    return () => window.removeEventListener('admin-sidebar-state-changed', handleAdminSidebarState);
  }, []);

  // Shared scroll-lock coordination (reference counted)
  useScrollLock(mobileMenuOpen);

  // Focus trapping inside mobile drawer with focus restoration
  useFocusTrap(mobileDrawerRef, mobileMenuOpen, { initialFocusSelector: '.mobile-drawer-close' });

  // 3D Tilt, Scroll Shrink & Magnetic GSAP effects (matching uploaded HTML)
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const navWrapper = navWrapperRef.current;
    const navbar = navbarRef.current;
    if (!navWrapper || !navbar) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      let scrollState = false;
      const handleScroll = () => {
        const s = window.scrollY > 50;
        if (s === scrollState) return;
        scrollState = s;
        if (s) {
          navWrapper.classList.add('scrolled');
        } else {
          navWrapper.classList.remove('scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }

    let cancelled = false;
    let cleanups = [];

    import('gsap').then(({ default: gsap }) => {
      if (cancelled || !navWrapperRef.current || !navbarRef.current) return;
      const navWrapper = navWrapperRef.current;
      const navbar = navbarRef.current;

      // In Admin mode, keep navbar solid and stable without 3D tilting
      if (isAdmin) {
        gsap.set(navbar, { rotateX: 0, rotateY: 0, x: 0, y: 0 });
        return;
      }

      // 1. Entrance drop-in (safe fromTo)
      gsap.fromTo(navWrapper, 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
      );

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

      cleanups = [
        () => navWrapper.removeEventListener('mousemove', handleMouseMove),
        () => navWrapper.removeEventListener('mouseleave', handleMouseLeave),
        () => window.removeEventListener('scroll', handleScroll),
        ...magneticCleanups
      ];
    });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
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
    const allIds = rawNotifications.map((n) => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem('admin_read_notifs_v9', JSON.stringify(allIds));
    } catch (_e) {}

    if (typeof updateAppState === 'function') {
      updateAppState((prev) => ({
        ...prev,
        messages: (prev.messages || []).map((m) => ({ ...m, status: 'read' }))
      }));

      // Background patch any unread messages in database
      (appState.messages || [])
        .filter((m) => m.status === 'unread')
        .forEach((m) => {
          const mId = m.id || m._id;
          fetch(`/api/admin/messages/${mId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'read' })
          }).catch(() => {});
        });
    }

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
            <Link to={isAdmin ? "/admin" : "/"} className="nav-left" onClick={() => playTick()}>
              <div className="nav-logo-box">
                {p.monogram || 'AP'}
              </div>
              <div className="nav-logo-text">
                {isAdmin ? 'CMS Studio' : (p.displayName || p.name || 'Ayush Prajapati')}
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
                    <div className="notif-head flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="flex items-center gap-1.5 m-0 font-bold text-sm">
                          <i className="fa-solid fa-bell text-yellow-400" />
                          Notifications
                        </h4>
                        <span className="count-pill">{unreadCount} new</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex rounded-md border border-white/10 p-0.5 bg-black/40 text-[10px] font-mono">
                          <button
                            type="button"
                            className={`px-2 py-0.5 rounded transition-colors ${notifFilter === 'all' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifFilter('all');
                            }}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            className={`px-2 py-0.5 rounded transition-colors ${notifFilter === 'unread' ? 'bg-yellow-400/20 text-yellow-300 font-bold' : 'text-slate-400 hover:text-white'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifFilter('unread');
                            }}
                          >
                            Unread ({unreadCount})
                          </button>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            className="notif-mark-read text-[11px] text-yellow-400 hover:underline cursor-pointer"
                            onClick={handleMarkAllRead}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="notif-list custom-scrollbar">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 space-y-2">
                          <i className="fa-solid fa-circle-check text-2xl text-emerald-400" />
                          <div className="text-xs font-mono font-medium text-slate-200">All caught up!</div>
                          <div className="text-[11px] text-slate-500">Zero unread notifications remaining.</div>
                        </div>
                      ) : (
                        filteredNotifications.map((n) => (
                          <div
                            key={n.id}
                            className={`notif-item ${n.unread ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            <div className="notif-ico" style={{ background: n.iconBg, color: n.iconColor }}>
                              <i className={`fa-solid ${n.icon}`} />
                            </div>
                            <div className="notif-body">
                              <div className="flex items-center justify-between gap-1">
                                <span className="notif-title">{n.title}</span>
                                {n.badge && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-white/10 text-slate-400 bg-white/5">{n.badge}</span>
                                )}
                              </div>
                              <div className="notif-desc">{n.desc}</div>
                              <div className="notif-time">
                                <i className="fa-regular fa-clock" /> {n.time}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
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
              )}                {/* Theme & Accent Controls (Only on Admin) */}
              {isAdmin && (
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
                      <div className={`accent-swatch ${currentAccent === 'accent-cyan' ? 'selected' : ''}`} style={{ background: '#d4af37' }} onClick={() => handleAccentChange('accent-cyan')} title="Electric Cyan" />
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
                <div className="relative" ref={toolsMenuRef}>
                    <button
                      type="button"
                      className={`btn-icon relative ${toolsMenuOpen ? 'active' : ''} ${isVoiceActive ? 'text-emerald-400 border-emerald-500/50' : ''}`}
                      onClick={() => {
                        playTick();
                        setToolsMenuOpen((prev) => !prev);
                      }}
                      title="Quick Settings & Tools"
                      aria-label="Quick Settings & Tools"
                    >
                      <i className="fa-solid fa-sliders text-xs" />
                      {isVoiceActive && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        </span>
                      )}
                    </button>

                    {toolsMenuOpen && (
                      <div className="admin-tools-popover">
                        <div className="popover-title">Quick Settings & Tools</div>
                        <button
                          type="button"
                          className={`popover-item ${isVoiceActive ? 'text-emerald-400 font-semibold' : ''}`}
                          onClick={() => {
                            handleToggleVoice();
                            setToolsMenuOpen(false);
                          }}
                        >
                          <i className={`fa-solid fa-microphone text-xs ${isVoiceActive ? 'text-emerald-400' : ''}`} />
                          <span>{isVoiceActive ? 'Voice Assistant (Active)' : 'Voice Commands'}</span>
                          <span className="ml-auto text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono">Mic</span>
                        </button>
                        <button
                          type="button"
                          className={`popover-item ${isFocusMode ? 'text-yellow-400 font-semibold' : ''}`}
                          onClick={() => {
                            handleToggleFocus();
                            setToolsMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-expand text-xs" />
                          <span>{isFocusMode ? 'Exit Focus Mode' : 'Focus Mode (Zoom)'}</span>
                          <kbd className="ml-auto text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono">F</kbd>
                        </button>
                        <button
                          type="button"
                          className="popover-item"
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('ams-open-terminal'));
                            setToolsMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-terminal text-xs text-yellow-400" />
                          <span>Developer Terminal</span>
                          <kbd className="ml-auto text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono">Ctrl + ~</kbd>
                        </button>
                        <button
                          type="button"
                          className="popover-item"
                          onClick={() => {
                            handleOpenShortcuts();
                            setToolsMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-keyboard text-xs text-sky-400" />
                          <span>Keyboard Shortcuts</span>
                          <kbd className="ml-auto text-[9px] bg-white/10 px-1 py-0.5 rounded font-mono">?</kbd>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Command Palette Trigger (Search ⌘K) (Positioned with safe right padding) */}
              {isAdmin && (
                <div className="magnetic mr-1 shrink-0">
                  <button
                    type="button"
                    className="btn-outline nav-search-btn"
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
                <div className="magnetic hidden lg:inline-block">
                  <button
                    type="button"
                    className="btn-outline font-mono nav-terminal-btn"
                    onClick={() => {
                      playTick('click');
                      window.dispatchEvent(new CustomEvent('ams-open-terminal'));
                    }}
                    title="Open Developer Terminal (Ctrl + ~)"
                  >
                    <i className="fa-solid fa-terminal text-yellow-400" style={{ fontSize: '10px' }} />
                    <span className="hidden sm:inline">&gt;_ Terminal</span>
                    <span className="cmd-kbd hidden sm:inline-flex">Ctrl + ~</span>
                  </button>
                </div>
              )}

              {/* Resume Button (Only visible on Public pages per reference) */}
              {!isAdmin && (
                <div className="magnetic hidden md:inline-block">
                  <button
                    type="button"
                    className="btn-outline nav-resume-btn"
                    data-action="open-resume"
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
                    className="btn-primary nav-talk-btn"
                    onClick={() => playTick()}
                  >
                    <span>{ui.hireConnect || "Let's talk"}</span>
                    <span style={{ fontSize: '12px', marginLeft: '4px' }} aria-hidden="true">↗</span>
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

              {/* Mobile Drawer Toggle with ARIA Semantics */}
              <button
                type="button"
                className="mobile-nav-toggle"
                onClick={() => {
                  playTick();
                  if (isAdmin) {
                    window.dispatchEvent(new CustomEvent('admin-sidebar-toggle'));
                  } else {
                    setMobileMenuOpen((prev) => !prev);
                  }
                }}
                aria-label={
                  isAdmin
                    ? (adminSidebarOpen ? 'Close admin navigation' : 'Open admin navigation')
                    : (mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu')
                }
                aria-expanded={isAdmin ? adminSidebarOpen : mobileMenuOpen}
                aria-controls={isAdmin ? 'adminSidebar' : 'publicMobileDrawer'}
              >
                <i className={isAdmin ? (adminSidebarOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars') : (mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars')} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        id="publicMobileDrawer"
        ref={mobileDrawerRef}
        className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        <div className="mobile-drawer-header">
          <div className="flex items-center gap-3">
            <div className="nav-logo-box">{p.monogram || 'AP'}</div>
            <div className="text-white font-bold">{p.displayName || 'Ayush Prajapati'}</div>
          </div>
          <button
            type="button"
            className="mobile-drawer-close"
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

        <div className="mobile-drawer-footer">
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

      {/* Global Command Palette (Loaded on-demand only when opened) */}
      {cmdOpen && (
        <React.Suspense fallback={null}>
          <CommandPalette
            isOpen={cmdOpen}
            onClose={() => setCmdOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {shortcutsModalOpen && (
        <React.Suspense fallback={null}>
          <KeyboardShortcutsModal
            isOpen={shortcutsModalOpen}
            onClose={() => setShortcutsModalOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Admin Voice Assistant Overlay */}
      {voiceOpen && (
        <React.Suspense fallback={null}>
          <AdminVoiceAssistant
            isOpen={voiceOpen}
            onClose={() => setVoiceOpen(false)}
            showToast={showToast}
            onThemeChange={handleThemeChange}
            onSelectTab={(tab) => {
              window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab } }));
              navigate(tab === 'dashboard' ? '/admin' : `/admin?tab=${tab}`);
            }}
            onOpenAddProject={() => {
              window.dispatchEvent(new CustomEvent('ams-create-project'));
              navigate('/admin?tab=projects&create=true');
            }}
          />
        </React.Suspense>
      )}
    </>
  );
}

export const Navbar = Header;
export default Header;
