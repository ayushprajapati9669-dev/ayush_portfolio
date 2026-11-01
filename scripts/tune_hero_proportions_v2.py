with open('client/src/styles/components/editorial-hero.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace hero-editorial-stage padding & height
css = css.replace(
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
}""",
    """/* --- HERO STAGE --- */
.hero-editorial-stage {
  position: relative;
  height: 100vh;
  min-height: 680px;
  max-height: 980px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 80px clamp(24px, 5vw, 64px) 16px;
  max-width: 1400px;
  margin: 0 auto;
  overflow: hidden;
  box-sizing: border-box;
  background: #030303;
}"""
)

# Replace portrait stage height
css = css.replace(
    """.hero-portrait-stage {
  position: relative;
  width: min(520px, 86vw);
  height: min(410px, 44vh);
  margin: 0 auto -42px;""",
    """.hero-portrait-stage {
  position: relative;
  width: min(480px, 80vw);
  height: min(340px, 38vh);
  margin: 0 auto -32px;"""
)

# Replace name font size
css = css.replace(
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
}""",
    """.hero-name-editorial {
  position: relative;
  font-family: 'Instrument Serif', Georgia, serif !important;
  font-size: clamp(56px, 7.5vw, 120px) !important;
  font-weight: 400 !important;
  line-height: 1.01 !important;
  letter-spacing: -0.06em !important;
  color: #f1eee8 !important;
  margin: -6px 0 12px !important;
  text-shadow: 0 4px 45px rgba(0, 0, 0, 0.95);
  z-index: 3;
}"""
)

# Narrative margin
css = css.replace(
    """.hero-narrative-editorial {
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  line-height: 1.55;
  color: #aaa9a4;
  max-width: 520px;
  margin: 0 auto 18px;
  z-index: 2;
}""",
    """.hero-narrative-editorial {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: #aaa9a4;
  max-width: 500px;
  margin: 0 auto 16px;
  z-index: 2;
}"""
)

with open('client/src/styles/components/editorial-hero.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated editorial-hero.css with compact 100vh proportions")

