/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import { calculateRiskScore } from "../src/modules/risk-scorer";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.yieldOpportunity.deleteMany();
  await prisma.providerRefreshLog.deleteMany();

  // Sample yield opportunities data
  const opportunities = [
    // Stablecoins - Low Risk
    {
      id: "lido-steth-01",
      name: "Lido stETH",
      provider: "lido",
      asset: "stETH",
      chain: "ethereum" as const,
      apr: 350, // 3.5% = 350 basis points
      category: "staking",
      liquidity: "liquid" as const,
    },
    {
      id: "aave-usdc-lending",
      name: "Aave USDC Lending",
      provider: "aave",
      asset: "USDC",
      chain: "ethereum" as const,
      apr: 280, // 2.8% = 280 basis points
      category: "lending",
      liquidity: "liquid" as const,
    },
    {
      id: "compound-dai-01",
      name: "Compound DAI Supply",
      provider: "compound",
      asset: "DAI",
      chain: "ethereum" as const,
      apr: 320, // 3.2% = 320 basis points
      category: "lending",
      liquidity: "liquid" as const,
    },
    // Major Assets - Medium Risk
    {
      id: "marinade-msol-01",
      name: "Marinade mSOL",
      provider: "marinade",
      asset: "mSOL",
      chain: "solana" as const,
      apr: 650, // 6.5% = 650 basis points
      category: "staking",
      liquidity: "liquid" as const,
    },
    {
      id: "rocket-pool-eth",
      name: "Rocket Pool ETH",
      provider: "rocket-pool",
      asset: "ETH",
      chain: "ethereum" as const,
      apr: 420, // 4.2% = 420 basis points
      category: "staking",
      liquidity: "locked" as const,
    },
    {
      id: "jito-sol-staking",
      name: "Jito SOL Staking",
      provider: "jito",
      asset: "SOL",
      chain: "solana" as const,
      apr: 710, // 7.1% = 710 basis points
      category: "staking",
      liquidity: "locked" as const,
    },
    // Higher Risk DeFi
    {
      id: "yearn-curve-3pool",
      name: "Yearn Curve 3Pool Vault",
      provider: "yearn",
      asset: "USDC",
      chain: "ethereum" as const,
      apr: 550, // 5.5% = 550 basis points
      category: "vault",
      liquidity: "liquid" as const,
    },
    {
      id: "convex-frax",
      name: "Convex FRAX Pool",
      provider: "convex",
      asset: "FRAX",
      chain: "ethereum" as const,
      apr: 480, // 4.8% = 480 basis points
      category: "vault",
      liquidity: "liquid" as const,
    },
    {
      id: "gmx-glp-01",
      name: "GMX GLP Vault",
      provider: "gmx",
      asset: "GLP",
      chain: "ethereum" as const,
      apr: 1250, // 12.5% = 1250 basis points
      category: "vault",
      liquidity: "locked" as const,
    },
    {
      id: "tulip-ray-vault",
      name: "Tulip RAY Lending",
      provider: "tulip",
      asset: "RAY",
      chain: "solana" as const,
      apr: 890, // 8.9% = 890 basis points
      category: "lending",
      liquidity: "liquid" as const,
    },
  ];

  // Calculate risk scores and insert opportunities
  for (const opp of opportunities) {
    const riskScore = calculateRiskScore(opp);

    await prisma.yieldOpportunity.create({
      data: {
        ...opp,
        riskScore: riskScore,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Created opportunity: ${opp.name} (Risk: ${riskScore}/10)`);
  }

  // Add sample provider refresh logs
  const providers = ["lido", "marinade", "aave", "compound", "yearn"];

  for (const provider of providers) {
    await prisma.providerRefreshLog.create({
      data: {
        provider,
        status: "success",
        rows: Math.floor(Math.random() * 5) + 1,
        message: "Data fetched successfully",
        fetchedAt: new Date(),
      },
    });

    console.log(`📝 Created refresh log for: ${provider}`);
  }

  console.log("\n✨ Seed completed successfully!");
  console.log(`Total opportunities: ${opportunities.length}`);
  console.log(`Total providers logged: ${providers.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
