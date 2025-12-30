# CI/CD Workflows

This document describes the GitHub Actions workflows configured for this repository.

## Workflows

### 1. CI (`ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests targeting `main` branch

**Jobs:**

#### Lint
- Runs ESLint to check code quality and style
- Command: `npm run lint`

#### Type Check
- Runs TypeScript compiler in check mode
- Command: `npm run typecheck`
- Ensures no type errors

#### Unit Tests
- Runs all unit tests with coverage
- Command: `npm run test:ci`
- Uploads coverage reports to Codecov (if configured)
- Currently: **109 tests passing**

#### Build
- Builds the Next.js application
- Command: `npm run build`
- Verifies the application can be built successfully
- Uses `SKIP_ENV_VALIDATION=true` for CI environment

**Status:** All jobs must pass before merging to `main`

---

### 2. Security & Dependencies (`security.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests targeting `main` branch
- Weekly schedule (Mondays at midnight UTC)

**Jobs:**

#### Security Audit
- Runs `npm audit` to check for known vulnerabilities
- Audit level: moderate
- Continues on error (non-blocking)

#### Dependency Review
- Reviews dependency changes in pull requests
- Fails on high severity vulnerabilities
- Only runs on pull requests

**Status:** Provides security visibility; high severity issues block PRs

---

### 3. Deploy CMS (`deploy-cms.yml`)

**Triggers:**
- Manual trigger (`workflow_dispatch`)
- Push to `main` branch with changes to `ops/compose/**`

**Jobs:**

#### Deploy
- Copies compose files to DigitalOcean droplet via SSH
- Creates `.env` file from GitHub secrets
- Pulls latest Docker images
- Restarts Directus CMS containers

**Environment Variables (from secrets):**
- `CMS_DOMAIN`
- `DB_USER`, `DB_PASSWORD`
- `DIRECTUS_KEY`, `DIRECTUS_SECRET`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`, `R2_ENDPOINT`
- `CORS_ORIGIN`

**Status:** Deploys Directus CMS to production

---

## Deployment Strategy

### Next.js Application (Vercel)
- **Automatic:** Deploys on every push to `main`
- **Preview:** Creates preview deployments for PRs
- **Environment:** Production environment configured in Vercel dashboard
- **Build Command:** `npm run build`
- **Install Command:** `npm install --legacy-peer-deps`

### Directus CMS (DigitalOcean)
- **Manual/Automatic:** Via `deploy-cms.yml` workflow
- **Location:** DigitalOcean droplet
- **Method:** Docker Compose
- **Configuration:** `ops/compose/`

---

## Required GitHub Secrets

### For CMS Deployment
- `DROPLET_IP` - DigitalOcean droplet IP address
- `SSH_PRIVATE_KEY` - SSH key for droplet access
- `CMS_DOMAIN` - Domain for Directus CMS
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DIRECTUS_KEY` - Directus encryption key
- `DIRECTUS_SECRET` - Directus secret
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password
- `R2_ACCESS_KEY` - Cloudflare R2 access key
- `R2_SECRET_KEY` - Cloudflare R2 secret key
- `R2_BUCKET` - R2 bucket name
- `R2_ENDPOINT` - R2 endpoint URL
- `CORS_ORIGIN` - Allowed CORS origin

### For Code Coverage (Optional)
- `CODECOV_TOKEN` - Codecov integration token

---

## Branch Protection Recommendations

Configure the following branch protection rules for `main`:

1. **Require pull request reviews:** At least 1 approval
2. **Require status checks to pass:**
   - Lint
   - Type Check
   - Unit Tests
   - Build
   - Dependency Review (for PRs)
3. **Require branches to be up to date:** Yes
4. **Include administrators:** No (for flexibility)

---

## Local Development

Before pushing code, run these commands locally:

```bash
npm run lint         # Check linting
npm run typecheck    # Check types
npm run test:run     # Run tests
npm run build        # Verify build
```

Or run all checks at once:

```bash
npm run lint && npm run typecheck && npm run test:run && npm run build
```

---

## Monitoring

- **CI Status:** Visible on PR pages and commit statuses
- **Test Coverage:** Tracked via Codecov (if configured)
- **Security:** Weekly automated audits
- **Dependencies:** Reviewed on every PR

---

## Future Enhancements

- [ ] E2E testing with Playwright
- [ ] Performance testing
- [ ] Visual regression testing
- [ ] Automated dependency updates (Dependabot/Renovate)
- [ ] Lighthouse CI for performance budgets
- [ ] Deployment notifications (Slack/Discord)
