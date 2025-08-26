import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /health - Service health check
  fastify.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            timestamp: { type: 'string' },
            service: { type: 'string' },
            version: { type: 'string' },
            database: { type: 'string' },
            lastRefreshAt: { type: ['string', 'null'] },
            environment: { type: 'string' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    try {
      // Check database connection
      await fastify.prisma.$queryRaw`SELECT 1`;
      
      // Get last refresh time
      const lastRefresh = await fastify.prisma.providerRefreshLog.findFirst({
        where: { status: 'success' },
        orderBy: { fetchedAt: 'desc' },
        select: { fetchedAt: true },
      });

      return reply.send({
        ok: true,
        timestamp: new Date().toISOString(),
        service: '@yield-agg/api',
        version: '1.0.0',
        database: 'connected',
        lastRefreshAt: lastRefresh?.fetchedAt?.toISOString() || null,
        environment: process.env.NODE_ENV || 'development',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(503).send({
        ok: false,
        timestamp: new Date().toISOString(),
        service: '@yield-agg/api',
        version: '1.0.0',
        database: 'disconnected',
        lastRefreshAt: null,
        environment: process.env.NODE_ENV || 'development',
        error: 'Database connection failed',
      });
    }
  });

  // GET /health/live - Liveness probe
  fastify.get('/health/live', async (_request, reply) => {
    return reply.send({ status: 'ok' });
  });

  // GET /health/ready - Readiness probe
  fastify.get('/health/ready', async (_request, reply) => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      return reply.send({ status: 'ready' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(503).send({ status: 'not ready' });
    }
  });
};