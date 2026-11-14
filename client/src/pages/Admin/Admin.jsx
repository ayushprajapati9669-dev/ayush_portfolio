import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { playTick } from '../../utils/audio';
import { useScrollLock } from '../../utils/scrollLock';

// Admin-specific CSS (only loaded when admin page is visited)
import '../../styles/admin.css';

// Subcomponents
import { AdminAuthModal } from './components/AdminAuthModal';
const AdminSidebar = React.lazy(() => import('./components/AdminSidebar').then((m) => ({ default: m.AdminSidebar })));
const AdminOverview = React.lazy(() => import('./components/AdminOverview').then((m) => ({ default: m.AdminOverview })));
const AdminProjects = React.lazy(() => import('./components/AdminProjects').then((m) => ({ default: m.AdminProjects })));
const AdminCertificates = React.lazy(() => import('./components/AdminCertificates').then((m) => ({ default: m.AdminCertificates })));
const AdminSkills = React.lazy(() => import('./components/AdminSkills').then((m) => ({ default: m.AdminSkills })));
const AdminMilestones = React.lazy(() => import('./components/AdminMilestones').then((m) => ({ default: m.AdminMilestones })));
const AdminProfile = React.lazy(() => import('./components/AdminProfile').then((m) => ({ default: m.AdminProfile })));
const AdminHeroPortrait = React.lazy(() => import('./components/AdminHeroPortrait').then((m) => ({ default: m.AdminHeroPortrait })));
const AdminAppearance = React.lazy(() => import('./components/AdminAppearance').then((m) => ({ default: m.AdminAppearance })));
const AdminSeo = React.lazy(() => import('./components/AdminSeo').then((m) => ({ default: m.AdminSeo })));
const AdminSiteSettings = React.lazy(() => import('./components/AdminSiteSettings').then((m) => ({ default: m.AdminSiteSettings })));
const AdminMessages = React.lazy(() => import('./components/AdminMessages').then((m) => ({ default: m.AdminMessages })));
const AdminSecurity = React.lazy(() => import('./components/AdminSecurity').then((m) => ({ default: m.AdminSecurity })));
const AdminUserGuide = React.lazy(() => import('./components/AdminUserGuide').then((m) => ({ default: m.AdminUserGuide })));
const AdminApiReference = React.lazy(() => import('./components/AdminApiReference').then((m) => ({ default: m.AdminApiReference })));
const AdminAnalytics = React.lazy(() => import('./components/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics })));

// Modals
const QuickProjectModal = React.lazy(() => import('./components/modals/QuickProjectModal').then((m) => ({ default: m.QuickProjectModal })));
const ActivityDetailModal = React.lazy(() => import('./components/modals/ActivityDetailModal').then((m) => ({ default: m.ActivityDetailModal })));
import { SEO } from '../../components/SEO';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';


export function AdminPage() {
  const { appState, updateAppState, showToast, openConfirmModal } = usePortfolio();
  const { session, loginAdmin, logoutAdmin, resetAdminPassword, recoverAdminPassword, checkCurrentPassword } = useAuth();
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
    const tabParam = searchParams.get('tab');
    if (tabParam === 'hero' || tabParam === 'portrait') return 'media';
    return tabParam || 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const contentAreaRef = useRef(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Trigger smooth scroll animations on tab change
  useScrollAnimation(activeTab);

  // admin route setup

  useEffect(() => {
    const handleSidebarToggle = () => setIsMobileSidebarOpen((open) => !open);
    window.addEventListener('admin-sidebar-toggle', handleSidebarToggle);
    return () => window.removeEventListener('admin-sidebar-toggle', handleSidebarToggle);
  }, []);

  // Escape key listener to close mobile sidebar drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen]);

  // Shared scroll-lock coordination (reference counted)
  useScrollLock(isMobileSidebarOpen);

  // Sync elevated stacking context and emit sidebar state for ARIA
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.classList.add('admin-sidebar-open');
    } else {
      document.body.classList.remove('admin-sidebar-open');
    }
    window.dispatchEvent(new CustomEvent('admin-sidebar-state-changed', { detail: { isOpen: isMobileSidebarOpen } }));
    return () => {
      document.body.classList.remove('admin-sidebar-open');
      window.dispatchEvent(new CustomEvent('admin-sidebar-state-changed', { detail: { isOpen: false } }));
    };
  }, [isMobileSidebarOpen]);

  // Guarantee Devicon icons stylesheet is loaded for Skills, Overview, and Projects CMS
  useEffect(() => {
    const deviconId = 'devicon-stylesheet-admin';
    if (!document.getElementById(deviconId) && !document.querySelector('link[href*="devicon"]')) {
      const link = document.createElement('link');
      link.id = deviconId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css';
      document.head.appendChild(link);
    }
  }, []);

  // Smooth GSAP tab transition with unified card staggering
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && contentAreaRef.current) {
      gsap.killTweensOf(contentAreaRef.current);
      gsap.fromTo(
        contentAreaRef.current,
        { opacity: 0, y: 14, scale: 0.995 },
        { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'power3.out', clearProps: 'transform,opacity' }
      );

      // Stagger child cards consistently across all admin tabs
      const timer = setTimeout(() => {
        if (!contentAreaRef.current) return;
        const cards = contentAreaRef.current.querySelectorAll(
          '.stats-grid > *, .kpi-hero-card, .grid > div, .glass-card-admin, .stat-card'
        );
        if (cards.length > 0) {
          gsap.killTweensOf(cards);
          gsap.fromTo(
            cards,
            { opacity: 0, y: 20, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.45,
              stagger: 0.045,
              ease: 'power2.out',
              clearProps: 'transform,opacity'
            }
          );
        }
      }, 50);

      return () => clearTimeout(timer);
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
    setIsMobileSidebarOpen(false);
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
    window.scrollTo({ top: 0, behavior: 'auto' });
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
      <div className="admin-auth-screen">
        <AdminAuthModal
          loginAdmin={loginAdmin}
          resetAdminPassword={resetAdminPassword}
          recoverAdminPassword={recoverAdminPassword}
          showToast={showToast}
        />
      </div>
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
    milestones: (appState.profile?.learningJourney || []).length,
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
    <Suspense fallback={<div className="admin-workspace min-h-screen flex items-center justify-center text-slate-400">Loading admin console...</div>}>
      <div className="admin-workspace min-h-screen flex text-white relative">
        <SEO
          title="Admin Management Studio & Milestones CMS"
          description="Administrative management studio for Ayush Prajapati's developer portfolio, managing career milestones, projects, skills, and verified credentials."
          url="https://ayushprajapati.dev/admin"
        />
        {/* 1. Admin Sidebar with Focus Mode */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          counts={counts}
          profile={appState.profile}
          onLogout={logoutAdmin}
          onOpenCategoryModal={handleOpenCategoryModal}
        />
        {isMobileSidebarOpen && (
          <button
            type="button"
            className="admin-sidebar-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close admin navigation"
          />
        )}

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

            {activeTab === 'analytics' && (
              <AdminAnalytics showToast={showToast} />
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

            {(activeTab === 'milestones' || activeTab === 'journey') && (
              <AdminMilestones
                appState={appState}
                updateAppState={updateAppState}
                session={session}
                showToast={showToast}
                openConfirmModal={openConfirmModal}
                onSelectTab={handleSelectTab}
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

            {(activeTab === 'media' || activeTab === 'hero' || activeTab === 'portrait') && (
              <AdminHeroPortrait
                appState={appState}
                updateAppState={updateAppState}
                session={session}
                showToast={showToast}
              />
            )}

            {activeTab === 'appearance' && (
              <AdminAppearance
                appState={appState}
                updateAppState={updateAppState}
                session={session}
                showToast={showToast}
              />
            )}

            {activeTab === 'seo' && (
              <AdminSeo
                appState={appState}
                updateAppState={updateAppState}
                session={session}
                showToast={showToast}
              />
            )}

            {(activeTab === 'settings' || activeTab === 'site-settings') && (
              <AdminSiteSettings
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
    </Suspense>
  );
}

export default AdminPage;
