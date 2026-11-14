import React, { Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/Home/Home';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Route-level code splitting for top-tier Lighthouse performance
const ProjectsPage = React.lazy(() => import('../pages/Projects/Projects').then(m => ({ default: m.ProjectsPage })));
const AboutPage = React.lazy(() => import('../pages/About/About').then(m => ({ default: m.AboutPage })));
const JourneyPage = React.lazy(() => import('../pages/Journey/Journey').then(m => ({ default: m.JourneyPage })));
const SkillsPage = React.lazy(() => import('../pages/Skills/Skills').then(m => ({ default: m.SkillsPage })));
const CertificatesPage = React.lazy(() => import('../pages/Certificates/Certificates').then(m => ({ default: m.CertificatesPage })));
const ContactPage = React.lazy(() => import('../pages/Contact/Contact').then(m => ({ default: m.ContactPage })));
const AdminPage = React.lazy(() => import('../pages/Admin/Admin').then(m => ({ default: m.AdminPage })));
if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/login'))) {
  import('../pages/Admin/Admin');
}
const NotFoundPage = React.lazy(() => import('../pages/NotFound/NotFound').then(m => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20 animate-ping" />
        <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin" />
        <span className="font-mono text-[10px] font-bold text-yellow-400">AP</span>
      </div>
      <p className="font-mono text-xs text-slate-400 tracking-widest uppercase animate-pulse">Loading Experience...</p>
    </div>
  );
}

// Global flag: skip transition on the initial page load so FCP/LCP paint immediately with 0 delay
let initialPageLoaded = false;

function PageTransition({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!initialPageLoaded) {
      initialPageLoaded = true;
      return;
    }
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !containerRef.current) return;

    import('gsap').then(({ default: gsap }) => {
      if (!containerRef.current) return;
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'all' }
      );
    });
  }, []);

  return (
    <div ref={containerRef} className="w-full flex-1 flex flex-col">
      {children}
    </div>
  );
}

export function AppRouter() {
  const location = useLocation();
  useScrollAnimation(location.pathname);

  // Group admin routes so admin internal tab switching does not trigger full page unmount
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes location={location} key={isAdminRoute ? 'admin-root' : location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/journey" element={<PageTransition><JourneyPage /></PageTransition>} />
        <Route path="/achievements" element={<PageTransition><JourneyPage /></PageTransition>} />
        <Route path="/skills" element={<PageTransition><SkillsPage /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><ProjectsPage viewMode="projects" /></PageTransition>} />
        <Route path="/projects/:slug" element={<Navigate to="/projects" replace />} />
        <Route path="/certificates" element={<PageTransition><CertificatesPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/connect" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/hire" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/login" element={<AdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/guide" element={<AdminPage />} />
        <Route path="/admin/api-docs" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
