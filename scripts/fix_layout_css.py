
# Comprehensive fix for contact page, project card, and about page styling
import os

STYLES_DIR = r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\styles\pages"

# ─── CONTACT.CSS ─────────────────────────────────────────────────────────────
contact_css_extra = """
/* ==========================================================================
   VSLFlow Contact Page - Full Layout System
   ========================================================================== */

.contact-page .page-header {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px) 64px;
}

.contact-page .header-orb {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%);
  border-radius: 50%;
  position: absolute;
  top: 60px;
  right: 120px;
  pointer-events: none;
}

.contact-grid {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(20px, 5vw, 64px) 120px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
  align-items: start;
}

@media (max-width: 900px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}

/* Glass card - form container */
.glass-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  padding: 40px !important;
  transition: border-color 0.3s ease !important;
}

.glass-card:hover {
  border-color: rgba(212, 175, 55, 0.15) !important;
}

.glass-card .card-title {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: 1.4rem !important;
  font-weight: 400 !important;
  color: #ffffff !important;
  margin-bottom: 28px !important;
  letter-spacing: -0.01em !important;
}

/* Form layout */
.contact-form {
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
}

.form-row {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 16px !important;
}

@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr !important; }
}

.form-group {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
}

.form-label {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
  color: #666666 !important;
  display: flex !important;
  gap: 4px !important;
}

.label-req {
  color: #d4af37 !important;
}

/* Form controls */
.form-control {
  width: 100% !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
  border-radius: 10px !important;
  padding: 13px 16px !important;
  color: #ffffff !important;
  font-family: 'Jost', sans-serif !important;
  font-size: 14px !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
  outline: none !important;
  resize: vertical !important;
}

.form-control:focus {
  border-color: rgba(212, 175, 55, 0.4) !important;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.06) !important;
}

.form-control.error {
  border-color: rgba(239, 68, 68, 0.4) !important;
}

.form-control::placeholder {
  color: #3a3a3a !important;
}

textarea.form-control {
  min-height: 120px !important;
}

.field-error-message {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-family: 'Jost', sans-serif !important;
  font-size: 11px !important;
  color: #ef4444 !important;
  margin-top: 4px !important;
}

/* Char count */
.char-count {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 10px !important;
  color: #444444 !important;
  text-align: right !important;
}

.char-count.warn { color: #d4af37 !important; }
.char-count.over { color: #ef4444 !important; }

/* Submit button */
.contact-submit-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  width: 100% !important;
  padding: 15px 28px !important;
  background: #d4af37 !important;
  color: #000000 !important;
  border: none !important;
  border-radius: 10px !important;
  font-family: 'Jost', sans-serif !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em !important;
  cursor: pointer !important;
  transition: all 0.22s ease !important;
  margin-top: 8px !important;
}

.contact-submit-btn:hover {
  background: #e8c84a !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 8px 28px rgba(212, 175, 55, 0.3) !important;
}

.contact-submit-btn:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

/* Status banners */
.contact-status-banner {
  display: flex !important;
  align-items: flex-start !important;
  gap: 14px !important;
  padding: 16px 20px !important;
  border-radius: 12px !important;
  margin-bottom: 20px !important;
}

.contact-status-banner.success {
  background: rgba(74, 222, 128, 0.06) !important;
  border: 1px solid rgba(74, 222, 128, 0.2) !important;
}

.contact-status-banner.error {
  background: rgba(239, 68, 68, 0.06) !important;
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

.contact-status-banner .banner-icon {
  font-size: 20px !important;
  flex-shrink: 0 !important;
  margin-top: 1px !important;
}

.contact-status-banner.success .banner-icon { color: #4ade80 !important; }
.contact-status-banner.error .banner-icon { color: #ef4444 !important; }

.contact-status-banner .banner-content h4 {
  font-family: 'Jost', sans-serif !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #ffffff !important;
  margin-bottom: 4px !important;
}

.contact-status-banner .banner-content p {
  font-size: 12px !important;
  color: #888888 !important;
  line-height: 1.6 !important;
}

/* Info sidebar */
.contact-info-section {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
}

.info-section-title {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 10px !important;
  color: #d4af37 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
  margin-bottom: 4px !important;
}

.info-section-subtitle {
  font-family: 'Jost', sans-serif !important;
  font-size: 12px !important;
  color: #555555 !important;
  margin-bottom: 8px !important;
}

.social-profile-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 10px !important;
  margin-top: 4px !important;
}

.social-profile-btn {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 10px 14px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  border-radius: 8px !important;
  font-family: 'Jost', sans-serif !important;
  font-size: 12px !important;
  color: #aaaaaa !important;
  text-decoration: none !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
}

.social-profile-btn:hover {
  border-color: rgba(212, 175, 55, 0.25) !important;
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.05) !important;
}
"""

# ─── PROJECT CARD IMAGE FIX ─────────────────────────────────────────────────
projects_css_extra = """
/* Fix project card image overflow */
.project-img-wrap,
.project-card-img-wrap {
  height: 200px !important;
  max-height: 200px !important;
  overflow: hidden !important;
  position: relative !important;
}

.project-img-wrap img,
.project-card-img-wrap img,
.project-card img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
}

/* Fix featured/flagship project card image */
.flagship-project-card .project-img-wrap,
.featured-project .project-img-wrap {
  height: 280px !important;
  max-height: 280px !important;
}

/* Search input */
.project-search-input {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 10px 16px !important;
  color: #ffffff !important;
  font-family: 'Jost', sans-serif !important;
  font-size: 13px !important;
  outline: none !important;
  width: 300px !important;
  transition: border-color 0.2s ease !important;
}

.project-search-input:focus {
  border-color: rgba(212, 175, 55, 0.3) !important;
}

.project-search-input::placeholder {
  color: #3a3a3a !important;
}

/* Projects grid */
.projects-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)) !important;
  gap: 24px !important;
  margin-top: 32px !important;
}
"""

# ─── ABOUT PAGE FIX ──────────────────────────────────────────────────────────
about_css_extra = """
/* About page full layout fix */
.about-page {
  background: #000000 !important;
  min-height: 100vh !important;
  padding-top: 120px !important;
}

.about-page .page-header {
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 0 clamp(20px, 5vw, 64px) 64px !important;
}

.about-page section,
.about-page .about-section,
.about-page .content-section {
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 0 clamp(20px, 5vw, 64px) 80px !important;
}

/* About grid */
.about-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 48px !important;
  align-items: start !important;
}

@media (max-width: 768px) {
  .about-grid { grid-template-columns: 1fr !important; }
}

/* Bio card */
.about-bio-card {
  background: rgba(255,255,255,0.02) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  border-radius: 16px !important;
  padding: 32px !important;
}

.about-bio-card h3 {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: 1.3rem !important;
  font-weight: 400 !important;
  color: #ffffff !important;
  margin-bottom: 16px !important;
}

.about-bio-card p {
  font-family: 'Jost', sans-serif !important;
  font-size: 14px !important;
  line-height: 1.8 !important;
  color: #888888 !important;
}

/* Profile image */
.about-portrait {
  width: 100% !important;
  max-width: 480px !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
}

.about-portrait img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
"""

for fname, extra in [
    ("contact.css", contact_css_extra),
    ("projects.css", projects_css_extra),
    ("about.css", about_css_extra),
]:
    fpath = os.path.join(STYLES_DIR, fname)
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        existing = f.read()
    
    # Append only if marker not already present
    marker = "/* VSLFlow Extended Layout */"
    if marker not in existing:
        new_content = existing.rstrip() + "\n\n" + marker + "\n" + extra
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"EXTENDED: {fname}")
    else:
        print(f"ALREADY EXTENDED: {fname}")

