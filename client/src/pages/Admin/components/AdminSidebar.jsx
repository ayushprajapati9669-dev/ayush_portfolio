import React, { useState, useRef, useEffect } from 'react';
import { playTick } from '../../../utils/audio';

export function AdminSidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  counts,
  profile,
  onLogout,
  onOpenCategoryModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef(null);
  const highlightRef = useRef(null);

  const navSections = [
    {
      items: [
        { id: 'dashboard', label: 'Overview', icon: 'fa-chart-pie', badge: null }
      ]
    },
    {
      title: 'Portfolio Content',
      items: [
        { id: 'projects', label: 'Projects', icon: 'fa-folder', badge: counts.projects },
        { id: 'certificates', label: 'Certificates', icon: 'fa-certificate', badge: counts.certificates },
        { id: 'skills', label: 'Skills', icon: 'fa-code', badge: counts.skills },
        { id: 'journey', label: 'About & Milestones', icon: 'fa-timeline', badge: counts.journey }
      ]
    },
    {
      title: 'Site Settings',
      items: [
        { id: 'profile', label: 'Profile & Resume', icon: 'fa-user-gear', badge: null },
        { id: 'media', label: 'Hero Portrait', icon: 'fa-image', badge: null },
        { id: 'security', label: 'Security', icon: 'fa-lock', badge: null }
      ]
    },
    {
      title: 'Communication',
      items: [
        {
          id: 'messages',
          label: 'Messages',
          icon: 'fa-envelope',
          badge: counts.unreadMessages,
          badgeColor: 'orange'
        }
      ]
    },
    {
      title: 'Advanced',
      items: [
        { id: 'recycle-bin', label: 'Recycle Bin', icon: 'fa-trash-can', badge: counts.trash || 0, isAction: true, modalType: 'recycleBin' },
        { id: 'activity-log', label: 'Activity Log', icon: 'fa-clock-rotate-left', badge: null, isAction: true, modalType: 'activityLog' },
        { id: 'linkedin-import', label: 'LinkedIn Import', icon: 'fa-brands fa-linkedin', badge: null, isAction: true, modalType: 'linkedin' },
        { id: 'github-sync', label: 'GitHub Sync', icon: 'fa-brands fa-github', badge: null, isAction: true, modalType: 'github' }
      ]
    },
    {
      title: 'Resources',
      items: [
        { id: 'guide', label: 'User Guide', icon: 'fa-book-open', badge: null, route: '/admin/guide' },
        { id: 'api-docs', label: 'API Reference', icon: 'fa-terminal', badge: null, route: '/admin/api-docs' }
      ]
    }
  ];

  // Sliding highlight bar logic with scrollTop support
  const moveHighlight = (element) => {
    const nav = navRef.current;
    const highlight = highlightRef.current;
    if (!nav || !highlight) return;

    if (!element) {
      const activeEl = nav.querySelector('.nav-item.active');
      if (activeEl) {
        moveHighlight(activeEl);
      } else {
        highlight.style.opacity = '0';
      }
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();
    const topOffset = (elRect.top - navRect.top) + nav.scrollTop;

    highlight.style.top = `${topOffset}px`;
    highlight.style.height = `${elRect.height || 42}px`;
    highlight.style.opacity = '1';
  };

  // Re-anchor highlight during scroll so lower tabs stay perfectly aligned
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleScroll = () => {
      const hovered = nav.querySelector('.nav-item:hover');
      if (hovered) {
        moveHighlight(hovered);
      } else {
        const activeEl = nav.querySelector('.nav-item.active');
        if (activeEl) moveHighlight(activeEl);
      }
    };

    nav.addEventListener('scroll', handleScroll, { passive: true });
    return () => nav.removeEventListener('scroll', handleScroll);
  }, [activeTab, isCollapsed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      moveHighlight();
    }, 120);
    return () => clearTimeout(timer);
  }, [activeTab, isCollapsed, searchQuery]);

  return (
    <aside
      className={`admin-sidebar ${isCollapsed ? 'focus-mode' : ''}`}
      id="adminSidebar"
    >
      {/* Header with Logo and Focus Toggle */}
      <div className="sidebar-header">
        <div className="logo-wrap">
          <div className="logo-box">
            {profile?.monogram || 'AP'}
          </div>
          <div className="logo-text-wrap">
            <span className="logo-text">{profile?.displayName || 'Ayush Prajapati'}</span>
            <span className="logo-sub">ADMIN SYSTEM</span>
          </div>
        </div>

        <button
          type="button"
          className="focus-btn"
          onClick={() => {
            playTick();
            onToggleCollapse();
          }}
          aria-label="Toggle Focus Mode"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <i
            className="fa-solid fa-chevron-left"
            style={{
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.4s ease'
            }}
          />
        </button>
      </div>

      {/* Menu Search */}
      <div className="sidebar-search">
        <div className="sidebar-search-input-wrap">
          <i className="fa-solid fa-magnifying-glass sidebar-search-icon" />
          <input
            type="text"
            className="sidebar-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              className="sidebar-search-clear visible"
              onClick={() => {
                playTick();
                setSearchQuery('');
              }}
              aria-label="Clear menu search"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        className="sidebar-nav"
        id="sidebarNav"
        ref={navRef}
        onMouseLeave={() => moveHighlight()}
      >
        <div className="sidebar-highlight" ref={highlightRef} />

        {navSections.map((sec, secIdx) => {
          const visibleItems = sec.items.filter((item) =>
            searchQuery === '' || item.label.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (visibleItems.length === 0) return null;

          return (
            <React.Fragment key={sec.title || 'sec-' + secIdx}>
              {sec.title && <div className="nav-section-title">{sec.title}</div>}
              {visibleItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      playTick();
                      if (item.isAction) {
                        onSelectTab('journey');
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('ams-open-modal', { detail: { modal: item.modalType } }));
                        }, 120);
                      } else {
                        onSelectTab(item.id, item.route);
                      }
                      moveHighlight(e.currentTarget);
                    }}
                    onMouseEnter={(e) => moveHighlight(e.currentTarget)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="nav-icon-box">
                      <i className={item.icon.startsWith('fa-') && !item.icon.includes(' ') ? `fa-solid ${item.icon}` : item.icon} />
                    </div>
                    <span>{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className={`nav-badge ${item.badgeColor || ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div
          className="admin-profile"
          onClick={() => {
            playTick();
            onSelectTab('profile');
          }}
          title="Edit Profile"
        >
          <div className="admin-avatar">
            {profile?.monogram || 'AP'}
          </div>
          <div className="admin-info">
            <span className="admin-name">{profile?.displayName || 'Ayush Prajapati'}</span>
            <span className="admin-role">Super Admin</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-logout"
          onClick={() => {
            playTick();
            onLogout();
          }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
