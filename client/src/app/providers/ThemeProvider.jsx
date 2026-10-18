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
        projects: Array.isArray(parsed.projects)
          ? parsed.projects.filter(p => !['proj-airbnb-clone-live', 'proj-trading-platform', 'proj-ai-chat-app', 'proj-dsa-visualizer-draft'].includes(p.id))
          : [],
        certificates: Array.isArray(parsed.certificates)
          ? parsed.certificates.filter(c => c.id !== 'cert-apna-college-delta')
          : [],
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

  const [toastMessage, setToastMessage] = useState('');
  const [confirmState, setConfirmState] = useState({ open: false, title: '', desc: '', onConfirm: null });
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [activeCertLightbox, setActiveCertLightbox] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const t = setTimeout(() => setToastMessage(''), 4000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    document.title = appState.settings?.siteTitle || `${appState.profile?.name || 'Ayush Prajapati'} — Portfolio`;
  }, [appState.settings?.siteTitle, appState.profile?.name]);

  useEffect(() => {
    apiRequest('/api/public/bootstrap')
      .then((res) => {
        if (res && res.profile) {
          setAppState((prev) => ({
            ...prev,
            profile: { ...prev.profile, ...res.profile },
            projects: Array.isArray(res.projects) ? res.projects : [],
            skills: Array.isArray(res.skills) && res.skills.length > 0 ? res.skills : prev.skills,
            certificates: Array.isArray(res.certificates) ? res.certificates : [],
            settings: { ...prev.settings, ...(res.settings || {}) }
          }));
        }
      })
      .catch(() => {
        // Uses persistent local state when backend is offline
      });
  }, []);

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
    const pdfHref = appState.profile?.resumeUrl || '/images/Ayush_Prajapati_Resume.pdf';
    if (pdfHref) {
      const a = document.createElement('a');
      a.href = pdfHref;
      a.download = 'Ayush_Prajapati_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloading Ayush_Prajapati_Resume.pdf...');
      return;
    }
    window.print();
  }, [appState.profile?.resumeUrl, showToast]);

  return (
    <PortfolioContext.Provider
      value={{
        appState,
        updateAppState,
        toastMessage,
        showToast,
        hideToast: () => setToastMessage(''),
        confirmState,
        openConfirmModal,
        closeConfirmModal,
        resumeModalOpen,
        openResumeModal: () => setResumeModalOpen(true),
        closeResumeModal: () => setResumeModalOpen(false),
        downloadOrPrintResume,
        activeCertLightbox,
        openCertificateLightbox: (certId) => setActiveCertLightbox(certId),
        closeCertificateLightbox: () => setActiveCertLightbox(null)
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within a ThemeProvider');
  return ctx;
}
