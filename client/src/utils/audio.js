// =============================================================================
// Soundscape Studio & Mechanical Keyboard Audio Synthesizer (Web Audio API)
// Provides zero-latency, asset-free tactile mechanical keyboard switch presets
// and generative ambient Lo-Fi coding drone loops.
// =============================================================================

let audioCtx = null;
let lofiOsc1 = null;
let lofiOsc2 = null;
let lofiOsc3 = null;
let lofiGain = null;
let isLofiActive = false;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Stored preferences with defaults
export function getSoundSettings() {
  if (typeof window === 'undefined') {
    return { enabled: true, preset: 'blue', volume: 0.6, lofiEnabled: false, lofiVolume: 0.25 };
  }
  try {
    const saved = localStorage.getItem('ayush_soundscape_v1');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return { enabled: true, preset: 'blue', volume: 0.6, lofiEnabled: false, lofiVolume: 0.25 };
}

export function saveSoundSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('ayush_soundscape_v1', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('ayush-sound-settings-changed', { detail: settings }));
  } catch (e) {}
}

/**
 * Synthesizes a mechanical keyboard click or UI tick based on user's active preset.
 * Presets:
 *  - 'blue': Cherry MX Blue (crisp, sharp tactile dual-click)
 *  - 'brown': Cherry MX Brown (subtle, warm tactile bump)
 *  - 'cream': Thocky Cream Switch (deep, low-pass filtered resonant clack)
 *  - 'default': Subtle high-tech sine tick
 */
export function playTick(customPreset = null) {
  if (typeof window === 'undefined') return;
  try {
    const settings = getSoundSettings();
    if (!settings.enabled) return;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const preset = customPreset || settings.preset || 'blue';
    const masterVol = Math.max(0, Math.min(1, settings.volume ?? 0.6));
    const now = ctx.currentTime;

    if (preset === 'blue') {
      // Cherry MX Blue: Dual-stage sharp click (slider + click leaf)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(2400, now);
      osc1.frequency.exponentialRampToValueAtTime(800, now + 0.025);

      gain1.gain.setValueAtTime(0.04 * masterVol, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(4200, now + 0.006);
      osc2.frequency.exponentialRampToValueAtTime(1400, now + 0.035);

      gain2.gain.setValueAtTime(0.025 * masterVol, now + 0.006);
      gain2.gain.exponentialRampToValueAtTime(0.0008, now + 0.035);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.03);
      osc2.start(now + 0.006);
      osc2.stop(now + 0.04);
    } else if (preset === 'brown') {
      // Cherry MX Brown: Gentle tactile resistance bump, lower frequency
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);

      gain.gain.setValueAtTime(0.05 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } else if (preset === 'cream') {
      // Thocky Cream Switch: Deep, muted wooden / marble thock with low pass filter
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.055);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.055);

      gain.gain.setValueAtTime(0.08 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      // Default subtle sine UI tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(0.02 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (_e) {
    // Ignore audio failures silently
  }
}

// =============================================================================
// Ambient Lo-Fi Binaural Drone Synthesizer
// Generates warm, calming 432Hz ambient chord harmonies for deep coding focus.
// =============================================================================

export function startLofiAmbient(customVol = null) {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (isLofiActive) return;

    const settings = getSoundSettings();
    const volume = customVol !== null ? customVol : (settings.lofiVolume ?? 0.25);

    lofiGain = ctx.createGain();
    lofiGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    lofiGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume * 0.08), ctx.currentTime + 2.0);

    // Warm chord drone: A2 (108Hz), E3 (162Hz), C#4 (277Hz)
    lofiOsc1 = ctx.createOscillator();
    lofiOsc2 = ctx.createOscillator();
    lofiOsc3 = ctx.createOscillator();

    lofiOsc1.type = 'sine';
    lofiOsc1.frequency.setValueAtTime(108, ctx.currentTime);

    lofiOsc2.type = 'triangle';
    lofiOsc2.frequency.setValueAtTime(162, ctx.currentTime);

    lofiOsc3.type = 'sine';
    lofiOsc3.frequency.setValueAtTime(277.18, ctx.currentTime);

    // Gentle low-pass filter to make sound smooth and warm
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    lofiOsc1.connect(filter);
    lofiOsc2.connect(filter);
    lofiOsc3.connect(filter);

    filter.connect(lofiGain);
    lofiGain.connect(ctx.destination);

    lofiOsc1.start();
    lofiOsc2.start();
    lofiOsc3.start();

    isLofiActive = true;
  } catch (e) {
    console.error('Failed to start LoFi synthesizer:', e);
  }
}

export function stopLofiAmbient() {
  if (!isLofiActive) return;
  try {
    const ctx = getAudioContext();
    if (ctx && lofiGain) {
      lofiGain.gain.setValueAtTime(lofiGain.gain.value, ctx.currentTime);
      lofiGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      setTimeout(() => {
        try {
          if (lofiOsc1) { lofiOsc1.stop(); lofiOsc1.disconnect(); lofiOsc1 = null; }
          if (lofiOsc2) { lofiOsc2.stop(); lofiOsc2.disconnect(); lofiOsc2 = null; }
          if (lofiOsc3) { lofiOsc3.stop(); lofiOsc3.disconnect(); lofiOsc3 = null; }
          if (lofiGain) { lofiGain.disconnect(); lofiGain = null; }
        } catch (_err) {}
      }, 1300);
    }
  } catch (_e) {}
  isLofiActive = false;
}

export function setLofiVolume(vol) {
  if (!lofiGain || !audioCtx) return;
  try {
    const clamped = Math.max(0.0001, Math.min(1, vol) * 0.08);
    lofiGain.gain.setValueAtTime(lofiGain.gain.value, audioCtx.currentTime);
    lofiGain.gain.exponentialRampToValueAtTime(clamped, audioCtx.currentTime + 0.1);
  } catch (_e) {}
}

export function isLofiPlaying() {
  return isLofiActive;
}
