# BLACK EDITION OS - Project Structure

## Overview

BLACK EDITION OS uses a **monorepo architecture** with separate workspaces for frontend, backend, and shared packages. This structure promotes code reuse, type safety across the stack, and maintainability.

---

## Directory Structure

```
Black-Edition-OS/
│
├── .github/                          # GitHub configuration
│   ├── workflows/                    # CI/CD pipelines
│   │   ├── ci.yml                   # Continuous integration (lint, test, build)
│   │   ├── deploy-staging.yml       # Staging deployment
│   │   └── deploy-production.yml    # Production deployment
│   └── ISSUE_TEMPLATE/              # Issue templates
│
├── apps/                             # Application workspaces
│   │
│   ├── web/                         # Frontend - Next.js 14 App
│   │   ├── app/                     # Next.js 14 App Router
│   │   │   ├── (auth)/             # Auth routes group
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (dashboard)/        # Main dashboard routes
│   │   │   │   ├── leads/
│   │   │   │   │   ├── page.tsx            # Lead list
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx        # Lead detail
│   │   │   │   │   ├── new/
│   │   │   │   │   └── pipeline/           # Kanban view
│   │   │   │   │
│   │   │   │   ├── customers/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │
│   │   │   │   ├── projects/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx        # Project dashboard
│   │   │   │   │   │   ├── tasks/          # Task views
│   │   │   │   │   │   ├── files/
│   │   │   │   │   │   └── settings/
│   │   │   │   │   └── new/
│   │   │   │   │
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── page.tsx            # All tasks view
│   │   │   │   │   ├── board/              # Kanban board
│   │   │   │   │   ├── list/               # List view
│   │   │   │   │   └── calendar/           # Calendar view
│   │   │   │   │
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   └── new/
│   │   │   │   │
│   │   │   │   ├── reports/
│   │   │   │   │   ├── page.tsx            # Reports dashboard
│   │   │   │   │   ├── sales/
│   │   │   │   │   ├── financial/
│   │   │   │   │   ├── projects/
│   │   │   │   │   └── custom/
│   │   │   │   │
│   │   │   │   ├── ai/
│   │   │   │   │   ├── proposals/
│   │   │   │   │   ├── emails/
│   │   │   │   │   └── insights/
│   │   │   │   │
│   │   │   │   ├── automations/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   └── templates/
│   │   │   │   │
│   │   │   │   ├── settings/
│   │   │   │   │   ├── profile/
│   │   │   │   │   ├── organization/
│   │   │   │   │   ├── billing/
│   │   │   │   │   ├── integrations/
│   │   │   │   │   └── team/
│   │   │   │   │
│   │   │   │   └── layout.tsx              # Dashboard layout with sidebar
│   │   │   │
│   │   │   ├── (client-portal)/           # Client-facing routes
│   │   │   │   ├── portal/
│   │   │   │   │   ├── page.tsx            # Client dashboard
│   │   │   │   │   ├── projects/
│   │   │   │   │   ├── invoices/
│   │   │   │   │   ├── messages/
│   │   │   │   │   └── files/
│   │   │   │   └── layout.tsx              # Client portal layout
│   │   │   │
│   │   │   ├── api/                        # Next.js API routes
│   │   │   │   ├── leads/
│   │   │   │   │   ├── route.ts            # GET, POST /api/leads
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── route.ts        # GET, PATCH, DELETE
│   │   │   │   │       └── convert/
│   │   │   │   │           └── route.ts    # POST convert to customer
│   │   │   │   ├── customers/
│   │   │   │   ├── projects/
│   │   │   │   ├── tasks/
│   │   │   │   ├── invoices/
│   │   │   │   ├── payments/
│   │   │   │   ├── ai/
│   │   │   │   ├── reports/
│   │   │   │   └── webhooks/
│   │   │   │       ├── clerk/              # Clerk webhooks
│   │   │   │       ├── paymob/             # PayMob webhooks
│   │   │   │       └── stripe/             # Stripe webhooks
│   │   │   │
│   │   │   ├── layout.tsx                  # Root layout
│   │   │   ├── page.tsx                    # Landing/home page
│   │   │   └── not-found.tsx
│   │   │
│   │   ├── components/                     # React components
│   │   │   ├── leads/
│   │   │   │   ├── lead-list.tsx
│   │   │   │   ├── lead-card.tsx
│   │   │   │   ├── lead-form.tsx
│   │   │   │   ├── lead-pipeline.tsx
│   │   │   │   └── lead-detail.tsx
│   │   │   │
│   │   │   ├── projects/
│   │   │   │   ├── project-card.tsx
│   │   │   │   ├── project-form.tsx
│   │   │   │   ├── project-dashboard.tsx
│   │   │   │   └── project-progress.tsx
│   │   │   │
│   │   │   ├── tasks/
│   │   │   │   ├── task-board.tsx          # Kanban board
│   │   │   │   ├── task-list.tsx
│   │   │   │   ├── task-card.tsx
│   │   │   │   ├── task-form.tsx
│   │   │   │   └── task-detail-modal.tsx
│   │   │   │
│   │   │   ├── invoices/
│   │   │   │   ├── invoice-form.tsx
│   │   │   │   ├── invoice-list.tsx
│   │   │   │   ├── invoice-preview.tsx
│   │   │   │   └── line-item-builder.tsx
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── proposal-generator.tsx
│   │   │   │   ├── email-assistant.tsx
│   │   │   │   ├── insight-panel.tsx
│   │   │   │   └── nl-search.tsx
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── dashboard-widget.tsx
│   │   │   │   ├── chart-container.tsx
│   │   │   │   └── report-builder.tsx
│   │   │   │
│   │   │   ├── automations/
│   │   │   │   ├── workflow-builder.tsx
│   │   │   │   ├── trigger-selector.tsx
│   │   │   │   ├── action-builder.tsx
│   │   │   │   └── workflow-list.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── breadcrumbs.tsx
│   │   │   │   └── mobile-nav.tsx
│   │   │   │
│   │   │   └── ui/                         # shadcn/ui components
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── table.tsx
│   │   │       └── ... (all shadcn components)
│   │   │
│   │   ├── lib/                            # Utility libraries
│   │   │   ├── api-client.ts              # API client with axios
│   │   │   ├── auth.ts                    # Clerk helpers
│   │   │   ├── utils.ts                   # General utilities
│   │   │   ├── validations.ts             # Zod schemas
│   │   │   └── constants.ts               # App constants
│   │   │
│   │   ├── hooks/                          # Custom React hooks
│   │   │   ├── use-leads.ts
│   │   │   ├── use-projects.ts
│   │   │   ├── use-tasks.ts
│   │   │   ├── use-invoices.ts
│   │   │   ├── use-ai.ts
│   │   │   └── use-debounce.ts
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css                 # Global styles with Tailwind
│   │   │
│   │   ├── public/                         # Static assets
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── favicon.ico
│   │   │
│   │   ├── middleware.ts                   # Next.js middleware (auth)
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── api/                                # Backend Service - Node.js/Express
│       ├── src/
│       │   ├── server.ts                   # Express server setup
│       │   │
│       │   ├── config/                     # Configuration
│       │   │   ├── database.ts            # Database connection
│       │   │   ├── redis.ts               # Redis connection
│       │   │   ├── env.ts                 # Environment validation
│       │   │   └── constants.ts
│       │   │
│       │   ├── middleware/                 # Express middleware
│       │   │   ├── auth.ts                # JWT verification
│       │   │   ├── error-handler.ts       # Global error handler
│       │   │   ├── rate-limit.ts          # Rate limiting
│       │   │   ├── validate.ts            # Request validation
│       │   │   └── logger.ts              # Request logging
│       │   │
│       │   ├── routes/                     # API routes (optional if using Next.js API)
│       │   │   ├── index.ts
│       │   │   ├── leads.ts
│       │   │   ├── projects.ts
│       │   │   └── webhooks.ts
│       │   │
│       │   ├── services/                   # Business logic services
│       │   │   ├── lead-scoring.service.ts
│       │   │   ├── workflow.service.ts
│       │   │   ├── ai.service.ts
│       │   │   ├── email.service.ts
│       │   │   ├── payment.service.ts
│       │   │   ├── pdf.service.ts
│       │   │   ├── notification.service.ts
│       │   │   └── analytics.service.ts
│       │   │
│       │   ├── jobs/                       # Background jobs
│       │   │   ├── queue.ts               # Bull queue setup
│       │   │   ├── email-jobs.ts          # Email sending jobs
│       │   │   ├── invoice-reminder.ts    # Invoice reminders
│       │   │   ├── report-generation.ts   # Scheduled reports
│       │   │   └── workflow-execution.ts  # Workflow automation
│       │   │
│       │   ├── integrations/              # Third-party integrations
│       │   │   ├── anthropic/
│       │   │   │   ├── client.ts
│       │   │   │   ├── prompts.ts
│       │   │   │   └── usage-tracker.ts
│       │   │   │
│       │   │   ├── paymob/
│       │   │   │   ├── client.ts
│       │   │   │   ├── webhook-handler.ts
│       │   │   │   └── payment-link.ts
│       │   │   │
│       │   │   ├── stripe/
│       │   │   │   ├── client.ts
│       │   │   │   └── webhook-handler.ts
│       │   │   │
│       │   │   ├── resend/
│       │   │   │   ├── client.ts
│       │   │   │   └── templates/
│       │   │   │       ├── invoice.tsx
│       │   │   │       ├── payment-confirmation.tsx
│       │   │   │       └── reminder.tsx
│       │   │   │
│       │   │   └── cloudflare-r2/
│       │   │       ├── client.ts
│       │   │       └── upload.ts
│       │   │
│       │   └── utils/                      # Utility functions
│       │       ├── logger.ts              # Winston logger
│       │       ├── encryption.ts
│       │       └── helpers.ts
│       │
│       ├── tests/                          # Backend tests
│       │   ├── unit/
│       │   ├── integration/
│       │   └── fixtures/
│       │
│       ├── Dockerfile
│       ├── tsconfig.json
│       ├── package.json
│       └── .env.example
│
├── packages/                               # Shared packages
│   │
│   ├── database/                          # Prisma ORM package
│   │   ├── prisma/
│   │   │   ├── schema.prisma              # Database schema
│   │   │   ├── migrations/                # Migration history
│   │   │   └── seed.ts                    # Seed data script
│   │   │
│   │   ├── src/
│   │   │   ├── index.ts                   # Prisma client export
│   │   │   └── seed-helpers.ts
│   │   │
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                             # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── lead.types.ts
│   │   │   ├── customer.types.ts
│   │   │   ├── project.types.ts
│   │   │   ├── task.types.ts
│   │   │   ├── invoice.types.ts
│   │   │   ├── payment.types.ts
│   │   │   ├── workflow.types.ts
│   │   │   ├── ai.types.ts
│   │   │   └── api.types.ts               # API request/response types
│   │   │
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                                # Shared UI components (optional)
│   │   ├── src/
│   │   │   └── ... (reusable components)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── config/                            # Shared configuration
│   │   ├── eslint-config/                 # Shared ESLint config
│   │   ├── tsconfig/                      # Base TypeScript configs
│   │   └── tailwind-config/               # Shared Tailwind config
│   │
│   └── validation/                        # Shared Zod schemas
│       ├── src/
│       │   ├── index.ts
│       │   ├── lead.schema.ts
│       │   ├── project.schema.ts
│       │   ├── invoice.schema.ts
│       │   └── ... (all validation schemas)
│       │
│       ├── package.json
│       └── tsconfig.json
│
├── scripts/                                # Utility scripts
│   ├── setup-dev.sh                       # Development environment setup
│   ├── backup-db.sh                       # Database backup script
│   ├── restore-db.sh                      # Database restore script
│   ├── seed-dev-data.ts                   # Seed development data
│   └── generate-api-docs.ts               # API documentation generator
│
├── docs/                                   # Documentation
│   ├── api/                               # API documentation
│   │   ├── leads.md
│   │   ├── projects.md
│   │   ├── invoices.md
│   │   └── webhooks.md
│   │
│   ├── guides/                            # User guides
│   │   ├── getting-started.md
│   │   ├── lead-management.md
│   │   ├── project-management.md
│   │   ├── invoicing.md
│   │   ├── client-portal.md
│   │   └── ai-features.md
│   │
│   ├── architecture/                      # Architecture docs
│   │   ├── overview.md
│   │   ├── database-schema.md
│   │   ├── api-design.md
│   │   └── security.md
│   │
│   └── deployment/                        # Deployment guides
│       ├── docker.md
│       ├── vps-setup.md
│       └── monitoring.md
│
├── docker/                                 # Docker configurations
│   ├── docker-compose.yml                 # Full stack compose
│   ├── docker-compose.dev.yml             # Development overrides
│   ├── docker-compose.prod.yml            # Production overrides
│   │
│   ├── nginx/
│   │   ├── nginx.conf                     # Nginx configuration
│   │   └── Dockerfile
│   │
│   ├── postgres/
│   │   └── init.sql                       # Initial database setup
│   │
│   └── redis/
│       └── redis.conf                     # Redis configuration
│
├── .github/                                # GitHub configuration
├── .vscode/                                # VS Code workspace settings
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
│
├── .env.example                            # Environment variables template
├── .gitignore
├── .eslintrc.js                           # Root ESLint config
├── .prettierrc                            # Prettier config
├── package.json                           # Root package.json (workspaces)
├── tsconfig.json                          # Root TypeScript config
├── README.md                              # Project README
├── DEVELOPMENT-PLAN.md                    # This development plan
├── PROJECT-STRUCTURE.md                   # This file
├── ARCHITECTURE.md                        # Architecture documentation
├── SPRINT-ROADMAP.md                      # Detailed sprint breakdown
└── LICENSE
```

---

## Package Dependencies

### Root `package.json` (Workspace Manager)

```json
{
  "name": "black-edition-os",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "db:generate": "cd packages/database && prisma generate",
    "db:migrate": "cd packages/database && prisma migrate dev",
    "db:studio": "cd packages/database && prisma studio",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  },
  "devDependencies": {
    "turbo": "^1.13.0",
    "prettier": "^3.2.5",
    "eslint": "^8.57.0",
    "typescript": "^5.4.5"
  }
}
```

### Frontend `apps/web/package.json`

```json
{
  "name": "@black-edition/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@clerk/nextjs": "^4.30.0",
    "@tanstack/react-query": "^5.32.0",
    "axios": "^1.6.8",
    "zod": "^3.23.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.4",
    "date-fns": "^3.6.0",
    "recharts": "^2.12.0",
    "zustand": "^4.5.2",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "lucide-react": "^0.372.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "@black-edition/types": "*",
    "@black-edition/database": "*",
    "@black-edition/validation": "*"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.5",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^15.0.0",
    "playwright": "^1.43.0"
  }
}
```

### Backend `apps/api/package.json`

```json
{
  "name": "@black-edition/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src --ext ts"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.2.0",
    "@clerk/clerk-sdk-node": "^4.13.0",
    "bull": "^4.12.0",
    "ioredis": "^5.3.2",
    "winston": "^3.13.0",
    "zod": "^3.23.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "resend": "^3.2.0",
    "stripe": "^15.0.0",
    "aws-sdk": "^2.1600.0",
    "puppeteer": "^22.6.0",
    "@black-edition/database": "*",
    "@black-edition/types": "*",
    "@black-edition/validation": "*"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.7",
    "@types/cors": "^2.8.17",
    "typescript": "^5.4.5",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "eslint": "^8.57.0"
  }
}
```

### Database `packages/database/package.json`

```json
{
  "name": "@black-edition/database",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "studio": "prisma studio",
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.12.0"
  },
  "devDependencies": {
    "prisma": "^5.12.0",
    "tsx": "^4.7.0",
    "typescript": "^5.4.5"
  }
}
```

---

## Environment Variables

### Frontend `.env.example`

```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (for API routes if using Prisma directly)
DATABASE_URL=postgresql://user:password@localhost:5432/blackedition
```

### Backend `.env.example`

```env
# Server
NODE_ENV=development
PORT=4000
API_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/blackedition

# Redis
REDIS_URL=redis://localhost:6379

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20240620

# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@blackedition.com

# PayMob
PAYMOB_API_KEY=...
PAYMOB_INTEGRATION_ID=...
PAYMOB_IFRAME_ID=...
PAYMOB_HMAC_SECRET=...

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=black-edition-files
R2_PUBLIC_URL=https://...

# Sentry
SENTRY_DSN=https://...
```

---

## Key Design Decisions

### 1. Monorepo with Workspaces
- **Tool:** npm workspaces (or pnpm/yarn)
- **Benefits:** Shared code, type safety, simplified dependency management
- **Tradeoff:** More complex build setup

### 2. Hybrid Backend Architecture
- **Next.js API Routes:** Simple CRUD, client-facing endpoints
- **Separate Express Service:** Complex workflows, background jobs, AI processing
- **Benefits:** Simplicity where possible, flexibility where needed

### 3. Shared Packages
- **`@black-edition/database`:** Single source of truth for schema
- **`@black-edition/types`:** Full type safety across frontend and backend
- **`@black-edition/validation`:** Shared Zod schemas for consistency

### 4. Component Organization
- **Feature-based folders:** Components organized by domain (leads, projects, etc.)
- **Shared UI:** shadcn/ui components in dedicated folder
- **Layout components:** Separate folder for layout-related components

### 5. API Design
- **RESTful:** Standard CRUD endpoints
- **Type-safe:** Shared TypeScript types
- **Validated:** Zod schemas on all inputs
- **Consistent:** Standardized error responses

---

## Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd Black-Edition-OS

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Start Docker services (PostgreSQL, Redis)
docker-compose up -d postgres redis

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

### 2. Development
```bash
# Start all services
npm run dev

# Or start individually
cd apps/web && npm run dev      # Frontend at http://localhost:3000
cd apps/api && npm run dev      # Backend at http://localhost:4000
```

### 3. Testing
```bash
# Run all tests
npm run test

# Run specific tests
cd apps/web && npm run test:e2e
cd apps/api && npm run test
```

### 4. Building
```bash
# Build all apps
npm run build

# Build individually
cd apps/web && npm run build
cd apps/api && npm run build
```

---

## Deployment Structure

### Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    volumes: ["postgres_data:/var/lib/postgresql/data"]

  redis:
    image: redis:7
    ports: ["6379:6379"]

  web:
    build: ./apps/web
    ports: ["3000:3000"]
    depends_on: ["postgres", "redis", "api"]

  api:
    build: ./apps/api
    ports: ["4000:4000"]
    depends_on: ["postgres", "redis"]

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    depends_on: ["web"]
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/ssl:/etc/nginx/ssl
```

---

## Conclusion

This project structure provides:
- ✅ Clear separation of concerns
- ✅ Type safety across the entire stack
- ✅ Code reusability through shared packages
- ✅ Scalable architecture
- ✅ Developer-friendly organization
- ✅ Production-ready deployment structure

The structure is designed to grow with the project, from MVP to full-scale SaaS platform.
