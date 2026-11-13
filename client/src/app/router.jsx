import React, { Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HomePage } from '../pages/Home/Home';
import { ProjectsPage } from '../pages/Projects/Projects';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Route-level code splitting for top-tier Lighthouse performance
const AboutPage = React.lazy(() => import('../pages/About/About').then(m => ({ default: m.AboutPage })));
const JourneyPage = React.lazy(() => import('../pages/Journey/Journey').then(m => ({ default: m.JourneyPage })));
const SkillsPage = React.lazy(() => import('../pages/Skills/Skills').then(m => ({ default: m.SkillsPage })));
const CertificatesPage = React.lazy(() => import('../pages/Certificates/Certificates').then(m => ({ default: m.CertificatesPage })));
const ContactPage = React.lazy(() => import('../pages/Contact/Contact').then(m => ({ default: m.ContactPage })));
const AdminPage = React.lazy(() => import('../pages/Admin/Admin').then(m => ({ default: m.AdminPage })));
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

// Cinematic fluid page transition variant
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } }
};

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

export function AppRouter() {
  const location = useLocation();
  useScrollAnimation(location.pathname);

  // Group admin routes so admin internal tab switching does not trigger full page unmount
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </Suspense>
  );
}

export default AppRouter;
