-- CreateTable
CREATE TABLE "yield_opportunities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "apr" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "liquidity" DOUBLE PRECISION NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yield_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_refresh_logs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rows" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_refresh_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "yield_opportunities_chain_idx" ON "yield_opportunities"("chain");

-- CreateIndex
CREATE INDEX "yield_opportunities_provider_idx" ON "yield_opportunities"("provider");

-- CreateIndex
CREATE INDEX "yield_opportunities_category_idx" ON "yield_opportunities"("category");

-- CreateIndex
CREATE UNIQUE INDEX "yield_opportunities_provider_asset_chain_key" ON "yield_opportunities"("provider", "asset", "chain");

-- CreateIndex
CREATE INDEX "provider_refresh_logs_provider_idx" ON "provider_refresh_logs"("provider");

-- CreateIndex
CREATE INDEX "provider_refresh_logs_fetched_at_idx" ON "provider_refresh_logs"("fetched_at");
