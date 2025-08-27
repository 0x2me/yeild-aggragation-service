#!/bin/bash

echo "🚀 Deploying Yield Aggregation Service"
echo "======================================="

# Frontend deployment to Vercel
echo "📦 Deploying frontend to Vercel..."
cd apps/web
npx vercel --prod --yes
cd ../..

# Backend - You need to manually deploy to Render
echo ""
echo "📝 For backend deployment:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New' → 'Web Service'"
echo "3. Connect your GitHub repo: 0x2me/yeild-aggragation-service"
echo "4. Set:"
echo "   - Name: yield-aggregation-api"
echo "   - Root Directory: apps/api"
echo "   - Build Command: pnpm install && pnpm run build"
echo "   - Start Command: node dist/server.js"
echo ""
echo "5. Add environment variables:"
echo "   DATABASE_URL=(Render will provide with PostgreSQL)"
echo "   API_KEY=your-secure-api-key"
echo "   REFRESH_KEY=your-secure-refresh-key"
echo "   CORS_ORIGIN=https://your-vercel-url.vercel.app"
echo "   PORT=3001"
echo ""
echo "✅ Frontend deployed to Vercel!"
echo "⏳ Follow the steps above to deploy backend to Render"