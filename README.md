# Social Project

A full-stack social media application built with modern web technologies, optimized for Vercel deployment.

## Tech Stack

- **Backend**: Fastify + tRPC + PostgreSQL + Drizzle ORM
- **Frontend**: Next.js 14 + React + TailwindCSS + Radix UI
- **Monorepo**: npm workspaces with shared TypeScript types

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# Backend
cd packages/backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend
cd packages/frontend
cp .env.example .env.local
```

### 3. Build Packages
```bash
npm run build
```

### 4. Run Database Migrations
```bash
cd packages/backend
npm run db:migrate
npm run db:seed  # Optional: seed with sample data
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

Open [http://localhost:3001](http://localhost:3001)

## Testing Before Deployment

**Recommended: Use regular dev servers for local testing**

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

**Optional: Test with Vercel CLI (for serverless-specific testing)**

First time? See [VERCEL_SETUP_FIRST_TIME.md](VERCEL_SETUP_FIRST_TIME.md)

```bash
# Link to Vercel (first time only)
cd packages/backend && vercel link

# Start with Vercel dev
vercel dev
```

**Read the guides:**
- 📖 [VERCEL_SETUP_FIRST_TIME.md](VERCEL_SETUP_FIRST_TIME.md) - First time Vercel setup
- 📖 [VERCEL_LOCAL_TESTING.md](VERCEL_LOCAL_TESTING.md) - Quick local testing guide
- 📖 [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - Complete deployment guide

## Deployment to Vercel

```bash
# Deploy backend
cd packages/backend && vercel

# Deploy frontend
cd packages/frontend && vercel
```

See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

## Project Structure

```
social-project/
├── packages/
│   ├── backend/          # Fastify + tRPC API
│   ├── frontend/         # Next.js app
│   └── shared/           # Shared types & schemas
├── e2e/                  # E2E tests
├── test-local.sh         # Local testing setup script
├── VERCEL_LOCAL_TESTING.md      # Local testing guide
├── VERCEL_DEPLOYMENT_GUIDE.md   # Deployment guide
└── package.json          # Workspace root
```

## Available Scripts

### Workspace Scripts
```bash
npm run dev:backend          # Start backend dev server
npm run dev:frontend         # Start frontend dev server
npm run build                # Build all packages
npm run test                 # Run all tests
```

### Backend Scripts
```bash
npm run dev                  # Development mode
npm run build                # Build TypeScript
npm run start                # Production server
npm run test                 # Run tests
npm run db:migrate           # Run migrations
npm run db:seed              # Seed database
npm run db:studio            # Database GUI
```

### Frontend Scripts
```bash
npm run dev                  # Development mode
npm run build                # Production build
npm run start                # Start production
npm run lint                 # Lint code
```

## Features

✅ User authentication (JWT)
✅ Create, edit, delete posts
✅ Comment system with nesting
✅ Full-text search
✅ Admin moderation
✅ Responsive design
✅ Type-safe API with tRPC
✅ Optimized for Vercel serverless

## Documentation

- [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [VERCEL_LOCAL_TESTING.md](VERCEL_LOCAL_TESTING.md) - Local testing with Vercel CLI
- [packages/backend/.env.example](packages/backend/.env.example) - Backend environment variables
- [packages/frontend/.env.example](packages/frontend/.env.example) - Frontend environment variables

## Troubleshooting

**Port in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Database issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Test: `psql $DATABASE_URL`

**Build errors:**
```bash
npm run build:shared  # Build shared first
npm run build:backend
```

## Environment Variables

### Backend
```env
DATABASE_URL=postgres://localhost:5432/social_project_db
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3001
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Support

- 📖 Read the documentation guides
- 🐛 Open an issue on GitHub
- 💬 Check troubleshooting sections

