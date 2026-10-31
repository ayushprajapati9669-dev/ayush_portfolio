const fs = require('fs');
const path = require('path');

// 1. Update navbar.css
const cssPath = path.join(__dirname, '..', 'client', 'src', 'styles', 'navbar.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace nav-wrapper width
css = css.replace(/width: min\(1320px, 94vw\);/g, 'width: min(1360px, 94vw);');
css = css.replace(/max-width: 1320px;/g, 'max-width: 1360px;');

// Replace navbar padding
css = css.replace(
  'padding: 8px 14px 8px 20px;',
  'padding: 6px 14px 6px 18px;'
);

// Replace nav-link padding
css = css.replace(
  'padding: 8px 15px;',
  'padding: 7px 13px;'
);

// Replace btn-outline padding
css = css.replace(
  'padding: 8px 16px;',
  'padding: 7px 13px;'
);

// Replace btn-primary padding
css = css.replace(
  'padding: 8px 20px;',
  'padding: 7px 17px;'
);

// Theme selector max-width
if (!css.includes('max-width: 114px;')) {
  css = css.replace(
    'font-size: 0.75rem !important;\n  cursor: pointer !important;',
    'font-size: 0.72rem !important;\n  max-width: 114px !important;\n  cursor: pointer !important;'
  ).replace(
    'font-size: 0.75rem !important;\r\n  cursor: pointer !important;',
    'font-size: 0.72rem !important;\r\n  max-width: 114px !important;\r\n  cursor: pointer !important;'
  );
}

// Update media queries
const oldMedia = `@media (max-width: 768px) {
  .nav-logo-text {
    display: none !important;
  }
  .theme-selector {
    display: none !important;
  }
  .accent-picker-wrapper {
    display: none !important;
  }
  .btn-primary {
    display: none !important;
  }
  .navbar {
    padding: 6px 12px 6px 14px !important;
  }
  .nav-wrapper {
    width: 95vw !important;
    top: 12px !important;
  }
}`;

const newMedia = `@media (max-width: 1280px) {
  .cmd-kbd {
    display: none !important;
  }
  .nav-link {
    padding: 7px 10px !important;
    font-size: 12px !important;
    gap: 5px !important;
  }
  .nav-logo-text {
    font-size: 14.5px !important;
  }
}

@media (max-width: 1120px) {
  .theme-selector {
    max-width: 95px !important;
  }
  .btn-outline {
    padding: 7px 10px !important;
    font-size: 11.5px !important;
  }
  .btn-primary {
    padding: 7px 13px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 992px) {
  .nav-center {
    display: none !important;
  }
  .theme-selector {
    display: none !important;
  }
  .accent-picker-wrapper {
    display: none !important;
  }
  .btn-outline {
    display: none !important;
  }
  .mobile-nav-toggle {
    display: flex !important;
  }
}

@media (max-width: 768px) {
  .nav-logo-text {
    display: none !important;
  }
  .btn-primary {
    display: none !important;
  }
  .navbar {
    padding: 6px 12px 6px 14px !important;
  }
  .nav-wrapper {
    width: 95vw !important;
    top: 12px !important;
  }
}`;

const normalizeLf = (s) => s.replace(/\r\n/g, '\n');
let normCss = normalizeLf(css);
if (normCss.includes(normalizeLf(oldMedia))) {
  normCss = normCss.replace(normalizeLf(oldMedia), normalizeLf(newMedia));
} else {
  normCss += '\n' + normalizeLf(newMedia);
}

fs.writeFileSync(cssPath, normCss, 'utf8');
console.log('Successfully updated navbar.css');

// 2. Ensure Header.jsx has clean mobile drawer theme selector and no duplicate inside nav-center
const headerPath = path.join(__dirname, '..', 'client', 'src', 'components', 'layout', 'Header.jsx');
let headerContent = fs.readFileSync(headerPath, 'utf8');

// Ensure terminal button kbd hides on smaller screens
headerContent = headerContent.replace(
  '<span className="cmd-kbd hidden md:inline">Ctrl+~</span>',
  '<span className="cmd-kbd hidden xl:inline">Ctrl+~</span>'
);

// In mobile drawer links, add theme selector if not present
if (!headerContent.includes('className="mobile-drawer-theme-box"')) {
  const drawerAnchor = '<div className="mobile-drawer-links">';
  const drawerThemeBox = `<div className="mobile-drawer-links">
          <div className="mobile-drawer-theme-box mb-3 pb-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Theme Palette:</span>
            <select
              className="theme-selector-mobile text-xs py-1.5 px-3 rounded-lg bg-black/60 border border-white/20 text-white outline-none"
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              aria-label="Mobile Theme Selector"
            >
              <option value="theme-midnight">🌙 Midnight</option>
              <option value="theme-ocean">🌊 Ocean</option>
              <option value="theme-forest">🌲 Forest</option>
              <option value="theme-sunset">🌅 Sunset</option>
              <option value="theme-cyberpunk">⚡ Cyberpunk</option>
              <option value="theme-gold">👑 Luxury Gold</option>
              <option value="theme-dracula">🧛 Dracula</option>
              <option value="theme-nord">❄️ Nord Frost</option>
              <option value="theme-synthwave">👾 Synthwave 84</option>
              <option value="theme-tokyo">🌌 Tokyo Night</option>
            </select>
          </div>`;
  headerContent = headerContent.replace(drawerAnchor, drawerThemeBox);
}

fs.writeFileSync(headerPath, headerContent, 'utf8');
console.log('Successfully verified Header.jsx');

