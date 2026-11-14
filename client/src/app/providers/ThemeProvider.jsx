import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getDefaultPortfolioState, STORAGE_KEY } from '../../services/defaultPortfolioState';
import { apiRequest, syncStateToMongoBackend } from '../../services/api';
import { runOnIdle, cancelIdle } from '../../utils/idle';

const PortfolioContext = createContext(null);

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
      return {
        ...defaults,
        ...parsed,
        projects: Array.isArray(parsed.projects) ? parsed.projects : defaults.projects,
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : defaults.skills,
        certificates: Array.isArray(parsed.certificates) ? parsed.certificates : defaults.certificates,
        uiLabels: { ...defaults.uiLabels, ...(parsed.uiLabels || {}) },
        settings: { ...defaults.settings, ...(parsed.settings || {}) },
        adminConfig: {
          ...defaults.adminConfig,
          ...(parsed.adminConfig || {}),
          passwordHash: parsed.adminConfig?.passwordHash || defaults.adminConfig.passwordHash
        }
      };
    } catch (_err) {
      return defaults;
    }
  });

  const [toastData, setToastData] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', desc: '', onConfirm: null });
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeCertLightbox, setActiveCertLightbox] = useState(null);

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

  // Primary loader & revalidator from MongoDB Atlas
  const refreshFromBackend = useCallback(() => {
    return apiRequest('/api/public/bootstrap')
      .then((res) => {
        if (res && res.profile) {
          setAppState((prev) => {
            const next = {
              ...prev,
              profile: { ...prev.profile, ...res.profile },
              projects: Array.isArray(res.projects) ? res.projects : [],
              skills: Array.isArray(res.skills) && res.skills.length > 0 ? res.skills : prev.skills,
              certificates: Array.isArray(res.certificates) ? res.certificates : [],
              resumes: Array.isArray(res.resumes) ? res.resumes : (prev.resumes || []),
              settings: { ...prev.settings, ...(res.settings || {}) },
              uiLabels: { ...prev.uiLabels, ...(res.uiLabels || {}) }
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch (_e) {}
            // Avoid unnecessary re-renders if state hasn't meaningfully changed
            if (
              prev.profile?.updatedAt === next.profile?.updatedAt &&
              (prev.projects || []).length === next.projects.length &&
              (prev.skills || []).length === next.skills.length &&
              (prev.certificates || []).length === next.certificates.length
            ) {
              return prev;
            }
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
