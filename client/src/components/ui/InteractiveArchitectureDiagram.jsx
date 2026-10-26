import React, { useState } from 'react';
import { playTick } from '../../utils/audio';

const ARCHITECTURE_NODES = [
  {
    id: 'client',
    title: 'Client Tier & CDN',
    subtitle: 'React 19 / Next.js + Cloudflare Edge',
    icon: 'fa-desktop',
    tag: 'Frontend',
    color: '#00f0ff',
    bg: 'rgba(0, 240, 255, 0.1)',
    border: 'rgba(0, 240, 255, 0.4)',
    metrics: { latency: '< 15ms TTFB', throughput: 'Edge Cached', uptime: '99.99%' },
    tech: ['React 19', 'Tailwind CSS', 'Vite', 'Cloudflare CDN', 'Web Audio API'],
    description: 'Delivers instantaneous page transitions, optimistic UI updates, and client-side audio/canvas synthesis with zero cumulative layout shifts.',
    tradeoff: 'Client-side rendering enables rich 60FPS fluid physics at the cost of requiring initial asset hydration.'
  },
  {
    id: 'gateway',
    title: 'Reverse Proxy & WAF',
    subtitle: 'Nginx + DDoS Rate Limiting',
    icon: 'fa-shield-halved',
    tag: 'Security & Edge',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.1)',
    border: 'rgba(168, 85, 247, 0.4)',
    metrics: { latency: '< 2ms', throughput: '10,000+ RPS', uptime: '99.999%' },
    tech: ['Nginx Reverse Proxy', 'SSL TLS 1.3', 'IP Sliding Window', 'HMAC Signatures'],
    description: 'Enforces strict rate limiting (120 req/min per IP), HTTP Strict Transport Security, and terminates TLS certificates with zero backend CPU overhead.',
    tradeoff: 'Strict rate-limiting protects against layer-7 volumetric DDoS attacks while requiring sliding-window state tracking.'
  },
  {
    id: 'api',
    title: 'Express API Cluster',
    subtitle: 'Node.js Microservices Layer',
    icon: 'fa-server',
    tag: 'Core Backend',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.4)',
    metrics: { latency: '< 42ms P95', throughput: '2,400 RPS', uptime: '99.95%' },
    tech: ['Node.js', 'Express', 'JWT Auth', 'REST & GraphQL', 'Cluster Workers'],
    description: 'Handles domain workflows, transaction orchestration, schema validation, and routes requests to appropriate persistent or in-memory caches.',
    tradeoff: 'Stateless Node.js cluster allows linear horizontal autoscaling across multi-core container instances.'
  },
  {
    id: 'redis',
    title: 'In-Memory Cache Layer',
    subtitle: 'Redis v7.2-Cluster Engine',
    icon: 'fa-bolt',
    tag: 'Caching & State',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.4)',
    metrics: { latency: '< 1.4ms P99', hitRate: '84.6% Hits', uptime: '99.99%' },
    tech: ['Redis 7.2', 'Key-Value In-Memory', 'Pub/Sub Broker', 'TTL Invalidation'],
    description: 'Caches hot listing search queries, recruiter telemetry sessions, and distributed rate-limiting counters, slashing primary database load by >60%.',
    tradeoff: 'Accepts eventual consistency (bounded by 60-second TTL) for non-critical query views to guarantee sub-millisecond retrieval.'
  },
  {
    id: 'mongodb',
    title: 'Primary Database Shards',
    subtitle: 'MongoDB Atlas 3-Node Replica Set',
    icon: 'fa-database',
    tag: 'Persistence',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.4)',
    metrics: { latency: '< 18ms', dataVolume: 'Indexed B-Trees', uptime: '99.99%' },
    tech: ['MongoDB Atlas', 'Compound Indexes', 'ACID Transactions', 'Automated Failover'],
    description: 'Stores listings, user profiles, credentials, and case studies with compound B-tree indexing and secondary read replicas for high query parallelism.',
    tradeoff: 'Document data model affords rapid schema evolution while compound indexes are prioritized for read-heavy query patterns.'
  },
  {
    id: 'worker',
    title: 'Async Worker & Event Bus',
    subtitle: 'Background Telemetry & Processing',
    icon: 'fa-gears',
    tag: 'Async Pipeline',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.4)',
    metrics: { queueTime: '< 50ms', concurrency: '8 Jobs/Node', uptime: '99.9%' },
    tech: ['BullMQ / Worker Threads', 'Image Compression', 'Telemetry Logger', 'Cron Schedulers'],
    description: 'Processes asynchronous media uploads, telemetry aggregation, sitemap regeneration, and webhook notifications without blocking request threads.',
    tradeoff: 'Decouples heavy compute from the user-facing HTTP request lifecycle, ensuring deterministic response times.'
  }
];

export function InteractiveArchitectureDiagram({ className = '' }) {
  const [activeNodeId, setActiveNodeId] = useState('redis');
  const activeNode = ARCHITECTURE_NODES.find((n) => n.id === activeNodeId) || ARCHITECTURE_NODES[0];

  const handleSelectNode = (id) => {
    playTick('click');
    setActiveNodeId(id);
  };

  return (
    <div
      className={`relative rounded-2xl bg-[#070c14]/95 border border-cyan-500/20 p-5 sm:p-6 backdrop-blur-xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <i className="fa-solid fa-diagram-project text-xs" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              System Architecture & Microservices Topology
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                Interactive Graph
              </span>
            </h4>
            <p className="text-white/40 text-xs">Hover or click any node to inspect service roles, SLAs, and architectural tradeoffs.</p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-400/80 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 shrink-0 self-start sm:self-auto">
          Active: <strong className="text-white">{activeNode.title}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* Left: Architecture Flow Chart */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ARCHITECTURE_NODES.map((node, index) => {
              const isSelected = activeNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node.id)}
                  onMouseEnter={() => {
                    if (activeNodeId !== node.id) {
                      playTick('tick');
                      setActiveNodeId(node.id);
                    }
                  }}
                  className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-300 relative group overflow-hidden ${
                    isSelected
                      ? 'bg-[#0e1726] shadow-[0_0_25px_rgba(0,240,255,0.15)] scale-[1.02]'
                      : 'bg-[#0a0f18]/80 hover:bg-[#0c1320] border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    borderColor: isSelected ? node.color : undefined
                  }}
                >
                  {/* Subtle top indicator bar */}
                  {isSelected && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1 transition-all"
                      style={{ background: node.color }}
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: node.bg, color: node.color, border: `1px solid ${node.border}` }}
                    >
                      <i className={`fa-solid ${node.icon} text-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">{node.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-white/50">
                          {node.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 truncate font-mono mt-0.5">{node.subtitle}</p>
                    </div>
                  </div>

                  {/* Latency badge */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/50">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: node.color }} />
                      {node.metrics.latency || node.metrics.queueTime}
                    </span>
                    <span className="text-white/40">{node.metrics.uptime}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connection flow diagram hint */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-arrows-turn-to-dots text-cyan-400" />
              Request Pipeline: Client → WAF → Express API → Redis ⇄ MongoDB
            </span>
            <span className="hidden sm:inline text-emerald-400">P95 SLA: 42ms</span>
          </div>
        </div>

        {/* Right: Service Inspection Card */}
        <div
          className="lg:col-span-5 rounded-xl bg-[#090f1a] border p-5 backdrop-blur-xl relative overflow-hidden transition-all duration-300"
          style={{ borderColor: activeNode.color }}
        >
          {/* Top glow */}
          <div
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: activeNode.color }}
          />

          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: activeNode.bg, color: activeNode.color, border: `1px solid ${activeNode.border}` }}
            >
              <i className={`fa-solid ${activeNode.icon} text-base`} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">{activeNode.tag}</span>
              <h5 className="text-white font-bold text-sm">{activeNode.title}</h5>
            </div>
          </div>

          {/* SLA Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {Object.entries(activeNode.metrics).map(([k, v]) => (
              <div key={k} className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
                <div className="text-[10px] font-mono text-white/40 uppercase">{k}</div>
                <div className="text-xs font-bold font-mono text-white mt-0.5">{v}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mt-4">
            <div className="text-[11px] font-mono text-white/50 uppercase tracking-wide mb-1">Architecture Role</div>
            <p className="text-xs text-white/80 leading-relaxed">{activeNode.description}</p>
          </div>

          {/* Tradeoff Analysis */}
          <div className="mt-3.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="text-[10px] font-mono text-amber-400 font-semibold uppercase flex items-center gap-1.5 mb-1">
              <i className="fa-solid fa-scale-balanced" />
              Design Tradeoff
            </div>
            <p className="text-[11px] text-amber-200/80 leading-normal">{activeNode.tradeoff}</p>
          </div>

          {/* Technologies Chips */}
          <div className="mt-4">
            <div className="text-[11px] font-mono text-white/50 uppercase tracking-wide mb-1.5">Stack Components</div>
            <div className="flex flex-wrap gap-1.5">
              {activeNode.tech.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-white/80 border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
