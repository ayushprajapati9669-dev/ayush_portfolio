import React, { useState, useRef, useEffect, useMemo } from 'react';
import { playTick } from '../../../utils/audio';

// Pre-crafted fast response templates for client inquiries
const QUICK_TEMPLATES = [
  {
    id: 'call',
    label: '📅 Schedule Call',
    icon: 'fa-calendar',
    getText: (name) =>
      `Hi ${name || 'there'},\n\nThank you for reaching out! I would love to connect and discuss your project in detail.\n\nFeel free to choose a time that works best for you on my calendar:\nhttps://calendly.com/ayushprajapati\n\nLooking forward to speaking with you!\n\nBest regards,\nAyush Prajapati`
  },
  {
    id: 'ack',
    label: '👋 Quick Acknowledgment',
    icon: 'fa-hand',
    getText: (name, subject) =>
      `Hi ${name || 'there'},\n\nThank you for getting in touch regarding ${subject || 'your inquiry'}.\n\nI have received your message and am reviewing the details. I will get back to you with complete information within 24 hours.\n\nBest regards,\nAyush Prajapati`
  },
  {
    id: 'collab',
    label: '🚀 Project Collaboration',
    icon: 'fa-rocket',
    getText: (name) =>
      `Hi ${name || 'there'},\n\nThank you for your message! This project sounds exciting and aligns well with my full-stack engineering expertise.\n\nCould you please share your target timeline and preferred tech stack or repository details? That will help us get started quickly.\n\nBest regards,\nAyush Prajapati`
  },
  {
    id: 'specs',
    label: '📄 Request Details',
    icon: 'fa-file-lines',
    getText: (name) =>
      `Hi ${name || 'there'},\n\nThanks for reaching out! To provide an accurate estimate and architectural plan, could you please share any existing wireframes, documentation, or core feature requirements?\n\nLooking forward to hearing from you!\n\nBest regards,\nAyush Prajapati`
  }
];

export function AdminMessages({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal
}) {
  const messages = appState.messages || [];
  const [activeMailId, setActiveMailId] = useState(() => messages[0]?.id || null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'replied' | 'starred'
  const [searchQuery, setSearchQuery] = useState('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(380);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail' for mobile screens
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetId: null });

  const isResizingRef = useRef(false);
  const searchInputRef = useRef(null);
  const splitContainerRef = useRef(null);

  // Auto select first mail if none selected or deleted
  useEffect(() => {
    if (!activeMailId && messages.length > 0) {
      setActiveMailId(messages[0].id);
    } else if (activeMailId && !messages.some((m) => m.id === activeMailId)) {
      setActiveMailId(messages[0]?.id || null);
    }
  }, [messages, activeMailId]);

  // Keyboard shortcut listener (⌘K for search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleDocClick = () => {
      setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  // KPI Statistics
  const totalCount = messages.length;
  const unreadCount = useMemo(() => messages.filter((m) => m.status === 'unread').length, [messages]);
  const repliedCount = useMemo(
    () => messages.filter((m) => m.status === 'replied' || (Array.isArray(m.replies) && m.replies.length > 0)).length,
    [messages]
  );
  const starredCount = useMemo(() => messages.filter((m) => Boolean(m.starred)).length, [messages]);
  const responseRate = useMemo(() => {
    if (totalCount === 0) return 100;
    return Math.round((repliedCount / totalCount) * 100);
  }, [totalCount, repliedCount]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.subject || '').toLowerCase().includes(q) ||
        (m.message || '').toLowerCase().includes(q);

      let matchFilter = true;
      if (filter === 'unread') matchFilter = m.status === 'unread';
      else if (filter === 'replied') matchFilter = m.status === 'replied' || (Array.isArray(m.replies) && m.replies.length > 0);
      else if (filter === 'starred') matchFilter = Boolean(m.starred);

      return matchSearch && matchFilter;
    });
  }, [messages, filter, searchQuery]);

  // Group messages by Date (Today, Yesterday, Older)
  const groupedMessages = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const groups = { Today: [], Yesterday: [], Older: [] };

    filteredMessages.forEach((m) => {
      const mDate = m.createdAt ? new Date(m.createdAt) : now;
      const mDateStr = mDate.toDateString();
      if (mDateStr === todayStr) {
        groups.Today.push(m);
      } else if (mDateStr === yesterdayStr) {
        groups.Yesterday.push(m);
      } else {
        groups.Older.push(m);
      }
    });

    return Object.entries(groups).filter(([_, list]) => list.length > 0);
  }, [filteredMessages]);

  const activeMail = useMemo(() => {
    return messages.find((m) => m.id === activeMailId) || null;
  }, [messages, activeMailId]);

  // Selection & Read handlers
  const handleSelectMail = (id) => {
    playTick();
    setActiveMailId(id);
    setMobileView('detail');
    const target = messages.find((m) => m.id === id);
    if (target && target.status === 'unread') {
      updateAppState(
        (prev) => ({
          ...prev,
          messages: (prev.messages || []).map((m) =>
            m.id === id ? { ...m, status: 'read' } : m
          )
        }),
        session?.token
      );
    }
  };

  const handleToggleStatus = (msgId, nextStatus) => {
    playTick();
    updateAppState(
      (prev) => ({
        ...prev,
        messages: (prev.messages || []).map((m) =>
          m.id === msgId ? { ...m, status: nextStatus } : m
        )
      }),
      session?.token
    );
    showToast(`Marked as ${nextStatus}.`, 'fa-check');
  };

  const handleToggleStar = (e, msgId) => {
    e.stopPropagation();
    playTick();
    updateAppState(
      (prev) => ({
        ...prev,
        messages: (prev.messages || []).map((m) =>
          m.id === msgId ? { ...m, starred: !m.starred } : m
        )
      }),
      session?.token
    );
    showToast('Updated star bookmark.', 'fa-star');
  };

  const handleMarkAllRead = () => {
    playTick();
    updateAppState(
      (prev) => ({
        ...prev,
        messages: (prev.messages || []).map((m) => ({ ...m, status: 'read' }))
      }),
      session?.token
    );
    showToast('All messages marked as read.', 'fa-check-double');
  };

  const handleExportMessages = () => {
    playTick();
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(messages, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `portfolio_messages_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported messages to JSON file.', 'fa-download');
    } catch (e) {
      showToast('Could not export messages.', 'fa-circle-exclamation');
    }
  };

  const handleDelete = (msgId) => {
    playTick();
    const target = messages.find((m) => m.id === msgId);
    if (!target) return;
    openConfirmModal(
      'Delete Message',
      `Are you sure you want to delete the message from "${target.name || target.email}"?`,
      () => {
        updateAppState(
          (prev) => ({
            ...prev,
            messages: (prev.messages || []).filter((m) => m.id !== msgId)
          }),
          session?.token
        );
        if (activeMailId === msgId) {
          const remaining = messages.filter((m) => m.id !== msgId);
          setActiveMailId(remaining[0]?.id || null);
        }
        showToast('Message deleted.', 'fa-trash-can');
      }
    );
  };

  const handleQuickDelete = (e, msgId) => {
    e.stopPropagation();
    playTick();
    updateAppState(
      (prev) => ({
        ...prev,
        messages: (prev.messages || []).filter((m) => m.id !== msgId)
      }),
      session?.token
    );
    if (activeMailId === msgId) {
      const remaining = messages.filter((m) => m.id !== msgId);
      setActiveMailId(remaining[0]?.id || null);
    }
    showToast('Message deleted.', 'fa-trash-can');
  };

  const handleQuickRead = (e, msgId) => {
    e.stopPropagation();
    playTick();
    const target = messages.find((m) => m.id === msgId);
    const nextStatus = target?.status === 'unread' ? 'read' : 'unread';
    updateAppState(
      (prev) => ({
        ...prev,
        messages: (prev.messages || []).map((m) =>
          m.id === msgId ? { ...m, status: nextStatus } : m
        )
      }),
      session?.token
    );
    showToast(`Marked as ${nextStatus}.`, 'fa-check');
  };

  // Reply submission
  const handleSendReply = () => {
    const text = replyText.trim();
    if (!text || !activeMail) return;
    playTick();
    setIsSendingReply(true);

    setTimeout(() => {
      const newReply = {
        id: `reply-${Date.now()}`,
        sender: 'You (Admin)',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
      };

      updateAppState(
        (prev) => ({
          ...prev,
          messages: (prev.messages || []).map((m) =>
            m.id === activeMail.id
              ? {
                  ...m,
                  status: 'replied',
                  replies: [...(m.replies || []), newReply]
                }
              : m
          )
        }),
        session?.token
      );

      setReplyText('');
      setIsSendingReply(false);
      showToast('Reply dispatched & logged in message thread!', 'fa-paper-plane');
    }, 500);
  };

  // Quick Template insertion
  const handleInsertTemplate = (tmpl) => {
    playTick();
    if (!activeMail) return;
    const filled = tmpl.getText(activeMail.name, activeMail.subject);
    setReplyText(filled);
    showToast(`Template "${tmpl.label}" applied!`, 'fa-pen');
  };

  // Context Menu
  const handleContextMenu = (e, msgId) => {
    e.preventDefault();
    playTick();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 150);
    setContextMenu({ visible: true, x, y, targetId: msgId });
  };

  const handleContextAction = (action) => {
    const id = contextMenu.targetId;
    setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    if (!id) return;

    if (action === 'read') {
      handleToggleStatus(id, 'read');
    } else if (action === 'unread') {
      handleToggleStatus(id, 'unread');
    } else if (action === 'star') {
      handleToggleStar({ stopPropagation: () => {} }, id);
    } else if (action === 'delete') {
      handleDelete(id);
    }
  };

  // Drag resizer
  const handleMouseDownResize = (e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current || !splitContainerRef.current) return;
      const containerLeft = splitContainerRef.current.getBoundingClientRect().left;
      const pointerOffset = moveEvent.clientX - containerLeft;
      if (pointerOffset >= 280 && pointerOffset <= 600) {
        setLeftPanelWidth(pointerOffset);
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Helper avatar colors
  const getAvatarColor = (name = '') => {
    const colors = [
      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'bg-pink-500/20 text-pink-400 border-pink-500/30'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div className="space-y-6 flex flex-col min-h-[700px]">
      {/* 1. Top KPI Stat Cards (Matching AdminProjects & AdminMilestones) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total Inquiries */}
        <div className="bg-[#0b1322]/90 border border-white/[0.08] hover:border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between transition-all shadow-sm group">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1 group-hover:text-cyan-400/80 transition-colors">
              TOTAL INQUIRIES
            </div>
            <div className="text-3xl font-bold font-display text-white">
              {totalCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <i className="fa-solid fa-inbox text-xl text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]" />
          </div>
        </div>

        {/* Action Required / Unread */}
        <div className="bg-[#0b1322]/90 border border-white/[0.08] hover:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all shadow-sm group">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1 group-hover:text-amber-400/80 transition-colors">
              ACTION REQUIRED
            </div>
            <div className="text-3xl font-bold font-display text-amber-400 flex items-center gap-2">
              <span>{unreadCount}</span>
              {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <i className="fa-solid fa-envelope-open-text text-xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
          </div>
        </div>

        {/* Replied Threads */}
        <div className="bg-[#0b1322]/90 border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between transition-all shadow-sm group">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1 group-hover:text-emerald-400/80 transition-colors">
              REPLIED THREADS
            </div>
            <div className="text-3xl font-bold font-display text-emerald-400">
              {repliedCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <i className="fa-solid fa-paper-plane text-xl text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
          </div>
        </div>

        {/* Response Rate */}
        <div className="bg-[#0b1322]/90 border border-white/[0.08] hover:border-purple-500/30 rounded-2xl p-4 flex items-center justify-between transition-all shadow-sm group">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1 group-hover:text-purple-400/80 transition-colors">
              RESPONSE RATE
            </div>
            <div className="text-3xl font-bold font-display text-purple-400">
              {responseRate}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <i className="fa-solid fa-bolt text-xl text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.4)]" />
          </div>
        </div>
      </div>

      {/* 2. Top Action Banner */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: 'var(--brand-color, #06b6d4)' }}>
            <i className="fa-solid fa-inbox" /> COMMUNICATIONS &amp; CLIENT INQUIRIES
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Inbox Workspace</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive split-view reader &amp; reply center for portfolio inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export JSON Button */}
          <button
            type="button"
            onClick={handleExportMessages}
            className="px-3 py-1.5 rounded-xl bg-[#0c1424] border border-white/10 hover:border-white/20 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
            title="Export messages to JSON"
          >
            <i className="fa-solid fa-file-export text-cyan-400 text-xs" />
            <span>Export</span>
          </button>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 rounded-xl bg-[#0c1424] border border-white/10 hover:border-white/20 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
              title="Mark all as read"
            >
              <i className="fa-solid fa-check-double text-emerald-400 text-xs" />
              <span>Mark All Read</span>
            </button>
          )}

          {/* Search Input (⌘K) */}
          <div className="relative flex items-center">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages (⌘K)..."
              className="w-48 sm:w-60 bg-black/40 border border-white/10 rounded-xl pl-8 pr-12 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all font-sans"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* 3. Split-View Container */}
      <div
        ref={splitContainerRef}
        className="flex-1 flex overflow-hidden rounded-2xl border border-white/10 bg-[#080d17]/80 backdrop-blur-xl shadow-2xl relative min-h-[580px] h-[calc(100vh-280px)]"
      >
        {/* =========================================================================
            LEFT PANEL: Message List with Filter Tabs & Date Groups
            ========================================================================= */}
        <div
          className={`flex flex-col bg-[#070c14]/90 border-r border-white/5 overflow-hidden shrink-0 relative transition-all ${
            mobileView === 'detail' ? 'hidden md:flex' : 'flex w-full md:w-auto'
          }`}
          style={{ width: window.innerWidth >= 768 ? `${leftPanelWidth}px` : '100%' }}
        >
          {/* Inbox Filter Header */}
          <div className="p-3 border-b border-white/10 bg-[#070c14]/95 flex items-center justify-between gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">Inbox</span>
              {unreadCount > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(6,182,212,0.15)',
                    color: 'var(--brand-color, #06b6d4)',
                    border: '1px solid rgba(6,182,212,0.3)'
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Filter Toggle Pills */}
            <div className="flex items-center rounded-lg bg-black/40 border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => { playTick(); setFilter('all'); }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => { playTick(); setFilter('unread'); }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filter === 'unread'
                    ? 'bg-white/10 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={filter === 'unread' ? { color: 'var(--brand-color, #06b6d4)' } : undefined}
              >
                Unread ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => { playTick(); setFilter('replied'); }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filter === 'replied'
                    ? 'bg-white/10 text-emerald-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Replied ({repliedCount})
              </button>
              <button
                type="button"
                onClick={() => { playTick(); setFilter('starred'); }}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filter === 'starred'
                    ? 'bg-white/10 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Starred inquiries"
              >
                <i className="fa-solid fa-star text-[10px]" /> ({starredCount})
              </button>
            </div>
          </div>

          {/* Mail List Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {groupedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                <i className="fa-regular fa-envelope-open text-3xl mb-2 opacity-40" />
                <p className="text-xs">No messages match your search or filters.</p>
              </div>
            ) : (
              groupedMessages.map(([groupName, groupItems]) => (
                <div key={groupName}>
                  {/* Sticky Date Group Header */}
                  <div className="sticky top-0 z-10 px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-[#070c14]/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
                    <span>{groupName}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{groupItems.length}</span>
                  </div>

                  {/* Mail Item Cards */}
                  {groupItems.map((m) => {
                    const isActive = m.id === activeMailId;
                    const isUnread = m.status === 'unread';
                    const isReplied = m.status === 'replied' || (Array.isArray(m.replies) && m.replies.length > 0);
                    const isStarred = Boolean(m.starred);
                    const avatarStyle = getAvatarColor(m.name || m.email);

                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMail(m.id)}
                        onContextMenu={(e) => handleContextMenu(e, m.id)}
                        className={`group relative p-3.5 border-b border-white/5 flex gap-3 cursor-pointer transition-all ${
                          isActive
                            ? 'bg-white/[0.07]'
                            : 'hover:bg-white/[0.03]'
                        }`}
                        style={isActive ? { borderLeft: '3px solid var(--brand-color, #06b6d4)' } : { borderLeft: '3px solid transparent' }}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${avatarStyle} relative`}
                        >
                          {(m.name || m.email || 'A')[0].toUpperCase()}
                          {isStarred && (
                            <i className="fa-solid fa-star text-[9px] text-amber-400 absolute -top-1 -right-1 drop-shadow" />
                          )}
                        </div>

                        {/* Text details */}
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5 truncate">
                              {isUnread && (
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: 'var(--brand-color, #06b6d4)',
                                    boxShadow: '0 0 8px var(--brand-glow, rgba(6,182,212,0.8))'
                                  }}
                                />
                              )}
                              <h4
                                className={`text-xs truncate ${
                                  isUnread ? 'font-bold text-white' : 'font-medium text-slate-300'
                                }`}
                              >
                                {m.name || 'Anonymous'}
                              </h4>
                            </div>
                            <span
                              className={`text-[10px] shrink-0 ml-2 font-mono ${
                                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-500'
                              }`}
                            >
                              {m.createdAt
                                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Recent'}
                            </span>
                          </div>

                          <p
                            className={`text-xs truncate mb-1 ${
                              isUnread ? 'text-white font-semibold' : 'text-slate-300 font-normal'
                            }`}
                          >
                            {m.subject || 'Portfolio Inquiry'}
                          </p>

                          <p className="text-[11px] text-slate-400 truncate">
                            {(m.message || '').replace(/\n/g, ' ')}
                          </p>

                          {/* Status badges */}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {isReplied && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <i className="fa-solid fa-paper-plane text-[8px]" /> Replied
                              </span>
                            )}
                            {isUnread && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                                New
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions Hover Strip */}
                        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#070c14]/95 backdrop-blur-md border border-white/10 rounded-lg p-0.5 shadow-md">
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(e, m.id)}
                            className="w-5 h-5 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 flex items-center justify-center text-[10px] transition-colors"
                            title={isStarred ? 'Unstar' : 'Star message'}
                          >
                            <i className={`fa-${isStarred ? 'solid text-amber-400' : 'regular'} fa-star`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickRead(e, m.id)}
                            className="w-5 h-5 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 flex items-center justify-center text-[9px] transition-colors"
                            title={isUnread ? 'Mark as read' : 'Mark as unread'}
                          >
                            <i className="fa-solid fa-check" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickDelete(e, m.id)}
                            className="w-5 h-5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center text-[9px] transition-colors"
                            title="Delete"
                          >
                            <i className="fa-regular fa-trash-can" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resizer Divider Bar */}
        <div
          onMouseDown={handleMouseDownResize}
          className="hidden md:flex w-1.5 hover:w-2 bg-transparent hover:bg-cyan-500/20 active:bg-cyan-500/40 cursor-col-resize transition-all relative z-20 items-center justify-center shrink-0"
          title="Drag to resize panels"
        >
          <div className="w-0.5 h-6 bg-white/20 rounded-full" />
        </div>

        {/* =========================================================================
            RIGHT PANEL: Message Reader View & Interactive Reply Thread
            ========================================================================= */}
        <div
          className={`flex-1 bg-[#0a111c] flex flex-col overflow-hidden relative ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex w-full'
          }`}
        >
          {!activeMail ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <i className="fa-regular fa-envelope-open text-2xl text-slate-600" />
              </div>
              <h3 className="text-white font-medium text-sm">No message selected</h3>
              <p className="text-xs text-slate-400 mt-1">Select an inquiry from the left to view the thread.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-200">
              {/* Reader Header Actions */}
              <div className="h-14 px-4 sm:px-6 border-b border-white/10 flex items-center justify-between bg-[#080d17]/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => { playTick(); setMobileView('list'); }}
                    className="md:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center text-xs mr-1"
                    title="Back to Messages List"
                  >
                    <i className="fa-solid fa-arrow-left" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleToggleStar(e, activeMail.id)}
                    className="w-8 h-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-400 flex items-center justify-center text-slate-400 transition-colors border border-transparent hover:border-amber-500/20"
                    title={activeMail.starred ? 'Starred' : 'Star message'}
                  >
                    <i className={`fa-${activeMail.starred ? 'solid text-amber-400' : 'regular'} fa-star text-xs`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(activeMail.id, activeMail.status === 'unread' ? 'read' : 'unread')}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                    title={activeMail.status === 'unread' ? 'Mark as read' : 'Mark as unread'}
                  >
                    <i className="fa-regular fa-envelope text-xs" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(activeMail.id)}
                    className="w-8 h-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors border border-transparent hover:border-rose-500/20"
                    title="Delete Message"
                  >
                    <i className="fa-regular fa-trash-can text-xs" />
                  </button>

                  <a
                    href={`mailto:${activeMail.email}?subject=Re: ${encodeURIComponent(activeMail.subject || 'Portfolio Inquiry')}`}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                    <span>Open in Mail</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      activeMail.status === 'replied'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : activeMail.status === 'unread'
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeMail.status === 'replied'
                          ? 'bg-emerald-400'
                          : activeMail.status === 'unread'
                          ? 'bg-cyan-400'
                          : 'bg-slate-400'
                      }`}
                    />
                    {activeMail.status ? activeMail.status.toUpperCase() : 'READ'}
                  </span>
                </div>
              </div>

              {/* Reader Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 custom-scrollbar space-y-6">
                {/* Subject Title */}
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeMail.subject || 'Portfolio Inquiry'}
                </h2>

                {/* Sender Details Row */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm shrink-0 ${getAvatarColor(
                        activeMail.name || activeMail.email
                      )}`}
                    >
                      {(activeMail.name || activeMail.email || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{activeMail.name || 'Anonymous Sender'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        &lt;{activeMail.email}&gt;
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400 font-mono">
                      {activeMail.createdAt
                        ? new Date(activeMail.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })
                        : 'Recent'}
                    </p>
                  </div>
                </div>

                {/* Message Body Content */}
                <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-cyan-500/40 py-1 bg-white/[0.01] rounded-r-lg">
                  {activeMail.message}
                </div>

                {/* Reply Thread (Displays past replies) */}
                {Array.isArray(activeMail.replies) && activeMail.replies.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                      Conversation History ({activeMail.replies.length})
                    </span>
                    {activeMail.replies.map((reply, rIdx) => (
                      <div
                        key={reply.id || rIdx}
                        className="rounded-xl border border-white/10 bg-[#070c14]/90 p-4 space-y-1.5 relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-cyan-300">{reply.sender}</span>
                          <span className="font-mono text-[10px] text-slate-500">{reply.time || reply.date}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pl-1 whitespace-pre-wrap">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fast Template Response Chips */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <i className="fa-solid fa-wand-magic-sparkles text-cyan-400" />
                    <span>Quick Response Templates</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleInsertTemplate(tmpl)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white text-[11px] font-medium transition-all"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Reply Box (⌘ + Enter to Send) */}
                <div className="pt-1">
                  <div className="rounded-xl border border-white/15 bg-[#070c14] overflow-hidden focus-within:border-cyan-400/60 focus-within:ring-1 focus-within:ring-cyan-400/60 transition-all shadow-inner">
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder="Write your reply to this inquiry..."
                      className="w-full bg-transparent p-4 text-xs text-white placeholder-slate-500 outline-none resize-none leading-relaxed font-sans"
                    />

                    <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <i className="fa-regular fa-keyboard text-[9px]" /> Press ⌘ + Enter to dispatch
                      </span>
                      <button
                        type="button"
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSendingReply}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-black font-bold text-xs transition-all shadow-md cursor-pointer hover:opacity-95 disabled:opacity-40"
                        style={{
                          backgroundColor: 'var(--brand-color, #06b6d4)',
                          boxShadow: '0 4px 15px var(--brand-glow, rgba(6,182,212,0.3))'
                        }}
                      >
                        {isSendingReply ? (
                          <>
                            <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Reply</span>
                            <i className="fa-solid fa-paper-plane text-[10px]" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Context Menu on Right Click */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-[#0a111c] border border-white/15 rounded-xl shadow-2xl p-1.5 w-48 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <button
            type="button"
            onClick={() => handleContextAction('read')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
          >
            <i className="fa-solid fa-check text-[10px] text-cyan-400 w-4" />
            <span>Mark as Read</span>
          </button>
          <button
            type="button"
            onClick={() => handleContextAction('unread')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
          >
            <i className="fa-regular fa-envelope text-[10px] text-amber-400 w-4" />
            <span>Mark as Unread</span>
          </button>
          <button
            type="button"
            onClick={() => handleContextAction('star')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
          >
            <i className="fa-solid fa-star text-[10px] text-amber-400 w-4" />
            <span>Toggle Star</span>
          </button>
          <div className="h-px bg-white/10 my-1" />
          <button
            type="button"
            onClick={() => handleContextAction('delete')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
          >
            <i className="fa-regular fa-trash-can text-[10px] w-4" />
            <span>Delete Message</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminMessages;
