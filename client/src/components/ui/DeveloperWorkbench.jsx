import React, { useState } from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { useLiveClock } from '../../hooks/useLiveClock';

export function DeveloperWorkbench() {
  const { appState, showToast } = usePortfolio();
  const clockText = useLiveClock();
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);

  const p = appState.profile || {};
  const ui = appState.uiLabels || {};
  const snippets = p.workbenchSnippets || [];
  const currentSnippet = snippets[activeTabIdx] || snippets[0] || {};
  const focusAreas = p.focusAreas || [];
  const currentFocus = focusAreas[focusIdx] || focusAreas[0] || {};

  const handleCopy = () => {
    if (!currentSnippet.code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentSnippet.code).then(() => {
        showToast(`Copied ${currentSnippet.filename} to clipboard`);
      }).catch(() => {
        showToast(`Copied ${currentSnippet.filename}`);
      });
    } else {
      showToast(`Copied ${currentSnippet.filename}`);
    }
  };

  return (
    <div className="flex flex-col justify-between space-y-4">
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b hairline-border bg-obsidian/80 px-3.5 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-vermilion/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amberwarm/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-sage/80" />
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            {snippets.map((s, idx) => (
              <button
                key={s.id || idx}
                type="button"
                onClick={() => {
                  setActiveTabIdx(idx);
                  setShowOutput(false);
                }}
                className={`focus-ring rounded-md px-2 py-1 transition-colors ${
                  idx === activeTabIdx
                    ? 'bg-vermilion text-obsidian font-bold'
                    : 'text-stonewarm hover:text-alabaster'
                }`}
              >
                {s.filename}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 font-mono text-[11px] leading-relaxed bg-obsidian/50 min-h-[195px] flex flex-col justify-between">
          <pre className="overflow-x-auto text-alabaster whitespace-pre-wrap">{currentSnippet.code}</pre>
          {showOutput && (
            <div className="mt-3 rounded-lg border border-sage/30 bg-sage/10 px-2.5 py-1.5 text-[10px] text-sage">
              {currentSnippet.output}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t hairline-border bg-charcoal/90 px-3.5 py-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setShowOutput(true)}
            className="focus-ring inline-flex items-center gap-1.5 text-sage hover:underline"
          >
            {ui.workbenchRunLabel || '▶ Run Snippet'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="focus-ring text-stonewarm hover:text-alabaster"
          >
            {ui.workbenchCopyLabel || 'Copy Code'}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-vermilion">
            {ui.bentoLocationHeading || 'EDUCATION & CGPA'}
          </span>
          <span className="font-mono text-[11px] font-semibold text-sage">{clockText}</span>
        </div>
        <p className="font-display text-sm font-bold text-alabaster">
          CSE | SISTec, Bhopal · {p.education?.cgpa || 'CGPA: 8.42 (2026)'}
        </p>
        <p className="text-xs text-stonewarm leading-relaxed">
          {p.education?.schoolXII || 'XII (MP Board) | Kasturba Vidhya Mandir, Jamani — 83.5% | 2022'}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-amberwarm">
            {ui.bentoFocusHeading || 'ACHIEVEMENTS & FOCUS'}
          </span>
          <button
            type="button"
            onClick={() => setFocusIdx((prev) => (focusAreas.length ? (prev + 1) % focusAreas.length : 0))}
            className="focus-ring font-mono text-[10px] text-cyanglow hover:underline"
          >
            {ui.bentoNextBtn || 'Next Highlight →'}
          </button>
        </div>
        <p className="font-display text-sm font-bold text-alabaster">{currentFocus.title}</p>
        <p className="text-xs text-stonewarm leading-relaxed">{currentFocus.detail}</p>
      </div>
    </div>
  );
}
