spotlight_css = """
/* ==========================================================================
   Milestone Spotlight Slider — Luxury Black-Gold Editorial Architecture
   ========================================================================== */

.spotlight-card {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  transition: all 0.28s ease !important;
  margin-top: 20px !important;
}

.spotlight-card:hover {
  border-color: rgba(212, 175, 55, 0.3) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7) !important;
}

.spotlight-card .card-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 20px 28px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.spotlight-card .card-label {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  color: #d4af37 !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
}

.spotlight-card .icon-box {
  width: 28px !important;
  height: 28px !important;
  border-radius: 6px !important;
  background: rgba(212, 175, 55, 0.1) !important;
  border: 1px solid rgba(212, 175, 55, 0.25) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #d4af37 !important;
  font-size: 12px !important;
}

.spotlight-card .controls {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

.spotlight-card .counter {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  color: #777777 !important;
}

.spotlight-card .btn-circle {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #a0a0a0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  font-size: 11px !important;
  transition: all 0.2s ease !important;
}

.spotlight-card .btn-circle:hover {
  background: rgba(212, 175, 55, 0.12) !important;
  border-color: rgba(212, 175, 55, 0.35) !important;
  color: #d4af37 !important;
}

/* Card Content: 2 Columns */
.spotlight-card .card-content {
  display: grid !important;
  grid-template-columns: 460px 1fr !important;
  gap: 32px !important;
  padding: 28px !important;
  align-items: start !important;
}

@media (max-width: 960px) {
  .spotlight-card .card-content {
    grid-template-columns: 1fr !important;
  }
}

/* Left Column: Image */
.spotlight-card .left-col {
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
}

.spotlight-card .image-wrapper {
  width: 100% !important;
  height: 280px !important;
  max-height: 280px !important;
  border-radius: 14px !important;
  overflow: hidden !important;
  position: relative !important;
  background: #0a0a0a !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
}

.spotlight-card .image-wrapper img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}

.spotlight-card .gold-badge {
  position: absolute !important;
  top: 12px !important;
  left: 12px !important;
  background: rgba(0, 0, 0, 0.8) !important;
  border: 1px solid rgba(212, 175, 55, 0.4) !important;
  border-radius: 999px !important;
  padding: 4px 12px !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 10px !important;
  color: #d4af37 !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  backdrop-filter: blur(8px) !important;
}

.spotlight-card .hd-btn {
  position: absolute !important;
  bottom: 12px !important;
  right: 12px !important;
  background: rgba(0, 0, 0, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 999px !important;
  padding: 4px 10px !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 9px !important;
  color: #cccccc !important;
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
  backdrop-filter: blur(8px) !important;
}

.spotlight-card .thumbnail-row {
  display: flex !important;
  gap: 10px !important;
}

.spotlight-card .thumb {
  width: 64px !important;
  height: 44px !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  cursor: pointer !important;
  opacity: 0.6 !important;
  transition: all 0.2s ease !important;
}

.spotlight-card .thumb.active,
.spotlight-card .thumb:hover {
  opacity: 1 !important;
  border-color: #d4af37 !important;
}

.spotlight-card .thumb img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

.spotlight-card .quick-links {
  display: flex !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
}

.spotlight-card .q-link {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 6px 12px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  font-family: 'Jost', sans-serif !important;
  font-size: 11.5px !important;
  color: #a0a0a0 !important;
  text-decoration: none !important;
  transition: all 0.2s ease !important;
}

.spotlight-card .q-link:hover {
  background: rgba(212, 175, 55, 0.08) !important;
  border-color: rgba(212, 175, 55, 0.3) !important;
  color: #d4af37 !important;
}

/* Right Column: Details */
.spotlight-card .right-col {
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
}

.spotlight-card .title-top {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.spotlight-card .tags {
  display: flex !important;
  gap: 8px !important;
}

.spotlight-card .tag {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 9.5px !important;
  padding: 3px 9px !important;
  border-radius: 999px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
}

.spotlight-card .tag-pink {
  background: rgba(212, 175, 55, 0.1) !important;
  border: 1px solid rgba(212, 175, 55, 0.25) !important;
  color: #d4af37 !important;
}

.spotlight-card .tag-gray {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #777777 !important;
}

.spotlight-card .action-icons {
  display: flex !important;
  gap: 6px !important;
}

.spotlight-card .btn-icon {
  width: 30px !important;
  height: 30px !important;
  border-radius: 50% !important;
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #777777 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  font-size: 11px !important;
  transition: all 0.2s ease !important;
}

.spotlight-card .btn-icon:hover {
  color: #d4af37 !important;
  border-color: rgba(212, 175, 55, 0.3) !important;
}

.spotlight-card .title-main h2 {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: 1.8rem !important;
  font-weight: 400 !important;
  color: #ffffff !important;
  letter-spacing: -0.015em !important;
  line-height: 1.2 !important;
  margin: 0 !important;
}

.spotlight-card .title-main p {
  font-family: 'Jost', sans-serif !important;
  font-size: 13.5px !important;
  color: #888888 !important;
  line-height: 1.6 !important;
  margin: 6px 0 0 0 !important;
}

.spotlight-card .three-pillars,
.spotlight-card .pillars-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 12px !important;
  margin-top: 6px !important;
}

@media (max-width: 600px) {
  .spotlight-card .three-pillars,
  .spotlight-card .pillars-grid {
    grid-template-columns: 1fr !important;
  }
}

.spotlight-card .pillar-box {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 10px !important;
  padding: 12px !important;
}

.spotlight-card .pillar-box h5 {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 9.5px !important;
  color: #d4af37 !important;
  text-transform: uppercase !important;
  margin: 0 0 4px 0 !important;
  letter-spacing: 0.06em !important;
}

.spotlight-card .pillar-box p {
  font-family: 'Jost', sans-serif !important;
  font-size: 12px !important;
  color: #888888 !important;
  line-height: 1.4 !important;
  margin: 0 !important;
}

.spotlight-card .btn-deep-dive {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 10px 20px !important;
  background: #d4af37 !important;
  color: #000000 !important;
  border-radius: 8px !important;
  font-family: 'Jost', sans-serif !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.22s ease !important;
  align-self: flex-start !important;
  margin-top: 6px !important;
}

.spotlight-card .btn-deep-dive:hover {
  background: #e8c84a !important;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3) !important;
  transform: translateY(-1px) !important;
}
"""

with open(r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\styles\pages\about.css", 'a', encoding='utf-8') as f:
    f.write("\n" + spotlight_css)
print("Appended spotlight_css to about.css")
