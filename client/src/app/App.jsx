import React, { Suspense, useState, useEffect } from 'react';
import { ThemeProvider, usePortfolio } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { SmoothScrollProvider } from '../components/common/SmoothScrollProvider';
import { Header } from '../components/layout/Header';
import { BackgroundLayers } from '../components/layout/BackgroundLayers';
const Footer = React.lazy(() =>
  import('../components/layout/Footer').then((m) => ({ default: m.Footer }))
);
import { Toast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TelemetryTracker } from '../components/common/TelemetryTracker';
import { AppRouter } from './router';
import { runOnIdle, cancelIdle } from '../utils/idle';

// Lazy-load secondary overlay modals to prevent dead bundle evaluation on initial boot
const CertificateLightboxModal = React.lazy(() =>
  import('../components/ui/CertificateLightboxModal').then((m) => ({ default: m.CertificateLightboxModal }))
);
const ResumeModal = React.lazy(() =>
  import('../components/ui/ResumeModal').then((m) => ({ default: m.ResumeModal }))
);
const DeveloperCliDrawer = React.lazy(() =>
  import('../components/ui/DeveloperCliDrawer').then((m) => ({ default: m.DeveloperCliDrawer }))
);
const AskAyushAiWidget = React.lazy(() =>
  import('../components/ui/AskAyushAiWidget').then((m) => ({ default: m.AskAyushAiWidget }))
);
const SoundscapeStudio = React.lazy(() =>
  import('../components/ui/SoundscapeStudio').then((m) => ({ default: m.SoundscapeStudio }))
);

function LazyModals() {
  const { resumeModalOpen, activeCertLightbox } = usePortfolio();
  const [loadIdleOverlays, setLoadIdleOverlays] = useState(false);

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    let idleHandle = null;

    if (isMobile) {
      if (typeof window !== 'undefined' && window.__earlyUserInteraction) {
        setLoadIdleOverlays(true);
        return;
      }
      const activate = () => {
        setLoadIdleOverlays(true);
        window.removeEventListener('scroll', activate);
        window.removeEventListener('touchstart', activate);
        window.removeEventListener('pointerdown', activate);
      };
      window.addEventListener('scroll', activate, { passive: true, once: true });
      window.addEventListener('touchstart', activate, { passive: true, once: true });
      window.addEventListener('pointerdown', activate, { passive: true, once: true });

      const timer = setTimeout(() => {
        idleHandle = runOnIdle(() => setLoadIdleOverlays(true), { timeout: 3000 });
      }, 8500);

      return () => {
        clearTimeout(timer);
        cancelIdle(idleHandle);
        window.removeEventListener('scroll', activate);
        window.removeEventListener('touchstart', activate);
        window.removeEventListener('pointerdown', activate);
      };
    }

    const timer = setTimeout(() => {
      idleHandle = runOnIdle(() => setLoadIdleOverlays(true), { timeout: 3000 });
    }, 1500);

    return () => {
      clearTimeout(timer);
      cancelIdle(idleHandle);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      {activeCertLightbox && <CertificateLightboxModal />}
      {resumeModalOpen && <ResumeModal />}
      {loadIdleOverlays && (
        <>
          <DeveloperCliDrawer />
          <AskAyushAiWidget />
          <SoundscapeStudio />
        </>
      )}
    </Suspense>
  );
}

function LazyFooter() {
  const [showFooter, setShowFooter] = useState(() => {
    if (typeof window !== 'undefined' && (window.location.hash || window.scrollY > 50 || window.__earlyUserInteraction)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (showFooter) return;

    if (typeof window !== 'undefined' && (window.scrollY > 50 || window.__earlyUserInteraction)) {
      setShowFooter(true);
      return;
    }

    const trigger = () => {
      setShowFooter(true);
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('touchstart', trigger);
      window.removeEventListener('pointerdown', trigger);
      window.removeEventListener('wheel', trigger);
    };

    window.addEventListener('scroll', trigger, { passive: true, once: true });
    window.addEventListener('touchstart', trigger, { passive: true, once: true });
    window.addEventListener('pointerdown', trigger, { passive: true, once: true });
    window.addEventListener('wheel', trigger, { passive: true, once: true });

    let idleHandle = null;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const timer = setTimeout(() => {
      idleHandle = runOnIdle(trigger, { timeout: 2000 });
    }, isMobile ? 8500 : 4500);

    return () => {
      clearTimeout(timer);
      cancelIdle(idleHandle);
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('touchstart', trigger);
      window.removeEventListener('pointerdown', trigger);
      window.removeEventListener('wheel', trigger);
    };
  }, [showFooter]);

  if (!showFooter) return null;

  return (
    <Suspense fallback={null}>
      <Footer />
    </Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SmoothScrollProvider>
          <div className="min-h-screen text-alabaster selection:bg-yellow-500/30 selection:text-yellow-100 flex flex-col relative overflow-x-clip">
            <BackgroundLayers />
            <TelemetryTracker />
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-yellow-400 focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-semibold text-black"
            >
              Skip to main content
            </a>
            <Header />
            <Toast />
            <ConfirmModal />
            <LazyModals />
            <main id="main-content" className="flex-1 relative z-10">
              <AppRouter />
            </main>
            <LazyFooter />
          </div>
        </SmoothScrollProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
