
certs_extra = """
/* ========================================================================
   Certificates Page - Full Layout
   ======================================================================== */

.certificates-page {
  min-height: 100vh !important;
  background: #000000 !important;
  padding-top: 120px !important;
}

.certificates-page .page-header {
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 0 clamp(20px, 5vw, 64px) 56px !important;
}

.certificates-page .page-tagline {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 10px !important;
  color: #d4af37 !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  margin-bottom: 16px !important;
  display: block !important;
}

.certificates-page .page-title {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: clamp(3rem, 7vw, 6rem) !important;
  font-weight: 300 !important;
  letter-spacing: -0.03em !important;
  color: #ffffff !important;
  line-height: 0.95 !important;
  margin-bottom: 20px !important;
}

.certificates-page .page-desc {
  font-family: 'Jost', sans-serif !important;
  font-size: 14px !important;
  color: #666666 !important;
  line-height: 1.7 !important;
  max-width: 560px !important;
}

/* Cert grid */
.cert-grid {
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 0 clamp(20px, 5vw, 64px) 120px !important;
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important;
  gap: 24px !important;
}

/* Cert card */
.cert-card {
  background: rgba(255,255,255,0.02) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
  display: flex !important;
  flex-direction: column !important;
}

.cert-card:hover {
  border-color: rgba(212,175,55,0.3) !important;
  transform: translateY(-4px) !important;
  box-shadow: 0 16px 48px rgba(212,175,55,0.08) !important;
}

/* Cert image */
.cert-img-wrap {
  height: 180px !important;
  max-height: 180px !important;
  overflow: hidden !important;
  position: relative !important;
  background: rgba(255,255,255,0.03) !important;
  flex-shrink: 0 !important;
}

.cert-img-wrap img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
}

/* Cert body */
.cert-body {
  padding: 20px !important;
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
}

.cert-card-title {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  font-size: 1.25rem !important;
  font-weight: 400 !important;
  color: #ffffff !important;
  letter-spacing: -0.01em !important;
  line-height: 1.25 !important;
}

.cert-card-issuer {
  font-family: 'Jost', sans-serif !important;
  font-size: 12px !important;
  color: #d4af37 !important;
  letter-spacing: 0.04em !important;
}

.cert-card-date {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 10px !important;
  color: #444444 !important;
  letter-spacing: 0.06em !important;
}

.cert-skills {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 9px !important;
  color: #555555 !important;
  letter-spacing: 0.06em !important;
  line-height: 1.6 !important;
  flex: 1 !important;
}

/* Cert actions */
.cert-actions {
  display: flex !important;
  gap: 8px !important;
  margin-top: 8px !important;
}

.cert-view-btn {
  font-family: 'Jost', sans-serif !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  color: #d4af37 !important;
  background: rgba(212,175,55,0.07) !important;
  border: 1px solid rgba(212,175,55,0.18) !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
  transition: all 0.22s ease !important;
  cursor: pointer !important;
  text-decoration: none !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

.cert-view-btn:hover {
  background: rgba(212,175,55,0.14) !important;
  border-color: rgba(212,175,55,0.35) !important;
  color: #e8c84a !important;
  transform: translateY(-1px) !important;
}

.cert-gold-accent { color: #d4af37 !important; }
"""

with open(r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\styles\pages\certificates.css", 'r', encoding='utf-8', errors='replace') as f:
    existing = f.read()

marker = "/* Certificates Page - Full Layout */"
if marker not in existing:
    with open(r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\styles\pages\certificates.css", 'w', encoding='utf-8') as f:
        f.write(existing.rstrip() + "\n\n" + certs_extra)
    print("Extended certificates.css")
else:
    print("Already extended")

