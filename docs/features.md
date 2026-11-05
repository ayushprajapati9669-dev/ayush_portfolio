# Features

This page summarizes capabilities represented in the current client and server source. Content and enabled services can vary with local portfolio data and environment configuration.

## Public portfolio

- Home, About, Journey/Achievements, Skills, Projects, Certificates, and Contact pages.
- Responsive navigation, animated backgrounds and cards, reduced-motion support, and portrait particle effects.
- Project listing and detail content, certificate previews and QR support, and skill categories.
- Contact form backed by the public API, with server-side validation and rate limiting.
- Interactive widgets include the developer workbench, architecture diagrams, API sandbox, LeetCode metrics, audio controls, and Ask Ayush AI.
- SEO utilities and sitemap output are implemented in the client and server.

## Admin interface

The admin area contains overview and analytics views, profile, hero portrait, project, certificate, skill, media, message, and settings management, plus security and user-guide views. Admin UI also contains milestone and activity-related interfaces. Available backend persistence and routes should be checked for each feature; frontend presence alone does not establish server-side persistence.

## Server capabilities

- Native Node HTTP server and explicit route dispatch.
- JSON document store with atomic temporary-file replacement and optional MongoDB connection/synchronization.
- Project visibility filtering so public project routes return published projects.
- Admin CRUD endpoints for profile, projects, certificates, skills, media, messages, and settings.
- Login/contact rate limiters, security response headers, upload validation, and signed-token helpers.
- Optional Cloudinary support, AI assistant/case-study service hooks, and LeetCode data service.

## Implementation notes

- Some portfolio state is held in browser local storage and synchronized to the server; the browser upload helper may store base64 data URLs when Cloudinary unsigned uploads are not configured.
- Authentication fixes and the associated regression checks are recorded in [VERIFICATION.md](./VERIFICATION.md).
- Performance figures, Lighthouse scores, and benchmark numbers previously listed in this document were not reproducible from repository evidence and have been removed.
