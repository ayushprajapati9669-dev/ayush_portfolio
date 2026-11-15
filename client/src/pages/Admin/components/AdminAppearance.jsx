import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../services/api';
import { playTick } from '../../../utils/audio';

const ACCENT_PRESETS = [
  { name: 'Luxury Gold', hex: '#dfb740', description: 'Editorial VSLFlow Gold' },
  { name: 'Electric Cyan', hex: '#06b6d4', description: 'Modern Cyber Cyan' },
  { name: 'Emerald Wave', hex: '#10b981', description: 'Vibrant Systems Emerald' },
  { name: 'Neo Purple', hex: '#8b5cf6', description: 'High-Tech Deep Purple' },
  { name: 'Sunset Rose', hex: '#f43f5e', description: 'Bold High-Contrast Rose' },
  { name: 'Solar Amber', hex: '#f59e0b', description: 'Warm Amber Glow' }
];

const BG_PRESETS = [
  { name: 'Pure Obsidian', hex: '#000000', surface: '#0a0a0f' },
  { name: 'Midnight Charcoal', hex: '#05070f', surface: '#0f1422' },
  { name: 'Deep Slate', hex: '#0a0d14', surface: '#121826' },
  { name: 'Abyssal Black', hex: '#020204', surface: '#0b0b10' }
];

const FONT_PRESETS = [
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", category: 'Modern Tech' },
  { name: 'Cormorant Garamond', family: "'Cormorant Garamond', Georgia, serif", category: 'Editorial Luxury' },
  { name: 'Inter', family: "'Inter', sans-serif", category: 'Clean Swiss' },
  { name: 'Jost', family: "'Jost', sans-serif", category: 'Geometric UI' },
  { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", category: 'Developer Terminal' }
];

export function AdminAppearance({
  appState,
  updateAppState,
  session,
  showToast
}) {
  const currentSettings = appState.settings || {};

  const [form, setForm] = useState({
    themeMode: currentSettings.themeMode || 'dark',
    accentColor: currentSettings.accentColor || '#dfb740',
    bgBase: currentSettings.bgBase || '#000000',
    bgSurface: currentSettings.bgSurface || '#0a0a0f',
    fontHeading: currentSettings.fontHeading || "'Plus Jakarta Sans', sans-serif",
    fontBody: currentSettings.fontBody || "'Plus Jakarta Sans', sans-serif",
    glowIntensity: currentSettings.glowIntensity || 'medium',
    particlesEnabled: currentSettings.particlesEnabled !== undefined ? currentSettings.particlesEnabled : true
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  useEffect(() => {
    setForm({
      themeMode: currentSettings.themeMode || 'dark',
      accentColor: currentSettings.accentColor || '#dfb740',
      bgBase: currentSettings.bgBase || '#000000',
      bgSurface: currentSettings.bgSurface || '#0a0a0f',
      fontHeading: currentSettings.fontHeading || "'Plus Jakarta Sans', sans-serif",
      fontBody: currentSettings.fontBody || "'Plus Jakarta Sans', sans-serif",
      glowIntensity: currentSettings.glowIntensity || 'medium',
      particlesEnabled: currentSettings.particlesEnabled !== undefined ? currentSettings.particlesEnabled : true
    });
    setIsDirty(false);
  }, [currentSettings.updatedAt]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      setIsDirty(true);
      return next;
    });
  };

  const applyPreviewToDom = () => {
    playTick();
    const root = document.documentElement;
    root.style.setProperty('--brand-color', form.accentColor);
    root.style.setProperty('--accent-primary', form.accentColor);
    root.style.setProperty('--gold', form.accentColor);
    root.style.setProperty('--brand-cyan', form.accentColor);
    root.style.setProperty('--bg-base', form.bgBase);
    root.style.setProperty('--bg-surface', form.bgSurface);
    root.style.setProperty('--font-heading', form.fontHeading);
    root.style.setProperty('--font-sans', form.fontBody);
    root.setAttribute('data-theme', form.themeMode);
    setPreviewActive(true);
    showToast('Live DOM preview applied! (Not saved until published)', 'info');
  };

  const handleReset = () => {
    playTick();
    setForm({
      themeMode: 'dark',
      accentColor: '#dfb740',
      bgBase: '#000000',
      bgSurface: '#0a0a0f',
      fontHeading: "'Plus Jakarta Sans', sans-serif",
      fontBody: "'Plus Jakarta Sans', sans-serif",
      glowIntensity: 'medium',
      particlesEnabled: true
    });
    setIsDirty(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    playTick();

    // Validation
    const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    if (!hexRegex.test(form.accentColor)) {
      showToast('Accent color must be a valid hex code (e.g. #dfb740).', 'error');
      return;
    }
    if (!hexRegex.test(form.bgBase) || !hexRegex.test(form.bgSurface)) {
      showToast('Background and surface colors must be valid hex codes.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...currentSettings,
        themeMode: form.themeMode,
        accentColor: form.accentColor,
        bgBase: form.bgBase,
        bgSurface: form.bgSurface,
        fontHeading: form.fontHeading,
        fontBody: form.fontBody,
        glowIntensity: form.glowIntensity,
        particlesEnabled: Boolean(form.particlesEnabled)
      };

      // 1. Persist directly through protected admin API
      const res = await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: payload
      });

      // 2. Update local state and trigger cross-tab broadcast
      updateAppState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...(res.settings || payload)
        }
      }), session?.csrfToken || session?.token);

      setIsSaving(false);
      setIsDirty(false);
      setPreviewActive(false);
      showToast('Appearance settings saved and published successfully!', 'success');
    } catch (err) {
      setIsSaving(false);
      showToast(err.message || 'Failed to save appearance settings.', 'error');
    }
  };

  return (
    <div className="admin-appearance-page space-y-6 animate-in fade-in duration-300">
      {/* Top Action Banner */}
      <div className="admin-proj-top-banner">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: 'var(--brand-color, #dfb740)' }}>
            <i className="fa-solid fa-palette" /> APPEARANCE & DESIGN SYSTEM
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Appearance & Visual Theme Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure luxury themes, metallic accent palettes, background tones, typography, and interactive particle effects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl border border-white/10 bg-black/40">
            {isDirty ? (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-amber-400 animate-pulse" />
                <span className="text-amber-400 font-semibold">Unsaved Changes</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-check text-emerald-400" />
                <span className="text-emerald-400 font-semibold">All Changes Saved</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={applyPreviewToDom}
            className="flex items-center gap-1.5 font-mono text-xs px-3.5 py-1.5 rounded-xl border border-white/10 bg-black/30 text-yellow-300 hover:bg-yellow-500/10 hover:border-yellow-400/30 transition-all"
            title="Temporarily test these colors on the live page"
          >
            <i className="fa-solid fa-eye" />
            <span>Test Live</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 font-mono text-xs px-4 py-1.5 rounded-xl font-semibold text-black bg-yellow-400 hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/10 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                <span>Saving...</span>
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

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Card 1: Accent Color Presets & Custom Hex */}
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-yellow-400 text-xs" />
                  Primary Brand & Accent Color
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controls metallic glowing elements, buttons, active borders, and highlights.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  title="Choose custom color"
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  className="w-24 font-mono text-xs px-2.5 py-1.5 rounded-lg border border-white/10 bg-black/50 text-white uppercase text-center"
                  placeholder="#dfb740"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACCENT_PRESETS.map((preset) => {
                const isSelected = form.accentColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleChange('accentColor', preset.hex)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-yellow-400/60 bg-yellow-500/10 shadow-sm'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 shadow-sm border border-white/20"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{preset.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{preset.hex}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Background & Surface Tones */}
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-yellow-400 text-xs" />
                Background & Card Surface Palette
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sets the base obsidian canvas and elevated modal/card surface shades.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BG_PRESETS.map((preset) => {
                const isSelected = form.bgBase.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      handleChange('bgBase', preset.hex);
                      handleChange('bgSurface', preset.surface);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-yellow-400/60 bg-yellow-500/10'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex -space-x-2 shrink-0">
                      <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: preset.hex }} />
                      <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: preset.surface }} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{preset.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{preset.hex} / {preset.surface}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Canvas Base Hex (--bg-base)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.bgBase}
                    onChange={(e) => handleChange('bgBase', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.bgBase}
                    onChange={(e) => handleChange('bgBase', e.target.value)}
                    className="flex-1 font-mono text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black/50 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Surface / Panel Hex (--bg-surface)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.bgSurface}
                    onChange={(e) => handleChange('bgSurface', e.target.value)}
                    className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.bgSurface}
                    onChange={(e) => handleChange('bgSurface', e.target.value)}
                    className="flex-1 font-mono text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black/50 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Typography Preferences */}
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <i className="fa-solid fa-font text-yellow-400 text-xs" />
                Typography System Preferences
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure primary display heading and body interface font pairings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">Display & Heading Font</label>
                <div className="admin-select-wrapper w-full relative flex items-center">
                  <select
                    value={form.fontHeading}
                    onChange={(e) => handleChange('fontHeading', e.target.value)}
                    className="admin-select-field appearance-none bg-[#050a14] border border-white/10 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 outline-none cursor-pointer transition-all w-full"
                  >
                    {FONT_PRESETS.map((f) => (
                      <option key={f.name} value={f.family} className="bg-[#0b101b] text-white">
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
                  <i className="admin-select-icon fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 font-sans mb-1.5">Body & UI Font</label>
                <div className="admin-select-wrapper w-full relative flex items-center">
                  <select
                    value={form.fontBody}
                    onChange={(e) => handleChange('fontBody', e.target.value)}
                    className="admin-select-field appearance-none bg-[#050a14] border border-white/10 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 outline-none cursor-pointer transition-all w-full"
                  >
                    {FONT_PRESETS.map((f) => (
                      <option key={f.name} value={f.family} className="bg-[#0b101b] text-white">
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
                  <i className="admin-select-icon fa-solid fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Particle Systems & Visual Preferences */}
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <i className="fa-solid fa-atom text-yellow-400 text-xs" />
                Visual Effects & Particle Animation Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Control interactive 3D WebGL particle buffers and ambient glow intensity.
              </p>
            </div>

            {/* Toggle: Particles */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <i className="fa-solid fa-sparkles text-yellow-400" />
                  Interactive 3D Particles
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Renders the cinematic morphing particle card and dynamic background effects.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.particlesEnabled}
                onClick={() => handleChange('particlesEnabled', !form.particlesEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  form.particlesEnabled ? 'bg-yellow-400' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                    form.particlesEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Glow Intensity */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">Metallic Glow Intensity</label>
              <div className="grid grid-cols-3 gap-3">
                {['subtle', 'medium', 'vibrant'].map((level) => {
                  const isSelected = form.glowIntensity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleChange('glowIntensity', level)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all ${
                        isSelected
                          ? 'border-yellow-400/60 bg-yellow-500/10 text-yellow-300 font-bold'
                          : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Simulation Card (5 cols) */}
        <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-6">
          <div className="glass-card-admin p-6 rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                <i className="fa-solid fa-display text-yellow-400" />
                Live Design Simulation
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
                Simulated Canvas
              </span>
            </div>

            {/* Simulated Stage Box */}
            <div
              className="p-5 rounded-xl border transition-all space-y-4"
              style={{
                backgroundColor: form.bgBase,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              }}
            >
              {/* Simulated Card Surface */}
              <div
                className="p-4 rounded-xl border space-y-3.5 shadow-xl transition-all"
                style={{
                  backgroundColor: form.bgSurface,
                  borderColor: form.accentColor + '33',
                  boxShadow: `0 10px 25px -5px ${form.accentColor}15`
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-md border font-semibold"
                    style={{
                      borderColor: form.accentColor + '55',
                      backgroundColor: form.accentColor + '18',
                      color: form.accentColor
                    }}
                  >
                    THEME & COMPONENT PREVIEW
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {form.themeName || 'Custom'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: form.accentColor }} />
                    Heading Font · {form.fontHeading}
                  </div>
                  <h4
                    className="text-lg font-bold leading-tight"
                    style={{ fontFamily: form.fontHeading }}
                  >
                    Crafting High-Performance User Experiences
                  </h4>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    Body Font · {form.fontBody}
                  </div>
                  <p
                    className="text-xs text-slate-300 leading-relaxed"
                    style={{ fontFamily: form.fontBody }}
                  >
                    This card simulates your live portfolio design. As you customize accents, typography, surface depth, and glow intensity, buttons and badges dynamically update here.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-lg text-black transition-all shadow-md flex items-center gap-1.5"
                    style={{
                      backgroundColor: form.accentColor,
                      fontFamily: form.fontBody,
                      boxShadow: form.glowIntensity === 'vibrant'
                        ? `0 0 16px ${form.accentColor}66`
                        : form.glowIntensity === 'medium'
                        ? `0 0 10px ${form.accentColor}44`
                        : 'none'
                    }}
                  >
                    <span>Primary Action</span>
                    <i className="fa-solid fa-arrow-right text-[10px]" />
                  </button>
                  <button
                    type="button"
                    className="text-xs px-3 py-1.5 rounded-lg border text-white transition-all bg-white/[0.03] hover:bg-white/[0.08]"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      fontFamily: form.fontBody
                    }}
                  >
                    Secondary Outline
                  </button>
                  <span
                    className="text-[10px] font-mono px-2 py-1 rounded-md ml-auto"
                    style={{
                      backgroundColor: form.accentColor + '20',
                      color: form.accentColor,
                      border: `1px solid ${form.accentColor}44`
                    }}
                  >
                    Badge Sample
                  </span>
                </div>
              </div>

              {/* Simulated Status Indicators */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: form.accentColor }} />
                  Accent: <code className="text-white">{form.accentColor}</code>
                </span>
                <span className="text-right">
                  Base: <code className="text-white">{form.bgBase}</code>
                </span>
                <span>
                  Particles: <span className={form.particlesEnabled ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{form.particlesEnabled ? 'Active' : 'Disabled'}</span>
                </span>
                <span className="text-right">
                  Glow: <span className="text-yellow-400 capitalize">{form.glowIntensity}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-black bg-yellow-400 hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    <span>Publishing to Database...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" />
                    <span>Publish Appearance Settings</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 px-4 rounded-xl font-mono text-xs text-slate-400 hover:text-white border border-white/5 hover:border-white/20 transition-all text-center"
              >
                Reset to Default Design System
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAppearance;
