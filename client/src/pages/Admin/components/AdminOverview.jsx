import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
  const recentActivityRef = useRef(null);
  const quickActionsRef = useRef(null);
  const activityListRef = useRef(null);

  const projects = appState.projects || [];
  const certificates = appState.certificates || [];
  const messages = appState.messages || [];

  const publishedCount = projects.filter((p) => p.status === 'published').length;
  const certCount = certificates.length;
  const unreadMsgCount = messages.filter((m) => m.status === 'unread').length;

  // ScrollTrigger & GSAP Entrance Animations (matching reference HTML file)
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (_e) {}

    const ctx = gsap.context(() => {
      // 1. Stat cards entrance stagger with ScrollTrigger
      if (statsGridRef.current) {
        const cards = statsGridRef.current.querySelectorAll('.stat-card');
        gsap.from(cards, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.2)',
          delay: 0.15,
          clearProps: 'all',
          scrollTrigger: {
            trigger: statsGridRef.current,
            start: 'top 92%',
            toggleActions: 'play none none none'
          }
        });
      }

      // 2. Recent Activity glass card entrance with ScrollTrigger
      if (recentActivityRef.current) {
        gsap.from(recentActivityRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: recentActivityRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      }

      // 3. Quick Actions glass card entrance with ScrollTrigger
      if (quickActionsRef.current) {
        gsap.from(quickActionsRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: quickActionsRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      }
    });

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  // 3D Card Hover Physics
  const handleCardMouseMove = (e) => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -8;
    const rotateY = ((x - rect.width / 2) / rect.width) * 8;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)'
    });
  };

  // Animate activity items when filters change or more items are loaded
  useEffect(() => {
    if (activityListRef.current) {
      const items = activityListRef.current.querySelectorAll('.activity-item');
      if (items.length > 0) {
        gsap.from(items, {
          opacity: 0,
          y: 10,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }
    }
  }, [activeFilter, visibleCount]);

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
    setTimeout(() => {
      if (activityListRef.current) {
        activityListRef.current.scrollBy({ top: 110, behavior: 'smooth' });
      }
      try {
        ScrollTrigger.refresh();
      } catch (_e) {}
    }, 120);
  };

  const handleShowLess = () => {
    playTick();
    setVisibleCount(4);
    if (activityListRef.current) {
      activityListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (_e) {}
    }, 120);
  };

  return (
    <div className="space-y-8">
      {/* 4 STATS CARDS */}
      <div className="stats-grid scroll-reveal" ref={statsGridRef}>
        {/* Card 1: Live Projects */}
        <div
          className="stat-card"
          onClick={() => {
            playTick();
            onSelectTab('projects');
          }}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
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
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
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
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
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
        <div
          className="stat-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
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
      <div className="glass-card-admin scroll-reveal" ref={recentActivityRef}>
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
        <div className="activity-list" ref={activityListRef}>
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

        {/* Load More & Show Less Controls */}
        <div className="load-more-wrap">
          {canLoadMore ? (
            <button
              type="button"
              className="load-more-btn"
              onClick={handleLoadMore}
            >
              <span>Load more</span>
              <i className="fa-solid fa-chevron-down" />
            </button>
          ) : (
            <span className="activity-all-loaded-pill">
              <i className="fa-solid fa-check-circle" style={{ color: 'var(--accent-2)' }} />
              <span>All activity loaded ({filteredActivities.length})</span>
            </span>
          )}

          {visibleCount > 4 && (
            <button
              type="button"
              className="load-more-btn show-less-btn"
              onClick={handleShowLess}
              title="Collapse to 4 items"
            >
              <span>Show less</span>
              <i className="fa-solid fa-chevron-up" />
            </button>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="glass-card-admin scroll-reveal" ref={quickActionsRef} style={{ padding: '24px' }}>
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
