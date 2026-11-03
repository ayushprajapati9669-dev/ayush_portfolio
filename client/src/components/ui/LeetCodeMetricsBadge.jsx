import React, { useState, useEffect } from 'react';
import { playTick } from '../../utils/audio';

export function LeetCodeMetricsBadge({ variant = 'card', className = '' }) {
  const [stats, setStats] = useState({
    username: 'ayush7162',
    profileUrl: 'https://leetcode.com/u/ayush7162/',
    totalSolved: 65,
    totalQuestions: 4096,
    easySolved: 15,
    totalEasy: 974,
    mediumSolved: 41,
    totalMedium: 2136,
    hardSolved: 9,
    totalHard: 986,
    acceptanceRate: 59.6,
    ranking: 2350736,
    avatar: 'https://assets.leetcode.com/users/ayush7162/avatar_1761722187.png',
    badges: [
      { title: 'LeetCode Problem Solver', icon: 'fa-solid fa-code', color: '#d4af37' },
      { title: 'Java Algorithmic Foundations', icon: 'fa-brands fa-java', color: '#f59e0b' },
      { title: 'Linked List & Recursion', icon: 'fa-solid fa-network-wired', color: '#10b981' }
    ],
    recentSubmissions: [
      { title: 'Reverse Nodes in k-Group', status: 'Accepted', lang: 'Java', difficulty: 'Hard', time: 'Recently' },
      { title: 'Decode String', status: 'Accepted', lang: 'Java', difficulty: 'Medium', time: 'Recently' },
      { title: 'Odd Even Linked List', status: 'Accepted', lang: 'Java', difficulty: 'Medium', time: 'Recently' },
      { title: 'Palindrome Linked List', status: 'Accepted', lang: 'Java', difficulty: 'Easy', time: 'Recently' },
      { title: 'Rotate List', status: 'Accepted', lang: 'Java', difficulty: 'Medium', time: 'Recently' }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const res = await fetch('/api/public/leetcode-stats');
        if (res.ok) {
          const data = await res.json();
          if (data?.stats && isMounted) {
            setStats(data.stats);
          }
        }
      } catch (_e) {
        // Fallback to verified real baseline
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const total = stats.totalSolved || 65;
  const easy = stats.easySolved || 15;
  const medium = stats.mediumSolved || 41;
  const hard = stats.hardSolved || 9;

  // Percentage calculations
  const easyPct = Math.round((easy / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const hardPct = Math.round((hard / total) * 100);

  // SVG Circle calculations (milestone 100 problems)
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const targetMilestone = 100;
  const strokeDashoffset = circumference - (Math.min(total / targetMilestone, 1) * circumference);

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] bg-[#0a0a0c]/90 border border-[#d4af37]/25 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.05)] transition-all duration-300 hover:border-[#d4af37]/45 hover:shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.12)] group ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#d4af37]/15 transition-all" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10 flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)] flex-shrink-0">
            <i className="fa-solid fa-code text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-white font-['Jost',sans-serif] font-medium text-base sm:text-lg tracking-tight">
                LeetCode &amp; Algorithmic Mastery
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono text-xs font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-slate-300 text-sm font-mono mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="text-[#d4af37]">@{stats.username || 'ayush7162'}</span>
              <span className="text-white/20">•</span>
              <span>Global Rank #{Number(stats.ranking || 2350736).toLocaleString()}</span>
              <span className="text-white/20">•</span>
              <span className="text-slate-300">Java &amp; C++ DSA Focus</span>
            </p>
          </div>
        </div>

        <a
          href={stats.profileUrl || 'https://leetcode.com/u/ayush7162/'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playTick('click')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#d4af37]/15 border border-white/10 hover:border-[#d4af37]/40 text-slate-300 hover:text-[#d4af37] text-xs font-['Jost',sans-serif] font-medium tracking-wide transition-all shadow-sm no-underline flex-shrink-0"
          title="Inspect verified live LeetCode profile"
        >
          <span>Inspect Live Profile</span>
          <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
        </a>
      </div>

      {/* Main Metrics Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6 relative z-10">
        {/* Left: Theatrical Circular Progress Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/5">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-white/10"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Animated Gold Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#goldGradient)"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))',
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-['Cormorant_Garamond',Georgia,serif] font-medium text-white tracking-tight">
                {total}
              </span>
              <span className="text-xs text-[#d4af37] uppercase tracking-widest font-mono font-bold">
                SOLVED
              </span>
              <span className="text-xs text-slate-300 font-mono mt-0.5">
                Target: {targetMilestone}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] font-mono text-xs font-medium">
            <i className="fa-solid fa-chart-pie text-[11px]" />
            <span>{stats.acceptanceRate || 59.6}% Acceptance Rate</span>
          </div>
        </div>

        {/* Right: Difficulty Tier Progress Cards & Recent Submissions */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Easy Tier Card */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                  Easy
                </span>
                <span className="text-white/60 text-xs font-bold text-slate-200">{easyPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-1000 shadow-[0_0_10px_#10b981]"
                  style={{ width: `${easyPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono text-slate-300">
                <span className="text-white font-semibold">{easy}</span>
                <span>/ {stats.totalEasy || 974}</span>
              </div>
            </div>

            {/* Medium Tier Card */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 hover:border-[#d4af37]/40 transition-all">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-[#d4af37] font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
                  Medium
                </span>
                <span className="text-white/60 text-xs font-bold text-slate-200">{medPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-[#d4af37] transition-all duration-1000 shadow-[0_0_10px_#d4af37]"
                  style={{ width: `${medPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono text-slate-300">
                <span className="text-white font-semibold">{medium}</span>
                <span>/ {stats.totalMedium || 2136}</span>
              </div>
            </div>

            {/* Hard Tier Card */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/8 hover:border-rose-400/40 transition-all">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-rose-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                  Hard
                </span>
                <span className="text-white/60 text-xs font-bold text-slate-200">{hardPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-rose-400 transition-all duration-1000 shadow-[0_0_10px_#f43f5e]"
                  style={{ width: `${hardPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-mono text-slate-300">
                <span className="text-white font-semibold">{hard}</span>
                <span>/ {stats.totalHard || 986}</span>
              </div>
            </div>
          </div>

          {/* Recent Real Java Submissions */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-medium tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <i className="fa-brands fa-java text-amber-400 text-sm" />
                Recent Verified Submissions:
              </span>
              <span className="text-xs font-mono text-slate-400">Automated Sync</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {(stats.recentSubmissions || []).slice(0, 4).map((sub, idx) => {
                const diffColor =
                  sub.difficulty === 'Hard'
                    ? 'text-rose-400 border-rose-500/25 bg-rose-500/5'
                    : sub.difficulty === 'Medium'
                    ? 'text-[#d4af37] border-[#d4af37]/25 bg-[#d4af37]/5'
                    : 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5';

                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all text-slate-300"
                  >
                    <i className="fa-solid fa-circle-check text-emerald-400 text-xs" />
                    <span className="font-['Jost',sans-serif] text-xs font-medium text-white">{sub.title}</span>
                    <span className={`text-[11.5px] px-2 py-0.5 rounded border font-mono font-medium ${diffColor}`}>
                      {sub.difficulty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
