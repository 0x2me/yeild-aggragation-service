export interface YieldOpportunity {
  id: string;
  name: string;
  provider: string;
  asset: string;
  chain: 'ethereum' | 'solana';
  apr: number; // in basis points (280 = 2.8%)
  category: 'staking' | 'lending' | 'vault';
  liquidity: 'liquid' | 'locked';
  riskScore: number; // 1-10
  updatedAt: string;
  createdAt: string;
}

export interface OpportunitiesResponse {
  opportunities: YieldOpportunity[];
  total: number;
  limit: number;
  offset: number;
  filters?: Record<string, any>;
}

export interface UserProfile {
  walletBalance: Record<string, string>;
  riskTolerance: number; // 1-10
  maxAllocationPct: number; // 0-100
  investmentHorizon: number; // days
}

export interface MatchResponse {
  matchedOpportunities: YieldOpportunity[];
  totalMatched: number;
  filters: Partial<UserProfile>;
}

export interface OpportunityFilters {
  provider?: string;
  chain?: 'ethereum' | 'solana';
  category?: 'staking' | 'lending' | 'vault';
  minApr?: number;
  maxRisk?: number;
  liquidity?: 'liquid' | 'locked';
  sortBy?: 'apr' | 'risk' | 'updated';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}