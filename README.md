# Social Project Monorepo

This is a TypeScript monorepo containing three packages:

- **backend**: Backend application (TypeScript)
- **frontend**: Frontend application (TypeScript)
- **shared**: Shared code between backend and frontend (TypeScript)

## Setup

Install all dependencies:

```bash
npm install
```

## Development

Run backend in development mode:
```bash
npm run dev:backend
```

Run frontend in development mode:
```bash
npm run dev:frontend
```

## Building

Build all packages:
```bash
npm run build
```

Build individual packages:
```bash
npm run build:backend
npm run build:frontend
npm run build:shared
```

## Workspace Structure

```
social-project/
├── packages/
│   ├── backend/
│   ├── frontend/
│   └── shared/
└── package.json
```

