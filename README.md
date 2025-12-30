# Gerald Dagher - Personal Website

A modern, full-stack personal website and blog platform built with Next.js 15, featuring a comprehensive admin dashboard, Directus CMS integration, and The Maron Project community platform.

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/geralddagher-site.git
cd geralddagher-site
npm install

cp .env.example .env.local

npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI Components
- TanStack Query

**Backend & Services**
- Directus CMS (Headless CMS)
- Cloudflare R2 (Asset Storage)
- Brevo (Email Marketing)
- Vercel (Hosting & Analytics)

**Editor**
- Slate.js (Rich Text Editor)
- Markdown Support
- Image Upload & Management
- Syntax Highlighting (Highlight.js)

**Infrastructure**
- Terraform (IaC)
- Digital Ocean (CMS Hosting)
- Docker Compose (Local Development)
- 1Password CLI (Secrets Management)

## ✨ Features

### Public Site
- **Blog Platform** - Rich blog posts with categories, tags, and search
- **The Maron Project** - Community mentorship platform with submissions
- **About & Timeline** - Professional background and career milestones
- **RSS Feed** - Subscribe to blog updates
- **Newsletter** - Email subscription with Brevo integration
- **Threads Integration** - Social feed integration
- **Dark/Light Theme** - System-aware theme switching
- **Responsive Design** - Mobile-first approach

### Admin Dashboard
- **Post Editor** - Rich text editor with live preview
- **Asset Manager** - Upload, organize, and track media usage
- **User Management** - Role-based access control
- **Categories & Tags** - Content taxonomy management
- **TMP Submissions** - Review and manage community submissions
- **Analytics** - View site performance and engagement
- **Argus** - Password-protected monitoring dashboard

### Content Management
- **Directus CMS** - Headless CMS with powerful API
- **Cloudflare R2** - Scalable asset storage with CDN
- **Auto-save** - Never lose your work
- **Version Control** - Track content changes
- **Media Library** - Centralized asset management

## 📁 Project Structure

```
geralddagher-site/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin dashboard pages
│   ├── argus/               # Argus monitoring dashboard
│   ├── api/                 # API routes
│   ├── blog/                # Public blog pages
│   └── themaronproject/     # TMP pages
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   ├── core/               # Shared core components
│   ├── editor/             # Slate.js editor components
│   ├── posts/              # Blog post components
│   └── themaronproject/    # TMP components
├── lib/                     # Utility libraries
│   ├── auth/               # Authentication utilities
│   ├── directus/           # Directus SDK client
│   ├── cloudflare/         # R2 storage utilities
│   ├── editor/             # Editor utilities
│   ├── email/              # Email service
│   └── utils/              # General utilities
├── content/                 # Markdown content
├── infra/                   # Infrastructure as Code
│   └── terraform/          # Terraform configurations
├── ops/                     # Operations scripts
│   ├── compose/            # Docker Compose setup
│   └── scripts/            # Deployment & utility scripts
├── public/                  # Static assets
└── hooks/                   # Custom React hooks
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server |
| `build` | Build for production |
| `start` | Start production server |
| `lint` | Run ESLint |
| `lint:fix` | Fix ESLint issues |
| `typecheck` | Run TypeScript type checking |
| `test` | Run tests with Vitest |
| `test:coverage` | Run tests with coverage |
| `clean` | Clean build artifacts |

## 🔐 Environment Variables

Key environment variables (see `.env.example`):

```bash
NEXT_PUBLIC_DIRECTUS_URL=          # Directus CMS URL
DIRECTUS_ADMIN_EMAIL=               # Admin email
DIRECTUS_ADMIN_PASSWORD=            # Admin password
DIRECTUS_API_TOKEN=                 # API token

CLOUDFLARE_ACCOUNT_ID=              # R2 account ID
CLOUDFLARE_R2_ACCESS_KEY_ID=        # R2 access key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=    # R2 secret key
CLOUDFLARE_R2_BUCKET_NAME=          # R2 bucket name

BREVO_API_KEY=                      # Email service key

NEXT_PUBLIC_SITE_URL=               # Production URL
```

## 🔐 Secrets with 1Password

Manage secrets securely using 1Password CLI:

### Prerequisites
1. Install [1Password CLI](https://developer.1password.com/docs/cli/get-started/)
2. Sign in: `op account add`
3. Ensure access to required vaults

### Usage

**Option 1: Source directly**
```bash
source ops/scripts/op-env.sh
npm run dev
```

**Option 2: Generate .env.local**
```bash
ops/scripts/op-env.sh > .env.local
npm run dev
```

### Configuration

Edit `ops/scripts/op-env.sh` to map your 1Password items:

```bash
export_var DIRECTUS_ADMIN_EMAIL op://CMS/Directus Admin/username
export_var DIRECTUS_ADMIN_PASSWORD op://CMS/Directus Admin/password
export_var CLOUDFLARE_R2_ACCESS_KEY_ID op://Storage/R2/access_key
export_var BREVO_API_KEY op://Marketing/Brevo/api_key
```

## 🚀 Deployment

### Production Deployment

```bash
git push origin main
```

Automatic deployment via Vercel on push to `main`.

### Infrastructure Deployment

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

### CMS Deployment

```bash
source ops/scripts/server-load-env.sh
ssh root@your-server "cd /opt/geralddagher-cms && docker compose up -d"
```

## 🏗️ Architecture

### Frontend Architecture
- **Next.js App Router** - Server and client components
- **React Server Components** - Optimized data fetching
- **TanStack Query** - Client-side state management
- **Tailwind CSS** - Utility-first styling

### Backend Architecture
- **Directus CMS** - Content API and admin panel
- **Cloudflare R2** - Object storage with S3-compatible API
- **Edge Functions** - API routes on Vercel Edge Network

### Authentication
- **Cookie-based sessions** - Secure session management
- **Role-based access** - Admin, Argus user, and public permissions
- **API tokens** - Service-to-service authentication
- **Proxy-level protection** - Middleware guards for protected routes

## 📝 Development Workflow

1. **Feature branches** - `git checkout -b feature/name`
2. **Type checking** - `npm run typecheck`
3. **Linting** - `npm run lint:fix`
4. **Testing** - `npm test`
5. **Commit** - Follow conventional commits
6. **PR Review** - Create pull request to `main`

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # UI mode
npm run test:coverage # Coverage report
```

## 🔍 Logging

Centralized logging via `lib/utils/logger.ts`:

```typescript
import { Logger } from '@/lib/utils/logger';

Logger.info('User logged in', { userId: user.id });
Logger.error('API error', { error }, { location: 'auth/signin' });
Logger.debug('Cache hit', { key });
```

Features:
- **Environment-aware** - Different levels for dev/prod
- **Structured logging** - Consistent format with timestamps
- **Context support** - Location, userId, requestId
- **Sensitive data redaction** - Auto-redact passwords, tokens

## 📦 Key Dependencies

- **@directus/sdk** - Directus client SDK
- **@aws-sdk/client-s3** - R2 storage client
- **slate** - Rich text editor framework
- **@tanstack/react-query** - Data fetching & caching
- **framer-motion** - Animation library
- **@radix-ui/\*** - Accessible UI primitives
- **zod** - Schema validation
- **@vercel/analytics** - Analytics integration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit changes (`git commit -m 'feat: add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Create Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by [Gerald Dagher](https://geralddagher.com)**

## 🔗 Links

- [Live Site](https://geralddagher.com)
- [The Maron Project](https://geralddagher.com/themaronproject)
- [Blog](https://geralddagher.com/blog)
- [RSS Feed](https://geralddagher.com/rss)
