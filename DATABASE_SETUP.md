# Database Setup Guide

## Prerequisites

Black Edition OS uses PostgreSQL as its primary database. You need to have PostgreSQL installed and running.

## Installation Options

### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL and Redis with Docker Compose
npm run docker:up

# Stop services
npm run docker:down
```

### Option 2: Local PostgreSQL Installation

#### macOS
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

#### Windows
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

## Database Setup Steps

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE blackedition;

# Create user (optional)
CREATE USER blackedition_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE blackedition TO blackedition_user;

# Exit
\q
```

### 2. Update .env File

Update the `DATABASE_URL` in your `.env` file:

```env
# Default (using postgres user)
DATABASE_URL=postgresql://postgres:password@localhost:5432/blackedition

# Or with custom user
DATABASE_URL=postgresql://blackedition_user:your_password@localhost:5432/blackedition
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Run Database Migration

```bash
# Create and apply migration
npx prisma migrate dev --name complete_schema

# Or from root
npm run db:migrate
```

### 5. Seed Database with Sample Data

```bash
# Run seed script
npm run db:seed
```

This will create:
- 2 Egyptian organizations (Black Edition Agency, Digital Hub Egypt)
- 6 users with different roles
- 18 leads in various stages
- 7 customers with monthly contracts (EGP 28k-95k)
- 8 projects
- 12 milestones
- 28 tasks
- 65+ time entries
- 10 invoices
- 8 payments
- 15 files
- 120+ activity logs
- 3 workflows
- 5 reports
- 20 notifications

### 6. Verify Database

```bash
# Open Prisma Studio to view data
npx prisma studio
```

Access at: http://localhost:5555

## Troubleshooting

### Connection Errors

If you get connection errors:

1. Check if PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   sudo service postgresql status
   ```

2. Check PostgreSQL port (default 5432):
   ```bash
   sudo lsof -i :5432
   ```

3. Verify connection string in `.env`

### Permission Errors

```bash
# Grant permissions to user
psql -U postgres -d blackedition
GRANT ALL ON SCHEMA public TO blackedition_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO blackedition_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO blackedition_user;
```

### Reset Database

```bash
# Drop and recreate
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Apply all migrations
# 4. Run seed script
```

## Database Schema Summary

The complete schema includes:

### Core Models
- **User** - Team members with roles (ADMIN, MANAGER, MEMBER, CLIENT)
- **Organization** - Multi-tenant organizations

### CRM
- **Lead** - Sales leads with scoring (0-100)
- **Customer** - Converted customers with service packages

### Project Management
- **Project** - Client projects with budget tracking
- **Task** - Tasks with dependencies and subtasks
- **Milestone** - Project milestones
- **ProjectMember** - Team assignments

### Time Tracking
- **TimeEntry** - Billable and non-billable time logs

### Financial
- **Invoice** - Invoices with line items
- **InvoiceLineItem** - Invoice details
- **Payment** - Payment transactions (PayMob, Stripe, etc.)

### System
- **File** - Document attachments
- **Activity** - Audit trail
- **Workflow** - Automation rules
- **WorkflowExecution** - Automation logs
- **Report** - AI-powered reports
- **Notification** - User notifications

## Next Steps

After database setup is complete:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - Prisma Studio: http://localhost:5555

3. Test with seed data:
   - Organization slug: `black-edition`
   - Access: http://localhost:3000/black-edition
