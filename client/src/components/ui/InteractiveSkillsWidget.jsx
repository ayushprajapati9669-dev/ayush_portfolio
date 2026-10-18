import React, { useState } from 'react';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { SkillCategoryTabIcon, TechLogo, getSkillIconBgTint } from '../common/TechLogos';

export function InteractiveSkillsWidget() {
  const { appState } = usePortfolio();
  const cats = appState.skills || [];
  const [selectedId, setSelectedId] = useState('skill-frontend');

  if (cats.length === 0) return null;
  const activeCat = cats.find((c) => c.id === selectedId) || cats[1] || cats[0];
  const items = activeCat.items || [];

  return (
    <div className="relative space-y-7 py-2">
      <span className="sparkle-star absolute -top-4 left-6 text-sm" aria-hidden="true">✦</span>
      <span className="sparkle-star absolute top-12 right-10 text-base" aria-hidden="true">✦</span>
      <span className="sparkle-star absolute bottom-8 left-1/3 text-xs" aria-hidden="true">✦</span>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 max-w-5xl mx-auto">
        {cats.map((cat) => {
          const isSelected = cat.id === activeCat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedId(cat.id)}
              className={`focus-ring skills-tab-card ${
                isSelected ? 'skills-tab-active' : ''
              } rounded-2xl px-5 py-6 flex flex-col items-center justify-center gap-3 text-center`}
            >
              <SkillCategoryTabIcon tabIconKey={cat.tabIcon || cat.category} isActive={isSelected} />
              <span className={`font-display text-sm sm:text-base font-bold ${isSelected ? 'text-white' : 'text-stonewarm'}`}>
                {cat.category}
              </span>
            </button>
          );
        })}
      </div>

      <div className="skills-panel-box rounded-[28px] p-6 sm:p-10 relative overflow-hidden">
        <span className="sparkle-star absolute top-8 left-1/3 text-sm" aria-hidden="true">✦</span>
        <span className="sparkle-star absolute bottom-6 right-1/4 text-xs" aria-hidden="true">✦</span>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-cyanglow">SELECTED</p>
            <h3 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-white">{activeCat.category}</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-[#151C2F] px-4 py-1.5 font-mono text-xs font-medium text-stonewarm">
            {items.length} skills
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className="skill-item-card rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${getSkillIconBgTint(item.logoKey || item.name)}`}>
                <TechLogo name={item.logoKey || item.name} className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <span className="block truncate font-display text-base font-bold text-white">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
