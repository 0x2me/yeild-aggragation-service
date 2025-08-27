# Simple Dockerfile for Railway - Backend only
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY apps/api/package.json ./
COPY apps/api/tsconfig.json ./

# Install dependencies using npm
RUN npm install

# Copy source code
COPY apps/api/src ./src
COPY apps/api/prisma ./prisma

# Build the app
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]