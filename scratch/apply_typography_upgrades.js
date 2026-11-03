const fs = require('fs');
const path = require('path');

// 1. UPDATE journey.css
{
  const filePath = path.resolve('client/src/styles/pages/journey.css');
  let c = fs.readFileSync(filePath, 'utf8');

  // Page header tagline
  c = c.replace(
    /\.journey-page \.page-tagline\s*\{[^}]*\}/s,
    `.journey-page .page-tagline {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #d4af37 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  margin-bottom: 16px !important;
  display: block !important;
}`
  );

  // Page title
  c = c.replace(
    /\.journey-page \.page-title\s*\{[^}]*\}/s,
    `.journey-page .page-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: clamp(2.4rem, 5vw, 4.2rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  color: #ffffff !important;
  line-height: 1.05 !important;
  margin: 0 0 20px 0 !important;
}`
  );

  // Page desc
  c = c.replace(
    /\.journey-page \.page-desc\s*\{[^}]*\}/s,
    `.journey-page .page-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 15px !important;
  color: #cbd5e1 !important;
  max-width: 680px !important;
  line-height: 1.65 !important;
  margin: 0 !important;
}`
  );

  // About card h3
  c = c.replace(
    /\.journey-page \.about-card h3\s*\{[^}]*\}/s,
    `.journey-page .about-card h3 {
  font-family: 'Cinzel', serif !important;
  font-size: 1.35rem !important;
  font-weight: 600 !important;
  color: #ffffff !important;
  margin: 0 0 24px 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  letter-spacing: 0.03em !important;
}`
  );

  // Education items
  c = c.replace(
    /\.journey-page \.edu-score\s*\{[^}]*\}/s,
    `.journey-page .edu-score {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 2rem !important;
  font-weight: 700 !important;
  color: #d4af37 !important;
  line-height: 1 !important;
  margin-bottom: 8px !important;
  display: flex !important;
  align-items: baseline !important;
  gap: 6px !important;
}`
  );

  c = c.replace(
    /\.journey-page \.edu-score span\s*\{[^}]*\}/s,
    `.journey-page .edu-score span {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  color: #a1a1aa !important;
  font-weight: 600 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
}`
  );

  c = c.replace(
    /\.journey-page \.edu-title\s*\{[^}]*\}/s,
    `.journey-page .edu-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 15.5px !important;
  font-weight: 600 !important;
  color: #f8fafc !important;
  letter-spacing: -0.01em !important;
  margin-bottom: 6px !important;
  line-height: 1.4 !important;
}`
  );

  c = c.replace(
    /\.journey-page \.edu-subtitle\s*\{[^}]*\}/s,
    `.journey-page .edu-subtitle {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 13.5px !important;
  color: #94a3b8 !important;
  line-height: 1.5 !important;
}`
  );

  // Timeline items
  c = c.replace(
    /\.journey-page \.timeline-year\s*\{[^}]*\}/s,
    `.journey-page .timeline-year {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  color: #d4af37 !important;
  font-weight: 600 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  margin-bottom: 6px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}`
  );

  c = c.replace(
    /\.journey-page \.timeline-title\s*\{[^}]*\}/s,
    `.journey-page .timeline-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 1.18rem !important;
  font-weight: 700 !important;
  letter-spacing: -0.015em !important;
  color: #ffffff !important;
  margin-bottom: 6px !important;
  line-height: 1.35 !important;
}`
  );

  c = c.replace(
    /\.journey-page \.timeline-desc\s*\{[^}]*\}/s,
    `.journey-page .timeline-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 14px !important;
  color: #cbd5e1 !important;
  line-height: 1.65 !important;
}`
  );

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Updated journey.css fonts successfully');
}

// 2. UPDATE about.css (Spotlight Card typography used in Journey)
{
  const filePath = path.resolve('client/src/styles/pages/about.css');
  let c = fs.readFileSync(filePath, 'utf8');

  // .spotlight-card .card-label
  c = c.replace(
    /\.spotlight-card \.card-label\s*\{[^}]*\}/s,
    `.spotlight-card .card-label {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #d4af37 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
}`
  );

  // .spotlight-card .content-title
  c = c.replace(
    /\.spotlight-card \.content-title\s*\{[^}]*\}/s,
    `.spotlight-card .content-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 1.45rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  line-height: 1.25 !important;
  letter-spacing: -0.02em !important;
  margin: 0 !important;
}`
  );

  // .spotlight-card .spotlight-summary-text
  c = c.replace(
    /\.spotlight-card \.spotlight-summary-text\s*\{[^}]*\}/s,
    `.spotlight-card .spotlight-summary-text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 14.5px !important;
  line-height: 1.65 !important;
  color: #cbd5e1 !important;
  margin: 0 !important;
}`
  );

  // .spotlight-card .metric-label
  c = c.replace(
    /\.spotlight-card \.metric-label\s*\{[^}]*\}/s,
    `.spotlight-card .metric-label {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #94a3b8 !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}`
  );

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Updated about.css spotlight card fonts successfully');
}

// 3. UPDATE skills.css
{
  const filePath = path.resolve('client/src/styles/pages/skills.css');
  let c = fs.readFileSync(filePath, 'utf8');

  // Eyebrow / tagline
  c = c.replace(
    /\.skills-page \.page-eyebrow,\s*\.skills-page \.page-tagline\s*\{[^}]*\}/s,
    `.skills-page .page-eyebrow,
.skills-page .page-tagline {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #d4af37 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  margin-bottom: 16px !important;
  display: block !important;
}`
  );

  // Page title
  c = c.replace(
    /\.skills-page \.page-title\s*\{[^}]*\}/s,
    `.skills-page .page-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: clamp(2.4rem, 5vw, 4.2rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  color: #ffffff !important;
  line-height: 1.05 !important;
  margin-bottom: 20px !important;
}`
  );

  // Page desc
  c = c.replace(
    /\.skills-page \.page-desc\s*\{[^}]*\}/s,
    `.skills-page .page-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 15px !important;
  color: #cbd5e1 !important;
  max-width: 680px !important;
  line-height: 1.65 !important;
  margin: 0 !important;
}`
  );

  // Filter button
  c = c.replace(
    /\.filter-btn\s*\{[^}]*font-family:\s*'Inter'[^}]*\}/s,
    `.filter-btn {
  background: transparent !important;
  border: none !important;
  color: #a1a1aa !important;
  padding: 0.5rem 1.2rem !important;
  border-radius: 100px !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 0.88rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em !important;
  cursor: pointer !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  white-space: nowrap !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}`
  );

  // Filter count
  c = c.replace(
    /\.filter-btn \.count,\s*\.filter-btn \.filter-count\s*\{[^}]*\}/s,
    `.filter-btn .count,
.filter-btn .filter-count {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.76rem !important;
  padding: 0.15rem 0.5rem !important;
  border-radius: 100px !important;
  background: rgba(255, 255, 255, 0.12) !important;
  font-weight: 700 !important;
  transition: background 0.25s, color 0.25s !important;
}`
  );

  // Search input
  c = c.replace(
    /\.skills-search-input\s*\{[^}]*\}/s,
    `.skills-search-input {
  width: 100% !important;
  background: rgba(18, 18, 22, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  padding: 0.65rem 1rem 0.65rem 2.45rem !important;
  border-radius: 100px !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 0.88rem !important;
  font-weight: 400 !important;
  outline: none !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}`
  );

  // Skill Name
  c = c.replace(
    /\.skill-name\s*\{[^}]*\}/s,
    `.skill-name {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 0.94rem !important;
  font-weight: 600 !important;
  color: #f1f5f9 !important;
  transition: color 0.25s ease, text-shadow 0.25s ease !important;
  white-space: nowrap !important;
  letter-spacing: -0.015em !important;
}`
  );

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Updated skills.css fonts successfully');
}

// 4. UPDATE projects.css & cards.css
{
  const filePath = path.resolve('client/src/styles/pages/projects.css');
  let c = fs.readFileSync(filePath, 'utf8');

  // Eyebrow
  c = c.replace(
    /\.projects-page \.page-eyebrow,\s*\.projects-page \.page-tagline\s*\{[^}]*\}/s,
    `.projects-page .page-eyebrow,
.projects-page .page-tagline {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #d4af37 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  margin-bottom: 16px !important;
  display: block !important;
}`
  );

  // Page title
  c = c.replace(
    /\.projects-page \.page-title\s*\{[^}]*\}/s,
    `.projects-page .page-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: clamp(2.4rem, 5vw, 4.2rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  color: #ffffff !important;
  line-height: 1.05 !important;
  margin-bottom: 20px !important;
}`
  );

  // Page desc
  c = c.replace(
    /\.projects-page \.page-desc\s*\{[^}]*\}/s,
    `.projects-page .page-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 15px !important;
  color: #cbd5e1 !important;
  line-height: 1.65 !important;
  max-width: 620px !important;
}`
  );

  // Project card desc
  c = c.replace(
    /\.project-card-desc\s*\{[^}]*\}/s,
    `.project-card-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 13.5px !important;
  font-weight: 400 !important;
  color: #cbd5e1 !important;
  line-height: 1.65 !important;
  letter-spacing: -0.005em !important;
}`
  );

  // Search input
  c = c.replace(
    /\.project-search-input\s*\{[^}]*\}/s,
    `.project-search-input {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 9px 14px 9px 34px !important;
  color: #ffffff !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 13px !important;
  outline: none !important;
  width: 240px !important;
  transition: border-color 0.2s ease !important;
}`
  );

  c = c.replace(
    /\.projects-page \.search-input\s*\{[^}]*\}/s,
    `.projects-page .search-input {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 8px !important;
  padding: 9px 14px 9px 34px !important;
  color: #ffffff !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 13px !important;
  outline: none !important;
  width: 240px !important;
  transition: border-color 0.2s ease !important;
}`
  );

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Updated projects.css fonts successfully');
}

// UPDATE cards.css for project cards
{
  const filePath = path.resolve('client/src/styles/components/cards.css');
  let c = fs.readFileSync(filePath, 'utf8');

  // .project-title
  c = c.replace(
    /\.project-title\s*\{[^}]*\}/s,
    `.project-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 1.28rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  letter-spacing: -0.02em !important;
  line-height: 1.25 !important;
  margin: 0 0 8px !important;
  transition: color 0.2s ease !important;
}`
  );

  // .project-desc
  c = c.replace(
    /\.project-desc\s*\{[^}]*\}/s,
    `.project-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 13.5px !important;
  font-weight: 400 !important;
  color: #cbd5e1 !important;
  line-height: 1.65 !important;
  margin: 0 0 12px !important;
  letter-spacing: -0.005em !important;
  display: -webkit-box;`
  );

  // .p-badge
  c = c.replace(
    /\.p-badge\s*\{[^}]*\}/s,
    `.p-badge {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  background: rgba(0, 0, 0, 0.75) !important;
  color: #cbd5e1 !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 9999px !important;
  padding: 3px 10px !important;
  backdrop-filter: blur(8px) !important;
}`
  );

  // .project-num
  c = c.replace(
    /\.project-num\s*\{[^}]*\}/s,
    `.project-num {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 0.14em !important;
  text-transform: uppercase !important;
  color: #d4af37 !important;
}`
  );

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Updated cards.css project card fonts successfully');
}

// 5. UPDATE certificates.css
{
  const filePath = path.resolve('client/src/styles/pages/certificates.css');
  let c = fs.readFileSync(filePath, 'utf8');

  // Page header tagline
  c = c.replace(
    /\.certificates-page \.page-tagline\s*\{[^}]*\}/s,
    `.certificates-page .page-tagline {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #d4af37 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  margin-bottom: 16px !important;
  display: block !important;
}`
  );

  // Page title
  c = c.replace(
    /\.certificates-page \.page-title\s*\{[^}]*\}/s,
    `.certificates-page .page-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: clamp(2.4rem, 5vw, 4.2rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  color: #ffffff !important;
  line-height: 1.05 !important;
  margin: 0 0 20px 0 !important;
}`
  );

  // Page desc
  c = c.replace(
    /\.certificates-page \.page-desc\s*\{[^}]*\}/s,
    `.certificates-page .page-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 15px !important;
  color: #cbd5e1 !important;
  line-height: 1.65 !important;
  max-width: 620px !important;
}`
  );

  // Issuer
  c = c.replace(
    /\.cert-issuer\s*\{[^}]*\}/s,
    `.cert-issuer {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  color: #d4af37 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
}`
  );

  // Year
  c = c.replace(
    /\.cert-year\s*\{[^}]*\}/s,
    `.cert-year {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #94a3b8 !important;
}`
  );

  // Category badge
  c = c.replace(
    /\.cert-category-badge\s*\{[^}]*\}/s,
    `.cert-category-badge {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  padding: 2px 8px !important;
  background: rgba(212, 175, 55, 0.08) !important;
  border: 1px solid rgba(212, 175, 55, 0.22) !important;
  border-radius: 999px !important;
  color: #d4af37 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
}`
  );

  // Title
  c = c.replace(
    /\.cert-title\s*\{[^}]*\}/s,
    `.cert-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  text-transform: capitalize !important;
  letter-spacing: -0.02em !important;
  line-height: 1.3 !important;
  margin: 0 !important;
  transition: color 0.2s ease !important;
}`
  );

  // Desc
  c = c.replace(
    /\.cert-desc\s*\{[^}]*\}/s,
    `.cert-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  color: #cbd5e1 !important;
  line-height: 1.65 !important;
  flex: 1 !important;
}`
  );

  // View button
  c = c.replace(
    /\.btn-view\s*\{[^}]*\}/s,
    `.btn-view {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 8px 16px !important;
  background: #d4af37 !important;
  color: #000000 !important;
  border: 1px solid #d4af37 !important;
  border-radius: 8px !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  letter-spacing: 0.03em !important;
  cursor: pointer !important;
  transition: all 0.22s ease !important;
}`
  );

  // Verified badge
  c = c.replace(
    /\.verified-badge\s*\{[^}]*font-family:\s*'JetBrains Mono'[^}]*\}/s,
    `.verified-badge {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11.5px !important;
  font-weight: 700 !important;
  color: #4ade80 !important;
  background: rgba(74, 222, 128, 0.08) !important;
  border: 1px solid rgba(74, 222, 128, 0.2) !important;
  border-radius: 999px !important;
  padding: 3px 10px !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase !important;
}`
  );

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Updated certificates.css fonts successfully');
}

// 6. UPDATE contact.css
{
  const filePath = path.resolve('client/src/styles/pages/contact.css');
  let c = fs.readFileSync(filePath, 'utf8');

  // Page header tagline
  c = c.replace(
    /\.contact-page \.page-tagline\s*\{[^}]*\}/s,
    `.contact-page .page-tagline {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #d4af37 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  margin-bottom: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
}`
  );

  // Page title
  c = c.replace(
    /\.contact-page \.page-title\s*\{[^}]*\}/s,
    `.contact-page .page-title {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
  font-size: clamp(2.4rem, 5vw, 4.2rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  color: #ffffff !important;
  line-height: 1.1 !important;
  margin-bottom: 16px !important;
}`
  );

  // Page desc
  c = c.replace(
    /\.contact-page \.page-desc\s*\{[^}]*\}/s,
    `.contact-page .page-desc {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 15px !important;
  color: #cbd5e1 !important;
  line-height: 1.65 !important;
  max-width: 620px !important;
}`
  );

  // Card title
  c = c.replace(
    /\.contact-page \.card-title\s*\{[^}]*\}/s,
    `.contact-page .card-title {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  letter-spacing: -0.02em !important;
  margin-bottom: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}`
  );

  // Form label
  c = c.replace(
    /\.form-label\s*\{[^}]*\}/s,
    `.form-label {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #e2e8f0 !important;
  letter-spacing: 0.01em !important;
}`
  );

  // Form control
  c = c.replace(
    /\.form-control\s*\{[^}]*\}/s,
    `.form-control {
  width: 100% !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 12px !important;
  padding: 13px 16px !important;
  color: #ffffff !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important;
  outline: none !important;
  resize: vertical !important;
}`
  );

  // Form control placeholder
  c = c.replace(
    /\.form-control::placeholder\s*\{[^}]*\}/s,
    `.form-control::placeholder {
  color: #64748b !important;
  font-size: 13.5px !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
}`
  );

  // Field hint
  c = c.replace(
    /\.field-hint\s*\{[^}]*\}/s,
    `.field-hint {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 12px !important;
  color: #94a3b8 !important;
}`
  );

  // Char count
  c = c.replace(
    /\.char-count\s*\{[^}]*\}/s,
    `.char-count {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  color: #94a3b8 !important;
}`
  );

  // Field error message
  c = c.replace(
    /\.field-error-message\s*\{[^}]*\}/s,
    `.field-error-message {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #f87171 !important;
  margin-top: 4px !important;
}`
  );

  // Submit button
  c = c.replace(
    /\.btn-send\s*\{[^}]*\}/s,
    `.btn-send {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  width: 100% !important;
  padding: 14px 24px !important;
  background: linear-gradient(135deg, #d4af37 0%, #c49f2b 100%) !important;
  color: #050608 !important;
  border: 1px solid #d4af37 !important;
  border-radius: 12px !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  letter-spacing: 0.03em !important;
  cursor: pointer !important;
  transition: all 0.25s ease !important;
  margin-top: 8px !important;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25) !important;
}`
  );

  // Info label
  c = c.replace(
    /\.info-text \.label\s*\{[^}]*\}/s,
    `.info-text .label {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  color: #d4af37 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
}`
  );

  // Info value
  c = c.replace(
    /\.info-text \.value\s*\{[^}]*\}/s,
    `.info-text .value {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 14.5px !important;
  font-weight: 600 !important;
  color: #ffffff !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  word-break: break-word !important;
}`
  );

  // Info sub-info
  c = c.replace(
    /\.info-text \.sub-info\s*\{[^}]*\}/s,
    `.info-text .sub-info {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 13px !important;
  color: #cbd5e1 !important;
  line-height: 1.5 !important;
}`
  );

  // Social header h4
  c = c.replace(
    /\.social-header h4\s*\{[^}]*\}/s,
    `.social-header h4 {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
}`
  );

  // Social header span
  c = c.replace(
    /\.social-header span\s*\{[^}]*\}/s,
    `.social-header span {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
  color: #94a3b8 !important;
}`
  );

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Updated contact.css fonts successfully');
}

