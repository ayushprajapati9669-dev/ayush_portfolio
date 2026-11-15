import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getDefaultPortfolioState, STORAGE_KEY } from '../../services/defaultPortfolioState';
import { apiRequest, syncStateToMongoBackend } from '../../services/api';
import { runOnIdle, cancelIdle } from '../../utils/idle';

const PortfolioContext = createContext(null);

function isDeepEqual(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!isDeepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function ThemeProvider({ children }) {
  const [appState, setAppState] = useState(() => {
    const defaults = getDefaultPortfolioState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      if (!parsed.profile) return defaults;
      // Auto-purge legacy stand-in images and bloated base64 resumes from client localStorage
      const isLegacyCeiling = (u) => !u || (typeof u === 'string' && (u.startsWith('data:image/webp;base64,UklGRt5SAABXRUJQV') || u === '/images/ayush-portrait-new.jpg' || u === '/images/ayush-portrait-new.webp' || u === '/images/ayush-hero-portrait.png'));
      if (parsed.profile.photoUrl && isLegacyCeiling(parsed.profile.photoUrl)) {
        parsed.profile.photoUrl = '/uploads/hero_cutout_1794562459704_847.webp';
      }
      if (parsed.profile.portrait && isLegacyCeiling(parsed.profile.portrait.url)) {
        parsed.profile.portrait.url = '/uploads/hero_cutout_1794562459704_847.webp';
        parsed.profile.portrait.isTemporaryStandIn = false;
      }
      if (parsed.profile.resumeUrl && typeof parsed.profile.resumeUrl === 'string' && parsed.profile.resumeUrl.startsWith('data:application/pdf')) {
        parsed.profile.resumeUrl = '/images/Ayush_Prajapati_Resume.pdf';
      }
      if (Array.isArray(parsed.resumes)) {
        parsed.resumes.forEach((r) => {
          if (r && typeof r.fileUrl === 'string' && r.fileUrl.startsWith('data:application/pdf')) {
            r.fileUrl = '/images/Ayush_Prajapati_Resume.pdf';
          }
        });
      }

      let storageNeedsUpdate = false;

      // Auto-purge dummy/reference certificates from localStorage (cert1..cert5, drafts, unverified)
      if (Array.isArray(parsed.certificates)) {
        const cleanCerts = parsed.certificates.filter(
          (c) =>
            c &&
            typeof c === 'object' &&
            c.id &&
            !/^cert[1-5]$/i.test(String(c.id)) &&
            c.published === true &&
            ['verified', 'accredited', 'published'].includes(String(c.status || '').toLowerCase())
        );
        if (cleanCerts.length !== parsed.certificates.length) {
          parsed.certificates = cleanCerts;
          storageNeedsUpdate = true;
        }
      }

      // Auto-clean test strings or polluted test values from localStorage settings
      if (parsed.settings) {
        if (parsed.settings.siteName === 'AP Systems Studio') {
          parsed.settings.siteName = defaults.settings?.siteName || 'Ayush Prajapati';
          storageNeedsUpdate = true;
        }
        if (parsed.settings.copyrightText && parsed.settings.copyrightText.includes('AP Systems Studio')) {
          parsed.settings.copyrightText = `© ${new Date().getFullYear()} Ayush Prajapati. All rights reserved.`;
          storageNeedsUpdate = true;
        }
        if (
          parsed.settings.contactNote &&
          parsed.settings.contactNote.includes('Messages submitted through the contact form are validated')
        ) {
          parsed.settings.contactNote = '';
          storageNeedsUpdate = true;
        }
        if (parsed.settings.seoTitle && parsed.settings.seoTitle.includes('Cloud Architect')) {
          parsed.settings.seoTitle = defaults.settings?.seoTitle || 'Ayush Prajapati | Full-Stack Developer & Software Engineer';
          parsed.settings.ogTitle = defaults.settings?.ogTitle || 'Ayush Prajapati — Full-Stack Developer & Software Engineer';
          parsed.settings.ogDescription = defaults.settings?.ogDescription || 'Portfolio of Ayush Prajapati, B.Tech CSE student at SISTec, Bhopal (CGPA: 8.42) specializing in MERN stack development, C, Java, Python, MySQL, and MongoDB.';
          storageNeedsUpdate = true;
        }
      }

      // Auto-clean test overrides on skills
      if (Array.isArray(parsed.skills)) {
        parsed.skills.forEach((s) => {
          if (s && s.id === 'skill-frontend' && (s.color === '#06b6d4' || s.name === 'Advanced Frontend Architecture')) {
            delete s.color;
            delete s.subtitle;
            s.name = 'Frontend';
            storageNeedsUpdate = true;
          }
        });
      }

      if (parsed.adminConfig) {
        delete parsed.adminConfig;
        storageNeedsUpdate = true;
      }

      if (storageNeedsUpdate) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch (_e) {}
      }
      return {
        ...defaults,
        ...parsed,
        projects: Array.isArray(parsed.projects) ? parsed.projects : defaults.projects,
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : defaults.skills,
        certificates: Array.isArray(parsed.certificates) ? parsed.certificates : defaults.certificates,
        uiLabels: { ...defaults.uiLabels, ...(parsed.uiLabels || {}) },
        settings: { ...defaults.settings, ...(parsed.settings || {}) }
      };
    } catch (_err) {
      return defaults;
    }
  });

  const [toastData, setToastData] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', desc: '', onConfirm: null });
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeCertLightbox, setActiveCertLightbox] = useState(null);
  const latestRequestIdRef = useRef(0);

  const showToast = useCallback((msg, type = null) => {
    if (!msg) {
      setToastData(null);
      return;
    }
    let detectedType = type;
    if (!detectedType) {
      const lower = String(msg).toLowerCase();
      if (lower.includes('error') || lower.includes('fail') || lower.includes('invalid') || lower.includes('warning') || lower.includes('required')) {
        detectedType = 'error';
      } else if (lower.includes('delete') || lower.includes('remove')) {
        detectedType = 'info';
      } else if (
        lower.includes('success') ||
        lower.includes('saved') ||
        lower.includes('updated') ||
        lower.includes('sent') ||
        lower.includes('created') ||
        lower.includes('ready') ||
        lower.includes('verified') ||
        lower.includes('added') ||
        lower.includes('welcome') ||
        lower.includes('copied')
      ) {
        detectedType = 'success';
      } else {
        detectedType = 'info';
      }
    }
    setToastData({ message: msg, type: detectedType });
  }, []);

  const hideToast = useCallback(() => {
    setToastData(null);
  }, []);

  useEffect(() => {
    if (!toastData) return undefined;
    const t = setTimeout(() => setToastData(null), 4000);
    return () => clearTimeout(t);
  }, [toastData]);

  useEffect(() => {
    document.title = appState.settings?.siteTitle || `${appState.profile?.name || 'Ayush Prajapati'} — Portfolio`;
  }, [appState.settings?.siteTitle, appState.profile?.name]);

  // Dynamic CSS Variables and Appearance Tokens synchronization
  useEffect(() => {
    const s = appState.settings || {};
    const root = document.documentElement;

    if (s.accentColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.accentColor)) {
      root.style.setProperty('--brand-color', s.accentColor);
      root.style.setProperty('--accent-primary', s.accentColor);
      root.style.setProperty('--gold', s.accentColor);
      root.style.setProperty('--brand-cyan', s.accentColor);
    }
    if (s.bgBase && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.bgBase)) {
      root.style.setProperty('--bg-base', s.bgBase);
      root.style.setProperty('--bg-obsidian', s.bgBase);
      root.style.setProperty('--bg-dark', s.bgBase);
    }
    if (s.bgSurface && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.bgSurface)) {
      root.style.setProperty('--bg-surface', s.bgSurface);
      root.style.setProperty('--bg-panel', s.bgSurface);
    }
    if (s.fontHeading) {
      root.style.setProperty('--font-heading', s.fontHeading);
    }
    if (s.fontBody) {
      root.style.setProperty('--font-sans', s.fontBody);
    }
    if (s.themeMode) {
      root.setAttribute('data-theme', s.themeMode);
    }

    // Dynamic metallic glow intensity mapping
    const glowLevel = s.glowIntensity || 'medium';
    const glowMap = {
      subtle: { opacity: '0.35', blur: '12px', spread: '0.6' },
      medium: { opacity: '0.70', blur: '20px', spread: '1.0' },
      vibrant: { opacity: '1.00', blur: '32px', spread: '1.4' }
    };
    const activeGlow = glowMap[glowLevel] || glowMap.medium;
    root.style.setProperty('--glow-opacity', activeGlow.opacity);
    root.style.setProperty('--glow-blur', activeGlow.blur);
    root.style.setProperty('--glow-spread', activeGlow.spread);
    root.setAttribute('data-glow', glowLevel);
  }, [appState.settings]);

  // Primary loader & revalidator from MongoDB Atlas
  const refreshFromBackend = useCallback(() => {
    const requestId = ++latestRequestIdRef.current;
    return apiRequest('/api/public/bootstrap')
      .then((res) => {
        // Drop stale response if a newer revalidation or local mutation was initiated
        if (requestId !== latestRequestIdRef.current) {
          return null;
        }

        if (res && res.profile) {
          setAppState((prev) => {
            // Re-check inside updater callback to guard against interleaved updates
            if (requestId !== latestRequestIdRef.current) {
              return prev;
            }

            // Published projects come from backend res.projects
            // Preserve local non-published projects (e.g. drafts/trash in admin) unless now published
            const publishedIds = new Set((res.projects || []).map((p) => p.id));
            const nonPublishedPrev = (prev.projects || []).filter(
              (p) => p && p.status && p.status !== 'published' && !publishedIds.has(p.id)
            );
            const resolvedProjects = Array.isArray(res.projects)
              ? [...res.projects, ...nonPublishedPrev]
              : (prev.projects || []);

            const next = {
              ...prev,
              profile: { ...prev.profile, ...res.profile },
              projects: resolvedProjects,
              skills: Array.isArray(res.skills) ? res.skills : (prev.skills || []),
              certificates: Array.isArray(res.certificates) ? res.certificates : [],
              resumes: Array.isArray(res.resumes) ? res.resumes : (prev.resumes || []),
              settings: { ...prev.settings, ...(res.settings || {}) },
              uiLabels: { ...prev.uiLabels, ...(res.uiLabels || {}) }
            };

            // Avoid unnecessary re-renders if state hasn't meaningfully changed
            const isUnchanged =
              isDeepEqual(prev.profile, next.profile) &&
              isDeepEqual(prev.projects, next.projects) &&
              isDeepEqual(prev.skills, next.skills) &&
              isDeepEqual(prev.certificates, next.certificates) &&
              isDeepEqual(prev.resumes, next.resumes) &&
              isDeepEqual(prev.settings, next.settings) &&
              isDeepEqual(prev.uiLabels, next.uiLabels);

            if (isUnchanged) {
              return prev;
            }

            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch (_e) {}

            return next;
          });
        }
      })
      .catch(() => {
        // Fallback to offline cache
      });
  }, []);

  // Initial load: revalidate from backend on idle to prevent network contention & re-renders during FCP/LCP
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const initialDelay = isMobile ? 6500 : 3500;
    let idleHandle = null;

    const runRevalidation = () => {
      idleHandle = runOnIdle(() => {
        refreshFromBackend();
      }, { timeout: 3000 });
      window.removeEventListener('scroll', runRevalidation);
      window.removeEventListener('pointerdown', runRevalidation);
      window.removeEventListener('touchstart', runRevalidation);
    };

    window.addEventListener('scroll', runRevalidation, { passive: true, once: true });
    window.addEventListener('pointerdown', runRevalidation, { passive: true, once: true });
    window.addEventListener('touchstart', runRevalidation, { passive: true, once: true });

    const timer = setTimeout(runRevalidation, initialDelay);

    return () => {
      clearTimeout(timer);
      cancelIdle(idleHandle);
      window.removeEventListener('scroll', runRevalidation);
      window.removeEventListener('pointerdown', runRevalidation);
      window.removeEventListener('touchstart', runRevalidation);
    };
  }, [refreshFromBackend]);

  // Real-time synchronization across browser tabs via BroadcastChannel & storage events
  useEffect(() => {
    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('argon_portfolio_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'PORTFOLIO_STATE_UPDATED') {
            refreshFromBackend();
          }
        };
      } catch (_e) {}
    }

    const handleStorageChange = (e) => {
      if (e.key === 'portfolio_last_synced') {
        refreshFromBackend();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshFromBackend();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshFromBackend]);

  const updateAppState = useCallback((updater, sessionToken = null) => {
    // Invalidate any in-flight revalidation requests so stale responses cannot overwrite this new state
    latestRequestIdRef.current++;
    setAppState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (_err) {
        // Ignore storage quota errors
      }
      syncStateToMongoBackend(next, sessionToken);
      return next;
    });
  }, []);

  const openConfirmModal = useCallback((title, desc, onConfirm) => {
    setConfirmState({ open: true, title, desc, onConfirm });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmState({ open: false, title: '', desc: '', onConfirm: null });
  }, []);

  const downloadOrPrintResume = useCallback(() => {
    const activeResume = (appState.resumes || []).find((r) => r.isActive) || (appState.resumes || [])[0];
    const pdfHref = activeResume?.fileUrl || appState.profile?.resumeUrl || '/images/Ayush_Prajapati_Resume.pdf';
    const fileName = activeResume?.fileName || 'Ayush_Prajapati_Resume.pdf';

    if (!pdfHref || !pdfHref.trim()) {
      showToast('No resume uploaded yet.');
      return;
    }

    if (pdfHref.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = pdfHref;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloading resume...');
      return;
    }

    try {
      const w = window.open(pdfHref, '_blank');
      if (!w) {
        window.location.href = pdfHref;
      }
    } catch (_err) {
      window.location.href = pdfHref;
    }
  }, [appState.resumes, appState.profile?.resumeUrl, showToast]);

  const openCertificateLightbox = useCallback((certOrId) => {
    setActiveCertLightbox(certOrId);
  }, []);

  const closeCertificateLightbox = useCallback(() => {
    setActiveCertLightbox(null);
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        appState,
        updateAppState,
        refreshFromBackend,
        toastData,
        showToast,
        hideToast,
        confirmState,
        openConfirmModal,
        closeConfirmModal,
        resumeModalOpen,
        openResumeModal: () => setResumeModalOpen(true),
        closeResumeModal: () => setResumeModalOpen(false),
        downloadOrPrintResume,
        activeCertLightbox,
        setActiveCertLightbox,
        openCertificateLightbox,
        closeCertificateLightbox
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error('usePortfolio must be used within ThemeProvider');
  }
  return ctx;
}
