import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTick, playVoiceSuccessChime, playVoiceErrorChime } from '../../utils/audio';

// Supported recognition languages (optimized for Indian English, US English, and Hindi/Hinglish)
const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)', flag: '🇮🇳' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'hi-IN', label: 'Hindi / Hinglish', flag: '🇮🇳' }
];

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
  const [selectedLang, setSelectedLang] = useState(() => {
    if (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('hi')) {
      return 'hi-IN';
    }
    return 'en-IN';
  });
  const [autoClose, setAutoClose] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [unrecognizedCmd, setUnrecognizedCmd] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [micAudioLevel, setMicAudioLevel] = useState(0); // 0 to 100 live RMS volume

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const isListeningWantedRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const restartTimerRef = useRef(null);
  const statusRef = useRef('idle');
  const lastExecutedRef = useRef({ text: '', timestamp: 0 });
  const navigate = useNavigate();

  // Helper to update status in both state and ref
  const updateStatus = (nextStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  };

  // Audio telemetry animation for waveform bars (driven cleanly by speech recognition state)
  const stopAudioTelemetry = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setMicAudioLevel(0);
  }, []);

  const startAudioTelemetry = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    let step = 0;
    const tickWave = () => {
      step += 0.18;
      if (statusRef.current === 'processing') {
        // High energetic speech response
        const dynamic = Math.round(55 + Math.sin(step * 2.8) * 25 + Math.cos(step * 4.2) * 15);
        setMicAudioLevel(Math.min(95, Math.max(35, dynamic)));
      } else if (statusRef.current === 'listening') {
        // Gentle ambient breath pulse
        const ambient = Math.round(18 + Math.sin(step) * 6);
        setMicAudioLevel(ambient);
      } else {
        setMicAudioLevel(0);
      }
      animFrameRef.current = requestAnimationFrame(tickWave);
    };
    animFrameRef.current = requestAnimationFrame(tickWave);
  }, []);

  // Stop listening completely
  const stopListening = useCallback(() => {
    isListeningWantedRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_e) {}
      recognitionRef.current = null;
    }
    stopAudioTelemetry();
    if (statusRef.current !== 'executing') {
      updateStatus('idle');
    }
    window.dispatchEvent(new CustomEvent('ams-voice-active', { detail: { active: false } }));
  }, [stopAudioTelemetry]);

  // Command Execution Handler with Multi-Lingual & Fuzzy Matching
  const handleCommandExecution = useCallback(
    (text) => {
      const clean = text.toLowerCase().trim();
      if (!clean) return;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Deduplication guard: prevent duplicate execution within 1.5s
      const now = Date.now();
      if (
        statusRef.current === 'executing' ||
        (now - lastExecutedRef.current.timestamp < 1500 &&
          (clean === lastExecutedRef.current.text ||
            clean.includes(lastExecutedRef.current.text) ||
            lastExecutedRef.current.text.includes(clean)))
      ) {
        return;
      }

      setUnrecognizedCmd('');

      // Helper to dispatch select tab event
      const dispatchTab = (tab) => {
        window.dispatchEvent(new CustomEvent('ams-select-tab', { detail: { tab } }));
        if (onSelectTab) onSelectTab(tab);
        else navigate(tab === 'dashboard' ? '/admin' : `/admin?tab=${tab}`);
      };

      // Finish execution: show feedback, play chime, and auto-dismiss if enabled
      const finishExecution = (commandName, recognized = true, shouldAutoClose = autoClose) => {
        updateStatus('executing');
        lastExecutedRef.current = { text: clean, timestamp: now };
        if (recognized) {
          setLastCommand(commandName);
          playVoiceSuccessChime();
        } else {
          playVoiceErrorChime();
        }

        if (recognized && shouldAutoClose) {
          // Direct, swift auto-dismiss after 350ms so user immediately lands on target form
          setTimeout(() => {
            stopListening();
            setActive(false);
            if (onClose) onClose();
          }, 350);
        } else {
          setTimeout(() => {
            if (isListeningWantedRef.current) {
              updateStatus('listening');
            } else {
              updateStatus('idle');
            }
            setTranscript('');
          }, 1200);
        }
      };

      // -----------------------------------------------------------------------
      // 1. Projects - Create new project wizard / form
      // Matches: "add new project", "add project", "create project", "new project", "project add karo", "naya project", "project banao", "open project form", "project form", "naya project form"
      // -----------------------------------------------------------------------
      if (
        clean === 'add new project' ||
        clean === 'add project' ||
        clean === 'create project' ||
        clean === 'new project' ||
        clean === 'naya project' ||
        clean === 'project form' ||
        clean.includes('add new project') ||
        clean.includes('new project') ||
        clean.includes('project form') ||
        clean.includes('project creator') ||
        clean.includes('naya project') ||
        clean.includes('project banao') ||
        clean.includes('project add') ||
        (clean.includes('project') && (
          clean.includes('add') ||
          clean.includes('create') ||
          clean.includes('new') ||
          clean.includes('wizard') ||
          clean.includes('form') ||
          clean.includes('banao') ||
          clean.includes('karo') ||
          clean.includes('kholo') ||
          clean.includes('creator')
        ))
      ) {
        showToast('Voice Command: Opening Project Creator Form', 'fa-plus');
        dispatchTab('projects');
        navigate('/admin?tab=projects&create=true');
        window.dispatchEvent(new CustomEvent('ams-create-project'));
        if (onOpenAddProject) {
          try { onOpenAddProject(); } catch (_e) {}
        }
        finishExecution('Add New Project');
        return;
      }

      // -----------------------------------------------------------------------
      // 2. Projects CMS
      // Matches: "project", "projects", "projects cms", "open projects", "show projects", "projects dikhao", "projects page"
      // -----------------------------------------------------------------------
      if (clean.includes('project') || clean.includes('portfolio work')) {
        showToast('Voice Command: Navigating to Projects CMS', 'fa-layer-group');
        dispatchTab('projects');
        navigate('/admin?tab=projects');
        finishExecution('Go to Projects');
        return;
      }

      // -----------------------------------------------------------------------
      // 3. Messages & Contact Inquiries
      // Matches: "message", "messages", "inbox", "contact", "sandesh", "mail", "inquiries", "check messages", "messages dikhao"
      // -----------------------------------------------------------------------
      if (
        clean.includes('message') ||
        clean.includes('inbox') ||
        clean.includes('contact') ||
        clean.includes('sandesh') ||
        clean.includes('mail') ||
        clean.includes('inquir')
      ) {
        showToast('Voice Command: Opening Messages & Inquiries', 'fa-envelope');
        dispatchTab('messages');
        navigate('/admin?tab=messages');
        finishExecution('Go to Messages');
        return;
      }

      // -----------------------------------------------------------------------
      // 4. Overview / Dashboard
      // Matches: "overview", "dashboard", "home", "admin home", "main dashboard", "shuru", "overview dikhao"
      // -----------------------------------------------------------------------
      if (
        clean.includes('overview') ||
        clean.includes('dashboard') ||
        clean.includes('home') ||
        clean.includes('shuru') ||
        clean.includes('summary')
      ) {
        showToast('Voice Command: Navigating to Overview Dashboard', 'fa-chart-pie');
        dispatchTab('dashboard');
        navigate('/admin');
        finishExecution('Go to Dashboard');
        return;
      }

      // -----------------------------------------------------------------------
      // 5. Certificates CMS
      // Matches: "certificate", "certificates", "cert", "certs", "credential", "degree", "certificates dikhao"
      // -----------------------------------------------------------------------
      if (
        clean.includes('certificate') ||
        clean.includes('cert') ||
        clean.includes('credential') ||
        clean.includes('degree') ||
        clean.includes('diploma')
      ) {
        showToast('Voice Command: Navigating to Certificates CMS', 'fa-shield-halved');
        dispatchTab('certificates');
        navigate('/admin?tab=certificates');
        finishExecution('Go to Certificates');
        return;
      }

      // -----------------------------------------------------------------------
      // 6. Skills CMS
      // Matches: "skill", "skills", "tech stack", "technologies", "tools", "skills dikhao"
      // -----------------------------------------------------------------------
      if (clean.includes('skill') || clean.includes('tech stack') || clean.includes('technology') || clean.includes('technologies')) {
        showToast('Voice Command: Navigating to Skills CMS', 'fa-code');
        dispatchTab('skills');
        navigate('/admin?tab=skills');
        finishExecution('Go to Skills');
        return;
      }

      // -----------------------------------------------------------------------
      // 7. Milestones & Journey CMS
      // Matches: "milestone", "milestones", "journey", "timeline", "career", "achievement", "milestone banao"
      // -----------------------------------------------------------------------
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
          clean.includes('wizard') ||
          clean.includes('banao') ||
          clean.includes('karo') ||
          clean.includes('form')
        ) {
          showToast('Voice Command: Creating New Milestone', 'fa-plus');
          dispatchTab('milestones');
          navigate('/admin?tab=milestones&create=true');
          window.dispatchEvent(new CustomEvent('ams-open-milestone-wizard'));
          finishExecution('New Milestone');
          return;
        }
        showToast('Voice Command: Navigating to Career Milestones CMS', 'fa-trophy');
        dispatchTab('milestones');
        navigate('/admin?tab=milestones');
        finishExecution('Go to Milestones');
        return;
      }

      // -----------------------------------------------------------------------
      // 8. Themes & Appearance Studio Presets
      // -----------------------------------------------------------------------
      const themePresets = [
        { id: 'theme-gold', label: 'Luxury Gold', icon: 'fa-crown', triggers: ['theme gold', 'gold theme', 'gold', 'luxury', 'sunhara'] },
        { id: 'theme-midnight', label: 'Midnight Dark', icon: 'fa-moon', triggers: ['theme midnight', 'midnight theme', 'midnight', 'dark theme', 'dark mode'] },
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
          finishExecution(`Theme: ${t.label}`, true, false); // Keep open on theme switch so user sees live visual update
          return;
        }
      }

      if (
        clean.includes('appearance') ||
        clean.includes('theme') ||
        clean.includes('design') ||
        clean.includes('color') ||
        clean.includes('rang')
      ) {
        showToast('Voice Command: Navigating to Appearance Studio', 'fa-palette');
        dispatchTab('appearance');
        finishExecution('Go to Appearance');
        return;
      }

      // -----------------------------------------------------------------------
      // 9. Analytics & Telemetry
      // -----------------------------------------------------------------------
      if (clean.includes('analytics') || clean.includes('telemetry') || clean.includes('stat') || clean.includes('traffic') || clean.includes('metric')) {
        showToast('Voice Command: Opening Visitor Analytics', 'fa-chart-line');
        dispatchTab('analytics');
        finishExecution('Go to Analytics');
        return;
      }

      // -----------------------------------------------------------------------
      // 10. SEO & Metadata
      // -----------------------------------------------------------------------
      if (clean.includes('seo') || clean.includes('metadata') || clean.includes('search engine') || clean.includes('meta tag')) {
        showToast('Voice Command: Opening SEO & Metadata', 'fa-magnifying-glass-chart');
        dispatchTab('seo');
        finishExecution('Go to SEO');
        return;
      }

      // -----------------------------------------------------------------------
      // 11. Site Settings
      // -----------------------------------------------------------------------
      if (clean.includes('setting') || clean.includes('preference') || clean.includes('config')) {
        showToast('Voice Command: Opening Site Settings', 'fa-gear');
        dispatchTab('settings');
        finishExecution('Go to Settings');
        return;
      }

      // -----------------------------------------------------------------------
      // 12. Security CMS
      // -----------------------------------------------------------------------
      if (clean.includes('security') || clean.includes('password') || clean.includes('auth') || clean.includes('suraksha')) {
        showToast('Voice Command: Opening Security CMS', 'fa-shield-halved');
        dispatchTab('security');
        finishExecution('Go to Security');
        return;
      }

      // -----------------------------------------------------------------------
      // 13. Profile / About
      // -----------------------------------------------------------------------
      if (clean.includes('profile') || clean.includes('bio') || clean.includes('about') || clean.includes('parichay')) {
        showToast('Voice Command: Opening Profile & About', 'fa-user-pen');
        dispatchTab('profile');
        finishExecution('Go to Profile');
        return;
      }

      // -----------------------------------------------------------------------
      // 14. Hero Portrait / Media Studio
      // -----------------------------------------------------------------------
      if (clean.includes('hero') || clean.includes('portrait') || clean.includes('avatar') || clean.includes('photo') || clean.includes('media')) {
        showToast('Voice Command: Opening Hero Portrait Studio', 'fa-image');
        dispatchTab('media');
        finishExecution('Go to Hero Portrait');
        return;
      }

      // -----------------------------------------------------------------------
      // 15. View Live Site
      // -----------------------------------------------------------------------
      if (
        clean.includes('view site') ||
        clean.includes('live site') ||
        clean.includes('public site') ||
        clean.includes('website') ||
        clean.includes('view live')
      ) {
        showToast('Voice Command: Opening Live Portfolio', 'fa-arrow-up-right-from-square');
        navigate('/');
        finishExecution('View Live Site');
        return;
      }

      // -----------------------------------------------------------------------
      // 16. Focus Mode & Fullscreen
      // -----------------------------------------------------------------------
      if (clean.includes('focus') || clean.includes('fullscreen') || clean.includes('full screen') || clean.includes('zoom')) {
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
        finishExecution('Toggle Focus Mode', true, false);
        return;
      }

      // -----------------------------------------------------------------------
      // 17. Developer Terminal
      // -----------------------------------------------------------------------
      if (clean.includes('terminal') || clean.includes('cli') || clean.includes('console')) {
        showToast('Voice Command: Opening Developer Terminal', 'fa-terminal');
        window.dispatchEvent(new CustomEvent('ams-open-terminal'));
        finishExecution('Open Terminal');
        return;
      }

      // -----------------------------------------------------------------------
      // 18. Shortcuts Cheat Sheet
      // -----------------------------------------------------------------------
      if (clean.includes('shortcut') || clean.includes('keymap') || clean.includes('cheat sheet') || clean.includes('help')) {
        showToast('Voice Command: Showing Shortcuts', 'fa-keyboard');
        window.dispatchEvent(new CustomEvent('ams-open-shortcuts'));
        finishExecution('Keyboard Shortcuts');
        return;
      }

      // -----------------------------------------------------------------------
      // 19. Close Assistant
      // -----------------------------------------------------------------------
      if (
        clean.includes('stop') ||
        clean.includes('close') ||
        clean.includes('exit') ||
        clean.includes('cancel') ||
        clean.includes('band karo') ||
        clean.includes('hatao')
      ) {
        showToast('Voice Assistant Closed', 'fa-microphone-slash');
        stopListening();
        setActive(false);
        if (onClose) onClose();
        return;
      }

      // -----------------------------------------------------------------------
      // 20. Sign Out / Logout
      // -----------------------------------------------------------------------
      if (clean.includes('logout') || clean.includes('sign out')) {
        showToast('Voice Command: Initiating Admin Sign Out', 'fa-right-from-bracket');
        window.dispatchEvent(new CustomEvent('ams-admin-logout'));
        finishExecution('Sign Out');
        return;
      }

      // -----------------------------------------------------------------------
      // 21. Explicit Feedback for Unrecognized Command
      // -----------------------------------------------------------------------
      const feedback = `Unrecognized: "${text}". Try saying "Add project" or "Go to messages".`;
      setUnrecognizedCmd(feedback);
      updateStatus(isListeningWantedRef.current ? 'listening' : 'idle');
      playVoiceErrorChime();
      showToast(feedback, 'fa-circle-question');
    },
    [autoClose, navigate, onClose, onOpenAddProject, onSelectTab, onThemeChange, showToast, stopListening]
  );

  // Start Speech Recognition & Hardware Audio Telemetry
  const startListening = useCallback(async () => {
    if (statusRef.current === 'executing') return;
    isListeningWantedRef.current = true;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      updateStatus('unsupported');
      setErrorMsg('Web Speech API is not supported in this browser. You can type commands below.');
      return;
    }

    // Step 1: Ensure Chrome microphone permission is requested / active via getUserMedia
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        // Query permission if available
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const p = await navigator.permissions.query({ name: 'microphone' });
            if (p.state === 'denied') {
              isListeningWantedRef.current = false;
              updateStatus('error');
              setErrorMsg('Microphone blocked. Click the lock/tune icon in the Chrome address bar, set Microphone to "Allow", and reload.');
              return;
            }
          } catch (_e) {}
        }
        
        // This triggers Chrome's "Allow / Block" permission prompt if state is 'prompt'
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release tracks immediately so it doesn't hold hardware exclusive lock
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        isListeningWantedRef.current = false;
        updateStatus('error');
        setErrorMsg('Microphone permission was denied. Please allow microphone in Chrome (click the tune/lock icon in address bar) and click Start Listening.');
        return;
      }
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        isListeningWantedRef.current = false;
        updateStatus('error');
        setErrorMsg('No microphone hardware detected. Please connect a microphone or headset.');
        return;
      }
    }

    startAudioTelemetry();

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
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        updateStatus('listening');
        setErrorMsg(null);
        window.dispatchEvent(new CustomEvent('ams-voice-active', { detail: { active: true } }));
      };

      recognition.onspeechstart = () => {
        if (statusRef.current !== 'executing') updateStatus('processing');
      };

      recognition.onspeechend = () => {
        if (statusRef.current !== 'executing') updateStatus('processing');
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
          const lower = interim.toLowerCase().trim();
          // Instant interim match for immediate execution & redirection without waiting
          if (
            lower.includes('project') ||
            lower.includes('message') ||
            lower.includes('inbox') ||
            lower.includes('overview') ||
            lower.includes('dashboard') ||
            lower.includes('milestone') ||
            lower.includes('theme') ||
            lower.includes('terminal') ||
            lower.includes('site') ||
            lower.includes('skill') ||
            lower.includes('cert') ||
            lower.includes('seo') ||
            lower.includes('setting') ||
            lower.includes('profile') ||
            lower.includes('media') ||
            lower.includes('security')
          ) {
            handleCommandExecution(lower);
          } else {
            // If user pauses briefly (300ms), execute from interim
            const capturedInterim = interim.trim();
            silenceTimerRef.current = setTimeout(() => {
              handleCommandExecution(capturedInterim);
            }, 300);
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          isListeningWantedRef.current = false;
          updateStatus('error');
          setErrorMsg('Microphone blocked. Click the lock/tune icon in the Chrome address bar to Allow.');
        } else if (event.error === 'audio-capture') {
          isListeningWantedRef.current = false;
          updateStatus('error');
          setErrorMsg('Microphone hardware busy or muted. Check Windows microphone volume & Lenovo F4 key.');
        } else if (event.error === 'network') {
          updateStatus('error');
          setErrorMsg('Google Speech recognition service offline or blocked. Click quick chips or type below.');
        } else if (event.error !== 'no-speech') {
          setErrorMsg(`Voice notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If error or executing, don't overwrite with idle or restart in a loop
        if (statusRef.current === 'error' || statusRef.current === 'executing') {
          return;
        }
        if (isListeningWantedRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isListeningWantedRef.current && statusRef.current !== 'error' && statusRef.current !== 'executing') {
              try {
                startListening();
              } catch (_e) {}
            }
          }, 450);
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
  }, [handleCommandExecution, selectedLang, startAudioTelemetry]);

  // Handle language switch
  const handleLanguageSwitch = (langCode) => {
    playTick();
    setSelectedLang(langCode);
    if (isListeningWantedRef.current) {
      // Restart with new language
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_e) {}
        recognitionRef.current = null;
      }
      setTimeout(() => startListening(), 100);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setTranscript(manualInput);
    handleCommandExecution(manualInput);
    setManualInput('');
  };

  // Listen for ams-toggle-voice global event
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

  // Sync with isOpen prop
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

  // Cleanup on unmount
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
        className="relative w-full max-w-lg rounded-2xl border border-yellow-500/30 bg-zinc-950/95 p-6 shadow-2xl text-white space-y-4 text-center overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Halo */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            status === 'executing'
              ? 'bg-emerald-500/30'
              : status === 'processing'
              ? 'bg-cyan-500/30'
              : status === 'error' || status === 'unsupported'
              ? 'bg-rose-500/30'
              : 'bg-yellow-500/20'
          }`}
        />

        {/* Top Header Controls: Title & Language Toggle & Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
            <h2 className="text-base font-bold text-white m-0 tracking-tight">Admin Voice Navigator</h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Selection Pills */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageSwitch(lang.code)}
                  className={`px-2 py-0.5 text-[10px] font-sans rounded-md transition-all ${
                    selectedLang === lang.code
                      ? 'bg-yellow-400 text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Switch recognition to ${lang.label}`}
                >
                  {lang.flag} {lang.code.split('-')[0].toUpperCase()}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopListening();
                setActive(false);
                if (onClose) onClose();
              }}
              className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              aria-label="Close voice assistant"
            >
              <i className="fa-solid fa-xmark text-xs" />
            </button>
          </div>
        </div>

        {/* Steady Non-blinking Visualizer Mic Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center my-1">
          {/* Steady glow rings per state - zero erratic flashing */}
          {status === 'listening' && (
            <div className="absolute inset-0 rounded-full border border-amber-400/50 shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-all duration-700 scale-105" />
          )}
          {status === 'processing' && (
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.45)] transition-all duration-300 scale-110" />
          )}
          {status === 'executing' && (
            <div className="absolute inset-0 rounded-full border-2 border-emerald-400/90 shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all duration-300 scale-110" />
          )}
          {(status === 'error' || status === 'unsupported') && (
            <div className="absolute inset-0 rounded-full border border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all duration-300" />
          )}

          <button
            type="button"
            onClick={() => {
              playTick();
              if (isMicActive) stopListening();
              else startListening();
            }}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all duration-300 shadow-xl cursor-pointer ${
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
              <i className="fa-solid fa-check text-2xl font-bold animate-bounce" />
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

        {/* Live Audio Level Soundwave Visualization Bars (Driven by live hardware mic volume) */}
        <div className="flex items-center justify-center gap-1.5 h-6">
          {[0.5, 0.9, 1.3, 0.8, 0.4].map((multiplier, idx) => {
            const calculatedHeight = Math.max(
              20,
              Math.min(100, Math.round(micAudioLevel * multiplier + 20))
            );
            return (
              <span
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-100 ${
                  status === 'processing'
                    ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                    : status === 'executing'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : status === 'listening'
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-zinc-700 opacity-40'
                }`}
                style={{
                  height: isMicActive ? `${calculatedHeight}%` : '20%',
                  transform: isMicActive && micAudioLevel > 10 ? 'scaleY(1.15)' : 'scaleY(1)'
                }}
              />
            );
          })}
        </div>

        {/* State Status text & Live Hardware Cue */}
        <div>
          {status === 'listening' && (
            <p className="text-xs font-sans text-amber-400/95 inline-flex items-center gap-1.5 m-0 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Listening... Speak a command or tap a shortcut below
            </p>
          )}
          {status === 'processing' && (
            <p className="text-xs font-sans text-cyan-300 inline-flex items-center gap-1.5 m-0 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Hearing your speech...
            </p>
          )}
          {status === 'executing' && (
            <p className="text-xs font-sans text-emerald-300 inline-flex items-center gap-1.5 m-0 font-bold">
              <i className="fa-solid fa-check text-xs text-emerald-400" />
              Executing: {lastCommand}
            </p>
          )}
          {status === 'unsupported' && (
            <p className="text-xs font-sans text-amber-400 m-0">
              Web Speech API is not supported in this browser. Use text input below.
            </p>
          )}
          {status === 'error' && (
            <p className="text-xs font-sans text-rose-400 m-0">
              {errorMsg || 'Microphone error. Check your mic permissions or type command below.'}
            </p>
          )}
          {status === 'idle' && (
            <p className="text-xs font-sans text-slate-400 m-0">
              Microphone paused. Click icon or type below.
            </p>
          )}
        </div>

        {/* Live Spoken Transcript Display */}
        <div className="min-h-[50px] p-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-sans flex items-center justify-center text-slate-200">
          {transcript ? (
            <span className={status === 'processing' ? 'text-cyan-300 font-medium' : 'text-yellow-300 font-bold'}>
              "{transcript}"
            </span>
          ) : (
            <span className="text-slate-500 italic text-xs">
              Say e.g. "Add project", "Go to messages", "Theme gold", "Milestones"...
            </span>
          )}
        </div>

        {/* Unrecognized Command Guidance Banner */}
        {unrecognizedCmd && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 font-sans text-left flex items-start gap-2.5">
            <i className="fa-solid fa-circle-question text-amber-400 text-base mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-white">{unrecognizedCmd}</div>
              <div className="text-[11px] text-amber-200/80 mt-1">
                Supported commands: "Add project", "Go to projects", "Messages", "Overview", "Milestones", "Theme gold", "Live site".
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Pills (Clickable for 100% Reliable 1-Tap Execution) */}
        <div className="space-y-1.5 pt-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 font-bold">
              Quick Voice / Tap Commands
            </span>
            <label className="text-[10px] font-sans text-slate-400 inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoClose}
                onChange={(e) => setAutoClose(e.target.checked)}
                className="rounded accent-yellow-400 w-3 h-3 cursor-pointer"
              />
              Auto-close on action
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '+ Add Project', cmd: 'add project' },
              { label: '📁 Projects', cmd: 'go to projects' },
              { label: '✉ Messages', cmd: 'check messages' },
              { label: '📊 Overview', cmd: 'overview' },
              { label: '🏆 Milestones', cmd: 'new milestone' },
              { label: '👑 Gold Theme', cmd: 'theme gold' },
              { label: '💻 Terminal', cmd: 'open terminal' },
              { label: '🌐 Live Site', cmd: 'view live site' }
            ].map((chip) => (
              <button
                key={chip.cmd}
                type="button"
                onClick={() => {
                  playTick();
                  setTranscript(chip.cmd);
                  handleCommandExecution(chip.cmd);
                }}
                className="px-2.5 py-1 text-xs font-sans rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-yellow-400/40 hover:bg-yellow-500/10 transition-all cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Command Typing Fallback */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Or type a command (e.g. 'add project', 'theme gold')..."
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-sans focus:outline-none focus:border-yellow-400"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold rounded-xl transition-colors font-sans shrink-0 cursor-pointer"
          >
            Run
          </button>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              playTick();
              if (isMicActive) stopListening();
              else startListening();
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
          >
            <i className={`fa-solid ${isMicActive ? 'fa-microphone-slash' : 'fa-microphone'} mr-1.5`} />
            {isMicActive ? 'Pause Mic' : 'Start Listening'}
          </button>
          <button
            type="button"
            onClick={() => {
              stopListening();
              setActive(false);
              if (onClose) onClose();
            }}
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
