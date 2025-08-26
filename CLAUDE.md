# CLAUDE.md - AI Assistant Instructions

## Important Guidelines

### Package Management
- **ALWAYS use `pnpm` for package management** - Never use npm or yarn
- Commands:
  - `pnpm add <package>` - Add dependencies
  - `pnpm add -D <package>` - Add dev dependencies
  - `pnpm install` - Install all dependencies
  - `pnpm run <script>` - Run scripts

### Project Structure
- This is a **pnpm monorepo** with workspaces
- Main packages:
  - `apps/api` - Fastify backend API
  - `apps/web` - Next.js frontend (to be built)
  - `packages/shared` - Shared types and utilities

### Database
- Using **PostgreSQL** with **Prisma ORM**
- Database runs in Docker container on port 5432
- Credentials: `admin:admin@localhost:5432/yield_agg`
- Always run `pnpm run db:seed` after schema changes

### API Conventions
- APR values are stored as **integers in basis points** (100 = 1%)
- Risk scores are **integers from 1-10**
- All endpoints except `/health` routes should be protected
- Use environment variables for configuration

### TypeScript & Linting
- Run `pnpm run typecheck` to check types
- Run `pnpm run lint` to check linting (when configured)
- Fix unused variables with underscore prefix: `_variable`

### Development Commands
From `apps/api` directory:
```bash
pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run db:push      # Push schema to database
pnpm run db:seed      # Seed database
pnpm run db:studio    # Open Prisma Studio
pnpm run typecheck    # Check TypeScript types
```

### Testing
- Test endpoints with curl or httpie
- Always test with proper authentication headers
- Example: `curl -H "Authorization: Bearer YOUR_API_KEY"`

### Git Conventions
- Don't include Claude AI attribution in commits
- Keep commits focused and logical
- Don't commit `.env` files (only `.env.example`)

### Security
- All routes except health endpoints require authentication
- Use Bearer tokens for API authentication
- Store sensitive values in environment variables
- Never log or expose API keys

### Common Issues & Solutions
1. **Port already in use**: PostgreSQL might be running on 5432
2. **Type errors with Prisma**: Run `pnpm run db:generate` after schema changes
3. **Module not found**: Make sure to run `pnpm install` in root directory

### Current Tech Stack
- **Backend**: Fastify + TypeScript
- **Database**: PostgreSQL + Prisma
- **Package Manager**: pnpm with workspaces
- **Node Version**: 18+
- **Authentication**: @fastify/bearer-auth

### Environment Variables
Required in `apps/api/.env`:
```
DATABASE_URL="postgresql://admin:admin@localhost:5432/yield_agg?schema=public"
API_KEY="your-secure-api-key-here"
REFRESH_KEY="refresh-endpoint-key"
CORS_ORIGIN="http://localhost:3000"
PORT=3001
```