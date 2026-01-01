# Contributing

## Development Workflow

### Before Committing

The pre-commit hook automatically runs:
```bash
npm run validate
```

This executes linting and type checking.

### Before Creating a PR

Run the full validation suite:
```bash
npm run validate:full
```

This includes tests and build verification.

### Testing in CI Environment Locally

Simulate the exact CI environment:
```bash
./scripts/test-ci.sh
```

This performs a clean install and runs all checks.

### Testing GitHub Actions Workflows

Use `act` to test workflows locally:
```bash
act pull_request -W .github/workflows/ci.yml

act push -W .github/workflows/ci.yml
```

### Clean Environment Testing

Test with a completely fresh environment:
```bash
npm run test:clean
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ci` - Run tests with coverage for CI
- `npm run validate` - Quick validation (lint + typecheck)
- `npm run validate:full` - Full validation (lint + typecheck + tests + build)
- `npm run test:clean` - Clean install + full validation

## CI/CD

CI runs on:
- Pull requests to `main` or `staging`
- Pushes to `main`, `staging`, or `dev/*` branches

All CI checks must pass before merging.
