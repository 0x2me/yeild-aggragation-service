import { FastifyPluginAsync } from 'fastify';
import { ProviderRegistry } from '../providers/registry';
import { LidoAdapter } from '../providers/adapters/lido';
import { MarinadeAdapter } from '../providers/adapters/marinade';
import { DeFiLlamaAdapter } from '../providers/adapters/defillama';
import { Prisma } from '@prisma/client';

// Register all adapters
ProviderRegistry.register(new LidoAdapter());
ProviderRegistry.register(new MarinadeAdapter());
ProviderRegistry.register(new DeFiLlamaAdapter());

export const refreshRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /refresh - Protected endpoint to refresh opportunities
  fastify.post('/refresh', async (request, reply) => {
    const refreshKey = process.env.REFRESH_KEY;
    
    // Check for refresh key in header
    const authHeader = request.headers['x-refresh-key'];
    if (!refreshKey || authHeader !== refreshKey) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing X-Refresh-Key header'
      });
    }

    fastify.log.info('Starting refresh pipeline...');
    
    const adapters = ProviderRegistry.getAll();
    const results = {
      success: [] as string[],
      failed: [] as { provider: string; error: string }[],
      totalOpportunities: 0
    };

    // Process each adapter with concurrency control
    const promises = adapters.map(async (adapter) => {
      try {
        fastify.log.info(`Fetching from ${adapter.name}...`);
        
        // Set timeout for provider fetch
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Provider timeout after 30 seconds')), 30000)
        );
        
        const opportunities = await Promise.race([
          adapter.fetch(),
          timeoutPromise
        ]) as Prisma.YieldOpportunityCreateInput[];

        // Upsert opportunities to database
        let upsertCount = 0;
        for (const opportunity of opportunities) {
          await fastify.prisma.yieldOpportunity.upsert({
            where: {
              provider_asset_chain: {
                provider: opportunity.provider,
                asset: opportunity.asset,
                chain: opportunity.chain,
              }
            },
            update: {
              name: opportunity.name,
              apr: opportunity.apr,
              category: opportunity.category,
              liquidity: opportunity.liquidity,
              riskScore: opportunity.riskScore,
            },
            create: opportunity
          });
          upsertCount++;
        }

        // Log success
        await fastify.prisma.providerRefreshLog.create({
          data: {
            provider: adapter.name,
            status: 'success',
            rows: upsertCount,
            message: `Successfully fetched and upserted ${upsertCount} opportunities`
          }
        });

        results.success.push(adapter.name);
        results.totalOpportunities += upsertCount;
        
        fastify.log.info(`✓ ${adapter.name}: ${upsertCount} opportunities`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Log failure
        await fastify.prisma.providerRefreshLog.create({
          data: {
            provider: adapter.name,
            status: 'failure',
            rows: 0,
            message: errorMessage
          }
        });

        results.failed.push({
          provider: adapter.name,
          error: errorMessage
        });
        
        fastify.log.error(`✗ ${adapter.name}: ${errorMessage}`);
      }
    });

    // Run all providers with Promise.allSettled to not fail on individual errors
    await Promise.allSettled(promises);

    return reply.send({
      success: true,
      timestamp: new Date().toISOString(),
      providers: {
        success: results.success,
        failed: results.failed
      },
      totalOpportunities: results.totalOpportunities
    });
  });

  // GET /refresh/status - Get last refresh status
  fastify.get('/refresh/status', async (_request, reply) => {
    const logs = await fastify.prisma.providerRefreshLog.findMany({
      orderBy: { fetchedAt: 'desc' },
      take: 10
    });

    const lastRefresh = logs[0];
    const providerStatus = ProviderRegistry.getNames().map(name => {
      const log = logs.find(l => l.provider === name);
      return {
        provider: name,
        lastStatus: log?.status || 'never',
        lastFetch: log?.fetchedAt || null,
        rows: log?.rows || 0
      };
    });

    return reply.send({
      lastRefresh: lastRefresh?.fetchedAt || null,
      providers: providerStatus,
      recentLogs: logs
    });
  });
};