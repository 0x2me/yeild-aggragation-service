import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { PrismaClient } from '@prisma/client';

// Import routes
import { opportunitiesRoutes } from './routes/opportunities';
import { healthRoutes } from './routes/health';
import { refreshRoutes } from './routes/refresh';

// Extend Fastify instance with Prisma
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export async function buildApp(opts = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV !== 'production' 
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    ...opts,
  });

  // Initialize Prisma
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });

  // Decorate Fastify with Prisma
  app.decorate('prisma', prisma);

  // Handle graceful shutdown
  app.addHook('onClose', async () => {
    await app.prisma.$disconnect();
  });

  // Register plugins
  await app.register(sensible);
  
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Check for API key configuration
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable is required. Please set it in your .env file');
  }

  // Register health routes (no auth needed)
  await app.register(healthRoutes);

  // Simple manual bearer auth check
  app.addHook('onRequest', async (request, reply) => {
    // Skip auth for health endpoints and refresh endpoint (uses different auth)
    if (request.url.startsWith('/health') || request.url.startsWith('/api/refresh')) {
      return;
    }
    
    // Check bearer token for all other routes
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ 
        error: 'Unauthorized', 
        message: 'Bearer token required. Use Authorization: Bearer <token>' 
      });
    }
    
    const token = authHeader.substring(7);
    if (token !== apiKey) {
      return reply.code(401).send({ 
        error: 'Unauthorized', 
        message: 'Invalid bearer token' 
      });
    }
  });

  // Register protected routes 
  await app.register(opportunitiesRoutes, { prefix: '/api/earn' });
  await app.register(refreshRoutes, { prefix: '/api' });

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return reply.status(409).send({
        error: 'Duplicate entry',
        message: 'A record with this data already exists',
      });
    }
    
    if (error.code === 'P2025') {
      return reply.status(404).send({
        error: 'Not found',
        message: 'The requested resource was not found',
      });
    }
    
    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation error',
        message: error.message,
      });
    }
    
    // Default error
    return reply.status(error.statusCode || 500).send({
      error: error.name || 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong'
        : error.message,
    });
  });

  return app;
}