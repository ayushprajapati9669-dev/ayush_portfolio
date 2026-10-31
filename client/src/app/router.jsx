import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from '../pages/Home/Home';
import { ProjectsPage } from '../pages/Projects/Projects';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// Route-level code splitting for top-tier Lighthouse performance
const AboutPage = React.lazy(() => import('../pages/About/About').then(m => ({ default: m.AboutPage })));
const SkillsPage = React.lazy(() => import('../pages/Skills/Skills').then(m => ({ default: m.SkillsPage })));
const ProjectDetail = React.lazy(() => import('../pages/Projects/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const CertificatesPage = React.lazy(() => import('../pages/Certificates/Certificates').then(m => ({ default: m.CertificatesPage })));
const ContactPage = React.lazy(() => import('../pages/Contact/Contact').then(m => ({ default: m.ContactPage })));
const AdminPage = React.lazy(() => import('../pages/Admin/Admin').then(m => ({ default: m.AdminPage })));
const NotFoundPage = React.lazy(() => import('../pages/NotFound/NotFound').then(m => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
        <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin" />
        <span className="font-mono text-[10px] font-bold text-cyan-400">AP</span>
      </div>
      <p className="font-mono text-xs text-slate-400 tracking-widest uppercase animate-pulse">Loading Experience...</p>
    </div>
  );
}

export function AppRouter() {
  const location = useLocation();
  useScrollAnimation(location.pathname);

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/projects" element={<ProjectsPage viewMode="projects" />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/connect" element={<ContactPage />} />
        <Route path="/hire" element={<ContactPage />} />
        <Route path="/login" element={<AdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/guide" element={<AdminPage />} />
        <Route path="/admin/api-docs" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
