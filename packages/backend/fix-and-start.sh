#!/bin/bash

# Fix and Start Vercel Dev
# This script ensures everything is built and configured before starting

set -e

echo "🔧 Fixing Vercel Dev Setup..."
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Run this script from packages/backend directory"
  exit 1
fi

# Build shared package
echo "📦 Building shared package..."
cd ../shared
npm run build
echo "✅ Shared package built"
echo ""

# Build backend
echo "📦 Building backend..."
cd ../backend
npm run build
echo "✅ Backend built"
echo ""

# Check for .env.local
if [ ! -f ".env.local" ]; then
  echo "⚠️  No .env.local found, creating from example..."
  if [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local from example"
    echo "⚠️  Please edit .env.local with your database credentials!"
    echo ""
  else
    echo "Creating .env.local with defaults..."
    cat > .env.local << 'EOF'
NODE_ENV=development
DATABASE_URL=postgres://localhost:5432/social_project_db
JWT_SECRET=local_dev_secret_key_change_in_production
CORS_ORIGIN=http://localhost:3001
EOF
    echo "✅ Created .env.local"
    echo "⚠️  Please edit .env.local with your database credentials!"
    echo ""
  fi
else
  echo "✅ .env.local exists"
  echo ""
fi

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist/ directory not found after build"
  exit 1
fi

# Check if tRPC plugin exists
if [ ! -f "dist/infrastructure/trpc/plugin.js" ]; then
  echo "❌ Error: tRPC plugin not found in dist/"
  exit 1
fi

echo "✅ All checks passed!"
echo ""

# Kill anything on port 3000
echo "🔪 Killing any process on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process found on port 3000"
echo ""

echo "🚀 Starting Vercel Dev..."
echo ""
echo "If it works, you should see:"
echo "  ✓ [Serverless] Building Fastify app..."
echo "  ✓ [Serverless] Fastify app ready"
echo "  ✓ Ready! Available at http://localhost:3000"
echo ""
echo "Test with: curl http://localhost:3000/health"
echo ""

vercel dev
