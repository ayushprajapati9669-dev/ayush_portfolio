import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/globals.css';

if (typeof window !== 'undefined') {
  // Asynchronously load Google Fonts & FontAwesome after initial FCP/LCP or upon first user interaction
  const loadDeferredStyles = () => {
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
      const gf = document.createElement('link');
      gf.rel = 'stylesheet';
      gf.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500;700&family=Jost:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(gf);
    }
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
      document.head.appendChild(fa);
    }
    window.removeEventListener('scroll', loadDeferredStyles);
    window.removeEventListener('pointerdown', loadDeferredStyles);
    window.removeEventListener('touchstart', loadDeferredStyles);
    window.removeEventListener('keydown', loadDeferredStyles);
  };

  window.addEventListener('scroll', loadDeferredStyles, { passive: true, once: true });
  window.addEventListener('pointerdown', loadDeferredStyles, { passive: true, once: true });
  window.addEventListener('touchstart', loadDeferredStyles, { passive: true, once: true });
  window.addEventListener('keydown', loadDeferredStyles, { passive: true, once: true });

  const isMobile = window.innerWidth < 768;
  setTimeout(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadDeferredStyles, { timeout: 3000 });
    } else {
      setTimeout(loadDeferredStyles, 2000);
    }
  }, isMobile ? 4000 : 1500);
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
