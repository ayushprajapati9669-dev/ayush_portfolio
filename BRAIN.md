# BRAIN.md — Project Architecture, Refactor Audit & Verification Memory

## 1. Architecture Refactor Summary
- Reorganized `argonPortfolio` into the target modular `client/`, `server/`, and `docs/` folder structure.
- Removed the unused 3D Globe component (`client/src/components/InteractiveGlobe.jsx`), unused 3D dependencies (`three`, `@react-three/fiber`, `@react-three/drei`, `motion`), unused server middleware packages (`cors`, `helmet`, `cookie-parser`, `express-rate-limit`, `multer`), stale HTML build copies (`client/dist/index.html`, `client/public/index.html`, root `index.html`), and unused `globeEnabled` schema/setting fields.
- Preserved all working UI features: GSAP `ScrollTrigger` animations, `PortraitParticles` canvas dissolve, `DeveloperWorkbench`, cosmic 4-tab `InteractiveSkillsWidget`, `ProjectCard` (Airbnb Clone), `CertificateCard` + `CertificateLightboxModal` (Apna College Delta Certificate), `ResumeModal`, validated `ContactPage`, and protected `AdminPage` CMS with Cloudinary & MongoDB integration.

## 2. Visual System & Tokens
- **Palette** (`client/src/styles/variables.css` & `client/tailwind.config.js`):
  - `--bg-obsidian`: `#080B14`
  - `--bg-charcoal`: `#0E1322`
  - `--bg-graphite`: `#141B2D`
  - `--text-alabaster`: `#F8FAFC`
  - `--text-stone`: `#94A3B8`
  - `--accent-vermilion`: `#FF6B4A`
  - `--accent-amber`: `#F59E0B`
  - `--accent-sage`: `#10B981`
  - `--accent-cyan`: `#00D4FF`
- **Typography**:
  - Display: `Outfit`, `Space Grotesk`
  - Body: `Plus Jakarta Sans`, `Inter`
  - Monospace: `JetBrains Mono`

## 3. Verification Checklist
- [x] Audit existing frontend, backend, components, routes, imports, dependencies, assets, and configurations
- [x] Verify and remove unused `InteractiveGlobe.jsx` (`Glob.jsx`) and unused dependencies
- [x] Reorganize frontend into `app/`, `assets/`, `components/`, `pages/`, `hooks/`, `services/`, `styles/`, `utils/`, `main.jsx`
- [x] Reorganize backend into `config/`, `routes/`, `controllers/`, `middleware/`, `models/`, `repositories/`, `services/`, `validators/`, `utils/`, `app.js`, `index.js`
- [x] Verify all relative imports, CSS imports, and backend automated tests (`9/9 passed`)
