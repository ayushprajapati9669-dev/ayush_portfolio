import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { uploadImageViaCloudinary } from '../../../services/api';
import { playTick } from '../../../utils/audio';

const DEFAULT_PORTRAIT_PRESETS = [
  '/images/ayush-hero-portrait.jpg',
  '/images/ayush-resume-preview.jpg',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
];

export function AdminHeroPortrait({
  appState,
  updateAppState,
  session,
  showToast
}) {
  const p = appState.profile || {};
  const settings = appState.settings || {};

  // Form State
  const [customDomain, setCustomDomain] = useState(p.customDomain || 'ayush.dev');
  const [portfolioSlug, setPortfolioSlug] = useState(p.portfolioSlug || 'hero-section');
  const [slugManual, setSlugManual] = useState(false);
  const [heroTitle, setHeroTitle] = useState(p.headline || p.supportingHeadline || "Hi, I'm Ayush.");
  const [statusTag, setStatusTag] = useState(p.availabilityLabel || 'Open to SWE Internships');
  const [primaryCta, setPrimaryCta] = useState(p.primaryCtaText || 'View Projects');
  const [secondaryCta, setSecondaryCta] = useState(p.secondaryCtaText || 'Contact Me');
  const [themeColor, setThemeColor] = useState(p.themeColor || '#0ea5e9');
  const [fontFamily, setFontFamily] = useState(p.fontFamily || "'Inter', sans-serif");
  const [photoUrl, setPhotoUrl] = useState(p.photoUrl || p.portrait?.url || '/images/ayush-hero-portrait.jpg');
  const [imageAltText, setImageAltText] = useState(p.portrait?.alt || 'Ayush Prajapati - Hero Portrait');
  const [maintenanceMode, setMaintenanceMode] = useState(Boolean(settings.maintenanceMode));

  // UI state
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('saved'); // 'saved' | 'saving'
  const [liveVisitors, setLiveVisitors] = useState(12);

  // Undo / Redo history
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Modals
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropScale, setCropScale] = useState(1);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState(() => {
    try {
      const stored = localStorage.getItem('ayush_media_library');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? Array.from(new Set([...DEFAULT_PORTRAIT_PRESETS, ...parsed])) : DEFAULT_PORTRAIT_PRESETS;
      }
    } catch (_e) {}
    return DEFAULT_PORTRAIT_PRESETS;
  });

  const fileInputRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const cropImgRef = useRef(null);

  // Helper to get current form state snapshot
  const getCurrentState = useCallback(() => ({
    customDomain,
    portfolioSlug,
    heroTitle,
    statusTag,
    primaryCta,
    secondaryCta,
    themeColor,
    fontFamily,
    photoUrl,
    imageAltText,
    maintenanceMode
  }), [customDomain, portfolioSlug, heroTitle, statusTag, primaryCta, secondaryCta, themeColor, fontFamily, photoUrl, imageAltText, maintenanceMode]);

  // Apply state snapshot (for undo/redo/import)
  const applyStateSnapshot = (s) => {
    isUndoRedoAction.current = true;
    if (s.customDomain !== undefined) setCustomDomain(s.customDomain);
    if (s.portfolioSlug !== undefined) setPortfolioSlug(s.portfolioSlug);
    if (s.heroTitle !== undefined) setHeroTitle(s.heroTitle);
    if (s.statusTag !== undefined) setStatusTag(s.statusTag);
    if (s.primaryCta !== undefined) setPrimaryCta(s.primaryCta);
    if (s.secondaryCta !== undefined) setSecondaryCta(s.secondaryCta);
    if (s.themeColor !== undefined) setThemeColor(s.themeColor);
    if (s.fontFamily !== undefined) setFontFamily(s.fontFamily);
    if (s.photoUrl !== undefined) setPhotoUrl(s.photoUrl);
    if (s.imageAltText !== undefined) setImageAltText(s.imageAltText);
    if (s.maintenanceMode !== undefined) setMaintenanceMode(s.maintenanceMode);
    setTimeout(() => {
      isUndoRedoAction.current = false;
    }, 50);
  };

  // Push to history stack
  const pushHistory = useCallback((state) => {
    setHistoryStack((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, state];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Initial history snapshot
  useEffect(() => {
    const initial = getCurrentState();
    setHistoryStack([initial]);
    setHistoryIndex(0);
  }, []);

  // Autosave simulation & debounced draft persist
  const triggerAutosave = useCallback(() => {
    setAutosaveStatus('saving');
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      try {
        const state = getCurrentState();
        localStorage.setItem('heroDraftUltimate', JSON.stringify(state));
      } catch (_e) {}
      setAutosaveStatus('saved');
    }, 1200);
  }, [getCurrentState]);

  // Track changes to push history and trigger autosave
  const handleFieldChange = (setter, value, autoSlug = false) => {
    setter(value);
    if (autoSlug && !slugManual) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setPortfolioSlug(generated || 'hero-section');
    }
    if (!isUndoRedoAction.current) {
      triggerAutosave();
    }
  };

  // Calculate SEO Content Score
  const calculateSEOScore = () => {
    let score = 50;
    const titleLen = (heroTitle || '').length;
    const statusLen = (statusTag || '').length;
    const altLen = (imageAltText || '').length;

    if (titleLen >= 10 && titleLen <= 40) score += 25;
    else if (titleLen > 40 && titleLen <= 60) score += 15;

    if (statusLen >= 10 && statusLen <= 35) score += 25;
    else if (statusLen > 0) score += 10;

    if (altLen > 5) score += 10;

    score = Math.min(score, 100);

    let color = '#10b981';
    let message = 'Excellent! SEO optimized.';
    if (score <= 50) {
      color = '#ef4444';
      message = 'Needs work. Expand title & status tag.';
    } else if (score <= 80) {
      color = '#f59e0b';
      message = 'Good, but can be improved.';
    }

    return { score, color, message };
  };

  const seo = calculateSEOScore();

  // Live Visitors simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(3, prev + delta);
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Undo / Redo logic
  const handleUndo = () => {
    if (historyIndex > 0) {
      playTick();
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      applyStateSnapshot(historyStack[prevIndex]);
      showToast('Action undone', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      playTick();
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      applyStateSnapshot(historyStack[nextIndex]);
      showToast('Action redone', 'info');
    }
  };

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, historyStack, customDomain, heroTitle, statusTag, primaryCta, secondaryCta, photoUrl, themeColor, fontFamily, maintenanceMode]);

  // AI Content Generator
  const [aiLoading, setAiLoading] = useState(false);
  const handleAIGenerate = () => {
    playTick();
    setAiLoading(true);
    setTimeout(() => {
      const prompts = [
        {
          title: "Crafting High-Performance Full-Stack Systems.",
          status: "Available for SWE Internships & Roles",
          p: "Explore Projects",
          s: "Download Resume"
        },
        {
          title: "Full-Stack MERN Developer & Systems Builder.",
          status: "Open to Full-Time & Remote Roles",
          p: "View Live Demos",
          s: "Let's Connect"
        },
        {
          title: "Hi, I'm Ayush Prajapati — Software Engineer.",
          status: "B.Tech CSE @ SISTec Bhopal · CGPA: 8.42",
          p: "Featured Work",
          s: "Get in Touch"
        },
        {
          title: "Architecting Scalable React & Node.js Applications.",
          status: "Actively Interviewing for Engineering Roles",
          p: "Browse Code",
          s: "Schedule Chat"
        }
      ];
      const pick = prompts[Math.floor(Math.random() * prompts.length)];
      setHeroTitle(pick.title);
      setStatusTag(pick.status);
      setPrimaryCta(pick.p);
      setSecondaryCta(pick.s);
      setAiLoading(false);

      const nextState = {
        ...getCurrentState(),
        heroTitle: pick.title,
        statusTag: pick.status,
        primaryCta: pick.p,
        secondaryCta: pick.s
      };
      pushHistory(nextState);
      triggerAutosave();
      showToast('AI copy generated successfully!', 'success');
    }, 900);
  };

  // Image Upload Handling (opens Cropper Modal)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB.', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImageSrc(event.target.result);
      setCropScale(1);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Cropper logic
  const handleZoom = (delta) => {
    setCropScale((prev) => {
      const next = prev + delta;
      return Math.min(Math.max(next, 0.5), 3);
    });
  };

  const handleApplyCrop = async () => {
    playTick();
    const canvas = document.createElement('canvas');
    const size = 420;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = cropImageSrc;
    img.onload = async () => {
      const sourceSize = Math.min(img.width, img.height) / cropScale;
      const sx = (img.width - sourceSize) / 2;
      const sy = (img.height - sourceSize) / 2;
      ctx.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
      const croppedUrl = canvas.toDataURL('image/webp', 0.85);

      setPhotoUrl(croppedUrl);

      // Save to media library
      const updatedLib = Array.from(new Set([croppedUrl, ...mediaLibrary]));
      setMediaLibrary(updatedLib);
      try {
        localStorage.setItem('ayush_media_library', JSON.stringify(updatedLib.slice(0, 20)));
      } catch (_e) {}

      setCropModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      const nextState = { ...getCurrentState(), photoUrl: croppedUrl };
      pushHistory(nextState);
      triggerAutosave();
      showToast('Image cropped & set as Hero Portrait!', 'success');
    };
  };

  // Select Image from Media Library
  const handleSelectMedia = (url) => {
    playTick();
    setPhotoUrl(url);
    setMediaModalOpen(false);
    const nextState = { ...getCurrentState(), photoUrl: url };
    pushHistory(nextState);
    triggerAutosave();
    showToast('Portrait image selected from library!', 'success');
  };

  // Toggle Maintenance Mode
  const handleToggleMaintenance = () => {
    playTick();
    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    showToast(
      nextVal ? 'Maintenance Mode activated on preview!' : 'Maintenance Mode deactivated',
      nextVal ? 'warn' : 'success'
    );
    const nextState = { ...getCurrentState(), maintenanceMode: nextVal };
    pushHistory(nextState);
    triggerAutosave();
  };

  // Export JSON Backup
  const handleExportData = () => {
    playTick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(getCurrentState(), null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `hero_settings_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Hero settings backup downloaded!', 'success');
  };

  // Import JSON Backup
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        applyStateSnapshot(parsed);
        pushHistory(parsed);
        setBackupModalOpen(false);
        showToast('Settings restored from JSON backup!', 'success');
      } catch (_err) {
        showToast('Invalid JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Save Hero Config to Global App State & Backend
  const handleSave = (e) => {
    if (e) e.preventDefault();

    if (!heroTitle.trim()) {
      setTitleError(true);
      showToast('Main Hero Title cannot be empty!', 'error');
      return;
    }
    setTitleError(false);

    playTick();
    setIsSaving(true);

    const updatedProfile = {
      ...p,
      headline: heroTitle.trim(),
      supportingHeadline: heroTitle.trim(),
      availabilityLabel: statusTag.trim(),
      primaryCtaText: primaryCta.trim(),
      secondaryCtaText: secondaryCta.trim(),
      photoUrl: photoUrl.trim(),
      portrait: {
        ...(p.portrait || {}),
        url: photoUrl.trim(),
        alt: imageAltText.trim()
      },
      customDomain: customDomain.trim(),
      portfolioSlug: portfolioSlug.trim(),
      themeColor,
      fontFamily
    };

    const updatedSettings = {
      ...settings,
      maintenanceMode
    };

    updateAppState((prev) => ({
      ...prev,
      profile: updatedProfile,
      settings: updatedSettings
    }), session?.token);

    // Save to localStorage as ultimate
    try {
      localStorage.setItem('heroSettingsUltimate', JSON.stringify(getCurrentState()));
    } catch (_e) {}

    setTimeout(() => {
      setIsSaving(false);
      showToast('Hero Portrait & CTA settings saved successfully!', 'success');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* 0. TOP ACTION BANNER — consistent with all other admin tabs */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: 'var(--brand-color, #06b6d4)' }}>
            <i className="fa-solid fa-image" /> HERO SECTION STUDIO
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Hero Portrait & Config</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your hero image, headline, CTA buttons, and live preview settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-xs px-3 py-1.5 rounded-xl border flex items-center gap-2 ${autosaveStatus === 'saving' ? 'border-amber-400/30 bg-amber-500/10 text-amber-400' : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-400'}`}>
            {autosaveStatus === 'saving' ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-circle-check" />}
            {autosaveStatus === 'saving' ? 'Saving draft...' : 'Saved to draft'}
          </span>
          <button
            type="button"
            className="btn-create-project"
            style={{ background: 'linear-gradient(135deg, var(--brand-color, #06b6d4), var(--accent-2, #3b82f6))', boxShadow: '0 4px 20px var(--brand-glow, rgba(6,182,212,0.4))' }}
            onClick={handleSave}
            disabled={isSaving}
          >
            <i className={isSaving ? 'fa-solid fa-circle-check' : 'fa-solid fa-floppy-disk'} />
            <span>{isSaving ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* 1. TOP STICKY NAVBAR CONFIG BAR */}
      <div className="hero-top-navbar">
        <div className="hero-top-left">
          <div className="hero-config-title">
            <i className="fa-solid fa-sliders text-cyan-400" />
            <span>Hero Portrait & Config</span>
          </div>

          <span className={`hero-autosave-status ${autosaveStatus}`}>
            {autosaveStatus === 'saving' ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                <span>Saving draft...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-circle-check" />
                <span>Saved to draft</span>
              </>
            )}
          </span>
        </div>

        <div className="hero-top-right">
          {/* Maintenance Switch */}
          <label className="hero-toggle-label" title="Toggle Maintenance Mode Overlay">
            <span>Maintenance</span>
            <div className="hero-toggle-switch">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={handleToggleMaintenance}
              />
              <span className="hero-slider" />
            </div>
          </label>

          {/* Backup / Restore Button */}
          <button
            type="button"
            className="btn-hero-action"
            onClick={() => {
              playTick();
              setBackupModalOpen(true);
            }}
            title="Export or Import Hero JSON Data"
          >
            <i className="fa-solid fa-database text-purple-400" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            className={`btn-hero-action btn-hero-primary ${isSaving ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-circle-check" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. STATS GRID (4 METRICS) */}
      <div className="hero-stats-grid">
        <div className="hero-stat-card">
          <div className="hero-stat-icon cyan">
            <i className="fa-solid fa-eye" />
          </div>
          <div className="hero-stat-info">
            <h4>Total Page Views</h4>
            <h3>1,240</h3>
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="hero-stat-icon green">
            <i className="fa-solid fa-users" />
          </div>
          <div className="hero-stat-info">
            <h4>Live Visitors</h4>
            <h3>
              <span className="hero-live-dot" />
              <span>{liveVisitors} online</span>
            </h3>
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="hero-stat-icon amber">
            <i className="fa-solid fa-arrow-pointer" />
          </div>
          <div className="hero-stat-info">
            <h4>Button Clicks</h4>
            <h3>342</h3>
          </div>
        </div>

        <div className="hero-stat-card">
          <div className="hero-stat-icon purple">
            <i className="fa-solid fa-file-arrow-down" />
          </div>
          <div className="hero-stat-info">
            <h4>Resume Downloads</h4>
            <h3>87</h3>
          </div>
        </div>
      </div>

      {/* 3. MAIN LIVE EDITOR CARD */}
      <div className="glass-card-admin p-6 sm:p-8">
        <div className="card-header border-b border-white/10 pb-4 mb-6">
          <h2 className="card-title flex items-center gap-2.5 text-lg font-bold text-white">
            <i className="fa-solid fa-laptop-code text-cyan-400" />
            <span>Interactive Live Hero Editor</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Real-time preview & configuration
          </span>
        </div>

        <form onSubmit={handleSave} id="heroForm">
          <div className="hero-editor-grid">
            {/* ================= LEFT SIDE: FORM CONTROLS ================= */}
            <div>
              {/* SEO Content Score */}
              <div className="hero-seo-meter">
                <div
                  className="hero-seo-circle"
                  style={{
                    background: `conic-gradient(${seo.color} ${seo.score * 3.6}deg, rgba(255,255,255,0.08) ${seo.score * 3.6}deg)`
                  }}
                >
                  <span>{seo.score}</span>
                </div>
                <div className="hero-seo-text">
                  <h4>SEO Content Score</h4>
                  <p style={{ color: seo.color }}>{seo.message}</p>
                </div>
              </div>

              {/* Toolbar with Undo / Redo & AI Generate */}
              <div className="hero-toolbar">
                <button
                  type="button"
                  className="btn-hero-action px-3 py-1.5 text-xs"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Undo (Ctrl+Z)"
                >
                  <i className="fa-solid fa-rotate-left" />
                  <span>Undo</span>
                </button>

                <button
                  type="button"
                  className="btn-hero-action px-3 py-1.5 text-xs"
                  onClick={handleRedo}
                  disabled={historyIndex >= historyStack.length - 1}
                  title="Redo (Ctrl+Y)"
                >
                  <i className="fa-solid fa-rotate-right" />
                  <span>Redo</span>
                </button>

                <div style={{ flex: 1 }} />

                <button
                  type="button"
                  className="btn-ai-gen"
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  title="Generate high-converting hero headlines & copy"
                >
                  <i className={`fa-solid ${aiLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`} />
                  <span>{aiLoading ? 'Generating...' : 'AI Generate'}</span>
                </button>
              </div>

              {/* Hero Image Controls */}
              <div className="hero-form-group">
                <label>
                  <span>Hero Portrait Image</span>
                  <span className="text-[11px] font-mono text-slate-500">1:1 Square recommended</span>
                </label>

                <div className="flex gap-2.5">
                  <div className="hero-file-upload-wrapper flex-1">
                    <button type="button" className="hero-file-upload-btn">
                      <i className="fa-solid fa-cloud-arrow-up text-cyan-400" />
                      <span>Upload & Crop Image</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-hero-action px-4"
                    onClick={() => {
                      playTick();
                      setMediaModalOpen(true);
                    }}
                    title="Select from Media Library"
                  >
                    <i className="fa-solid fa-images text-cyan-400" />
                    <span>Library</span>
                  </button>
                </div>

                <div className="mt-2.5">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => handleFieldChange(setPhotoUrl, e.target.value)}
                    placeholder="Or enter direct image URL (https://...)"
                    className="hero-form-control text-xs"
                  />
                </div>

                <div className="mt-2.5">
                  <input
                    type="text"
                    value={imageAltText}
                    onChange={(e) => handleFieldChange(setImageAltText, e.target.value)}
                    placeholder="Image Alt Text (e.g. Ayush Prajapati - Software Engineer)"
                    className="hero-form-control text-xs"
                  />
                </div>
              </div>

              {/* Custom Domain & URL Slug */}
              <div className="hero-row-inputs">
                <div className="hero-form-group">
                  <label>
                    <span>Custom Domain</span>
                  </label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => handleFieldChange(setCustomDomain, e.target.value)}
                    placeholder="e.g. ayush.dev"
                    className="hero-form-control"
                  />
                </div>

                <div className="hero-form-group">
                  <label>
                    <span>URL Slug</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={portfolioSlug}
                      onKeyDown={() => setSlugManual(true)}
                      onChange={(e) => handleFieldChange(setPortfolioSlug, e.target.value)}
                      placeholder="e.g. hero-section"
                      className="hero-form-control pr-9"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                      <i className="fa-solid fa-link" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Title (Required) */}
              <div className="hero-form-group">
                <label>
                  <span>
                    Main Hero Title <span className="required-star">*</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{heroTitle.length} chars</span>
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => {
                    handleFieldChange(setHeroTitle, e.target.value, true);
                    if (e.target.value.trim()) setTitleError(false);
                  }}
                  placeholder="e.g. Hi, I'm Ayush."
                  className={`hero-form-control ${titleError ? 'error' : ''}`}
                />
                {titleError && (
                  <div className="hero-error-msg">
                    <i className="fa-solid fa-circle-exclamation" />
                    <span>Hero Title is required and cannot be empty.</span>
                  </div>
                )}
              </div>

              {/* Status Badge Tag */}
              <div className="hero-form-group">
                <label>
                  <span>Status Badge Tag</span>
                  <span className="text-[11px] font-mono text-slate-500">{statusTag.length} chars</span>
                </label>
                <input
                  type="text"
                  value={statusTag}
                  onChange={(e) => handleFieldChange(setStatusTag, e.target.value)}
                  placeholder="e.g. Open to SWE Internships"
                  className="hero-form-control"
                />
              </div>

              {/* CTA Buttons */}
              <div className="hero-row-inputs">
                <div className="hero-form-group">
                  <label>
                    <span>Primary Button Text</span>
                  </label>
                  <input
                    type="text"
                    value={primaryCta}
                    onChange={(e) => handleFieldChange(setPrimaryCta, e.target.value)}
                    placeholder="e.g. View Projects"
                    className="hero-form-control"
                  />
                </div>

                <div className="hero-form-group">
                  <label>
                    <span>Secondary Button Text</span>
                  </label>
                  <input
                    type="text"
                    value={secondaryCta}
                    onChange={(e) => handleFieldChange(setSecondaryCta, e.target.value)}
                    placeholder="e.g. Contact Me"
                    className="hero-form-control"
                  />
                </div>
              </div>

              {/* Brand Color & Font Family */}
              <div className="hero-row-inputs">
                <div className="hero-form-group">
                  <label>
                    <span>Brand Color Accent</span>
                    <span className="font-mono text-xs text-cyan-400">{themeColor}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => handleFieldChange(setThemeColor, e.target.value)}
                      className="h-10 w-14 rounded-lg bg-transparent border border-white/15 cursor-pointer p-0.5"
                    />

                    <div className="hero-theme-presets">
                      {[
                        { color: '#0ea5e9', name: 'Cyan' },
                        { color: '#8b5cf6', name: 'Purple' },
                        { color: '#f59e0b', name: 'Amber' },
                        { color: '#10b981', name: 'Emerald' },
                        { color: '#ef4444', name: 'Rose' }
                      ].map((preset) => (
                        <div
                          key={preset.color}
                          className={`hero-preset-circle ${themeColor.toLowerCase() === preset.color.toLowerCase() ? 'active' : ''}`}
                          style={{ background: preset.color }}
                          onClick={() => {
                            playTick();
                            handleFieldChange(setThemeColor, preset.color);
                          }}
                          title={`Select ${preset.name}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hero-form-group">
                  <label>
                    <span>Typography Font</span>
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => handleFieldChange(setFontFamily, e.target.value)}
                    className="hero-form-control cursor-pointer"
                  >
                    <option value="'Inter', sans-serif">Inter (Modern & Clean)</option>
                    <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech & Cyber)</option>
                    <option value="'Outfit', sans-serif">Outfit (Bold & Geometric)</option>
                    <option value="'JetBrains Mono', monospace">JetBrains Mono (Developer)</option>
                    <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Sleek)</option>
                  </select>
                </div>
              </div>

              {/* Bottom Save Trigger */}
              <div className="pt-2">
                <button
                  type="submit"
                  className={`btn-hero-action btn-hero-primary w-full py-3 text-sm font-bold ${isSaving ? 'saved' : ''}`}
                  disabled={isSaving}
                >
                  <i className={`fa-solid ${isSaving ? 'fa-circle-check' : 'fa-floppy-disk'}`} />
                  <span>{isSaving ? 'Saved to Portfolio!' : 'Save & Publish Hero Configuration'}</span>
                </button>
              </div>
            </div>

            {/* ================= RIGHT SIDE: LIVE MOCKUP PREVIEW ================= */}
            <div>
              <div className="hero-preview-header">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-Time Live Preview</span>
                </span>

                <div className="hero-device-toggles">
                  <button
                    type="button"
                    className={`hero-device-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
                    onClick={() => {
                      playTick();
                      setDeviceMode('desktop');
                    }}
                    title="Desktop Preview"
                  >
                    <i className="fa-solid fa-desktop" />
                  </button>

                  <button
                    type="button"
                    className={`hero-device-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
                    onClick={() => {
                      playTick();
                      setDeviceMode('mobile');
                    }}
                    title="Mobile View"
                  >
                    <i className="fa-solid fa-mobile-screen" />
                  </button>
                </div>
              </div>

              <div className="hero-mockup-wrapper">
                <div
                  className={`hero-mockup-container ${deviceMode === 'mobile' ? 'mobile' : ''}`}
                  style={{ fontFamily }}
                >
                  {/* Maintenance Mode Overlay */}
                  {maintenanceMode && (
                    <div className="hero-maintenance-overlay">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl mb-3 shadow-lg shadow-amber-500/20">
                        <i className="fa-solid fa-screwdriver-wrench animate-bounce" />
                      </div>
                      <h2>Under Maintenance</h2>
                      <p className="text-xs text-slate-400 max-w-[240px] mt-1">
                        Site is currently in maintenance mode for scheduled updates.
                      </p>
                    </div>
                  )}

                  {/* Browser Bar */}
                  <div className="hero-mockup-browser-bar">
                    <div className="hero-browser-dot hero-dot-red" />
                    <div className="hero-browser-dot hero-dot-yellow" />
                    <div className="hero-browser-dot hero-dot-green" />
                    <div className="hero-mockup-url-bar">
                      {customDomain}/{portfolioSlug}
                    </div>
                  </div>

                  {/* Mockup Stage Content */}
                  <div className="hero-mockup-stage">
                    {/* Dynamic Accent Color Glow */}
                    <div
                      className="hero-mockup-accent-glow"
                      style={{ background: themeColor }}
                    />

                    <div className="hero-mockup-text">
                      <div className="hero-mockup-status-badge">
                        <div className="hero-mockup-status-dot" />
                        <span>{statusTag || 'Open to SWE Roles'}</span>
                      </div>

                      <div className="hero-mockup-title">
                        <span>{heroTitle || "Hi, I'm Ayush."}</span>
                      </div>

                      <div className="hero-mockup-cta-wrap">
                        <button
                          type="button"
                          className="hero-mockup-btn-primary"
                          style={{
                            background: themeColor,
                            boxShadow: `0 4px 15px ${themeColor}40`
                          }}
                        >
                          {primaryCta || 'View Projects'}
                        </button>
                        <button
                          type="button"
                          className="hero-mockup-btn-secondary"
                        >
                          {secondaryCta || 'Contact Me'}
                        </button>
                      </div>
                    </div>

                    <div
                      className="hero-mockup-avatar-wrap"
                      style={{
                        borderColor: `${themeColor}60`,
                        boxShadow: `0 0 25px ${themeColor}30`
                      }}
                    >
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={imageAltText || 'Hero Portrait'}
                          className="hero-mockup-avatar-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<i class="fa-solid fa-user text-3xl text-slate-500"></i>';
                          }}
                        />
                      ) : (
                        <i className="fa-solid fa-user text-3xl text-slate-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ================= MODAL 1: CROPPER MODAL ================= */}
      {cropModalOpen && (
        <div className="premium-modal active" onClick={() => setCropModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title flex items-center gap-2">
                <i className="fa-solid fa-crop text-cyan-400" />
                <span>Crop Portrait (1:1 Aspect)</span>
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setCropModalOpen(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="hero-crop-container">
              <img
                ref={cropImgRef}
                src={cropImageSrc}
                alt="To Crop"
                style={{ transform: `scale(${cropScale})` }}
              />
            </div>

            <div className="hero-crop-controls">
              <button
                type="button"
                className="btn-hero-action text-xs"
                onClick={() => handleZoom(0.15)}
                title="Zoom In"
              >
                <i className="fa-solid fa-magnifying-glass-plus" />
                <span>Zoom In</span>
              </button>
              <button
                type="button"
                className="btn-hero-action text-xs"
                onClick={() => handleZoom(-0.15)}
                title="Zoom Out"
              >
                <i className="fa-solid fa-magnifying-glass-minus" />
                <span>Zoom Out</span>
              </button>
              <button
                type="button"
                className="btn-hero-action btn-hero-primary text-xs"
                onClick={handleApplyCrop}
              >
                <i className="fa-solid fa-check" />
                <span>Apply Crop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: MEDIA LIBRARY ================= */}
      {mediaModalOpen && (
        <div className="premium-modal active" onClick={() => setMediaModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title flex items-center gap-2">
                <i className="fa-solid fa-images text-cyan-400" />
                <span>Hero Media Library</span>
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setMediaModalOpen(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Select any previously uploaded or preset portrait photo to apply immediately.
            </p>

            <div className="hero-media-grid">
              {mediaLibrary.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Library media ${idx}`}
                  className={`hero-media-item ${photoUrl === url ? 'ring-2 ring-cyan-400 scale-[1.03]' : ''}`}
                  onClick={() => handleSelectMedia(url)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: DATA BACKUP & RESTORE ================= */}
      {backupModalOpen && (
        <div className="premium-modal active" onClick={() => setBackupModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title flex items-center gap-2">
                <i className="fa-solid fa-database text-purple-400" />
                <span>Hero Config Backup & Restore</span>
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setBackupModalOpen(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Export your current Hero configuration to a JSON file or restore from a previous backup file.
            </p>

            <div className="space-y-3.5">
              <button
                type="button"
                className="btn-hero-action btn-hero-primary w-full py-2.5 text-xs font-bold"
                onClick={handleExportData}
              >
                <i className="fa-solid fa-download" />
                <span>Export Hero Config JSON</span>
              </button>

              <div className="hero-file-upload-wrapper">
                <button type="button" className="btn-hero-action w-full py-2.5 text-xs font-semibold">
                  <i className="fa-solid fa-upload text-cyan-400" />
                  <span>Import Hero Config JSON</span>
                </button>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportData}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHeroPortrait;
