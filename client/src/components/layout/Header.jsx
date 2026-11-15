import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const backdropRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobilePillRef = useRef(null);
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

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const toolsMenuRef = useRef(null);

  useEffect(() => {
    // Purge any residual theme or accent overrides from body and localStorage
    const THEME_CLASSES_TO_CLEAN = [
      'theme-light',
      'theme-midnight',
      'theme-ocean',
      'theme-forest',
      'theme-sunset',
      'theme-cyberpunk',
      'theme-gold',
      'theme-dracula',
      'theme-nord',
      'theme-synthwave',
      'theme-tokyo',
      'accent-cyan',
      'accent-violet',
      'accent-rose',
      'accent-emerald',
      'accent-amber',
      'accent-pink',
      'accent-lime',
      'accent-blue'
    ];
    document.body.classList.remove(...THEME_CLASSES_TO_CLEAN);
    try {
      localStorage.removeItem('portfolio_theme');
      localStorage.removeItem('admin_theme_v9');
      localStorage.removeItem('portfolio_accent');
      localStorage.removeItem('admin_accent_v9');
    } catch (e) {}
  }, []);

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
    {
      name: ui.navHome || 'Home',
      path: '/',
      icon: 'fa-solid fa-house',
      svg: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
    },
    {
      name: ui.navAbout || 'About',
      path: '/about',
      icon: 'fa-regular fa-user',
      svg: (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </>
      )
    },
    {
      name: ui.navJourney || 'Journey',
      path: '/journey',
      icon: 'fa-solid fa-trophy',
      svg: <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3" />
    },
    {
      name: ui.navSkills || 'Skills',
      path: '/skills',
      icon: 'fa-solid fa-code',
      svg: <path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />
    },
    {
      name: ui.navProjects || 'Projects',
      path: '/projects',
      icon: 'fa-solid fa-layer-group',
      svg: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" />
    },
    {
      name: isAdmin ? 'Certs' : (ui.navCertificates || 'Certificates'),
      path: '/certificates',
      icon: 'fa-solid fa-certificate',
      svg: (
        <>
          <circle cx="12" cy="9" r="6" />
          <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
        </>
      )
    }
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

  // -------------------------------------------------------------------------
  // Mobile Menu v3: Gliding Pill, Touch Gestures, & Arrow Key Navigation
  // Note: BACK_CLOSES = false since React Router manages history stack
  // -------------------------------------------------------------------------
  const updateMobilePill = useCallback(() => {
    if (!mobileNavRef.current || !mobilePillRef.current) return;
    const activeLink =
      mobileNavRef.current.querySelector('a.active') ||
      mobileNavRef.current.querySelector('[aria-current="page"]');
    if (!activeLink) {
      mobilePillRef.current.classList.remove('on');
      return;
    }
    const li = activeLink.closest('li') || activeLink.parentElement;
    if (li) {
      mobilePillRef.current.style.height = `${li.offsetHeight}px`;
      mobilePillRef.current.style.transform = `translateY(${li.offsetTop}px)`;
      mobilePillRef.current.classList.add('on');
    }
  }, []);

  // Update mobile pill when drawer opens, route changes, or window resizes
  useEffect(() => {
    if (mobileMenuOpen) {
      const t = setTimeout(updateMobilePill, 60);
      return () => clearTimeout(t);
    }
  }, [mobileMenuOpen, location.pathname, updateMobilePill]);

  useEffect(() => {
    const handleResizeMobile = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
      if (mobileMenuOpen) {
        updateMobilePill();
      }
    };
    window.addEventListener('resize', handleResizeMobile);
    return () => window.removeEventListener('resize', handleResizeMobile);
  }, [mobileMenuOpen, updateMobilePill]);

  // Touch ripple on nav rows
  const handleNavPointerDown = (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const r = a.getBoundingClientRect();
    a.style.setProperty('--rx', `${e.clientX - r.left}px`);
    a.style.setProperty('--ry', `${e.clientY - r.top}px`);
    a.classList.remove('rip');
    void a.offsetWidth;
    a.classList.add('rip');
  };

  // Drag-to-close gesture on mobile drawer
  useEffect(() => {
    const drawerEl = mobileDrawerRef.current;
    if (!drawerEl) return;

    let sx = 0;
    let sy = 0;
    let t0 = 0;
    let dx = 0;
    let dragging = false;
    let decided = false;
    let w = 1;

    const handleTouchStart = (e) => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      t0 = Date.now();
      dx = 0;
      dragging = false;
      decided = false;
      w = drawerEl.offsetWidth || 1;
    };

    const handleTouchMove = (e) => {
      const t = e.touches[0];
      const mx = t.clientX - sx;
      const my = t.clientY - sy;
      if (!decided && (Math.abs(mx) > 8 || Math.abs(my) > 8)) {
        decided = true;
        dragging = mx > 0 && Math.abs(mx) > Math.abs(my) * 1.2;
        if (dragging) {
          drawerEl.style.transition = 'none';
          if (backdropRef.current) backdropRef.current.style.transition = 'none';
        }
      }
      if (!dragging) return;
      dx = Math.max(0, mx);
      drawerEl.style.transform = `translateX(${dx}px)`;
      if (backdropRef.current) {
        backdropRef.current.style.opacity = Math.max(0, 1 - dx / w);
      }
    };

    const handleTouchEnd = () => {
      if (!dragging) return;
      dragging = false;
      const elapsed = Date.now() - t0;
      const fast = elapsed > 0 && dx / elapsed > 0.5;
      const shut = dx > w * 0.33 || fast;
      drawerEl.style.transition = '';
      if (backdropRef.current) backdropRef.current.style.transition = '';
      void drawerEl.offsetWidth;
      drawerEl.style.transform = '';
      if (backdropRef.current) backdropRef.current.style.opacity = '';
      if (shut) {
        setMobileMenuOpen(false);
      }
    };

    drawerEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    drawerEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    drawerEl.addEventListener('touchend', handleTouchEnd);
    drawerEl.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      drawerEl.removeEventListener('touchstart', handleTouchStart);
      drawerEl.removeEventListener('touchmove', handleTouchMove);
      drawerEl.removeEventListener('touchend', handleTouchEnd);
      drawerEl.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Swipe in from right edge of screen to open drawer on mobile
  useEffect(() => {
    let ex = null;
    let ey = 0;

    const handleDocTouchStart = (e) => {
      const t = e.touches[0];
      if (!mobileMenuOpen && window.innerWidth < 1024 && t.clientX > window.innerWidth - 24) {
        ex = t.clientX;
        ey = t.clientY;
      } else {
        ex = null;
      }
    };

    const handleDocTouchMove = (e) => {
      if (ex === null) return;
      const t = e.touches[0];
      if (ex - t.clientX > 48 && Math.abs(t.clientY - ey) < 40) {
        ex = null;
        setMobileMenuOpen(true);
      }
    };

    document.addEventListener('touchstart', handleDocTouchStart, { passive: true });
    document.addEventListener('touchmove', handleDocTouchMove, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleDocTouchStart);
      document.removeEventListener('touchmove', handleDocTouchMove);
    };
  }, [mobileMenuOpen]);

  // Keyboard Arrow navigation inside mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleNavKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
        const links = mobileNavRef.current ? Array.from(mobileNavRef.current.querySelectorAll('a')) : [];
        const activeIdx = links.indexOf(document.activeElement);
        if (activeIdx > -1) {
          e.preventDefault();
          let nextIdx = activeIdx;
          if (e.key === 'Home') nextIdx = 0;
          else if (e.key === 'End') nextIdx = links.length - 1;
          else if (e.key === 'ArrowDown') nextIdx = (activeIdx + 1) % links.length;
          else if (e.key === 'ArrowUp') nextIdx = (activeIdx - 1 + links.length) % links.length;
          links[nextIdx]?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleNavKeyDown);
    return () => window.removeEventListener('keydown', handleNavKeyDown);
  }, [mobileMenuOpen]);

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
              )}

              {/* Admin Quick Settings & Tools Dropdown */}
              {isAdmin && (
                <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
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
                className={`mobile-nav-toggle burger ${mobileMenuOpen ? 'open' : ''}`}
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
                {isAdmin ? (
                  <i className={adminSidebarOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} />
                ) : (
                  <>
                    <i />
                    <i />
                    <i />
                  </>
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        ref={backdropRef}
        className={`mobile-menu-backdrop backdrop ${mobileMenuOpen ? 'show' : ''}`}
        onClick={() => {
          playTick();
          setMobileMenuOpen(false);
        }}
        aria-hidden="true"
      />

      {/* Mobile Drawer Menu (Matching mobile-menu-v3.html layout & interactions) */}
      <aside
        id="publicMobileDrawer"
        ref={mobileDrawerRef}
        className={`mobile-drawer drawer ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <span className="grab" aria-hidden="true" />

        {/* Drawer Head */}
        <div className="drawer-head mobile-drawer-header">
          <Link
            to="/"
            className="brand"
            onClick={() => {
              playTick();
              setMobileMenuOpen(false);
            }}
          >
            <span className="logo">{p.monogram || 'AP'}</span>
            <span className="brand-name">{p.displayName || 'AYUSH PRAJAPATI'}</span>
          </Link>
          <button
            type="button"
            className="close mobile-drawer-close"
            aria-label="Close navigation menu"
            onClick={() => {
              playTick();
              setMobileMenuOpen(false);
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body mobile-drawer-links">
          <p className="status" style={{ '--i': 0 }}>
            <span className="pulse" />
            Available for opportunities
          </p>

          <div className="navwrap">
            <span ref={mobilePillRef} className="pill" aria-hidden="true" />
            <ul className="nav" ref={mobileNavRef} onPointerDown={handleNavPointerDown}>
              {navItems.map((item, index) => (
                <li key={item.path} style={{ '--i': index + 1 }}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    onClick={() => {
                      playTick();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      {item.svg}
                    </svg>
                    <span>{item.name}</span>
                    <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Executive Context Badge (Top 1% Polish) */}
          <div className="drawer-context-card" style={{ '--i': navItems.length + 1 }}>
            <div className="dcc-header">
              <span className="dcc-dot" />
              <span className="dcc-title">ENGINEERING CRAFT</span>
              <span className="dcc-badge">PRO</span>
            </div>
            <div className="dcc-body">
              <span>Full-Stack &amp; Scalable Cloud Systems</span>
            </div>
            <div className="dcc-foot">
              <span>Bhopal, India · IST</span>
              <span>SISTec · 8.42 CGPA</span>
            </div>
          </div>
        </div>

        {/* Drawer Foot */}
        <div className="drawer-foot mobile-drawer-footer" style={{ '--i': navItems.length + 2 }}>
          <div className="socials">
            <a
              href={p.githubUrl || 'https://github.com/ayushprajapati9669-dev'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              onClick={() => playTick()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 00-.9-2.6c3.1-.3 6.4-1.5 6.4-7a5.4 5.4 0 00-1.5-3.8 5 5 0 00-.1-3.7s-1.2-.3-3.9 1.5a13.4 13.4 0 00-7 0C6.8 2.8 5.6 3.1 5.6 3.1a5 5 0 00-.1 3.7A5.4 5.4 0 004 10.6c0 5.4 3.3 6.7 6.4 7a3.4 3.4 0 00-.9 2.6V22" />
              </svg>
            </a>
            <a
              href={p.linkedinUrl || 'https://linkedin.com/in/ayush-prajapati'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              onClick={() => playTick()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </a>
            <a
              href={p.socialLinks?.instagram || p.instagramUrl || 'https://www.instagram.com/ayush7162/'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              onClick={() => playTick()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href={`mailto:${p.email || 'ayushprajapati9669@gmail.com'}`}
              aria-label="Email"
              onClick={() => playTick()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 6L2 7" />
              </svg>
            </a>
          </div>

          <div className="drawer-actions">
            {!isAdmin ? (
              <button
                type="button"
                className="btn btn-ghost"
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
                <span>Resume</span>
                <span className="btn-arrow" aria-hidden="true">↗</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  playTick();
                  setMobileMenuOpen(false);
                  setCmdOpen(true);
                }}
              >
                <i className="fa-solid fa-magnifying-glass mr-1" /> Search ⌘K
              </button>
            )}

            <Link
              to="/contact"
              className="btn btn-solid"
              onClick={() => {
                playTick();
                setMobileMenuOpen(false);
              }}
            >
              <span>Hire / Connect</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </aside>

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
