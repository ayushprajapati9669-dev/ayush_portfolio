import React from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';

export function ConfirmModal() {
  const { appState, confirmState, closeConfirmModal } = usePortfolio();
  if (!confirmState.open) return null;

  const ui = appState.uiLabels || {};

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-charcoal p-6 shadow-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-vermilion">
          {ui.confirmEyebrow || 'Confirm Action'}
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-alabaster">{confirmState.title}</h3>
        <p className="mt-2 text-sm text-stonewarm">{confirmState.desc}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeConfirmModal}
            className="focus-ring rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-alabaster hover:bg-graphite"
          >
            {ui.confirmCancel || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              const fn = confirmState.onConfirm;
              closeConfirmModal();
              if (fn) fn();
            }}
            className="focus-ring rounded-xl bg-vermilion px-4 py-2 text-xs font-semibold text-obsidian hover:opacity-90"
          >
            {ui.confirmAction || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
