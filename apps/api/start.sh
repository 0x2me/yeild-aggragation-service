#!/bin/sh

echo "Starting Yield Aggregation API..."

# Run Prisma migrations/push
echo "Setting up database schema..."
npx prisma db push --skip-generate --accept-data-loss

# Seed the database (will skip if data exists)
echo "Seeding database..."
npm run db:seed || echo "Database already has data, skipping seed..."

# Start the application
echo "Starting server on port ${PORT:-3001}..."
node dist/server.js