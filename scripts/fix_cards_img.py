
# Append image constraint fixes to cards.css
extra = """
/* ========================================================================
   Project Card Image Height Constraints — Critical Fix
   ======================================================================== */

/* Wrap the image in an anchor tag with class 'project-img-wrap' */
a.project-img-wrap {
  display: block !important;
  height: 200px !important;
  max-height: 200px !important;
  min-height: 200px !important;
  overflow: hidden !important;
  position: relative !important;
  flex-shrink: 0 !important;
}

a.project-img-wrap picture {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}

a.project-img-wrap img,
a.project-img-wrap picture img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center top !important;
  aspect-ratio: unset !important;  /* override inline style */
}

/* The project card itself must be flex column */
article.project-card {
  display: flex !important;
  flex-direction: column !important;
}

/* Card badges overlay */
.project-badges {
  position: absolute !important;
  top: 12px !important;
  left: 12px !important;
  display: flex !important;
  gap: 6px !important;
  flex-wrap: wrap !important;
  z-index: 2 !important;
}

.p-badge {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 9px !important;
  padding: 3px 10px !important;
  border-radius: 999px !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase !important;
  background: rgba(0,0,0,0.75) !important;
  color: #aaaaaa !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  backdrop-filter: blur(4px) !important;
}

.p-badge.case-study {
  background: rgba(212, 175, 55, 0.15) !important;
  border-color: rgba(212, 175, 55, 0.3) !important;
  color: #d4af37 !important;
}

.p-badge.live {
  background: rgba(74, 222, 128, 0.12) !important;
  border-color: rgba(74, 222, 128, 0.25) !important;
  color: #4ade80 !important;
}

/* Project content area */
.project-content {
  padding: 20px !important;
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
}

.project-meta {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.project-num {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 9px !important;
  color: #444444 !important;
  letter-spacing: 0.1em !important;
}

.project-link-hint {
  font-family: 'Jost', sans-serif !important;
  font-size: 10px !important;
  color: #333333 !important;
  transition: color 0.2s ease !important;
}

.project-card:hover .project-link-hint {
  color: #d4af37 !important;
}

.project-title {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: 1.35rem !important;
  font-weight: 400 !important;
  color: #ffffff !important;
  letter-spacing: -0.01em !important;
  line-height: 1.2 !important;
}

.project-desc {
  font-family: 'Jost', sans-serif !important;
  font-size: 12.5px !important;
  color: #555555 !important;
  line-height: 1.65 !important;
  flex: 1 !important;
}

.tech-stack {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
}

.tech-chip {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  padding: 3px 9px !important;
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  border-radius: 4px !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 9px !important;
  color: #555555 !important;
  letter-spacing: 0.04em !important;
}

/* Card action buttons */
.project-actions {
  display: flex !important;
  gap: 8px !important;
  margin-top: 12px !important;
}

.project-btn {
  flex: 1 !important;
  padding: 9px 14px !important;
  border-radius: 8px !important;
  font-family: 'Jost', sans-serif !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  text-decoration: none !important;
  transition: all 0.2s ease !important;
  border: none !important;
  cursor: pointer !important;
}

.project-btn.primary {
  background: #d4af37 !important;
  color: #000000 !important;
}

.project-btn.primary:hover {
  background: #e8c84a !important;
  box-shadow: 0 4px 16px rgba(212,175,55,0.25) !important;
}

.project-btn.secondary {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: #888888 !important;
}

.project-btn.secondary:hover {
  border-color: rgba(212,175,55,0.2) !important;
  color: #cccccc !important;
}
"""

with open(r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\styles\components\cards.css", 'r', encoding='utf-8', errors='replace') as f:
    existing = f.read()

marker = "/* Project Card Image Height Constraints"
if marker not in existing:
    with open(r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\styles\components\cards.css", 'w', encoding='utf-8') as f:
        f.write(existing.rstrip() + "\n" + extra)
    print("cards.css extended with image constraints")
else:
    print("Already has image constraints")

