# PocketSync

Personal finance app for linking Nigerian bank and fintech accounts, tracking transactions, paying bills, and moving money between accounts.

## Frontend

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173` by default. Point `VITE_API_BASE_URL` at the backend if it is not on `http://localhost:5000/api/v1`.

For Vercel deployments, leave `VITE_API_BASE_URL` unset so the app calls `/api/v1` and `vercel.json` proxies API requests to the Render backend.

## Backend

API lives in `pocketsync-backend/`. See that folder's README for setup, env vars, and seed credentials.

## Scripts

- `npm run dev` – local dev server
- `npm run build` – production build
- `npm run lint` – ESLint
