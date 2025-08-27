import { Prisma } from "@prisma/client";
import { IProviderAdapter } from "../types";

interface DefiLlamaPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase?: number;
  apyReward?: number;
  apy?: number;
  rewardTokens?: string[];
  pool: string;
  poolMeta?: string;
  underlyingTokens?: string[];
  il7d?: number | null;
  apyMean30d?: number;
  volumeUsd1d?: number;
  volumeUsd7d?: number;
  stablecoin: boolean;
}

/**
 * DeFiLlama provider adapter for multi-protocol yields
 */
export class DeFiLlamaAdapter implements IProviderAdapter {
  readonly name = "defillama";
  private readonly apiUrl = "https://yields.llama.fi/pools";
  
  // Hardcoded top 3 pools - high TVL and good yields
  private readonly targetPools = [
    '80b8bf92-b953-4c20-98ea-c9653ef2bb98', // binance-staked-eth WBETH (~2.48% APY, $14B TVL)
    '46bd2bdf-6d92-4066-b482-e885ee172264', // ether.fi-stake WEETH (~3.21% APY, $12B TVL)
    'aa70268e-4b52-42bf-a116-608b370f9501'  // aave-v3 USDC (~4.37% APY, $1B TVL)
  ];

  async fetch(): Promise<Prisma.YieldOpportunityCreateInput[]> {
    try {
      // Fetch pools from DeFiLlama API
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`DeFiLlama API returned ${response.status}`);
      }

      const result = await response.json() as { data: DefiLlamaPool[] };
      const pools: DefiLlamaPool[] = result.data;

      // Filter for only our hardcoded top 3 pools
      const topPools = pools.filter(pool => 
        this.targetPools.includes(pool.pool)
      );

      const opportunities: Prisma.YieldOpportunityCreateInput[] = topPools.map(pool => {
        // Get total APY (base + rewards)
        const totalApy = pool.apy || pool.apyBase || 0;
        const aprInBasisPoints = Math.round(totalApy * 100);

        // Determine category based on project type
        let category = "vault";
        if (pool.project.toLowerCase().includes("lend") || 
            pool.project.toLowerCase().includes("aave") || 
            pool.project.toLowerCase().includes("compound")) {
          category = "lending";
        } else if (pool.project.toLowerCase().includes("stak") ||
                   pool.project.toLowerCase().includes("eth")) {
          category = "staking";
        }

        // TODO: Implement proper risk scoring algorithm
        // For now, using a placeholder risk score of 5 (medium)
        const riskScore = 5;

        return {
          name: `${pool.project} - ${pool.symbol}`,
          provider: "defillama",
          asset: pool.symbol,
          chain: pool.chain.toLowerCase() as "ethereum" | "solana",
          apr: aprInBasisPoints,
          category,
          liquidity: pool.stablecoin ? "liquid" : "locked",
          riskScore,
        };
      });

      return opportunities;
    } catch (error) {
      console.error(`Error fetching DeFiLlama opportunities:`, error);
      throw error;
    }
  }
}