const fs = require('fs');
const path = require('path');

const filePath = path.resolve('client/src/styles/pages/journey.css');
let content = fs.readFileSync(filePath, 'utf8');

// Find the start of leetcode section in journey.css
const startMarker = '/* ==========================================================================\n   LeetCode Algorithmic Mastery Dashboard';
const altStartMarker = '/* ==========================================================================\r\n   LeetCode Algorithmic Mastery Dashboard';

const isCRLF = content.includes('\r\n');
const marker = content.includes(altStartMarker) ? altStartMarker : startMarker;

const startIndex = content.indexOf(marker);
if (startIndex === -1) {
  console.error('Could not find start marker in journey.css');
  process.exit(1);
}

const newLeetCodeCSS = `/* ==========================================================================
   LeetCode Algorithmic Mastery Dashboard (Refined & Compact Luxury Glass)
   ========================================================================== */
.journey-page .leetcode-section {
  max-width: 1040px !important;
  margin: 28px auto !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.leetcode-mastery-card {
  width: 100%;
  background: linear-gradient(180deg, rgba(16, 18, 25, 0.92) 0%, rgba(10, 11, 16, 0.96) 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  padding: 1.35rem 1.65rem;
  box-shadow: 0 18px 45px -12px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.leetcode-mastery-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.45), transparent);
}

/* Header */
.lmc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.15rem;
  flex-wrap: wrap;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.lmc-profile-section {
  display: flex;
  align-items: center;
  gap: 0.95rem;
}

.lmc-logo-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(28, 30, 40, 0.9), rgba(15, 16, 22, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  box-shadow: 0 6px 16px -3px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  position: relative;
  flex-shrink: 0;
}

.lmc-logo-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: radial-gradient(circle at top left, rgba(212, 175, 55, 0.25), transparent 65%);
  pointer-events: none;
}

.lmc-title-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.2rem;
  flex-wrap: wrap;
}

.lmc-title-row h2 {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin: 0;
}

.lmc-badge-live {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.18rem 0.5rem;
  border-radius: 5px;
  letter-spacing: 0.05em;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.lmc-pulse-dot {
  width: 5px;
  height: 5px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: lmcPulse 2s infinite;
}

@keyframes lmcPulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.lmc-meta-info {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 500;
  flex-wrap: wrap;
}

.lmc-meta-info .handle {
  color: #d4af37;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  font-weight: 600;
}

.lmc-meta-info .dot-sep {
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.6rem;
}

.lmc-btn-inspect {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.45rem 0.95rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-decoration: none;
}

.lmc-btn-inspect:hover {
  background: rgba(212, 175, 55, 0.12);
  border-color: rgba(212, 175, 55, 0.4);
  color: #d4af37;
  transform: translateY(-1px);
}

/* Layout Grid: Left Hero vs Right Panel */
.lmc-layout-grid {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 1.25rem;
  position: relative;
  z-index: 2;
}

/* Left: Hero Ring Card */
.lmc-hero-card {
  background: linear-gradient(180deg, rgba(20, 22, 30, 0.85) 0%, rgba(12, 14, 19, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 1.25rem 1.15rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.lmc-hero-card::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 190px; height: 190px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.16) 0%, transparent 70%);
  opacity: 0.4;
  pointer-events: none;
}

.lmc-hero-ring-container {
  position: relative;
  width: 172px;
  height: 172px;
  margin-bottom: 1.15rem;
  z-index: 1;
}

.lmc-hero-ring-svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
  overflow: visible;
}

.lmc-hero-ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 9;
}

.lmc-hero-ring-progress {
  fill: none;
  stroke: url(#lmcGoldGradient);
  stroke-width: 9;
  stroke-linecap: round;
  stroke-dasharray: 477.52;
  transition: stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.35));
}

.lmc-hero-ring-tip {
  position: absolute;
  top: 50%; left: 50%;
  width: 12px; height: 12px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 12px 3px #d4af37;
  margin-top: -6px;
  margin-left: -6px;
  transform-origin: center;
  z-index: 2;
  transition: opacity 0.5s ease 0.5s, transform 1.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.lmc-hero-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.lmc-hero-number {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 2.35rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: #ffffff;
  margin-bottom: 0.15rem;
}

.lmc-hero-label {
  font-size: 0.68rem;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 0.45rem;
}

.lmc-hero-target {
  font-size: 0.72rem;
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.45);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
}

.lmc-hero-target span {
  color: #ffffff;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.lmc-acceptance-badge {
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.25);
  color: #d4af37;
  padding: 0.42rem 1rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  z-index: 1;
  backdrop-filter: blur(10px);
}

/* Right Panel */
.lmc-right-panel {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

/* Difficulty Grid */
.lmc-difficulty-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
}

.lmc-diff-card {
  background: rgba(20, 22, 30, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 0.95rem 1.05rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.lmc-diff-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), rgba(212, 175, 55, 0.12), transparent 45%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.lmc-diff-card:hover {
  border-color: rgba(212, 175, 55, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -6px rgba(0, 0, 0, 0.5);
}

.lmc-diff-card:hover::before {
  opacity: 1;
}

.lmc-diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.lmc-diff-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #ffffff;
}

.lmc-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.lmc-dot.easy {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.lmc-dot.medium {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
}

.lmc-dot.hard {
  background: #f43f5e;
  box-shadow: 0 0 6px rgba(244, 63, 94, 0.6);
}

.lmc-diff-percent {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.15rem 0.45rem;
  border-radius: 5px;
}

/* Custom Bar Chart */
.lmc-bar-chart-container {
  height: 38px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  margin-bottom: 0.65rem;
  position: relative;
  z-index: 1;
}

.lmc-bar {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px 3px 0 0;
  transition: height 1s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s;
  position: relative;
}

.lmc-bar.easy {
  background: linear-gradient(to top, rgba(16, 185, 129, 0.15), #10b981);
}

.lmc-bar.medium {
  background: linear-gradient(to top, rgba(245, 158, 11, 0.15), #f59e0b);
}

.lmc-bar.hard {
  background: linear-gradient(to top, rgba(244, 63, 94, 0.15), #f43f5e);
}

.lmc-bar:hover {
  filter: brightness(1.25);
}

.lmc-diff-stats {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: 'JetBrains Mono', monospace;
  position: relative;
  z-index: 1;
}

.lmc-diff-stats .solved {
  font-size: 1.02rem;
  font-weight: 700;
  color: #ffffff;
}

.lmc-diff-stats .total {
  font-size: 0.72rem;
  color: #64748b;
}

/* Recent Submissions */
.lmc-sub-card {
  background: rgba(20, 22, 30, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 0.95rem 1.15rem;
  flex-grow: 1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
}

.lmc-sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
}

.lmc-sub-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
}

.lmc-sync-status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
}

.lmc-sub-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.lmc-sub-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(12, 14, 19, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.5rem 0.85rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: default;
}

.lmc-sub-item:hover {
  background: rgba(24, 26, 35, 0.9);
  border-color: rgba(212, 175, 55, 0.3);
  transform: translateX(3px);
}

.lmc-sub-item-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.lmc-check-circle {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lmc-problem-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: #f1f5f9;
}

.lmc-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.16rem 0.5rem;
  border-radius: 5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.lmc-tag.easy {
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.25);
}

.lmc-tag.medium {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
}

.lmc-tag.hard {
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.12);
  border-color: rgba(244, 63, 94, 0.25);
}

/* Responsive */
@media (max-width: 960px) {
  .lmc-layout-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .leetcode-mastery-card {
    padding: 1.15rem 1rem;
  }
  .lmc-difficulty-grid {
    grid-template-columns: 1fr;
  }
  .lmc-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .lmc-btn-inspect {
    width: 100%;
    justify-content: center;
  }
}
`;

// Replace from startIndex to end of file
const updatedContent = content.substring(0, startIndex) + (isCRLF ? newLeetCodeCSS.replace(/\n/g, '\r\n') : newLeetCodeCSS);

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Successfully updated journey.css with compact LeetCode styling');

