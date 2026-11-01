public_navbar_css = """
/* =========================================================================
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
  background: rgba(17, 16, 15, 0.75) !important;
  backdrop-filter: blur(20px) saturate(135%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(135%) !important;
  border: 1px solid rgba(231, 225, 213, 0.17) !important;
  border-radius: 9999px !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.1), inset 0 -1px rgba(255, 255, 255, 0.04), 0 12px 36px rgba(0, 0, 0, 0.5) !important;
  height: 64px !important;
  padding: 0 16px 0 24px !important;
}

body:not(.has-admin-sidebar) .nav-logo-box {
  display: none !important;
}

body:not(.has-admin-sidebar) .nav-logo-text {
  font-family: 'Instrument Serif', Georgia, serif !important;
  font-size: 23px !important;
  font-weight: 400 !important;
  color: #f1eee8 !important;
  letter-spacing: -0.02em !important;
}

body:not(.has-admin-sidebar) .nav-center {
  background: transparent !important;
  border: none !important;
  gap: 2px !important;
}

body:not(.has-admin-sidebar) .active-pill {
  display: none !important;
}

body:not(.has-admin-sidebar) .nav-link {
  font-family: 'Inter', sans-serif !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #c9c2b8 !important;
  padding: 8px 14px !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

body:not(.has-admin-sidebar) .nav-link i {
  display: none !important;
}

body:not(.has-admin-sidebar) .nav-link:hover,
body:not(.has-admin-sidebar) .nav-link.active {
  color: #fff5e5 !important;
  background: rgba(233, 227, 213, 0.08) !important;
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

with open('client/src/styles/navbar.css', 'a', encoding='utf-8') as f:
    f.write(public_navbar_css)

print("Appended public_navbar_css to client/src/styles/navbar.css")

