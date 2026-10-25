import React, { useState, useRef, useEffect, useMemo } from 'react';
import { playTick } from '../../../utils/audio';

export function AdminMessages({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal
}) {
  const messages = appState.messages || [];
  const [activeMailId, setActiveMailId] = useState(() => messages[0]?.id || null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [searchQuery, setSearchQuery] = useState('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(380);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
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

      const matchFilter = filter === 'all' || m.status === 'unread';
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

  const unreadCount = useMemo(() => {
    return messages.filter((m) => m.status === 'unread').length;
  }, [messages]);

  // Selection & Read handlers
  const handleSelectMail = (id) => {
    playTick();
    setActiveMailId(id);
    const target = messages.find((m) => m.id === id);
    if (target && target.status === 'unread') {
      updateAppState((prev) => ({
        ...prev,
        messages: (prev.messages || []).map((m) =>
          m.id === id ? { ...m, status: 'read' } : m
        )
      }), session?.token);
    }
  };

  const handleToggleStatus = (msgId, nextStatus) => {
    playTick();
    updateAppState((prev) => ({
      ...prev,
      messages: (prev.messages || []).map((m) =>
        m.id === msgId ? { ...m, status: nextStatus } : m
      )
    }), session?.token);
    showToast(`Marked as ${nextStatus}.`, 'fa-check');
  };

  const handleDelete = (msgId) => {
    playTick();
    const target = messages.find((m) => m.id === msgId);
    if (!target) return;
    openConfirmModal(
      'Delete Message',
      `Are you sure you want to delete the message from "${target.name || target.email}"?`,
      () => {
        updateAppState((prev) => ({
          ...prev,
          messages: (prev.messages || []).filter((m) => m.id !== msgId)
        }), session?.token);
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
    updateAppState((prev) => ({
      ...prev,
      messages: (prev.messages || []).filter((m) => m.id !== msgId)
    }), session?.token);
    if (activeMailId === msgId) {
      const remaining = messages.filter((m) => m.id !== msgId);
      setActiveMailId(remaining[0]?.id || null);
    }
    showToast('Message deleted.', 'fa-trash-can');
  };

  const handleQuickRead = (e, msgId) => {
    e.stopPropagation();
    playTick();
    updateAppState((prev) => ({
      ...prev,
      messages: (prev.messages || []).map((m) =>
        m.id === msgId ? { ...m, status: 'read' } : m
      )
    }), session?.token);
    showToast('Marked as read.', 'fa-check');
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

      updateAppState((prev) => ({
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
      }), session?.token);

      setReplyText('');
      setIsSendingReply(false);
      showToast('Reply dispatched & logged in message thread!', 'fa-paper-plane');
    }, 600);
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
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
      {/* 0. Top Action Banner (Matching Projects & Certificates) */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: 'var(--brand-color, #06b6d4)' }}>
            <i className="fa-solid fa-inbox" /> COMMUNICATIONS & CLIENT INQUIRIES
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Inbox Workspace</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive split-view reader & reply center for portfolio inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input (⌘K) */}
          <div className="relative flex items-center">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages (⌘K)..."
              className="w-56 md:w-64 bg-black/40 border border-white/10 rounded-xl pl-8 pr-12 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-all font-sans"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Split-View Container */}
      <div
        ref={splitContainerRef}
        className="flex-1 flex overflow-hidden rounded-2xl border border-white/10 bg-[#080d17]/80 backdrop-blur-xl shadow-2xl relative"
      >
        {/* =========================================================================
            LEFT PANEL: Message List with Date Groups & Quick Actions
            ========================================================================= */}
        <div
          className="flex flex-col bg-[#070c14]/90 border-r border-white/5 overflow-hidden shrink-0 relative"
          style={{ width: `${leftPanelWidth}px` }}
        >
          {/* Inbox Filter Header */}
          <div className="p-3.5 border-b border-white/10 bg-[#070c14]/95 flex items-center justify-between gap-2 shrink-0">
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
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => { playTick(); setFilter('unread'); }}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filter === 'unread'
                    ? 'bg-white/10 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={filter === 'unread' ? { color: 'var(--brand-color, #06b6d4)' } : undefined}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Mail List Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {groupedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                <i className="fa-regular fa-envelope-open text-3xl mb-2 opacity-40" />
                <p className="text-xs">No messages match your search.</p>
              </div>
            ) : (
              groupedMessages.map(([groupName, groupItems]) => (
                <div key={groupName}>
                  {/* Sticky Date Group Header */}
                  <div className="sticky top-0 z-10 px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-[#070c14]/95 backdrop-blur-md border-b border-white/5">
                    {groupName}
                  </div>

                  {/* Mail Item Cards */}
                  {groupItems.map((m) => {
                    const isActive = m.id === activeMailId;
                    const isUnread = m.status === 'unread';
                    const avatarStyle = getAvatarColor(m.name || m.email);

                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMail(m.id)}
                        onContextMenu={(e) => handleContextMenu(e, m.id)}
                        className={`group relative p-3.5 border-b border-white/5 flex gap-3 cursor-pointer transition-all ${
                          isActive
                            ? 'bg-white/[0.06]'
                            : 'hover:bg-white/[0.03]'
                        }`}
                        style={isActive ? { borderLeft: '2px solid var(--brand-color, #06b6d4)' } : { borderLeft: '2px solid transparent' }}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${avatarStyle}`}
                        >
                          {(m.name || m.email || 'A')[0].toUpperCase()}
                        </div>

                        {/* Text details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5 truncate">
                              {isUnread && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
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
                              className={`text-[10px] shrink-0 ml-2 ${
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

                          <p className="text-[11px] text-slate-400 truncate pr-12">
                            {(m.message || '').replace(/\n/g, ' ')}
                          </p>
                        </div>

                        {/* Quick Actions Hover Strip */}
                        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#070c14]/90 backdrop-blur-md border border-white/10 rounded-lg p-0.5 shadow-md">
                          <button
                            type="button"
                            onClick={(e) => handleQuickDelete(e, m.id)}
                            className="w-5 h-5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center text-[9px] transition-colors"
                            title="Delete"
                          >
                            <i className="fa-regular fa-trash-can" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickRead(e, m.id)}
                            className="w-5 h-5 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 flex items-center justify-center text-[9px] transition-colors"
                            title={isUnread ? 'Mark as read' : 'Mark as unread'}
                          >
                            <i className="fa-solid fa-check" />
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
          className="w-1.5 hover:w-2 bg-transparent hover:bg-cyan-500/20 active:bg-cyan-500/40 cursor-col-resize transition-all relative z-20 flex items-center justify-center"
          title="Drag to resize panels"
        >
          <div className="w-0.5 h-6 bg-white/20 rounded-full" />
        </div>

        {/* =========================================================================
            RIGHT PANEL: Message Reader View & Interactive Reply Thread
            ========================================================================= */}
        <div className="flex-1 bg-[#0a111c] flex flex-col overflow-hidden relative">
          {!activeMail ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <i className="fa-regular fa-envelope-open text-2xl text-slate-600" />
              </div>
              <h3 className="text-white font-medium text-sm">No message selected</h3>
              <p className="text-xs text-slate-400 mt-1">Select an email to view the conversation thread.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-200">
              {/* Reader Header Actions */}
              <div className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-[#080d17]/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(activeMail.id)}
                    className="w-8 h-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors border border-transparent hover:border-rose-500/20"
                    title="Delete Message"
                  >
                    <i className="fa-regular fa-trash-can text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(activeMail.id, activeMail.status === 'unread' ? 'read' : 'unread')}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                    title={activeMail.status === 'unread' ? 'Mark as read' : 'Mark as unread'}
                  >
                    <i className="fa-regular fa-envelope text-xs" />
                  </button>
                  <a
                    href={`mailto:${activeMail.email}?subject=Re: ${encodeURIComponent(activeMail.subject || 'Portfolio Inquiry')}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                    <span>Open in Mail App</span>
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
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
                {/* Subject Title */}
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {activeMail.subject || 'Portfolio Inquiry'}
                </h2>

                {/* Sender Details Row */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm ${getAvatarColor(
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

                  <div className="text-right">
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
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pl-2 border-l border-white/10 py-1">
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

                {/* Interactive Reply Box (⌘ + Enter to Send) */}
                <div className="pt-4">
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
