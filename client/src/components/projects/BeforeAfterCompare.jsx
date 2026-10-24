import React, { useState } from 'react';
import { playTick } from '../../utils/audio';

const DEFAULT_BEFORE = [
  {
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop',
    title: 'Legacy Monolithic Prototype',
    desc: 'Unstyled forms, race conditions on booking, no optimistic dates, 48 Lighthouse score.'
  }
];

const DEFAULT_AFTER = [
  {
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop',
    title: 'Production Reactive Architecture',
    desc: 'Optimistic calendar state, atomic session locking, sub-50ms search, 92 Lighthouse score.'
  }
];

export function BeforeAfterCompare({
  beforeImages = [],
  afterImages = [],
  onImageClick
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side'

  // Prepare images with realistic fallbacks if empty
  const beforeList = beforeImages && beforeImages.length > 0 ? beforeImages : DEFAULT_BEFORE.map(b => b.url);
  const afterList = afterImages && afterImages.length > 0 ? afterImages : DEFAULT_AFTER.map(a => a.url);

  const primaryBefore = beforeList[0];
  const primaryAfter = afterList[0];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-code-compare text-cyan-400" />
            <span>Visual Evolution (Before & After)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare initial friction vs final battle-tested architecture.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              playTick();
              setViewMode('slider');
            }}
            className={`font-mono text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'slider'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-arrows-left-right text-[10px]" />
            <span>Interactive Slider</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playTick();
              setViewMode('side-by-side');
            }}
            className={`font-mono text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-table-columns text-[10px]" />
            <span>Side by Side</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Slider */}
      {viewMode === 'slider' ? (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 aspect-video select-none shadow-2xl group">
            {/* After Image (Background) */}
            <img
              src={primaryAfter}
              alt="After Optimization"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-emerald-500/90 text-white font-mono text-[11px] font-bold shadow-lg backdrop-blur-md border border-emerald-400/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>AFTER (Optimized Production)</span>
            </div>

            {/* Before Image (Clipped Overlay with clipPath to preserve aspect ratio) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`
              }}
            >
              <img
                src={primaryBefore}
                alt="Before Optimization"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-red-500/90 text-white font-mono text-[11px] font-bold shadow-lg backdrop-blur-md border border-red-400/40 flex items-center gap-1.5">
                <i className="fa-solid fa-triangle-exclamation text-[10px]" />
                <span>BEFORE (Baseline Friction)</span>
              </div>
            </div>

            {/* Glowing Splitter Bar */}
            <div
              className="absolute top-0 bottom-0 z-30 w-1 bg-cyan-400 shadow-[0_0_15px_#38bdf8] pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/90 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center text-xs shadow-lg">
                <i className="fa-solid fa-arrows-left-right" />
              </div>
            </div>

            {/* Hidden Native Range Input overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Comparison Slider"
              className="absolute inset-0 opacity-0 cursor-ew-resize z-40 w-full h-full"
            />

            {/* Quick Click-to-Zoom Button */}
            <button
              type="button"
              onClick={() => onImageClick && onImageClick(sliderPos > 50 ? primaryBefore : primaryAfter)}
              className="absolute bottom-4 left-4 z-40 font-mono text-[11px] px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-cyan-300 border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md"
            >
              <i className="fa-solid fa-magnifying-glass-plus" />
              <span>Inspect in Lightbox</span>
            </button>
          </div>

          <p className="text-center font-mono text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <i className="fa-solid fa-hand-pointer text-cyan-400" />
            <span>Drag slider left or right to inspect real-time visual architectural transformation</span>
          </p>
        </div>
      ) : (
        /* Mode 2: Side-by-Side */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Before Column */}
          <div className="space-y-4 p-5 rounded-2xl border border-red-500/30 bg-[#0D1525]">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-bold border border-red-500/40 flex items-center gap-1.5">
                <i className="fa-solid fa-xmark text-xs" />
                <span>BEFORE (Baseline Friction)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {beforeList.length} evidence artifact{beforeList.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {beforeList.map((url, i) => (
                <div
                  key={`before-${i}`}
                  onClick={() => onImageClick && onImageClick(url)}
                  className="rounded-xl overflow-hidden border border-white/15 bg-black/60 aspect-video cursor-zoom-in hover:border-red-400 transition-all group relative shadow-md"
                >
                  <img
                    src={url}
                    alt={`Before iteration ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-xs gap-1.5">
                    <i className="fa-solid fa-magnifying-glass-plus" />
                    <span>Click to Enlarge</span>
                  </div>
                </div>
              ))}
            </div>

            <ul className="text-xs text-slate-200 space-y-2 font-mono pt-1">
              <li className="flex items-start gap-2 text-red-200">
                <i className="fa-solid fa-xmark text-red-400 mt-0.5" />
                <span>Double-booking collisions under concurrent user tabs</span>
              </li>
              <li className="flex items-start gap-2 text-red-200">
                <i className="fa-solid fa-xmark text-red-400 mt-0.5" />
                <span>Full table scan searches with unindexed dynamic queries</span>
              </li>
              <li className="flex items-start gap-2 text-red-200">
                <i className="fa-solid fa-xmark text-red-400 mt-0.5" />
                <span>Unresponsive layout collapses on mobile viewport dimensions</span>
              </li>
            </ul>
          </div>

          {/* After Column */}
          <div className="space-y-4 p-5 rounded-2xl border border-emerald-500/30 bg-[#0A1A22]">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                <i className="fa-solid fa-check text-xs" />
                <span>AFTER (Production Standard)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {afterList.length} verified capture{afterList.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {afterList.map((url, i) => (
                <div
                  key={`after-${i}`}
                  onClick={() => onImageClick && onImageClick(url)}
                  className="rounded-xl overflow-hidden border border-white/15 bg-black/60 aspect-video cursor-zoom-in hover:border-emerald-400 transition-all group relative shadow-md"
                >
                  <img
                    src={url}
                    alt={`After iteration ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-xs gap-1.5">
                    <i className="fa-solid fa-magnifying-glass-plus" />
                    <span>Click to Enlarge</span>
                  </div>
                </div>
              ))}
            </div>

            <ul className="text-xs text-slate-200 space-y-2 font-mono pt-1">
              <li className="flex items-start gap-2 text-emerald-200">
                <i className="fa-solid fa-check text-emerald-400 mt-0.5" />
                <span>Atomic ACID replica session isolation eliminates collisions</span>
              </li>
              <li className="flex items-start gap-2 text-emerald-200">
                <i className="fa-solid fa-check text-emerald-400 mt-0.5" />
                <span>Sub-50ms indexed aggregation pipeline with multi-facet filters</span>
              </li>
              <li className="flex items-start gap-2 text-emerald-200">
                <i className="fa-solid fa-check text-emerald-400 mt-0.5" />
                <span>Liquid glassmorphic UI with 92+ Lighthouse score</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
