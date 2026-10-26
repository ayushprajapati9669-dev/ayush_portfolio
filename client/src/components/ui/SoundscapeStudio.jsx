import React, { useState, useEffect, useRef } from 'react';
import {
  getSoundSettings,
  saveSoundSettings,
  playTick,
  startLofiAmbient,
  stopLofiAmbient,
  setLofiVolume,
  isLofiPlaying
} from '../../utils/audio';

export function SoundscapeStudio() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(getSoundSettings);
  const [isPlayingLofi, setIsPlayingLofi] = useState(isLofiPlaying);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleSettingsChange = (e) => {
      if (e.detail) {
        setSettings(e.detail);
        setIsPlayingLofi(isLofiPlaying());
      }
    };
    window.addEventListener('ayush-sound-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('ayush-sound-settings-changed', handleSettingsChange);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const updateSetting = (key, val) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    saveSoundSettings(next);

    if (key === 'preset') {
      playTick(val);
    }
  };

  const toggleSoundEnabled = () => {
    const nextVal = !settings.enabled;
    updateSetting('enabled', nextVal);
    if (nextVal) playTick();
  };

  const toggleLofi = () => {
    playTick();
    if (isPlayingLofi) {
      stopLofiAmbient();
      setIsPlayingLofi(false);
      updateSetting('lofiEnabled', false);
    } else {
      startLofiAmbient(settings.lofiVolume ?? 0.25);
      setIsPlayingLofi(true);
      updateSetting('lofiEnabled', true);
    }
  };

  const handleLofiVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setLofiVolume(vol);
    updateSetting('lofiVolume', vol);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9990] font-sans" ref={panelRef}>
      {/* Studio Popover Panel */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-2xl border border-white/10 bg-[#090e1a]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 text-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs">
                <i className="fa-solid fa-volume-high" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                  Soundscape Studio
                </h4>
                <p className="text-[10px] text-slate-400">Mechanical switches &amp; Lo-Fi</p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSoundEnabled}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                settings.enabled
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border border-white/10 text-slate-500'
              }`}
            >
              {settings.enabled ? 'FX ON' : 'MUTED'}
            </button>
          </div>

          {/* Switch Presets */}
          <div className="space-y-2 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Mechanical Switch Sound
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'blue', name: 'MX Blue', sub: 'Crisp Clicky' },
                { id: 'brown', name: 'MX Brown', sub: 'Tactile Soft' },
                { id: 'cream', name: 'Cream Thock', sub: 'Deep Thock' }
              ].map((sw) => {
                const isActive = settings.preset === sw.id;
                return (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => updateSetting('preset', sw.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-white/[0.03] border-white/5 hover:border-white/15 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] font-bold font-display">{sw.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">{sw.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Test Key Trigger */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => playTick()}
                className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all"
              >
                <i className="fa-regular fa-keyboard text-[10px] text-cyan-400" />
                <span>Test Switch Sound</span>
              </button>
            </div>
          </div>

          {/* Ambient Lo-Fi BGM Section */}
          <div className="border-t border-white/10 pt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <i className={`fa-solid fa-compact-disc text-xs ${isPlayingLofi ? 'text-purple-400 animate-spin' : 'text-slate-500'}`} />
                <span className="text-[11px] font-bold text-slate-300">Ambient Coding Lo-Fi</span>
              </div>
              <button
                type="button"
                onClick={toggleLofi}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 ${
                  isPlayingLofi
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <i className={`fa-solid ${isPlayingLofi ? 'fa-pause' : 'fa-play'} text-[9px]`} />
                <span>{isPlayingLofi ? 'Stop BGM' : 'Play Lo-Fi'}</span>
              </button>
            </div>

            {isPlayingLofi && (
              <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                <i className="fa-solid fa-volume-low text-[10px] text-slate-500" />
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={settings.lofiVolume ?? 0.25}
                  onChange={handleLofiVolumeChange}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <i className="fa-solid fa-volume-high text-[10px] text-slate-500" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trigger Button with Sound Ripple Indicator */}
      <button
        type="button"
        onClick={() => {
          playTick();
          setIsOpen((prev) => !prev);
        }}
        className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-xl backdrop-blur-xl transition-all duration-300 active:scale-95 ${
          isOpen
            ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)] font-bold'
            : isPlayingLofi
            ? 'bg-[#0b1326] border-purple-500/50 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
            : 'bg-[#080d1a]/85 border-white/15 text-slate-300 hover:text-white hover:border-cyan-400/50 hover:bg-[#0c152a]'
        }`}
        title="Open Soundscape Studio (Audio Presets & Lo-Fi)"
        aria-label="Soundscape Studio"
      >
        <span className="relative flex items-center justify-center">
          <i
            className={`fa-solid ${
              !settings.enabled
                ? 'fa-volume-xmark text-rose-400'
                : isPlayingLofi
                ? 'fa-compact-disc text-purple-400 animate-spin'
                : 'fa-headphones text-cyan-400 group-hover:scale-110'
            } text-xs transition-transform`}
          />
          {isPlayingLofi && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          )}
        </span>
        <span className="text-[11px] font-mono font-medium hidden sm:inline">
          {isPlayingLofi ? 'Lo-Fi Active' : 'Sound FX'}
        </span>
      </button>
    </div>
  );
}

export default SoundscapeStudio;
