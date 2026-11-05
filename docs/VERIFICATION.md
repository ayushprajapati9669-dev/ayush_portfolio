# Codebase Verification Notes

Review performed on 2026-11-05 against the checked-in source and package scripts. This is a source inspection, not a penetration test or deployment audit.

## Remediated findings

### Critical: admin authentication can be forged

Fixed on 2026-11-05. `server/src/middleware/authMiddleware.js` now accepts only signed server-issued session tokens from the cookie or bearer header. Client-controlled CSRF or admin headers cannot establish a session. `AuthProvider.jsx` now logs in through `/api/auth/login` and stores only the CSRF token needed alongside the HTTP-only session cookie. The backend test suite includes regression checks for forged bearer and CSRF values.

### High: unauthenticated asset write route

Fixed on 2026-11-05. The unused `POST /api/admin/optimize-asset` handler was removed. It previously wrote caller-controlled data beneath `client/public/images` without authentication or validated file content.

### Documentation/config mismatch

- No `.env.example` is present in the repository, despite older setup instructions referring to it.
- The project stores data locally by default and attempts MongoDB using a default local URI; MongoDB is therefore optional only when fallback behavior is allowed.
- The backend uses a native Node HTTP server even though `express` is present in server dependencies.
- The frontend auth flow and backend auth flow are separate implementations; do not assume the frontend login proves the backend session is authenticated.

## Verification coverage available in repository

`server/tests/run-tests.js` exercises password hashing, public project filtering, contact validation, admin auth/session behavior, forged-token rejection, project CRUD, media validation, and login rate limiting. On 2026-11-05, `npm test` completed with 11/11 checks passing and `npm run build:client` completed successfully.

## Review scope

Inspected package scripts/dependencies, router, API client, environment config, server entry/app, route dispatch, authentication middleware/provider, persistence initialization, and backend tests. The remediations above updated source code and test coverage.
