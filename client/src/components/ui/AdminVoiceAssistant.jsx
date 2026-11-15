import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTick, playVoiceSuccessChime, playVoiceErrorChime } from '../../utils/audio';

/* ─────────────────────────────────────────────────────────────────
   Supported recognition languages
───────────────────────────────────────────────────────────────── */
const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)', flag: '🇮🇳' },
  { code: 'en-US', label: 'English (US)',    flag: '🇺🇸' },
  { code: 'hi-IN', label: 'Hindi / Hinglish', flag: '🇮🇳' }
];

/* ─────────────────────────────────────────────────────────────────
   Command table — each entry has a list of string triggers and
   the action to run when matched.
   We match by checking: clean.includes(trigger) for each trigger.
───────────────────────────────────────────────────────────────── */
function buildCommandTable({ navigate, onSelectTab, onOpenAddProject, showToast, autoClose, stopListeningFn, setActiveFn, onClose }) {
  const dispatchTab = (tab) => {
    window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab } }));
    if (onSelectTab) onSelectTab(tab);
    navigate(tab === 'dashboard' ? '/admin' : `/admin?tab=${tab}`);
  };

  return [
    // ── 1. Add / Create new project (must come BEFORE generic "project")
    {
      id: 'add-project',
      triggers: ['add new project', 'add project', 'create project', 'new project', 'naya project', 'project form', 'project banao', 'project karo', 'project kholo', 'project creator', 'project wizard'],
      fuzzy: (c) =>
        c.includes('project') &&
        (c.includes('add') || c.includes('create') || c.includes('new') || c.includes('banao') || c.includes('karo') || c.includes('form') || c.includes('wizard')),
      action: (toast) => {
        dispatchTab('projects');
        navigate('/admin?tab=projects&create=true');
        window.dispatchEvent(new CustomEvent('ams-create-project'));
        if (onOpenAddProject) { try { onOpenAddProject(); } catch (_) {} }
        toast('Voice Command: Opening Project Creator Form', 'fa-plus');
      },
      label: 'Add New Project'
    },

    // ── 2. Projects CMS (generic)
    {
      id: 'projects',
      triggers: ['projects', 'go to projects', 'open projects', 'show projects', 'projects dikhao', 'portfolio work'],
      fuzzy: (c) => c.includes('project'),
      action: (toast) => {
        dispatchTab('projects');
        navigate('/admin?tab=projects');
        toast('Voice Command: Navigating to Projects CMS', 'fa-layer-group');
      },
      label: 'Go to Projects'
    },

    // ── 3. Messages / Inbox
    {
      id: 'messages',
      triggers: ['messages', 'inbox', 'check messages', 'mail', 'contact', 'sandesh', 'inquiries'],
      fuzzy: (c) => c.includes('message') || c.includes('inbox') || c.includes('contact') || c.includes('sandesh') || c.includes('mail') || c.includes('inquir'),
      action: (toast) => {
        dispatchTab('messages');
        navigate('/admin?tab=messages');
        toast('Voice Command: Opening Messages & Inquiries', 'fa-envelope');
      },
      label: 'Go to Messages'
    },

    // ── 4. Overview / Dashboard
    {
      id: 'dashboard',
      triggers: ['overview', 'dashboard', 'admin home', 'shuru', 'summary', 'go home'],
      fuzzy: (c) => c.includes('overview') || c.includes('dashboard') || c.includes('shuru') || c.includes('summary'),
      action: (toast) => {
        dispatchTab('dashboard');
        navigate('/admin');
        toast('Voice Command: Navigating to Overview Dashboard', 'fa-chart-pie');
      },
      label: 'Go to Dashboard'
    },

    // ── 5. Certificates
    {
      id: 'certificates',
      triggers: ['certificates', 'certificate', 'cert', 'certs', 'credential', 'degree', 'diploma'],
      fuzzy: (c) => c.includes('certificate') || c.includes('cert') || c.includes('credential') || c.includes('degree') || c.includes('diploma'),
      action: (toast) => {
        dispatchTab('certificates');
        navigate('/admin?tab=certificates');
        toast('Voice Command: Navigating to Certificates CMS', 'fa-shield-halved');
      },
      label: 'Go to Certificates'
    },

    // ── 6. Skills
    {
      id: 'skills',
      triggers: ['skills', 'skill', 'tech stack', 'technologies', 'technology'],
      fuzzy: (c) => c.includes('skill') || c.includes('tech stack') || c.includes('technolog'),
      action: (toast) => {
        dispatchTab('skills');
        navigate('/admin?tab=skills');
        toast('Voice Command: Navigating to Skills CMS', 'fa-code');
      },
      label: 'Go to Skills'
    },

    // ── 7a. New Milestone (before generic milestone)
    {
      id: 'new-milestone',
      triggers: ['new milestone', 'add milestone', 'create milestone', 'milestone banao'],
      fuzzy: (c) =>
        (c.includes('milestone') || c.includes('journey') || c.includes('timeline') || c.includes('achievement')) &&
        (c.includes('new') || c.includes('add') || c.includes('create') || c.includes('banao') || c.includes('form') || c.includes('wizard')),
      action: (toast) => {
        dispatchTab('milestones');
        navigate('/admin?tab=milestones&create=true');
        window.dispatchEvent(new CustomEvent('ams-open-milestone-wizard'));
        toast('Voice Command: Creating New Milestone', 'fa-plus');
      },
      label: 'New Milestone'
    },

    // ── 7b. Milestones / Journey (generic)
    {
      id: 'milestones',
      triggers: ['milestones', 'milestone', 'journey', 'timeline', 'career', 'achievements'],
      fuzzy: (c) => c.includes('milestone') || c.includes('journey') || c.includes('timeline') || c.includes('career') || c.includes('achievement'),
      action: (toast) => {
        dispatchTab('milestones');
        navigate('/admin?tab=milestones');
        toast('Voice Command: Navigating to Career Milestones CMS', 'fa-trophy');
      },
      label: 'Go to Milestones'
    },

    // ── 8. Appearance (design settings)
    {
      id: 'appearance',
      triggers: ['appearance', 'design', 'color', 'rang'],
      fuzzy: (c) => c.includes('appearance') || c.includes('design') || c.includes('colour') || c.includes('color') || c.includes('rang'),
      action: (toast) => {
        dispatchTab('appearance');
        toast('Voice Command: Navigating to Appearance Studio', 'fa-palette');
      },
      label: 'Go to Appearance'
    },

    // ── 10. Analytics
    {
      id: 'analytics',
      triggers: ['analytics', 'telemetry', 'statistics', 'traffic', 'metrics', 'visitors'],
      fuzzy: (c) => c.includes('analytic') || c.includes('telemetry') || c.includes('stat') || c.includes('traffic') || c.includes('metric') || c.includes('visitor'),
      action: (toast) => {
        dispatchTab('analytics');
        toast('Voice Command: Opening Visitor Analytics', 'fa-chart-line');
      },
      label: 'Go to Analytics'
    },

    // ── 11. SEO
    {
      id: 'seo',
      triggers: ['seo', 'metadata', 'search engine', 'meta tag'],
      fuzzy: (c) => c.includes('seo') || c.includes('metadata') || c.includes('search engine') || c.includes('meta'),
      action: (toast) => {
        dispatchTab('seo');
        toast('Voice Command: Opening SEO & Metadata', 'fa-magnifying-glass-chart');
      },
      label: 'Go to SEO'
    },

    // ── 12. Settings
    {
      id: 'settings',
      triggers: ['settings', 'site settings', 'preferences', 'config'],
      fuzzy: (c) => c.includes('setting') || c.includes('preference') || c.includes('config'),
      action: (toast) => {
        dispatchTab('settings');
        toast('Voice Command: Opening Site Settings', 'fa-gear');
      },
      label: 'Go to Settings'
    },

    // ── 13. Security
    {
      id: 'security',
      triggers: ['security', 'password', 'authentication', 'suraksha'],
      fuzzy: (c) => c.includes('security') || c.includes('password') || c.includes('auth') || c.includes('suraksha'),
      action: (toast) => {
        dispatchTab('security');
        toast('Voice Command: Opening Security CMS', 'fa-shield-halved');
      },
      label: 'Go to Security'
    },

    // ── 14. Profile
    {
      id: 'profile',
      triggers: ['profile', 'bio', 'about me', 'parichay'],
      fuzzy: (c) => c.includes('profile') || c.includes(' bio') || c.includes('about') || c.includes('parichay'),
      action: (toast) => {
        dispatchTab('profile');
        toast('Voice Command: Opening Profile & About', 'fa-user-pen');
      },
      label: 'Go to Profile'
    },

    // ── 15. Hero Portrait / Media
    {
      id: 'media',
      triggers: ['hero', 'portrait', 'avatar', 'photo', 'media'],
      fuzzy: (c) => c.includes('hero') || c.includes('portrait') || c.includes('avatar') || c.includes('photo') || c.includes('media'),
      action: (toast) => {
        dispatchTab('media');
        toast('Voice Command: Opening Hero Portrait Studio', 'fa-image');
      },
      label: 'Go to Hero Portrait'
    },

    // ── 16. View Live Site
    {
      id: 'live-site',
      triggers: ['view live site', 'live site', 'public site', 'view website', 'open website'],
      fuzzy: (c) => c.includes('live site') || c.includes('public site') || c.includes('view site') || c.includes('website') || c.includes('view live'),
      action: (toast) => {
        navigate('/');
        toast('Voice Command: Opening Live Portfolio', 'fa-arrow-up-right-from-square');
      },
      label: 'View Live Site'
    },

    // ── 17. Focus Mode
    {
      id: 'focus',
      triggers: ['focus mode', 'fullscreen', 'full screen', 'zoom mode'],
      fuzzy: (c) => c.includes('focus') || c.includes('fullscreen') || c.includes('full screen') || c.includes('zoom'),
      action: (toast) => {
        const willFocus = !document.body.classList.contains('focus-mode');
        if (willFocus) {
          document.body.classList.add('focus-mode');
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } else {
          document.body.classList.remove('focus-mode');
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
        toast('Voice Command: Toggling Focus Mode', 'fa-expand');
      },
      label: 'Toggle Focus Mode',
      keepOpen: true
    },

    // ── 18. Terminal
    {
      id: 'terminal',
      triggers: ['terminal', 'cli', 'console', 'developer terminal'],
      fuzzy: (c) => c.includes('terminal') || c.includes(' cli') || c.includes('console'),
      action: (toast) => {
        window.dispatchEvent(new CustomEvent('ams-open-terminal'));
        toast('Voice Command: Opening Developer Terminal', 'fa-terminal');
      },
      label: 'Open Terminal'
    },

    // ── 19. Shortcuts
    {
      id: 'shortcuts',
      triggers: ['shortcuts', 'keyboard shortcuts', 'keymap', 'cheat sheet', 'help'],
      fuzzy: (c) => c.includes('shortcut') || c.includes('keymap') || c.includes('cheat') || c.includes('help'),
      action: (toast) => {
        window.dispatchEvent(new CustomEvent('ams-open-shortcuts'));
        toast('Voice Command: Showing Shortcuts', 'fa-keyboard');
      },
      label: 'Keyboard Shortcuts'
    },

    // ── 20. Logout
    {
      id: 'logout',
      triggers: ['logout', 'log out', 'sign out'],
      fuzzy: (c) => c.includes('logout') || c.includes('log out') || c.includes('sign out'),
      action: (toast) => {
        window.dispatchEvent(new CustomEvent('ams-admin-logout'));
        toast('Voice Command: Initiating Admin Sign Out', 'fa-right-from-bracket');
      },
      label: 'Sign Out'
    },

    // ── 21. Close Assistant
    {
      id: 'close',
      triggers: ['stop', 'close', 'exit', 'cancel', 'band karo', 'hatao', 'close assistant'],
      fuzzy: (c) => c.includes('stop') || c.includes('close') || c.includes('exit') || c.includes('cancel') || c.includes('band') || c.includes('hatao'),
      action: (toast) => {
        toast('Voice Assistant Closed', 'fa-microphone-slash');
        stopListeningFn();
        setActiveFn(false);
        if (onClose) onClose();
      },
      label: 'Close',
      keepOpen: false,
      noAutoClose: true
    }
  ];
}

/* ─────────────────────────────────────────────────────────────────
   Match a command string against the table.
   Returns the first matching entry, or null.
───────────────────────────────────────────────────────────────── */
function matchCommand(text, table) {
  const clean = text.toLowerCase().trim();
  if (!clean) return null;

  for (const cmd of table) {
    // 1. Exact trigger match first (most reliable)
    if (cmd.triggers.some((tr) => clean === tr || clean.includes(tr))) {
      return cmd;
    }
  }
  for (const cmd of table) {
    // 2. Fuzzy match fallback
    if (cmd.fuzzy && cmd.fuzzy(clean)) {
      return cmd;
    }
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   AdminVoiceAssistant Component
═══════════════════════════════════════════════════════════════ */
export function AdminVoiceAssistant({
  isOpen,
  onClose,
  showToast,
  onSelectTab,
  onOpenAddProject
}) {
  const [active, setActive] = useState(isOpen || false);

  // 'idle' | 'requesting' | 'listening' | 'processing' | 'executing' | 'error' | 'unsupported'
  const [status, setStatus] = useState('idle');
  const [selectedLang, setSelectedLang] = useState(() =>
    typeof navigator !== 'undefined' && navigator.language?.startsWith('hi') ? 'hi-IN' : 'en-IN'
  );
  const [autoClose, setAutoClose] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [micLevel, setMicLevel] = useState(0); // 0-100 animated level

  const navigate = useNavigate();

  /* ── Refs (avoid stale closure issues) ── */
  const statusRef = useRef('idle');
  const wantedRef = useRef(false);           // should recognition be active?
  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastExecRef = useRef({ text: '', ts: 0 });
  const selectedLangRef = useRef(selectedLang);
  const autoCloseRef = useRef(autoClose);

  // Keep refs in sync with state
  useEffect(() => { selectedLangRef.current = selectedLang; }, [selectedLang]);
  useEffect(() => { autoCloseRef.current = autoClose; }, [autoClose]);

  /* ── Status helper ── */
  const setStatusBoth = useCallback((s) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  /* ── Animated mic level bars ── */
  const startAnim = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    let t = 0;
    const tick = () => {
      t += 0.14;
      const s = statusRef.current;
      if (s === 'processing') {
        setMicLevel(Math.round(55 + Math.sin(t * 2.5) * 28 + Math.cos(t * 4) * 12));
      } else if (s === 'listening' || s === 'requesting') {
        setMicLevel(Math.round(18 + Math.sin(t) * 8));
      } else {
        setMicLevel(0);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const stopAnim = useCallback(() => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    setMicLevel(0);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     STOP LISTENING — fully tears down current recognition session
  ───────────────────────────────────────────────────────────── */
  const stopListening = useCallback(() => {
    wantedRef.current = false;
    if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }
    if (recognitionRef.current) {
      try { recognitionRef.current.onend = null; recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }
    stopAnim();
    if (statusRef.current !== 'executing') setStatusBoth('idle');
    window.dispatchEvent(new CustomEvent('ams-voice-active', { detail: { active: false } }));
  }, [setStatusBoth, stopAnim]);

  /* ─────────────────────────────────────────────────────────────
     EXECUTE COMMAND — matches and runs the first matching rule
  ───────────────────────────────────────────────────────────── */
  const executeCommand = useCallback((text) => {
    const clean = text.toLowerCase().trim();
    if (!clean || clean.length < 2) return;

    // Deduplication: skip if same text ran within last 1.8s
    const now = Date.now();
    if (
      statusRef.current === 'executing' ||
      (now - lastExecRef.current.ts < 1800 &&
        (clean === lastExecRef.current.text ||
          clean.startsWith(lastExecRef.current.text) ||
          lastExecRef.current.text.startsWith(clean)))
    ) return;

    const table = buildCommandTable({
      navigate,
      onSelectTab,
      onOpenAddProject,
      showToast,
      autoClose: autoCloseRef.current,
      stopListeningFn: stopListening,
      setActiveFn: setActive,
      onClose
    });

    const match = matchCommand(clean, table);

    if (!match) {
      // Unrecognized
      setFeedbackMsg(`❓ Not recognized: "${text}". Try tapping a chip below or type a command.`);
      playVoiceErrorChime();
      setStatusBoth(wantedRef.current ? 'listening' : 'idle');
      setTranscript('');
      return;
    }

    // Execute
    setFeedbackMsg('');
    setStatusBoth('executing');
    lastExecRef.current = { text: clean, ts: now };
    setLastCommand(match.label);
    playVoiceSuccessChime();

    try { match.action(showToast); } catch (err) { console.warn('Voice action error:', err); }

    const keepOpen = match.keepOpen === true;
    const noAutoClose = match.noAutoClose === true;

    if (!noAutoClose && autoCloseRef.current && !keepOpen) {
      // Auto-dismiss after 400ms so user sees "Executing" feedback briefly
      setTimeout(() => {
        stopListening();
        setActive(false);
        if (onClose) onClose();
      }, 400);
    } else {
      setTimeout(() => {
        setStatusBoth(wantedRef.current ? 'listening' : 'idle');
        setTranscript('');
      }, 1000);
    }
  }, [navigate, onClose, onOpenAddProject, onSelectTab, showToast, setStatusBoth, stopListening]);

  /* ─────────────────────────────────────────────────────────────
     START LISTENING
     ─────────────────────────────────────────────────────────
     Strategy (avoids Windows hardware contention):
     1. Check mic permission ONLY via navigator.permissions.query
        — do NOT call getUserMedia before recognition starts
     2. Create a fresh webkitSpeechRecognition with continuous:false
     3. Auto-restart in onend if wantedRef is still true
     ───────────────────────────────────────────────────────── */
  const startListening = useCallback(async () => {
    if (statusRef.current === 'executing') return;
    wantedRef.current = true;
    setErrorMsg(null);
    setFeedbackMsg('');

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatusBoth('unsupported');
      setErrorMsg('Web Speech API is not supported in this browser. Use the text input below.');
      return;
    }

    // ── Permission check (query only — no getUserMedia hardware grab) ──
    setStatusBoth('requesting');
    startAnim();

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const perm = await navigator.permissions.query({ name: 'microphone' });
        if (perm.state === 'denied') {
          wantedRef.current = false;
          setStatusBoth('error');
          stopAnim();
          setErrorMsg('🎙 Microphone BLOCKED. Click the lock/tune icon in Chrome address bar → set Microphone to "Allow" → reload the page.');
          return;
        }
        // 'prompt' or 'granted' — proceed (SpeechRecognition will trigger the prompt itself)
      } catch (_) { /* permissions API not available on this browser — proceed anyway */ }
    }

    // ── Abort any existing recognition ──
    if (recognitionRef.current) {
      try { recognitionRef.current.onend = null; recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    // ── Create new recognition session ──
    const recognition = new SR();
    recognition.continuous = false;      // More reliable on Windows — restart manually
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = selectedLangRef.current;

    let sessionFinalText = '';
    let debounceTimer = null;

    recognition.onstart = () => {
      setStatusBoth('listening');
      setErrorMsg(null);
      window.dispatchEvent(new CustomEvent('ams-voice-active', { detail: { active: true } }));
    };

    recognition.onspeechstart = () => {
      if (statusRef.current !== 'executing') setStatusBoth('processing');
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          finalText += r[0].transcript;
        } else {
          interimText += r[0].transcript;
        }
      }

      const display = (finalText || interimText).trim();
      if (display) {
        setTranscript(display);
        if (statusRef.current !== 'executing') setStatusBoth('processing');
      }

      if (finalText.trim()) {
        sessionFinalText = finalText.trim();
        // Clear any pending debounce and execute immediately on final result
        if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
        executeCommand(sessionFinalText);
      }
      // Do NOT execute on interim — this was causing wrong commands
    };

    recognition.onspeechend = () => {
      // If we have text but no final result yet, wait a moment then execute from interim
      if (!sessionFinalText && transcript.trim()) {
        if (debounceTimer) clearTimeout(debounceTimer);
        const captured = transcript.trim();
        debounceTimer = setTimeout(() => {
          if (!sessionFinalText && captured) executeCommand(captured);
        }, 350);
      }
    };

    recognition.onerror = (event) => {
      console.warn('[VoiceAssistant] SpeechRecognition error:', event.error);
      if (event.error === 'not-allowed') {
        wantedRef.current = false;
        setStatusBoth('error');
        stopAnim();
        setErrorMsg('🎙 Microphone permission denied. Click the tune/lock icon in the Chrome address bar, set Microphone to "Allow", then click "Start Listening" again.');
      } else if (event.error === 'audio-capture') {
        wantedRef.current = false;
        setStatusBoth('error');
        stopAnim();
        setErrorMsg('🎙 No microphone detected or mic is muted. Check Windows mic settings and Lenovo F4 mute key.');
      } else if (event.error === 'network') {
        setStatusBoth('error');
        stopAnim();
        setErrorMsg('🌐 Google Speech service is unreachable (network error). Check your internet connection. You can still use typed commands below.');
      } else if (event.error === 'no-speech') {
        // no-speech is normal — just restart quietly
      } else if (event.error === 'aborted') {
        // Manual abort — ignore
      } else {
        setErrorMsg(`Voice notice: ${event.error} — try again or use typed commands.`);
      }
    };

    recognition.onend = () => {
      if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }

      // Don't restart if stopped intentionally, or in error/executing state
      if (!wantedRef.current || statusRef.current === 'error' || statusRef.current === 'executing') {
        if (statusRef.current !== 'executing' && statusRef.current !== 'error') setStatusBoth('idle');
        stopAnim();
        window.dispatchEvent(new CustomEvent('ams-voice-active', { detail: { active: false } }));
        return;
      }

      // Auto-restart after short pause (continuous listening loop)
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      restartTimerRef.current = setTimeout(() => {
        if (wantedRef.current && statusRef.current !== 'executing' && statusRef.current !== 'error') {
          startListening();
        }
      }, 300);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      setStatusBoth('error');
      stopAnim();
      setErrorMsg(err.message || 'Failed to start speech recognition. Try refreshing the page.');
    }
  }, [executeCommand, setStatusBoth, startAnim, stopAnim, stopListening]);

  /* ── Language switch ── */
  const handleLangSwitch = (code) => {
    playTick();
    setSelectedLang(code);
    selectedLangRef.current = code;
    if (wantedRef.current) {
      // Restart recognition with new language
      if (recognitionRef.current) {
        try { recognitionRef.current.onend = null; recognitionRef.current.abort(); } catch (_) {}
        recognitionRef.current = null;
      }
      setTimeout(() => startListening(), 150);
    }
  };

  /* ── Manual typed command ── */
  const [manualInput, setManualInput] = useState('');
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setTranscript(manualInput.trim());
    executeCommand(manualInput.trim());
    setManualInput('');
  };

  /* ── Sync with isOpen prop ── */
  useEffect(() => {
    if (isOpen) {
      setActive(true);
      startListening();
    } else if (isOpen === false) {
      setActive(false);
      stopListening();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ── Global ams-toggle-voice event ── */
  useEffect(() => {
    const onToggle = () => {
      setActive((prev) => {
        const next = !prev;
        if (next) { playTick(); setTimeout(() => startListening(), 100); }
        else stopListening();
        return next;
      });
    };
    window.addEventListener('ams-toggle-voice', onToggle);
    return () => window.removeEventListener('ams-toggle-voice', onToggle);
  }, [startListening, stopListening]);

  /* ── Cleanup on unmount ── */
  useEffect(() => () => stopListening(), [stopListening]);

  if (!active) return null;

  const micActive = status === 'listening' || status === 'processing' || status === 'executing' || status === 'requesting';

  /* ── Quick chips (always work via typed execution, no mic needed) ── */
  const chips = [
    { label: '➕ Add Project',  cmd: 'add project' },
    { label: '📁 Projects',     cmd: 'go to projects' },
    { label: '✉️ Messages',    cmd: 'check messages' },
    { label: '📊 Overview',     cmd: 'overview' },
    { label: '🏆 Milestones',   cmd: 'new milestone' },
    { label: '📜 Certificates', cmd: 'certificates' },
    { label: '💻 Terminal',     cmd: 'terminal' },
    { label: '🌐 Live Site',    cmd: 'view live site' }
  ];

  return (
    <div
      className="admin-voice-backdrop fixed inset-0 z-[10000000] flex items-center justify-center p-4 pt-20 md:pt-24 bg-black/80 backdrop-blur-md"
      style={{ animation: 'fadeIn .18s ease' }}
      role="dialog"
      aria-modal="true"
      aria-label="Voice Command Assistant"
      onClick={() => { stopListening(); setActive(false); if (onClose) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-yellow-500/30 bg-zinc-950/95 p-6 shadow-2xl text-white space-y-4 text-center overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 7rem)', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow halo */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          status === 'executing' ? 'bg-emerald-500/30' :
          status === 'processing' ? 'bg-cyan-500/30' :
          status === 'error' || status === 'unsupported' ? 'bg-rose-500/30' :
          'bg-yellow-500/20'
        }`} />

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
            <h2 className="text-base font-bold text-white m-0 tracking-tight">Admin Voice Navigator</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Language pills */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLangSwitch(lang.code)}
                  className={`px-2 py-0.5 text-[10px] font-sans rounded-md transition-all ${
                    selectedLang === lang.code
                      ? 'bg-yellow-400 text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={lang.label}
                >
                  {lang.flag} {lang.code.split('-')[0].toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { stopListening(); setActive(false); if (onClose) onClose(); }}
              className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        </div>

        {/* ── Mic orb ── */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center my-1">
          {status === 'listening' && (
            <div className="absolute inset-0 rounded-full border border-amber-400/50 shadow-[0_0_24px_rgba(245,158,11,0.25)] scale-105" />
          )}
          {status === 'processing' && (
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.45)] scale-110" />
          )}
          {status === 'executing' && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/90 shadow-[0_0_35px_rgba(16,185,129,0.5)] scale-110" />
          )}
          {(status === 'error' || status === 'unsupported') && (
            <div className="absolute inset-0 rounded-full border border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]" />
          )}

          <button
            type="button"
            onClick={() => { playTick(); if (micActive) stopListening(); else startListening(); }}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shadow-xl cursor-pointer ${
              status === 'executing'   ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-emerald-500/40 scale-105' :
              status === 'processing' ? 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white shadow-cyan-500/40 scale-105' :
              status === 'requesting' ? 'bg-gradient-to-tr from-yellow-600 to-amber-400 text-black scale-100 animate-pulse' :
              status === 'listening'  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-amber-500/30 scale-100' :
              status === 'error' || status === 'unsupported' ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30' :
              'bg-zinc-800 text-slate-400 border border-white/10 hover:text-white hover:border-yellow-400/40'
            }`}
            title={micActive ? 'Click to pause mic' : 'Click to start listening'}
          >
            {status === 'executing'   ? <i className="fa-solid fa-check text-2xl animate-bounce" /> :
             status === 'processing'  ? <i className="fa-solid fa-microphone text-2xl text-white" /> :
             status === 'requesting'  ? <i className="fa-solid fa-spinner text-2xl animate-spin" /> :
             status === 'listening'   ? <i className="fa-solid fa-microphone text-2xl text-black" /> :
             (status === 'error' || status === 'unsupported') ? <i className="fa-solid fa-triangle-exclamation text-2xl" /> :
             <i className="fa-solid fa-microphone-slash text-2xl" />}
          </button>
        </div>

        {/* ── Soundwave bars ── */}
        <div className="flex items-center justify-center gap-1.5 h-6">
          {[0.5, 0.9, 1.3, 0.8, 0.4].map((mult, idx) => {
            const h = Math.max(20, Math.min(100, Math.round(micLevel * mult + 20)));
            return (
              <span
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-100 ${
                  status === 'processing' ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' :
                  status === 'executing'  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
                  micActive ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' :
                  'bg-zinc-700 opacity-40'
                }`}
                style={{ height: micActive ? `${h}%` : '20%' }}
              />
            );
          })}
        </div>

        {/* ── Status label ── */}
        <div className="text-center min-h-[22px]">
          {status === 'requesting'  && <p className="text-xs text-yellow-400 m-0 inline-flex items-center gap-1.5"><i className="fa-solid fa-spinner animate-spin" /> Requesting microphone permission...</p>}
          {status === 'listening'   && <p className="text-xs text-amber-400/95 m-0 font-medium inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Listening… say a command</p>}
          {status === 'processing'  && <p className="text-xs text-cyan-300 m-0 font-medium inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Hearing your speech…</p>}
          {status === 'executing'   && <p className="text-xs text-emerald-300 m-0 font-bold inline-flex items-center gap-1.5"><i className="fa-solid fa-check text-emerald-400" /> Executing: {lastCommand}</p>}
          {status === 'idle'        && <p className="text-xs text-slate-400 m-0">Mic paused — click the mic icon or tap a chip below</p>}
          {status === 'unsupported' && <p className="text-xs text-amber-400 m-0">Web Speech API not supported — use typed commands below</p>}
          {status === 'error'       && <p className="text-xs text-rose-400 m-0">{errorMsg || 'Microphone error — check permissions or use typed commands'}</p>}
        </div>

        {/* ── Live transcript ── */}
        <div className="min-h-[46px] p-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-sans flex items-center justify-center">
          {transcript ? (
            <span className={status === 'processing' ? 'text-cyan-300 font-medium' : 'text-yellow-300 font-bold'}>
              "{transcript}"
            </span>
          ) : (
            <span className="text-slate-500 italic text-xs">
              Say e.g. "Add project" · "Go to messages" · "Certificates" · "Milestones"
            </span>
          )}
        </div>

        {/* ── Feedback / unrecognized banner ── */}
        {feedbackMsg && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 text-left flex items-start gap-2.5">
            <i className="fa-solid fa-circle-question text-amber-400 text-base mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-white">{feedbackMsg}</div>
              <div className="text-[11px] text-amber-200/80 mt-1">
                Try: "Add project" · "Messages" · "Overview" · "Milestones" · "Certificates" · "Live site"
              </div>
            </div>
          </div>
        )}

        {/* ── Quick chip buttons (always work, no mic needed) ── */}
        <div className="space-y-1.5 pt-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Quick Tap Commands
            </span>
            <label className="text-[10px] text-slate-400 inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoClose}
                onChange={(e) => setAutoClose(e.target.checked)}
                className="rounded accent-yellow-400 w-3 h-3"
              />
              Auto-close on action
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <button
                key={chip.cmd}
                type="button"
                onClick={() => { playTick(); setTranscript(chip.cmd); executeCommand(chip.cmd); }}
                className="px-2.5 py-1 text-xs rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-yellow-400/40 hover:bg-yellow-500/10 transition-all cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Typed input fallback ── */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Or type a command… 'add project', 'certificates', 'milestones'"
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-sans"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Run
          </button>
        </form>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => { playTick(); if (micActive) stopListening(); else startListening(); }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
          >
            <i className={`fa-solid ${micActive ? 'fa-microphone-slash' : 'fa-microphone'} mr-1.5`} />
            {micActive ? 'Pause Mic' : 'Start Listening'}
          </button>
          <button
            type="button"
            onClick={() => { stopListening(); setActive(false); if (onClose) onClose(); }}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminVoiceAssistant;
