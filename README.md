# Yield Aggregation Service

A multi-chain DeFi yield aggregation service that normalizes and matches yield opportunities across Ethereum and Solana ecosystems.

## Architecture

See [architecture.md](./architecture.md) for detailed system design.

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL (local or Railway)
- Railway CLI (optional)

### Installation

```bash
pnpm install
```

### Environment Variables

#### API (`apps/api/.env`)
```env
DATABASE_URL=postgresql://...
REFRESH_KEY=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

#### Web (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
# Run all services
pnpm dev

# Run specific service
pnpm --filter api dev
pnpm --filter web dev

# Database migrations
pnpm --filter api db:migrate
```

## Services

- **API**: Fastify server with Prisma ORM (port 3001)
- **Web**: Next.js frontend application (port 3000)
- **Shared**: Common types and utilities

## Deployment

This project is configured for Railway deployment with:
- PostgreSQL database
- Scheduled refresh jobs
- Auto-scaling services

See deployment section in [tasks.md](./tasks.md) for details.