import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTick } from '../../utils/audio';

export function CommandPalette({ isOpen, onClose, onOpenAddProject }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  const commands = [
    {
      title: 'Go to Home',
      icon: 'fa-house',
      category: 'Navigation',
      action: () => navigate('/')
    },
    {
      title: 'About & Academic Milestones',
      icon: 'fa-timeline',
      category: 'Navigation',
      action: () => navigate('/about')
    },
    {
      title: 'Skills & Tech Stack',
      icon: 'fa-code',
      category: 'Navigation',
      action: () => navigate('/skills')
    },
    {
      title: 'View Projects',
      icon: 'fa-layer-group',
      category: 'Navigation',
      action: () => navigate('/projects')
    },
    {
      title: 'View Certificates',
      icon: 'fa-certificate',
      category: 'Navigation',
      action: () => navigate('/certificates')
    },
    {
      title: 'Contact / Hire',
      icon: 'fa-envelope',
      category: 'Navigation',
      action: () => navigate('/contact')
    },
    {
      title: 'Admin CMS Overview',
      icon: 'fa-chart-pie',
      category: 'Admin',
      action: () => navigate('/admin')
    },
    {
      title: 'Manage Projects in Admin',
      icon: 'fa-folder',
      category: 'Admin',
      action: () => navigate('/admin?tab=projects')
    },
    {
      title: 'Manage Certificates in Admin',
      icon: 'fa-shield-halved',
      category: 'Admin',
      action: () => navigate('/admin?tab=certificates')
    },
    {
      title: 'Manage Skills in Admin',
      icon: 'fa-code-branch',
      category: 'Admin',
      action: () => navigate('/admin?tab=skills')
    },
    {
      title: 'Check Messages Inbox',
      icon: 'fa-inbox',
      category: 'Admin',
      action: () => navigate('/admin?tab=messages')
    },
    {
      title: 'Update Profile & Resume',
      icon: 'fa-user-gear',
      category: 'Settings',
      action: () => navigate('/admin?tab=profile')
    },
    {
      title: 'Security & Password',
      icon: 'fa-lock',
      category: 'Settings',
      action: () => navigate('/admin?tab=security')
    },
    {
      title: 'Add New Project',
      icon: 'fa-plus',
      category: 'Action',
      action: () => {
        if (onOpenAddProject) {
          onOpenAddProject();
        } else {
          navigate('/admin?tab=projects');
        }
      }
    }
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      playTick();
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  return (
    <div className={`cmd-palette active`} onClick={onClose} role="dialog" aria-modal="true">
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
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
            placeholder="Search commands, navigate or jump to..."
            autoComplete="off"
          />
          <span className="cmd-kbd">ESC</span>
        </div>

        <div className="cmd-results" ref={resultsRef}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.title + idx}
                className={`cmd-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  playTick();
                  cmd.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <i className={`fa-solid ${cmd.icon}`} />
                <span className="cmd-item-text">{cmd.title}</span>
                <span className="cmd-item-category">{cmd.category}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
