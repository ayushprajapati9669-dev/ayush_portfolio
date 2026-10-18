import React from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';

export function Toast() {
  const { toastMessage, hideToast } = usePortfolio();
  if (!toastMessage) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-cyanglow/40 bg-charcoal/95 px-4 py-3.5 text-sm text-alabaster shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="leading-snug font-medium">{toastMessage}</p>
        <button
          type="button"
          onClick={hideToast}
          className="font-mono text-xs text-stonewarm hover:text-alabaster"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
