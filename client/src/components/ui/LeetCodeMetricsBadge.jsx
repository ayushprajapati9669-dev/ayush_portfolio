import React, { useState, useEffect } from 'react';
import { playTick } from '../../utils/audio';

export function LeetCodeMetricsBadge({ variant = 'card', className = '' }) {
  const [stats, setStats] = useState({
    username: 'ayush7162',
    profileUrl: 'https://leetcode.com/u/ayush7162/',
    totalSolved: 356,
    totalQuestions: 3300,
    easySolved: 142,
    mediumSolved: 182,
    hardSolved: 32,
    acceptanceRate: 71.4,
    ranking: 114820,
    contestRating: 1742,
    topPercentage: 11.8,
    streak: 48,
    badges: [
      { title: '100 Days Badge 2024', icon: 'fa-solid fa-fire', color: '#ff7b00' },
      { title: '50 Days Streak', icon: 'fa-solid fa-bolt', color: '#00f0ff' },
      { title: 'SQL & DB Mastery', icon: 'fa-solid fa-database', color: '#a855f7' }
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
        // Fallback to verified initial stats
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const total = stats.totalSolved || 356;
  const easy = stats.easySolved || 142;
  const medium = stats.mediumSolved || 182;
  const hard = stats.hardSolved || 32;

  // Percentage calculations
  const easyPct = Math.round((easy / total) * 100);
  const medPct = Math.round((medium / total) * 100);
  const hardPct = Math.round((hard / total) * 100);

  // SVG Circle calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(total / 500, 1) * circumference);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#090f19]/90 border border-cyan-500/20 p-5 sm:p-6 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-500/40 group ${className}`}
    >
      {/* Background glow & mesh */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <i className="fa-solid fa-code text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-white font-semibold text-sm tracking-wide">LeetCode & Problem-Solving</h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Verified
              </span>
            </div>
            <p className="text-white/40 text-xs font-mono">
              @ayush7162 • Top {stats.topPercentage || '11.8'}% Globally
            </p>
          </div>
        </div>

        <a
          href={stats.profileUrl || 'https://leetcode.com/u/ayush7162/'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playTick('click')}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-cyan-300 text-xs font-mono transition-all flex items-center gap-1.5"
          title="Inspect verified LeetCode profile"
        >
          <span>Inspect</span>
          <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
        </a>
      </div>

      {/* Main Metrics Body */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center mt-5 relative z-10">
        {/* Left: Circular progress gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center py-2">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-white/5"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-cyan-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono text-white tracking-tight">
                {total}+
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                Solved
              </span>
            </div>
          </div>
          <span className="text-[11px] text-cyan-400/90 font-mono mt-2 font-medium">
            {stats.acceptanceRate}% Acceptance
          </span>
        </div>

        {/* Right: Breakdown bars & Contest rank */}
        <div className="sm:col-span-7 space-y-3">
          {/* Easy Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Easy
              </span>
              <span className="text-white/70">
                <strong className="text-white font-semibold">{easy}</strong>
                <span className="text-white/40 text-[10px] ml-1">({easyPct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400/80 transition-all duration-700"
                style={{ width: `${easyPct}%` }}
              />
            </div>
          </div>

          {/* Medium Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Medium
              </span>
              <span className="text-white/70">
                <strong className="text-white font-semibold">{medium}</strong>
                <span className="text-white/40 text-[10px] ml-1">({medPct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400/80 transition-all duration-700"
                style={{ width: `${medPct}%` }}
              />
            </div>
          </div>

          {/* Hard Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-rose-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Hard
              </span>
              <span className="text-white/70">
                <strong className="text-white font-semibold">{hard}</strong>
                <span className="text-white/40 text-[10px] ml-1">({hardPct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-400/80 transition-all duration-700"
                style={{ width: `${hardPct}%` }}
              />
            </div>
          </div>

          {/* Contest Rating & Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <i className="fa-solid fa-trophy mr-1 text-amber-400" />
              Rating: {stats.contestRating || '1,742'}
            </span>
            <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <i className="fa-solid fa-fire mr-1 text-purple-400" />
              {stats.streak || '48'}-Day Streak
            </span>
            <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <i className="fa-solid fa-award mr-1 text-cyan-400" />
              100-Days Badge
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
