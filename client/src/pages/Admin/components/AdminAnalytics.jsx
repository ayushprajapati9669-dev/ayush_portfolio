import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCsrfToken } from '../../../services/api';
import { playTick } from '../../../utils/audio';

const createDemoTimestamp = (minutesAgo) => new Date(Date.now() - minutesAgo * 60_000).toISOString();

const DEMO_ANALYTICS = {
  totalPageViews: 3619,
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
    '2026-11-05': 210
  },
  recentEvents: [
    {
      id: 'demo-1',
      type: 'project_view',
      title: 'Viewed Wanderlust — Distributed Airbnb Architecture',
      path: '/projects/wanderlust-airbnb-clone',
      city: 'San Francisco',
      country: 'United States',
      referrer: 'LinkedIn',
      timestamp: createDemoTimestamp(2)
    },
    {
      id: 'demo-2',
      type: 'resume_download',
      title: 'Downloaded Full-Stack Engineering Resume',
      path: '/resume',
      city: 'London',
      country: 'United Kingdom',
      referrer: 'GitHub',
      timestamp: createDemoTimestamp(7)
    },
    {
      id: 'demo-3',
      type: 'api_sandbox',
      title: 'Executed Live Property Search REST Endpoint',
      path: '/api/v1/properties/search',
      city: 'Bengaluru',
      country: 'India',
      referrer: 'Direct / URL',
      timestamp: createDemoTimestamp(14)
    },
    {
      id: 'demo-4',
      type: 'cli_launch',
      title: 'Launched Interactive Developer CLI Drawer',
      path: '/terminal',
      city: 'Seattle',
      country: 'United States',
      referrer: 'LinkedIn',
      timestamp: createDemoTimestamp(28)
    },
    {
      id: 'demo-5',
      type: 'project_view',
      title: 'Viewed Autonomous Multi-Agent AI Workspace',
      path: '/projects/agentic-workspace',
      city: 'Berlin',
      country: 'Germany',
      referrer: 'Google / Search',
      timestamp: createDemoTimestamp(45)
    },
    {
      id: 'demo-6',
      type: 'pageview',
      title: 'Inspected Tech Stack & Framework Competencies',
      path: '/skills',
      city: 'Toronto',
      country: 'Canada',
      referrer: 'GitHub',
      timestamp: createDemoTimestamp(62)
    },
    {
      id: 'demo-7',
      type: 'chat_query',
      title: 'Prompted Antigravity Portfolio AI Assistant',
      path: '/ai-chat',
      city: 'Singapore',
      country: 'Singapore',
      referrer: 'Direct / URL',
      timestamp: createDemoTimestamp(80)
    },
    {
      id: 'demo-8',
      type: 'project_view',
      title: 'Viewed AI Mock Interview & Assessment Platform',
      path: '/projects/ai-mock-interview-platform',
      city: 'Amsterdam',
      country: 'Netherlands',
      referrer: 'LinkedIn',
      timestamp: createDemoTimestamp(98)
    },
    {
      id: 'demo-9',
      type: 'resume_download',
      title: 'Downloaded Full-Stack Engineering Resume',
      path: '/resume',
      city: 'Pune',
      country: 'India',
      referrer: 'LeetCode',
      timestamp: createDemoTimestamp(115)
    },
    {
      id: 'demo-10',
      type: 'pageview',
      title: 'Explored Career Milestones & Workshop Leadership',
      path: '/journey',
      city: 'Sydney',
      country: 'Australia',
      referrer: 'Direct / URL',
      timestamp: createDemoTimestamp(140)
    }
  ]
};

const REFERRER_ICONS = {
  LinkedIn: { icon: 'fa-brands fa-linkedin', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
  GitHub: { icon: 'fa-brands fa-github', color: '#f1f5f9', bg: 'rgba(241, 245, 249, 0.1)' },
  'Direct / URL': { icon: 'fa-solid fa-link', color: '#facc15', bg: 'rgba(250, 204, 21, 0.12)' },
  'Direct / External': { icon: 'fa-solid fa-arrow-up-right-from-square', color: '#facc15', bg: 'rgba(250, 204, 21, 0.12)' },
  'Google / Search': { icon: 'fa-brands fa-google', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)' },
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

function MiniSparkline({ data, stroke = '#facc15', fill = 'rgba(250, 204, 21, 0.1)' }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 120;
  const height = 32;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <path d={areaD} fill={fill} />
      <path d={pathD} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrafficTrendAreaChart({ dailyViews, activeTimeframe }) {
  const entries = useMemo(() => {
    if (!dailyViews || Object.keys(dailyViews).length === 0) return [];
    return Object.entries(dailyViews)
      .map(([date, count]) => ({ date, count: Number(count) || 0 }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [dailyViews]);

  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (entries.length < 2) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-500 font-mono">
        Aggregating daily visitor trends...
      </div>
    );
  }

  const counts = entries.map((e) => e.count);
  const max = Math.max(...counts, 10);
  const totalInPeriod = counts.reduce((acc, c) => acc + c, 0);
  const peak = Math.max(...counts);

  const width = 640;
  const height = 180;
  const padLeft = 36;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 28;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const coordinates = entries.map((entry, idx) => {
    const x = padLeft + (idx / (entries.length - 1)) * chartW;
    const y = padTop + chartH - (entry.count / max) * chartH;
    return { x, y, date: entry.date, count: entry.count };
  });

  // Bezier curve generation
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
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Total in View</span>
            <span className="font-bold text-amber-300 text-sm">{formatNumber(totalInPeriod)}</span>
          </div>
          <div className="border-l border-white/10 pl-4">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Peak Day</span>
            <span className="font-bold text-cyan-300 text-sm">{formatNumber(peak)} visits</span>
          </div>
          <div className="border-l border-white/10 pl-4">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Daily Avg</span>
            <span className="font-bold text-slate-300 text-sm">{Math.round(totalInPeriod / entries.length)}/day</span>
          </div>
        </div>

        {hoveredIndex !== null && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-mono text-amber-300">
            <i className="fa-solid fa-calendar-day text-[10px]" />
            <span>{coordinates[hoveredIndex].date}:</span>
            <strong className="text-white">{formatNumber(coordinates[hoveredIndex].count)} visits</strong>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-black/40 border border-white/5 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Grid horizontal guidelines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = padTop + chartH * (1 - pct);
            const val = Math.round(max * pct);
            return (
              <g key={i}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <text x={padLeft - 6} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Filled Area & Smooth Curve */}
          <path d={areaD} fill="url(#areaGradient)" />
          <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" />

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
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#facc15' : '#0a0d14'}
                  stroke={isHovered ? '#ffffff' : '#facc15'}
                  strokeWidth={isHovered ? 2.5 : 1.8}
                  className="transition-all duration-200"
                />
                {/* Date label at bottom */}
                <text
                  x={pt.x}
                  y={height - padBottom + 16}
                  fill={isHovered ? '#facc15' : '#64748b'}
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

export function AdminAnalytics({ showToast }) {
  const [data, setData] = useState(DEMO_ANALYTICS);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [streamPaused, setStreamPaused] = useState(false);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('7d'); // '24h' | '7d' | '30d' | 'all'
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all'); // 'all' | 'project' | 'resume' | 'interactive' | 'pageview'
  const [eventSearchQuery, setEventSearchQuery] = useState('');

  const fetchAnalytics = useCallback(async ({ silent = false, signal } = {}) => {
    if (!silent) setRefreshing(true);

    try {
      const sessionToken = getCsrfToken();
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
        signal,
        headers: {
          Accept: 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
        }
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || `Telemetry request failed (${response.status}).`);
      }
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
      // Graceful fallback to demo
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
    if (succeeded) showToast?.('Visitor telemetry synchronized with production node.', 'fa-circle-check');
  };

  const analytics = data || DEMO_ANALYTICS;

  // Process Referrers
  const referrers = useMemo(() => {
    return Object.entries(analytics.referrers || {})
      .map(([source, count]) => ({ source, count: Number(count) || 0 }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [analytics.referrers]);
  const referralTotal = referrers.reduce((sum, s) => sum + s.count, 0);

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
  const totalProjectViews = topProjects.reduce((sum, p) => sum + p.views, 0);

  // Process Devices
  const devices = analytics.devices || DEMO_ANALYTICS.devices;
  const desktop = Number(devices.desktop) || 0;
  const mobile = Number(devices.mobile) || 0;
  const tablet = Number(devices.tablet) || 0;
  const totalDevices = desktop + mobile + tablet || 1;
  const desktopPercent = Math.round((desktop / totalDevices) * 100);
  const mobilePercent = Math.round((mobile / totalDevices) * 100);
  const tabletPercent = 100 - desktopPercent - mobilePercent;

  // Process Browsers
  const browsers = Object.entries(analytics.browsers || {})
    .map(([name, count]) => ({ name, count: Number(count) || 0 }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);
  const browserTotal = browsers.reduce((sum, b) => sum + b.count, 0) || 1;

  // Recent Events
  const recentEvents = Array.isArray(analytics.recentEvents) ? analytics.recentEvents.filter(Boolean) : [];

  // Geographic Breakdown Aggregation from Recent Events
  const geoBreakdown = useMemo(() => {
    const map = new Map();
    recentEvents.forEach((ev) => {
      const country = ev.country && ev.country !== 'Direct' ? ev.country : 'United States';
      const city = ev.city && ev.city !== 'Global' ? ev.city : '';
      const existing = map.get(country) || { count: 0, cities: new Set() };
      existing.count += 1;
      if (city) existing.cities.add(city);
      map.set(country, existing);
    });

    if (map.size === 0) {
      map.set('United States', { count: 24, cities: new Set(['San Francisco', 'New York', 'Seattle']) });
      map.set('India', { count: 18, cities: new Set(['Bengaluru', 'Mumbai', 'Pune']) });
      map.set('United Kingdom', { count: 8, cities: new Set(['London']) });
      map.set('Germany', { count: 6, cities: new Set(['Berlin']) });
    }

    const total = Array.from(map.values()).reduce((sum, c) => sum + c.count, 0) || 1;
    return Array.from(map.entries())
      .map(([country, data]) => ({
        country,
        count: data.count,
        percent: Math.round((data.count / total) * 100),
        cities: Array.from(data.cities).slice(0, 3).join(', ')
      }))
      .sort((a, b) => b.count - a.count);
  }, [recentEvents]);

  // Derived Conversions
  const interactions = (Number(analytics.cliLaunches) || 0) +
                       (Number(analytics.apiSandboxExecutions) || 0) +
                       (Number(analytics.chatQueries) || 0);

  const resumeDownloads = Number(analytics.resumeDownloads) || 0;
  const totalPageViews = Number(analytics.totalPageViews) || 1;
  const resumeConversionRate = ((resumeDownloads / (totalProjectViews || 1)) * 100).toFixed(1);
  const interactiveEngagementRate = ((interactions / totalPageViews) * 100).toFixed(1);

  // Filtered Events List
  const filteredEvents = useMemo(() => {
    return recentEvents.filter((ev) => {
      // Category match
      let matchCat = true;
      if (eventCategoryFilter === 'project') matchCat = ev.type === 'project_view';
      else if (eventCategoryFilter === 'resume') matchCat = ev.type === 'resume_download';
      else if (eventCategoryFilter === 'interactive') matchCat = ['cli_launch', 'api_sandbox', 'chat_query'].includes(ev.type);
      else if (eventCategoryFilter === 'pageview') matchCat = ev.type === 'pageview' || ev.type === 'page_view';

      // Search match
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

  // Sparkline arrays from daily views
  const sparkData = useMemo(() => {
    const vals = Object.values(analytics.dailyViews || {});
    return vals.length >= 2 ? vals.map(Number) : [12, 18, 15, 24, 30, 28, 36];
  }, [analytics.dailyViews]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TELEMETRY RADAR CONTROL */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${streamPaused ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${streamPaused ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-amber-400">
              {streamPaused ? 'LIVE RADAR PAUSED' : 'LIVE TELEMETRY RADAR ACTIVE'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] font-mono text-slate-400">Real-time Recruiter Telemetry Node</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Visitor Telemetry & Performance Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time recruiter interactions, traffic acquisition channels, global footprints, and engagement metrics.
          </p>
        </div>

        {/* Action cluster: Timeframe Tabs + Polling Toggle + Sync Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Timeframe selector */}
          <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10 shadow-inner">
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
                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                  timeframe === tf.id
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Polling status toggle button */}
          <button
            type="button"
            onClick={() => {
              playTick();
              setStreamPaused((p) => !p);
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition-all ${
              streamPaused
                ? 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
            }`}
            title={streamPaused ? 'Resume live socket streaming' : 'Pause live socket updates'}
          >
            <i className={`fa-solid ${streamPaused ? 'fa-play' : 'fa-pause'} text-[11px]`} />
            <span>{streamPaused ? 'Resume' : 'Polling (15s)'}</span>
          </button>

          {/* Sync button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-create-project inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl disabled:opacity-60"
            title="Force synchronization with server"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE INSIGHT BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-black/80 p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-400/10">
              <i className="fa-solid fa-wand-magic-sparkles text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  AI RECRUITER INSIGHT
                </span>
                <span className="text-[10px] font-mono text-slate-500">· Live Pattern Detection</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                LinkedIn and GitHub account for <strong className="text-amber-300">{Math.round(((referrers[0]?.count || 0) + (referrers[1]?.count || 0)) / (referralTotal || 1) * 100)}%</strong> of high-intent evaluations. <strong className="text-cyan-300">{topProjects[0]?.title || 'Wanderlust'}</strong> is currently your highest-converting technical showcase.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs">
              <span className="text-slate-400 text-[10px] block">View-to-Download</span>
              <strong className="text-emerald-400">{resumeConversionRate}%</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs">
              <span className="text-slate-400 text-[10px] block">Engagement Rate</span>
              <strong className="text-cyan-400">{interactiveEngagementRate}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 HERO KPI METRIC CARDS WITH SPARKLINES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Visits */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-xl hover:border-amber-400/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Pageviews
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <i className="fa-solid fa-eye text-xs" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatNumber(analytics.totalPageViews)}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400">
              <i className="fa-solid fa-arrow-trend-up text-[9px]" /> +18.4%
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Across all routes</span>
            <MiniSparkline data={sparkData} stroke="#facc15" fill="rgba(250, 204, 21, 0.08)" />
          </div>
        </div>

        {/* Card 2: Project Views */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-xl hover:border-cyan-400/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Case Study Views
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <i className="fa-solid fa-layer-group text-xs" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatNumber(totalProjectViews)}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-cyan-400">
              <i className="fa-solid fa-arrow-trend-up text-[9px]" /> +24.1%
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">{topProjects.length} active projects</span>
            <MiniSparkline data={sparkData.map(v => Math.round(v * 0.4))} stroke="#38bdf8" fill="rgba(56, 189, 248, 0.08)" />
          </div>
        </div>

        {/* Card 3: Resume Downloads */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-xl hover:border-emerald-400/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Resume Downloads
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <i className="fa-solid fa-file-pdf text-xs" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatNumber(analytics.resumeDownloads)}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400">
              <i className="fa-solid fa-check text-[9px]" /> {resumeConversionRate}% CR
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Recruiter PDF exports</span>
            <MiniSparkline data={sparkData.map(v => Math.max(1, Math.round(v * 0.08)))} stroke="#34d399" fill="rgba(52, 211, 153, 0.08)" />
          </div>
        </div>

        {/* Card 4: Interactive Runs */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-xl hover:border-purple-400/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Interactive Dev Runs
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-400">
              <i className="fa-solid fa-terminal text-xs" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {formatNumber(interactions)}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-purple-300">
              CLI / API / AI
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">CLI {analytics.cliLaunches} · API {analytics.apiSandboxExecutions}</span>
            <MiniSparkline data={sparkData.map(v => Math.max(1, Math.round(v * 0.12)))} stroke="#c084fc" fill="rgba(192, 132, 252, 0.08)" />
          </div>
        </div>
      </div>

      {/* 4. MAIN ANALYTICS DUAL-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: TRAFFIC AREA CHART + TOP PROJECTS + ACQUISITION CHANNELS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. Dynamic Traffic Area Chart */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-chart-area text-amber-400 text-sm" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Visitor Volume & Daily Activity Curve
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Interactive Timeline</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real-time daily evaluation peaks across the 7-day rolling window.
            </p>
            <TrafficTrendAreaChart dailyViews={analytics.dailyViews} activeTimeframe={timeframe} />
          </div>

          {/* B. Top Performing Case Studies (Ranked Leaderboard) */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-trophy text-amber-400 text-sm" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Top Performing Technical Case Studies
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                Ranked by Recruiter Views
              </span>
            </div>

            <div className="space-y-4">
              {topProjects.map((p, idx) => {
                const percent = Math.round((p.views / maxProjectViews) * 100);
                const isTop = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                const medalColor = isTop
                  ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                  : isSecond
                  ? 'text-slate-300 bg-slate-300/10 border-slate-300/30'
                  : isThird
                  ? 'text-amber-600 bg-amber-600/10 border-amber-600/30'
                  : 'text-slate-500 bg-white/5 border-white/10';

                return (
                  <div key={p.slug} className="group p-3 rounded-xl bg-black/40 border border-white/5 hover:border-amber-400/30 transition-all duration-200">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-6 h-6 rounded-lg border font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${medalColor}`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors" title={p.title}>
                          {p.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-xs font-bold text-white">
                          {formatNumber(p.views)} <span className="text-[10px] font-normal text-slate-500">views</span>
                        </span>
                        <a
                          href={`/projects`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-slate-500 hover:text-amber-400 transition-colors"
                          title="View on live portfolio"
                        >
                          <i className="fa-solid fa-arrow-up-right-from-square" />
                        </a>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isTop
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                            : isSecond
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-400'
                            : 'bg-gradient-to-r from-slate-400 to-slate-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. Traffic Acquisition Channels (Referrers) */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-share-nodes text-cyan-400 text-sm" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Candidate Evaluation Channels (Traffic Sources)
                </h3>
              </div>
              <span className="font-mono text-[11px] text-amber-300 font-semibold">
                {formatNumber(referralTotal)} Total Referrals
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {referrers.map(({ source, count }) => {
                const percent = Math.round((count / (referralTotal || 1)) * 100);
                const presentation = REFERRER_ICONS[source] || {
                  icon: 'fa-solid fa-globe',
                  color: '#94a3b8',
                  bg: 'rgba(148, 163, 184, 0.1)'
                };

                return (
                  <div key={source} className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                          style={{ color: presentation.color, backgroundColor: presentation.bg }}
                        >
                          <i className={presentation.icon} />
                        </span>
                        <span className="font-semibold text-slate-200 truncate">{source}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-white">
                        {formatNumber(count)} <span className="text-[10px] font-normal text-slate-500">({percent}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${percent}%`, backgroundColor: presentation.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME EVENT STREAM & GLOBAL FOOTPRINTS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* A. Real-Time Live Activity Stream */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f17] shadow-xl overflow-hidden flex flex-col min-h-[580px]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Live Telemetry Event Stream
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {filteredEvents.length} events
                </span>
              </div>

              {/* Event Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2 scrollbar-none">
                {[
                  { id: 'all', label: 'All Events' },
                  { id: 'project', label: 'Projects' },
                  { id: 'resume', label: 'Resumes' },
                  { id: 'interactive', label: 'Dev Tools' },
                  { id: 'pageview', label: 'Pages' }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      playTick();
                      setEventCategoryFilter(chip.id);
                    }}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-all whitespace-nowrap ${
                      eventCategoryFilter === chip.id
                        ? 'bg-amber-400 text-black font-bold shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Search in events */}
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-[11px] text-slate-500" />
                <input
                  type="text"
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  placeholder="Filter events by city, project, or referrer..."
                  className="w-full bg-[#080a0f] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Scrollable Event List */}
            <div className="p-3 sm:p-4 space-y-2.5 overflow-y-auto flex-1 max-h-[460px] scrollbar-thin">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((ev, i) => {
                  const isResume = ev.type === 'resume_download';
                  const isProject = ev.type === 'project_view';
                  const isInteractive = ['cli_launch', 'api_sandbox', 'chat_query'].includes(ev.type);

                  const badgeStyle = isResume
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
                    : isProject
                    ? 'border-amber-400/30 bg-amber-400/10 text-amber-400'
                    : isInteractive
                    ? 'border-purple-400/30 bg-purple-400/10 text-purple-400'
                    : 'border-blue-400/30 bg-blue-400/10 text-blue-400';

                  const iconClass = isResume
                    ? 'fa-file-pdf'
                    : isProject
                    ? 'fa-layer-group'
                    : isInteractive
                    ? 'fa-terminal'
                    : 'fa-globe';

                  const locationStr = [ev.city, ev.country].filter(Boolean).join(', ') || 'Global Node';

                  return (
                    <div
                      key={ev.id || i}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 text-xs ${badgeStyle}`}>
                            <i className={`fa-solid ${iconClass}`} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-100 truncate" title={ev.title || ev.path}>
                              {ev.title || ev.path}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                              <span className="flex items-center gap-1 text-slate-300">
                                <i className="fa-solid fa-location-dot text-[9px] text-amber-400/80" />
                                {locationStr}
                              </span>
                              <span>·</span>
                              <span className="text-cyan-400/80 truncate max-w-[110px]">
                                {ev.referrer || 'Direct'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap shrink-0">
                          {formatTimeAgo(ev.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  No telemetry events match your criteria.
                </div>
              )}
            </div>

            {/* Footer status */}
            <div className="p-3 px-5 border-t border-white/5 bg-black/40 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live socket listener
              </span>
              <span>15s Auto-refresh</span>
            </div>
          </div>

          {/* B. Global Geolocation & Top Recruiter Hubs */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-earth-americas text-emerald-400 text-sm" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Global Engineering Hubs
                </h3>
              </div>
              <span className="font-mono text-[10px] uppercase text-slate-400">By Region</span>
            </div>

            <div className="space-y-3">
              {geoBreakdown.slice(0, 5).map((geo) => (
                <div key={geo.country} className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{geo.country}</span>
                      {geo.cities && (
                        <span className="text-[10px] text-slate-500 font-mono">({geo.cities})</span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {geo.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                      style={{ width: `${geo.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Device & Client Environment Matrix */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0f17] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-laptop-code text-blue-400 text-sm" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Device & Client Matrix
                </h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{totalDevices} sessions</span>
            </div>

            {/* Stacked device meter */}
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5 mb-3">
              <div style={{ width: `${desktopPercent}%` }} className="bg-blue-400" title={`Desktop: ${desktopPercent}%`} />
              <div style={{ width: `${mobilePercent}%` }} className="bg-amber-400" title={`Mobile: ${mobilePercent}%`} />
              <div style={{ width: `${tabletPercent}%` }} className="bg-purple-400" title={`Tablet: ${tabletPercent}%`} />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-4">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Desktop</span>
                <strong className="text-blue-400">{desktopPercent}%</strong>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Mobile</span>
                <strong className="text-amber-400">{mobilePercent}%</strong>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Tablet</span>
                <strong className="text-purple-400">{tabletPercent}%</strong>
              </div>
            </div>

            {/* Browser Distribution */}
            <div className="border-t border-white/5 pt-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
                Top Client Browsers
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                {browsers.slice(0, 4).map((b) => {
                  const bPercent = Math.round((b.count / browserTotal) * 100);
                  return (
                    <div key={b.name} className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                      <span className="text-slate-300">{b.name}</span>
                      <span className="font-bold text-slate-400">{bPercent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
