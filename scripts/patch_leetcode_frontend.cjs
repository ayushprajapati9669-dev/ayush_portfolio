const fs = require('fs');
const path = require('path');

// 1. Update LeetCodeMetricsBadge.jsx
const badgePath = path.join(__dirname, '..', 'client', 'src', 'components', 'ui', 'LeetCodeMetricsBadge.jsx');
const badgeCode = `import React, { useState, useEffect } from 'react';
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
      { title: 'LeetCode Problem Solver', icon: 'fa-solid fa-code', color: '#00f0ff' },
      { title: 'Java Algorithmic Foundations', icon: 'fa-brands fa-java', color: '#ff7b00' },
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
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const targetMilestone = 100;
  const strokeDashoffset = circumference - (Math.min(total / targetMilestone, 1) * circumference);

  return (
    <div
      className={\`relative overflow-hidden rounded-2xl bg-[#090f19]/90 border border-cyan-500/20 p-5 sm:p-6 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-500/40 group \${className}\`}
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
                Live Sync
              </span>
            </div>
            <p className="text-white/40 text-xs font-mono">
              @ayush7162 • Global Rank #{Number(stats.ranking || 2350736).toLocaleString()}
            </p>
          </div>
        </div>

        <a
          href={stats.profileUrl || 'https://leetcode.com/u/ayush7162/'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playTick('click')}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-cyan-300 text-xs font-mono transition-all flex items-center gap-1.5"
          title="Inspect verified live LeetCode profile"
        >
          <span>Live Profile</span>
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
                {total}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                Solved / {stats.totalQuestions || 4096}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-cyan-400/90 font-mono mt-2 font-medium">
            {stats.acceptanceRate || 59.6}% Acceptance Rate
          </span>
        </div>

        {/* Right: Breakdown bars & Submissions */}
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
                <span className="text-white/40 text-[10px] ml-1">/ {stats.totalEasy || 974} ({easyPct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400/80 transition-all duration-700"
                style={{ width: \`\${easyPct}%\` }}
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
                <span className="text-white/40 text-[10px] ml-1">/ {stats.totalMedium || 2136} ({medPct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400/80 transition-all duration-700"
                style={{ width: \`\${medPct}%\` }}
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
                <span className="text-white/40 text-[10px] ml-1">/ {stats.totalHard || 986} ({hardPct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-400/80 transition-all duration-700"
                style={{ width: \`\${hardPct}%\` }}
              />
            </div>
          </div>

          {/* Recent Real Submissions from Ayush's Profile */}
          <div className="pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1.5 font-semibold">
              Recent Java Submissions:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-mono">
              {(stats.recentSubmissions || []).slice(0, 3).map((sub, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80 flex items-center gap-1"
                >
                  <i className="fa-brands fa-java text-amber-400 text-[10px]" />
                  <span>{sub.title}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(badgePath, badgeCode, 'utf8');
console.log('Successfully updated LeetCodeMetricsBadge.jsx');

// 2. Update DeveloperCliDrawer.jsx
const cliPath = path.join(__dirname, '..', 'client', 'src', 'components', 'ui', 'DeveloperCliDrawer.jsx');
let cliContent = fs.readFileSync(cliPath, 'utf8');

cliContent = cliContent.replace(
  "'  leetcode                  → Pull problem-solving metrics (350+ solved, contest rating)',",
  "'  leetcode                  → Pull live verified problem-solving metrics from LeetCode (@ayush7162)',"
);

const oldCliCase = `      case 'leetcode': {
        addLog({
          type: 'output',
          content: [
            'LEETCODE PROBLEM SOLVING METRICS (Profile: ayush7162):',
            '  • Problems Solved:     350+ Algorithmic Challenges',
            '  • Easy:                140+  [===================>         ]',
            '  • Medium:              180+  [========================>     ]',
            '  • Hard:                30+   [========>                     ]',
            '  • Contest Rating:      1,740+ (Top 12% Globally)',
            '  • Acceptance Rate:     71.4% Efficiency Benchmark',
            '  • Verified URL:        https://leetcode.com/u/ayush7162/'
          ].join('\\n')
        });
        break;
      }`;

const newCliCase = `      case 'leetcode': {
        addLog({ type: 'output', content: 'Fetching live LeetCode stats for @ayush7162...' });
        try {
          const res = await fetch('/api/public/leetcode-stats');
          const data = await res.json();
          const s = data.stats || {};
          addLog({
            type: 'output',
            content: [
              \`LEETCODE PROBLEM SOLVING METRICS (Live Profile: \${s.username || 'ayush7162'}):\`,
              \`  • Problems Solved:     \${s.totalSolved || 65} / \${s.totalQuestions || 4096} Problems\`,
              \`  • Easy Solved:         \${s.easySolved || 15}  [===================>         ]\`,
              \`  • Medium Solved:       \${s.mediumSolved || 41}  [========================>     ]\`,
              \`  • Hard Solved:         \${s.hardSolved || 9}   [========>                     ]\`,
              \`  • Global Ranking:      #\${Number(s.ranking || 2350736).toLocaleString()}\`,
              \`  • Acceptance Rate:     \${s.acceptanceRate || 59.6}%\`,
              \`  • Primary Language:    Java (Data Structures & Algorithmic Foundations)\`,
              \`  • Verified Live URL:   \${s.profileUrl || 'https://leetcode.com/u/ayush7162/'}\`
            ].join('\\n')
          });
        } catch (_e) {
          addLog({
            type: 'output',
            content: [
              'LEETCODE PROBLEM SOLVING METRICS (Profile: ayush7162):',
              '  • Problems Solved:     65 Algorithmic Challenges (15 Easy, 41 Medium, 9 Hard)',
              '  • Verified Live URL:   https://leetcode.com/u/ayush7162/'
            ].join('\\n')
          });
        }
        break;
      }`;

const normalizeLf = (s) => s.replace(/\\r\\n/g, '\\n');
let normCli = normalizeLf(cliContent);
if (normCli.includes(normalizeLf(oldCliCase))) {
  normCli = normCli.replace(normalizeLf(oldCliCase), normalizeLf(newCliCase));
  fs.writeFileSync(cliPath, normCli, 'utf8');
  console.log('Successfully updated DeveloperCliDrawer.jsx');
} else {
  console.log('oldCliCase not found directly in DeveloperCliDrawer.jsx');
}

// 3. Update ResumeModal.jsx
const resumePath = path.join(__dirname, '..', 'client', 'src', 'components', 'ui', 'ResumeModal.jsx');
let resumeContent = fs.readFileSync(resumePath, 'utf8');

resumeContent = resumeContent.replace(/350\+ LeetCode algorithmic solutions/g, 'verified LeetCode algorithmic solutions in Java');
resumeContent = resumeContent.replace(/Solved 350\+ complex algorithmic challenges on LeetCode with 71\.4% acceptance rate and Top 12% global ranking\./g, 'Active problem solver on LeetCode (@ayush7162) solving complex DSA problems in Java with focus on trees, dynamic programming, and linked lists.');
resumeContent = resumeContent.replace(/LeetCode \(350\+\)/g, 'LeetCode (@ayush7162)');
resumeContent = resumeContent.replace(/<strong>LeetCode Problem Solving:<\/strong> 350\+ solved challenges \(142 Easy, 182 Medium, 32 Hard\), 71\.4% acceptance rate, Contest Rating 1,742\+ \(Top 12% globally\)\./g, '<strong>LeetCode Problem Solving:</strong> Active algorithmic problem solver (@ayush7162) with 65+ verified solutions (15 Easy, 41 Medium, 9 Hard) focusing on Java, data structures, and algorithmic complexity.');

fs.writeFileSync(resumePath, resumeContent, 'utf8');
console.log('Successfully updated ResumeModal.jsx');

