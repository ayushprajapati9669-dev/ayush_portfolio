import re

with open('client/src/styles/components/editorial-hero.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace the hero stage and typography styles up to line ~330
hero_styles = """/* ==========================================================================
   Obsidian Dark Editorial Hero (Sarthak Sharma 1:1 Architectural Design System)
   - Instrument Serif Giant Headline (Upright First Name, Italic Last Name)
   - Pure Pitch Black #030303 Void with Subtle 4-Column Architectural Grid
   - High-Contrast Monochrome Portrait with Warm Amber Rim Light (#ff8c59)
   - Pill Link & Underline Interactive CTAs
   ========================================================================== */

/* --- HERO STAGE --- */
.hero-editorial-stage {
  position: relative;
  min-height: 96vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 110px clamp(24px, 5vw, 64px) 24px;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
  box-sizing: border-box;
  background: #030303;
}

@media (max-width: 768px) {
  .hero-editorial-stage {
    min-height: auto;
    padding: 100px 18px 24px;
    gap: 32px;
  }
}

/* Background vertical architectural guidelines */
.hero-editorial-guides {
  position: absolute;
  inset: 104px clamp(24px, 5vw, 64px) 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(204, 220, 245, 0.12) 1px, transparent 1px);
  background-size: 25% 100%;
  opacity: 0.22;
  -webkit-mask-image: linear-gradient(#000, transparent 92%);
  mask-image: linear-gradient(#000, transparent 92%);
  border: none;
  z-index: 0;
}

.hero-editorial-guides div {
  display: none;
}

/* Top Meta Row */
.hero-top-meta {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #a0a0a0;
  font-weight: 400;
}

.hero-meta-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-meta-dot {
  color: #ff8c59;
  font-size: 0.55rem;
  display: inline-block;
  box-shadow: 0 0 10px rgba(255, 140, 89, 0.45);
}

.hero-meta-right {
  color: #a0a0a0;
  font-weight: 400;
}

@media (max-width: 640px) {
  .hero-top-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    font-size: 8px;
  }
}

/* Center Stage */
.hero-center-showcase {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: auto 0;
  padding: 10px 0;
}

/* Mid-Left Presence Meta (Desktop) */
.hero-presence-strip {
  position: absolute;
  left: 0;
  top: 38%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 65px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 1.4px;
  line-height: 1.8;
  color: #a39b93;
  text-transform: uppercase;
  z-index: 3;
}

.presence-num {
  color: #ff8c59;
  font-weight: 500;
  position: relative;
}

.presence-plus {
  position: absolute;
  top: 32px;
  left: 0;
  color: #ff8c59;
  font-size: 20px;
  line-height: 1;
}

.presence-word {
  color: #a39b93;
  line-height: 1.8;
  font-weight: 400;
}

@media (max-width: 1024px) {
  .hero-presence-strip {
    display: none;
  }
}

/* Portrait Stage (Seamless vignette emerging from #030303 black) */
.hero-portrait-stage {
  position: relative;
  width: min(440px, 82vw);
  height: min(450px, 46vh);
  margin: 0 auto -24px;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Ambient Backlight Glow - removed for crisp pure obsidian void */
.hero-portrait-stage::before {
  display: none !important;
}

/* Clean Editorial Portrait */
.hero-portrait-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center top;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
  filter: none !important;
  mask-image: none !important;
  -webkit-mask-image: none !important;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.hero-portrait-stage:hover .hero-portrait-img {
  transform: scale(1.02);
}

/* Sub-eyebrow right above huge name */
.hero-sub-eyebrow {
  position: relative;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #bbbbbb;
  margin-top: 4px;
  margin-bottom: 8px;
  z-index: 3;
}

/* Large Editorial Name Typography (Instrument Serif) */
.hero-name-editorial {
  position: relative;
  font-family: 'Instrument Serif', Georgia, serif !important;
  font-size: clamp(72px, 8.5vw, 146px) !important;
  font-weight: 400 !important;
  line-height: 1.02 !important;
  letter-spacing: -0.06em !important;
  color: #f1eee8 !important;
  margin: 0 0 16px !important;
  text-shadow: 0 4px 45px rgba(0, 0, 0, 0.95);
  z-index: 3;
}

.hero-name-editorial .name-first {
  font-style: normal;
  color: #f1eee8;
  font-weight: 400;
}

.hero-name-editorial .name-last {
  font-style: italic;
  font-weight: 400;
  background: linear-gradient(110deg, #f1f1f1, silver);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 0.12em;
}

/* Subtitle Narrative */
.hero-narrative-editorial {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #aaa9a4;
  max-width: 540px;
  margin: 0 auto 24px;
  z-index: 2;
}

/* Actions CTA (Sarthak Sharma Pill + Text Link) */
.hero-actions-editorial {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: nowrap;
  z-index: 2;
}

.hero-btn-work {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 12px 22px;
  border-radius: 9999px;
  background: rgba(19, 19, 19, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.18);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: #f1eee8;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  white-space: nowrap;
}

.hero-btn-work:hover {
  background: #ff8c59;
  border-color: #ff8c59;
  color: #0c0c0c;
  transform: translateY(-2px);
}

.hero-btn-talk {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #aaa9a4;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  padding: 6px 0;
  border: none;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 0;
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.hero-btn-talk:hover {
  color: #ff8c59;
  border-color: #ff8c59;
  gap: 14px;
}

/* Bottom Footer Row */
.hero-bottom-footer {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #999999;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-weight: 400;
}

.hero-footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
"""

# Keep the remaining showcase / horizontal scroll styles (from line 330 onwards)
split_point = css.find("/* --- HORIZONTAL SHOWCASE CAROUSEL (Projects & Certificates) --- */")
if split_point != -1:
    remaining_styles = css[split_point:]
    new_css = hero_styles + "\n" + remaining_styles
    with open('client/src/styles/components/editorial-hero.css', 'w', encoding='utf-8') as f:
        f.write(new_css)
    print("Successfully updated client/src/styles/components/editorial-hero.css")
else:
    print("Could not find split point")
