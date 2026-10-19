# Setup & Verification Guide — `argonPortfolio`

## 1. Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

## 2. Backend Setup & Commands

From the repository root:

```bash
# Seed initial portfolio database
npm run seed

# Bootstrap administrator account (min 10-character password)
node server/scripts/setup-admin.js --username ayush --password "YourStrongAdminPassword#2026"

# Start the backend API server on http://localhost:6000
npm run dev:server

# Run the automated backend & security test suite
npm test
```

## 3. Frontend Setup & Commands

```bash
cd client
npm install
npm run dev
```

To build for production:

```bash
npm run build:client
```
