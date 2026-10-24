import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { playTick } from '../../utils/audio';

// Subcomponents
import { AdminSidebar } from './components/AdminSidebar';
import { AdminOverview } from './components/AdminOverview';
import { AdminProjects } from './components/AdminProjects';
import { AdminCertificates } from './components/AdminCertificates';
import { AdminSkills } from './components/AdminSkills';
import { AdminMilestones } from './components/AdminMilestones';
import { AdminProfile } from './components/AdminProfile';
import { AdminHeroPortrait } from './components/AdminHeroPortrait';
import { AdminMessages } from './components/AdminMessages';
import { AdminSecurity } from './components/AdminSecurity';
import { AdminUserGuide } from './components/AdminUserGuide';
import { AdminApiReference } from './components/AdminApiReference';
import { AdminAuthModal } from './components/AdminAuthModal';

// Modals
import { QuickProjectModal } from './components/modals/QuickProjectModal';
import { ActivityDetailModal } from './components/modals/ActivityDetailModal';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export function AdminPage() {
  const { appState, updateAppState, showToast, openConfirmModal } = usePortfolio();
  const { session, loginAdmin, logoutAdmin, resetAdminPassword, checkCurrentPassword } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab state (query param support: ?tab=projects, or direct routes /admin/guide, /admin/api-docs)
  const getInitialTab = () => {
    if (location.pathname === '/admin/guide' || location.pathname === '/admin/guide/') {
      return 'guide';
    }
    if (location.pathname === '/admin/api-docs' || location.pathname === '/admin/api-docs/') {
      return 'api-docs';
    }
    return searchParams.get('tab') || 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const contentAreaRef = useRef(null);

  // Trigger smooth scroll animations on tab change
  useScrollAnimation(activeTab);

  // Smooth GSAP tab transition
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && contentAreaRef.current) {
      gsap.fromTo(
        contentAreaRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'transform,opacity' }
      );
    }
  }, [activeTab]);

  // Sidebar Focus Mode
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isQuickProjOpen, setIsQuickProjOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleOpenCategoryModal = () => {
    handleSelectTab('skills');
    setIsCategoryModalOpen(true);
  };

  // Sync activeTab when URL pathname or searchParams change
  useEffect(() => {
    const current = getInitialTab();
    if (current !== activeTab) {
      setActiveTab(current);
    }
  }, [location.pathname, searchParams]);

  const handleSelectTab = (tabId, route) => {
    setActiveTab(tabId);
    if (route) {
      navigate(route);
    } else if (tabId === 'guide') {
      navigate('/admin/guide');
    } else if (tabId === 'api-docs') {
      navigate('/admin/api-docs');
    } else {
      navigate(tabId === 'dashboard' ? '/admin' : `/admin?tab=${tabId}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manage body classes for global navbar desktop offset
  useEffect(() => {
    if (session) {
      document.body.classList.add('has-admin-sidebar');
      if (isSidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
    } else {
      document.body.classList.remove('has-admin-sidebar', 'sidebar-collapsed');
    }

    return () => {
      document.body.classList.remove('has-admin-sidebar', 'sidebar-collapsed');
    };
  }, [session, isSidebarCollapsed]);

  // If not authenticated, render login / forgot password modal
  if (!session) {
    return (
      <AdminAuthModal
        loginAdmin={loginAdmin}
        resetAdminPassword={resetAdminPassword}
        showToast={showToast}
      />
    );
  }

  // Count metrics for sidebar badges
  const publishedCount = (appState.projects || []).filter((p) => p.status === 'published').length;
  const certCount = (appState.certificates || []).length;
  const skillsCount = (appState.skills || []).reduce((acc, cat) => acc + (cat.items || []).length, 0);
  const unreadMsgCount = (appState.messages || []).filter((m) => m.status === 'unread').length;

  let trashCount = 0;
  try {
    const rawTrash = localStorage.getItem('admin_trash_v9');
    if (rawTrash) trashCount = JSON.parse(rawTrash).length;
  } catch (e) {}

  const counts = {
    projects: publishedCount,
    certificates: certCount,
    skills: skillsCount,
    journey: (appState.profile?.learningJourney || []).length,
    unreadMessages: unreadMsgCount,
    trash: trashCount
  };

  // Quick project save handler from modal
  const handleSaveQuickProject = ({ title, technologies }) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const techArray = technologies.split(',').map((s) => s.trim()).filter(Boolean);

    updateAppState((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: 'proj-' + Date.now(),
          title,
          slug,
          category: 'Full-Stack Web App',
          shortDescription: `${title} — Modern full-stack architecture built with ${techArray.slice(0, 3).join(', ')}.`,
          technologies: techArray,
          thumbnailType: 'image',
          thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
          githubUrl: 'https://github.com/ayushprajapati9669-dev',
          liveDemoUrl: '',
          featured: true,
          status: 'published',
          displayOrder: (prev.projects || []).length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }), session.token);

    showToast(`Project "${title}" created successfully!`, 'fa-rocket');
  };

  // Activity modal action handler
  const handleActivityAction = (item) => {
    if (item.actionTab) {
      handleSelectTab(item.actionTab);
    } else if (item.actionUrl) {
      window.open(item.actionUrl, '_blank', 'noreferrer');
    } else {
      showToast('Opening activity reference...');
    }
  };

  return (
    <div className="min-h-screen flex text-white relative">
      {/* 1. Admin Sidebar with Focus Mode */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        counts={counts}
        profile={appState.profile}
        onLogout={logoutAdmin}
        onOpenCategoryModal={handleOpenCategoryModal}
      />

      {/* 2. Main Wrapper */}
      <div
        className={`admin-main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        <main ref={contentAreaRef} className="admin-content-area">
          {activeTab === 'dashboard' && (
            <AdminOverview
              appState={appState}
              onSelectTab={handleSelectTab}
              onOpenAddProject={() => setIsQuickProjOpen(true)}
              onOpenDetailModal={(act) => setSelectedActivity(act)}
              showToast={showToast}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjects
              appState={appState}
              updateAppState={updateAppState}
              session={session}
              showToast={showToast}
              openConfirmModal={openConfirmModal}
            />
          )}

          {activeTab === 'certificates' && (
            <AdminCertificates
              appState={appState}
              updateAppState={updateAppState}
              session={session}
              showToast={showToast}
              openConfirmModal={openConfirmModal}
            />
          )}

          {activeTab === 'skills' && (
            <AdminSkills
              appState={appState}
              updateAppState={updateAppState}
              session={session}
              showToast={showToast}
              isCategoryModalOpen={isCategoryModalOpen}
              setIsCategoryModalOpen={setIsCategoryModalOpen}
            />
          )}

          {activeTab === 'journey' && (
            <AdminMilestones
              appState={appState}
              updateAppState={updateAppState}
              session={session}
              showToast={showToast}
              openConfirmModal={openConfirmModal}
            />
          )}

          {activeTab === 'profile' && (
            <AdminProfile
              appState={appState}
              updateAppState={updateAppState}
              session={session}
              showToast={showToast}
            />
          )}

          {activeTab === 'media' && (
            <AdminHeroPortrait
              appState={appState}
              updateAppState={updateAppState}
              session={session}
              showToast={showToast}
            />
          )}

          {activeTab === 'messages' && (
            <AdminMessages
              appState={appState}
              updateAppState={updateAppState}
              session={session}
              showToast={showToast}
              openConfirmModal={openConfirmModal}
            />
          )}

          {activeTab === 'security' && (
            <AdminSecurity
              checkCurrentPassword={checkCurrentPassword}
              resetAdminPassword={resetAdminPassword}
              showToast={showToast}
            />
          )}

          {activeTab === 'guide' && (
            <AdminUserGuide
              onSelectTab={handleSelectTab}
              showToast={showToast}
            />
          )}

          {activeTab === 'api-docs' && (
            <AdminApiReference
              onSelectTab={handleSelectTab}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Quick Project Creation Modal */}
      <QuickProjectModal
        isOpen={isQuickProjOpen}
        onClose={() => setIsQuickProjOpen(false)}
        onSave={handleSaveQuickProject}
      />

      {/* Activity Details Modal */}
      <ActivityDetailModal
        item={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onAction={handleActivityAction}
      />
    </div>
  );
}

export default AdminPage;
