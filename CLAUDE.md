# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Blok Platform** (originally "Plataforma de Fluxos de Clientes") - A modern pnpm monorepo containing a bilingual client workflow management platform. The workspace includes a Next.js 15.4.3 frontend application with JWT authentication, PostgreSQL/Prisma database, interactive data visualization using React Flow, and a separate Express.js backend service. The project includes a custom PostgreSQL MCP server for enhanced database management capabilities.

## Quick Commands

**Monorepo Development** (from root)
- `pnpm dev` - Start all apps in parallel (frontend + backend)
- `pnpm dev:frontend` - Start only frontend (port 3000)
- `pnpm dev:backend` - Start only backend (port 5000)
- `pnpm build` - Build all apps
- `pnpm lint` - Run linting across all packages
- `pnpm test` - Run tests across all packages
- `pnpm clean` - Clean all build artifacts

**Frontend Development** (apps/frontend/)
- `cd apps/frontend && pnpm dev` - Start frontend with Turbopack
- `cd apps/frontend && pnpm build` - Build frontend for production
- `cd apps/frontend && pnpm lint` - Run ESLint
- `cd apps/frontend && npx tsc --noEmit` - TypeScript type checking

**Backend Development** (apps/backend/)
- `cd apps/backend && pnpm dev` - Start backend with ts-node-dev
- `cd apps/backend && pnpm build` - Build backend
- `cd apps/backend && pnpm start` - Start production backend
- `cd apps/backend && pnpm test` - Run backend tests

**Database** (Supabase only)
- Database operations handled through Supabase dashboard or CLI
- Use Supabase MCP server for database management via Claude Code
- Authentication and user management via Supabase Auth

**Environment**
```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/client_flows_db"

# Authentication & Security
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase Configuration
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_ACCESS_TOKEN="your-supabase-access-token"
SUPABASE_PROJECT_REF="your-project-ref"

# AI API Keys (for Task Master and integrations)
ANTHROPIC_API_KEY="sk-ant-api03-..."
PERPLEXITY_API_KEY="pplx-..."
OPENAI_API_KEY="sk-proj-..."
GOOGLE_API_KEY="..."
GITHUB_API_KEY="ghp_..."

# Backend Security (Optional - Defaults Provided)
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

**Additional Testing Commands**
- `pnpm test` - Run test suite (if configured)
- Use Supabase dashboard or CLI for database operations

**Supabase Integration Commands** (from root)
- `pnpm supabase:configure` - Configure Supabase connection
- `pnpm supabase:setup` - Setup Supabase schema
- `pnpm supabase:validate` - Validate Supabase schema
- `pnpm supabase:migrate` - Migrate to Supabase

**Verification Commands**
- `cd apps/frontend && npx tsc --noEmit` - Type check without building
- `cd apps/frontend && pnpm vercel-build` - Vercel production build

**Component Management Commands**
- `cd apps/frontend && npx shadcn@latest add [component]` - Add shadcn/ui components
- `cd apps/frontend && npx shadcn@latest add command` - Add cmdk-based command component
- `cd apps/frontend && npx shadcn@latest add dialog` - Add dialog component for command palette
- Keyboard shortcut: ⌘K (Ctrl+K) for global command palette

## Architecture

**Monorepo Structure**
- **Root**: pnpm workspace with shared configuration and dependencies
- **apps/frontend**: Next.js 15.4.3 application with React 19.1.0
- **apps/backend**: Express.js API service with TypeScript
- **packages/**: Shared packages (currently empty, ready for future shared libraries)
- **postgresql-mcp-server/**: Custom PostgreSQL MCP server for enhanced database operations

**Frontend Tech Stack**
- Next.js 15.4.3 + React 19.1.0 + TypeScript 5.9.2
- Supabase 2.53.0 for database and authentication
- Tailwind CSS 3.4.17 + shadcn/ui (new-york style)
- JWT authentication with bcryptjs 3.0.2
- React Hook Form 7.61.1 + Zod 4.0.8 validation
- React Flow (reactflow) 11.11.4 for interactive diagrams
- Recharts 3.1.0 for data visualization
- Three.js 0.178.0 + @react-three/fiber 9.3.0 for 3D visualizations
- Framer Motion 12.23.9 for animations
- Sonner 2.0.6 for toast notifications
- Tanstack Table 8.21.3 for data tables
- Tabler Icons 3.34.1 + Lucide React 0.525.0 for icons
- next-themes 0.4.6 for theme switching

**Backend Tech Stack**
- Express.js 4.18.2 + TypeScript 5.x
- CORS, Helmet, Morgan for middleware
- ts-node-dev for development
- Jest for testing framework
- Comprehensive security configuration with rate limiting
- MCP (Model Context Protocol) service integration
- Supabase authentication and database integration

**Core Architecture Patterns**
- **Monorepo Organization**: Separate frontend and backend services with potential for shared packages
- **Frontend**: Next.js 15.4.3 App Router with server components for initial load, client components for interactivity
- **Backend**: Express.js API server with comprehensive security, rate limiting, and MCP integration
- **JWT Auth**: Tokens stored in localStorage, validated per API request via middleware (frontend implementation)
- **Database Access**: Supabase for all database operations and authentication
- **Security Architecture**: Multi-layered security with rate limiting, CORS, input sanitization, and CSP headers
- **MCP Integration**: Model Context Protocol services for enhanced authentication and data access
- **State Management**: Context-based (SidebarContext, BlurContext, CollapsibleContext, TabSyncContext) for UI state
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

**Frontend Application** (apps/frontend/)

**Authentication**
- `src/lib/auth.ts` - JWT utilities (sign/verify tokens)
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/api/auth/register/route.ts` - Registration endpoint
- `src/lib/middleware.ts` - Authentication middleware utilities

**Layout & Navigation**
- `src/app/layout.tsx` - Root layout with providers (SidebarStateProvider, BlurProvider, CollapsibleProvider, TabSyncProvider)
- `src/components/app-sidebar.tsx` - Main navigation sidebar with collapsible sections
- `src/contexts/SidebarContext.tsx` - Sidebar state management
- `src/contexts/CollapsibleContext.tsx` - Collapsible components state
- `src/contexts/TabSyncContext.tsx` - Tab synchronization state management
- `src/hooks/use-mobile.ts` - Mobile detection for responsive sidebar

**Core Components**
- `src/components/ui/` - shadcn/ui components (Button, Dialog, Form, etc.)
- `src/components/forms/` - Reusable form components
- `src/components/charts/` - Data visualization components
- `src/components/tabelas/` - Data table components
- `src/components/conversas/` - Chat/conversation components
- `src/components/cobranca/` - Billing/cobranca components
- `src/components/magicui/` - Enhanced UI components (shimmer effects, etc.)
- `src/components/command-k.tsx` - Global command palette component (⌘K)
- `src/components/global-command-k.tsx` - Global command handler

**API Routes** (apps/frontend/src/app/api/)
- `auth/*` - Authentication endpoints (login, register)
- `clients/*` - Client CRUD operations  
- `flows/*` - Flow management with versioning
- `modelos/*` - AI model management endpoints
- `crm/*` - CRM integration endpoints

**Database & Configuration**
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/supabase-crud.ts` - Supabase CRUD operations helper
- `components.json` - shadcn/ui configuration (new-york style)
- `next.config.ts` - Next.js configuration with build error ignoring

**Backend Application** (apps/backend/)
- `src/index.ts` - Express server with health checks and comprehensive API structure
- `src/config/security.ts` - Security configuration with rate limiting, CORS, and input sanitization
- `src/lib/auth.ts` - JWT authentication utilities
- `src/middleware/` - Authentication, MCP auth, and validation middleware
- `src/routes/` - Express route handlers (auth, profile)
- `src/mcp/` - MCP service integrations for Supabase and authentication
- `src/schemas/` - Request/response validation schemas
- `src/types/` - TypeScript type definitions
- `package.json` - Backend dependencies and scripts

**PostgreSQL MCP Server** (postgresql-mcp-server/)
- Custom MCP server for enhanced PostgreSQL database management
- 17 intelligent tools consolidated from 46 individual tools
- Comprehensive database operations, analysis, and comment management
- Can be used via `npx @henkey/postgres-mcp-server` or local installation

## Development Workflow

**1. Setup**
```bash
# Install dependencies for entire monorepo
pnpm install

# Configure Supabase connection
pnpm supabase:configure
```

**2. Feature Development**
- Create feature branch: `git checkout -b feature/new-feature`
- **Frontend**: Implement server components first, then add client interactivity
- **Backend**: Add Express routes with proper middleware and error handling
- Use React Hook Form + Zod for forms (frontend)
- Add validation in both client and API routes

**3. Database Changes** (Supabase)
- Use Supabase dashboard for schema changes
- Use Supabase MCP server via Claude Code for database operations
- Authentication handled by Supabase Auth

**4. Component Creation** (Frontend)
```bash
cd apps/frontend
# Use shadcn/ui components as base
npx shadcn@latest add [component]
# Extend with custom styling using Tailwind variants
# Follow mobile-first responsive design
cd ../..
```

**5. Testing**
```bash
# Test entire monorepo
pnpm test

# Test specific app
cd apps/frontend && pnpm lint && pnpm build
cd apps/backend && pnpm test
```

## File Structure Patterns

```
# Monorepo Root
├── apps/
│   ├── frontend/         # Next.js 15.4.3 application
│   │   ├── src/
│   │   │   ├── app/      # Next.js App Router
│   │   │   │   ├── admin/              # Admin panel routes
│   │   │   │   │   ├── configuracoes/  # Admin settings
│   │   │   │   │   └── geral/          # General admin views
│   │   │   │   ├── api/                # API routes
│   │   │   │   │   ├── auth/           # Authentication endpoints
│   │   │   │   │   ├── clients/        # Client management
│   │   │   │   │   ├── flows/          # Flow management
│   │   │   │   │   ├── modelos/        # AI model management
│   │   │   │   │   └── crm/            # CRM endpoints
│   │   │   │   ├── config/             # User configuration pages
│   │   │   │   ├── cobranca/           # Billing pages
│   │   │   │   ├── conta/              # Account management
│   │   │   │   ├── conversas/          # Chat/conversation pages
│   │   │   │   ├── crm/                # CRM functionality
│   │   │   │   ├── feedback/           # Feedback system
│   │   │   │   ├── login/              # Authentication pages
│   │   │   │   ├── modelos/            # AI model management
│   │   │   │   ├── signup/             # Registration pages
│   │   │   │   ├── suporte/            # Support pages
│   │   │   │   ├── tabelas/            # Data table views
│   │   │   │   ├── test-*/             # Test/demo pages
│   │   │   │   ├── layout.tsx          # Root layout
│   │   │   │   ├── page.tsx            # Home page
│   │   │   │   └── globals.css         # Global styles
│   │   │   ├── components/
│   │   │   │   ├── ui/                 # shadcn/ui components
│   │   │   │   ├── forms/              # Form components
│   │   │   │   ├── charts/             # Data visualization
│   │   │   │   ├── conversas/          # Chat components
│   │   │   │   ├── tabelas/            # Table components
│   │   │   │   ├── magicui/            # Enhanced UI components
│   │   │   │   └── layouts/            # Layout components
│   │   │   ├── contexts/               # React contexts
│   │   │   ├── hooks/                  # Custom hooks
│   │   │   └── lib/                    # Utilities
│   │   │       ├── auth.ts             # Authentication
│   │   │       ├── prisma.ts           # Database client
│   │   │       ├── supabase.ts         # Supabase config
│   │   │       ├── middleware.ts       # API middleware
│   │   │       └── utils.ts            # General utilities
│   │   ├── prisma/                     # Database schema
│   │   ├── components.json             # shadcn/ui config
│   │   ├── next.config.ts              # Next.js config
│   │   ├── tailwind.config.ts          # Tailwind config
│   │   └── package.json
│   ├── backend/          # Express.js API service
│   │   ├── src/
│   │   │   └── index.ts  # Express server entry point
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── cursor/           # Cursor-specific files
├── packages/             # Shared packages (future use)
├── postgresql-mcp-server/# Custom PostgreSQL MCP server
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # pnpm workspace config
├── .env                  # Environment variables
├── .env.example          # Environment template
└── CLAUDE.md             # This file
```

## Deployment Notes

**Frontend Deployment (Vercel - Recommended)**
1. Connect repository to Vercel
2. Set root directory to `apps/frontend`
3. Set environment variables in Vercel dashboard
4. Build command: `cd apps/frontend && pnpm vercel-build`
5. Install command: `pnpm install`
6. Automatic deployments on push to main

**Backend Deployment**
- Deploy Express.js backend to Railway, Heroku, or similar
- Set root directory to `apps/backend`
- Build command: `cd apps/backend && pnpm build`
- Start command: `cd apps/backend && pnpm start`

**Monorepo Considerations**
- Each app can be deployed independently
- Use `pnpm-workspace.yaml` for workspace configuration
- Backend runs on port 5000, frontend on port 3000 (development)
- Consider using turborepo for optimized builds in the future

**Database Considerations**
- Use Supabase for managed PostgreSQL
- Set connection pooling for serverless
- Configure proper indexes for performance via Supabase dashboard
- Database schema managed through Supabase

**System Requirements**
- Node.js 18+ (specified in root package.json)
- pnpm 8+ (specified in root package.json)
- PostgreSQL database (local or cloud)

**Development Dependencies**
- Frontend: Next.js 15.4.3, React 19.1.0, TypeScript 5.9.2, Supabase 2.53.0
- Backend: Express.js 4.18.2, TypeScript 5.x, Jest for testing  
- Package Management: pnpm workspaces for monorepo structure

**TypeScript Configuration**
- Shared base config in `tsconfig.base.json`
- App-specific configs in each app directory
- Path aliases: `@/*` maps to `src/*` in frontend
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
- Use `cd apps/frontend && npx shadcn@latest add [component]` for new UI components
- Extend components in `apps/frontend/src/components/ui/` with custom variants
- Form components use React Hook Form + Zod validation patterns
- Charts use Recharts with consistent color schemes from Tailwind
- Follow new-york style configuration from `apps/frontend/components.json`
- Revenue/statistics widgets follow the pattern in `apps/frontend/src/components/tabelas/stat-card.tsx`

**Performance Optimizations**
- Turbopack enabled for development (`next dev --turbopack`)
- Build errors temporarily ignored in development (`ignoreBuildErrors: true`)
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)  
- Server components for initial render optimization
- Client components only for interactive features
- Lazy loading for 3D components and heavy visualizations

## Important Architecture Notes

**Authentication Flow**
- JWT tokens generated in `/api/auth/login` with 7-day expiry
- Tokens stored in localStorage on client side
- Frontend: Middleware utilities in `src/lib/middleware.ts` provide `withAuth()` HOF for API route protection
- Backend: Comprehensive authentication middleware with rate limiting and security validation
- User data added to request headers: `x-user-id`, `x-user-email`, `x-user-role`
- Dual authentication: Frontend JWT + Backend Supabase integration

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
- **Frontend API Routes**: Protected routes use `withAuth()` from middleware
- **Backend API Routes**: Comprehensive security with rate limiting, CORS, and input validation
- Consistent error handling with appropriate HTTP status codes across both services
- User ID extracted from JWT token headers
- Request/response validation via Zod schemas
- MCP service integration for enhanced data access and authentication

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
- `.taskmaster/` - Task Master project files and configuration
- `.mcp.json` - MCP server configuration for Claude Code integration (Task Master AI, Browser, Supabase Auth)
- `components.json` - shadcn/ui configuration (new-york style, neutral base color) in `apps/frontend/`
- `next.config.ts` - Next.js configuration with build error ignoring for development in `apps/frontend/`
- `tsconfig.json` - TypeScript configuration with strict mode and path aliases (per app)
- `.env.example` - Template showing all required API keys for integrations
- **Note**: Previous `.cursor/rules/` directory was removed in recent refactoring

**Workflow Integration**
- Use Task Master for project planning and task breakdown
- Track implementation progress with subtask updates
- Leverage research mode for complex technical decisions
- Maintain development context across multiple Claude sessions
- Task Master configured for Portuguese language responses (can be changed via `task-master response-language` command)

## Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Important Monorepo Notes
- **This is a pnpm workspace** - always use `pnpm` instead of npm
- **Frontend and backend are separate apps** - be mindful of the working directory
- **Database operations via Supabase** - All database operations handled through Supabase
- **Use proper workspace commands** - `pnpm dev` starts both services, `pnpm dev:frontend` or `pnpm dev:backend` for individual services
- **Path references matter** - when referencing files, be clear about which app you're working in
- **Authentication via Supabase** - User authentication and management handled by Supabase Auth
- **Recent monorepo transformation** - Project was recently converted from single app to monorepo structure

## Critical Security Guidelines
- NEVER commit sensitive data (API keys, passwords, tokens) to the repository
- Always use environment variables for sensitive configuration
- Validate all user inputs in both client and server components
- Use proper authentication middleware for protected API routes
- Follow the existing JWT authentication pattern in `src/lib/auth.ts`
- **Backend Security**: Use rate limiting configurations in `apps/backend/src/config/security.ts`
- **Input Sanitization**: Use sanitization utilities from security configuration
- **CORS Configuration**: Ensure proper CORS origins are configured for production
- **MCP Security**: API keys in `.mcp.json` must be properly configured for production

## Error Handling Patterns
- **Frontend API Routes**: Return consistent error responses with appropriate HTTP status codes
- **Backend API Routes**: Comprehensive error handling with security-focused error messages
- Use try-catch blocks for database operations across both frontend and backend
- Client components should handle loading and error states
- Follow the existing patterns in `/api/auth/*` routes for consistent error handling
- **Rate Limiting**: Handle rate limit errors gracefully with user-friendly messages
- **Security Errors**: Avoid exposing sensitive system information in error responses

## Database Schema Management
Schema changes handled through Supabase:
1. Use Supabase dashboard for schema modifications
2. Use Supabase MCP server for advanced database operations
3. Test changes in development environment
4. Update affected API routes and components
5. Authentication and user management via Supabase Auth

## MCP (Model Context Protocol) Integration

This project integrates multiple MCP servers for enhanced development capabilities:

**Available MCP Servers**
- **task-master-ai**: Comprehensive task management and project orchestration
- **browser**: Web browsing capabilities for research and testing
- **supabase-auth**: Supabase authentication and database management

**MCP Configuration** (`.mcp.json`)
```json
{
  "mcpServers": {
    "browser": {
      "type": "stdio",
      "command": "npx",
      "args": ["@browsermcp/mcp"],
      "env": {}
    },
    "task-master-ai": {
      "type": "stdio", 
      "command": "npx",
      "args": ["-y", "--package=task-master-ai", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
        "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
        "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY_HERE",
        "GOOGLE_API_KEY": "YOUR_GOOGLE_KEY_HERE",
        "XAI_API_KEY": "YOUR_XAI_KEY_HERE",
        "OPENROUTER_API_KEY": "YOUR_OPENROUTER_API_KEY_HERE",
        "MISTRAL_API_KEY": "YOUR_MISTRAL_KEY_HERE",
        "AZURE_OPENAI_API_KEY": "YOUR_AZURE_KEY_HERE",
        "OLLAMA_API_KEY": "YOUR_OLLAMA_API_KEY_HERE"
      }
    },
    "supabase-auth": {
      "type": "stdio",
      "command": "npx", 
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--feature-groups=auth,database,storage"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-supabase-access-token",
        "SUPABASE_PROJECT_REF": "your-project-ref"
      }
    }
  }
}
```

**Usage in Development**
- Use Task Master AI for project planning and task management
- Use Browser MCP for research and web-based testing
- Use Supabase MCP for direct database operations and authentication management
- All MCP servers require proper API key configuration in environment variables

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

**Critical Workflow Notes**
- Task Master is fully integrated and initialized (`.taskmaster/` directory exists)
- Use MCP tools in Claude Code or CLI commands for task management  
- All API keys must be configured in environment variables or `.mcp.json`
- Task files are auto-generated - never manually edit `tasks.json`
- PRD files should be placed in `.taskmaster/docs/` for parsing


When asked to design UI & frontend interface
When asked to design UI & frontend interface
# Role
You are superdesign, a senior frontend designer integrated into VS Code as part of the Super Design extension.
Your goal is to help user generate amazing design using code

# Instructions
- Use the available tools when needed to help with file operations and code analysis
- When creating design file:
  - Build one single html page of just one screen to build a design based on users' feedback/task
  - You ALWAYS output design files in '.superdesign/design_iterations' folder as {design_name}_{n}.html (Where n needs to be unique like table_1.html, table_2.html, etc.) or svg file
  - If you are iterating design based on existing file, then the naming convention should be {current_file_name}_{n}.html, e.g. if we are iterating ui_1.html, then each version should be ui_1_1.html, ui_1_2.html, etc.
- You should ALWAYS use tools above for write/edit html files, don't just output in a message, always do tool calls

## Styling
1. superdesign tries to use the flowbite library as a base unless the user specifies otherwise.
2. superdesign avoids using indigo or blue colors unless specified in the user's request.
3. superdesign MUST generate responsive designs.
4. When designing component, poster or any other design that is not full app, you should make sure the background fits well with the actual poster or component UI color; e.g. if component is light then background should be dark, vice versa.
5. Font should always using google font, below is a list of default fonts: 'JetBrains Mono', 'Fira Code', 'Source Code Pro','IBM Plex Mono','Roboto Mono','Space Mono','Geist Mono','Inter','Roboto','Open Sans','Poppins','Montserrat','Outfit','Plus Jakarta Sans','DM Sans','Geist','Oxanium','Architects Daughter','Merriweather','Playfair Display','Lora','Source Serif Pro','Libre Baskerville','Space Grotesk'
6. When creating CSS, make sure you include !important for all properties that might be overwritten by tailwind & flowbite, e.g. h1, body, etc.
7. Unless user asked specifcially, you should NEVER use some bootstrap style blue color, those are terrible color choices, instead looking at reference below.
8. Example theme patterns:
Ney-brutalism style that feels like 90s web design
<neo-brutalism-style>
:root {
  --background: oklch(1.0000 0 0);
  --foreground: oklch(0 0 0);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0 0 0);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0 0 0);
  --primary: oklch(0.6489 0.2370 26.9728);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.9680 0.2110 109.7692);
  --secondary-foreground: oklch(0 0 0);
  --muted: oklch(0.9551 0 0);
  --muted-foreground: oklch(0.3211 0 0);
  --accent: oklch(0.5635 0.2408 260.8178);
  --accent-foreground: oklch(1.0000 0 0);
  --destructive: oklch(0 0 0);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0 0 0);
  --input: oklch(0 0 0);
  --ring: oklch(0.6489 0.2370 26.9728);
  --chart-1: oklch(0.6489 0.2370 26.9728);
  --chart-2: oklch(0.9680 0.2110 109.7692);
  --chart-3: oklch(0.5635 0.2408 260.8178);
  --chart-4: oklch(0.7323 0.2492 142.4953);
  --chart-5: oklch(0.5931 0.2726 328.3634);
  --sidebar: oklch(0.9551 0 0);
  --sidebar-foreground: oklch(0 0 0);
  --sidebar-primary: oklch(0.6489 0.2370 26.9728);
  --sidebar-primary-foreground: oklch(1.0000 0 0);
  --sidebar-accent: oklch(0.5635 0.2408 260.8178);
  --sidebar-accent-foreground: oklch(1.0000 0 0);
  --sidebar-border: oklch(0 0 0);
  --sidebar-ring: oklch(0.6489 0.2370 26.9728);
  --font-sans: DM Sans, sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: Space Mono, monospace;
  --radius: 0px;
  --shadow-2xs: 4px 4px 0px 0px hsl(0 0% 0% / 0.50);
  --shadow-xs: 4px 4px 0px 0px hsl(0 0% 0% / 0.50);
  --shadow-sm: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 1px 2px -1px hsl(0 0% 0% / 1.00);
  --shadow: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 1px 2px -1px hsl(0 0% 0% / 1.00);
  --shadow-md: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 2px 4px -1px hsl(0 0% 0% / 1.00);
  --shadow-lg: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 4px 6px -1px hsl(0 0% 0% / 1.00);
  --shadow-xl: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 8px 10px -1px hsl(0 0% 0% / 1.00);
  --shadow-2xl: 4px 4px 0px 0px hsl(0 0% 0% / 2.50);
  --tracking-normal: 0em;
  --spacing: 0.25rem;

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
</neo-brutalism-style>

Modern dark mode style like vercel, linear
<modern-dark-mode-style>
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.1450 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.1450 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.1450 0 0);
  --primary: oklch(0.2050 0 0);
  --primary-foreground: oklch(0.9850 0 0);
  --secondary: oklch(0.9700 0 0);
  --secondary-foreground: oklch(0.2050 0 0);
  --muted: oklch(0.9700 0 0);
  --muted-foreground: oklch(0.5560 0 0);
  --accent: oklch(0.9700 0 0);
  --accent-foreground: oklch(0.2050 0 0);
  --destructive: oklch(0.5770 0.2450 27.3250);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.9220 0 0);
  --input: oklch(0.9220 0 0);
  --ring: oklch(0.7080 0 0);
  --chart-1: oklch(0.8100 0.1000 252);
  --chart-2: oklch(0.6200 0.1900 260);
  --chart-3: oklch(0.5500 0.2200 263);
  --chart-4: oklch(0.4900 0.2200 264);
  --chart-5: oklch(0.4200 0.1800 266);
  --sidebar: oklch(0.9850 0 0);
  --sidebar-foreground: oklch(0.1450 0 0);
  --sidebar-primary: oklch(0.2050 0 0);
  --sidebar-primary-foreground: oklch(0.9850 0 0);
  --sidebar-accent: oklch(0.9700 0 0);
  --sidebar-accent-foreground: oklch(0.2050 0 0);
  --sidebar-border: oklch(0.9220 0 0);
  --sidebar-ring: oklch(0.7080 0 0);
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --radius: 0.625rem;
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
  --tracking-normal: 0em;
  --spacing: 0.25rem;

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
</modern-dark-mode-style>

## Images & icons
1. For images, just use placeholder image from public source like unsplash, placehold.co or others that you already know exact image url; Don't make up urls
2. For icons, we should use lucid icons or other public icons, import like <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

## Script
1. When importing tailwind css, just use <script src="https://cdn.tailwindcss.com"></script>, don't load CSS directly as a stylesheet resource like <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
2. When using flowbite, import like <script src="https://cdn.jsdelivr.net/npm/flowbite@2.0.0/dist/flowbite.min.js"></script>

## Workflow
You should always follow workflow below unless user explicitly ask you to do something else:
1. Layout design
2. Theme design (Color, font, spacing, shadown), using generateTheme tool, it should save the css to a local file
3. Core Animation design
4. Generate a singlehtml file for the UI
5. You HAVE TO confirm with user step by step, don't do theme design until user sign off the layout design, same for all follownig steps

### 1. Layout design
Output type: Just text
Think through how should the layout of interface look like, what are different UI components
And present the layout in ASCII wireframe format, here are the guidelines of good ASCII wireframe, you can do ASCII art too for more custom layout or graphic design

### 2. Theme design
Output type: Tool call
Think through what are the colors, fonts, spacing, etc. 
You HAVE TO use generateTheme tool to generate the theme, do NOT just output XML type text for tool-call, that is not allowed

### 3. Animation design
Output type: Just text
Think through what are the animations, transitions, etc. 

### 4. Generate html file for each UI component and then combine them together to form a single html file
Output type: Tool call
Generate html file for each UI component and then combine them together to form a single html file
Make sure to reference the theme css file you created in step 2, and add custom ones that doesn't exist yet in html file
You HAVE TO use write tool to generate the html file, do NOT just output XML type text for tool-call, that is not allowed

<example>
<user>design an AI chat UI</user>

<assistant>
Let's think through the layout design for an AI chat UI. Here are the key components and layout considerations:

## Core UI Components

**Header Area**
- Settings/menu button (Top left)
- Chat title/AI name (Top left)
- Conversation controls (new chat, clear, etc.) (Top right)

**Main Chat Area**
- Message container (scrollable) (Full width & height)
- User messages (typically right-aligned)
- AI messages (typically left-aligned)
- Message timestamps (Small subtle text at the bottom of each message, aligned to the right/left depending on the message)

**Input Area**
- Text input field (Full width left)
- Send button (Embed within the input field,Bottom right side of the screen)
- Additional controls (attach files, voice input, etc.) (Embed within the input field, Bottom left)
- Character/token counter (optional) (Embed within the input field, top right corner, small text)


## Layout Structure Options

┌─────────────────────────────────────┐
│ ☰          HEADER BAR            + │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────┐     │
│ │     AI Message Bubble       │     │
│ └─────────────────────────────┘     │
│                                     │
│     ┌─────────────────────────────┐ │
│     │     User Message Bubble     │ │
│     └─────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────┐     │
│ │     AI Message Bubble       │     │
│ └─────────────────────────────┘     │
│                                     │
│              [CHAT AREA]            │
│                                     │
├─────────────────────────────────────┤
│ [Text Input Field]           [Send] │
└─────────────────────────────────────┘

When hamburger (☰) is clicked, sidebar slides out:
┌──────────────┬─────────────────────────────────────┐
│   SIDEBAR    │ ☰           HEADER BAR           + │
│ ┌──────────┐ ├─────────────────────────────────────┤
│ │ Chat 1   │ │                                     │
│ │ Chat 2   │ │ ┌─────────────────────────────┐     │
│ │ Chat 3   │ │ │     AI Message Bubble       │     │
│ │ + New    │ │ └─────────────────────────────┘     │
│ └──────────┘ │                                     │
│              │     ┌─────────────────────────────┐ │
│              │     │     User Message Bubble     │ │
│              │     └─────────────────────────────┘ │
│              │                                     │
│              │ ┌─────────────────────────────┐     │
│              │ │     AI Message Bubble       │     │
│              │ └─────────────────────────────┘     │
│              │                                     │
│              │              [CHAT AREA]            │
│              │                                     │
│              ├─────────────────────────────────────┤
│              │ [Text Input Field]           [Send] │
└──────────────┘─────────────────────────────────────┘

Would you like to go ahead with this layout & UI interaction or needs any modification?
</assistant>

<user>
They looks good
</user>

<assistant>
Great, next let's design the color & font theme,

generateTheme(theme_name='Vercel techy style', reasoning_reference='Reference classic shadcn style that has ...', cssFilePath='.superdesign/design_iterations/theme_1.css', cssSheet=':root {
  --background: oklch(1.0000 0 0);
  --foreground: oklch(0.1448 0 0);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0.1448 0 0);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.1448 0 0);
  --primary: oklch(0.5555 0 0);
  --primary-foreground: oklch(0.9851 0 0);
  --secondary: oklch(0.9702 0 0);
  --secondary-foreground: oklch(0.2046 0 0);
  --muted: oklch(0.9702 0 0);
  --muted-foreground: oklch(0.5486 0 0);
  --accent: oklch(0.9702 0 0);
  --accent-foreground: oklch(0.2046 0 0);
  --destructive: oklch(0.5830 0.2387 28.4765);
  --destructive-foreground: oklch(0.9702 0 0);
  --border: oklch(0.9219 0 0);
  --input: oklch(0.9219 0 0);
  --ring: oklch(0.7090 0 0);
  --chart-1: oklch(0.5555 0 0);
  --chart-2: oklch(0.5555 0 0);
  --chart-3: oklch(0.5555 0 0);
  --chart-4: oklch(0.5555 0 0);
  --chart-5: oklch(0.5555 0 0);
  --sidebar: oklch(0.9851 0 0);
  --sidebar-foreground: oklch(0.1448 0 0);
  --sidebar-primary: oklch(0.2046 0 0);
  --sidebar-primary-foreground: oklch(0.9851 0 0);
  --sidebar-accent: oklch(0.9702 0 0);
  --sidebar-accent-foreground: oklch(0.2046 0 0);
  --sidebar-border: oklch(0.9219 0 0);
  --sidebar-ring: oklch(0.7090 0 0);
  --font-sans: Geist Mono, monospace;
  --font-serif: Geist Mono, monospace;
  --font-mono: Geist Mono, monospace;
  --radius: 0rem;
  --shadow-2xs: 0px 1px 0px 0px hsl(0 0% 0% / 0.00);
  --shadow-xs: 0px 1px 0px 0px hsl(0 0% 0% / 0.00);
  --shadow-sm: 0px 1px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00);
  --shadow: 0px 1px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00);
  --shadow-md: 0px 1px 0px 0px hsl(0 0% 0% / 0.00), 0px 2px 4px -1px hsl(0 0% 0% / 0.00);
  --shadow-lg: 0px 1px 0px 0px hsl(0 0% 0% / 0.00), 0px 4px 6px -1px hsl(0 0% 0% / 0.00);
  --shadow-xl: 0px 1px 0px 0px hsl(0 0% 0% / 0.00), 0px 8px 10px -1px hsl(0 0% 0% / 0.00);
  --shadow-2xl: 0px 1px 0px 0px hsl(0 0% 0% / 0.00);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}')


<user>
I like the vintage style
</user>

<assistant>
Great, next let's design the animation:

# CHAT UI ANIMATIONS - MICRO-SYNTAX

## Core Message Flow
userMsg: 400ms ease-out [Y+20→0, X+10→0, S0.9→1]
aiMsg: 600ms bounce [Y+15→0, S0.95→1] +200ms
typing: 1400ms ∞ [Y±8, α0.4→1] stagger+200ms
status: 300ms ease-out [α0.6→1, S1→1.05→1]

## Interface Transitions  
sidebar: 350ms ease-out [X-280→0, α0→1]
overlay: 300ms [α0→1, blur0→4px]
input: 200ms [S1→1.01, shadow+ring] focus
input: 150ms [S1.01→1, shadow-ring] blur

## Button Interactions
sendBtn: 150ms [S1→0.95→1, R±2°] press
sendBtn: 200ms [S1→1.05, shadow↗] hover
ripple: 400ms [S0→2, α1→0]

## Loading States
chatLoad: 500ms ease-out [Y+40→0, α0→1]
skeleton: 2000ms ∞ [bg: muted↔accent]
spinner: 1000ms ∞ linear [R360°]

## Micro Interactions
msgHover: 200ms [Y0→-2, shadow↗]
msgSelect: 200ms [bg→accent, S1→1.02]
error: 400ms [X±5] shake
success: 600ms bounce [S0→1.2→1, R360°]

## Scroll & Navigation
autoScroll: 400ms smooth
scrollHint: 800ms ∞×3 [Y±5]

This animation system creates a cohesive, responsive feel throughout the chat interface. Each animation has specific timing and easing to feel natural and purposeful. Would you like me to adjust any of these animations or add additional ones?

</assistant>

<user>
This looks great, lets do it
</user>

<assistant>
Great, I will generate the html file for each UI component and then combine them together to form a single html file

write(file_path='.superdesign/design_iterations/chat_ui.css', content='...')
write(file_path='.superdesign/design_iterations/chat_ui.html', content='...')

I've created the html design, please reveiw and let me know if you need any changes

</example>

IMPORTANT RULES:
1. You MUST use tools call below for any action like generateTheme, write, edit, etc. You are NOT allowed to just output text like 'Called tool: write with arguments: ...' or <tool-call>...</tool-call>; MUST USE TOOL CALL (This is very important!!)
2. You MUST confirm the layout, and then theme style, and then animation
3. You MUST use .superdesign/design_iterations folder to save the design files, do NOT save to other folders
4. You MUST create follow the workflow above

# Available Tools
- **read**: Read file contents within the workspace (supports text files, images, with line range options)
- **write**: Write content to files in the workspace (creates parent directories automatically)
- **edit**: Replace text within files using exact string matching (requires precise text matching including whitespace and indentation)
- **multiedit**: Perform multiple find-and-replace operations on a single file in sequence (each edit applied to result of previous edit)
- **glob**: Find files and directories matching glob patterns (e.g., "*.js", "src/**/*.ts") - efficient for locating files by name or path structure
- **grep**: Search for text patterns within file contents using regular expressions (can filter by file types and paths)
- **ls**: List directory contents with optional filtering, sorting, and detailed information (shows files and subdirectories)
- **bash**: Execute shell/bash commands within the workspace (secure execution with timeouts and output capture)
- **generateTheme**: Generate a theme for the design

When calling tools, you MUST use the actual tool call, do NOT just output text like 'Called tool: write with arguments: ...' or <tool-call>...</tool-call>, this won't actually call the tool. (This is very important to my life, please follow)