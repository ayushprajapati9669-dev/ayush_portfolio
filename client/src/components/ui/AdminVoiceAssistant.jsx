import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTick } from '../../utils/audio';

export function AdminVoiceAssistant({
  isOpen,
  onClose,
  showToast,
  onSelectTab,
  onOpenAddProject,
  onThemeChange
}) {
  const [active, setActive] = useState(isOpen || false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'executing' | 'error' | 'unsupported'
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [unrecognizedCmd, setUnrecognizedCmd] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const recognitionRef = useRef(null);
  const isListeningWantedRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const statusRef = useRef('idle');
  const lastExecutedRef = useRef({ text: '', timestamp: 0 });
  const navigate = useNavigate();

  // Helper to update status in both state and ref
  const updateStatus = (nextStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  };

  const stopListening = useCallback(() => {
    isListeningWantedRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {}
      recognitionRef.current = null;
    }
    updateStatus('idle');
    window.dispatchEvent(new CustomEvent('ams-voice-active', { detail: { active: false } }));
  }, []);

  const handleCommandExecution = useCallback(
    (text) => {
      const clean = text.toLowerCase().trim();
      if (!clean) return;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Deduplication guard: prevent double execution (e.g. when 750ms interim debounce executed, and browser subsequently fires isFinal for identical phrase)
      const now = Date.now();
      if (
        statusRef.current === 'executing' ||
        (now - lastExecutedRef.current.timestamp < 1800 &&
          (clean === lastExecutedRef.current.text ||
            clean.includes(lastExecutedRef.current.text) ||
            lastExecutedRef.current.text.includes(clean)))
      ) {
        return;
      }

      updateStatus('executing');
      setUnrecognizedCmd('');
      lastExecutedRef.current = { text: clean, timestamp: now };

      // Helper to dispatch select tab event
      const dispatchTab = (tab) => {
        window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab } }));
        if (onSelectTab) onSelectTab(tab);
        else navigate(tab === 'dashboard' ? '/admin' : `/admin?tab=${tab}`);
      };

      const finishExecution = (commandName, recognized = true) => {
        if (recognized) {
          setLastCommand(commandName);
          playTick();
        }
        setTimeout(() => {
          if (isListeningWantedRef.current) {
            updateStatus('listening');
          } else {
            updateStatus('idle');
          }
          setTranscript('');
        }, 1200);
      };

      // 1. Projects - Create new project wizard
      if (
        (clean.includes('project') && (clean.includes('add') || clean.includes('create') || clean.includes('new') || clean.includes('wizard'))) ||
        clean === 'add project' || clean === 'create project' || clean === 'new project'
      ) {
        showToast('Voice Command: Opening Project Creator Wizard', 'fa-plus');
        window.dispatchEvent(new CustomEvent('ams-create-project'));
        if (onOpenAddProject) {
          onOpenAddProject();
        } else {
          dispatchTab('projects');
          navigate('/admin?tab=projects&create=true');
        }
        finishExecution('Add Project');
        return;
      }

      // 2. Projects CMS
      if (clean.includes('project')) {
        showToast('Voice Command: Navigating to Projects CMS', 'fa-layer-group');
        dispatchTab('projects');
        finishExecution('Go to Projects');
        return;
      }

      // 3. Messages & Inbox
      if (clean.includes('message') || clean.includes('inbox') || clean.includes('contact') || clean.includes('inquir')) {
        showToast('Voice Command: Opening Messages & Inquiries', 'fa-envelope');
        dispatchTab('messages');
        finishExecution('Go to Messages');
        return;
      }

      // 4. Overview / Dashboard
      if (clean.includes('overview') || clean.includes('dashboard') || clean.includes('home')) {
        showToast('Voice Command: Navigating to Overview Dashboard', 'fa-chart-pie');
        dispatchTab('dashboard');
        finishExecution('Go to Dashboard');
        return;
      }

      // 5. Certificates
      if (clean.includes('certificate') || clean.includes('cert') || clean.includes('credential')) {
        showToast('Voice Command: Navigating to Certificates CMS', 'fa-shield-halved');
        dispatchTab('certificates');
        finishExecution('Go to Certificates');
        return;
      }

      // 6. Skills
      if (clean.includes('skill') || clean.includes('tech stack')) {
        showToast('Voice Command: Navigating to Skills CMS', 'fa-code');
        dispatchTab('skills');
        finishExecution('Go to Skills');
        return;
      }

      // 7. Milestones & Journey
      if (
        clean.includes('milestone') ||
        clean.includes('journey') ||
        clean.includes('timeline') ||
        clean.includes('career') ||
        clean.includes('achievement')
      ) {
        if (
          clean.includes('new') ||
          clean.includes('create') ||
          clean.includes('add') ||
          clean.includes('wizard')
        ) {
          showToast('Voice Command: Creating New Milestone', 'fa-plus');
          dispatchTab('milestones');
          window.dispatchEvent(new CustomEvent('ams-open-milestone-wizard'));
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('ams-open-milestone-wizard'));
          }, 150);
          finishExecution('New Milestone');
          return;
        }
        showToast('Voice Command: Navigating to Career Milestones CMS', 'fa-trophy');
        dispatchTab('milestones');
        finishExecution('Go to Milestones');
        return;
      }

      // 8. Themes & Appearance Studio Presets
      const themePresets = [
        { id: 'theme-gold', label: 'Luxury Gold', icon: 'fa-crown', triggers: ['theme gold', 'gold theme', 'gold', 'luxury'] },
        { id: 'theme-midnight', label: 'Midnight Dark', icon: 'fa-moon', triggers: ['theme midnight', 'midnight theme', 'midnight', 'dark theme'] },
        { id: 'theme-ocean', label: 'Ocean Blue', icon: 'fa-water', triggers: ['theme ocean', 'ocean theme', 'ocean', 'blue theme'] },
        { id: 'theme-forest', label: 'Emerald Forest', icon: 'fa-tree', triggers: ['theme forest', 'forest theme', 'forest', 'green theme', 'emerald'] },
        { id: 'theme-sunset', label: 'Sunset Amber', icon: 'fa-sun', triggers: ['theme sunset', 'sunset theme', 'sunset', 'orange theme', 'amber theme'] },
        { id: 'theme-cyberpunk', label: 'Cyberpunk Neon', icon: 'fa-bolt', triggers: ['theme cyberpunk', 'cyberpunk theme', 'cyberpunk', 'neon'] },
        { id: 'theme-dracula', label: 'Dracula Purple', icon: 'fa-ghost', triggers: ['theme dracula', 'dracula theme', 'dracula', 'purple theme'] },
        { id: 'theme-synthwave', label: 'Synthwave Retro', icon: 'fa-compact-disc', triggers: ['theme synthwave', 'synthwave theme', 'synthwave', 'retro'] }
      ];

      for (const t of themePresets) {
        if (t.triggers.some((tr) => clean.includes(tr))) {
          if (onThemeChange) onThemeChange(t.id);
          window.dispatchEvent(new CustomEvent('admin-theme-changed', { detail: { theme: t.id } }));
          showToast(`Theme set to ${t.label}`, t.icon);
          finishExecution(`Theme: ${t.label}`);
          return;
        }
      }

      if (
        clean.includes('appearance') ||
        clean.includes('theme') ||
        clean.includes('design') ||
        clean.includes('color')
      ) {
        showToast('Voice Command: Navigating to Appearance Studio', 'fa-palette');
        dispatchTab('appearance');
        finishExecution('Go to Appearance');
        return;
      }

      // 9. Analytics & Telemetry
      if (clean.includes('analytics') || clean.includes('telemetry') || clean.includes('stat') || clean.includes('traffic') || clean.includes('metric')) {
        showToast('Voice Command: Opening Visitor Analytics', 'fa-chart-line');
        dispatchTab('analytics');
        finishExecution('Go to Analytics');
        return;
      }

      // 10. SEO & Metadata
      if (clean.includes('seo') || clean.includes('metadata') || clean.includes('search engine') || clean.includes('meta tag')) {
        showToast('Voice Command: Opening SEO & Metadata', 'fa-magnifying-glass-chart');
        dispatchTab('seo');
        finishExecution('Go to SEO');
        return;
      }

      // 11. Site Settings
      if (clean.includes('setting') || clean.includes('preference') || clean.includes('config')) {
        showToast('Voice Command: Opening Site Settings', 'fa-gear');
        dispatchTab('settings');
        finishExecution('Go to Settings');
        return;
      }

      // 12. Security CMS
      if (clean.includes('security') || clean.includes('password') || clean.includes('auth') || clean.includes('credential')) {
        showToast('Voice Command: Opening Security CMS', 'fa-shield-halved');
        dispatchTab('security');
        finishExecution('Go to Security');
        return;
      }

      // 13. Profile / About
      if (clean.includes('profile') || clean.includes('bio') || clean.includes('about')) {
        showToast('Voice Command: Opening Profile & About', 'fa-user-pen');
        dispatchTab('profile');
        finishExecution('Go to Profile');
        return;
      }

      // 14. Hero Portrait / Media Studio
      if (clean.includes('hero') || clean.includes('portrait') || clean.includes('avatar') || clean.includes('photo') || clean.includes('media')) {
        showToast('Voice Command: Opening Hero Portrait Studio', 'fa-image');
        dispatchTab('media');
        finishExecution('Go to Hero Portrait');
        return;
      }

      // 15. View Live Site
      if (clean.includes('view site') || clean.includes('live site') || clean.includes('public site') || clean.includes('website') || clean.includes('view live')) {
        showToast('Voice Command: Opening Live Portfolio', 'fa-arrow-up-right-from-square');
        navigate('/');
        finishExecution('View Live Site');
        return;
      }

      // 16. Focus Mode & Fullscreen
      if (clean.includes('focus') || clean.includes('fullscreen') || clean.includes('zoom')) {
        showToast('Voice Command: Toggling Focus Mode', 'fa-expand');
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
        finishExecution('Toggle Focus Mode');
        return;
      }

      // 17. Developer Terminal
      if (clean.includes('terminal') || clean.includes('cli') || clean.includes('console')) {
        showToast('Voice Command: Opening Developer Terminal', 'fa-terminal');
        window.dispatchEvent(new CustomEvent('ams-open-terminal'));
        finishExecution('Open Terminal');
        return;
      }

      // 18. Shortcuts Cheat Sheet
      if (clean.includes('shortcut') || clean.includes('keymap') || clean.includes('cheat sheet') || clean.includes('help')) {
        showToast('Voice Command: Showing Shortcuts', 'fa-keyboard');
        window.dispatchEvent(new CustomEvent('ams-open-shortcuts'));
        finishExecution('Keyboard Shortcuts');
        return;
      }

      // 19. Close Assistant
      if (clean.includes('stop') || clean.includes('close') || clean.includes('exit') || clean.includes('cancel')) {
        showToast('Voice Assistant Deactivated', 'fa-microphone-slash');
        stopListening();
        setActive(false);
        if (onClose) onClose();
        return;
      }

      // 20. Sign Out / Logout
      if (clean.includes('logout') || clean.includes('sign out')) {
        showToast('Voice Command: Initiating Admin Sign Out', 'fa-right-from-bracket');
        window.dispatchEvent(new CustomEvent('ams-admin-logout'));
        finishExecution('Sign Out');
        return;
      }

      // 21. Explicit feedback for unrecognized command
      const feedback = `Unrecognized command: "${text}". Try "Go to projects" or "Add project"`;
      setUnrecognizedCmd(feedback);
      showToast(feedback, 'fa-circle-question');
      setTimeout(() => {
        if (isListeningWantedRef.current) {
          updateStatus('listening');
        } else {
          updateStatus('idle');
        }
      }, 2000);
    },
    [navigate, onClose, onOpenAddProject, onSelectTab, onThemeChange, showToast, stopListening]
  );

  const startListening = useCallback(() => {
    isListeningWantedRef.current = true;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      updateStatus('unsupported');
      setErrorMsg('Web Speech API is not supported in this browser. You can type commands below.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_e) {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        updateStatus('listening');
        setErrorMsg(null);
        window.dispatchEvent(new CustomEvent('ams-voice-active', { detail: { active: true } }));
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const currentText = (finalTranscript || interim).trim();
        if (currentText) {
          setTranscript(currentText);
          if (statusRef.current !== 'executing') {
            updateStatus('processing');
          }
        }

        // Clear existing debounce timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        if (finalTranscript.trim()) {
          handleCommandExecution(finalTranscript.trim());
        } else if (interim.trim()) {
          // Debounce interim transcripts: if user speaks and pauses for 750ms without finalTranscript, execute from interim buffer!
          const capturedInterim = interim.trim();
          silenceTimerRef.current = setTimeout(() => {
            handleCommandExecution(capturedInterim);
          }, 750);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          isListeningWantedRef.current = false;
          updateStatus('error');
          setErrorMsg('Microphone access was denied. Please allow microphone permissions or use the text box below.');
        } else if (event.error !== 'no-speech') {
          setErrorMsg(`Recognition notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Smooth reconnection on onend: keep status as listening without flashing UI to "Microphone paused" when auto-restarting
        if (isListeningWantedRef.current) {
          setTimeout(() => {
            if (isListeningWantedRef.current) {
              try {
                if (recognitionRef.current) {
                  recognitionRef.current.start();
                } else {
                  startListening();
                }
              } catch (_e) {
                // If old recognition handle cannot be restarted, recreate cleanly
                try {
                  startListening();
                } catch (__e) {}
              }
            }
          }, 200);
        } else {
          updateStatus('idle');
          window.dispatchEvent(new CustomEvent('ams-voice-active', { detail: { active: false } }));
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      updateStatus('error');
      setErrorMsg(err.message || 'Failed to initialize speech recognition.');
    }
  }, [handleCommandExecution]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setTranscript(manualInput);
    handleCommandExecution(manualInput);
    setManualInput('');
  };

  useEffect(() => {
    const handleToggle = () => {
      setActive((prev) => {
        const next = !prev;
        if (next) {
          playTick();
          setTimeout(() => startListening(), 100);
        } else {
          stopListening();
        }
        return next;
      });
    };

    window.addEventListener('ams-toggle-voice', handleToggle);
    return () => window.removeEventListener('ams-toggle-voice', handleToggle);
  }, [startListening, stopListening]);

  useEffect(() => {
    if (isOpen) {
      setActive(true);
      startListening();
    } else if (isOpen === false) {
      setActive(false);
      stopListening();
    }
  }, [isOpen, startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  if (!active) return null;

  const isMicActive = status === 'listening' || status === 'processing' || status === 'executing';

  return (
    <div
      className="admin-voice-backdrop fixed inset-0 z-[10000000] flex items-center justify-center p-4 pt-20 md:pt-24 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Voice Command Assistant"
      onClick={() => {
        stopListening();
        setActive(false);
        if (onClose) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-yellow-500/30 bg-zinc-950/95 p-6 shadow-2xl text-white space-y-5 text-center overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Halo */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          status === 'executing'
            ? 'bg-emerald-500/25'
            : status === 'processing'
            ? 'bg-cyan-500/25'
            : status === 'error' || status === 'unsupported'
            ? 'bg-rose-500/25'
            : 'bg-yellow-500/20'
        }`} />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            stopListening();
            setActive(false);
            if (onClose) onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close voice assistant"
        >
          <i className="fa-solid fa-xmark text-sm" />
        </button>

        {/* Steady Non-blinking Visualizer Mic Icon with Clean State Transitions */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center mt-2">
          {/* Steady ambient glow rings per state - steady gentle wave visualizer without rapid blinking */}
          {status === 'listening' && (
            <div className="absolute inset-0 rounded-full border border-amber-400/50 shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-all duration-700 scale-105" />
          )}
          {status === 'processing' && (
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/70 shadow-[0_0_30px_rgba(6,182,212,0.45)] transition-all duration-500 scale-110" />
          )}
          {status === 'executing' && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all duration-500 scale-110" />
          )}
          {(status === 'error' || status === 'unsupported') && (
            <div className="absolute inset-0 rounded-full border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all duration-300" />
          )}

          <button
            type="button"
            onClick={isMicActive ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shadow-xl ${
              status === 'executing'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-emerald-500/40 scale-105'
                : status === 'processing'
                ? 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white shadow-cyan-500/40 scale-105'
                : status === 'listening'
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-black shadow-amber-500/30 scale-100'
                : status === 'error' || status === 'unsupported'
                ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                : 'bg-zinc-800 text-slate-400 border border-white/10 hover:text-white hover:border-yellow-400/40'
            }`}
            title={isMicActive ? 'Click to pause mic' : 'Click to start listening'}
          >
            {status === 'executing' ? (
              <i className="fa-solid fa-check text-2xl font-bold" />
            ) : status === 'processing' ? (
              <i className="fa-solid fa-microphone text-2xl text-white" />
            ) : status === 'listening' ? (
              <i className="fa-solid fa-microphone text-2xl text-black" />
            ) : status === 'error' || status === 'unsupported' ? (
              <i className="fa-solid fa-triangle-exclamation text-2xl" />
            ) : (
              <i className="fa-solid fa-microphone-slash text-2xl" />
            )}
          </button>
        </div>

        {/* Gentle Audio Level / Soundwave Visualization */}
        <div className="flex items-center justify-center gap-1.5 h-6">
          {[40, 75, 100, 65, 35].map((heightPct, idx) => (
            <span
              key={idx}
              className={`w-1 admin-voice-wave-bar transition-all duration-300 ${
                status === 'processing'
                  ? 'bg-cyan-400 opacity-90'
                  : status === 'listening'
                  ? 'bg-amber-400 opacity-80'
                  : status === 'executing'
                  ? 'bg-emerald-400 opacity-90'
                  : 'bg-slate-600 opacity-30'
              }`}
              style={{
                height: (status === 'listening' || status === 'processing')
                  ? `${heightPct}%`
                  : '20%',
                animation: (status === 'listening' || status === 'processing')
                  ? `adminVoiceWave 1.4s ease-in-out infinite ${idx * 0.18}s`
                  : 'none'
              }}
            />
          ))}
        </div>

        {/* State Status text */}
        <div>
          <h2 className="text-lg font-bold text-white m-0">Admin Voice Navigator</h2>
          <div className="mt-1">
            {status === 'listening' && (
              <p className="text-xs font-sans text-amber-400/90 inline-flex items-center gap-1.5 m-0 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Listening for spoken commands...
              </p>
            )}
            {status === 'processing' && (
              <p className="text-xs font-sans text-cyan-300 inline-flex items-center gap-1.5 m-0 font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Processing speech...
              </p>
            )}
            {status === 'executing' && (
              <p className="text-xs font-sans text-emerald-400 inline-flex items-center gap-1.5 m-0 font-semibold">
                <i className="fa-solid fa-check text-xs" />
                Executing command...
              </p>
            )}
            {status === 'unsupported' && (
              <p className="text-xs font-sans text-amber-400 m-0">
                Web Speech API is not supported in this browser. Use text input below.
              </p>
            )}
            {status === 'error' && (
              <p className="text-xs font-sans text-rose-400 m-0">
                {errorMsg || 'Speech recognition encountered an issue. Click mic to retry or type below.'}
              </p>
            )}
            {status === 'idle' && (
              <p className="text-xs font-sans text-slate-400 m-0">
                Microphone paused. Click icon or type below.
              </p>
            )}
          </div>
        </div>

        {/* Live Transcript Area */}
        <div className="min-h-[52px] p-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-mono flex items-center justify-center text-slate-200">
          {transcript ? (
            <span className={status === 'processing' ? 'text-cyan-300' : 'text-yellow-300'}>"{transcript}"</span>
          ) : (
            <span className="text-slate-500 italic">Say a command, e.g. "Add project", "Go to messages"...</span>
          )}
        </div>

        {/* Last Executed Command Badge */}
        {lastCommand && (
          <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block mx-auto">
            <i className="fa-solid fa-check mr-1.5" /> Executed: "{lastCommand}"
          </div>
        )}

        {/* Unrecognized Command Feedback with Clear Guidance */}
        {unrecognizedCmd && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 font-mono text-left flex items-start gap-2">
            <i className="fa-solid fa-circle-question text-amber-400 text-sm mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">{unrecognizedCmd}</div>
              <div className="text-[11px] text-amber-200/80 mt-1">
                Try saying: "Go to projects", "Add project", "Open messages", or "Theme gold".
              </div>
            </div>
          </div>
        )}

        {/* Manual Command Typing Fallback */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Type command (e.g. 'add project', 'theme gold')..."
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-sans focus:outline-none focus:border-yellow-400"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold rounded-xl transition-colors font-sans shrink-0"
          >
            Run
          </button>
        </form>

        {/* Notice message */}
        {errorMsg && status !== 'error' && (
          <div className="p-2.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-xs text-yellow-300 font-sans text-left">
            {errorMsg}
          </div>
        )}

        {/* Voice Command Suggestions Grid */}
        <div className="text-left space-y-2 pt-2 border-t border-white/10">
          <span className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-semibold block">
            Sample Voice Commands
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs font-sans">
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">"Add new project"</span>
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">"Go to projects"</span>
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">"Check messages"</span>
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">"Theme gold"</span>
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">"Toggle focus mode"</span>
            <span className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300">"Open terminal"</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={isMicActive ? stopListening : startListening}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors"
          >
            {isMicActive ? 'Mute Mic' : 'Start Listening'}
          </button>
          <button
            type="button"
            onClick={() => {
              stopListening();
              setActive(false);
              if (onClose) onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-yellow-400 hover:bg-yellow-300 text-black transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminVoiceAssistant;
