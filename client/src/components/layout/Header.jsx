import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { usePortfolio } from '../../app/providers/ThemeProvider';

export function Header() {
  const { appState, downloadOrPrintResume } = usePortfolio();
  const [mobileOpen, setMobileOpen] = useState(false);

  const p = appState.profile || {};
  const ui = appState.uiLabels || {};

  const navItems = [
    {
      name: ui.navHome || 'Home',
      path: '/',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: ui.navAbout || 'About',
      path: '/about',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: ui.navSkills || 'Skills',
      path: '/skills',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      name: ui.navProjects || 'Projects',
      path: '/projects',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: ui.navCertificates || 'Certificates',
      path: '/certificates',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      name: ui.navContact || 'Contact',
      path: '/contact',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-8">
      <div className="mx-auto max-w-7xl p-[1.5px] rounded-2xl bg-gradient-to-r from-orange-500/60 via-purple-500/50 to-cyan-400/60 shadow-[0_12px_35px_-10px_rgba(249,115,22,0.3)] transition-all duration-500 hover:from-orange-500 hover:via-pink-500 hover:to-cyan-400">
        <nav className="rounded-[15px] bg-[#080b12]/95 backdrop-blur-2xl px-5 py-2.5 flex items-center justify-between gap-4">
          
          {/* 1. LEFT: Brand Identity */}
          <Link className="flex items-center gap-3 group shrink-0" to="/">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-pink-500 p-[1.5px] shadow-[0_0_20px_rgba(249,115,22,0.35)] group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-[#080b12] rounded-[10px] flex items-center justify-center font-black text-xs text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                {p.monogram || 'AP'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080b12]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide flex items-center gap-2 group-hover:text-orange-400 transition-colors">
                {p.displayName || p.name || 'AYUSH PRAJAPATI'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500/15 to-purple-500/15 text-orange-300 border border-orange-500/30 font-mono">
                  PRO
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {p.headerSubtitle || 'Full-Stack Developer · SISTec, Bhopal'}
              </div>
            </div>
          </Link>

          {/* 2. CENTER: Micro-Icon Navigation Pill */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-xl border border-white/[0.07]">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold shadow-[0_0_20px_rgba(249,115,22,0.45)] scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* 3. RIGHT: Action Suite (Keep existing Resume/Contact/Admin CMS bindings) */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={downloadOrPrintResume}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{ui.navResume || 'Resume'}</span>
              <span>↗</span>
            </button>

            <Link
              to="/contact"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-pink-600 text-white text-xs font-bold shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:opacity-95 hover:scale-[1.02] transition-all"
            >
              {ui.navCta || 'Hire / Connect'}
            </Link>

            <Link
              to="/admin"
              title="Admin CMS"
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-emerald-400 text-xs font-mono hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden xl:inline text-[11px] text-slate-300">CMS</span>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#080b12]/95 border-t border-white/10 px-4 py-3 space-y-1.5 rounded-b-[15px] mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  downloadOrPrintResume();
                  setMobileOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 w-full px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 cursor-pointer"
              >
                <span>{ui.navResume || 'Resume'}</span>
                <span>↗</span>
              </button>
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-pink-600 text-white text-xs font-bold shadow-[0_4px_20px_rgba(249,115,22,0.4)]"
              >
                {ui.navCta || 'Hire / Connect'}
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-emerald-400 text-xs font-mono"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admin CMS</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export const Navbar = Header;
export default Header;
