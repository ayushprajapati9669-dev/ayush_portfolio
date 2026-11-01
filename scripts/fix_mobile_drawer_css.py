with open('client/src/styles/navbar.css', 'r', encoding='utf-8') as f:
    css = f.read()

mobile_drawer_css = """
/* Mobile Drawer System */
.mobile-drawer {
  position: fixed !important;
  inset: 0 !important;
  z-index: 10000 !important;
  background: rgba(8, 8, 8, 0.96) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 24px !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transform: translateY(-20px) !important;
  transition: opacity 0.25s ease, transform 0.25s ease !important;
}

.mobile-drawer.open {
  opacity: 1 !important;
  pointer-events: auto !important;
  transform: translateY(0) !important;
}

.mobile-drawer-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding-bottom: 20px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.mobile-drawer-links {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  padding: 24px 0 !important;
}

.mobile-drawer-link {
  font-family: 'Inter', sans-serif !important;
  font-size: 18px !important;
  color: #c9c2b8 !important;
  text-decoration: none !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 8px 0 !important;
}

.mobile-drawer-link.active {
  color: #f1eee8 !important;
  font-weight: 600 !important;
}

@media (min-width: 901px) {
  .mobile-drawer {
    display: none !important;
  }
}
"""

css += "\n" + mobile_drawer_css

with open('client/src/styles/navbar.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Added mobile-drawer fixed positioning to navbar.css")

