import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from '../pages/Home/Home';
import { AboutPage } from '../pages/About/About';
import { SkillsPage } from '../pages/Skills/Skills';
import { ProjectsPage } from '../pages/Projects/Projects';
import { CertificatesPage } from '../pages/Certificates/Certificates';
import { ContactPage } from '../pages/Contact/Contact';
import { AdminPage } from '../pages/Admin/Admin';
import { NotFoundPage } from '../pages/NotFound/NotFound';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function AppRouter() {
  const location = useLocation();
  useScrollAnimation(location.pathname);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/projects" element={<ProjectsPage viewMode="projects" />} />
      <Route path="/projects/:slug" element={<ProjectsPage viewMode="projects" />} />
      <Route path="/certificates" element={<CertificatesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/connect" element={<ContactPage />} />
      <Route path="/hire" element={<ContactPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/guide" element={<AdminPage />} />
      <Route path="/admin/api-docs" element={<AdminPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
