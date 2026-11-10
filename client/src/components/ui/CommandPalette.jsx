import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick } from '../../utils/audio';

export function CommandPalette({ isOpen, onClose, onOpenAddProject }) {
  const { appState, openCertificateLightbox, showToast } = usePortfolio();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const certificates = appState.certificates || [];
  const projects = appState.projects || [];

  // Assemble comprehensive commands list with all admin features
  const commands = useMemo(() => {
    const list = [
      // 1. Navigation (Public Pages)
      {
        id: 'nav-home',
        title: 'Home — Portfolio Hero & Showcase',
        subtitle: 'Main portfolio landing page',
        icon: 'fa-house',
        category: 'Navigation',
        action: () => navigate('/')
      },
      {
        id: 'nav-about',
        title: 'About & Academic Milestones',
        subtitle: 'SISTec Bhopal B.Tech CSE (8.42 CGPA)',
        icon: 'fa-user',
        category: 'Navigation',
        action: () => navigate('/about')
      },
      {
        id: 'nav-journey',
        title: 'Journey, Hackathons & LeetCode Milestones',
        subtitle: 'Timeline, achievements, and competitive programming',
        icon: 'fa-trophy',
        category: 'Navigation',
        action: () => navigate('/journey')
      },
      {
        id: 'nav-skills',
        title: 'Skills & Technical Capabilities',
        subtitle: 'Full-stack MERN, Java, Python, DevOps & Tools',
        icon: 'fa-code',
        category: 'Navigation',
        action: () => navigate('/skills')
      },
      {
        id: 'nav-projects',
        title: 'Projects Gallery & Case Studies',
        subtitle: 'Production web apps, microservices & distributed systems',
        icon: 'fa-layer-group',
        category: 'Navigation',
        action: () => navigate('/projects')
      },
      {
        id: 'nav-certs',
        title: 'Certificates & Verified Credentials',
        subtitle: 'Apna College Delta, Coursera, Code With Harry',
        icon: 'fa-certificate',
        category: 'Navigation',
        action: () => navigate('/certificates')
      },
      {
        id: 'nav-contact',
        title: 'Contact / Hire Ayush Prajapati',
        subtitle: 'ayushprajapati9669@gmail.com · (+91) 9669802554',
        icon: 'fa-paper-plane',
        category: 'Navigation',
        action: () => navigate('/contact')
      },

      // 2. Admin CMS Controls & Studio Views
      {
        id: 'admin-dash',
        title: 'Command Center Overview & Dashboard',
        subtitle: 'Live portfolio statistics, quick metrics, activity feed',
        icon: 'fa-chart-pie',
        category: 'Admin',
        badge: 'CMS',
        action: () => navigate('/admin')
      },
      {
        id: 'admin-telemetry',
        title: 'Visitor Telemetry & Performance Studio',
        subtitle: 'Real-time recruiter interactions, daily curve, geo hubs, devices',
        icon: 'fa-chart-line',
        category: 'Admin',
        badge: 'LIVE',
        action: () => navigate('/admin?tab=analytics')
      },
      {
        id: 'admin-projs',
        title: 'Manage Projects & Case Studies',
        subtitle: 'Create, edit, organize live applications and demos',
        icon: 'fa-folder',
        category: 'Admin',
        action: () => navigate('/admin?tab=projects')
      },
      {
        id: 'admin-certs',
        title: 'Manage Certificates & Credentials',
        subtitle: 'Inspect, upload, edit certifications with pan/zoom lightbox',
        icon: 'fa-award',
        category: 'Admin',
        action: () => navigate('/admin?tab=certificates')
      },
      {
        id: 'admin-skills',
        title: 'Manage Skills & Competency Matrix',
        subtitle: 'Reorder categories, update proficiencies and tech tags',
        icon: 'fa-code-branch',
        category: 'Admin',
        action: () => navigate('/admin?tab=skills')
      },
      {
        id: 'admin-milestones',
        title: 'Manage Learning Journey & Milestones',
        subtitle: 'Education, academic milestones, certifications & timeline',
        icon: 'fa-flag',
        category: 'Admin',
        action: () => navigate('/admin?tab=milestones')
      },
      {
        id: 'admin-inbox',
        title: 'Check Incoming Messages & Inquiries',
        subtitle: 'Contact form submissions and recruiter outreach',
        icon: 'fa-inbox',
        category: 'Admin',
        action: () => navigate('/admin?tab=messages')
      },
      {
        id: 'admin-profile',
        title: 'Update Profile, Bio & Resume File',
        subtitle: 'Personal information, social links, resume upload',
        icon: 'fa-user-gear',
        category: 'Admin',
        action: () => navigate('/admin?tab=profile')
      },
      {
        id: 'admin-hero-media',
        title: 'Hero Portrait & Visual Media Studio',
        subtitle: 'Update hero photography, particle cards, avatars',
        icon: 'fa-image',
        category: 'Admin',
        action: () => navigate('/admin?tab=media')
      },
      {
        id: 'admin-security',
        title: 'Security Settings & Password Change',
        subtitle: 'Update master credentials and scrypt hash authentication',
        icon: 'fa-lock',
        category: 'Admin',
        action: () => navigate('/admin?tab=security')
      },

      // 3. Quick Actions
      {
        id: 'quick-proj-new',
        title: '+ Create New Project Showcase',
        subtitle: 'Launch 4-step project creation wizard',
        icon: 'fa-circle-plus',
        category: 'Quick Actions',
        action: () => {
          if (onOpenAddProject) {
            onOpenAddProject();
          } else {
            navigate('/admin?tab=projects');
          }
        }
      },
      {
        id: 'quick-cert-new',
        title: '+ Create New Certificate Credential',
        subtitle: 'Launch 4-step certificate creation wizard',
        icon: 'fa-circle-plus',
        category: 'Quick Actions',
        action: () => {
          navigate('/admin?tab=certificates');
          if (typeof window !== 'undefined' && window.__adminCertificatesAction) {
            window.__adminCertificatesAction('create');
          }
        }
      },
      {
        id: 'quick-terminal',
        title: 'Launch Developer CLI Terminal',
        subtitle: 'Interactive Unix-style developer terminal emulator',
        icon: 'fa-terminal',
        category: 'Quick Actions',
        action: () => {
          window.dispatchEvent(new CustomEvent('ams-open-terminal'));
        }
      },
      {
        id: 'quick-shortcuts',
        title: 'Open Keyboard Shortcuts Helper',
        subtitle: 'Quick key combinations for power navigation',
        icon: 'fa-keyboard',
        category: 'Quick Actions',
        action: () => {
          window.dispatchEvent(new CustomEvent('ams-open-shortcuts'));
        }
      }
    ];

    // Dynamic Index of Existing Certificates (with Inspect action)
    certificates.forEach((c) => {
      list.push({
        id: `cert-item-${c.id}`,
        title: `Inspect: ${c.title}`,
        subtitle: `${c.issuer || 'Credential'} · ${c.issueDate || '2025'} · ${c.category || 'Certification'}`,
        icon: 'fa-eye',
        category: 'Certificates',
        action: () => {
          if (openCertificateLightbox) {
            openCertificateLightbox(c);
          } else {
            navigate('/certificates');
          }
        }
      });
    });

    // Dynamic Index of Existing Projects
    projects.forEach((p) => {
      list.push({
        id: `proj-item-${p.id}`,
        title: `Project: ${p.title}`,
        subtitle: `${p.category || 'Web App'} · ${(p.technologies || []).slice(0, 4).join(', ')}`,
        icon: 'fa-rocket',
        category: 'Projects',
        action: () => {
          if (p.liveDemoUrl) {
            window.open(p.liveDemoUrl, '_blank', 'noreferrer');
          } else {
            navigate('/projects');
          }
        }
      });
    });

    return list;
  }, [certificates, projects, navigate, onOpenAddProject, openCertificateLightbox]);

  const categories = ['ALL', 'Admin', 'Quick Actions', 'Certificates', 'Projects', 'Navigation'];

  // Filter commands by search query and category
  const filteredCommands = useMemo(() => {
    return commands.filter((cmd) => {
      const matchesCategory =
        activeCategory === 'ALL' || cmd.category.toUpperCase() === activeCategory.toUpperCase();
      const q = query.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesText =
        cmd.title.toLowerCase().includes(q) ||
        (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
        cmd.category.toLowerCase().includes(q);

      return matchesCategory && matchesText;
    });
  }, [commands, query, activeCategory]);

  useEffect(() => {
    if (isOpen) {
      setQuery(window.__cmdPaletteInitialQuery || '');
      delete window.__cmdPaletteInitialQuery;
      setActiveCategory('ALL');
      setSelectedIndex(0);
      playTick();

      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion && modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.94, opacity: 0, y: -20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.2)' }
        );
      }

      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 80);
    }
  }, [isOpen]);

  // Scroll selected item into view smoothly
  useEffect(() => {
    if (resultsRef.current && resultsRef.current.children[selectedIndex]) {
      const el = resultsRef.current.children[selectedIndex];
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          if (typeof window !== 'undefined' && window.__openCommandPalette) {
            window.__openCommandPalette();
          }
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen, onClose]);

  // Keyboard navigation within the modal
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      playTick();
      const curIdx = categories.indexOf(activeCategory);
      const nextIdx = (curIdx + (e.shiftKey ? -1 : 1) + categories.length) % categories.length;
      setActiveCategory(categories[nextIdx]);
      setSelectedIndex(0);
      return;
    }

    if (filteredCommands.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      playTick();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      playTick();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        playTick();
        selected.action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="cmd-palette active fixed inset-0 z-[1000002] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-xl transition-all"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        data-lenis-prevent="true"
        className="cmd-modal w-full max-w-2xl rounded-2xl border border-yellow-500/30 bg-[#090c13] shadow-2xl shadow-yellow-500/10 overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="cmd-input-wrap flex items-center px-4 py-3.5 border-b border-white/10 gap-3 bg-black/40">
          <i className="fa-solid fa-magnifying-glass text-yellow-400 text-sm" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-sans"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, jump to tab, search projects or inspect certificates..."
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              Clear
            </button>
          )}
          <span className="font-mono text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded border border-white/15">
            ESC
          </span>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-black/60 overflow-x-auto text-[11px] scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                playTick();
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              className={`rounded-lg px-2.5 py-1 font-mono transition-all shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold shadow-sm shadow-yellow-400/10'
                  : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
              }`}
            >
              {cat === 'ALL' ? 'All Commands' : cat}
            </button>
          ))}
          <span className="ml-auto font-mono text-[10px] text-slate-500 shrink-0 pr-1">
            {filteredCommands.length} matches
          </span>
        </div>

        {/* Results List */}
        <div data-lenis-prevent="true"
        className="cmd-results flex-1 overflow-y-auto p-2 space-y-1 max-h-[50vh] scrollbar-thin" ref={resultsRef}>
          {filteredCommands.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-400 text-xs font-mono">
              <i className="fa-solid fa-compass text-3xl text-slate-600 mb-3 block" />
              <p>No matching commands or resources found for "{query}".</p>
              <p className="text-[11px] text-slate-500 mt-1">Try searching "telemetry", "projects", "inspect", or "profile".</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id || cmd.title + idx}
                  className={`cmd-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-yellow-400/15 border border-yellow-400/40 text-white shadow-md shadow-yellow-400/5'
                      : 'hover:bg-white/5 border border-transparent text-slate-300'
                  }`}
                  onClick={() => {
                    playTick();
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs transition-colors ${
                      isSelected
                        ? 'bg-yellow-400 text-black font-bold'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    <i className={`fa-solid ${cmd.icon}`} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold truncate ${isSelected ? 'text-yellow-300' : 'text-white'}`}>
                        {cmd.title}
                      </span>
                      {cmd.badge && (
                        <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                          {cmd.badge}
                        </span>
                      )}
                    </div>
                    {cmd.subtitle && (
                      <span className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {cmd.subtitle}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {cmd.category}
                    </span>
                    {isSelected && (
                      <span className="font-mono text-[10px] text-yellow-400 flex items-center gap-1 font-bold">
                        <span>↵</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="cmd-footer flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-black/70 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">↵</kbd>
              <span>execute</span>
            </span>
            <span className="flex items-center gap-1 hidden sm:flex">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">tab</kbd>
              <span>category</span>
            </span>
          </div>
          <span className="text-[10px] text-yellow-400/90 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <i className="fa-solid fa-bolt text-[9px]" />
            Command Center
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
