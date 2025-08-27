#!/bin/sh

echo "Starting Yield Aggregation API..."

# Wait for database to be ready
echo "Waiting for database..."
sleep 5

# Run Prisma migrations/push
echo "Setting up database schema..."
npx prisma db push --accept-data-loss

# Seed the database (will skip if data exists)
echo "Seeding database..."
npx tsx prisma/seed.ts || echo "Database already has data, skipping seed..."

# Start the application
echo "Starting server on port ${PORT:-3001}..."
node dist/server.js