with open('client/src/styles/navbar.css', 'r', encoding='utf-8') as f:
    nav_css = f.read()

# Remove the conflicting block (lines ~1000-1068)
marker_start = "Modern Navbar Styling (Cyan Accent + Inter Typography)"
idx_start = nav_css.find(marker_start)
if idx_start != -1:
    idx_end = nav_css.find("Public Site Navbar (Sarthak Sharma 1:1 Floating Glass Capsule)")
    if idx_end != -1:
        # replace from idx_start - 75 to idx_end
        cut_start = nav_css.rfind("/* =", 0, idx_start)
        nav_css = nav_css[:cut_start] + nav_css[idx_end - 75:]

# Update the public site navbar styles at the bottom
public_nav_v2 = """/* =========================================================================
   Public Site Navbar (Sarthak Sharma 1:1 Floating Glass Capsule)
   ========================================================================= */
body:not(.has-admin-sidebar) .nav-wrapper {
  width: min(1120px, 94vw) !important;
  max-width: 1120px !important;
  top: 16px !important;
}

body:not(.has-admin-sidebar) .nav-wrapper.scrolled {
  top: 12px !important;
}

body:not(.has-admin-sidebar) .nav-beam,
body:not(.has-admin-sidebar) .nav-beam-clip {
  display: none !important;
}

body:not(.has-admin-sidebar) .nav-beam-container {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
  border-radius: 9999px !important;
}

body:not(.has-admin-sidebar) .navbar {
  background: rgba(17, 16, 15, 0.78) !important;
  backdrop-filter: blur(20px) saturate(135%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(135%) !important;
  border: 1px solid rgba(231, 225, 213, 0.17) !important;
  border-radius: 9999px !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.1), inset 0 -1px rgba(255, 255, 255, 0.04), 0 12px 36px rgba(0, 0, 0, 0.5) !important;
  height: 62px !important;
  padding: 0 16px 0 24px !important;
}

body:not(.has-admin-sidebar) .nav-logo-box {
  display: none !important;
}

body:not(.has-admin-sidebar) .nav-logo-text {
  font-family: 'Instrument Serif', Georgia, serif !important;
  font-size: 24px !important;
  font-weight: 400 !important;
  color: #f1eee8 !important;
  letter-spacing: -0.02em !important;
}

body:not(.has-admin-sidebar) .nav-center {
  background: transparent !important;
  border: none !important;
  gap: 2px !important;
  box-shadow: none !important;
}

body:not(.has-admin-sidebar) .active-pill,
.active-pill {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

body:not(.has-admin-sidebar) .nav-link {
  font-family: 'Inter', sans-serif !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #c9c2b8 !important;
  padding: 8px 14px !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  background: transparent !important;
}

body:not(.has-admin-sidebar) .nav-link i {
  display: none !important;
}

body:not(.has-admin-sidebar) .nav-link:hover {
  color: #fff5e5 !important;
  background: rgba(233, 227, 213, 0.08) !important;
}

body:not(.has-admin-sidebar) .nav-link.active {
  color: #fff5e5 !important;
  background: rgba(233, 227, 213, 0.12) !important;
}

body:not(.has-admin-sidebar) .btn-primary {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #f1eee8 !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  border-radius: 9999px !important;
  padding: 9px 20px !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.25) !important;
  transition: all 0.25s ease !important;
}

body:not(.has-admin-sidebar) .btn-primary:hover {
  background: #ff8c59 !important;
  border-color: #ff8c59 !important;
  color: #0c0c0c !important;
  transform: translateY(-2px) !important;
}

body:not(.has-admin-sidebar) .btn-primary:hover i {
  color: #0c0c0c !important;
}

body:not(.has-admin-sidebar) .btn-outline {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #aaa9a4 !important;
  font-size: 11.5px !important;
  padding: 7px 12px !important;
  border-radius: 9999px !important;
}

body:not(.has-admin-sidebar) .btn-outline:hover {
  border-color: rgba(255, 255, 255, 0.28) !important;
  color: #f1eee8 !important;
  background: rgba(255, 255, 255, 0.08) !important;
}
"""

marker_v1 = "Public Site Navbar (Sarthak Sharma 1:1 Floating Glass Capsule)"
idx_v1 = nav_css.find(marker_v1)
if idx_v1 != -1:
    cut_v1 = nav_css.rfind("/* =", 0, idx_v1)
    nav_css = nav_css[:cut_v1] + public_nav_v2
else:
    nav_css += "\n" + public_nav_v2

with open('client/src/styles/navbar.css', 'w', encoding='utf-8') as f:
    f.write(nav_css)

print("Updated client/src/styles/navbar.css")

