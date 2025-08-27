# Lovable Frontend Integration Guide

## API Base URL
- Local Development: `http://localhost:3001`
- Production: `https://your-api-domain.com`

## Authentication
All endpoints except `/health` require Bearer token authentication:
```
Authorization: Bearer <your-api-key>
```

For local development, use: `dev-api-key-change-in-production`

## Available Endpoints

### 1. Health Check
**No authentication required**
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-08-26T22:00:00.000Z"
}
```

---

### 2. Get All Yield Opportunities
```
GET /api/earn/opportunities
```

Query Parameters (all optional):
- `provider` - Filter by provider (lido, marinade, defillama)
- `chain` - Filter by chain (ethereum, solana)
- `category` - Filter by category (staking, lending, vault)
- `minApr` - Minimum APR filter (0-1, e.g., 0.05 for 5%)
- `maxRisk` - Maximum risk score (1-10)
- `liquidity` - Filter by liquidity (liquid, locked)
- `sortBy` - Sort field (apr, risk, updated) - default: apr
- `order` - Sort order (asc, desc) - default: desc
- `limit` - Results per page (1-100) - default: 50
- `offset` - Pagination offset - default: 0

Example Request:
```
GET /api/earn/opportunities?chain=ethereum&category=staking&sortBy=apr&order=desc
Authorization: Bearer dev-api-key-change-in-production
```

Response:
```json
{
  "opportunities": [
    {
      "id": "cmet3bk0e0001d6jps4n77l24",
      "name": "Lido stETH",
      "provider": "lido",
      "asset": "stETH",
      "chain": "ethereum",
      "apr": 280,  // APR in basis points (280 = 2.8%)
      "category": "staking",
      "liquidity": "liquid",
      "riskScore": 2,  // 1-10 scale (lower is safer)
      "updatedAt": "2025-08-26T22:00:59.918Z",
      "createdAt": "2025-08-26T22:00:59.918Z"
    },
    // ... more opportunities
  ],
  "total": 20,
  "limit": 50,
  "offset": 0,
  "filters": {
    "chain": "ethereum",
    "category": "staking"
  }
}
```

---

### 3. Match Opportunities to User Profile
```
POST /api/earn/opportunities/match
Content-Type: application/json
```

Request Body:
```json
{
  "walletBalance": {
    "ETH": "10.5",
    "USDC": "5000",
    "SOL": "100"
  },
  "riskTolerance": 5,        // 1-10 scale (1=very conservative, 10=very aggressive)
  "maxAllocationPct": 30,    // Maximum % of balance per opportunity (0-100)
  "investmentHorizon": 365   // Days willing to lock funds
}
```

Response:
```json
{
  "matchedOpportunities": [
    {
      "id": "cmet3bk0e0001d6jps4n77l24",
      "name": "Lido stETH",
      "provider": "lido",
      "asset": "stETH",
      "chain": "ethereum",
      "apr": 280,
      "category": "staking",
      "liquidity": "liquid",
      "riskScore": 2,
      "updatedAt": "2025-08-26T22:00:59.918Z"
    },
    // ... more matched opportunities
  ],
  "totalMatched": 5,
  "filters": {
    "riskTolerance": 5,
    "investmentHorizon": 365,
    "maxAllocationPct": 30
  }
}
```

---

### 4. Get Single Opportunity
```
GET /api/earn/opportunities/:id
```

Example:
```
GET /api/earn/opportunities/cmet3bk0e0001d6jps4n77l24
Authorization: Bearer dev-api-key-change-in-production
```

Response:
```json
{
  "id": "cmet3bk0e0001d6jps4n77l24",
  "name": "Lido stETH",
  "provider": "lido",
  "asset": "stETH",
  "chain": "ethereum",
  "apr": 280,
  "category": "staking",
  "liquidity": "liquid",
  "riskScore": 2,
  "updatedAt": "2025-08-26T22:00:59.918Z",
  "createdAt": "2025-08-26T22:00:59.918Z"
}
```

---

## Data Formats

### APR (Annual Percentage Rate)
- Stored as **basis points** (integer)
- 100 basis points = 1%
- Example: `apr: 350` means 3.5% APR

### Risk Score
- Scale: 1-10
- 1-2: Very Low Risk (established protocols, high TVL)
- 3-4: Low Risk
- 5-6: Medium Risk
- 7-8: High Risk
- 9-10: Very High Risk

### Categories
- `staking` - Liquid staking tokens (stETH, mSOL)
- `lending` - Lending protocols (Aave, Compound)
- `vault` - Yield vaults and LP positions

### Liquidity
- `liquid` - Can withdraw anytime
- `locked` - Funds are locked for a period

### Chains
- `ethereum` - Ethereum mainnet
- `solana` - Solana mainnet

---

## Example Frontend Integration (React/TypeScript)

```typescript
// api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-change-in-production';

export async function fetchOpportunities(filters?: {
  chain?: string;
  category?: string;
  minApr?: number;
}) {
  const params = new URLSearchParams(filters as any);
  const response = await fetch(`${API_URL}/api/earn/opportunities?${params}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch opportunities');
  }
  
  return response.json();
}

export async function matchOpportunities(profile: {
  walletBalance: Record<string, string>;
  riskTolerance: number;
  maxAllocationPct: number;
  investmentHorizon: number;
}) {
  const response = await fetch(`${API_URL}/api/earn/opportunities/match`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profile)
  });
  
  if (!response.ok) {
    throw new Error('Failed to match opportunities');
  }
  
  return response.json();
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error Type",
  "message": "Human readable error message"
}
```

Common HTTP status codes:
- `401` - Unauthorized (missing or invalid API key)
- `400` - Bad Request (invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## CORS Configuration

The API is configured to accept requests from:
- Local development: `http://localhost:3000`
- Production: Configure `CORS_ORIGIN` environment variable

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- Adding rate limiting middleware
- Implementing caching for frequently accessed data
- Using CDN for static responses

---

## Notes for Frontend Development

1. **APR Display**: Remember to divide APR by 100 to get percentage (e.g., 280 → 2.8%)
2. **Sorting**: Default sort is by APR descending (highest yields first)
3. **Risk Filtering**: Users typically want opportunities at or below their risk tolerance
4. **Refresh**: Opportunities are refreshed every 5-10 minutes via backend job
5. **Matching Logic**: The match endpoint filters based on:
   - Risk tolerance (only returns opportunities with riskScore ≤ user's tolerance)
   - Investment horizon (filters locked opportunities if horizon is too short)
   - Returns top opportunities sorted by APR

---

## Environment Variables for Frontend

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=dev-api-key-change-in-production
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_API_KEY=your-production-api-key
```