# Ayush Prajapati — Full-Stack MERN Developer Portfolio (`argonPortfolio`)

An art-directed, full-stack developer portfolio built for **Ayush Prajapati** (Computer Science & Engineering undergraduate at SISTec, Bhopal · CGPA: 8.42).

## 1. Overview & Implemented Capabilities

- **Modern Mesh & Glassmorphic Design System**: Deep obsidian (`#080B14`), charcoal (`#0E1322`), alabaster (`#F8FAFC`), cyan glow (`#00D4FF`), and vermilion (`#FF6B4A`) palette with `Outfit`, `Plus Jakarta Sans`, `Space Grotesk`, and `JetBrains Mono` typography.
- **Real Image-to-Particle Portrait Dissolve (`PortraitParticles.jsx`)**:
  - Samples actual RGBA pixel data from an offscreen canvas (`ctx.getImageData`) and transitions smoothly between the high-resolution portrait and interactive particle dispersion.
  - Respects `prefers-reduced-motion` and includes an interactive `Particle FX` / `Photo View` toggle.
- **Interactive Developer Workbench & Bento Cards (`DeveloperWorkbench.jsx`)**:
  - Live code snippet runner (`ayushResume.js`, `mongoCloudinary.js`), copy-to-clipboard support, live IST (`Asia/Kolkata`) clock, and interactive achievement/focus switcher.
- **Complete Public Pages (`client/src/pages/`)**:
  - `/` (`Home/Home.jsx`) — Hero stage, scrolling marquee, portrait particle engine, developer workbench, bento introduction, interactive cosmic skills tabs, featured live projects, verified certificates, academic journey, and resume CTA.
  - `/about` (`About/About.jsx`) — Academic profile (B.Tech CSE at SISTec, Bhopal — 8.42 CGPA; Class XII — 83.5%), achievements, and resume preview/download.
  - `/skills` (`Skills/Skills.jsx`) — 4-tab interactive skill selector (`Languages`, `Frontend`, `Backend`, `Tools & Others`) with authentic SVG logos.
  - `/projects` & `/certificates` (`Projects/Projects.jsx`) — Live deployed project cards (`Airbnb Clone` with live Render deployment and GitHub links), category filter, keyword search, and interactive certificate lightbox with zoom controls.
  - `/contact` (`Contact/Contact.jsx`) — Field-validated contact form with MongoDB/JSON store persistence and direct contact links.
  - `*` (`NotFound/NotFound.jsx`) — Custom 404 route.
- **Protected Admin CMS & Backend Security (`Admin/Admin.jsx` & `server/src/`)**:
  - Full CRUD for Projects, Certificates, Skills, Profile & Resume, Hero Portrait, Contact Messages, and Password/Database settings with Cloudinary image upload support.
  - Server-side `scrypt` password hashing, `HttpOnly; SameSite=Strict` session cookies, `X-CSRF-Token` verification, brute-force rate limiting (`429`), input sanitization, and magic-byte image verification.

## 2. Refactored Folder Architecture

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the complete directory tree, [`docs/API.md`](./docs/API.md) for API endpoint documentation, and [`docs/SETUP.md`](./docs/SETUP.md) for local setup instructions.

## 3. Quick Start

```bash
# Run backend & security test suite
npm test

# Seed portfolio database
npm run seed

# Start backend server (http://localhost:5000)
npm run dev:server

# Start frontend dev server (http://localhost:5173)
npm run dev:client
```
