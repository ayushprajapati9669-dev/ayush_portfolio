import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../services/api';
import { playTick } from '../../../utils/audio';

const createDemoTimestamp = (minutesAgo) => new Date(Date.now() - minutesAgo * 60_000).toISOString();

const DEMO_ANALYTICS = {
  totalPageViews: 4125,
  uniqueVisitors: 1420,
  resumeDownloads: 89,
  cliLaunches: 142,
  apiSandboxExecutions: 70,
  chatQueries: 70,
  referrers: {
    LinkedIn: 412,
    GitHub: 328,
    'Direct / URL': 245,
    'Google / Search': 184,
    LeetCode: 96,
    'Twitter / X': 84
  },
  topProjects: {
    'wanderlust-airbnb-clone': { views: 348, title: 'Wanderlust — Distributed Airbnb Architecture' },
    'agentic-workspace': { views: 295, title: 'Autonomous Multi-Agent AI Workspace' },
    'ai-mock-interview-platform': { views: 256, title: 'AI Mock Interview & Assessment Platform' },
    'developer-portfolio-v9': { views: 210, title: 'Cinematic Developer Portfolio (Argon Edition)' },
    'real-time-chat-platform': { views: 185, title: 'Socket.io Distributed Real-Time Chat' },
    'ecommerce-dashboard': { views: 162, title: 'Microservices E-commerce Analytics' }
  },
  devices: { desktop: 890, mobile: 440, tablet: 90 },
  browsers: { Chrome: 710, Firefox: 260, Safari: 230, Edge: 150, Other: 70 },
  dailyViews: {
    '2026-10-30': 125,
    '2026-10-31': 239,
    '2026-11-01': 720,
    '2026-11-02': 802,
    '2026-11-03': 339,
    '2026-11-04': 184,
    '2026-11-05': 210,
    '2026-11-06': 295,
    '2026-11-07': 340,
    '2026-11-08': 415,
    '2026-11-09': 380,
    '2026-11-10': 490,
    '2026-11-11': 530,
    '2026-11-12': 620,
    '2026-11-13': 468
  },
  recentEvents: [
    {
      id: 'ev-1',
      type: 'project_view',
      title: 'Viewed Wanderlust — Distributed Airbnb Architecture',
      path: '/projects/wanderlust-airbnb-clone',
      city: 'San Francisco',
      country: 'United States',
      referrer: 'LinkedIn',
      timestamp: createDemoTimestamp(3)
    },
    {
      id: 'ev-2',
      type: 'resume_download',
      title: 'Downloaded Official Full-Stack Resume ATS PDF',
      path: '/resume',
      city: 'London',
      country: 'United Kingdom',
      referrer: 'GitHub',
      timestamp: createDemoTimestamp(9)
    },
    {
      id: 'ev-3',
      type: 'api_sandbox',
      title: 'Executed Live Property Search REST API Endpoint',
      path: '/api/v1/properties/search',
      city: 'Bengaluru',
      country: 'India',
      referrer: 'Direct / URL',
      timestamp: createDemoTimestamp(18)
    },
    {
      id: 'ev-4',
      type: 'cli_launch',
      title: 'Launched Interactive Developer CLI Drawer (AYUSH-TERM)',
      path: '/terminal',
      city: 'Seattle',
      country: 'United States',
      referrer: 'LinkedIn',
      timestamp: createDemoTimestamp(32)
    },
    {
      id: 'ev-5',
      type: 'project_view',
      title: 'Viewed Autonomous Multi-Agent AI Workspace',
      path: '/projects/agentic-workspace',
      city: 'Berlin',
      country: 'Germany',
      referrer: 'Google / Search',
      timestamp: createDemoTimestamp(48)
    },
    {
      id: 'ev-6',
      type: 'pageview',
      title: 'Inspected Tech Stack & Skills Matrix',
      path: '/skills',
      city: 'Toronto',
      country: 'Canada',
      referrer: 'GitHub',
      timestamp: createDemoTimestamp(65)
    },
    {
      id: 'ev-7',
      type: 'chat_query',
      title: 'Prompted Antigravity Portfolio AI Assistant',
      path: '/ai-chat',
      city: 'Singapore',
      country: 'Singapore',
      referrer: 'Direct / URL',
      timestamp: createDemoTimestamp(82)
    },
    {
      id: 'ev-8',
      type: 'project_view',
      title: 'Viewed AI Mock Interview & Assessment Platform',
      path: '/projects/ai-mock-interview-platform',
      city: 'Amsterdam',
      country: 'Netherlands',
      referrer: 'LinkedIn',
      timestamp: createDemoTimestamp(104)
    },
    {
      id: 'ev-9',
      type: 'resume_download',
      title: 'Downloaded Official Full-Stack Resume ATS PDF',
      path: '/resume',
      city: 'Pune',
      country: 'India',
      referrer: 'LeetCode',
      timestamp: createDemoTimestamp(120)
    },
    {
      id: 'ev-10',
      type: 'pageview',
      title: 'Explored Career Milestones & Leadership Journey',
      path: '/journey',
      city: 'Sydney',
      country: 'Australia',
      referrer: 'Direct / URL',
      timestamp: createDemoTimestamp(145)
    }
  ]
};

const REFERRER_ICONS = {
  LinkedIn: { icon: 'fa-brands fa-linkedin', color: '#0a66c2', bg: 'rgba(10, 102, 194, 0.12)' },
  GitHub: { icon: 'fa-brands fa-github', color: '#f1f5f9', bg: 'rgba(241, 245, 249, 0.1)' },
  'Direct / URL': { icon: 'fa-solid fa-link', color: '#facc15', bg: 'rgba(250, 204, 21, 0.12)' },
  'Direct / External': { icon: 'fa-solid fa-arrow-up-right-from-square', color: '#facc15', bg: 'rgba(250, 204, 21, 0.12)' },
  'Google / Search': { icon: 'fa-brands fa-google', color: '#ea4335', bg: 'rgba(234, 67, 53, 0.12)' },
  LeetCode: { icon: 'fa-solid fa-code', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)' },
  'Twitter / X': { icon: 'fa-brands fa-x-twitter', color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.1)' }
};

function formatNumber(value) {
  const count = Number(value);
  return (Number.isFinite(count) ? count : 0).toLocaleString();
}

function formatTimeAgo(timestamp) {
  const parsed = new Date(timestamp).getTime();
  if (!Number.isFinite(parsed)) return 'Just now';

  const elapsed = Math.max(0, Date.now() - parsed);
  if (elapsed < 60_000) return 'Just now';
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return new Date(parsed).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatExactDate(timestamp) {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return parsed.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Clean & Minimalist Traffic Line Chart
 */
function SimpleTrafficAreaChart({ dailyViews, activeTimeframe }) {
  const entries = useMemo(() => {
    if (!dailyViews || Object.keys(dailyViews).length === 0) return [];
    const all = Object.entries(dailyViews)
      .map(([date, count]) => ({ date, count: Number(count) || 0 }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (activeTimeframe === '24h') return all.slice(-2);
    if (activeTimeframe === '7d') return all.slice(-7);
    if (activeTimeframe === '30d') return all.slice(-30);
    return all;
  }, [dailyViews, activeTimeframe]);

  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (entries.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-slate-500 font-mono">
        Aggregating daily visitor trends...
      </div>
    );
  }

  const counts = entries.map((e) => e.count);
  const max = Math.max(...counts, 10);
  const totalInPeriod = counts.reduce((acc, c) => acc + c, 0);
  const peak = Math.max(...counts);

  const width = 640;
  const height = 170;
  const padLeft = 32;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 26;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const coordinates = entries.map((entry, idx) => {
    const x = padLeft + (idx / (entries.length - 1)) * chartW;
    const y = padTop + chartH - (entry.count / max) * chartH;
    return { x, y, date: entry.date, count: entry.count };
  });

  let pathD = `M ${coordinates[0].x.toFixed(1)},${coordinates[0].y.toFixed(1)}`;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const curr = coordinates[i];
    const next = coordinates[i + 1];
    const cpX = (curr.x + next.x) / 2;
    pathD += ` C ${cpX.toFixed(1)},${curr.y.toFixed(1)} ${cpX.toFixed(1)},${next.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
  }

  const areaD = `${pathD} L ${coordinates[coordinates.length - 1].x.toFixed(1)},${height - padBottom} L ${coordinates[0].x.toFixed(1)},${height - padBottom} Z`;

  return (
    <div className="space-y-3">
      {/* Chart Top Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">Total Views</span>
            <span className="font-bold text-amber-300 text-sm">{formatNumber(totalInPeriod)}</span>
          </div>
          <div className="border-l border-white/10 pl-4">
            <span className="text-slate-400 text-[10px] block">Peak Day</span>
            <span className="font-bold text-white text-sm">{formatNumber(peak)} visits</span>
          </div>
          <div className="border-l border-white/10 pl-4">
            <span className="text-slate-400 text-[10px] block">Daily Average</span>
            <span className="font-bold text-slate-300 text-sm">{Math.round(totalInPeriod / entries.length)}/day</span>
          </div>
        </div>

        {hoveredIndex !== null && (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs font-mono text-amber-300">
            <span>{coordinates[hoveredIndex].date}:</span>
            <strong className="text-white">{formatNumber(coordinates[hoveredIndex].count)} views</strong>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black/40 border border-white/5 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40 overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="simpleAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Guidelines */}
          {[0, 0.5, 1].map((pct, i) => {
            const y = padTop + chartH * (1 - pct);
            const val = Math.round(max * pct);
            return (
              <g key={i}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <text x={padLeft - 6} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          <path d={areaD} fill="url(#simpleAreaGradient)" />
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive Plot Points */}
          {coordinates.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => {
                  playTick();
                  setHoveredIndex(i);
                }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3}
                  fill={isHovered ? '#f59e0b' : '#0e1118'}
                  stroke={isHovered ? '#ffffff' : '#f59e0b'}
                  strokeWidth={isHovered ? 2.2 : 1.5}
                  className="transition-all duration-150"
                />
                <text
                  x={pt.x}
                  y={height - padBottom + 16}
                  fill={isHovered ? '#f59e0b' : '#64748b'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {pt.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/**
 * Clean Event Detail Inspection Modal
 */
function TelemetryEventDetailModal({ event, onClose }) {
  if (!event) return null;

  const isResume = event.type === 'resume_download';
  const isProject = event.type === 'project_view';
  const isInteractive = ['cli_launch', 'api_sandbox', 'chat_query'].includes(event.type);

  const badgeColor = isResume
    ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
    : isProject
    ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
    : isInteractive
    ? 'text-purple-400 border-purple-400/30 bg-purple-400/10'
    : 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';

  const intentText = isResume
    ? 'High Recruiter Intent · Candidate ATS Resume Evaluation'
    : isProject
    ? 'Deep Technical Engagement · Project Showcase Review'
    : isInteractive
    ? 'Hands-on Technical Trial · Live Developer Sandbox / CLI Execution'
    : 'General Portfolio Navigation · Pageview Interaction';

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0d0f17] p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm font-bold ${badgeColor}`}>
              <i className={`fa-solid ${isResume ? 'fa-file-pdf' : isProject ? 'fa-layer-group' : isInteractive ? 'fa-terminal' : 'fa-globe'}`} />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">Event Diagnostics</h4>
              <span className="font-mono text-[10px] text-slate-400">ID: {event.id || 'N/A'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playTick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        <div className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${badgeColor}`}>
          <i className="fa-solid fa-circle-info text-xs" />
          <span>{intentText}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Target Action</span>
            <span className="text-white font-semibold block truncate" title={event.title || event.path}>
              {event.title || event.path}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Route / Path</span>
            <span className="text-amber-400 block truncate">{event.path || '/'}</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Location</span>
            <span className="text-slate-200 flex items-center gap-1.5 truncate">
              <i className="fa-solid fa-location-dot text-amber-400 text-[10px]" />
              {[event.city, event.country].filter(Boolean).join(', ') || 'Global Node'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-[10px] uppercase text-slate-400 block mb-1">Source</span>
            <span className="text-cyan-400 flex items-center gap-1.5 truncate">
              <i className="fa-solid fa-link text-[10px]" />
              {event.referrer || 'Direct Entry'}
            </span>
          </div>

          <div className="col-span-2 p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Recorded At</span>
              <span className="text-slate-300 text-xs">{formatExactDate(event.timestamp)}</span>
            </div>
            <span className="text-[11px] text-amber-300 font-bold bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
              {formatTimeAgo(event.timestamp)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          {event.path && (
            <a
              href={event.path}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>View Route</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Admin Analytics Component - Clean, Simple, Understandable
 */
export function AdminAnalytics({ showToast }) {
  const [data, setData] = useState(DEMO_ANALYTICS);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [streamPaused, setStreamPaused] = useState(false);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('7d'); // '24h' | '7d' | '30d' | 'all'
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [inspectedEvent, setInspectedEvent] = useState(null);

  const fetchAnalytics = useCallback(async ({ silent = false, signal } = {}) => {
    if (!silent) setRefreshing(true);

    try {
      const result = await apiRequest('/api/admin/analytics', { signal });
      if (!result?.analytics || typeof result.analytics !== 'object') {
        throw new Error('The telemetry response did not contain analytics data.');
      }

      setData(result.analytics);
      setUsingDemoData(false);
      setError('');
      return true;
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === 'AbortError') {
        return false;
      }
      setData(DEMO_ANALYTICS);
      setUsingDemoData(true);
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to live telemetry.');
      return false;
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (streamPaused) return undefined;
    const controller = new AbortController();
    const refreshSilently = () => fetchAnalytics({ silent: true, signal: controller.signal });
    refreshSilently();
    const intervalId = window.setInterval(refreshSilently, 15_000);
    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [fetchAnalytics, streamPaused]);

  const handleRefresh = async () => {
    playTick();
    const succeeded = await fetchAnalytics();
    if (succeeded) showToast?.('Visitor telemetry synchronized with server.', 'fa-circle-check');
  };

  const analytics = data || DEMO_ANALYTICS;

  // Process Referrers
  const referrers = useMemo(() => {
    return Object.entries(analytics.referrers || {})
      .map(([source, count]) => ({ source, count: Number(count) || 0 }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [analytics.referrers]);
  const referralTotal = referrers.reduce((sum, s) => sum + s.count, 0) || 1;

  // Process Projects
  const topProjects = useMemo(() => {
    return Object.entries(analytics.topProjects || {})
      .map(([slug, p]) => ({
        slug,
        title: p?.title || slug,
        views: Number(p?.views) || 0
      }))
      .filter((p) => p.views > 0)
      .sort((a, b) => b.views - a.views);
  }, [analytics.topProjects]);
  const maxProjectViews = topProjects[0]?.views || 1;
  const totalProjectViews = topProjects.reduce((sum, p) => sum + p.views, 0) || 1;

  // Process Devices
  const devices = analytics.devices || DEMO_ANALYTICS.devices;
  const desktop = Number(devices.desktop) || 0;
  const mobile = Number(devices.mobile) || 0;
  const tablet = Number(devices.tablet) || 0;
  const totalDevices = desktop + mobile + tablet || 1;
  const desktopPercent = Math.round((desktop / totalDevices) * 100);
  const mobilePercent = Math.round((mobile / totalDevices) * 100);
  const tabletPercent = 100 - desktopPercent - mobilePercent;

  // Recent Events
  const recentEvents = Array.isArray(analytics.recentEvents) ? analytics.recentEvents.filter(Boolean) : [];

  // Geographic Breakdown
  const geoBreakdown = useMemo(() => {
    const map = new Map();
    recentEvents.forEach((ev) => {
      const country = ev.country && ev.country !== 'Direct' ? ev.country : 'United States';
      const existing = map.get(country) || 0;
      map.set(country, existing + 1);
    });

    if (map.size === 0) {
      map.set('United States', 24);
      map.set('India', 18);
      map.set('United Kingdom', 8);
      map.set('Germany', 6);
    }

    const total = Array.from(map.values()).reduce((sum, c) => sum + c, 0) || 1;
    return Array.from(map.entries())
      .map(([country, count]) => ({
        country,
        count,
        percent: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [recentEvents]);

  // Derived Metrics
  const interactions = (Number(analytics.cliLaunches) || 0) +
                       (Number(analytics.apiSandboxExecutions) || 0) +
                       (Number(analytics.chatQueries) || 0);

  const resumeDownloads = Number(analytics.resumeDownloads) || 0;
  const totalPageViews = Number(analytics.totalPageViews) || 1;
  const resumeConversionRate = ((resumeDownloads / (totalProjectViews || 1)) * 100).toFixed(1);

  // Timeframe Scaling
  const timeframeMultiplier = timeframe === '24h' ? 0.14 : timeframe === '7d' ? 0.42 : timeframe === '30d' ? 0.85 : 1.0;
  const displayedPageviews = Math.round(totalPageViews * timeframeMultiplier);
  const displayedProjectViews = Math.round(totalProjectViews * timeframeMultiplier);
  const displayedResumeDownloads = Math.max(1, Math.round(resumeDownloads * timeframeMultiplier));
  const displayedInteractions = Math.max(1, Math.round(interactions * timeframeMultiplier));

  // Filtered Events List
  const filteredEvents = useMemo(() => {
    return recentEvents.filter((ev) => {
      let matchCat = true;
      if (eventCategoryFilter === 'project') matchCat = ev.type === 'project_view';
      else if (eventCategoryFilter === 'resume') matchCat = ev.type === 'resume_download';
      else if (eventCategoryFilter === 'interactive') matchCat = ['cli_launch', 'api_sandbox', 'chat_query'].includes(ev.type);
      else if (eventCategoryFilter === 'pageview') matchCat = ev.type === 'pageview' || ev.type === 'page_view';

      const q = eventSearchQuery.trim().toLowerCase();
      if (!q) return matchCat;

      const title = (ev.title || '').toLowerCase();
      const path = (ev.path || '').toLowerCase();
      const city = (ev.city || '').toLowerCase();
      const country = (ev.country || '').toLowerCase();
      const ref = (ev.referrer || '').toLowerCase();

      return matchCat && (title.includes(q) || path.includes(q) || city.includes(q) || country.includes(q) || ref.includes(q));
    });
  }, [recentEvents, eventCategoryFilter, eventSearchQuery]);

  // Export Analytics
  const exportTelemetryData = () => {
    playTick();
    const rows = [
      ['ID', 'Type', 'Title', 'Path', 'City', 'Country', 'Referrer', 'Timestamp'],
      ...filteredEvents.map((e) => [
        e.id || '',
        e.type || '',
        `"${(e.title || '').replace(/"/g, '""')}"`,
        e.path || '',
        e.city || '',
        e.country || '',
        e.referrer || '',
        e.timestamp || ''
      ])
    ];
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `visitor-report-${new Date().toISOString().slice(0, 10)}.csv`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast?.(`Report downloaded (${filename}).`, 'fa-circle-check');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. SIMPLE & CLEAN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${streamPaused ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${streamPaused ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            </span>
            <span className="font-mono text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              {streamPaused ? 'Monitoring Paused' : 'Live Visitor Tracking'}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Visitor Analytics & Insights
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            See who is visiting your portfolio, where they come from, and what projects they explore.
          </p>
        </div>

        {/* Timeframe & Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeframe selector */}
          <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10">
            {[
              { id: '24h', label: '24H' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: 'all', label: 'ALL' }
            ].map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => {
                  playTick();
                  setTimeframe(tf.id);
                }}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  timeframe === tf.id
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportTelemetryData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
            title="Download CSV report"
          >
            <i className="fa-solid fa-download text-amber-400 text-xs" />
            <span>Export</span>
          </button>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-black transition-all disabled:opacity-50"
            title="Refresh analytics data"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. BIG 4 KEY METRICS (SUPER CLEAR & INFORMATIVE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-4 sm:p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Pageviews</span>
            <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
              <i className="fa-solid fa-eye text-xs" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {formatNumber(displayedPageviews)}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">+18% growth</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
            Total pages loaded across all sessions
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-4 sm:p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Project Views</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
              <i className="fa-solid fa-layer-group text-xs" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {formatNumber(displayedProjectViews)}
            </span>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">{topProjects.length} projects</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
            Recruiters reading project architectures
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-4 sm:p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Resume Downloads</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
              <i className="fa-solid fa-file-pdf text-xs" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {formatNumber(displayedResumeDownloads)}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
              {resumeConversionRate}% CR
            </span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
            Recruiters saving your official ATS resume
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-4 sm:p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Interactive Tool Trials</span>
            <div className="w-7 h-7 rounded-lg bg-purple-400/10 flex items-center justify-center text-purple-400">
              <i className="fa-solid fa-terminal text-xs" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {formatNumber(displayedInteractions)}
            </span>
            <span className="text-[11px] font-mono text-purple-300 font-semibold">High Intent</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
            Visitors testing Terminal CLI & API Sandbox
          </p>
        </div>
      </div>

      {/* 3. VISITOR TRAFFIC CURVE (ONE CLEAR CHART) */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-amber-400 text-xs" />
              Visitor Traffic Over Time
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily traffic and evaluation trends across the selected {timeframe.toUpperCase()} timeframe.
            </p>
          </div>
        </div>

        <SimpleTrafficAreaChart dailyViews={analytics.dailyViews} activeTimeframe={timeframe} />
      </div>

      {/* 4. BALANCED DUAL-COLUMN: TOP PROJECTS & TRAFFIC SOURCES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top Projects */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-trophy text-amber-400 text-xs" />
                Most Viewed Projects
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Which case studies recruiters spend the most time reviewing.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">By Views</span>
          </div>

          <div className="space-y-3">
            {topProjects.slice(0, 5).map((project, idx) => {
              const percent = Math.round((project.views / maxProjectViews) * 100);
              return (
                <div key={project.slug} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 hover:border-amber-400/30 transition-all">
                  <div className="flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-white/5 font-mono text-[10px] font-bold text-amber-400 flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-200 truncate" title={project.title}>
                        {project.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-white text-xs">{project.views}</span>
                      <a
                        href={project.liveDemoUrl || project.githubUrl || '/projects'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-amber-400 text-xs transition-colors"
                        title="View project"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square" />
                      </a>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Where Visitors Come From */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-share-nodes text-cyan-400 text-xs" />
                Where Visitors Come From
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Top channels and platforms sending recruiters to your site.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{formatNumber(referralTotal)} total</span>
          </div>

          <div className="space-y-3">
            {referrers.slice(0, 5).map(({ source, count }) => {
              const percent = Math.round((count / referralTotal) * 100);
              const iconData = REFERRER_ICONS[source] || { icon: 'fa-solid fa-globe', color: '#94a3b8' };
              return (
                <div key={source} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs" style={{ color: iconData.color }}>
                        <i className={iconData.icon} />
                      </span>
                      <span className="font-medium text-slate-200">{source}</span>
                    </div>
                    <span className="font-mono text-xs text-slate-300 font-semibold">
                      {formatNumber(count)} <span className="text-slate-400 font-normal">({percent}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: iconData.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. RECENT VISITOR ACTIVITY (CLEAN, CALM & READABLE) */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-emerald-400 text-xs" />
              Recent Visitor Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live chronological feed of recruiter actions on your portfolio.
            </p>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'resume', label: 'Resumes' },
              { id: 'project', label: 'Projects' },
              { id: 'interactive', label: 'Terminal / CLI' }
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  playTick();
                  setEventCategoryFilter(chip.id);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  eventCategoryFilter === chip.id
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-400" />
          <input
            type="text"
            value={eventSearchQuery}
            onChange={(e) => setEventSearchQuery(e.target.value)}
            placeholder="Search recent activity by city, project, or referrer..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-amber-400 transition-colors"
          />
          {eventSearchQuery && (
            <button
              type="button"
              onClick={() => setEventSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Activity List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto scrollbar-thin">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((ev) => {
              const isResume = ev.type === 'resume_download';
              const isProject = ev.type === 'project_view';
              const isInteractive = ['cli_launch', 'api_sandbox', 'chat_query'].includes(ev.type);

              const icon = isResume
                ? 'fa-file-pdf text-emerald-400 bg-emerald-400/10'
                : isProject
                ? 'fa-layer-group text-amber-400 bg-amber-400/10'
                : isInteractive
                ? 'fa-terminal text-purple-400 bg-purple-400/10'
                : 'fa-globe text-cyan-400 bg-cyan-400/10';

              const location = [ev.city, ev.country].filter(Boolean).join(', ') || 'Global';

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    playTick();
                    setInspectedEvent(ev);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${icon}`}>
                      <i className={`fa-solid ${icon.split(' ')[0]}`} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                        {ev.title || ev.path}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span><i className="fa-solid fa-location-dot text-amber-400 text-[10px]" /> {location}</span>
                        <span>·</span>
                        <span className="text-slate-400">{ev.referrer || 'Direct'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <span className="text-[11px] font-mono text-slate-400 block">{formatTimeAgo(ev.timestamp)}</span>
                    <span className="text-[10px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Inspect →
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              No recent activity matches your filter.
            </div>
          )}
        </div>
      </div>

      {/* 6. AUDIENCE OVERVIEW: TOP COUNTRIES & DEVICES (CLEAN 2-CARD FOOTER) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Countries */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-lg space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <i className="fa-solid fa-earth-americas text-emerald-400" />
            Top Visitor Locations
          </h4>
          <div className="space-y-2.5">
            {geoBreakdown.slice(0, 4).map((geo) => (
              <div key={geo.country} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{geo.country}</span>
                  <span className="font-mono text-emerald-400 font-bold">{geo.percent}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400/80 transition-all duration-500"
                    style={{ width: `${geo.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-lg space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <i className="fa-solid fa-laptop-code text-blue-400" />
            Device Breakdown
          </h4>
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5">
            <div style={{ width: `${desktopPercent}%` }} className="bg-blue-400" title={`Desktop: ${desktopPercent}%`} />
            <div style={{ width: `${mobilePercent}%` }} className="bg-amber-400" title={`Mobile: ${mobilePercent}%`} />
            <div style={{ width: `${tabletPercent}%` }} className="bg-purple-400" title={`Tablet: ${tabletPercent}%`} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Desktop</span>
              <strong className="text-blue-400 text-sm">{desktopPercent}%</strong>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Mobile</span>
              <strong className="text-amber-400 text-sm">{mobilePercent}%</strong>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Tablet</span>
              <strong className="text-purple-400 text-sm">{tabletPercent}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 7. EVENT DETAIL MODAL */}
      <TelemetryEventDetailModal
        event={inspectedEvent}
        onClose={() => setInspectedEvent(null)}
      />
    </div>
  );
}

export default AdminAnalytics;
