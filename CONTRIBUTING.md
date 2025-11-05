# Contributing to BLACK EDITION OS

Thank you for your interest in contributing to BLACK EDITION OS! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members
- Accept constructive criticism gracefully

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git**
- **PostgreSQL** 14+ (or use Docker)
- **Redis** 7+ (or use Docker)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Black-Edition-OS.git
   cd Black-Edition-OS
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/N0urNashat/Black-Edition-OS.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

6. **Start Docker services**
   ```bash
   docker-compose up -d postgres redis
   ```

7. **Run database migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

8. **Start development servers**
   ```bash
   npm run dev
   ```

9. **Verify setup**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

---

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

Examples:
- `feature/lead-scoring-algorithm`
- `fix/invoice-calculation-bug`
- `docs/update-api-documentation`

### 2. Make Your Changes

- Write clear, concise code
- Follow the coding standards (see below)
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

### 4. Commit Your Changes

Follow the commit message guidelines (see below):

```bash
git add .
git commit -m "feat: add lead scoring algorithm"
```

### 5. Keep Your Branch Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

1. Go to GitHub and create a pull request
2. Fill out the PR template
3. Link any related issues
4. Wait for code review

---

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Enable strict mode** in tsconfig.json
- **Define explicit types** - avoid `any`
- **Use interfaces** for object shapes
- **Use type aliases** for unions and primitives

Example:
```typescript
// Good
interface Lead {
  id: string;
  name: string;
  email: string;
  score: number;
}

// Bad
const lead: any = { ... }
```

### Code Style

- **Use Prettier** for formatting (runs automatically on commit)
- **Use ESLint** for code quality (fix issues before committing)
- **Follow functional programming** principles where possible
- **Keep functions small** and focused (< 50 lines)
- **Use meaningful variable names** (no single letters except in loops)

### React Components

- **Use functional components** with hooks
- **Keep components small** (< 200 lines)
- **Extract reusable logic** into custom hooks
- **Use TypeScript** for props

Example:
```typescript
// Good
interface LeadCardProps {
  lead: Lead;
  onSelect: (id: string) => void;
}

export function LeadCard({ lead, onSelect }: LeadCardProps) {
  return (
    <div onClick={() => onSelect(lead.id)}>
      <h3>{lead.name}</h3>
      <p>{lead.email}</p>
    </div>
  );
}
```

### File Naming

- **React components**: PascalCase (e.g., `LeadCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Types**: PascalCase (e.g., `Lead.types.ts`)

### Folder Structure

- **Feature-based organization** (e.g., `components/leads/`)
- **Shared components** in `components/ui/`
- **Utilities** in `lib/` or `utils/`
- **Types** in `types/` or co-located with components

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no code change)
- `refactor`: Code refactoring (no feature or bug fix)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, configs)
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(leads): add lead scoring algorithm"

# Bug fix
git commit -m "fix(invoices): correct tax calculation for Egyptian rates"

# Documentation
git commit -m "docs(api): update lead API documentation"

# Refactor
git commit -m "refactor(auth): simplify authentication middleware"

# Breaking change
git commit -m "feat(api): redesign lead API

BREAKING CHANGE: Lead API now uses different response format"
```

### Commit Best Practices

- **One logical change per commit**
- **Write clear, descriptive messages**
- **Use present tense** ("add feature" not "added feature")
- **Keep subject line < 72 characters**
- **Add body for complex changes**
- **Reference issues** in footer (e.g., "Closes #123")

---

## Pull Request Process

### Before Submitting

- [ ] All tests pass
- [ ] Code is formatted with Prettier
- [ ] No ESLint errors
- [ ] TypeScript compiles without errors
- [ ] Documentation is updated
- [ ] Commits follow conventional commit format
- [ ] Branch is up to date with main

### PR Template

When creating a PR, fill out the template:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented if yes)
```

### Review Process

1. **Automated checks** run (CI pipeline)
2. **Code review** by maintainers
3. **Address feedback** if requested
4. **Approval** from at least one maintainer
5. **Merge** by maintainer

### After Merge

- Delete your feature branch
- Update your local repository:
  ```bash
  git checkout main
  git pull upstream main
  ```

---

## Testing

### Unit Tests

Write unit tests for:
- Utility functions
- Business logic
- Services
- Hooks

Example:
```typescript
// lead-scoring.test.ts
import { calculateLeadScore } from './lead-scoring';

describe('calculateLeadScore', () => {
  it('should calculate score correctly', () => {
    const lead = {
      budget: 10000,
      timeline: 'urgent',
      decisionMaker: true,
    };

    const score = calculateLeadScore(lead);

    expect(score).toBe(70);
  });
});
```

### Integration Tests

Test API endpoints and database interactions:

```typescript
// leads.api.test.ts
describe('POST /api/leads', () => {
  it('should create a new lead', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({
        name: 'Test Lead',
        email: 'test@example.com',
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test Lead');
  });
});
```

### End-to-End Tests

Test critical user flows with Playwright:

```typescript
// lead-creation.e2e.ts
test('should create a new lead', async ({ page }) => {
  await page.goto('/leads/new');
  await page.fill('[name="name"]', 'Test Lead');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/leads');
  await expect(page.locator('text=Test Lead')).toBeVisible();
});
```

---

## Questions?

If you have questions or need help:

1. Check the [documentation](./docs/)
2. Search [existing issues](https://github.com/N0urNashat/Black-Edition-OS/issues)
3. Create a new issue with the "question" label
4. Join our community (if applicable)

---

## License

By contributing to BLACK EDITION OS, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to BLACK EDITION OS! 🚀
