# BLACK EDITION OS

**Agency Operating System - Streamline Your Creative Agency Operations**

BLACK EDITION OS is a comprehensive, AI-powered agency management platform designed to revolutionize how digital agencies and creative firms operate. From lead management to project delivery, invoicing to client collaboration, this all-in-one solution eliminates the chaos of juggling multiple tools.

---

## Features

### Core CRM
- **Lead Management:** Capture, score, and nurture leads with intelligent pipeline visualization
- **Customer Management:** Centralized customer profiles with service packages and history
- **Activity Tracking:** Complete timeline of interactions, emails, calls, and meetings

### Project & Task Management
- **Project Tracking:** Manage projects with milestones, budgets, and team assignments
- **Task Management:** Kanban boards, list views, and calendar views with dependencies
- **Time Tracking:** Built-in timer, manual entry, and approval workflows

### Financial Management
- **Invoicing:** Professional invoice generation with customizable templates
- **Payment Processing:** Integrated PayMob (Egypt) and Stripe (international) support
- **Financial Reporting:** Revenue tracking, aging reports, and profitability analysis

### Client Portal
- **Client Access:** Dedicated portal for clients to view projects and invoices
- **Collaboration:** Deliverable approval workflows and file sharing
- **Communication:** Built-in messaging system between agency and clients

### AI-Powered Automation
- **Proposal Generation:** AI-powered proposal writing using Claude API
- **Email Assistant:** Automated email drafting for follow-ups and updates
- **Report Insights:** AI-generated insights and recommendations from analytics
- **Natural Language Search:** Find anything across your entire system

### Workflow Automation
- **Visual Workflow Builder:** Create custom automations with triggers and actions
- **Pre-built Templates:** Lead nurturing, invoice reminders, onboarding sequences
- **Execution Tracking:** Monitor and debug workflow performance

### Analytics & Reporting
- **Comprehensive Dashboards:** Sales, project, and financial analytics
- **Custom Reports:** Build and schedule reports with flexible configurations
- **Real-time Metrics:** Live updates on key performance indicators

---

## Technology Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **React Query**
- **Zustand**

### Backend
- **Next.js API Routes** (simple CRUD)
- **Node.js/Express** (complex workflows, background jobs)
- **TypeScript**

### Database & Storage
- **PostgreSQL** (primary database)
- **Prisma ORM**
- **Redis** (caching)
- **Cloudflare R2** (file storage)

### Authentication & Payments
- **Clerk** (authentication)
- **PayMob** (Egypt)
- **Stripe** (international - optional)

### AI & Email
- **Anthropic Claude API** (AI features)
- **Resend** (transactional email)

### DevOps
- **Docker**
- **GitHub Actions**
- **Nginx**
- **Hostinger VPS**

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 14+ (or use Docker)
- Redis 7+ (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/N0urNashat/Black-Edition-OS.git
   cd Black-Edition-OS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Run database migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. **Seed development data (optional)**
   ```bash
   npm run db:seed
   ```

7. **Start development servers**
   ```bash
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

---

## Project Structure

```
Black-Edition-OS/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Node.js/Express backend
├── packages/
│   ├── database/     # Prisma schema and client
│   ├── types/        # Shared TypeScript types
│   ├── validation/   # Zod schemas
│   └── config/       # Shared configuration
├── docs/             # Documentation
├── scripts/          # Utility scripts
└── docker/           # Docker configurations
```

See [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) for detailed structure.

---

## Development

### Available Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:web          # Start frontend only
npm run dev:api          # Start backend only

# Building
npm run build            # Build all apps
npm run build:web        # Build frontend
npm run build:api        # Build backend

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed data

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests
npm run test:e2e         # End-to-end tests

# Linting & Formatting
npm run lint             # Lint all code
npm run format           # Format with Prettier

# Docker
npm run docker:up        # Start all Docker services
npm run docker:down      # Stop all Docker services
npm run docker:logs      # View logs
```

### Development Workflow

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes with frequent commits
   ```bash
   git add .
   git commit -m "feat: add feature description"
   ```

3. Push and create pull request
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Documentation

- [Development Plan](./DEVELOPMENT-PLAN.md) - Comprehensive 16-week development roadmap
- [Project Structure](./PROJECT-STRUCTURE.md) - Detailed directory structure and organization
- [Architecture](./ARCHITECTURE.md) - System architecture and design decisions
- [Sprint Roadmap](./SPRINT-ROADMAP.md) - Week-by-week implementation plan

### User Guides
- [Getting Started](./docs/guides/getting-started.md)
- [Lead Management](./docs/guides/lead-management.md)
- [Project Management](./docs/guides/project-management.md)
- [Invoicing](./docs/guides/invoicing.md)
- [Client Portal](./docs/guides/client-portal.md)
- [AI Features](./docs/guides/ai-features.md)

### API Documentation
- [API Overview](./docs/api/README.md)
- [Authentication](./docs/api/authentication.md)
- [Leads API](./docs/api/leads.md)
- [Projects API](./docs/api/projects.md)
- [Invoices API](./docs/api/invoices.md)

---

## Deployment

### Using Docker (Recommended)

1. **Build Docker images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Start services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run migrations**
   ```bash
   docker-compose exec api npm run db:migrate
   ```

### Manual Deployment

See [Deployment Guide](./docs/deployment/vps-setup.md) for detailed instructions.

---

## Environment Variables

Required environment variables:

### Frontend (`apps/web/.env`)
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DATABASE_URL=postgresql://...
```

### Backend (`apps/api/.env`)
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
PAYMOB_API_KEY=...
```

See `.env.example` files for complete list.

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

---

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

---

## License

This project is proprietary software owned by Black Edition Agency.

---

## Support

For support, please contact:
- Email: support@blackedition.com
- Documentation: https://docs.blackedition.com
- Issues: https://github.com/N0urNashat/Black-Edition-OS/issues

---

## Roadmap

### Phase 1: MVP (Months 1-3)
- ✅ Core CRM (Leads & Customers)
- ✅ Project & Task Management
- ✅ Financial Management (Invoicing & Payments)
- ✅ Client Portal
- ✅ AI Integration (Proposal Generator, Email Assistant)
- ✅ Basic Automation & Reporting

### Phase 2: Enhancement (Months 4-6)
- Advanced Analytics
- Mobile App (PWA)
- Advanced Workflow Automation
- Integration Marketplace

### Phase 3: SaaS Launch (Months 7-12)
- Multi-language Support
- Subscription Billing
- White-label Capabilities
- Public API

### Future
- AI Chatbot
- Advanced Resource Planning
- Contract Management
- Native Mobile Apps

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Clerk](https://clerk.com/)
- [Anthropic Claude](https://www.anthropic.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## About Black Edition

Black Edition is a digital agency specializing in web development, mobile apps, and digital marketing. This platform is built by agencies, for agencies.

Website: https://blackedition.com

---

**Made with ❤️ by Black Edition Agency**
