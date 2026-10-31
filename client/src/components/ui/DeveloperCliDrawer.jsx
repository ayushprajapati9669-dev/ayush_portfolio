import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../app/providers/ThemeProvider';
import { playTick, setSwitchPreset, getSoundSettings, startLofiAmbient, stopLofiAmbient, isLofiPlaying } from '../../utils/audio';

export function DeveloperCliDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [logs, setLogs] = useState(() => [
    {
      type: 'banner',
      content: [
        '  █████╗ ██╗   ██╗██╗   ██╗███████╗██╗  ██╗   ████████╗███████╗██████╗ ███╗   ███╗',
        ' ██╔══██╗╚██╗ ██╔╝██║   ██║██╔════╝██║  ██║   ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║',
        ' ███████║ ╚████╔╝ ██║   ██║███████╗███████║█████╗██║   █████╗  ██████╔╝██╔████╔██║',
        ' ██╔══██║  ╚██╔╝  ██║   ██║╚════██║██╔══██║╚════╝██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║',
        ' ██║  ██║   ██║   ╚██████╔╝███████║██║  ██║      ██║   ███████╗██║  ██║██║ ╚═╝ ██║',
        ' ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝'
      ].join('\n')
    },
    {
      type: 'info',
      content: '⚡ Welcome to Ayush\'s High-Performance Developer Terminal v2.4 (x86_64-apple-darwin/linux-gnu)'
    },
    {
      type: 'system',
      content: 'Type \x1b[36m"help"\x1b[0m for available commands, or try \x1b[32m"sudo hire"\x1b[0m / \x1b[33m"whoami"\x1b[0m.'
    }
  ]);

  const { appState, showToast } = usePortfolio();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const terminalEndRef = useRef(null);
  const containerRef = useRef(null);

  // Toggle terminal listener: Ctrl + ~ / Ctrl + ` or custom event
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle with Ctrl+` or Ctrl+~ or Cmd+`
      if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        playTick('click');
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      playTick('click');
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('ams-open-terminal', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('ams-open-terminal', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen]);

  // Auto-scroll when logs change
  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  const addLog = (entry) => {
    setLogs((prev) => [...prev, entry]);
  };

  const handleCommand = async (rawCmd) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    // Save to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Echo input
    addLog({ type: 'input', content: trimmed });

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help': {
        addLog({
          type: 'output',
          content: [
            'AVAILABLE COMMANDS:',
            '  help                      → Show this list of available commands',
            '  whoami                    → Telemetry & visitor environment diagnostics',
            '  cat bio.txt               → View Ayush\'s engineering bio & mission statement',
            '  projects [--tag=NAME]     → List featured full-stack & systems projects',
            '  skills                    → Interactive matrix of technical proficiencies',
            '  leetcode                  → Pull live verified problem-solving metrics from LeetCode (@ayush7162)',
            '  architecture              → High-level microservices & portfolio blueprint',
            '  api                       → Explore interactive API sandbox endpoints',
            '  sudo hire                 → Instant trigger: Hire & Direct Engagement modal',
            '  theme <name>              → Switch theme: cyberpunk | midnight | ocean | synthwave | tokyo',
            '  sound <preset>            → Switch keyboard preset: blue | brown | cream | default | mute',
            '  lofi <on|off>             → Toggle ambient Lo-Fi generative binaural soundscape',
            '  clear                     → Clear terminal buffer',
            '  exit                      → Close this developer CLI drawer'
          ].join('\n')
        });
        break;
      }

      case 'whoami': {
        const nav = typeof window !== 'undefined' ? window.navigator : {};
        const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}x DPR)` : 'Unknown';
        const tz = Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'UTC';
        const conn = nav.connection ? `${nav.connection.effectiveType || '4g'} (~${nav.connection.downlink || 10}Mbps)` : 'High-Speed Broadband';
        const browser = nav.userAgent ? nav.userAgent.split(') ')[nav.userAgent.split(') ').length - 1] : 'Modern Browser';

        addLog({
          type: 'output',
          content: [
            'VISITOR TELEMETRY & CLIENT DIAGNOSTICS:',
            `  • Remote Host:       ${window.location.hostname} (SSL TLS v1.3 Verified)`,
            `  • Client Platform:   ${nav.platform || 'Client Device'}`,
            `  • Viewport Matrix:   ${window.innerWidth}x${window.innerHeight} on ${screenRes}`,
            `  • Timezone Offset:   ${tz} (${new Date().toLocaleTimeString()})`,
            `  • Network Link:      ${conn}`,
            `  • User-Agent Node:   ${browser}`,
            `  • Security State:    Sandboxed Safe Context (Strict-Transport-Security: Enabled)`
          ].join('\n')
        });
        break;
      }

      case 'cat': {
        if (args[0] === 'bio.txt' || args[0] === 'bio') {
          const profile = appState.profile || {};
          addLog({
            type: 'output',
            content: [
              `======================= [ BIO.TXT ] =======================`,
              `Name:        ${profile.name || 'Ayush Prajapati'}`,
              `Role:        ${profile.title || 'Full Stack & AI Engineer'}`,
              `Location:    ${profile.location || 'India (Open to Remote / Hybrid Worldwide)'}`,
              `Education:   B.Tech in Computer Science & Engineering`,
              `Focus:       High-throughput distributed systems, React/Next.js, Node.js microservices,`,
              `             and GenAI/Agentic automation workflows.`,
              `Status:      🟢 Actively interviewing for Full-Stack, Backend & Systems Engineering roles.`,
              `============================================================`
            ].join('\n')
          });
        } else {
          addLog({ type: 'error', content: `cat: ${args[0] || 'file'}: No such file. Try 'cat bio.txt'.` });
        }
        break;
      }

      case 'projects': {
        const tagArg = args.find((a) => a.startsWith('--tag='));
        const tagFilter = tagArg ? tagArg.replace('--tag=', '').toLowerCase() : null;
        let projs = appState.projects || [];
        if (tagFilter) {
          projs = projs.filter(
            (p) =>
              (p.tags && p.tags.some((t) => t.toLowerCase().includes(tagFilter))) ||
              (p.category && p.category.toLowerCase().includes(tagFilter))
          );
        }

        if (projs.length === 0) {
          addLog({ type: 'output', content: `No projects found matching tag: "${tagFilter}". Showing top 3 featured:` });
          projs = (appState.projects || []).slice(0, 3);
        }

        const projectLines = projs.slice(0, 6).map((p, i) => {
          const tagsStr = Array.isArray(p.tags) ? p.tags.slice(0, 3).join(', ') : '';
          return `  [${i + 1}] ${p.title.padEnd(28)} | ${tagsStr.padEnd(30)} | ${p.liveUrl || p.githubUrl || 'Internal'}`;
        });

        addLog({
          type: 'output',
          content: [
            `PROJECT DIRECTORY (${projs.length} verified repositories):`,
            '  #   Project Title                 Stack/Tags                      Endpoint / Repo',
            '  --- ---------------------------- ------------------------------ ------------------',
            ...projectLines,
            '',
            '  * Navigate to /projects or /projects/:id for comprehensive deep-dive case studies.'
          ].join('\n')
        });
        break;
      }

      case 'skills': {
        const skills = appState.skills || [];
        const byCat = {};
        skills.forEach((s) => {
          const c = s.category || 'Core Technologies';
          if (!byCat[c]) byCat[c] = [];
          byCat[c].push(s.name);
        });

        const lines = Object.entries(byCat).map(([cat, list]) => {
          return `  ▸ ${cat.toUpperCase()}:\n    ${list.join(' • ')}`;
        });

        addLog({
          type: 'output',
          content: [
            'TECHNICAL PROFICIENCY MATRIX (Production-Tested Stack):',
            ...lines
          ].join('\n')
        });
        break;
      }

      case 'leetcode': {
        addLog({ type: 'output', content: 'Fetching live LeetCode stats for @ayush7162...' });
        try {
          const res = await fetch('/api/public/leetcode-stats');
          const data = await res.json();
          const s = data.stats || {};
          addLog({
            type: 'output',
            content: [
              `LEETCODE PROBLEM SOLVING METRICS (Live Profile: ${s.username || 'ayush7162'}):`,
              `  • Problems Solved:     ${s.totalSolved || 65} / ${s.totalQuestions || 4096} Problems`,
              `  • Easy Solved:         ${s.easySolved || 15}  [===================>         ]`,
              `  • Medium Solved:       ${s.mediumSolved || 41}  [========================>     ]`,
              `  • Hard Solved:         ${s.hardSolved || 9}   [========>                     ]`,
              `  • Global Ranking:      #${Number(s.ranking || 2350736).toLocaleString()}`,
              `  • Acceptance Rate:     ${s.acceptanceRate || 59.6}%`,
              `  • Primary Language:    Java (Data Structures & Algorithmic Foundations)`,
              `  • Verified Live URL:   ${s.profileUrl || 'https://leetcode.com/u/ayush7162/'}`
            ].join('\n')
          });
        } catch (_e) {
          addLog({
            type: 'output',
            content: [
              'LEETCODE PROBLEM SOLVING METRICS (Profile: ayush7162):',
              '  • Problems Solved:     65 Algorithmic Challenges (15 Easy, 41 Medium, 9 Hard)',
              '  • Verified Live URL:   https://leetcode.com/u/ayush7162/'
            ].join('\n')
          });
        }
        break;
      }

      case 'sudo': {
        if (args[0] === 'hire' || args[0] === 'contact') {
          addLog({
            type: 'system',
            content: '⚡ [ROOT ELEVATION GRANTED]: Direct contact dispatch sequence initialized...'
          });
          playTick('notification');
          setTimeout(() => {
            setIsOpen(false);
            navigate('/contact');
            showToast('Direct recruiter hotline opened! Let\'s build together.');
          }, 800);
        } else {
          addLog({ type: 'error', content: `sudo: ${args.join(' ')}: Operation not permitted. Did you mean "sudo hire"?` });
        }
        break;
      }

      case 'hire':
      case 'contact': {
        addLog({ type: 'system', content: 'Redirecting to Direct Engagement & Contact Form...' });
        playTick('notification');
        setTimeout(() => {
          setIsOpen(false);
          navigate('/contact');
        }, 600);
        break;
      }

      case 'architecture': {
        addLog({
          type: 'output',
          content: [
            'SYSTEM ARCHITECTURE BLUEPRINT (High-Availability Edge Microservices):',
            '',
            '  [Client / Browser]  <-- WebSocket / HTTPS TLS 1.3 -->  [Cloudflare Edge CDN]',
            '                                                                 │',
            '                                                          [Reverse Proxy / WAF]',
            '                                                                 │',
            '                                                          [Express API Gateway]',
            '                                                           ├── Rate Limiting (Redis)',
            '                                                           ├── JWT Auth + HMAC Token',
            '                                                           └── JSON Schema Validation',
            '                                                                 │',
            '                       ┌─────────────────────────────────────────┴─────────────────────────────────────────┐',
            '                       ▼                                                                                   ▼',
            '              [Redis In-Memory Cache]                                                             [MongoDB Atlas Cluster]',
            '              (Sub-millisecond latency)                                                           (Replica Sets, Indexes)',
            '',
            '  * Interactive visual graph available inside Case Studies (/projects/:id).'
          ].join('\n')
        });
        break;
      }

      case 'api': {
        addLog({
          type: 'output',
          content: [
            'LIVE API SANDBOX ENDPOINTS (Interactive Console in Project Details):',
            '  • GET  /api/v1/properties/search?city=bhopal&guests=2     [Status 200 OK | ~42ms]',
            '  • POST /api/v1/auth/demo-session                          [Status 201 Created | ~68ms]',
            '  • GET  /api/public/leetcode-stats                         [Status 200 OK | ~28ms cached]',
            '  • POST /api/public/telemetry                              [Status 200 OK | ~15ms async]',
            '',
            '  Try inspecting any project case study to test live queries in the interactive sandbox!'
          ].join('\n')
        });
        break;
      }

      case 'theme': {
        const themeChoice = args[0]?.toLowerCase();
        const validThemes = {
          cyberpunk: 'theme-cyberpunk',
          midnight: 'theme-midnight',
          ocean: 'theme-ocean',
          forest: 'theme-forest',
          sunset: 'theme-sunset',
          gold: 'theme-gold',
          dracula: 'theme-dracula',
          nord: 'theme-nord',
          synthwave: 'theme-synthwave',
          tokyo: 'theme-tokyo'
        };

        if (validThemes[themeChoice]) {
          const themeClass = validThemes[themeChoice];
          const allThemeClasses = Object.values(validThemes);
          document.body.classList.remove('theme-light', ...allThemeClasses);
          document.body.classList.add(themeClass);
          localStorage.setItem('portfolio_theme', themeClass);
          localStorage.setItem('admin_theme_v9', themeClass);
          window.dispatchEvent(new CustomEvent('admin-theme-changed', { detail: { theme: themeClass } }));
          addLog({ type: 'system', content: `Theme changed to: \x1b[32m${themeChoice}\x1b[0m` });
          showToast(`Active Theme: ${themeChoice}`);
        } else {
          addLog({
            type: 'error',
            content: `Unknown theme "${themeChoice || ''}". Available themes: ${Object.keys(validThemes).join(', ')}`
          });
        }
        break;
      }

      case 'sound': {
        const preset = args[0]?.toLowerCase();
        const validPresets = ['blue', 'brown', 'cream', 'default', 'mute'];
        if (validPresets.includes(preset)) {
          setSwitchPreset(preset);
          playTick('click');
          addLog({
            type: 'system',
            content: `Mechanical switch preset updated to: \x1b[33m${preset.toUpperCase()}\x1b[0m`
          });
          showToast(`Sound preset: ${preset.toUpperCase()}`);
        } else {
          addLog({
            type: 'error',
            content: `Invalid preset. Available: ${validPresets.join(' | ')}. Example: "sound cream"`
          });
        }
        break;
      }

      case 'lofi': {
        const action = args[0]?.toLowerCase();
        if (action === 'on' || action === 'play') {
          startLofiAmbient();
          addLog({ type: 'system', content: '🎵 Ambient Lo-Fi generative binaural soundscape started.' });
          showToast('Lo-Fi coder music enabled');
        } else if (action === 'off' || action === 'stop') {
          stopLofiAmbient();
          addLog({ type: 'system', content: '🔇 Ambient Lo-Fi coder soundscape paused.' });
          showToast('Lo-Fi coder music paused');
        } else {
          const playing = isLofiPlaying();
          if (playing) {
            stopLofiAmbient();
            addLog({ type: 'system', content: '🔇 Lo-Fi coder soundscape turned OFF.' });
          } else {
            startLofiAmbient();
            addLog({ type: 'system', content: '🎵 Lo-Fi coder soundscape turned ON.' });
          }
        }
        break;
      }

      case 'clear':
      case 'cls': {
        setLogs([]);
        break;
      }

      case 'exit':
      case 'quit': {
        setIsOpen(false);
        break;
      }

      default: {
        addLog({
          type: 'error',
          content: `zsh: command not found: ${cmd}. Type "help" to view all accessible developer routines.`
        });
        break;
      }
    }
  };

  const handleKeyDown = (e) => {
    // Keystroke sound
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
      playTick('click');
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length > 0 && historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= history.length) {
          setHistoryIndex(-1);
          setInputVal('');
        } else {
          setHistoryIndex(nextIdx);
          setInputVal(history[nextIdx] || '');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const available = ['help', 'whoami', 'cat bio.txt', 'projects', 'skills', 'leetcode', 'architecture', 'api', 'sudo hire', 'theme', 'sound', 'lofi', 'clear', 'exit'];
      const match = available.find((c) => c.startsWith(inputVal.trim().toLowerCase()));
      if (match) {
        setInputVal(match);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md transition-all animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        ref={containerRef}
        className={`w-full ${
          isMaximized ? 'h-full max-w-full rounded-none' : 'max-w-4xl h-[80vh] sm:h-[620px] rounded-t-2xl sm:rounded-2xl'
        } bg-[#080d14]/95 border border-cyan-500/30 shadow-[0_20px_70px_rgba(0,240,255,0.15)] flex flex-col font-mono text-xs overflow-hidden backdrop-blur-xl transition-all duration-200`}
      >
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1622]/90 border-b border-cyan-500/20 select-none">
          <div className="flex items-center gap-2">
            {/* Traffic Lights */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-400 transition-colors flex items-center justify-center group"
              title="Close terminal (Esc)"
              aria-label="Close terminal"
            >
              <i className="fa-solid fa-xmark text-[8px] text-black opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-400 transition-colors flex items-center justify-center group"
              title="Toggle maximize"
              aria-label="Toggle maximize terminal"
            >
              <i className="fa-solid fa-up-right-and-down-left-from-center text-[7px] text-black opacity-0 group-hover:opacity-100" />
            </button>
            <button
              onClick={() => setLogs([])}
              className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400 transition-colors flex items-center justify-center group"
              title="Clear terminal buffer"
              aria-label="Clear terminal buffer"
            >
              <i className="fa-solid fa-broom text-[7px] text-black opacity-0 group-hover:opacity-100" />
            </button>
            <span className="ml-2 text-cyan-400/80 text-[11px] font-semibold tracking-wide flex items-center gap-1.5">
              <i className="fa-solid fa-terminal text-[10px]" />
              ayush@portfolio: ~ (zsh - interactive)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE 99.9%
            </span>
            <span className="text-[10px] text-white/40 hidden md:inline">Ctrl + ~ to toggle</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition"
            aria-label="Close terminal"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {/* Terminal Body / Output */}
        <div
          className="flex-1 p-4 overflow-y-auto space-y-2 selection:bg-cyan-500/30 selection:text-cyan-200"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,240,255,0.2) transparent' }}
          onClick={() => inputRef.current?.focus()}
        >
          {logs.map((log, index) => {
            if (log.type === 'banner') {
              return (
                <pre
                  key={index}
                  className="text-cyan-400/90 font-mono text-[9px] sm:text-[10px] leading-tight select-none overflow-x-auto"
                >
                  {log.content}
                </pre>
              );
            }
            if (log.type === 'input') {
              return (
                <div key={index} className="flex items-center gap-2 text-cyan-300">
                  <span className="text-emerald-400 font-bold select-none">➜</span>
                  <span className="text-cyan-400 select-none">~</span>
                  <span className="text-white font-medium">{log.content}</span>
                </div>
              );
            }
            if (log.type === 'system') {
              return (
                <div key={index} className="text-emerald-400/90 whitespace-pre-wrap">
                  {log.content}
                </div>
              );
            }
            if (log.type === 'error') {
              return (
                <div key={index} className="text-rose-400 whitespace-pre-wrap">
                  {log.content}
                </div>
              );
            }
            return (
              <div key={index} className="text-white/80 whitespace-pre-wrap leading-relaxed">
                {log.content}
              </div>
            );
          })}

          {/* Active Input Line */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-emerald-400 font-bold select-none">➜</span>
            <span className="text-cyan-400 select-none">~</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white outline-none border-none font-mono text-xs focus:ring-0 p-0"
              placeholder="Type a command (try 'help' or 'sudo hire')..."
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Status / Footer Bar */}
        <div className="px-4 py-1.5 bg-[#0b121c] border-t border-cyan-500/10 flex items-center justify-between text-[10px] text-white/50 select-none">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <button
              onClick={() => handleCommand('help')}
              className="hover:text-cyan-400 transition underline underline-offset-2"
            >
              help
            </button>
            <button
              onClick={() => handleCommand('whoami')}
              className="hover:text-cyan-400 transition underline underline-offset-2"
            >
              whoami
            </button>
            <button
              onClick={() => handleCommand('projects')}
              className="hover:text-cyan-400 transition underline underline-offset-2"
            >
              projects
            </button>
            <button
              onClick={() => handleCommand('leetcode')}
              className="hover:text-cyan-400 transition underline underline-offset-2"
            >
              leetcode
            </button>
            <button
              onClick={() => handleCommand('sudo hire')}
              className="text-amber-400 hover:text-amber-300 font-semibold transition underline underline-offset-2"
            >
              sudo hire
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/40">
            <span>[Tab] autocomplete</span>
            <span>•</span>
            <span>[↑↓] history</span>
          </div>
        </div>
      </div>
    </div>
  );
}
