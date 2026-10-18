import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../app/providers/ThemeProvider';

export function Header() {
  const { appState, openResumeModal } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const p = appState.profile || {};
  const ui = appState.uiLabels || {};

  const navItems = [
    { route: '/', label: ui.navHome || 'Home' },
    { route: '/about', label: ui.navAbout || 'About' },
    { route: '/skills', label: ui.navSkills || 'Skills' },
    { route: '/projects', label: ui.navProjects || 'Projects' },
    { route: '/certificates', label: ui.navCertificates || 'Certificates' },
    { route: '/contact', label: ui.navContact || 'Contact' }
  ];

  const handleNav = (route) => {
    navigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <header className="sticky top-0 z-40 border-b hairline-border bg-obsidian/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => handleNav('/')}
          className="focus-ring group flex items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vermilion to-amberwarm font-display text-sm font-extrabold text-obsidian shadow-lg shadow-vermilion/20 transition-transform group-hover:scale-105">
            {p.monogram || 'AP'}
          </span>
          <div>
            <span className="block font-display text-base font-bold tracking-tight text-alabaster">
              {p.displayName || 'AYUSH PRAJAPATI'}
            </span>
            <span className="block font-mono text-[11px] text-stonewarm">
              {p.headerSubtitle || 'Full-Stack Developer · CSE | SISTec, Bhopal'}
            </span>
          </div>
        </button>

        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-charcoal/90 p-1.5 shadow-inner">
          {navItems.map((item) => {
            const active =
              (item.route === '/' && location.pathname === '/') ||
              (item.route !== '/' && location.pathname.startsWith(item.route));
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNav(item.route)}
                className={`focus-ring rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active ? 'bg-vermilion text-obsidian shadow-sm' : 'text-stonewarm hover:text-alabaster'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            onClick={openResumeModal}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-cyanglow/40 bg-charcoal px-4 py-2 text-xs font-bold text-cyanglow transition-all hover:-translate-y-0.5 hover:bg-cyanglow hover:text-obsidian"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{ui.navResume || 'Resume'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleNav('/contact')}
            className="focus-ring rounded-full bg-vermilion px-4 py-2 text-xs font-bold text-obsidian transition-transform hover:-translate-y-0.5 hover:opacity-95"
          >
            {ui.navCta || 'Hire / Connect'}
          </button>
          <button
            type="button"
            onClick={() => handleNav('/admin')}
            className="focus-ring flex items-center gap-2 rounded-full border border-white/15 bg-charcoal px-3.5 py-2 font-mono text-xs font-medium text-stonewarm transition-colors hover:border-vermilion hover:text-alabaster"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            <span>{ui.navAdmin || 'Admin CMS'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          className="focus-ring md:hidden inline-flex items-center justify-center rounded-xl border border-white/15 bg-charcoal p-2.5 text-alabaster"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t hairline-border bg-charcoal/95 px-4 pt-3 pb-5 space-y-1.5 backdrop-blur-xl">
          {navItems.map((item) => (
            <button
              key={item.route}
              type="button"
              onClick={() => handleNav(item.route)}
              className="block w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-alabaster hover:bg-graphite"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              openResumeModal();
              setMobileMenuOpen(false);
            }}
            className="block w-full rounded-xl border border-cyanglow/40 bg-obsidian px-3.5 py-2.5 text-left font-mono text-xs font-semibold text-cyanglow"
          >
            ↓ {ui.navResume || 'Resume'}
          </button>
          <button
            type="button"
            onClick={() => handleNav('/admin')}
            className="block w-full rounded-xl border border-vermilion/40 bg-obsidian px-3.5 py-2.5 text-left font-mono text-xs font-semibold text-vermilion"
          >
            {ui.navAdmin || 'Admin CMS'}
          </button>
        </div>
      )}
    </header>
  );
}
