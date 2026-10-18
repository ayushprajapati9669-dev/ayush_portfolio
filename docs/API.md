# API Reference — `argonPortfolio`

## 1. Public Endpoints

- `GET /api/health` — Returns server status, storage engine mode, and admin bootstrap status.
- `GET /api/public/bootstrap` — Returns `profile`, published `projects`, `skills`, `certificates`, and `settings`.
- `GET /api/public/profile` — Returns Ayush Prajapati's profile metadata.
- `GET /api/public/skills` — Returns categorized skill groups and items.
- `GET /api/public/certificates` — Returns verified certificates.
- `GET /api/public/projects` — Returns published-only projects (supports `?category=` query filter).
- `GET /api/public/projects/:slug` — Returns a single published project by slug (`404` for drafts).
- `POST /api/public/contact` — Validates (`name`, `email`, `subject`, `message`), rate-limits (`5/hour`), and persists contact messages.

## 2. Authentication Endpoints

- `POST /api/auth/login` — Authenticates admin credentials, enforces brute-force rate limiting (`5/15m`), sets `HttpOnly; SameSite=Strict` cookie (`argon_session`), and returns `{ authenticated: true, csrfToken }`.
- `POST /api/auth/logout` — Clears the `argon_session` cookie.
- `GET /api/auth/session` — Checks current admin session and returns `csrfToken`.

## 3. Protected Admin Endpoints

All mutating admin endpoints require a valid `argon_session` cookie and matching `X-CSRF-Token` header:

- `GET /api/admin/summary` — Dashboard metrics (published/draft projects, certificates, messages, media counts).
- `PUT /api/admin/profile` — Updates profile, education, bio, social links, and hero portrait configuration.
- `GET /api/admin/projects` — Lists all projects (`published` and `draft`).
- `GET /api/admin/projects/preview/:idOrSlug` — Previews unpublished draft projects.
- `POST /api/admin/projects` — Creates a new project.
- `PUT /api/admin/projects/:id` — Updates or publishes/unpublishes a project.
- `DELETE /api/admin/projects/:id` — Deletes a project.
- `GET /api/admin/certificates`, `POST /api/admin/certificates`, `DELETE /api/admin/certificates/:id` — Certificate CRUD.
- `GET /api/admin/skills`, `POST /api/admin/skills`, `DELETE /api/admin/skills/:id` — Skill category CRUD.
- `GET /api/admin/media`, `POST /api/admin/media` — Media listing and magic-byte validated image upload.
- `GET /api/admin/messages`, `PATCH /api/admin/messages/:id`, `DELETE /api/admin/messages/:id` — Contact message management.
- `GET /api/admin/settings`, `PUT /api/admin/settings` — Site settings, particle toggle, and Cloudinary configuration.
- `POST /api/portfolio/sync` — Synchronizes full Admin CMS state with the server store.
