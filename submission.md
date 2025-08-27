# Yield Aggregation Service - Project Submission

## Overview

A DeFi yield aggregation platform that discovers and displays the best yield opportunities across multiple chains.

## Architecture

### Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS + ShadCN UI
- **Backend**: Fastify + TypeScript + Prisma ORM
- **Database**: PostgreSQL
- **Blockchain Integration**: Wagmi + Viem + Dynamic Wallet

### Project Structure

```
yeild-aggragation-service/
├── apps/
│   ├── api/          # Backend API (Fastify)
│   └── web/          # Frontend app (React/Vite)
└── packages/         # Shared packages (monorepo)
```

## API Endpoints

### Public Endpoints

- `GET /health` - Health check with database status
- `GET /api/earn/opportunities` - List all yield opportunities
  - Query params: `chain`, `category`, `sortBy`, `order`, `limit`, `offset`
- `GET /api/earn/opportunities/:id` - Get specific opportunity
- `POST /api/earn/opportunities/match` - Match opportunities to user profile

### Protected Endpoints

- `POST /api/refresh` - Refresh data from providers (requires X-Refresh-Key header)

## Features

### Frontend

- **Yield Opportunities Display**: Browse DeFi yields across Ethereum and Solana
- **Filtering & Sorting**: Filter by chain, category, liquidity type
- **Risk Assessment**: Visual risk scores (1-10) for each opportunity
- **Wallet Integration**: Connect wallet using Dynamic SDK with Wagmi
- **Aave Deposit**: Direct USDC deposits to Aave protocol
- **Responsive Design**: Mobile-friendly cyberpunk-themed UI

### Backend

- **Multi-Provider Support**: Aggregates data from Lido, Aave, Compound, Yearn, etc.
- **Real-time Updates**: Refresh mechanism to fetch latest APRs
- **Database Persistence**: PostgreSQL with Prisma ORM
- **Type Safety**: Full TypeScript with Zod validation

## Deployment

### Frontend (Vercel)

- **URL**: https://web-dusky-eight-64.vercel.app
- **Build**: `pnpm build` (Vite production build)
- **Environment Variables**:
  - `VITE_API_URL` - Backend API URL
  - `VITE_DYNAMIC_ENVIRONMENT_ID` - Dynamic wallet ID

### Backend (Railway)

- **URL**: https://back-production-2919.up.railway.app
- **Build**: Docker container with Node.js 18
- **Database**: Railway PostgreSQL instance
- **Auto-migrations**: Prisma schema push on startup
- **Environment Variables**:
  - `DATABASE_URL` - PostgreSQL connection string
  - `API_KEY` - API authentication key
  - `REFRESH_KEY` - Admin refresh endpoint key
  - `CORS_ORIGIN` - Allowed origins

## Key Integrations

### Wallet Connection (Dynamic + Wagmi)

- Multi-chain wallet support (Ethereum, Solana)
- WalletConnect, MetaMask, and other providers
- Seamless transaction signing

### Aave Protocol Integration

- Direct USDC deposits to Aave V3
- Approval and deposit flow
- Real-time transaction status

### Data Providers

- **DefiLlama**: Comprehensive DeFi protocol data
- **Direct Integrations**: Lido, Marinade, custom providers
- **Automatic Refresh**: Scheduled data updates

## Database Schema

### Main Tables

- `yield_opportunities` - Stores all yield opportunities
- `refresh_logs` - Tracks data refresh history
- `user_profiles` - User risk preferences (future feature)

## Security

- Environment variable management
- API key authentication for admin endpoints
- CORS configuration for production domains
- Input validation with Zod schemas

## Future Enhancements

- User authentication system
- Portfolio tracking
- Automated yield optimization
- Cross-chain bridging
- Mobile app version

## Q&A - Spec Requirements

### Q: How would you handle high traffic and scale the application?

**A:**

- Add Redis caching layer for opportunities data (5-min TTL)
- Deploy multiple backend instances with load balancer

### Q: How would you secure the API endpoints?

**A:**

- JWT authentication for user endpoints
- API key rotation system

### Q: What monitoring would you implement?

**A:**

- Sentry for error tracking
- Prometheus + Grafana for metrics

### Q: How would you handle different blockchain networks?

**A:**

- Chain-specific adapters (EVM, Solana, etc.)

### Q: How would you ensure data accuracy?

**A:**

- Multiple data source validation
- Outlier detection for APR values
