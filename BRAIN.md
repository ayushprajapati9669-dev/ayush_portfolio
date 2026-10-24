# BRAIN.md — Comprehensive Project Architecture & Feature Directory

> **Ayush Prajapati's Portfolio Ecosystem**  
> Modern Full-Stack Developer Portfolio & Cloud-Integrated CMS Suite  
> **Last Verified & Audited**: October 2026

---

## 1. System Architecture & Tech Stack

### 1.1 Frontend Architecture (`client/`)
- **Runtime & Framework**: React 18 (`^18.3.1`) + Vite (`^5.4.2`) with ES Modules.
- **Routing**: React Router DOM v6 (`^6.26.1`) with dynamic route parameter handling, custom scroll resets, and route guards.
- **Animations & Physics**:
  - **GSAP 3** (`gsap`, `ScrollTrigger`) for choreographed timeline entrances, page transitions, and ScrollTrigger reveals.
  - **3D Card Tilt Physics**: Custom mouse-tracking transform perspective (`rotateX`, `rotateY`) on cards, header, and workbench.
  - **Magnetic Physics**: Smooth elastic magnetic pull on buttons, social icons, and interactive pills.
  - **Sound Design**: Custom interactive audio engine (`playTick`) for haptic auditory feedback on user actions.
- **Styling & Design System**:
  - Dark-mode palette: Obsidian (`#080B14`), Charcoal (`#0E1322`), Graphite (`#141B2D`), Alabaster (`#F8FAFC`), Stone (`#94A3B8`).
  - Accent colors: Cyan Glow (`#00D4FF`), Deep Cyan (`#06B6D4`), Emerald (`#10B981`), Purple (`#A855F7`), Amber (`#F59E0B`), Vermilion (`#FF6B4A`).
  - Typography: `Outfit`, `Space Grotesk` (Display & Headings), `Plus Jakarta Sans`, `Inter` (Body), `JetBrains Mono` (Code & Badges).
  - Glassmorphism & Liquid Droplet Effects with dynamic SVG filters and radial background orbs.
  - FontAwesome 6 icons + official Devicon SVG integration.

### 1.2 Backend Architecture (`server/`)
- **Runtime**: Native Node.js HTTP server without bloated external dependencies.
- **Persistence & Synchronization**:
  - Primary persistent data store in `server/data/portfolio.json`.
  - MongoDB Atlas live synchronization capability via `/api/portfolio/sync`.
- **Security & Protection**:
  - `setSecurityHeaders`: Strict Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS.
  - `MemoryRateLimiter`: Sliding-window brute force protection:
    - `/api/auth/login`: 5 failed attempts per 15-minute window.
    - `/api/public/contact`: 5 messages per hour per IP.
  - Path-traversal proof static asset serving for `/uploads/`.
  - CSRF Token verification and HMAC-based admin session token management.

---

## 2. Public Features (Visitor & Recruiter Experience)

### 2.1 Navigation & Global Header (`Header.jsx`)
- **Monogram Brand Box**: Displays dynamic monogram initial (`AP`) with glowing cyan border and profile name.
- **Sliding Liquid Pill Navigation**:
  - Centered navigation links: `Home`, `About`, `Skills`, `Projects`, `Certificates`.
  - Smooth double-pill sliding animation calculated via GSAP and element bounding rectangles.
  - Auto-recalculates on browser resize and route changes.
  - Active dot indicator on current page link.
- **3D Tilt & Scroll Elevation**:
  - Mousemove 3D perspective tilt across the entire navigation bar.
  - Dynamic scroll detection that shrinks padding and deepens background opacity on scroll.
- **Resume Modal Trigger**: "Resume" button with external square icon opening the interactive `ResumeModal`.
- **Hire / Connect CTA**: Direct button linking to `/contact` (with `/connect` and `/hire` route aliases).
- **Responsive Mobile Navigation Drawer**:
  - Mobile hamburger toggle with smooth slide-in glass drawer.
  - Brand header, full navigation links, resume shortcut, and Hire CTA.
- **Admin CMS Quick Access**: Visible shortcut to `/admin` when authenticated or on admin paths.
- **Global Command Palette (⌘K / Ctrl+K)**: Quick keyboard search shortcut to trigger command palette across pages.

### 2.2 Hero Section (`Home.jsx`)
- **Dynamic Profile Header**:
  - Live eyebrow tag (e.g. `COMPUTER SCIENCE STUDENT · DEVELOPER`).
  - Profile displayName with glowing text accents.
  - Rotating headline highlighting full-stack engineering & algorithmic problem solving.
- **Interactive Portrait Canvas (`PortraitParticles.jsx`)**:
  - High-performance canvas particle system rendering Ayush's hero portrait.
  - Interactive mouse proximity particle dispersion and smooth elastic spring-back assembly.
- **Interactive Developer Workbench (`DeveloperWorkbench.jsx`)**:
  - Multi-tab code snippet runner (MERN Stack Architecture, DSA Problem Solving, AI Agent Integrations).
  - Realistic macOS window chrome with red, yellow, green control dots.
  - Live clock indicator with IST/UTC/Local time.
  - Syntax-highlighted code editor with 1-click clipboard copy.
  - "Run Code" interactive simulation revealing output console with execution metrics.
  - Current Focus badge pill with quick-cycle button.
- **Call-to-Action Buttons**:
  - "Explore Projects" magnetic button with smooth page transition.
  - "Hire / Connect" button linking directly to the validated contact interface.
- **Continuous Technology Marquee**:
  - Doubled infinite smooth-scroll marquee displaying all active skill badges with official brand icons.

### 2.3 About Page & Academic Roadmap (`About.jsx`)
- **Header & Direct Channels**:
  - Header with dynamic Eyebrow and Page Title.
  - Quick contact items: Direct email (`mailto:`), phone (`tel:`), and "Get In Touch" button.
- **Top Section**:
  - **About & Academic Profile Card**: Dynamically maps narrative biography paragraphs from CMS state.
  - **Profile Card with Animated Avatar Ring**: Circular glowing ring displaying Ayush's portrait with monogram fallback, college degree (`B.Tech CSE`), institute (`SISTec, Bhopal`), CGPA (`8.42`), and magnetic social icons (GitHub, LinkedIn, Instagram).
- **Bottom Section**:
  - **Education Qualifications Card**:
    - College: Cumulative CGPA (`8.42`), Degree (`B.Tech in Computer Science and Engineering`), Institute (`SISTec`).
    - Higher Secondary: Percentage (`80%`), Board (`MP Board Class XII`), School (`Kasturba Vidhya Mandir`).
  - **Achievements & Journey Timeline Card**:
    - Chronological roadmap with glowing vertical neon guide and animated dots.
    - Displays Phase category, Year badge (`Year 3`, `Year 1-2`, `Present`, `2023 - 2027`), Title, and detailed learnings description.
    - Status badges (`Completed`, `Current Focus`, `Target`).
    - Achievement metric badges (e.g., `8.42 CGPA`, `Production Grade`).
    - Acquired technology tag chips (`React JS`, `Node.js`, `DSA`, `Python`, etc.).
- **3D Card Physics**: Every card features realistic mouse-tracking 3D tilt with elastic return.

### 2.4 Skills & Interactive Widget (`Skills.jsx` & `InteractiveSkillsWidget.jsx`)
- **4-Category Cosmic Skill Matrix**:
  - Tabs: `Languages`, `Frontend`, `Backend`, `Database`, `Dev Tools`.
  - Dynamically loaded from backend CMS state with automatic fallback to reference dataset.
- **Visual Icon Mapper (`getSkillVisuals`)**:
  - Matches skill names to official Devicon SVGs and classes.
  - Handles invert filters for dark-mode contrast (e.g., Express.js, Next.js, GitHub).
- **Interactive Search Filter**: Instant real-time search across skills with clear button.
- **Standalone Page & Home Embedding**: Reusable across both dedicated `/skills` page and Home page sections.

### 2.5 Projects Gallery (`Projects.jsx` & `ProjectCard.jsx`)
- **Showcase Gallery**:
  - Flagship projects: *Airbnb Clone Platform*, *AI Conversational Workspace*, *Zerodha Trading Dashboard*, *Modern E-Commerce Storefront*.
- **Category Filter Pills**: Quick filter by `All`, `Full-Stack`, `Frontend`, `AI / ML`.
- **Search Filtering**: Live search by project title, description, or technology tag.
- **Project Cards**:
  - High-resolution thumbnail with smooth hover zoom.
  - Category badge, feature pill, and project title.
  - **Case Study Badge (`📖 Case Study`)**: Rendered automatically on cards for projects with rich case study data.
  - Tech stack tags with official brand icons.
  - **Action Links**:
    - **Read Case Study → Button (`.btn-case-study`)**: Directly routes to `/projects/:slug`.
    - **Live Demo Link** (with external link icon).
    - **GitHub Repository Link** (with brand icon).
- **Slug-Based Routing (`/projects/:slug`)**: Direct URL routing for individual project case studies with fallback lookup by slug or ID.

### 2.5.1 In-Depth Case Study Page (`ProjectDetail.jsx`)
- **Visual Design & High-Contrast Layout**:
  - **Opaque Obsidian Surfaces (`#0B1120`)**: Deep solid card background that completely eliminates background 3D canvas sphere bleed-through and ensures perfect contrast.
  - **High-Contrast Typography**: Crisp `#FFFFFF` headings, `#F8FAFC` alabaster body text, `#38BDF8` cyan highlights and inline code pills.
  - **Sticky Sub-Navigation Bar**: Glassmorphic pill bar pinned below global header (`top: 96px`) with active section tracking (`Overview`, `Problem`, `Approach`, `Tech Decisions`, `Results & Metrics`, `Architecture`, `Learnings`, `Live Demo`).
- **Comprehensive Case Study Architecture**:
  1. **Hero Section**: High-resolution cover banner with gradient fade, category badge, dynamic reading time badge, project title, overview summary, and 4-fact metadata strip (Role, Architecture stack, Deployment status, Open source repository).
  2. **The Problem Statement**: Highlight callout box with core challenge excerpt + markdown-rendered deep dive.
  3. **My Approach & Strategy**: Execution methodology badge + markdown-rendered system design and phased rollout.
  4. **Tech Decisions & Trade-offs**: Technical rationale callout + markdown-rendered comparative engineering analysis.
  5. **Results & Measurable Outcomes**:
     - Impact summary statement.
     - **3D Tilt Metric Cards**: Dynamic key performance indicators with mouse-tracking perspective tilt (`handleMetricMouseMove`).
     - **Visual Evolution (Before & After)**: Side-by-side screenshot comparisons with hover zoom and click-to-expand lightbox modal.
  6. **System Architecture Diagram**:
     - **Blueprint Grid Frame**: Monospace blueprint grid styling with click-to-enlarge lightbox modal.
     - **Architectural Highlights Strip**: Dynamically derived Client Tier, API Gateway & Logic, and Data Store summaries tailored to the project's actual technology stack.
  7. **What I Learned (Retrospective)**: Key takeaway callout + markdown-rendered post-mortem analysis.
  8. **Exploration Footer**: Next Project card with direct navigation link, All Projects link, and external demo/code CTAs.
- **XSS Sanitization & Markdown Engine**: Uses `marked` + `DOMPurify` via reusable `MarkdownView.jsx` with strict tag and protocol whitelisting.
- **MIGRATION NOTE (Graceful Fallback)**:
  - Existing projects without a `caseStudy` object (or with null/empty fields) render gracefully without breaking or throwing runtime errors.
  - Empty case study sections are automatically hidden on public views, and the page renders a clean project overview with hero action buttons.

### 2.6 Certificates & Verified Credentials (`Certificates.jsx` & `CertificateCard.jsx`)
- **Accredited Credentials Showcase**:
  - Certificates from *Apna College*, *Code With Harry*, *Meta*, *AWS*, *HackerRank*.
- **Interactive Modal Lightbox**:
  - High-resolution modal preview with backdrop blur.
  - Interactive multi-level zoom (0.6x to 3.0x) with zoom-in, zoom-out, and reset controls.
  - Drag-to-pan functionality on magnified credentials.
  - Keyboard shortcut: `Escape` key smoothly closes modal.
- **Interactive QR Code Modal (`CertificateQRCodeModal.jsx`)**:
  - Generates verifiable QR codes on demand for instant mobile credential verification.
- **Download & Verification Links**: Direct credentials URL and downloadable asset links.

### 2.7 Contact & Inquiries (`Contact.jsx`)
- **3D Glass Card Form**:
  - Fields: `Your Name`, `Your Email`, `Subject`, `Message` (with live character counter and 10-char minimum validator).
  - Floating labels, custom input highlights, and inline validation messages.
- **Shake Physics & Feedback Banners**:
  - Elastic shake animation on invalid submission attempts.
  - Status alert banners for both successful delivery and field errors.
- **Direct Contact Stack**:
  - Verified Email Address with 1-click clipboard copy button and toast confirmation.
  - Verified Phone Number with 1-click clipboard copy button.
  - Academic background badge and current location indicator (`Bhopal, Madhya Pradesh, India`).
- **Social Profiles Stack**:
  - Verified profile buttons for GitHub, LinkedIn, and Instagram with magnetic hover physics.
- **Rate-Limited Submission**: Integrated with `/api/public/contact` and memory rate-limiting middleware.

### 2.8 Global Utilities & Modals
- **Resume Modal (`ResumeModal.jsx`)**:
  - Full-screen glass modal with format switcher: Interactive PDF embed or image preview.
  - Download CV button, print shortcut, and escape listener.
- **Global Command Palette (`CommandPalette.jsx`)**:
  - Keyboard trigger (`⌘K` / `Ctrl+K`) or header search button.
  - Search across Pages, Navigation, Admin sections, Projects, and Certificates.
  - Keyboard navigation (Arrow keys, Enter, Escape).
- **Floating Toast System (`Toast.jsx`)**:
  - Non-intrusive bottom-right toast notification with entrance slide-in and exit fade.
  - Plays audio tick and supports custom FontAwesome icons.
- **Confirmation Modal (`ConfirmModal.jsx`)**:
  - Reusable modal for destructive operations (delete project, delete milestone, delete message).
- **Footer Component (`Footer.jsx`)**:
  - GSAP ScrollTrigger column staggered entrance.
  - Live clock with format toggle: **IST** (Indian Standard Time), **UTC**, and **LOCAL**.
  - Parallax background grid and glowing orb.
  - "Back to Top" smooth scroll button.

### 2.9 SEO, Open Graph & Structured Data Optimization (Feature 1)
- **Reusable `<SEO />` Component (`client/src/components/SEO.jsx`)**:
  - Sets dynamic `<title>` per page with site-wide brand formatting.
  - Updates `<meta name="description">`, `<meta name="author">`, and `<meta name="robots">`.
  - Sets Open Graph properties: `og:title`, `og:description`, `og:type`, `og:url`, `og:image` (fallback to `/og-image.png`), `og:site_name`.
  - Sets Twitter cards: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`.
  - Updates `<link rel="canonical">` dynamically matching the current route.
  - Injects and updates Schema.org JSON-LD structured data via `<script id="seo-jsonld-schema" type="application/ld+json">`.
- **JSON-LD Schema Generators (`client/src/utils/seo.js`)**:
  - `personSchema(profile, extra)`: Schema.org `Person` object.
  - `websiteSchema(profile)`: Schema.org `WebSite` object.
  - `projectSchema(project)`: Schema.org `SoftwareApplication` object.
  - `certificateSchema(cert)`: Schema.org `EducationalOccupationalCredential` object.
  - `itemListSchema(items, type)`: Schema.org `ItemList` object.
  - `contactPageSchema(profile)`: Schema.org `ContactPage` object.
- **Page-Level Coverage**:
  - `Home.jsx`: `personSchema` + `websiteSchema`.
  - `About.jsx`: `personSchema` with education credentials.
  - `Skills.jsx`: `personSchema` with dynamic `knowsAbout` array.
  - `Projects.jsx`: `itemListSchema` for project gallery; `projectSchema` when accessing `/projects/:slug`.
  - `Certificates.jsx`: `itemListSchema` with `Credential` type.
  - `Contact.jsx`: `contactPageSchema` with primary contact entity.
- **XML Sitemap & Robots.txt**:
  - Backend endpoint `GET /api/public/sitemap.xml` and `/sitemap.xml` generating live sitemap with `<lastmod>` timestamps from data store.
  - `client/public/robots.txt` directing crawlers to `/sitemap.xml` and disallowing `/admin/*`.
  - Default Open Graph image placed at `client/public/og-image.png`.

---

## 3. Admin CMS Features (Super Admin Experience)

### 3.1 Authentication & Security (`AdminAuthModal.jsx` & `AdminSecurity.jsx`)
- **Protected Routing**: All `/admin/*` views require authenticated session.
- **Login Modal**:
  - Master email/username and password validation.
  - Shake physics on failed attempts.
  - Rate limiting (5 attempts per 15 minutes) enforced by backend.
- **Forgot Password Workflow**: Reset admin password using master verification challenge.
- **Security Settings Panel**:
  - Verify current password.
  - Strong password validator (8+ characters, uppercase, number, special symbol).
  - Updates master password with persistent backend save.

### 3.2 Focus Mode & Sidebar Navigation (`AdminSidebar.jsx`)
- **Focus Mode Toggle**: Collapse/expand sidebar to maximize screen space for editing.
- **Live Metric Badges**: Shows active counts for:
  - Projects (`counts.projects`)
  - Certificates (`counts.certificates`)
  - Skills (`counts.skills`)
  - About & Milestones (`counts.journey`)
  - Unread Messages (`counts.unreadMessages` with orange alert badge)
- **Menu Search Filter**: Fast search input to filter sidebar options.
- **Sliding Highlight Bar**: Smooth bar that anchors to hovered and active navigation items even during vertical scrolling.
- **Quick Profile & Logout**: Shows Super Admin profile avatar with 1-click sign out.

### 3.3 Dashboard Overview (`AdminOverview.jsx`)
- **Key Performance Indicators**:
  - Total Published Projects, Verified Certificates, Total Skills, and Unread Recruiter Messages.
- **Recent Activity Feed**:
  - Chronological activity list with detail modal inspection (`ActivityDetailModal.jsx`).
  - Filter by category (`All`, `Projects`, `Certificates`, `Messages`).
- **Quick Project Creation Modal (`QuickProjectModal.jsx`)**: Fast-track project creator without opening full editor.

### 3.4 Projects Manager (`AdminProjects.jsx`)
- **Full Project Lifecycle**: Draft, Published, Featured flags.
- **5-Step Project & Case Study Wizard**:
  - **Step 1: Core Info**: Title, Category (with quick presets), auto-generated slug preview.
  - **Step 2: Description**: High-level project overview description (minimum 10 characters) shown on cards and heroes.
  - **Step 3: Tech Stack & Links**: Comma-separated technologies, quick-add preset badges, active tag removal, Live Demo URL (with link tester), and GitHub repository URL.
  - **Step 4: Media & Visibility**: Cover image drag-and-drop dropzone, direct URL input, Publish Status radio buttons (`Published`, `Draft`, `Archived`), and Homepage feature toggle. Displays real-time **Live Simulated Card Preview** in the right column.
  - **Step 5: Case Study**:
    - **Problem Statement** textarea (supports Markdown, character counter, max 5000 chars, markdown preview toggle).
    - **Engineering Approach** textarea (supports Markdown, character counter, max 5000 chars, markdown preview toggle).
    - **Tech Decisions & Trade-offs** textarea (supports Markdown, character counter, max 5000 chars, markdown preview toggle).
    - **Result Summary & Dynamic Metrics**: Summary textarea + dynamic quantitative metrics list (label + value pairs, Add/Remove buttons, max 10 metrics).
    - **Architecture Diagram**: Cloudinary uploader / direct URL input with image preview and clear button.
    - **Before & After Screenshots**: Dedicated multi-image uploaders (max 5 each) with preview thumbnails and deletion.
    - **Learnings & Retrospective** textarea (supports Markdown, character counter, max 5000 chars, markdown preview toggle).
    - **Live Case Study Preview**: Right-column widget displaying immediate summary, metrics pills, and architecture status as user types.
    - **Skip Case Study Button**: Allows saving/publishing the project without case study content.
    - **Preview Case Study Modal**: Opens a full-screen simulated modal showing the exact public case study layout before publishing.
- **Reordering & Batch Actions**:
  - Drag-and-drop reordering with visual highlight.
  - Multi-select projects for bulk publishing, bulk drafting, or bulk deletion.

### 3.5 Certificates Manager (`AdminCertificates.jsx`)
- **4-Stage Certificate Wizard**:
  - Step 1: Title, Issuer, Issue Date/Year, Category.
  - Step 2: Credential ID (with 1-click auto-generator), Verification URL, Status.
  - Step 3: Skills covered tags with 1-click recommended skill pills.
  - Step 4: Certificate image uploader with drag-and-drop & live 3D card preview.
- **Interactive QR Code Generator**: Modal generating instant scannable verification QR codes.
- **Filters & Search**: Filter by issuer, category, status (`Verified`, `Featured`), and year.
- **Batch Actions**: Multi-select certificates for bulk actions and reordering.

### 3.6 Skills & Competencies Manager (`AdminSkills.jsx`)
- **Categorized Skill Buckets**: Languages, Frontend, Backend, Database, Developer Tools.
- **Devicon Database Integration**: Instant lookup of 60+ industry technologies with official SVG classes.
- **Category Customization**: Color picker for category themes, description, and icon assignment.
- **Skill Operations**: Add, edit, delete, toggle visibility, and drag-and-drop reorder within categories.
- **Manage Categories Modal**: Add custom categories and adjust category display order.

### 3.7 About & Milestones Hub (`AdminMilestones.jsx`)
- **4 Dedicated Workspace Sub-Tabs**:
  1. **Milestones Timeline**: Full chronological roadmap management.
  2. **Academic Qualifications**: Live editing of Degree, College, CGPA, Class XII school, board, score.
  3. **About Bio & Story**: Multi-paragraph narrative story editor with character counters and eyebrow tag editor.
  4. **Live Public Preview**: Real-time simulation of public About page cards with 3D tilt physics.
- **3-Step Milestone Creation Wizard**:
  - **Step 1: Phase & Timeline**: Select Phase category preset (with color & icon) or enter custom phase, select Year badge preset (`Year 3`, `Year 1-2`, `Present`, etc.), and set Status (`Completed`, `Current Focus`, `Planned Target`).
  - **Step 2: Title & Details**: Milestone Title (minimum 3 characters), Milestone description (minimum 10 characters), and Milestone icon picker (10 FontAwesome icons).
  - **Step 3: Skills & Verification**: Key achievement metric badge (e.g. `8.42 CGPA`, `Production Grade`), skills tags (with 1-click recommended skill chips), and optional verification/credential link.
- **Scrollbar-Constrained Milestones List**:
  - Milestone cards list container is constrained with `max-h-[620px]` and `custom-scrollbar` so that the admin page maintains a compact, clean viewport even with a large volume of milestones.
- **One-Click Curated Presets**:
  - *B.Tech Computer Science & Engineering (CGPA 8.42 @ SISTec)*
  - *MERN Stack & Scalable Systems Architecture*
  - *Core Programming, DSA & CS Fundamentals*
  - *Algorithmic Fluency & Applied AI Integration*
  - *Higher Secondary (Class XII) 80% MPBSE*
- **Timeline Management**:
  - Search milestones by keyword, title, phase, or skill.
  - Filter by status (`All`, `Completed`, `Focus`, `Planned`).
  - Up / Down reordering handles, 1-click milestone duplication, and safe confirmation deletion.

### 3.8 Profile & Resume Manager (`AdminProfile.jsx`)
- **Dual-Column Layout**:
  - Left: Sticky live rendering simulation card with 3D droplet effects.
  - Right: Scrollable form controls.
- **Resume PDF Management**:
  - Drag-and-drop PDF uploader with Cloudinary integration and local fallback.
  - Direct cloud URL input with live preview button.
- **Personal & Academic Identity**:
  - Display name, monogram initial, email, phone, location, header subtitle, eyebrow tag, main hero headline.
  - Academic background fields (degree, college, CGPA, graduation batch, Class XII board and scores).
- **Social Networks**: GitHub, LinkedIn, Instagram URL managers with real brand icons.
- **About Biography Paragraphs**: Add, edit, remove, and reorder biography narrative blocks.

### 3.9 Hero Portrait & Media Studio (`AdminHeroPortrait.jsx`)
- **Live Device Simulator**: Toggle between Desktop and Mobile live frame rendering.
- **Image Studio**:
  - Image cropping modal with scaling controls.
  - Media library selector with preset portfolio images.
  - Backup & restore state manager.
- **Visual Theme & Typography**:
  - Primary theme color picker (`#0ea5e9`, cyan, emerald, purple, amber).
  - Typography font family selector (`Inter`, `Space Grotesk`, `Outfit`).
  - Custom domain, hero headline, availability status, and CTA labels.
- **Undo / Redo History**: Integrated history stack to undo or redo visual changes.
- **Maintenance Mode Switch**: Global toggle to put the portfolio in maintenance mode.

### 3.10 Messages Inbox (`AdminMessages.jsx`)
- **Visitor Inquiries Feed**: Captures all submissions sent through the `/contact` page.
- **Status Controls**: Mark as `Unread`, `Read`, or `Replied`.
- **Search & Filter**: Filter by status chips (`All`, `Unread`, `Read`, `Replied`).
- **Deletion Protection**: Safe deletion with `ConfirmModal` dialog.

### 3.11 User Guide & API Reference
- **User Guide (`AdminUserGuide.jsx`)**: Interactive comprehensive walkthrough, feature documentation, troubleshooting guide, and deployment manual.
- **API Reference (`AdminApiReference.jsx`)**: Interactive API documentation covering all REST endpoints with curl examples, query parameters, request bodies, and response schemas.

---

## 4. REST API Endpoint Directory

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System health check, storage engine status, timestamp |
| `GET` | `/api/public/bootstrap` | Public | Bootstraps entire portfolio state (profile, projects, skills, certificates, settings) |
| `GET` | `/api/public/sitemap.xml` | Public | Live XML sitemap with lastmod timestamps for all public routes and projects |
| `GET` | `/api/public/profile` | Public | Retrieves public profile data |
| `GET` | `/api/public/skills` | Public | Retrieves all categorized skills |
| `GET` | `/api/public/certificates` | Public | Retrieves accredited certificates |
| `GET` | `/api/public/projects` | Public | Retrieves published projects (supports `?category=` filter) |
| `GET` | `/api/public/projects/:slug` | Public | Retrieves single published project by slug |
| `POST` | `/api/public/contact` | Public (Rate-Limited) | Submits contact inquiry with spam rate-limiting (5/hour) |
| `POST` | `/api/auth/login` | Public (Rate-Limited) | Authenticates admin session with rate-limiting (5/15m) |
| `POST` | `/api/auth/logout` | Public | Terminates active admin session |
| `GET` | `/api/auth/session` | Public | Validates session token & returns current admin status |
| `POST` | `/api/portfolio/sync` | Admin Auth | Synchronizes complete portfolio state to MongoDB / storage |
| `GET` | `/api/admin/summary` | Admin Auth | Metrics & KPI counts for dashboard overview |
| `PUT` | `/api/admin/profile` | Admin Auth | Updates master profile and education settings |
| `GET` | `/api/admin/projects` | Admin Auth | Lists all projects including drafts |
| `POST` | `/api/admin/projects` | Admin Auth | Creates a new project |
| `PUT` | `/api/admin/projects/:id` | Admin Auth | Updates existing project |
| `DELETE`| `/api/admin/projects/:id` | Admin Auth | Deletes project |
| `GET` | `/api/admin/certificates` | Admin Auth | Lists all certificates |
| `POST` | `/api/admin/certificates` | Admin Auth | Upserts certificate |
| `DELETE`| `/api/admin/certificates/:id`| Admin Auth | Deletes certificate |
| `GET` | `/api/admin/skills` | Admin Auth | Lists skill categories & items |
| `POST` | `/api/admin/skills` | Admin Auth | Upserts skill category or skill item |
| `DELETE`| `/api/admin/skills/:id` | Admin Auth | Deletes skill category |
| `GET` | `/api/admin/messages` | Admin Auth | Lists visitor contact inquiries |
| `PATCH` | `/api/admin/messages/:id` | Admin Auth | Updates message status (`read`, `replied`) |
| `DELETE`| `/api/admin/messages/:id` | Admin Auth | Deletes message |
| `GET` | `/api/admin/settings` | Admin Auth | Retrieves site settings & Cloudinary keys |
| `PUT` | `/api/admin/settings` | Admin Auth | Updates site settings & configuration |

---

## 5. Verification Checklist & Audit Results

- [x] **Router Audit**: Verified all routes in `client/src/app/router.jsx`. Confirmed `/contact`, `/connect`, and `/hire` resolve to `<ContactPage />`.
- [x] **Public Navigation**: Checked all navigation links across `Header.jsx`, `Footer.jsx`, `Home.jsx`, and `About.jsx`. All links resolve correctly.
- [x] **Modal Systems**: Verified `ResumeModal`, `CertificateLightboxModal`, `CertificateQRCodeModal`, `CommandPalette`, `Toast`, and `ConfirmModal`.
- [x] **About & Milestones Hub**: Upgraded `AdminMilestones.jsx` with 4 sub-tabs, presets, search, filter, reorder, duplicate, academic credentials editor, bio story manager, and live 3D preview.
- [x] **Public Timeline Enhancement**: Updated `About.jsx` to render milestone `yearBadge`, `status` chips, `metric` badges, and acquired `skills` chips.
- [x] **Admin Sidebar Badges**: Verified dynamic count badges in `AdminSidebar.jsx` and `Admin.jsx` for Projects, Certificates, Skills, About & Milestones, and Messages.
- [x] **Resume Upload Service**: Fixed resume file URL property extraction (`res.fileUrl || res.url`) and settings passing in `AdminProfile.jsx`.
- [x] **Backend Services**: Confirmed rate limiting, CORS, CSRF, security headers, static upload serving, and error responses.
