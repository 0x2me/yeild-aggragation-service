import { YieldOpportunity } from '@prisma/client';

// User matching request types
export interface WalletBalance {
  [asset: string]: string; // Asset symbol -> Amount as string
}

export interface MatchOpportunitiesRequest {
  walletBalance: WalletBalance;
  riskTolerance: number;      // 1-10 scale (1=lowest risk, 10=highest)
  maxAllocationPct: number;   // Max % per opportunity (0-100)
  investmentHorizon: number;   // Investment timeline in days
}

export interface MatchOpportunitiesResponse {
  matchedOpportunities: YieldOpportunity[];
  totalMatched: number;
  filters: {
    riskTolerance: number;
    investmentHorizon: number;
    maxAllocationPct: number;
  };
}

// Minimum investment thresholds (in USD equivalent)
export const MIN_INVESTMENT_THRESHOLDS: Record<string, number> = {
  ETH: 0.001,    // ~$1.5-3
  SOL: 0.1,      // ~$2-5
  USDC: 1,       // $1
  USDT: 1,       // $1
  DAI: 1,        // $1
  DEFAULT: 10    // $10 for unknown assets
};

// Helper type for enhanced opportunity with calculated fields
export interface EnhancedOpportunity extends YieldOpportunity {
  calculatedRisk?: number;
  meetsRequirements?: boolean;
  allocationAmount?: number;
}