import React from 'react';

export function RetornoHardwareMetrics() {
  const metrics = [
    { label: 'Full-Stack Systems Shipped', value: '12+', detail: 'Production web apps & micro-tools' },
    { label: 'Academic CGPA', value: '8.42', detail: 'CSE · SISTec, Bhopal (Batch 2026)' },
    { label: 'System Uptime & Reliability', value: '99.9%', detail: 'Resilient cloud deployments' },
    { label: 'Client & Team Satisfaction', value: '100%', detail: 'Clean code & honest execution' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sleek Hardware Console Rack Unit (SFF-011) */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#09090c] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Hardware Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-500">
              SYS-UNIT // SFF-011
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </div>
          </div>

          {/* LED Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              <span>CORE I/O</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              <span>STABILITY</span>
            </div>
          </div>
        </div>

        {/* 4-Column Metric Counter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
          {metrics.map((m, i) => (
            <div key={i} className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                {m.label}
              </div>
              <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                {m.value}
              </div>
              <div className="text-xs text-zinc-400 pt-0.5">
                {m.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

