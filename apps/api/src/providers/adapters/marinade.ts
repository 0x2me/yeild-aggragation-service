import { Prisma } from "@prisma/client";
import { IProviderAdapter } from "../types";

interface MarinadeAPYResponse {
  value: number;
  end_time: string;
  end_price: number;
  start_time: string;
  start_price: number;
}

/**
 * Marinade provider adapter for Solana staking
 */
export class MarinadeAdapter implements IProviderAdapter {
  readonly name = "marinade";
  private readonly apiUrl = "https://api.marinade.finance/msol/apy/1y";

  async fetch(): Promise<Prisma.YieldOpportunityCreateInput[]> {
    try {
      // Fetch APY from Marinade API
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`Marinade API returned ${response.status}`);
      }

      const result: MarinadeAPYResponse = await response.json() as MarinadeAPYResponse;

      // Convert APY to APR in basis points
      // value is APY as decimal (e.g., 0.1459 for 14.59%)
      // Convert to basis points (14.59% = 1459 basis points)
      const aprInBasisPoints = Math.round(result.value * 10000);

      const opportunities: Prisma.YieldOpportunityCreateInput[] = [
        {
          name: "Marinade mSOL",
          provider: "marinade",
          asset: "mSOL",
          chain: "solana",
          apr: aprInBasisPoints,
          category: "staking",
          liquidity: "liquid",
          riskScore: 4, // Medium-low risk
        },
      ];

      return opportunities;
    } catch (error) {
      console.error(`Error fetching Marinade opportunities:`, error);
      throw error;
    }
  }
}