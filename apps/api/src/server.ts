import { buildApp } from './app';

const start = async () => {
  const app = await buildApp();
  
  const port = parseInt(process.env.PORT || '3001', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info(`🚀 Server listening at http://${host}:${port}`);
    app.log.info(`📊 Health check at http://${host}:${port}/health`);
    app.log.info(`💰 Opportunities API at http://${host}:${port}/api/earn/opportunities`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Shutting down gracefully...');
  process.exit(0);
});

start();