# API Reference

Base URL for local development: `http://localhost:6000`. JSON routes accept and return JSON unless noted. Exact validation and response fields are defined in `server/src/controllers/` and `server/src/validators/`.

## Public API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Server and store status |
| `GET` | `/api/public/bootstrap` | Initial portfolio payload |
| `GET` | `/api/public/profile` | Public profile |
| `GET` | `/api/public/skills` | Skills categories |
| `GET` | `/api/public/certificates` | Public certificates |
| `GET` | `/api/public/projects` | Published projects; accepts `?category=` |
| `GET` | `/api/public/projects/:slug` | Published project lookup |
| `GET` | `/api/public/leetcode-stats` | LeetCode stats service output |
| `POST` | `/api/public/telemetry` | Record public telemetry |
| `POST` | `/api/public/ask-ai` | Public AI assistant request |
| `POST` | `/api/public/contact` | Validate and persist a contact message; rate limited |
| `GET` | `/api/public/sitemap.xml`, `/sitemap.xml` | Sitemap XML |
| `*` | `/api/v1/*` | Live API sandbox namespace handled by the public controller |

## Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Login; sets `argon_session` cookie and returns a CSRF token |
| `POST` | `/api/auth/logout` | Clear the session cookie |
| `POST` | `/api/auth/password` | Change the authenticated admin's password; requires the current password and CSRF token |
| `GET` | `/api/auth/session` | Check the current session |

Cookie/session defaults are configured in `server/src/config/env.js`; login attempts are rate limited. See [VERIFICATION.md](./VERIFICATION.md) for an important limitation in current authentication behavior.

## Admin API

Admin endpoints require the auth middleware. Mutating requests require `X-CSRF-Token` matching the session CSRF token.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/summary` | Admin dashboard summary |
| `GET` | `/api/admin/analytics` | Analytics summary |
| `POST` | `/api/admin/generate-case-study` | Generate case study content |
| `PUT` | `/api/admin/profile` | Update profile |
| `GET`, `POST` | `/api/admin/projects` | List or create projects |
| `GET` | `/api/admin/projects/preview/:idOrSlug` | Preview a project, including drafts |
| `PUT`, `DELETE` | `/api/admin/projects/:id` | Update or delete a project |
| `GET`, `POST`, `DELETE` | `/api/admin/certificates[/:id]` | Certificate management |
| `GET`, `POST`, `DELETE` | `/api/admin/skills[/:id]` | Skill category management |
| `GET`, `POST` | `/api/admin/media` | List media or upload an image |
| `GET`, `PATCH`, `DELETE` | `/api/admin/messages[/:id]` | List, update status, or delete messages |
| `GET`, `PUT` | `/api/admin/settings` | Read or update site settings |
| `POST` | `/api/portfolio/sync` | Synchronize portfolio state; auth is checked by the same middleware with its non-mutating CSRF mode |

The server also serves files at `GET /uploads/:filename`.

## Local request example

```bash
curl http://localhost:6000/api/health
```

For authenticated writes, first obtain a valid session and CSRF token through the login flow, then send the cookie and `X-CSRF-Token` header.
