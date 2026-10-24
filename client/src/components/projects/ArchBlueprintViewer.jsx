import React, { useState } from 'react';
import { playTick } from '../../utils/audio';

const FALLBACK_ARCH_DIAGRAM =
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1400&auto=format&fit=crop';

export function ArchBlueprintViewer({
  diagramUrl,
  technologies = [],
  onExpandLightbox
}) {
  const [activeTier, setActiveTier] = useState('client'); // 'client' | 'gateway' | 'database'

  const effectiveDiagram = diagramUrl || FALLBACK_ARCH_DIAGRAM;
  const techList = Array.isArray(technologies) ? technologies : [];

  const clientTech = techList.filter(t => /react|tailwind|html|css|javascript|redux|gsap|ui/i.test(t)).join(', ') || 'React 18 · Tailwind CSS · GSAP Engine';
  const serverTech = techList.filter(t => /node|express|api|rest|jwt|auth|python/i.test(t)).join(', ') || 'Native Node.js HTTP Server · REST Router';
  const dbTech = techList.filter(t => /mongo|sql|redis|db|postgres|cloud/i.test(t)).join(', ') || 'MongoDB Atlas Replica Set · Cloudinary Media CDN';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/40 text-purple-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-purple-500/10">
            <i className="fa-solid fa-network-wired" />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-purple-400 font-bold block">
              05 · System Blueprint & Data Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-grotesk tracking-tight">
              System Architecture Diagram
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playTick();
            onExpandLightbox && onExpandLightbox(effectiveDiagram);
          }}
          className="font-mono text-xs px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 hover:bg-purple-500/30 transition-all flex items-center gap-2 font-bold shadow-sm"
        >
          <i className="fa-solid fa-expand" />
          <span>Expand Full Blueprint</span>
        </button>
      </div>

      {/* Blueprint Image Container */}
      <div
        onClick={() => {
          playTick();
          onExpandLightbox && onExpandLightbox(effectiveDiagram);
        }}
        className="arch-blueprint-frame cursor-zoom-in group max-h-[560px] flex items-center justify-center p-4 sm:p-6 transition-all hover:border-cyan-400/60 shadow-2xl relative"
      >
        <img
          src={effectiveDiagram}
          alt="System Architecture Diagram"
          className="w-full h-auto max-h-[480px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
        />

        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Multi-Tier Topology Specification</span>
        </div>

        <div className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-xs font-mono text-cyan-400 flex items-center gap-2 shadow-lg group-hover:border-cyan-400 transition-colors">
          <i className="fa-solid fa-magnifying-glass-plus" />
          <span>Click to Inspect Full Blueprint</span>
        </div>
      </div>

      {/* Interactive Architectural Tier Explorer */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-mono text-xs text-slate-400 uppercase tracking-wider font-bold">
            Interactive Architecture Tier Explorer:
          </span>
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                playTick();
                setActiveTier('client');
              }}
              className={`font-mono text-xs px-3 py-1 rounded-lg transition-all ${
                activeTier === 'client'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Client Tier
            </button>
            <button
              type="button"
              onClick={() => {
                playTick();
                setActiveTier('gateway');
              }}
              className={`font-mono text-xs px-3 py-1 rounded-lg transition-all ${
                activeTier === 'gateway'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. API Gateway
            </button>
            <button
              type="button"
              onClick={() => {
                playTick();
                setActiveTier('database');
              }}
              className={`font-mono text-xs px-3 py-1 rounded-lg transition-all ${
                activeTier === 'database'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Data Store
            </button>
          </div>
        </div>

        {/* Tier Details Card */}
        {activeTier === 'client' && (
          <div className="p-5 rounded-2xl bg-[#0B1528] border border-cyan-500/30 space-y-3 animate-in fade-in duration-200 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs text-cyan-400 font-bold flex items-center gap-2">
                <i className="fa-brands fa-react" /> Presentation & State Management Layer
              </span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                Stack: {clientTech}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              Engineered with React 18 single-page architecture featuring optimistic booking date selections, GSAP accelerated motion, and fluid CSS token design. Client queries are debounced to prevent unnecessary network payload dispatch.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#060913] border border-white/15 text-slate-200">
                <strong className="text-white block font-bold text-xs mb-0.5">Optimistic Locking:</strong>
                <span>Instant UI feedback before server confirmation</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060913] border border-white/15 text-slate-200">
                <strong className="text-white block font-bold text-xs mb-0.5">Asset Delivery:</strong>
                <span>Lazy loading & modern WebP compression</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060913] border border-white/15 text-slate-200">
                <strong className="text-white block font-bold text-xs mb-0.5">Accessibility:</strong>
                <span>Full ARIA landmarks & keyboard navigation</span>
              </div>
            </div>
          </div>
        )}

        {activeTier === 'gateway' && (
          <div className="p-5 rounded-2xl bg-[#130E26] border border-purple-500/30 space-y-3 animate-in fade-in duration-200 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs text-purple-400 font-bold flex items-center gap-2">
                <i className="fa-solid fa-server" /> API Gateway, Logic & Security Pipeline
              </span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                Stack: {serverTech}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              Deterministic micro-routing architecture with strict Content-Security-Policy headers, sliding memory rate limiters (protecting brute-force and scraping endpoints), and defensive payload sanitization preventing injection attacks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#060913] border border-white/15 text-slate-200">
                <strong className="text-white block font-bold text-xs mb-0.5">Rate Limiting:</strong>
                <span>Sliding-window memory rate limiter</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060913] border border-white/15 text-slate-200">
                <strong className="text-white block font-bold text-xs mb-0.5">Payload Guards:</strong>
                <span>Strict schema validation before persistence</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060913] border border-white/15 text-slate-200">
                <strong className="text-white block font-bold text-xs mb-0.5">Session Security:</strong>
                <span>HTTP-only tokens with CSRF verification</span>
              </div>
            </div>
          </div>
        )}

        {activeTier === 'database' && (
          <div className="p-5 rounded-2xl bg-[#0B1B1E] border border-emerald-500/30 space-y-3 animate-in fade-in duration-200 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-2">
                <i className="fa-solid fa-database" /> Data Persistence & ACID Isolation Tier
              </span>
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                Stack: {dbTech}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              Multi-indexed persistence layer enforcing atomic replica set transaction locks on reservation date ranges. High-speed aggregation pipelines calculate dynamic faceted search matches across price, geolocation, and amenities with zero table locks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#060913] border border-white/15 text-slate-200">
                <strong className="text-white block font-bold text-xs mb-0.5">ACID Isolation:</strong>
                <span>Atomic session locks eliminate double-bookings</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060913] border border-white/15 text-slate-200">
                <strong className="text-white block font-bold text-xs mb-0.5">Indexing:</strong>
                <span>Compound multi-key indexes for sub-50ms queries</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060913] border border-white/15 text-slate-200">
                <strong className="text-white block font-bold text-xs mb-0.5">Media Pipeline:</strong>
                <span>Cloud CDN transformation & caching</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
