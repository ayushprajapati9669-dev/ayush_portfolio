# Architecture Overview — `argonPortfolio`

## 1. High-Level Structure

`argonPortfolio` is organized as a modular full-stack workspace separating the React/Vite frontend (`client/`), the Node.js/MongoDB/Cloudinary backend (`server/`), and project documentation (`docs/`).

```text
argonPortfolio/
├── client/
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx
│   │   │   ├── router.jsx
│   │   │   └── providers/
│   │   │       ├── AuthProvider.jsx
│   │   │       └── ThemeProvider.jsx
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── ui/
│   │   │   ├── particles/
│   │   │   └── projects/
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── About/
│   │   │   ├── Skills/
│   │   │   ├── Projects/
│   │   │   ├── Contact/
│   │   │   ├── NotFound/
│   │   │   └── Admin/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   ├── layout.css
│   │   │   ├── components/
│   │   │   └── pages/
│   │   ├── utils/
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── server/
│   ├── data/
│   ├── scripts/
│   ├── uploads/
│   ├── tests/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── index.js
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── SETUP.md
├── .env.example
├── .gitignore
├── BRAIN.md
├── README.md
└── package.json
```

## 2. Frontend Architecture (`client/`)

- **Providers (`src/app/providers/`)**:
  - `ThemeProvider.jsx`: Manages portfolio state hydration (`/api/public/bootstrap` + `localStorage`), MongoDB state synchronization (`/api/portfolio/sync`), toast notifications, confirmation dialogs, Resume modal, and Certificate Lightbox state.
  - `AuthProvider.jsx`: Manages Admin CMS session state, SHA-256 / scrypt authentication, brute-force lockout protection, and password reset/update flows.
- **Routing (`src/app/router.jsx`)**:
  - Maps `/`, `/about`, `/skills`, `/projects`, `/projects/:slug`, `/certificates`, `/contact`, `/admin/*`, and `*` (`NotFound`), triggering GSAP `ScrollTrigger` reveal animations on route transitions.
- **Components (`src/components/`)**:
  - `layout/`: Sticky glassmorphic `Header.jsx` and `Footer.jsx`.
  - `particles/`: `PortraitParticles.jsx` (real RGBA canvas pixel-to-particle dissolve engine).
  - `projects/`: `ProjectCard.jsx` and `CertificateCard.jsx`.
  - `ui/`: `DeveloperWorkbench.jsx`, `InteractiveSkillsWidget.jsx`, `ResumeModal.jsx`, `CertificateLightboxModal.jsx`, `ConfirmModal.jsx`, and `Toast.jsx`.
  - `common/`: `TechLogos.jsx` (official SVG brand icons and social buttons).

## 3. Backend Architecture (`server/`)

- **Controllers (`src/controllers/`)**: `publicController.js`, `authController.js`, and `adminController.js`.
- **Routes (`src/routes/`)**: `publicRoutes.js`, `authRoutes.js`, `adminRoutes.js`, and `index.js`.
- **Repositories (`src/repositories/portfolioRepository.js`)**: Atomic JSON document store and MongoDB state persistence (`PortfolioDataStore`).
- **Middleware (`src/middleware/`)**: `authMiddleware.js` (`HttpOnly` cookie session + `X-CSRF-Token` enforcement), `rateLimitMiddleware.js` (`MemoryRateLimiter`), and `securityMiddleware.js`.
- **Services & Validators (`src/services/`, `src/validators/`)**: `cryptoService.js` (`scrypt` hashing + HMAC token signing), `mediaService.js` (local & Cloudinary uploads), and `portfolioValidators.js` (input sanitization & magic-byte image verification).
