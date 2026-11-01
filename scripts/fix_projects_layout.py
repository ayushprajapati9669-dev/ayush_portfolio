
projects_layout = """
/* ── Projects page layout overrides ── */

.projects-page .page-header {
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 0 clamp(20px, 5vw, 64px) 40px !important;
}

.projects-page .toolbar {
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 0 clamp(20px, 5vw, 64px) !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex-wrap: wrap !important;
  margin-bottom: 32px !important;
}

.projects-page .filters {
  display: flex !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
}

.projects-page .search-wrap {
  position: relative !important;
  margin-left: auto !important;
}

.projects-page .search-wrap i {
  position: absolute !important;
  left: 12px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  color: #444444 !important;
  font-size: 12px !important;
  pointer-events: none !important;
}

.projects-page .search-input {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 8px !important;
  padding: 9px 14px 9px 34px !important;
  color: #ffffff !important;
  font-family: 'Jost', sans-serif !important;
  font-size: 13px !important;
  outline: none !important;
  width: 240px !important;
  transition: border-color 0.2s ease !important;
}

.projects-page .search-input:focus {
  border-color: rgba(212,175,55,0.3) !important;
}

.projects-page .search-input::placeholder { color: #333333 !important; }

/* Project grid */
.project-grid {
  max-width: 1280px !important;
  margin: 0 auto !important;
  padding: 0 clamp(20px, 5vw, 64px) 120px !important;
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)) !important;
  gap: 24px !important;
}
"""

with open(r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\styles\pages\projects.css", 'r', encoding='utf-8', errors='replace') as f:
    existing = f.read()

marker = "/* Projects page layout overrides */"
if marker not in existing:
    with open(r"d:\MY_PROJECT\FULL_STACK_PROJECT\ayush_portfolio_main\client\src\styles\pages\projects.css", 'w', encoding='utf-8') as f:
        f.write(existing.rstrip() + "\n\n" + projects_layout)
    print("Extended projects.css with grid layout")
else:
    print("Already has layout")

