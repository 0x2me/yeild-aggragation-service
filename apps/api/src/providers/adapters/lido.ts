import { Prisma } from "@prisma/client";
import { IProviderAdapter } from "../types";

interface LidoAPRResponse {
  data: {
    timeUnix: number;
    apr: number;
  };
  meta: {
    symbol: string;
    address: string;
    chainId: number;
  };
}

interface LidoStatsResponse {
  uniqueAnytimeHolders: string;
  uniqueHolders: string;
  totalStaked: string;
  marketCap: number;
}

/**
 * Lido provider adapter for Ethereum staking
 */
export class LidoAdapter implements IProviderAdapter {
  readonly name = "lido";
  private readonly aprUrl =
    "https://eth-api.lido.fi/v1/protocol/steth/apr/last";
  private readonly statsUrl =
    "https://eth-api.lido.fi/v1/protocol/steth/stats";

  async fetch(): Promise<Prisma.YieldOpportunityCreateInput[]> {
    try {
      // Fetch APR and stats from Lido API in parallel
      const [aprResponse, statsResponse] = await Promise.all([
        fetch(this.aprUrl),
        fetch(this.statsUrl)
      ]);

      if (!aprResponse.ok || !statsResponse.ok) {
        throw new Error(`Lido API returned error`);
      }

      const aprResult: LidoAPRResponse =
        (await aprResponse.json()) as LidoAPRResponse;
      const statsResult: LidoStatsResponse =
        (await statsResponse.json()) as LidoStatsResponse;

      // Convert APR from percentage to basis points
      // Response format: { data: { apr: 5.1 }, meta: { symbol: "stETH" } }
      // If APR is 5.1%, we need 510 basis points
      const aprInBasisPoints = Math.round(aprResult.data.apr * 100);
      
      // TVL is the marketCap from stats (~$40B)
      const tvl = statsResult.marketCap;

      // Calculate risk score based on TVL
      // $40B+ TVL = very low risk (score 2)
      // $10B-40B = low risk (score 3)
      // $1B-10B = medium-low risk (score 4)
      let riskScore = 5;
      if (tvl > 40_000_000_000) riskScore = 2;
      else if (tvl > 10_000_000_000) riskScore = 3;
      else if (tvl > 1_000_000_000) riskScore = 4;

      const opportunities: Prisma.YieldOpportunityCreateInput[] = [
        {
          name: "Lido stETH",
          provider: "lido",
          asset: aprResult.meta?.symbol || "stETH",
          chain: "ethereum",
          apr: aprInBasisPoints,
          category: "staking",
          liquidity: "liquid",
          riskScore,
        },
      ];
      
      console.log(`Lido: APR ${aprResult.data.apr}%, TVL $${(tvl / 1e9).toFixed(1)}B, Risk Score ${riskScore}`);

      return opportunities;
    } catch (error) {
      console.error(`Error fetching Lido opportunities:`, error);
      throw error;
    }
  }
}
