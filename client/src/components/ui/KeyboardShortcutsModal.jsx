import React, { useEffect, useState } from 'react';
import { playTick } from '../../utils/audio';

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  const [open, setOpen] = useState(isOpen || false);

  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = () => {
      playTick();
      setOpen(true);
    };

    const handleKey = (e) => {
      const isInput =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) ||
        document.activeElement?.isContentEditable;

      // ? key: Open Keyboard Shortcuts anywhere
      if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleOpen();
      }

      // Esc key: Close shortcuts modal
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
        if (onClose) onClose();
      }
    };

    window.addEventListener('ams-open-shortcuts', handleOpen);
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('ams-open-shortcuts', handleOpen);
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  const handleClose = () => {
    playTick();
    setOpen(false);
    if (onClose) onClose();
  };

  if (!open) return null;

  const shortcutsList = [
    {
      category: 'Global & Navigation',
      items: [
        { keys: ['⌘K', 'Ctrl + K'], description: 'Open Command Palette & Global Search' },
        { keys: ['?'], description: 'Show Keyboard Shortcuts Cheat Sheet' },
        { keys: ['F'], description: 'Toggle Focus Mode & Fullscreen' },
        { keys: ['Ctrl + ~'], description: 'Toggle Developer CLI Terminal' },
        { keys: ['Esc'], description: 'Close active modal, drawer, or palette' }
      ]
    },
    {
      category: 'Admin Studio Navigation',
      items: [
        { keys: ['1'], description: 'Overview Dashboard' },
        { keys: ['2'], description: 'Projects CMS' },
        { keys: ['3'], description: 'Certificates CMS' },
        { keys: ['4'], description: 'Skills CMS' },
        { keys: ['5'], description: 'Milestones & Journey CMS' },
        { keys: ['6'], description: 'Messages & Contact Inquiries' },
        { keys: ['7'], description: 'Appearance & Theme Studio' },
        { keys: ['8'], description: 'Visitor Telemetry & Analytics' },
        { keys: ['9'], description: 'Site Settings' }
      ]
    },
    {
      category: 'Power Actions',
      items: [
        { keys: ['Shift + Click'], description: 'Multi-select range in CMS tables' },
        { keys: ['Enter'], description: 'Confirm primary action / execute command' },
        { keys: ['Tab'], description: 'Cycle through filter tabs in Command Palette' }
      ]
    }
  ];

  return (
    <div
      id="keyboard-shortcuts-modal"
      className="keyboard-shortcuts-backdrop fixed inset-0 z-[10000000] flex items-center justify-center p-4 pt-20 md:pt-24 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl text-white space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <i className="fa-solid fa-keyboard text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white m-0">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400 font-mono m-0">Fast keyboard navigation for power users & administrators</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close shortcuts dialog"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Shortcuts Categories */}
        <div className="space-y-6">
          {shortcutsList.map((cat) => (
            <div key={cat.category} className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-yellow-400/90 font-semibold">
                {cat.category}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-xs text-slate-200">{item.description}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 text-[11px] font-mono font-medium rounded-md bg-white/10 border border-white/15 text-yellow-300 shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Esc</kbd> anytime to dismiss</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg border border-white/15 bg-white/10 hover:bg-white/20 text-white font-sans text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;
