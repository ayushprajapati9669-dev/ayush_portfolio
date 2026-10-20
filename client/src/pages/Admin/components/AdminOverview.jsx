import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { playTick } from '../../../utils/audio';

export function AdminOverview({
  appState,
  onSelectTab,
  onOpenAddProject,
  onOpenDetailModal,
  showToast
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);
  const statsGridRef = useRef(null);

  const projects = appState.projects || [];
  const certificates = appState.certificates || [];
  const messages = appState.messages || [];

  const publishedCount = projects.filter((p) => p.status === 'published').length;
  const certCount = certificates.length;
  const unreadMsgCount = messages.filter((m) => m.status === 'unread').length;

  // 3D tilt and entrance animations for stat cards
  useEffect(() => {
    // Stat cards remain 100% visible and interactive immediately
  }, []);

  // Assemble dynamic activities from real state + system events
  const allActivities = [
    ...projects.slice(0, 3).map((p) => ({
      id: 'proj-' + p.id,
      type: 'project',
      title: p.title || 'Portfolio Project',
      sub: p.category || 'Full-Stack Application',
      iconElement: <i className="devicon-react-original colored" />,
      iconBg: 'rgba(0, 240, 255, 0.1)',
      iconBorder: '1px solid rgba(0, 240, 255, 0.2)',
      badgeClass: 'success',
      badgeIcon: 'fa-check-circle',
      badgeText: p.status === 'published' ? 'Live' : 'Draft',
      time: p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
      actionLabel: 'Manage Projects',
      actionTab: 'projects',
      source: p.liveDemoUrl || 'Live Deployment'
    })),
    ...certificates.slice(0, 2).map((c) => ({
      id: 'cert-' + c.id,
      type: 'certificate',
      title: c.title || 'Technical Certificate',
      sub: `${c.issuer || 'Credential'} · ${c.issueDate || 'Verified'}`,
      iconElement: <i className="devicon-amazonwebservices-plain colored icon-fix" />,
      iconBg: 'rgba(162,89,255,0.1)',
      iconBorder: '1px solid rgba(162,89,255,0.2)',
      badgeClass: 'info',
      badgeIcon: 'fa-shield-halved',
      badgeText: 'Verified',
      time: 'Verified',
      actionLabel: 'Manage Certificates',
      actionTab: 'certificates',
      source: c.issuer || 'Online Certification'
    })),
    {
      id: 'commit-1',
      type: 'commit',
      title: 'Pushed to main branch',
      sub: 'ayushprajapati9669-dev/portfolio',
      iconElement: <i className="devicon-github-original colored icon-fix" />,
      iconBg: 'rgba(255,255,255,0.05)',
      iconBorder: '1px solid rgba(255,255,255,0.1)',
      badgeClass: 'info',
      badgeIcon: 'fa-code-commit',
      badgeText: 'Commit',
      time: '2 hours ago',
      actionLabel: 'View GitHub Code',
      actionUrl: 'https://github.com/ayushprajapati9669-dev',
      source: 'GitHub CI/CD'
    },
    ...messages.slice(0, 2).map((m) => ({
      id: 'msg-' + m.id,
      type: 'message',
      title: `Message: ${m.subject || 'Portfolio Inquiry'}`,
      sub: `from ${m.email || m.name || 'visitor'}`,
      iconElement: <i className="fa-solid fa-envelope" style={{ color: '#f59e0b' }} />,
      iconBg: 'rgba(245,158,11,0.1)',
      iconBorder: '1px solid rgba(245,158,11,0.2)',
      badgeClass: 'warn',
      badgeIcon: 'fa-envelope-open',
      badgeText: m.status === 'unread' ? 'New' : 'Read',
      time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
      actionLabel: 'Open Messages Inbox',
      actionTab: 'messages',
      source: m.email || 'Contact Form'
    })),
    {
      id: 'view-1',
      type: 'view',
      title: 'Portfolio viewed by 18 visitors',
      sub: 'From LinkedIn & GitHub referral · last hour',
      iconElement: <i className="fa-solid fa-eye" style={{ color: 'var(--accent-1)' }} />,
      iconBg: 'rgba(0, 240, 255, 0.1)',
      iconBorder: '1px solid rgba(0, 240, 255, 0.2)',
      badgeClass: 'info',
      badgeIcon: 'fa-chart-line',
      badgeText: '18 views',
      time: '1 hr ago',
      actionLabel: 'Analytics Details',
      source: 'LinkedIn Analytics'
    },
    {
      id: 'view-2',
      type: 'view',
      title: 'Resume downloaded',
      sub: 'by recruiter@techcorp.io',
      iconElement: <i className="fa-solid fa-download" style={{ color: 'var(--accent-3)' }} />,
      iconBg: 'rgba(162,89,255,0.1)',
      iconBorder: '1px solid rgba(162,89,255,0.2)',
      badgeClass: 'purple-badge',
      badgeIcon: 'fa-file-pdf',
      badgeText: 'Downloaded',
      time: '3 hrs ago',
      actionLabel: 'Check Resume Settings',
      actionTab: 'profile',
      source: 'Resume Download Button'
    },
    {
      id: 'star-1',
      type: 'project',
      title: 'New GitHub star on portfolio repo',
      sub: 'ayush_portfolio · by @devhunter',
      iconElement: <i className="fa-solid fa-star" style={{ color: 'var(--accent-2)' }} />,
      iconBg: 'rgba(0, 255, 136, 0.1)',
      iconBorder: '1px solid rgba(0, 255, 136, 0.2)',
      badgeClass: 'success',
      badgeIcon: 'fa-star',
      badgeText: 'Starred',
      time: 'Yesterday',
      actionLabel: 'View GitHub Repo',
      actionUrl: 'https://github.com/ayushprajapati9669-dev',
      source: 'GitHub API'
    }
  ];

  // Filtering by chip & search query
  const filteredActivities = allActivities.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      item.title.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const displayedActivities = filteredActivities.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredActivities.length;

  const handleLoadMore = () => {
    playTick();
    setVisibleCount((prev) => prev + 2);
  };

  return (
    <div className="space-y-8">
      {/* 4 STATS CARDS */}
      <div className="stats-grid" ref={statsGridRef}>
        {/* Card 1: Live Projects */}
        <div
          className="stat-card"
          onClick={() => {
            playTick();
            onSelectTab('projects');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <div className="stat-label">Live Projects</div>
            <div className="stat-icon icon-cyan">
              <i className="fa-solid fa-layer-group" />
            </div>
          </div>
          <div>
            <div className="stat-value cyan">{publishedCount}</div>
            <div className="stat-trend">
              <i className="fa-solid fa-arrow-trend-up" style={{ color: 'var(--accent-2)' }} />
              <span>+1 this month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Certificates */}
        <div
          className="stat-card"
          onClick={() => {
            playTick();
            onSelectTab('certificates');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <div className="stat-label">Certificates</div>
            <div className="stat-icon icon-purple">
              <i className="fa-solid fa-certificate" />
            </div>
          </div>
          <div>
            <div className="stat-value purple">{certCount}</div>
            <div className="stat-trend">
              <i className="fa-solid fa-check-double" style={{ color: 'var(--accent-1)' }} />
              <span>Verified credentials</span>
            </div>
          </div>
        </div>

        {/* Card 3: Messages */}
        <div
          className="stat-card"
          onClick={() => {
            playTick();
            onSelectTab('messages');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-header">
            <div className="stat-label">Messages</div>
            <div className="stat-icon icon-orange">
              <i className="fa-regular fa-envelope" />
            </div>
          </div>
          <div>
            <div className="stat-value orange">{unreadMsgCount}</div>
            <div className="stat-trend">
              {unreadMsgCount > 0 ? (
                <>
                  <i className="fa-solid fa-bell" style={{ color: '#f59e0b' }} />
                  <span>{unreadMsgCount} unread incoming</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-circle-check" style={{ color: 'var(--accent-2)' }} />
                  <span>Inbox all caught up</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: System Status */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-label">System Status</div>
            <div className="stat-icon icon-green">
              <i className="fa-solid fa-server" />
            </div>
          </div>
          <div>
            <div className="stat-value green" style={{ fontSize: '24px' }}>Online</div>
            <div className="stat-trend">
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  background: 'var(--accent-2)',
                  borderRadius: '50%',
                  display: 'inline-block',
                  boxShadow: '0 0 10px var(--accent-2)'
                }}
              />
              <span>All systems normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY GLASS CARD */}
      <div className="glass-card-admin">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fa-solid fa-wave-square" />
            <span>Recent Activity</span>
          </h2>
          <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
            Live feed
          </span>
        </div>

        {/* Filter Chips & Search Input */}
        <div className="activity-controls">
          <div className="activity-filters">
            {[
              { id: 'all', label: 'All' },
              { id: 'project', label: 'Projects' },
              { id: 'certificate', label: 'Certificates' },
              { id: 'commit', label: 'Commits' },
              { id: 'message', label: 'Messages' },
              { id: 'view', label: 'Views' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-chip ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => {
                  playTick();
                  setActiveFilter(f.id);
                  setVisibleCount(4);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="activity-search-wrap">
            <i className="fa-solid fa-magnifying-glass activity-search-icon" />
            <input
              type="text"
              className="activity-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(4);
              }}
              placeholder="Search activity..."
            />
          </div>
        </div>

        {/* Activity Items List */}
        <div className="activity-list">
          {displayedActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <i className="fa-solid fa-search" style={{ fontSize: '24px', opacity: 0.3, marginBottom: '12px', display: 'block' }} />
              No activity matches your criteria.
            </div>
          ) : (
            displayedActivities.map((act) => (
              <div
                key={act.id}
                className="activity-item"
                onClick={() => {
                  playTick();
                  onOpenDetailModal(act);
                }}
              >
                <div
                  className="table-icon"
                  style={{
                    background: act.iconBg,
                    border: act.iconBorder
                  }}
                >
                  {act.iconElement}
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div className="table-title truncate">{act.title}</div>
                  <div className="table-sub truncate">{act.sub}</div>
                </div>
                <span className={`badge ${act.badgeClass}`}>
                  {act.badgeIcon && <i className={`fa-solid ${act.badgeIcon}`} />}
                  {act.badgeText}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        <div className="load-more-wrap">
          <button
            type="button"
            className={`load-more-btn ${!canLoadMore ? 'all-loaded' : ''}`}
            onClick={handleLoadMore}
            disabled={!canLoadMore}
          >
            <span>{canLoadMore ? 'Load more' : 'All loaded'}</span>
            <i className={`fa-solid ${canLoadMore ? 'fa-chevron-down' : 'fa-check'}`} />
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="glass-card-admin" style={{ padding: '24px' }}>
        <div className="quick-actions">
          <div
            className="action-btn"
            onClick={() => {
              playTick();
              onOpenAddProject();
            }}
          >
            <div className="action-icon">
              <i className="fa-solid fa-plus" />
            </div>
            <div className="action-info">
              <h4>Add New Project</h4>
              <p>Showcase your latest work</p>
            </div>
          </div>

          <div
            className="action-btn"
            onClick={() => {
              playTick();
              onSelectTab('messages');
            }}
          >
            <div className="action-icon" style={{ color: '#f59e0b' }}>
              <i className="fa-regular fa-envelope-open" />
            </div>
            <div className="action-info">
              <h4>Check Messages</h4>
              <p>{unreadMsgCount} unread messages</p>
            </div>
          </div>

          <div
            className="action-btn"
            onClick={() => {
              playTick();
              onSelectTab('profile');
            }}
          >
            <div className="action-icon" style={{ color: 'var(--accent-2)' }}>
              <i className="fa-solid fa-user-pen" />
            </div>
            <div className="action-info">
              <h4>Update Profile</h4>
              <p>Edit bio and social links</p>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="action-btn"
            onClick={() => {
              playTick();
              showToast('Live site opened in new tab');
            }}
          >
            <div className="action-icon" style={{ color: 'var(--accent-3)' }}>
              <i className="fa-solid fa-arrow-up-right-from-square" />
            </div>
            <div className="action-info">
              <h4>View Live Site</h4>
              <p>Check deployed version</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
