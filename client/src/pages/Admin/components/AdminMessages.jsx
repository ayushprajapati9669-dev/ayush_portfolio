import React, { useState } from 'react';
import { playTick } from '../../../utils/audio';

export function AdminMessages({
  appState,
  updateAppState,
  session,
  showToast,
  openConfirmModal
}) {
  const [filter, setFilter] = useState('all');
  const messages = appState.messages || [];

  const handleToggleStatus = (msgId, nextStatus) => {
    playTick();
    updateAppState((prev) => ({
      ...prev,
      messages: (prev.messages || []).map((m) =>
        m.id === msgId ? { ...m, status: nextStatus } : m
      )
    }), session.token);
    showToast(`Marked as ${nextStatus}.`);
  };

  const handleDelete = (msg) => {
    playTick();
    openConfirmModal(
      'Delete Message',
      `Are you sure you want to delete the message from "${msg.name || msg.email}"?`,
      () => {
        updateAppState((prev) => ({
          ...prev,
          messages: (prev.messages || []).filter((m) => m.id !== msg.id)
        }), session.token);
        showToast('Message deleted.');
      }
    );
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread') return m.status === 'unread';
    if (filter === 'read') return m.status === 'read';
    if (filter === 'replied') return m.status === 'replied';
    return true;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="space-y-8">
      <div className="glass-card-admin p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fa-regular fa-envelope text-orange-400" />
              <span>Inbox & Contact Messages ({messages.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and manage incoming communications sent via your portfolio contact form.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: `All (${messages.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'read', label: 'Read' },
              { id: 'replied', label: 'Replied' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-chip ${filter === f.id ? 'active' : ''}`}
                onClick={() => {
                  playTick();
                  setFilter(f.id);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="text-center py-14 text-slate-500 font-mono text-xs">
            <i className="fa-regular fa-envelope-open text-3xl mb-3 block opacity-30" />
            No messages found in this category.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((m) => {
              const isUnread = m.status === 'unread';
              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border p-5 space-y-3 transition-all ${
                    isUnread
                      ? 'border-orange-500/40 bg-orange-500/5'
                      : 'border-white/10 bg-black/30'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center font-bold text-black text-xs">
                        {(m.name || 'V')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{m.name || 'Anonymous'}</span>
                          <span className="font-mono text-xs text-slate-400 font-normal">
                            &lt;{m.email}&gt;
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {m.createdAt ? new Date(m.createdAt).toLocaleString() : 'Recent'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          m.status === 'replied'
                            ? 'success'
                            : isUnread
                            ? 'warn'
                            : 'info'
                        }`}
                      >
                        {m.status || 'unread'}
                      </span>
                    </div>
                  </div>

                  {m.subject && (
                    <div className="text-xs font-semibold text-cyan-300">
                      Subject: {m.subject}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/40 p-3 rounded-xl border border-white/5">
                    {m.message}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Portfolio Inquiry')}`}
                        onClick={() => {
                          playTick();
                          handleToggleStatus(m.id, 'replied');
                        }}
                        className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-reply text-xs" />
                        <span>Reply via Email</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(m.id, isUnread ? 'read' : 'unread')}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        {isUnread ? 'Mark as Read' : 'Mark as Unread'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMessages;
