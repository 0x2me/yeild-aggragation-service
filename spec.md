# Tech Test — Yield Aggregation Service

Time: 4-8 hours | TypeScript / NodeJS

## Problem Statement

We're building a dApp with an earn section that helps users discover yield-generating opportunities. The earn section will offer the following types of opportunities:

- Liquid Staking: ETH and SOL liquid staking protocols
- Multi-Protocol Yields: Various DeFi protocols aggregated through DeFiLlama

You need to build a system that stays up-to-date with various yield providers - at least one from each ecosystem (EVM and Solana). Select from the providers below:

### EVM Options
- **Lido**: https://eth-api.lido.fi/v1/protocol/steth/apr/last (ETH liquid staking)
- **DeFiLlama**: https://yields.llama.fi/pools (Multiple DeFi protocols)

### Solana
- **Marinade**: https://api.marinade.finance/msol/apy/{period} (SOL liquid staking)

**Critical Design Requirement**: Your solution must be architected to easily support 10+ providers in the near future. Design for extensibility from the start.

The goal of this system is to not only provide a full list of available opportunities, but also surface relevant opportunities to our users based on their risk profiles.

## Required Endpoints

```
GET /api/earn/opportunities       // List all normalized opportunities
POST /api/earn/opportunities/match // Find opportunities matching user profile
GET /health                        // Service health check
```

**Implementation Note**: The `/api/earn/opportunities` endpoint should not fan out to live-fetch from all providers on each request. Consider how you would keep opportunity data fresh while maintaining reasonable response times. Consider documenting your approach to data freshness and update strategies as this will be discussed in the subsequent technical interview.

## Core Requirements

### 1. Data Normalization

Transform all provider responses into this unified format:

```typescript
enum OpportunityCategory {
  STAKING = 'staking',
  LENDING = 'lending',
  VAULT = 'vault'
}

interface YieldOpportunity {
  id: string;                      // Generated from provider + pool/symbol
  name: string;                    // Derived from project/provider name
  provider: string;                // From API or known (lido, marinade, etc.)
  asset: string;                   // From symbol field
  chain: 'ethereum' | 'solana';    // From chain field or provider type
  apr: number;                     // From apy/apr field (decimal format: 0.041 = 4.1%)
  category: OpportunityCategory;   // Derived from provider type
  liquidity: 'liquid' | 'locked';  // Derived from provider/opportunity type
  riskScore: number;               // 1-10 scale (calculated)
  updatedAt: string;               // ISO timestamp when fetched
}
```

Note: You don't need to write automated tests or set up a database - in-memory storage is fine for this exercise.

### 2. User Matching

The matching endpoint receives user parameters including risk tolerance:

```typescript
POST /api/earn/opportunities/match

Request Body:
{
  "walletBalance": {
    "ETH": "5.0",
    "SOL": "100",
    "USDC": "10000"
  },
  "riskTolerance": 7,      // 1-10 scale (1=lowest risk, 10=highest risk)
  "maxAllocationPct": 25,   // Max % per opportunity
  "investmentHorizon": 90   // Investment timeline in days
}

Response:
{
  "matchedOpportunities": [
    // Filtered opportunities where:
    // - User has sufficient balance for minimum investment
    // - Opportunity risk <= user risk tolerance
    // - Opportunity liquidity aligns with investment horizon
    // - Allocation size is reasonable
  ]
}
```

Note: The riskTolerance is a 1-10 scale where 1 represents the lowest risk tolerance and 10 represents the highest. The investmentHorizon helps match opportunities to user time preferences - shorter horizons favor liquid opportunities, longer horizons can accommodate locked staking. You can set these parameters arbitrarily to test different matching scenarios.

### 3. Risk Scoring and Business Logic

To enable opportunity matching, each opportunity needs a risk score. Your implementation should include basic risk assessment logic that considers factors like asset type and liquidity constraints.

Here's a starting point for risk scoring that you can build upon:

```typescript
function calculateRiskScore(opportunity: YieldOpportunity): number {
  const STABLECOINS = ['USDC', 'USDT', 'DAI', 'FRAX'];
  const MAJOR_ASSETS = ['ETH', 'SOL', 'WETH'];
  
  let baseRisk: number;
  
  if (STABLECOINS.includes(opportunity.asset)) {
    baseRisk = Math.floor(Math.random() * 3) + 1; // 1-3
  } else if (MAJOR_ASSETS.includes(opportunity.asset)) {
    baseRisk = Math.floor(Math.random() * 3) + 4; // 4-6
  } else {
    baseRisk = Math.floor(Math.random() * 3) + 7; // 7-9
  }
  
  // Liquidity adjustment: locked positions carry additional risk
  const liquidityRisk = opportunity.liquidity === 'locked' ? 1 : 0;
  
  return Math.min(10, baseRisk + liquidityRisk);
}
```

Code Explanation: The liquidity risk calculation adds 1 to the risk score for locked positions, 0 for liquid positions.

Your matching logic should filter opportunities based on the user's criteria and return relevant results.

### 4. Provider Architecture

As you design your system, consider these architectural challenges:

- How would you add a new provider with a different API structure?
- What if a provider changes their API format?
- How do you handle providers that are temporarily unavailable?
- What about providers with different data refresh rates?

## What We're Testing For

Your solution will be evaluated on the following criteria:

- **System Design**: Clean provider abstractions, error handling, extensible architecture
- **Data Processing**: API integration quality, data normalization across different formats
- **Business Logic**: Matching logic and risk assessment approach
- **Code Quality**: Clear structure, readable code, proper error handling, input validation

## Technical Requirements

- **Framework**: e.g. Express, Hono.js, Fastify, etc.
- **Language**: TypeScript
- **Validation**: Request/response validation (Zod recommended)
- **Error Handling**: Graceful API failure handling with retry functionality
- **Architecture**: Designed for easy provider addition

## Key Questions Your Solution Should Address

- How easy is it to add a new provider without changing existing code?
- What happens when a provider API goes down during market hours?
- How do you handle different data refresh rates across providers?
- How would you validate that your risk scoring makes sense?

## Deliverables

- Codebase uploaded to GitHub repository and access shared with dennisfurrer
- Working service with all endpoints functional
- README with setup instructions and API examples
- Document describing how you would approach testing if you were asked to build this feature in a fast moving, requirement-shifting environment
- Briefly discuss if/how you would approach data storage/caching for this system

## Bonus Sections (Optional)

### Bonus 1: Frontend Implementation

A frontend would massively improve the demo quality of your yield aggregation service and shows that you understand the developer experience of how your backend APIs are consumed on the frontend, demonstrating a holistic full-stack skillset. We're happy for you to leverage AI tools to put this together quickly since it's not core to the main task.

**Suggested Features:**

- **All Opportunities**: Display the complete list of available yield opportunities
- **My Profile**: Interface for setting user parameters (wallet balance, risk tolerance, allocation limits, etc.)
- **My Opportunities**: Show matched opportunities based on user profile
- **Wallet Connection**: Integration with any wallet provider (Dynamic.xyz is a good option, but use whatever you prefer)

If you do use AI tools to accelerate development (Lovable, Cursor, Claude, etc.), we'd love to hear which tool(s) you chose, why you opted for them, and what your experience was like using them!

### Bonus 2: Live Integration

Take it a step further by integrating with one of your selected yield providers to enable actual position entry. Implement transaction signing and confirmation handling, with a basic visual indicator showing successful position entry.

**Suggested Approaches:**

- **Simple**: In the opportunities list view, add action buttons (e.g., "Stake", "Lend", "Deposit") to opportunities from your integrated provider. On click, trigger wallet transaction signing and show a success toast upon confirmation.
- **Comprehensive**: Build a complete transaction flow with amount input, transaction preview, gas estimation, loading states during confirmation, transaction hash display, and error handling for failed transactions across different opportunity types.

Note: You'll need to research the appropriate integration method for your chosen provider - this may involve direct smart contract interactions, SDK usage, or API endpoints depending on the protocol.

This demonstrates your end-to-end Web3 integration skillset beyond just data aggregation.

## Technical Interview Discussion Topics

Be prepared to discuss the following topics in the technical interview that follows this test:

- **Scaling your yield aggregation system**: How you would handle significant growth in providers, user requests, and data volume as the platform expands
- **Production monitoring and observability**: Metrics, logging, and alerting strategies for your earn service infrastructure
- **Performance optimization**: Caching strategies, database design, and handling concurrent yield data fetching
- **System reliability**: Circuit breakers, fallback mechanisms, and handling provider API outages
- **Security considerations**: Protecting user wallet data, API authentication, and preventing abuse of your endpoints