import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { SocialIconButtons } from '../../components/common/TechLogos';

export function AboutPage() {
  const { appState } = usePortfolio();
  const navigate = useNavigate();
  const p = appState.profile || {};

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 pt-12 space-y-14">
      <div className="border-b hairline-border pb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">{p.eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-alabaster">{p.name}</h1>
          <p className="mt-2 font-mono text-xs sm:text-sm text-cyanglow">
            {p.email || 'ayushprajapati9669@gmail.com'} · {p.phone || '(+91) 9669802554'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="focus-ring rounded-full bg-vermilion px-6 py-3 text-xs font-bold text-obsidian shadow-lg shadow-vermilion/20 hover:opacity-95"
          >
            Get In Touch →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-7 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-bold text-alabaster">About & Academic Profile</h2>
            {(p.aboutBio || []).map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-stonewarm">{paragraph}</p>
            ))}
          </div>

          <div className="glass-card rounded-3xl p-7 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-bold text-alabaster">Education Qualifications</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-obsidian p-5 space-y-1">
                <span className="font-mono text-xs text-sage font-bold">{p.education?.cgpa || 'CGPA: 8.42 | (2026)'}</span>
                <h3 className="font-display text-lg font-bold text-white">{p.education?.degree || 'B.Tech in CSE'}</h3>
                <p className="text-xs text-stonewarm">{p.education?.college || 'SISTec (Sagar Institute of Science & Technology), Bhopal'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-obsidian p-5 space-y-1">
                <span className="font-mono text-xs text-cyanglow font-bold">{p.education?.schoolScore || '83.5% | 2022'}</span>
                <h3 className="font-display text-lg font-bold text-white">{p.education?.schoolBoard || 'Class XII (MP Board)'}</h3>
                <p className="text-xs text-stonewarm">{p.education?.schoolXII || 'Kasturba Vidhya Mandir, Jamani, Madhya Pradesh'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 flex items-center gap-5">
            <img
              src={p.portrait?.url || '/images/ayush-hero-portrait.jpg'}
              alt={p.name}
              className="h-24 w-24 rounded-2xl object-cover border border-white/15 shrink-0"
            />
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-alabaster">{p.name}</h3>
              <p className="text-xs text-stonewarm">
                {p.education?.degree || 'CSE'} | {p.education?.college || 'SISTec, Bhopal'} ({p.education?.cgpa || 'CGPA: 8.42'})
              </p>
              <div className="flex items-center gap-2 pt-1">
                <SocialIconButtons socialLinks={p.socialLinks} sizeClass="h-9 w-9" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 space-y-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-vermilion">
              ACHIEVEMENTS & ACADEMIC PROJECTS
            </p>
            <div className="space-y-4">
              {(p.learningJourney || []).map((step, i) => (
                <div key={i} className="border-l-2 border-vermilion/40 pl-4 space-y-1">
                  <span className="font-mono text-[11px] text-amberwarm">{step.phase}</span>
                  <h4 className="font-display text-sm font-bold text-alabaster">{step.title}</h4>
                  <p className="text-xs text-stonewarm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
