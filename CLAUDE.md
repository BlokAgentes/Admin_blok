# CLAUDE.md

This file provides essential guidance for working with the Blok Platform codebase.

## Project Overview

**Blok Platform** - A modern npm monorepo containing a bilingual client workflow management platform with:
- Next.js 15.4.3 frontend application with JWT authentication
- Express.js backend service with TypeScript
- Supabase PostgreSQL database and authentication
- Interactive data visualization using React Flow

## Essential Commands

**Development** (from root)
- `npm run dev` - Start all apps (frontend + backend)
- `npm run dev:frontend` - Start frontend only (port 3000)
- `npm run dev:backend` - Start backend only (port 5000)
- `npm run build` - Build all apps
- `npm run lint` - Run linting
- `npm run test` - Run tests

**Frontend Specific** (apps/frontend/)
- `cd apps/frontend && npm run dev` - Start with Turbopack
- `cd apps/frontend && npx tsc --noEmit` - Type checking
- `cd apps/frontend && npx shadcn@latest add [component]` - Add UI components

**Environment Variables**
```bash
# Supabase (Required)
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# AI API Keys (for Task Master)
ANTHROPIC_API_KEY="sk-ant-api03-..."
PERPLEXITY_API_KEY="pplx-..."
```

## Architecture

**Monorepo Structure**
```
├── apps/
│   ├── frontend/    # Next.js 15.4.3 + React 19.1.0 + TypeScript
│   └── backend/     # Express.js + TypeScript
├── packages/        # Shared packages (future use)
└── .taskmaster/     # Task Master project management
```

**Tech Stack**
- **Frontend**: Next.js 15.4.3, React 19.1.0, Tailwind CSS, shadcn/ui, Supabase client
- **Backend**: Express.js, TypeScript, JWT auth, rate limiting, security middleware
- **Database**: Supabase PostgreSQL with authentication
- **UI Components**: shadcn/ui (new-york style), React Flow, Recharts, Framer Motion
- **Development**: npm workspaces, Turbopack, ESLint, TypeScript strict mode

**Key Patterns**
- JWT authentication with localStorage storage
- Server components for initial load, client components for interactivity  
- Context-based state management (Sidebar, Theme, etc.)
- Mobile-first responsive design
- Feature-based file organization

## Key Files

**Frontend** (apps/frontend/)
- `src/lib/auth.ts` - JWT utilities
- `src/app/layout.tsx` - Root layout with providers
- `src/components/ui/` - shadcn/ui components
- `src/components/app-sidebar.tsx` - Main navigation
- `src/lib/supabase.ts` - Supabase client configuration
- `components.json` - shadcn/ui configuration (new-york style)

**Backend** (apps/backend/)
- `src/index.ts` - Express server entry point
- `src/config/security.ts` - Security & rate limiting config
- `src/lib/auth.ts` - JWT authentication utilities
- `src/middleware/` - Authentication middleware

**API Routes** (apps/frontend/src/app/api/)
- `auth/*` - Authentication endpoints
- `clients/*` - Client management
- `flows/*` - Flow management with versioning

## Development Workflow

**Setup**
```bash
npm install                        # Install dependencies
npm run supabase:configure         # Configure Supabase
npm run dev                        # Start development servers
```

**Feature Development**
1. Create feature branch: `git checkout -b feature/new-feature`
2. **Frontend**: Server components first, then client interactivity
3. **Backend**: Express routes with proper middleware
4. Use React Hook Form + Zod for forms
5. Database changes via Supabase dashboard

**Component Creation**
```bash
cd apps/frontend
npx shadcn@latest add [component]  # Add UI components
# Extend with Tailwind variants, mobile-first design
```

## Important Notes

**Monorepo Workflow**
- This is a npm workspace - always use `npm` commands
- Frontend and backend are separate apps - be mindful of working directory
- Use `npm run dev` to start both services
- Database operations via Supabase dashboard or MCP server

**Authentication & Security**
- JWT tokens with 7-day expiry stored in localStorage
- Frontend: `withAuth()` middleware for API route protection
- Backend: Rate limiting and security validation
- Never commit sensitive data - use environment variables

**Development Best Practices**
- Follow TypeScript strict mode
- Use shadcn/ui component patterns (new-york style)
- Mobile-first responsive design with `use-mobile` hook
- Server components for initial load, client components for interactivity
- React Hook Form + Zod validation for forms

**Task Master Integration**
- Fully integrated via `.taskmaster/` directory and MCP
- Use for project planning and task management
- Research mode available with Perplexity API
- Files auto-generated - never edit `tasks.json` manually

**Key Security Guidelines**
- Input sanitization and validation on both client/server
- Rate limiting via `apps/backend/src/config/security.ts`
- CORS configuration for production
- Proper error handling without exposing sensitive info

## Critical Reminders
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files
- NEVER proactively create documentation files
- Be mindful of monorepo structure when referencing files