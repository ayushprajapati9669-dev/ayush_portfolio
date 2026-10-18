import React from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { InteractiveSkillsWidget } from '../../components/ui/InteractiveSkillsWidget';

export function SkillsPage() {
  const { appState } = usePortfolio();
  const ui = appState.uiLabels || {};

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 pt-12 space-y-12">
      <div className="border-b hairline-border pb-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyanglow">{ui.homeSkillsEyebrow}</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-alabaster">{ui.homeSkillsHeading}</h1>
      </div>

      <InteractiveSkillsWidget />
    </div>
  );
}
