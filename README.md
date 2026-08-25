# AB Address Frontend

React + TypeScript + MUI + Redux Toolkit (RTK Query) frontend for AB's Address Master &
Mapping capability: a shared `AddressCapture` component used across 6 demo entry pages,
plus a full Admin console for standardisation.

## Run it
```bash
npm install
npm run dev   # http://localhost:5173, proxies /api/* to the backend on :4000
```
The backend (separate repo) needs to be running for anything to actually load.

## Tests
Unit tests for the address/reducer logic plus component tests for the shared
`AddressCapture` (cascading enable/disable, reset-on-change, completeness reporting),
with the API layer mocked.
```bash
npm test
```

## Where to look
- `src/components/AddressCapture/` — the one shared address-entry component used by
  all 6 demo pages (`src/pages/*.tsx`): cascading Country→State→City→Pincode, reverse
  pincode lookup (type a pincode, City/State/Country auto-fill), free-text Area/Sub-area
  with duplicate-suggestion handling.
- `src/pages/admin/` — Address Master (search/filter/activate), Pending Review,
  Duplicate/Merge & Correction, Audit History, Search & Report.
- `src/api/addressApi.ts` — the RTK Query slice every page shares.

## CI/CD
`.github/workflows/ci-cd.yml`: on push/PR to `main` → `npm test` + `npm run build` →
(main only) build & push `koushik172/ab-address-frontend` to Docker Hub as `:latest`
and `:<sha>` → SSH into the EC2 host and
`docker compose pull frontend && docker compose up -d frontend --no-deps` (only this
container restarts).

**Required GitHub Secrets** (Settings → Secrets and variables → Actions) — the backend
repo needs the same five:

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | `koushik172` |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `EC2_HOST` | EC2 public IP/DNS |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | full contents of the EC2 `.pem` key |

This workflow assumes `~/ab-app/docker-compose.yml` already exists on the EC2 host — see
the deployment notes kept alongside this project for the one-time EC2 setup.

## No login system
No password auth — a **User / Admin toggle** in the top bar switches role via a request
header (`x-user-role`). Wire in real auth later without touching any address logic.
