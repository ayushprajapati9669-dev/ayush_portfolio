import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

export function ConfirmModal() {
  const { appState, confirmState, closeConfirmModal } = usePortfolio();
  if (!confirmState.open) return null;

  const ui = appState.uiLabels || {};

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        playTick();
        closeConfirmModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeConfirmModal]);

  const modalJSX = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playTick();
          closeConfirmModal();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0b1120] p-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Glow corner ambient */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-lg shadow-lg shadow-red-500/10">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="flex-grow">
            <p className="font-mono text-[11px] uppercase tracking-widest text-red-400 font-bold">
              {ui.confirmEyebrow || 'CONFIRM ACTION'}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-white">
              {confirmState.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              {confirmState.desc}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              playTick();
              closeConfirmModal();
            }}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            {ui.confirmCancel || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              playTick();
              const fn = confirmState.onConfirm;
              closeConfirmModal();
              if (fn) fn();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/25 hover:from-red-500 hover:to-red-400 transition-all active:scale-95"
          >
            <i className="fa-solid fa-trash-can text-[11px]" />
            <span>{ui.confirmAction || 'Delete Project'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
}
