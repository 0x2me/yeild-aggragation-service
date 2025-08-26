import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { OpportunityMatcher } from '../modules/opportunity-matcher';
import { MatchOpportunitiesRequest, MatchOpportunitiesResponse } from '../types';

// Schema definitions
const getOpportunitiesQuerySchema = z.object({
  provider: z.string().optional(),
  chain: z.enum(['ethereum', 'solana']).optional(),
  category: z.enum(['staking', 'lending', 'vault']).optional(),
  minApr: z.number().min(0).max(1).optional(),
  maxRisk: z.number().min(1).max(10).optional(),
  liquidity: z.enum(['liquid', 'locked']).optional(),
  sortBy: z.enum(['apr', 'risk', 'updated']).default('apr'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// const matchOpportunitiesBodySchema = z.object({
//   walletBalance: z.record(z.string(), z.string()),
//   riskTolerance: z.number().min(1).max(10),
//   maxAllocationPct: z.number().min(0).max(100),
//   investmentHorizon: z.number().min(1),
// });

export const opportunitiesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /opportunities - List all opportunities with filtering
  fastify.get<{
    Querystring: z.infer<typeof getOpportunitiesQuerySchema>
  }>('/opportunities', async (request, reply) => {
    const query = request.query as any;
    const provider = query.provider;
    const chain = query.chain;
    const category = query.category;
    const minApr = query.minApr ? parseInt(query.minApr) : undefined;
    const maxRisk = query.maxRisk ? parseInt(query.maxRisk) : undefined;
    const liquidity = query.liquidity;
    const sortBy = query.sortBy || 'apr';
    const order = query.order || 'desc';
    const limit = parseInt(query.limit || '50');
    const offset = parseInt(query.offset || '0');

    try {
      // Build where clause
      const where: any = {};
      
      if (provider) where.provider = provider;
      if (chain) where.chain = chain;
      if (category) where.category = category;
      if (liquidity) where.liquidity = liquidity;
      if (minApr !== undefined) where.apr = { gte: minApr };
      if (maxRisk !== undefined) where.riskScore = { lte: maxRisk };

      // Build orderBy
      let orderBy: any = {};
      switch (sortBy) {
        case 'apr':
          orderBy = { apr: order };
          break;
        case 'risk':
          orderBy = { riskScore: order === 'desc' ? 'asc' : 'desc' }; // Invert for risk
          break;
        case 'updated':
          orderBy = { updatedAt: order };
          break;
      }

      // Execute queries in parallel
      const [opportunities, total] = await Promise.all([
        fastify.prisma.yieldOpportunity.findMany({
          where,
          orderBy,
          take: limit,
          skip: offset,
        }),
        fastify.prisma.yieldOpportunity.count({ where }),
      ]);

      return reply.send({
        opportunities,
        total,
        limit,
        offset,
        filters: {
          provider,
          chain,
          category,
          minApr,
          maxRisk,
          liquidity,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  // POST /opportunities/match - Match opportunities to user profile
  fastify.post<{
    Body: MatchOpportunitiesRequest
  }>('/opportunities/match', async (request, reply) => {
    const { riskTolerance, maxAllocationPct, investmentHorizon } = request.body;

    try {
      // Fetch all opportunities
      const allOpportunities = await fastify.prisma.yieldOpportunity.findMany({
        orderBy: { apr: 'desc' },
      });

      // Match opportunities based on user criteria
      const matchedOpportunities = OpportunityMatcher.matchOpportunities(
        allOpportunities,
        request.body
      );

      // Sort matched opportunities by APR (highest first)
      const sorted = OpportunityMatcher.sortByAPR(matchedOpportunities);

      const response: MatchOpportunitiesResponse = {
        matchedOpportunities: sorted,
        totalMatched: sorted.length,
        filters: {
          riskTolerance,
          investmentHorizon,
          maxAllocationPct,
        },
      };

      return reply.send(response);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  // GET /opportunities/:id - Get single opportunity
  fastify.get<{
    Params: { id: string }
  }>('/opportunities/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const opportunity = await fastify.prisma.yieldOpportunity.findUnique({
        where: { id },
      });

      if (!opportunity) {
        return reply.status(404).send({
          error: 'Not found',
          message: `Opportunity with id ${id} not found`,
        });
      }

      return reply.send(opportunity);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};