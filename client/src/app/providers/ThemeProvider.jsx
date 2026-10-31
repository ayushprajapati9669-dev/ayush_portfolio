import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getDefaultPortfolioState, STORAGE_KEY } from '../../services/defaultPortfolioState';
import { apiRequest, syncStateToMongoBackend } from '../../services/api';

const PortfolioContext = createContext(null);

export function ThemeProvider({ children }) {
  const [appState, setAppState] = useState(() => {
    const defaults = getDefaultPortfolioState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      if (!parsed.profile) return defaults;
      return {
        ...defaults,
        ...parsed,
        projects: Array.isArray(parsed.projects) ? parsed.projects : defaults.projects,
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
            return next;
          });
        }
      })
      .catch(() => {
        // Fallback to offline cache
      });
  }, []);

  // Initial load
  useEffect(() => {
    refreshFromBackend();
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
        setActiveCertLightbox
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
