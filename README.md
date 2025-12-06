# Social Project

A full-stack social media application built with modern web technologies, optimized for Vercel deployment.

## Tech Stack

- **Backend**: Fastify + tRPC + PostgreSQL + Drizzle ORM
- **Frontend**: Next.js 14 + React + TailwindCSS + Radix UI
- **Monorepo**: npm workspaces with shared TypeScript types

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

Make sure PostgreSQL is installed and running on your machine, then create a database:

```bash
# Create database (using psql or your preferred PostgreSQL client)
createdb social_project_db
```

### 3. Environment Variables

**Backend (.env):**
```bash
cd packages/backend
cp .env.example .env
```

Edit `packages/backend/.env` with your configuration:
```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgres://user:password@localhost:5432/social_project_db
JWT_SECRET=your_secure_random_secret_key_change_this_in_production
CORS_ORIGIN=http://localhost:3001
```

**Frontend (.env.local):**
```bash
cd packages/frontend
cp .env.example .env.local
```

Edit `packages/frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Social Project
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

Open [http://localhost:3001](http://localhost:3001) in your browser

## Testing Before Deployment

**Recommended: Use regular dev servers for local testing**

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```



## Deployment to Vercel

```bash
# Deploy backend
cd packages/backend && vercel

# Deploy frontend
cd packages/frontend && vercel
```

## Project Structure

```
social-project/
├── packages/
│   ├── backend/          # Fastify + tRPC API
│   ├── frontend/         # Next.js app
│   └── shared/           # Shared types & schemas
├── e2e/                  # E2E tests
├── test-local.sh         # Local testing setup guide
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

