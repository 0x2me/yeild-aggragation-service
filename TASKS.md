# TASKS.md — Yield Aggregation dApp (Monorepo)

A step-by-step checklist to build the app, set up environments, and deploy to Railway using pnpm workspaces, Next.js (web), Fastify + Prisma + PostgreSQL (api), and a scheduled refresh that hits `/api/refresh`. Endpoints required by the tech test are included and mapped to our architecture.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Scaffold the Monorepo](#2-scaffold-the-monorepo)
3. [Backend: Fastify + Prisma + Postgres](#3-backend-fastify--prisma--postgres)
4. [Provider Adapters](#4-provider-adapters)
5. [API Endpoints](#5-api-endpoints)
6. [Frontend: Next.js](#6-frontend-nextjs)
7. [Local Environment and DX](#7-local-environment-and-dx)
8. [Deploy to Railway](#8-deploy-to-railway)
9. [Wire the Scheduled Refresh](#9-wire-the-scheduled-refresh)
10. [Smoke Test and QA](#10-smoke-test-and-qa)
11. [Nice to have and Bonus](#11-nice-to-have-and-bonus)

## 1) Prerequisites

- [x] pnpm installed
- [x] Node 18+
- [ ] Railway account and CLI (optional but useful)
- [ ] Postgres locally or Docker (optional if you only use Railway DB in dev)
- [ ] GitHub repo

## 2) Scaffold the Monorepo

- [x] Create repo root: `yield-agg/`
- [x] Add `package.json` with pnpm workspaces:
  - `"private": true`
  - `"workspaces": ["apps/*", "packages/*"]`
- [x] Create folders:
  - `apps/api`
  - `apps/web`
  - `packages/shared` (shared types and small utils)
- [x] Add root configs:
  - `.gitignore` for node, build, env files
  - `README.md` and `architecture.md`
  - This `TASKS.md`
- [ ] Optional: add Turborepo later for faster builds

## 3) Backend: Fastify + Prisma + Postgres

**Goal**: Fast API that serves from DB, no live fan-out on reads. One refresh endpoint writes fresh data.

### Init apps/api with TypeScript and Fastify
- [x] tsconfig, eslint, basic server bootstrap
- [ ] CORS allow your web origin

### Add Prisma in apps/api
- [x] `schema.prisma` with:
  - [ ] `YieldOpportunity` table:
    - id
    - name
    - provider
    - asset
    - chain
    - apr
    - category
    - liquidity
    - risk_score
    - updated_at
  - [ ] `ProviderRefreshLog` table:
    - provider
    - status
    - rows
    - message
    - fetched_at

### Configure database
- [x] Local: file `.env` in `apps/api` with `DATABASE_URL=postgres://...`
- [x] Migrations: `prisma migrate dev`

### Add minimal modules
- [x] Risk scoring function per brief with liquidity adjustment and buckets for asset classes
- [x] Matching function that filters by risk tolerance, liquidity vs horizon, and allocation cap

### Add refresh pipeline (no worker)
- [ ] Concurrency limit, per-provider timeout, basic retry
- [ ] On success: upsert opportunities and write a log row
- [ ] On failure: keep last good rows

### Add simple config via env
- [ ] `REFRESH_KEY` for `/api/refresh` header check
- [ ] `CORS_ORIGIN` for the web app

### Validation
- [ ] Use Zod or Fastify schemas for request bodies and responses

## 4) Provider Adapters

**Goal**: Add providers by dropping in a module and registering it.

### Create an adapter interface
- [ ] In `packages/shared` or inside `apps/api`:
  - name, `fetch()` returns normalized opportunities

### Implement the three for the test
- [ ] **Lido** (EVM staking)
- [ ] **Marinade** (Solana staking)
- [ ] **DeFiLlama** (multi protocol yields)

### Registry array controls which adapters run

### Normalization rules
- [ ] Convert APR/APY to decimal APR format
- [ ] Map chain to `ethereum` or `solana`
- [ ] Derive category and liquidity
- [ ] Compute risk_score after normalization

## 5) API Endpoints

Map to the brief and to our refresh flow.

### Public Endpoints

#### GET /health
- [x] Returns `{ ok: true, lastRefreshAt }`

#### GET /api/earn/opportunities
- [x] Returns all normalized opportunities from DB

#### POST /api/earn/opportunities/match
- [ ] Accepts:
  - wallet balances
  - riskTolerance
  - maxAllocationPct
  - investmentHorizon
- [ ] Returns matchedOpportunities per brief rules

### Internal Maintenance

#### POST /api/refresh
- [ ] Protected by `X-Refresh-Key` header
- [ ] Triggers the adapter pipeline and DB upserts
- [ ] Used by Railway scheduled job

## 6) Frontend: Next.js

### Init apps/web with Next.js and TypeScript
- [ ] Config env
  - `.env.local` with `NEXT_PUBLIC_API_URL=https://<api-domain>`

### Pages
- [ ] **All Opportunities page**
  - Calls `/api/earn/opportunities`
  - Renders a table
- [ ] **My Profile page**
  - Collects balances
  - Risk tolerance
  - Horizon
  - Allocation cap
- [ ] **Matched results page**
  - Posts to `/api/earn/opportunities/match`
  - Renders results

### Network strategy
- [ ] Browser calls API directly for reads
- [ ] Optional: Add a small server route to proxy if needed

## 7) Local Environment and DX

### Create .env in apps/api
```env
DATABASE_URL=postgres://...
REFRESH_KEY=<random-long-string>
CORS_ORIGIN=http://localhost:3000
```

### Create .env.local in apps/web
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Dev commands
- [ ] Run Postgres locally or use Railway DB URL
- [ ] `pnpm --filter api dev` to start Fastify
- [ ] `pnpm --filter web dev` to start Next

### Seed flow (optional)
- [ ] Add a small script to insert 1 or 2 mock opportunities for first render

### Lint and format rules shared in root

## 8) Deploy to Railway

Two services inside one Railway project.

### Create project on Railway
- [ ] Add PostgreSQL in the project

### Add api service
- [ ] Root directory: `apps/api`
- [ ] Env vars:
  - `DATABASE_URL` (from Railway DB)
  - `REFRESH_KEY`
  - `CORS_ORIGIN` (your web domain)
- [ ] Build and start commands per your setup
- [ ] Expose port 3001 or default port
- [ ] Run Prisma migrate on first deploy

### Add web service
- [ ] Root directory: `apps/web`
- [ ] Env vars:
  - `NEXT_PUBLIC_API_URL=https://<api-service-domain>`
- [ ] Build and start commands per Next.js
- [ ] Expose port 3000

### Domains
- [ ] Assign domains to api and web services
- [ ] If calling api directly from browser, confirm CORS allows the web origin

## 9) Wire the Scheduled Refresh

### In Railway project, add a Scheduled Job that calls:
- [ ] `POST https://<api-domain>/api/refresh`
- [ ] Header `X-Refresh-Key: <REFRESH_KEY>`
- [ ] Cadence: every 5 to 10 minutes, or hourly

### Verification
- [ ] Verify logs show providers OK and any failures logged
- [ ] Confirm DB updates and lastRefreshAt changes on `/health`

## 10) Smoke Test and QA

- [ ] Hit `GET /health` and confirm ok and lastRefreshAt values
- [ ] Hit `GET /api/earn/opportunities` and confirm rows and fields per brief
- [ ] Post to `/api/earn/opportunities/match` with the example body from the brief and confirm matched list is filtered by risk and liquidity
- [ ] Toggle the scheduled job cadence and confirm updates arrive on time
- [ ] Kill one provider temporarily and confirm partial results still serve

## 11) Nice to have and Bonus

### Frontend polish
- [ ] Stale badge if updatedAt is older than N minutes
- [ ] Filters by chain, provider, category

### Metrics
- [ ] Log refresh duration, rows per provider, failures

### Circuit breaker
- [ ] Back off a provider after repeated failures

### Bonus per brief
- [ ] Wallet connect UI
- [ ] Live integration button for one provider (stake, deposit)