with open('client/src/styles/components/editorial-hero.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Update proportions in hero-editorial-stage
css = css.replace(
    """/* --- HERO STAGE --- */
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
}""",
    """/* --- HERO STAGE --- */
.hero-editorial-stage {
  position: relative;
  height: 100vh;
  min-height: 780px;
  max-height: 1080px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 85px clamp(24px, 5vw, 64px) 18px;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
  box-sizing: border-box;
  background: #030303;
}"""
)

# Update portrait stage
css = css.replace(
    """.hero-portrait-stage {
  position: relative;
  width: min(440px, 82vw);
  height: min(450px, 46vh);
  margin: 0 auto -24px;""",
    """.hero-portrait-stage {
  position: relative;
  width: min(520px, 86vw);
  height: min(410px, 44vh);
  margin: 0 auto -42px;"""
)

# Update sub-eyebrow and name
css = css.replace(
    """.hero-sub-eyebrow {
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
}""",
    """.hero-sub-eyebrow {
  position: relative;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #bbbbbb;
  margin-top: 0;
  margin-bottom: 6px;
  z-index: 3;
}"""
)

css = css.replace(
    """.hero-name-editorial {
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
}""",
    """.hero-name-editorial {
  position: relative;
  font-family: 'Instrument Serif', Georgia, serif !important;
  font-size: clamp(66px, 8.2vw, 138px) !important;
  font-weight: 400 !important;
  line-height: 1.01 !important;
  letter-spacing: -0.06em !important;
  color: #f1eee8 !important;
  margin: -8px 0 14px !important;
  text-shadow: 0 4px 45px rgba(0, 0, 0, 0.95);
  z-index: 3;
}"""
)

css = css.replace(
    """.hero-narrative-editorial {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #aaa9a4;
  max-width: 540px;
  margin: 0 auto 24px;
  z-index: 2;
}""",
    """.hero-narrative-editorial {
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  line-height: 1.55;
  color: #aaa9a4;
  max-width: 520px;
  margin: 0 auto 18px;
  z-index: 2;
}"""
)

css = css.replace(
    """.hero-actions-editorial {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: nowrap;
  z-index: 2;
}""",
    """.hero-actions-editorial {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: nowrap;
  z-index: 2;
  margin-bottom: 8px;
}"""
)

css = css.replace(
    """.hero-bottom-footer {
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
}""",
    """.hero-bottom-footer {
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
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-weight: 400;
}"""
)

with open('client/src/styles/components/editorial-hero.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated client/src/styles/components/editorial-hero.css proportions")

