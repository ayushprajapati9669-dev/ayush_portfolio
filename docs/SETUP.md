# Setup and Verification

## Requirements

- Node.js 18 or newer (see the root `package.json`).
- npm.
- MongoDB is optional for local development; the server starts with its JSON file store when MongoDB is unavailable and file fallback is enabled.

## Install

Run from the repository root:

```bash
npm install
npm --prefix client install
```

The repository currently has no tracked `.env.example`. The server loads `.env` from the repository root or `server/`. Defaults are defined in `server/src/config/env.js`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `6000` | HTTP server port |
| `CLIENT_ORIGIN` | `http://localhost:5174` | Allowed frontend origin |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ayush_portfolio` | MongoDB connection URI |
| `ALLOW_FILE_DB_FALLBACK` | `true` | Permit JSON store fallback |
| `SESSION_SECRET` (or `JWT_SECRET`) | Development-derived value | Signed server session token secret; set a strong unique value outside local development |
| `COOKIE_SECURE` | `false` | Set secure cookies when served over HTTPS |
| `COOKIE_SAMESITE` | `Strict` | Session cookie SameSite value |
| `SESSION_TTL_HOURS` | `12` | Session token lifetime |
| `LOGIN_RATE_LIMIT_WINDOW_MS` / `LOGIN_RATE_LIMIT_MAX` | `900000` / `5` | Login limiter window and request count |
| `CONTACT_RATE_LIMIT_WINDOW_MS` / `CONTACT_RATE_LIMIT_MAX` | `3600000` / `5` | Contact limiter window and request count |
| `MAX_UPLOAD_BYTES` | `5242880` | Upload size limit |
| `DATA_DIR` / `UPLOADS_DIR` | `server/data` / `server/uploads` | Persistent data and uploaded media directories |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Empty | Optional server-side Cloudinary configuration |

The frontend Vite dev server proxies `/api` and `/uploads` to `http://localhost:6000` and listens on port `5174`.

## Run

Start each process in a separate terminal from the repository root:

```bash
npm run dev:server
npm run dev:client
```

Open `http://localhost:5174`. The API listens on `http://localhost:6000`.

The server initializes its JSON store from `server/src/models/seedData.js` at `server/data/portfolio.json` if the file does not exist. `npm run seed` resets that store to seed data. `npm run setup:admin` runs `server/scripts/setup-admin.js`; inspect that script's prompts and arguments before using it. Do not treat the UI's client-side login as a secure production admin boundary (see [VERIFICATION.md](./VERIFICATION.md)).

## Build and verification

```bash
npm run build:client
npm test
```

`npm test` runs the backend verification suite in `server/tests/run-tests.js`. The test suite creates and removes an isolated runtime JSON file under `server/data/`.

Other root scripts include `npm start` and `npm run dev` for the server, and `npm run clean:demo` for the demo-data cleanup script. Run cleanup commands only when you intend to modify the local portfolio data.
