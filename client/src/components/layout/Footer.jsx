import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { SocialIconButtons } from '../common/TechLogos';

export function Footer() {
  const { appState } = usePortfolio();
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
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <footer className="border-t hairline-border bg-charcoal/80 py-12 mt-auto backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-vermilion font-display text-xs font-extrabold text-obsidian">
              {p.monogram || 'AP'}
            </span>
            <span className="font-display text-sm font-bold tracking-wider text-alabaster">
              {p.displayName || 'AYUSH PRAJAPATI'}
            </span>
          </div>
          <p className="text-xs text-stonewarm">{p.footerTagline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-stonewarm">
          {navItems.map((item) => (
            <button
              key={item.route}
              type="button"
              onClick={() => handleNav(item.route)}
              className="hover:text-alabaster transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNav('/admin')}
            className="text-vermilion hover:underline"
          >
            {ui.navAdmin || 'Admin CMS'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <SocialIconButtons socialLinks={p.socialLinks} sizeClass="h-10 w-10" />
        </div>
      </div>
    </footer>
  );
}
