import React from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';

export function Toast() {
  const { toastData, toastMessage, hideToast } = usePortfolio();
  const currentMsg = toastData?.message || toastMessage;
  if (!currentMsg) return null;

  const type = toastData?.type || 'info';

  const typeConfig = {
    success: {
      badgeText: 'Success',
      borderClass: 'border-sage/40 shadow-sage/10',
      badgeClass: 'border-sage/30 bg-sage/10 text-sage',
      icon: (
        <svg className="h-5 w-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      badgeText: 'Alert',
      borderClass: 'border-vermilion/50 shadow-vermilion/10',
      badgeClass: 'border-vermilion/30 bg-vermilion/10 text-vermilion',
      icon: (
        <svg className="h-5 w-5 text-vermilion" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      badgeText: 'Notice',
      borderClass: 'border-cyanglow/40 shadow-cyanglow/10',
      badgeClass: 'border-cyanglow/30 bg-cyanglow/10 text-cyanglow',
      icon: (
        <svg className="h-5 w-5 text-cyanglow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const currentCfg = typeConfig[type] || typeConfig.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-3 duration-300 rounded-2xl border ${currentCfg.borderClass} bg-charcoal/95 px-4 py-3.5 text-alabaster shadow-2xl backdrop-blur-xl`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{currentCfg.icon}</div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className={`inline-block font-mono text-[10px] font-semibold uppercase tracking-wider rounded-md border px-1.5 py-0.5 ${currentCfg.badgeClass}`}>
              {currentCfg.badgeText}
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-alabaster break-words">
            {currentMsg}
          </p>
        </div>
        <button
          type="button"
          onClick={hideToast}
          aria-label="Close notification"
          className="shrink-0 ml-1 rounded-lg p-1 text-stonewarm hover:text-alabaster hover:bg-white/10 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
