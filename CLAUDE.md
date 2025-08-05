# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Client Flows Platform** - A Next.js 15.4.3 application for managing client workflows with JWT authentication, PostgreSQL/Prisma database, and interactive data visualization using React Flow.

## Quick Commands

**Development**
- `npm run dev` - Start dev server with Turbopack (port 3000)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run start` - Start production server
- TypeScript check happens during build (no separate type-check script)

**Database**
- `npx prisma migrate dev` - Run migrations
- `npx prisma generate` - Generate Prisma client
- `npx prisma studio` - Open database browser
- `npx prisma db seed` - Seed database with sample data
- `npx supabase start` - Start local Supabase (if using)
- `npx prisma db push` - Push schema changes without migration
- `npx prisma migrate reset` - Reset database and re-run all migrations

**Testing**
- `node test-supabase-connection.js` - Test database connection
- `node test-crud-operations.js` - Test CRUD operations
- `node test-migration-success.js` - Verify migration success
- `npm run lint && npm run build` - Pre-deployment validation

**Environment**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/client_flows_db"
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Additional Testing Commands**
- `npm test` - Run test suite (if configured)
- `npx prisma db pull` - Pull database schema changes
- `npx prisma db seed` - Seed database with initial data
- `npx prisma migrate status` - Check migration status

## Architecture

**Tech Stack**
- Next.js 15.4.3 + React 19.1.0 + TypeScript 5.x
- PostgreSQL + Prisma ORM 6.12.0
- Tailwind CSS 3.4.17 + shadcn/ui (new-york style)
- JWT authentication with bcryptjs 3.0.2
- React Hook Form 7.61.1 + Zod 4.0.8 validation
- React Flow 11.11.4 for interactive diagrams
- Recharts 3.1.0 for data visualization
- Three.js 0.178.0 + @react-three/fiber 9.3.0 for 3D visualizations
- Framer Motion 12.23.9 for animations
- Sonner 2.0.6 for toast notifications
- Supabase 2.53.0 for database management
- Tanstack Table 8.21.3 for data tables
- Tabler Icons 3.34.1 + Lucide React 0.525.0 for icons
- next-themes 0.4.6 for theme switching

**Core Architecture Patterns**
- **App Router**: Uses Next.js 15.4.3 App Router with server components for initial load, client components for interactivity
- **JWT Auth**: Tokens stored in localStorage, validated per API request via middleware
- **Database Access**: Prisma client singleton pattern in `src/lib/prisma.ts`
- **State Management**: Context-based (SidebarContext, BlurContext, OpenAIModelContext, CollapsibleContext) for UI state, server-side for data
- **File Structure**: Feature-based organization with colocated components
- **Responsive Design**: Mobile-first approach with `use-mobile` hook for breakpoint detection
- **Theme System**: Dark/light mode with next-themes and CSS variables

**Key Models**
- **User**: Platform users with role-based access (ADMIN/USER)
- **Client**: Customer records with contact information and status tracking
- **Flow**: Workflow definitions with versioning support
- **FlowVersion**: Individual versions of workflow diagrams (JSON data)
- **Share**: Public/private sharing tokens for flow collaboration
- **AuditLog**: Comprehensive action logging for compliance

**Database Schema**
- Referential integrity with cascading deletes
- JSON storage for complex flow diagram data
- Soft deletes via status fields
- Audit trail for all user actions

## Key Files & Components

**Authentication**
- `src/lib/auth.ts` - JWT utilities (sign/verify tokens)
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/api/auth/register/route.ts` - Registration endpoint
- `src/lib/middleware.ts` - Authentication middleware utilities

**Layout & Navigation**
- `src/app/layout.tsx` - Root layout with providers
- `src/components/app-sidebar.tsx` - Main navigation sidebar with collapsible sections
- `src/contexts/SidebarContext.tsx` - Sidebar state management
- `src/contexts/CollapsibleContext.tsx` - Collapsible components state
- `src/hooks/use-mobile.ts` - Mobile detection for responsive sidebar

**Core Components**
- `src/components/ui/` - shadcn/ui components (Button, Dialog, Form, etc.)
- `src/components/forms/` - Reusable form components
- `src/components/charts/` - Data visualization components
- `src/components/tabelas/` - Data table components
- `src/components/conversas/` - Chat/conversation components
- `src/components/magicui/` - Enhanced UI components (shimmer effects, etc.)

**API Routes**
- `/api/auth/*` - Authentication endpoints (login, register)
- `/api/clients/*` - Client CRUD operations
- `/api/flows/*` - Flow management with versioning
- `/api/shares/*` - Public/private sharing functionality
- `/api/modelos/*` - AI model management endpoints
- `/api/crm/*` - CRM integration endpoints

**Missing/Legacy Routes** (may need implementation)
- `/api/settings/api-keys` - API key management with model synchronization

**Database**
- `prisma/schema.prisma` - Complete database schema
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/supabase-crud.ts` - Supabase CRUD operations helper
- `supabase/migrations/` - Database migrations
- Multiple test scripts (`test-*.js`) for database validation

## Development Workflow

**1. Setup**
```bash
npm install
npx prisma generate
npx prisma migrate dev
```

**2. Feature Development**
- Create feature branch: `git checkout -b feature/new-feature`
- Implement server components first, then add client interactivity
- Use React Hook Form + Zod for all forms
- Add validation in both client and API routes

**3. Database Changes**
- Edit `prisma/schema.prisma`
- Run: `npx prisma migrate dev --name descriptive-name`
- Update seed data if needed: `npx prisma db seed`

**4. Component Creation**
- Use shadcn/ui components as base: `npx shadcn-ui@latest add [component]`
- Extend with custom styling using Tailwind variants
- Follow mobile-first responsive design

**5. Testing**
- Test database operations with provided test scripts
- Verify authentication flows work correctly
- Check responsive behavior across devices

## File Structure Patterns

```
src/
├── app/
│   ├── admin/              # Admin panel routes
│   │   ├── configuracoes/ # Admin settings
│   │   └── geral/        # General admin views
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── clients/      # Client management
│   │   ├── flows/        # Flow management
│   │   ├── modelos/      # AI model management
│   │   └── crm/          # CRM endpoints
│   ├── config/           # User configuration pages
│   │   ├── cobranca/    # Billing settings
│   │   ├── geral/       # General settings
│   │   ├── notificacoes/ # Notification settings
│   │   └── perfil/      # Profile settings
│   ├── cobranca/        # Billing pages
│   ├── conta/           # Account management
│   ├── conversas/       # Chat/conversation pages
│   ├── crm/             # CRM functionality
│   ├── feedback/        # Feedback system
│   ├── login/           # Authentication pages
│   ├── modelos/         # AI model management
│   ├── signup/          # Registration pages
│   ├── suporte/         # Support pages
│   ├── tabelas/         # Data table views
│   ├── test-*/          # Test/demo pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   ├── charts/          # Data visualization
│   ├── conversas/       # Chat components
│   ├── tabelas/         # Table components
│   ├── magicui/         # Enhanced UI components
│   ├── layouts/         # Layout components
│   └── login/           # Login-specific components
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── lib/                 # Utilities
│   ├── auth.ts         # Authentication
│   ├── prisma.ts       # Database client
│   ├── supabase.ts     # Supabase config
│   ├── middleware.ts   # API middleware
│   └── utils.ts        # General utilities
└── prisma/              # Database schema
```

## Deployment Notes

**Vercel (Recommended)**
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Add build command: `npm run build`
4. Automatic deployments on push to main

**Database Considerations**
- Use Supabase for managed PostgreSQL
- Set connection pooling for serverless
- Configure proper indexes for performance

**TypeScript Configuration**
- Strict mode enabled in tsconfig.json
- Path aliases: `@/*` maps to `src/*`
- Target: ES2017, Module: ESNext, ModuleResolution: bundler
- Includes path mapping for components, lib, hooks
- JSX: preserve (for Next.js)
- Incremental compilation enabled

## Cursor Rules Integration

**Taskmaster Integration**
- Use `/project:task-master:*` commands for project management
- Parse PRDs with: `/project:task-master:parse-prd`
- Manage tasks with: `/project:task-master:get_tasks`

**Code Style**
- Follow TypeScript strict mode
- Use shadcn/ui component patterns
- Mobile-first responsive design
- Server components for initial load optimization

**Component Creation Pattern**
- Use `npx shadcn@latest add [component]` for new UI components
- Extend components in `src/components/ui/` with custom variants
- Form components use React Hook Form + Zod validation patterns
- Charts use Recharts with consistent color schemes from Tailwind
- Follow new-york style configuration from `components.json`

**Performance Optimizations**
- Turbopack enabled for development (`next dev --turbopack`)
- Server components for initial render optimization
- Client components only for interactive features
- Lazy loading for 3D components and heavy visualizations

## Important Architecture Notes

**Authentication Flow**
- JWT tokens generated in `/api/auth/login` with 7-day expiry
- Tokens stored in localStorage on client side
- Middleware utilities in `src/lib/middleware.ts` provide `withAuth()` HOF for API route protection
- User data added to request headers: `x-user-id`, `x-user-email`, `x-user-role`

**Database Patterns**
- All models use `cuid()` for primary keys
- Cascading deletes configured for user relations
- Status enums used for soft state management (Client, Flow statuses)
- JSON fields for complex data (FlowVersion.data, AuditLog.details)
- Audit logging via AuditLog model tracks all user actions

**Component Architecture**
- Server Components for data fetching and initial render
- Client Components (`"use client"`) for interactivity
- Context providers: SidebarContext, BlurContext, OpenAIModelContext
- Mobile-first responsive design with `use-mobile` hook
- shadcn/ui new-york style with Tailwind CSS variables

**API Route Structure**
- Protected routes use `withAuth()` from middleware
- Consistent error handling with appropriate HTTP status codes
- User ID extracted from JWT token headers
- Request/response validation (implied by auth patterns)

## Task Master Integration

This project includes comprehensive Task Master AI integration via `.rules` file. Key integration features:

**Available Commands via MCP**
- Project initialization and PRD parsing
- Task management (add, update, expand, complete)
- Complexity analysis and automated task breakdown
- Research-backed task generation with Perplexity AI
- Dependency management and validation
- Tag-based workflow organization

**Configuration Files**
- `.mcp.json` - MCP server configuration for Claude Code
- `.taskmaster/` - Task Master project files and configuration
- `.rules` - Comprehensive guide for Task Master CLI and MCP usage
- `.cursor/` - Cursor-specific configuration
- `.clinerules/` - Additional AI assistant rules
- `.windsurf/` - Windsurf IDE configuration
- `.zed/` - Zed editor configuration

**Workflow Integration**
- Use Task Master for project planning and task breakdown
- Track implementation progress with subtask updates
- Leverage research mode for complex technical decisions
- Maintain development context across multiple Claude sessions