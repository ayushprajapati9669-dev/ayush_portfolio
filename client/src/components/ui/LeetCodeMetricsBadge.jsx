import React, { useState, useEffect } from 'react';
import { playTick } from '../../utils/audio';

export function LeetCodeMetricsBadge({ variant = 'card', className = '' }) {
  const [stats, setStats] = useState({
    username: 'ayush7162',
    profileUrl: 'https://leetcode.com/u/ayush7162/',
    totalSolved: 65,
    totalQuestions: 4100,
    easySolved: 15,
    totalEasy: 975,
    mediumSolved: 41,
    totalMedium: 2138,
    hardSolved: 9,
    totalHard: 987,
    acceptanceRate: 59.6,
    ranking: 2355013,
    recentSubmissions: [
      { title: 'Reverse Nodes in k-Group', difficulty: 'Hard' },
      { title: 'Decode String', difficulty: 'Medium' },
      { title: 'Odd Even Linked List', difficulty: 'Medium' },
      { title: 'Palindrome Linked List', difficulty: 'Easy' }
    ]
  });

  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const res = await fetch('/api/public/leetcode-stats');
        if (res.ok) {
          const data = await res.json();
          if (data?.stats && isMounted) {
            setStats((prev) => ({
              ...prev,
              ...data.stats,
              recentSubmissions:
                Array.isArray(data.stats.recentSubmissions) && data.stats.recentSubmissions.length > 0
                  ? data.stats.recentSubmissions
                  : prev.recentSubmissions
            }));
          }
        }
      } catch (_e) {
        // Retain verified baseline
      }
    }
    fetchStats();

    const timer = setTimeout(() => {
      if (isMounted) setIsAnimated(true);
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const total = Number(stats.totalSolved) || 65;
  const target = 100;
  const easy = Number(stats.easySolved) || 15;
  const medium = Number(stats.mediumSolved) || 41;
  const hard = Number(stats.hardSolved) || 9;

  const easyPct = Math.round((easy / total) * 100) || 23;
  const medPct = Math.round((medium / total) * 100) || 63;
  const hardPct = Math.round((hard / total) * 100) || 14;

  // SVG Ring Calculations (circumference = 2 * PI * 76 = 477.52)
  const radius = 76;
  const circumference = 2 * Math.PI * radius; // 477.52
  const progressRatio = Math.min(total / target, 1);
  const strokeDashoffset = isAnimated ? circumference - (progressRatio * circumference) : circumference;
  
  // Angle for the floating tip dot: (percent / 100) * 360 - 90 deg
  const tipAngle = progressRatio * 360 - 90;

  // Spotlight mouse effect for difficulty cards
  const handleSpotlight = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
  };

  return (
    <div className={`leetcode-mastery-card ${className}`}>
      {/* Header */}
      <header className="lmc-header">
        <div className="lmc-profile-section">
          <div className="lmc-logo-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <div>
            <div className="lmc-title-row">
              <h2>Algorithmic Mastery</h2>
              <span className="lmc-badge-live">
                <span className="lmc-pulse-dot" /> Live
              </span>
            </div>
            <div className="lmc-meta-info">
              <span className="handle">@{stats.username || 'ayush7162'}</span>
              <span className="dot-sep">●</span>
              <span>Global Rank #{Number(stats.ranking || 2355013).toLocaleString()}</span>
              <span className="dot-sep">●</span>
              <span>Java &amp; C++</span>
            </div>
          </div>
        </div>

        <a
          href={stats.profileUrl || 'https://leetcode.com/u/ayush7162/'}
          target="_blank"
          rel="noopener noreferrer"
          className="lmc-btn-inspect"
          onClick={() => playTick('click')}
          title="Inspect verified live LeetCode profile"
        >
          <span>Inspect Profile</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </header>

      {/* Main Layout Grid */}
      <div className="lmc-layout-grid">
        {/* Left: Hero Circular Progress Gauge */}
        <div className="lmc-hero-card">
          <div className="lmc-hero-ring-container">
            <svg className="lmc-hero-ring-svg" viewBox="0 0 176 176">
              <defs>
                <linearGradient id="lmcGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>
              </defs>
              <circle className="lmc-hero-ring-bg" cx="88" cy="88" r="76" />
              <circle
                className="lmc-hero-ring-progress"
                cx="88"
                cy="88"
                r="76"
                style={{ strokeDashoffset }}
              />
            </svg>

            {/* Orbiting Glowing Tip Dot */}
            <div
              className="lmc-hero-ring-tip"
              style={{
                opacity: isAnimated ? 1 : 0,
                transform: `rotate(${tipAngle}deg) translate(76px) rotate(-${tipAngle}deg)`
              }}
            />

            <div className="lmc-hero-text">
              <div className="lmc-hero-number">{total}</div>
              <div className="lmc-hero-label">Solved</div>
              <div className="lmc-hero-target">
                Target <span>{target}</span>
              </div>
            </div>
          </div>

          <div className="lmc-acceptance-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{stats.acceptanceRate || 59.6}% Acceptance</span>
          </div>
        </div>

        {/* Right: Stats & Submissions */}
        <div className="lmc-right-panel">
          {/* Difficulty 3-Column Grid */}
          <div className="lmc-difficulty-grid">
            {/* Easy Card */}
            <div className="lmc-diff-card" onMouseMove={handleSpotlight}>
              <div className="lmc-diff-header">
                <div className="lmc-diff-title">
                  <div className="lmc-dot easy" />
                  <span>Easy</span>
                </div>
                <span className="lmc-diff-percent">{easyPct}%</span>
              </div>
              <div className="lmc-bar-chart-container">
                {[20, 40, 30, 60, 50, 80, 100].map((h, i) => (
                  <div
                    key={i}
                    className="lmc-bar easy"
                    style={{
                      height: isAnimated ? `${h}%` : '0%',
                      transitionDelay: `${i * 45}ms`
                    }}
                  />
                ))}
              </div>
              <div className="lmc-diff-stats">
                <span className="solved">{easy}</span>
                <span className="total">/ {stats.totalEasy || 975}</span>
              </div>
            </div>

            {/* Medium Card */}
            <div className="lmc-diff-card" onMouseMove={handleSpotlight}>
              <div className="lmc-diff-header">
                <div className="lmc-diff-title">
                  <div className="lmc-dot medium" />
                  <span>Medium</span>
                </div>
                <span className="lmc-diff-percent">{medPct}%</span>
              </div>
              <div className="lmc-bar-chart-container">
                {[30, 50, 70, 40, 90, 60, 100].map((h, i) => (
                  <div
                    key={i}
                    className="lmc-bar medium"
                    style={{
                      height: isAnimated ? `${h}%` : '0%',
                      transitionDelay: `${i * 45 + 50}ms`
                    }}
                  />
                ))}
              </div>
              <div className="lmc-diff-stats">
                <span className="solved">{medium}</span>
                <span className="total">/ {stats.totalMedium || 2138}</span>
              </div>
            </div>

            {/* Hard Card */}
            <div className="lmc-diff-card" onMouseMove={handleSpotlight}>
              <div className="lmc-diff-header">
                <div className="lmc-diff-title">
                  <div className="lmc-dot hard" />
                  <span>Hard</span>
                </div>
                <span className="lmc-diff-percent">{hardPct}%</span>
              </div>
              <div className="lmc-bar-chart-container">
                {[10, 20, 15, 40, 30, 60, 100].map((h, i) => (
                  <div
                    key={i}
                    className="lmc-bar hard"
                    style={{
                      height: isAnimated ? `${h}%` : '0%',
                      transitionDelay: `${i * 45 + 100}ms`
                    }}
                  />
                ))}
              </div>
              <div className="lmc-diff-stats">
                <span className="solved">{hard}</span>
                <span className="total">/ {stats.totalHard || 987}</span>
              </div>
            </div>
          </div>

          {/* Verified Activity Submissions Card */}
          <div className="lmc-sub-card">
            <div className="lmc-sub-header">
              <div className="lmc-sub-title">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Verified Activity</span>
              </div>
              <div className="lmc-sync-status">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21v-5h5" />
                </svg>
                <span>Auto-sync on</span>
              </div>
            </div>

            <div className="lmc-sub-list">
              {(stats.recentSubmissions || []).slice(0, 4).map((sub, idx) => {
                const diffLower = (sub.difficulty || 'Easy').toLowerCase();
                const tagClass =
                  diffLower.includes('hard')
                    ? 'hard'
                    : diffLower.includes('med')
                    ? 'medium'
                    : 'easy';

                return (
                  <div key={idx} className="lmc-sub-item">
                    <div className="lmc-sub-item-left">
                      <div className="lmc-check-circle">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="lmc-problem-name">{sub.title}</span>
                    </div>
                    <span className={`lmc-tag ${tagClass}`}>
                      {sub.difficulty || 'Medium'}
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

export default LeetCodeMetricsBadge;
