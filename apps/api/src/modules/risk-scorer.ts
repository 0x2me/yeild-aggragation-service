import { YieldOpportunity } from '@prisma/client';

const STABLECOINS = ['USDC', 'USDT', 'DAI', 'FRAX'];
const MAJOR_ASSETS = ['ETH', 'SOL', 'WETH', 'stETH', 'mSOL'];

export function calculateRiskScore(opportunity: Partial<YieldOpportunity>): number {
  if (!opportunity.asset) {
    return 5; // Default medium risk if asset is unknown
  }

  let baseRisk: number;
  
  // Determine base risk based on asset type
  if (STABLECOINS.includes(opportunity.asset.toUpperCase())) {
    // Stablecoins: low risk (1-3)
    baseRisk = Math.floor(Math.random() * 3) + 1;
  } else if (MAJOR_ASSETS.includes(opportunity.asset.toUpperCase())) {
    // Major assets: medium risk (4-6)
    baseRisk = Math.floor(Math.random() * 3) + 4;
  } else {
    // Other assets: high risk (7-9)
    baseRisk = Math.floor(Math.random() * 3) + 7;
  }
  
  // Liquidity adjustment: locked positions carry additional risk
  const liquidityRisk = opportunity.liquidity === 'locked' ? 1 : 0;
  
  // Calculate final score, capped at 10
  const finalScore = Math.min(10, baseRisk + liquidityRisk);
  
  return finalScore;
}

export function assessRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 3) return 'low';
  if (score <= 6) return 'medium';
  return 'high';
}

export function isAcceptableRisk(opportunityRisk: number, userTolerance: number): boolean {
  return opportunityRisk <= userTolerance;
}