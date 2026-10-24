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
  - **Opaque Obsidian Surfaces (`#0B1120`)**: Deep solid card background (`#0B1120 !important`) with 1px border (`rgba(255, 255, 255, 0.14)`) and deep shadow that completely blocks background layer bleed-through.
  - **Background Distraction Elimination**: Automatically mutes/hides background 3D floating droplets (`BackgroundLayers.jsx` via `isCaseStudy` route detection) on case study detail pages, setting a calm deep `#070B14` oceanic backdrop for distraction-free reading.
  - **High-Contrast Typography**: Crisp `#FFFFFF` headings, `#F8FAFC` alabaster body text, `#38BDF8` cyan highlights and inline code pills with zero text clipping or opacity locks.
  - **Top Glowing Reading Progress Bar**: Fixed cyan-to-emerald gradient progress bar at the very top of the window tracking scroll depth (0–100%).
  - **Sticky Sub-Navigation Bar with Smooth Scrolling**: Glassmorphic pill bar pinned below global header (`top: 96px`) with active section tracking and smooth programmatic scrolling with a 150px header offset (`scrollToSection`).
  - **One-Click Share & Copy Link**: Action button with clipboard API and toast feedback for sharing direct case study links.
- **Modular Components & Interactive Visualizers**:
  1. **Hero Section**: High-resolution cover banner with gradient fade, category badge, dynamic reading time badge, project title, overview summary, and 4-fact metadata strip (Role, Architecture stack, Deployment status, Open source repository).
  2. **The Problem Statement**: Highlight callout box with core challenge excerpt + markdown-rendered deep dive.
  3. **My Approach & Strategy**: Execution methodology badge + markdown-rendered system design and phased rollout.
  4. **Tech Decisions & Trade-offs**: Technical rationale callout + markdown-rendered comparative engineering analysis.
  5. **Results & Measurable Outcomes**:
     - Impact summary statement.
     - **3D Tilt Metric Cards**: Dynamic key performance indicators with mouse-tracking perspective tilt (`handleMetricMouseMove`).
     - **Interactive Before & After Visual Evolution (`BeforeAfterCompare.jsx`)**:
       - **Interactive Split Slider**: Draggable range slider with glowing cyan splitter bar and `clipPath` polygon rendering to preserve native aspect ratio without distortion.
       - **Side-by-Side Toggle**: Alternative comparison view with badged evidence lists and click-to-enlarge lightbox modal.
  6. **System Architecture Diagram & Blueprint Viewer (`ArchBlueprintViewer.jsx`)**:
     - **Blueprint Grid Frame**: Monospace blueprint grid styling with click-to-enlarge lightbox modal.
     - **Interactive Architecture Tier Explorer**: Interactive tab switcher (*1. Client Tier*, *2. API Gateway & Logic*, *3. Data Store & ACID Isolation Tier*) with dynamic stack tags, architectural highlights, and security characteristics.
  7. **What I Learned (Retrospective)**: Key takeaway callout + markdown-rendered post-mortem analysis.
  8. **Dual Exploration Footer**: Previous Project & Next Project navigation buttons with title truncation, All Projects link, and external demo/code CTAs.
- **Case Study Enrichment Engine (`projectCaseStudyData.js`)**:
  - `getEnrichedCaseStudy(project)`: Automatically provides realistic, production-grade architectural documentation, quantitative metrics, visual evolution screenshots, and system blueprint diagrams whenever CMS entries are minimal or missing.
  - Preserves custom CMS inputs if present while seamlessly filling any gaps with rich archetype-tailored engineering content.
- **XSS Sanitization & Markdown Engine**: Uses `marked` + `DOMPurify` via reusable `MarkdownView.jsx` with strict tag and protocol whitelisting.

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
- **Focus Mode Toggle**: Collapse/expand sidebar to maximize screen space for editing (80px vs 260px).
- **Live Metric Badges**: Shows active counts for:
  - Projects (`counts.projects`)
  - Certificates (`counts.certificates`)
  - Skills (`counts.skills`)
  - About & Milestones (`counts.journey`)
  - Unread Messages (`counts.unreadMessages` with orange alert badge)
  - Recycle Bin (`counts.trash` live count of deleted milestones)
- **Navigation Sections**:
  - Overview (`dashboard`)
  - Portfolio Content (`projects`, `certificates`, `skills`, `journey`)
  - Site Settings (`profile`, `media`, `security`)
  - Communication (`messages`)
  - Advanced (`recycle-bin`, `activity-log`, `linkedin-import`, `github-sync`)
  - Resources (`guide`, `api-docs`)
- **Menu Search Filter**: Fast search input to filter sidebar options with 1-click clear.
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

### 3.7 About & Milestones Hub (`AdminMilestones.jsx` — Enterprise CMS v9)
- **Dedicated Sub-Tabs Workspace**:
  1. **Journey Roadmap**: Complete chronological roadmap and milestone ecosystem.
  2. **Academic Credentials**: Full editor for Degree, College, CGPA, Class XII school, score, board, location, and stage/batch with immediate database & JSON sync.
  3. **Bio & Story**: Multi-paragraph public biography editor supporting paragraph creation, deletion, reordering, and live review.
- **Top Control Suite & Navigation**:
  - **Theme Selector**: Dynamic switching between 5 themes: `🌙 Midnight`, `☀️ Light`, `🌊 Ocean`, `🌲 Forest`, and `🌅 Sunset`.
  - **Accent Color Palette**: 6 curated color accents (Cyan, Violet, Rose, Emerald, Amber, Pink).
  - **Voice Command Controller**: SpeechRecognition listener for voice commands ("New milestone", "Search React", "Recycle bin", "Focus mode", "Templates", "Stop/Cancel") with active pulsing banner.
  - **Focus Mode**: 1-click toggle to eliminate interface distractions.
  - **Density Toggle**: Switch between `Comfort` and `Compact` data density modes.
  - **Keyboard Shortcuts Overlay (`?`)**: Full shortcut reference (`⌘K`, `N`, `Esc`, `F`, `?`, `Shift+Click`).
  - **Command Palette (`⌘K` / `Ctrl+K`)**: Instant search for all actions, navigation, and milestones with arrow key navigation.
- **Header & Stats Grid**:
  - "Live in Portfolio" status badge with animated pulse dot.
  - Stats Grid: Total Milestones, Completed count, Active Focus count, and live B.Tech CGPA (`8.42`).
- **Sticky Controls Toolbar**:
  - Multi-criteria filtering: Status (`All`, `Focus`, `Completed`, `Planned`), Academic Year (`Year 1` - `Year 4`, `Present`), Sort (`Newest`, `Oldest`, `A-Z`, `Most Viewed`), and Tag filter.
  - **Shift-Click Multi-Select & Bulk Operations**: Bulk Complete, Bulk Delete (with mandatory typed `DELETE` confirmation), and Side-by-Side Compare.
  - Action buttons: GitHub Sync, LinkedIn Import, Templates Library, and "+ New Milestone".
- **Centered Search Bar**:
  - Centered search input with instant debounced filtering across milestone title, description, and technology tags.
- **Milestone Cards & Interactive Mechanics**:
  - Drag-and-drop visual reordering (`onDragStart`, `onDragOver`, `onDrop`).
  - Multi-select checkbox with Shift-click range support.
  - Double-click inline title renaming.
  - Star ratings (0 to 5 stars).
  - Live vs Draft toggle switch with immediate public state updates.
  - View count tracking badge.
  - Progress bar with percentage display.
  - Pinned milestone state with amber left border and top-of-list pinning.
  - Technology tags with official devicon and FontAwesome badges.
  - External link / case study resource chip.
  - Card action buttons: Pin, Move Up, Move Down, Compare, Duplicate, Edit, Delete.
  - Right-click Context Menu (`onContextMenu`): Edit, Duplicate, Compare, Pin/Unpin, Copy Link, Share, Save as Template, Move Up, Move Down, Delete.
- **Resizable Live Preview Right Panel**:
  - Sticky / scrollable live preview showing all published milestones in real-time.
  - Picture-in-Picture (PiP) toggle button to detach preview into a floating bottom-right window.
  - Interactive resize handle to drag-and-resize panel width between 280px and 650px with `localStorage` width persistence.
- **4-Step Milestone Creation & Editing Wizard Modal**:
  - **Step 1: Basics**:
    - Milestone Title with Levenshtein-distance duplicate detection warning (Merge, Keep Both, Cancel options).
    - AI Smart Categorization: Suggests appropriate category, status, and icon based on title analysis.
    - Meta Label, Academic Year, Status, Progress %, and Self-Rating slider (0-5 stars).
  - **Step 2: Content & Rich Text Editor (RTE)**:
    - Text formatting: Undo, Redo, Bold, Italic, Underline, H2, H3, Bullet List, Numbered List, Link, Code block (`<pre>`).
    - Color picker with 12 preset swatches and custom picker.
    - Emoji picker with 12 quick-insert emojis.
    - Voice Dictation speech-to-text input.
    - Grammar check simulator.
    - AI Description Generator: Auto-writes comprehensive, structured milestone descriptions.
    - Live word counter and character counter.
    - AI Summary generator and Auto-Tag keyword extractor.
  - **Step 3: Media & Tags**:
    - Icon grid selector (10 icons).
    - Cover image drag-and-drop uploader.
    - AI SVG Image Generator: Generates realistic, illustration, or abstract vector SVG graphics on the fly.
    - Alt text generator.
    - Comma-separated technology tags and external resource link.
  - **Step 4: Review & Persistence**:
    - Structured review section displaying basic parameters, sanitized description preview, tags, and media before final commit.
    - Autosave status indicator.
    - "Save as Template" button to add custom templates to library.
- **Integrated Modals & Overlays**:
  - **Templates Library Modal**: 12 pre-crafted professional templates (Hackathon Win, Internship, Open Source, Research Paper, Certification, Project Launch, Competition Honor, Leadership, Tech Talk, Blog Post, Client Delivery, Volunteering) + user custom saved templates.
  - **GitHub Sync Modal**: Connects to GitHub repository to fetch recent commits and convert commits into roadmap milestones with 1 click.
  - **LinkedIn Import Modal**: Simulates importing verified certifications and competition awards directly into portfolio milestones.
  - **Recycle Bin Modal**: Stores deleted milestones with 30-day retention countdown and 1-click restore.
  - **Activity Log Modal**: Detailed chronological audit log of all admin operations with timestamp and device user-agent info.
  - **Side-by-Side Compare Panel**: Split-screen comparative review for two selected milestones.
  - **Bulk Delete Modal**: Requires typing `DELETE` into input field before allowing multi-item purge.
  - **Canvas Confetti & Celebrations**: Fires festive physics confetti and toast on milestone counts (1, 3, 5, 10, 15, 20, etc.).

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
