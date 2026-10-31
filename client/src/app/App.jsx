import React from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { BackgroundLayers } from '../components/layout/BackgroundLayers';
import { ReferenceInteractiveFX } from '../components/ui/ReferenceInteractiveFX';
import { Toast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { CertificateLightboxModal } from '../components/ui/CertificateLightboxModal';
import { ResumeModal } from '../components/ui/ResumeModal';
import { DeveloperCliDrawer } from '../components/ui/DeveloperCliDrawer';
import { SoundscapeStudio } from '../components/ui/SoundscapeStudio';
import { AskAyushAiWidget } from '../components/ui/AskAyushAiWidget';
import { TelemetryTracker } from '../components/common/TelemetryTracker';
import { AppRouter } from './router';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen text-alabaster selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col relative overflow-x-clip">
          <BackgroundLayers />
          <ReferenceInteractiveFX />
          <TelemetryTracker />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-cyan-400 focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-semibold text-black"
          >
            Skip to main content
          </a>
          <Header />
          <Toast />
          <ConfirmModal />
          <CertificateLightboxModal />
          <ResumeModal />
          <DeveloperCliDrawer />
          <SoundscapeStudio />
          <AskAyushAiWidget />
          <main id="main-content" className="flex-1 relative z-10">
            <AppRouter />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
