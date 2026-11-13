import React, { Suspense } from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { SmoothScrollProvider } from '../components/common/SmoothScrollProvider';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { BackgroundLayers } from '../components/layout/BackgroundLayers';
import { Toast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { SoundscapeStudio } from '../components/ui/SoundscapeStudio';
import { TelemetryTracker } from '../components/common/TelemetryTracker';
import { AppRouter } from './router';

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
            <Suspense fallback={null}>
              <CertificateLightboxModal />
              <ResumeModal />
              <DeveloperCliDrawer />
              <AskAyushAiWidget />
            </Suspense>
            <SoundscapeStudio />
            <main id="main-content" className="flex-1 relative z-10">
              <AppRouter />
            </main>
            <Footer />
          </div>
        </SmoothScrollProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
