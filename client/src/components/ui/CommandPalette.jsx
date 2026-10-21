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

  // Assemble comprehensive commands list
  const commands = useMemo(() => {
    const list = [
      // 1. Navigation
      {
        id: 'nav-home',
        title: 'Go to Home',
        icon: 'fa-house',
        category: 'Navigation',
        action: () => navigate('/')
      },
      {
        id: 'nav-about',
        title: 'About & Academic Milestones',
        icon: 'fa-timeline',
        category: 'Navigation',
        action: () => navigate('/about')
      },
      {
        id: 'nav-skills',
        title: 'Skills & Tech Stack',
        icon: 'fa-code',
        category: 'Navigation',
        action: () => navigate('/skills')
      },
      {
        id: 'nav-projects',
        title: 'View Projects Gallery',
        icon: 'fa-layer-group',
        category: 'Navigation',
        action: () => navigate('/projects')
      },
      {
        id: 'nav-certs',
        title: 'View Verified Credentials & Certificates',
        icon: 'fa-certificate',
        category: 'Navigation',
        action: () => navigate('/certificates')
      },
      {
        id: 'nav-contact',
        title: 'Contact / Hire Ayush',
        icon: 'fa-paper-plane',
        category: 'Navigation',
        action: () => navigate('/contact')
      },

      // 2. Admin Sections
      {
        id: 'admin-dash',
        title: 'Admin CMS Overview & Live Feed',
        icon: 'fa-chart-pie',
        category: 'Admin',
        action: () => navigate('/admin')
      },
      {
        id: 'admin-certs',
        title: 'Manage Certificates in Admin CMS',
        icon: 'fa-award',
        category: 'Admin',
        action: () => navigate('/admin?tab=certificates')
      },
      {
        id: 'admin-projs',
        title: 'Manage Projects in Admin CMS',
        icon: 'fa-folder',
        category: 'Admin',
        action: () => navigate('/admin?tab=projects')
      },
      {
        id: 'admin-skills',
        title: 'Manage Skills & Competencies in Admin CMS',
        icon: 'fa-code-branch',
        category: 'Admin',
        action: () => navigate('/admin?tab=skills')
      },
      {
        id: 'admin-inbox',
        title: 'Check Messages Inbox',
        icon: 'fa-inbox',
        category: 'Admin',
        action: () => navigate('/admin?tab=messages')
      },
      {
        id: 'admin-profile',
        title: 'Update Profile, Bio & Resume',
        icon: 'fa-user-gear',
        category: 'Admin',
        action: () => navigate('/admin?tab=profile')
      },
      {
        id: 'admin-security',
        title: 'Security Settings & Password Change',
        icon: 'fa-lock',
        category: 'Admin',
        action: () => navigate('/admin?tab=security')
      },

      // 3. Certificate Quick Actions
      {
        id: 'cert-action-new',
        title: '+ Create New Certificate',
        icon: 'fa-plus',
        category: 'Certificates',
        action: () => {
          navigate('/admin?tab=certificates');
          if (typeof window !== 'undefined' && window.__adminCertificatesAction) {
            window.__adminCertificatesAction('create');
          }
        }
      },
      {
        id: 'cert-filter-fullstack',
        title: 'Filter Certificates: Full Stack',
        icon: 'fa-filter',
        category: 'Certificates',
        action: () => {
          navigate('/admin?tab=certificates');
          if (typeof window !== 'undefined' && window.__adminCertificatesAction) {
            window.__adminCertificatesAction('filter-category', 'Full Stack Development');
          }
        }
      },
      {
        id: 'cert-filter-aiml',
        title: 'Filter Certificates: AI & Machine Learning',
        icon: 'fa-brain',
        category: 'Certificates',
        action: () => {
          navigate('/admin?tab=certificates');
          if (typeof window !== 'undefined' && window.__adminCertificatesAction) {
            window.__adminCertificatesAction('filter-category', 'Artificial Intelligence & ML');
          }
        }
      },
      {
        id: 'cert-filter-featured',
        title: 'Filter Certificates: Featured Flagship Only',
        icon: 'fa-star',
        category: 'Certificates',
        action: () => {
          navigate('/admin?tab=certificates');
          if (typeof window !== 'undefined' && window.__adminCertificatesAction) {
            window.__adminCertificatesAction('filter-status', 'FEATURED');
          }
        }
      },
      {
        id: 'cert-select-all',
        title: 'Batch Action: Select All Certificates',
        icon: 'fa-check-double',
        category: 'Certificates',
        action: () => {
          navigate('/admin?tab=certificates');
          if (typeof window !== 'undefined' && window.__adminCertificatesAction) {
            window.__adminCertificatesAction('select-all');
          }
        }
      },

      // 4. Project Quick Actions
      {
        id: 'proj-action-new',
        title: '+ Add New Project',
        icon: 'fa-plus',
        category: 'Projects',
        action: () => {
          if (onOpenAddProject) {
            onOpenAddProject();
          } else {
            navigate('/admin?tab=projects');
          }
        }
      }
    ];

    // Dynamic Index of Existing Certificates
    certificates.forEach((c) => {
      list.push({
        id: `cert-item-${c.id}`,
        title: `${c.title} — ${c.issuer || 'Credential'}`,
        subtitle: `${c.issueDate || '2025'} · ${c.category || 'Certification'}`,
        icon: 'fa-shield-halved',
        category: 'Certificates',
        action: () => {
          if (openCertificateLightbox) {
            openCertificateLightbox(c.id);
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
        title: `${p.title} — ${p.category || 'Web App'}`,
        subtitle: (p.technologies || []).slice(0, 3).join(', '),
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

  const categories = ['ALL', 'Certificates', 'Projects', 'Navigation', 'Admin'];

  return (
    <div className="cmd-palette active" onClick={onClose} role="dialog" aria-modal="true">
      <div ref={modalRef} className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="cmd-input-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, certificates, projects, or jump to..."
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-slate-500 hover:text-white text-xs px-1"
            >
              ×
            </button>
          )}
          <span className="cmd-kbd">ESC</span>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-black/40 overflow-x-auto text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                playTick();
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              className={`rounded-lg px-2.5 py-1 font-mono transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {cat === 'ALL' ? 'All Commands' : cat}
            </button>
          ))}
          <span className="ml-auto font-mono text-[10px] text-slate-500 shrink-0 pr-1">
            {filteredCommands.length} items
          </span>
        </div>

        {/* Results List */}
        <div className="cmd-results" ref={resultsRef}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              <i className="fa-solid fa-compass text-2xl text-slate-600 mb-2 block" />
              No matching commands or resources found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id || cmd.title + idx}
                className={`cmd-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  playTick();
                  cmd.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <i className={`fa-solid ${cmd.icon}`} />
                <div className="flex flex-col flex-1 min-w-0 pr-2">
                  <span className="cmd-item-text truncate">{cmd.title}</span>
                  {cmd.subtitle && (
                    <span className="text-[11px] text-slate-400 font-mono truncate">{cmd.subtitle}</span>
                  )}
                </div>
                <span className="cmd-item-category shrink-0">{cmd.category}</span>
              </div>
            ))
          )}
        </div>

        {/* Keyboard Footer Helper */}
        <div className="flex items-center justify-between border-t border-white/5 bg-black/60 px-4 py-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-white/15 bg-white/5 px-1 py-0.5 text-slate-300">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="rounded border border-white/15 bg-white/5 px-1 py-0.5 text-slate-300">↵</kbd> select
            </span>
            <span>
              <kbd className="rounded border border-white/15 bg-white/5 px-1 py-0.5 text-slate-300">esc</kbd> close
            </span>
          </div>
          <span className="text-cyan-400">Ayush CMS Quick Palette</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
