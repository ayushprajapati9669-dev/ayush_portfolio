import React from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Toast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ResumeModal } from '../components/ui/ResumeModal';
import { CertificateLightboxModal } from '../components/ui/CertificateLightboxModal';
import { AppRouter } from './router';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen modern-mesh-bg text-alabaster selection:bg-vermilion selection:text-obsidian flex flex-col">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-vermilion focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:font-semibold text-obsidian"
          >
            Skip to main content
          </a>
          <Header />
          <Toast />
          <ConfirmModal />
          <ResumeModal />
          <CertificateLightboxModal />
          <main id="main-content" className="flex-1">
            <AppRouter />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
