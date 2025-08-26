# Yield Aggregation dApp Architecture

## Overview

This document outlines the architecture of the Yield Aggregation dApp, which aggregates yield data from multiple DeFi protocols and serves it efficiently to users through a modern web interface.

### Tech Stack
- **Frontend**: Next.js
- **Backend**: Fastify + Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Railway (multi-service deployment)
- **Key Features**: Stateless backend, scheduled data refresh, adapter pattern for extensibility

## System Components

### 1. Frontend (Next.js)

#### Responsibilities
- **User Interface**: Renders aggregated yield information in a user-friendly format
- **Client-Side Authentication**: Manages wallet connections and user identity (e.g., via Dynamic)
- **API Consumption**: Fetches data from backend REST endpoints

#### Key Design Decisions
- No direct communication with external yield providers
- All sensitive operations handled by backend
- Stateless communication with backend (no session management)

### 2. Backend (Fastify + Prisma)

#### Responsibilities
- **REST API Server**: Exposes `/api/*` endpoints for frontend consumption
- **Data Aggregation**: Implements adapter pattern for multiple yield providers
- **Database Management**: Uses Prisma ORM for type-safe database operations
- **Security**: Manages API keys and secrets as environment variables

#### Core Features
- High-performance request handling via Fastify
- Type-safe database queries through Prisma
- Protected refresh endpoint with secret token authentication
- Extensible adapter system for yield providers

### 3. Database (PostgreSQL)

#### Purpose
- Stores aggregated yield data for fast retrieval
- Eliminates need for per-request external API calls
- Provides single source of truth for yield information

#### Schema Management
- Defined and managed through Prisma schema
- Automated migrations via Prisma
- Type-safe models shared across application

## API Endpoints

### Public Endpoints

#### `GET /api/yields`
- Returns current aggregated yield data from database
- Fast response times (no external API calls)
- Data format: Normalized yield entries with provider info, APY, timestamp
- Optional: Query parameters for filtering by provider/asset

### Protected Endpoints

#### `POST /api/refresh`
- Triggers yield data refresh from all providers
- Protected by secret header (`X-Refresh-Secret`)
- Called only by scheduled jobs
- Process:
  1. Validates authentication token
  2. Calls all provider adapters
  3. Normalizes and stores data in PostgreSQL
  4. Returns update summary

## Data Refresh Architecture

### Scheduled Job Strategy
- **Platform**: Railway Cron Jobs
- **Frequency**: Configurable (hourly/daily based on requirements)
- **Security**: Includes secret token in request headers
- **Benefits**:
  - No user-facing downtime
  - Consistent data freshness
  - Decoupled from user requests

### Refresh Process Flow
```
Railway Cron → POST /api/refresh → Provider Adapters → Database Update
```

## Adapter Pattern Implementation

### Structure
Each yield provider has a dedicated adapter module that:
- Fetches data from provider's API/blockchain
- Transforms data to common format
- Handles provider-specific quirks

### Common Interface
```typescript
interface YieldAdapter {
  fetchData(): Promise<YieldData[]>
  normalize(rawData: any): YieldData
}
```

### Benefits
- **Extensibility**: Easy addition of new providers
- **Maintainability**: Isolated provider logic
- **Standardization**: Uniform data format across providers
- **Resilience**: Provider failures don't affect others

### Example Providers
- Protocol A: REST API integration
- Protocol B: Blockchain/subgraph queries
- Protocol C: WebSocket connections

## Deployment Architecture

### Railway Services Configuration

#### Service Separation
1. **Frontend Service**: Next.js application
2. **Backend Service**: Fastify API server
3. **Database Service**: PostgreSQL instance
4. **Cron Service**: Scheduled refresh jobs

#### Environment Variables
- Database connection strings
- API keys for yield providers
- Refresh endpoint secret token
- Frontend API base URL

### Network Architecture
```
User → Frontend (Next.js) → Backend API (Fastify) → PostgreSQL
                                ↑
                         Railway Cron Job
```

## Design Decisions & Rationale

### 1. Separation of Concerns
- **Frontend**: Pure presentation layer
- **Backend**: Business logic and data management
- **Benefits**: Security, scalability, maintainability

### 2. Stateless Backend
- No server-side sessions
- Authentication handled client-side
- Enables horizontal scaling
- Simplifies deployment

### 3. Database-First Approach
- Serve cached data from PostgreSQL
- Update via background jobs
- Trade-off: Slight staleness for performance
- Result: Sub-second response times

### 4. Type Safety with Prisma
- Compile-time error detection
- Auto-generated TypeScript types
- Simplified migrations
- Reduced runtime errors

### 5. Performance Optimization
- Fastify for high-throughput request handling
- PostgreSQL indexing for quick queries
- CDN potential for frontend assets
- Horizontal scaling capability

## Scalability Considerations

### Horizontal Scaling
- Stateless backend allows multiple instances
- Load balancer distribution
- No session affinity required

### Database Scaling
- Vertical scaling for single instance
- Read replicas for high-read workloads
- Connection pooling via Prisma

### Frontend Scaling
- Static export option for CDN deployment
- Edge deployment capabilities
- Asset optimization

## Security Measures

1. **Secret Management**: Environment variables for sensitive data
2. **API Protection**: Token-based authentication for refresh endpoint
3. **Input Validation**: Fastify schemas for request validation
4. **Rate Limiting**: Configurable per-endpoint limits
5. **CORS Configuration**: Restricted origin access

## Future Enhancements

### Potential Features
- WebSocket support for real-time updates
- Historical yield data tracking
- User preferences/watchlists (client-side)
- Advanced filtering and sorting
- Multi-chain support expansion

### Technical Improvements
- Redis caching layer
- GraphQL API option
- Monitoring and alerting
- A/B testing framework
- Analytics integration

## Conclusion

This architecture provides a robust, scalable, and maintainable foundation for a yield aggregation platform. The clear separation of concerns, type safety, and extensible design patterns ensure the system can grow and adapt to changing requirements while maintaining high performance and reliability.