import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCsrfToken } from '../../../services/api';
import { playTick } from '../../../utils/audio';

const createDemoTimestamp = (minutesAgo) => new Date(Date.now() - minutesAgo * 60_000).toISOString();

const DEMO_ANALYTICS = {
  totalPageViews: 1248,
  uniqueVisitors: 486,
  resumeDownloads: 89,
  cliLaunches: 142,
  apiSandboxExecutions: 67,
  chatQueries: 53,
  referrers: {
    LinkedIn: 342,
    GitHub: 285,
    'Direct / URL': 198,
    'Google / Search': 140,
    'Twitter / X': 84,
    LeetCode: 76
  },
  topProjects: {
    'wanderlust-airbnb-clone': { views: 324, title: 'Wanderlust — Distributed Airbnb Platform' },
    'agentic-workspace': { views: 289, title: 'Autonomous Multi-Agent Workspace' },
    'ai-mock-interview-platform': { views: 245, title: 'AI Mock Interview Platform' },
    'developer-portfolio-v9': { views: 198, title: 'Developer Portfolio' },
    'real-time-chat-platform': { views: 176, title: 'Real-Time Chat Platform' },
    'ecommerce-dashboard': { views: 154, title: 'E-commerce Analytics Dashboard' },
    'task-management-app': { views: 132, title: 'Collaborative Task Manager' },
    'weather-insights': { views: 108, title: 'Weather Insights Dashboard' },
    'expense-tracker': { views: 86, title: 'Personal Finance Tracker' },
    'recipe-discovery': { views: 64, title: 'Recipe Discovery App' }
  },
  devices: { desktop: 780, mobile: 412, tablet: 56 },
  browsers: { Chrome: 620, Firefox: 240, Safari: 210, Edge: 130, Other: 48 },
  recentEvents: [
    {
      id: 'demo-1',
      type: 'project_view',
      title: 'Viewed Wanderlust — Distributed Airbnb Platform',
      path: '/projects/wanderlust-airbnb-clone',
      city: 'San Francisco',
      country: 'United States',
      referrer: 'LinkedIn',
      timestamp: createDemoTimestamp(2)
    },
    {
      id: 'demo-2',
      type: 'resume_download',
      title: 'Downloaded Full-Stack Resume',
      path: '/resume',
      city: 'London',
      country: 'United Kingdom',
      referrer: 'GitHub',
      timestamp: createDemoTimestamp(8)
    },
    {
      id: 'demo-3',
      type: 'api_sandbox',
      title: 'Ran an API sandbox request',
      path: '/api/v1/properties/search',
      city: 'Bengaluru',
      country: 'India',
      referrer: 'Direct / URL',
      timestamp: createDemoTimestamp(16)
    },
    {
      id: 'demo-4',
      type: 'project_view',
      title: 'Viewed Autonomous Multi-Agent Workspace',
      path: '/projects/agentic-workspace',
      city: 'Berlin',
      country: 'Germany',
      referrer: 'Google / Search',
      timestamp: createDemoTimestamp(31)
    },
    {
      id: 'demo-5',
      type: 'page_view',
      title: 'Visited About & Academic Profile',
      path: '/about',
      city: 'Seattle',
      country: 'United States',
      referrer: 'LinkedIn',
      timestamp: createDemoTimestamp(48)
    },
    {
      id: 'demo-6',
      type: 'project_view',
      title: 'Viewed AI Mock Interview Platform',
      path: '/projects/ai-mock-interview-platform',
      city: 'Toronto',
      country: 'Canada',
      referrer: 'GitHub',
      timestamp: createDemoTimestamp(66)
    },
    {
      id: 'demo-7',
      type: 'chat_query',
      title: 'Started a portfolio assistant conversation',
      path: '/ai-chat',
      city: 'Singapore',
      country: 'Singapore',
      referrer: 'Google / Search',
      timestamp: createDemoTimestamp(83)
    },
    {
      id: 'demo-8',
      type: 'project_view',
      title: 'Viewed Real-Time Chat Platform',
      path: '/projects/real-time-chat-platform',
      city: 'Amsterdam',
      country: 'Netherlands',
      referrer: 'Twitter / X',
      timestamp: createDemoTimestamp(104)
    },
    {
      id: 'demo-9',
      type: 'resume_download',
      title: 'Downloaded Full-Stack Resume',
      path: '/resume',
      city: 'Mumbai',
      country: 'India',
      referrer: 'LeetCode',
      timestamp: createDemoTimestamp(128)
    },
    {
      id: 'demo-10',
      type: 'page_view',
      title: 'Browsed technical skills',
      path: '/skills',
      city: 'Melbourne',
      country: 'Australia',
      referrer: 'Direct / URL',
      timestamp: createDemoTimestamp(151)
    },
    {
      id: 'demo-11',
      type: 'project_view',
      title: 'Viewed E-commerce Analytics Dashboard',
      path: '/projects/ecommerce-dashboard',
      city: 'New York',
      country: 'United States',
      referrer: 'Google / Search',
      timestamp: createDemoTimestamp(179)
    },
    {
      id: 'demo-12',
      type: 'cli_launch',
      title: 'Opened the interactive developer terminal',
      path: '/terminal',
      city: 'Pune',
      country: 'India',
      referrer: 'Direct / URL',
      timestamp: createDemoTimestamp(206)
    }
  ]
};

const REFERRER_PRESENTATION = {
  LinkedIn: { icon: 'fa-brands fa-linkedin', color: '#60a5fa', background: 'rgba(96, 165, 250, 0.12)' },
  GitHub: { icon: 'fa-brands fa-github', color: '#e2e8f0', background: 'rgba(226, 232, 240, 0.1)' },
  'Direct / URL': { icon: 'fa-solid fa-link', color: '#d4af37', background: 'rgba(212, 175, 55, 0.12)' },
  'Direct / External': { icon: 'fa-solid fa-arrow-up-right-from-square', color: '#d4af37', background: 'rgba(212, 175, 55, 0.12)' },
  'Google / Search': { icon: 'fa-brands fa-google', color: '#60a5fa', background: 'rgba(96, 165, 250, 0.12)' },
  'Twitter / X': { icon: 'fa-brands fa-x-twitter', color: '#cbd5e1', background: 'rgba(203, 213, 225, 0.1)' },
  LeetCode: { icon: 'fa-solid fa-code', color: '#fb923c', background: 'rgba(251, 146, 60, 0.12)' }
};

const ICON_PATHS = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </>
  ),
  terminal: (
    <>
      <path d="m4 17 6-5-6-5M12 19h8" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
      <path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14ZM5 2l.8 2.2L8 5l-2.2.8L5 8l-.8-2.2L2 5l2.2-.8L5 2Z" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h4a4 4 0 0 0 4-4V9a4 4 0 0 1 4-4M6 17V7a2 2 0 0 1 2-2h8" />
    </>
  ),
  device: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  tablet: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  broadcast: (
    <>
      <path d="M5 8.5a10 10 0 0 0 0 7M8 10.5a6 6 0 0 0 0 3M19 8.5a10 10 0 0 1 0 7M16 10.5a6 6 0 0 1 0 3" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  pause: <path d="M8 5v14M16 5v14" />,
  play: <path d="m8 5 12 7-12 7V5Z" />,
  location: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </>
  ),
  project: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v5" />
    </>
  ),
  arrow: (
    <>
      <path d="M7 17 17 7M7 7h10v10" />
    </>
  )
};

function Icon({ name, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {ICON_PATHS[name] || ICON_PATHS.globe}
    </svg>
  );
}

function formatNumber(value) {
  const count = Number(value);
  return (Number.isFinite(count) ? count : 0).toLocaleString();
}

function formatTimeAgo(timestamp) {
  const parsed = new Date(timestamp).getTime();
  if (!Number.isFinite(parsed)) return 'Time unavailable';

  const elapsed = Math.max(0, Date.now() - parsed);
  if (elapsed < 60_000) return 'Just now';
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return new Date(parsed).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatEventType(type) {
  const labels = {
    page_view: 'Page view',
    project_view: 'Project view',
    resume_download: 'Resume download',
    cli_launch: 'Terminal launch',
    api_sandbox: 'API sandbox',
    chat_query: 'AI assistant'
  };
  return labels[type] || String(type || 'visitor activity').replace(/[_-]+/g, ' ');
}

function formatReferrer(referrer) {
  const value = String(referrer || '').trim();
  if (!value) return 'Direct';

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
    if (hostname === window.location.hostname.toLowerCase()) return 'Direct / Local';
    if (hostname.includes('linkedin')) return 'LinkedIn';
    if (hostname.includes('github')) return 'GitHub';
    if (hostname.includes('google')) return 'Google / Search';
    if (hostname === 'x.com' || hostname.includes('twitter') || hostname === 't.co') return 'Twitter / X';
    if (hostname.includes('leetcode')) return 'LeetCode';
    return hostname;
  } catch {
    return value.length > 32 ? `${value.slice(0, 29)}…` : value;
  }
}

export function AdminAnalytics({ showToast }) {
  const [data, setData] = useState(DEMO_ANALYTICS);
  const [usingDemoData, setUsingDemoData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streamPaused, setStreamPaused] = useState(false);
  const [error, setError] = useState('');

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
      setUsingDemoData(true);
      setError(requestError instanceof Error ? requestError.message : 'Unable to load visitor telemetry.');
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
    playTick('click');
    const succeeded = await fetchAnalytics();
    if (succeeded) showToast?.('Visitor telemetry synced successfully.', 'fa-circle-check');
  };

  const analytics = data || DEMO_ANALYTICS;
  const referrers = useMemo(
    () => Object.entries(analytics.referrers || {})
      .map(([source, count]) => ({ source, count: Number(count) || 0 }))
      .filter((source) => source.count > 0)
      .sort((a, b) => b.count - a.count),
    [analytics.referrers]
  );
  const referralTotal = referrers.reduce((sum, source) => sum + source.count, 0);

  const topProjects = useMemo(
    () => Object.entries(analytics.topProjects || {})
      .map(([slug, project]) => ({
        slug,
        title: project?.title || slug,
        views: Number(project?.views) || 0
      }))
      .filter((project) => project.views > 0)
      .sort((a, b) => b.views - a.views),
    [analytics.topProjects]
  );
  const maxProjectViews = topProjects[0]?.views || 0;

  const devices = analytics.devices || EMPTY_ANALYTICS.devices;
  const desktop = Number(devices.desktop) || 0;
  const mobile = Number(devices.mobile) || 0;
  const tablet = Number(devices.tablet) || 0;
  const totalDevices = desktop + mobile + tablet;
  const desktopPercent = totalDevices ? Math.round((desktop / totalDevices) * 100) : 0;
  const mobilePercent = totalDevices ? Math.round((mobile / totalDevices) * 100) : 0;
  const tabletPercent = totalDevices ? 100 - desktopPercent - mobilePercent : 0;
  const deviceBreakdown = [
    { label: 'Desktop', value: desktop, percent: desktopPercent, icon: 'device', color: '#60a5fa', tint: 'bg-blue-300' },
    { label: 'Mobile', value: mobile, percent: mobilePercent, icon: 'mobile', color: '#d4af37', tint: 'bg-[#d4af37]' },
    { label: 'Tablet', value: tablet, percent: tabletPercent, icon: 'tablet', color: '#a78bfa', tint: 'bg-violet-300' }
  ];
  const browsers = Object.entries(analytics.browsers || {})
    .map(([name, count]) => ({ name, count: Number(count) || 0 }))
    .filter((browser) => browser.count > 0)
    .sort((a, b) => b.count - a.count);
  const browserTotal = browsers.reduce((sum, browser) => sum + browser.count, 0);
  const recentEvents = Array.isArray(analytics.recentEvents) ? analytics.recentEvents.filter(Boolean) : [];
  const interactions = (Number(analytics.cliLaunches) || 0)
    + (Number(analytics.apiSandboxExecutions) || 0)
    + (Number(analytics.chatQueries) || 0);
  const totalProjectViews = topProjects.reduce((sum, project) => sum + project.views, 0);
  const topReferrer = referrers[0]?.source;
  const topProject = topProjects[0]?.title;
  const smartInsight = topReferrer && topProject
    ? `${topReferrer} is currently your leading referral source, and ${topProject} is your most-viewed case study.`
    : topReferrer
      ? `${topReferrer} is currently your leading referral source.`
      : topProject
        ? `${topProject} is currently your most-viewed case study.`
        : 'Engagement insights will appear here as visitor activity is recorded.';

  const metricCards = [
    {
      label: 'Tracked events',
      value: formatNumber(analytics.totalPageViews),
      description: 'All events recorded',
      icon: 'broadcast',
      accent: 'text-blue-300',
      iconBackground: 'bg-blue-400/10 border-blue-300/20',
      hover: 'hover:border-blue-300/30'
    },
    {
      label: 'Project views',
      value: formatNumber(totalProjectViews),
      description: `Across ${formatNumber(topProjects.length)} tracked projects`,
      icon: 'project',
      accent: 'text-[#d4af37]',
      iconBackground: 'bg-[#d4af37]/10 border-[#d4af37]/20',
      hover: 'hover:border-[#d4af37]/30'
    },
    {
      label: 'Resume downloads',
      value: formatNumber(analytics.resumeDownloads),
      description: 'Resume file downloads',
      icon: 'file',
      accent: 'text-emerald-300',
      iconBackground: 'bg-emerald-400/10 border-emerald-300/20',
      hover: 'hover:border-emerald-300/30'
    },
    {
      label: 'Interactive actions',
      value: formatNumber(interactions),
      description: 'Tool usage across the portfolio',
      detail: `Terminal ${formatNumber(analytics.cliLaunches)} · API ${formatNumber(analytics.apiSandboxExecutions)} · AI ${formatNumber(analytics.chatQueries)}`,
      icon: 'terminal',
      accent: 'text-violet-300',
      iconBackground: 'bg-violet-400/10 border-violet-300/20',
      hover: 'hover:border-violet-300/30'
    }
  ];

  return (
    <section className="admin-analytics-page space-y-6" aria-labelledby="telemetry-title">
      <header className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]/80">
            Portfolio analytics
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="telemetry-title" className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
              Visitor Telemetry
            </h2>
            <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider ${
              usingDemoData
                ? 'border-amber-300/20 bg-amber-300/[0.07] text-amber-200'
                : streamPaused
                  ? 'border-slate-400/20 bg-slate-400/[0.07] text-slate-300'
                  : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                usingDemoData ? 'bg-amber-300' : streamPaused ? 'bg-slate-400' : 'bg-emerald-300 animate-pulse'
              }`} />
              {usingDemoData ? 'Demo data' : streamPaused ? 'Auto-refresh paused' : 'Auto-refresh · 15s'}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            A clear view of activity across your portfolio.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {analytics.serverTime && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              Synced {new Date(analytics.serverTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.045] px-3.5 py-2.5 text-xs font-medium text-slate-200 transition hover:border-[#d4af37]/35 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/60 disabled:cursor-wait disabled:opacity-60"
            aria-label="Sync visitor telemetry"
          >
            <Icon name="refresh" className={`h-4 w-4 text-[#d4af37] ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing…' : 'Sync data'}
          </button>
        </div>
      </header>

      {error && (
        <div
          className="flex flex-col gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.035] px-4 py-3 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span className="leading-relaxed">
            <Icon name="sparkles" className="mr-2 inline h-4 w-4 text-amber-200" />
            Showing illustrative demo data while live telemetry is unavailable: {error}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="shrink-0 rounded-lg border border-amber-200/15 px-3 py-1.5 text-xs font-medium text-amber-100 transition hover:bg-amber-200/[0.07] disabled:opacity-60"
          >
            Try again
          </button>
        </div>
      )}

      <div className="admin-analytics-insight flex items-start gap-3 rounded-2xl border border-[#d4af37]/15 bg-[linear-gradient(110deg,rgba(212,175,55,0.09),rgba(12,15,20,0.82)_45%,rgba(12,15,20,0.55))] p-4 sm:p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/[0.08] text-[#e4c66b]">
          <Icon name="sparkles" className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d4af37]/80">Quick read</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{smartInsight}</p>
        </div>
      </div>

      <section aria-labelledby="telemetry-overview-title" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 id="telemetry-overview-title" className="text-sm font-semibold text-white">At a glance</h3>
            <p className="mt-1 text-[11px] text-slate-500">Core engagement metrics</p>
          </div>
          <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-500">
            Lifetime totals
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {metricCards.map((metric) => (
            <article
              key={metric.label}
              className={`admin-analytics-metric-card group flex min-h-[144px] flex-col justify-between rounded-2xl border border-white/[0.085] bg-[#0b0e13] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-0.5 ${metric.hover}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
                  <p className="mt-2.5 text-[32px] font-semibold leading-none tracking-tight tabular-nums text-white">
                    {metric.value}
                  </p>
                </div>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${metric.iconBackground} ${metric.accent}`}>
                  <Icon name={metric.icon} className="h-[18px] w-[18px]" />
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] leading-relaxed text-slate-400">{metric.description}</p>
                {metric.detail && (
                  <p className="mt-1.5 border-t border-white/[0.06] pt-2 text-[10px] tabular-nums text-slate-500">{metric.detail}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="flex items-start gap-2 px-1 text-[10px] leading-relaxed text-slate-500">
        <Icon name="globe" className="mt-px h-3.5 w-3.5 shrink-0 text-slate-600" />
        <span>Totals are cumulative and visitors are not deduplicated; these numbers represent recorded activity, not unique people.</span>
      </p>

      <section aria-labelledby="telemetry-details-title" className="space-y-3">
        <div>
          <h3 id="telemetry-details-title" className="text-sm font-semibold text-white">Traffic &amp; engagement</h3>
          <p className="mt-1 text-[11px] text-slate-500">Where visitors come from, what they view, and how they interact.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-3">
          <section className="rounded-2xl border border-white/[0.085] bg-[#0b0e13] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.16)] sm:p-5" aria-labelledby="traffic-sources-title">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 id="traffic-sources-title" className="flex items-center gap-2 text-sm font-semibold text-white">
                <Icon name="route" className="h-4 w-4 text-[#d4af37]" />
                Traffic sources
              </h3>
              <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[10px] tabular-nums text-slate-400">
                {formatNumber(referralTotal)}
              </span>
            </div>
            <p className="mb-4 text-[10px] text-slate-500">Tracked referral share</p>
            {referrers.length > 0 ? (
              <div className="space-y-4">
                {referrers.map(({ source, count }) => {
                  const percentage = referralTotal ? Math.round((count / referralTotal) * 100) : 0;
                  const presentation = REFERRER_PRESENTATION[source] || {
                    icon: 'fa-solid fa-globe',
                    color: '#94a3b8',
                    background: 'rgba(148, 163, 184, 0.1)'
                  };
                  return (
                    <div key={source} className="group">
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-2 text-slate-300 transition-colors group-hover:text-white">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs"
                            style={{ color: presentation.color, backgroundColor: presentation.background }}
                          >
                            <i className={presentation.icon} aria-hidden="true" />
                          </span>
                          <span className="truncate">{source}</span>
                        </span>
                        <span className="shrink-0 font-medium text-white">
                          {formatNumber(count)} <span className="text-[10px] text-slate-500">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.055]">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%`, backgroundColor: presentation.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-slate-500">
                Referral data will appear when visitors arrive from tracked sources.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-white/[0.085] bg-[#0b0e13] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.16)] sm:p-5" aria-labelledby="device-breakdown-title">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 id="device-breakdown-title" className="flex items-center gap-2 text-sm font-semibold text-white">
                <Icon name="device" className="h-4 w-4 text-blue-300" />
                Devices
              </h3>
              <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[10px] tabular-nums text-slate-400">
                {formatNumber(totalDevices)} sessions
              </span>
            </div>
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]"
              role="img"
              aria-label={`Device distribution: ${deviceBreakdown.map((device) => `${device.label} ${device.percent}%`).join(', ')}`}
            >
              {deviceBreakdown.map((device) => (
                <span
                  key={device.label}
                  className="h-full transition-[width] duration-500"
                  style={{ width: `${device.percent}%`, backgroundColor: device.color }}
                />
              ))}
            </div>
            <div className="mt-4 space-y-4">
              {deviceBreakdown.map((device) => (
                <div key={device.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Icon name={device.icon} className="h-3.5 w-3.5" style={{ color: device.color }} />
                      {device.label}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-slate-200">
                      {formatNumber(device.value)}
                      <span className="ml-1.5 text-[10px] font-normal text-slate-500">{device.percent}%</span>
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.055]">
                    <div className={`h-full rounded-full ${device.tint}`} style={{ width: `${device.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {browsers.length > 0 && (
              <div className="mt-5 border-t border-white/[0.07] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Browsers</p>
                  <span className="text-[10px] tabular-nums text-slate-500">{formatNumber(browserTotal)} sessions</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {browsers.map((browser) => {
                    const percentage = browserTotal ? Math.round((browser.count / browserTotal) * 100) : 0;
                    return (
                      <div key={browser.name} className="min-w-0" title={`${formatNumber(browser.count)} sessions`}>
                        <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
                          <span className="truncate text-slate-400">{browser.name}</span>
                          <span className="shrink-0 tabular-nums text-slate-300">{percentage}%</span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-white/[0.055]">
                          <div className="h-full rounded-full bg-slate-400/70" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        <section
          className="telemetry-scroll-panel relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.085] bg-[#0b0e13] shadow-[0_8px_24px_rgba(0,0,0,0.16)] xl:col-span-5"
          aria-labelledby="recent-activity-title"
        >
          <div className={`absolute inset-x-0 top-0 h-px ${streamPaused ? 'bg-amber-300/55' : 'bg-emerald-300/45'}`} />
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">
            <div className="flex items-center gap-2">
              <Icon name="broadcast" className={`h-4 w-4 ${streamPaused ? 'text-amber-300' : 'text-emerald-300'}`} />
              <div>
                <h3 id="recent-activity-title" className="text-sm font-semibold text-white">Recent activity</h3>
                <p className="mt-0.5 text-[10px] text-slate-500">Latest events received by the site</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStreamPaused((paused) => !paused)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] transition ${
                  streamPaused
                    ? 'border-amber-300/20 bg-amber-300/[0.06] text-amber-200 hover:bg-amber-300/10'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
                aria-pressed={streamPaused}
                aria-label={streamPaused ? 'Resume automatic telemetry updates' : 'Pause automatic telemetry updates'}
                title={streamPaused ? 'Resume auto-refresh and sync now' : 'Pause automatic refresh'}
              >
                <Icon name={streamPaused ? 'play' : 'pause'} className="h-3 w-3" />
                {streamPaused ? 'Resume' : 'Pause'}
              </button>
              <span className={`rounded-md border px-2 py-1 text-[9px] font-bold tracking-[0.12em] ${
                streamPaused
                  ? 'border-amber-300/20 bg-amber-300/[0.06] text-amber-200'
                  : 'border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200'
              }`}>
                {streamPaused ? 'PAUSED' : 'POLLING'}
              </span>
            </div>
          </div>
          <div className="telemetry-scroll-area min-h-0 flex-1 space-y-2 overflow-y-auto p-3 sm:p-4" aria-live={streamPaused ? 'off' : 'polite'}>
            {recentEvents.length > 0 ? recentEvents.map((event, index) => {
              const isDownload = event.type === 'resume_download';
              const isProject = event.type === 'project_view';
              const isInteractive = ['api_sandbox', 'cli_launch', 'chat_query'].includes(event.type);
              const eventIcon = isDownload ? 'file' : isProject ? 'project' : isInteractive ? 'terminal' : 'globe';
              const iconStyle = isDownload
                ? 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200'
                : isProject
                  ? 'border-[#d4af37]/20 bg-[#d4af37]/[0.07] text-[#d4af37]'
                  : isInteractive
                    ? 'border-violet-300/20 bg-violet-300/[0.07] text-violet-200'
                    : 'border-blue-300/20 bg-blue-300/[0.07] text-blue-200';
              const timestamp = event.timestamp || event.time;
              const location = [event.city, event.country].filter(Boolean).join(', ') || 'Location unavailable';
              return (
                <article
                  key={event.id || `${event.type}-${timestamp || index}`}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.055] bg-white/[0.018] p-3 transition-colors hover:border-white/[0.1] hover:bg-white/[0.035]"
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${iconStyle}`}>
                    <Icon name={eventIcon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded border border-white/[0.08] bg-white/[0.035] px-1.5 py-0.5 text-[9px] font-medium capitalize text-slate-400">
                        {formatEventType(event.type)}
                      </span>
                      <time
                        className="shrink-0 text-[10px] text-slate-500"
                        dateTime={timestamp || undefined}
                        title={timestamp ? new Date(timestamp).toLocaleString() : undefined}
                      >
                        {timestamp ? formatTimeAgo(timestamp) : 'Time unavailable'}
                      </time>
                    </div>
                    <p className="mt-1.5 truncate text-xs font-medium text-slate-100" title={event.title || event.path}>
                      {event.title || event.path || 'Visitor activity'}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="location" className="h-3 w-3" />
                        {location}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate text-[#d4af37]/80">{formatReferrer(event.referrer)}</span>
                    </div>
                  </div>
                </article>
              );
            }) : (
              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-500">
                  <Icon name="broadcast" className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-300">No visitor events yet</p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                  Events recorded by the portfolio will appear here. Updates are checked every 15 seconds.
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3 text-[10px] text-slate-500 sm:px-5">
            <span>{formatNumber(recentEvents.length)} recent events</span>
            <span>{streamPaused ? 'Auto-refresh paused' : 'Checks every 15 seconds'}</span>
          </div>
        </section>

        <section className="telemetry-scroll-panel flex min-h-0 flex-col rounded-2xl border border-white/[0.085] bg-[#0b0e13] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.16)] sm:p-5 xl:col-span-4" aria-labelledby="top-projects-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 id="top-projects-title" className="flex items-center gap-2 text-sm font-semibold text-white">
              <Icon name="project" className="h-4 w-4 text-violet-300" />
              Top projects
            </h3>
            <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">By views</span>
          </div>
          {topProjects.length > 0 ? (
            <>
              <div className="telemetry-scroll-area min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
                {topProjects.map((project, index) => {
                  const percentage = maxProjectViews ? Math.round((project.views / maxProjectViews) * 100) : 0;
                  const rank = index < 3 ? `0${index + 1}` : `#${index + 1}`;
                  return (
                    <article key={project.slug} className="group">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className={`w-6 shrink-0 text-[10px] font-bold ${index === 0 ? 'text-[#d4af37]' : 'text-slate-600'}`}>
                          {rank}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-300 transition-colors group-hover:text-white" title={project.title}>
                          {project.title}
                        </span>
                        <span className="shrink-0 text-xs font-semibold tabular-nums text-white">
                          {formatNumber(project.views)} <span className="text-[9px] font-normal text-slate-500">views</span>
                        </span>
                      </div>
                      <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${index === 0 ? 'bg-gradient-to-r from-[#d4af37] to-amber-300' : 'bg-gradient-to-r from-emerald-500/80 to-cyan-400/80'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[10px] text-slate-500">
                <span>{formatNumber(topProjects.length)} projects with tracked views</span>
                <span className="inline-flex items-center gap-1 text-[#d4af37]">
                  Ranked by views <Icon name="arrow" className="h-3 w-3" />
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-500">
                <Icon name="project" className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-medium text-slate-300">No project views recorded</p>
              <p className="mt-1 text-xs text-slate-500">Published project activity will be ranked here.</p>
            </div>
          )}
        </section>
      </div>
      </section>
    </section>
  );
}

export default AdminAnalytics;
