# Project Instructions

This document provides technical context and instructions for working with this project.

## Authentication & Authorization Architecture

### Overview

The system uses a multi-layered authentication approach:
- **Client-side**: Cookie-based session authentication via Directus
- **Server-side API routes**: Token-based authentication using Directus API tokens
- **Public API routes**: No authentication required for read-only public content

### Authentication Patterns

#### 1. Directus Authentication

**Connection Types:**
- **Client (browser)**: Uses `lib/directus/client.ts` with cookie-based auth
- **Server (API routes)**: Uses `lib/directus/server-client.ts` with static tokens

**Token Priority:**
1. Session token from cookie (for authenticated users)
2. Static API token from environment variable (for server operations)
3. No authentication (for public read-only operations)

**File**: `lib/directus/server-client.ts`
```typescript
// Returns client with session token if available, falls back to API token
async function createDirectusServerClient(options?: { requireAuth?: boolean })
```

#### 2. User Authentication

**Server-side user retrieval**: `lib/auth/server-utils.ts::getServerUser()`
- Reads Directus session
- Maps Directus user to internal User type
- Determines admin status based on role name

**Role mapping**:
- Directus roles with names containing "admin" or "administrator" → `admin` role
- All other authenticated users → `user` role

#### 3. API Route Protection

**Location**: `lib/auth/api-auth.ts`

**Patterns**:
```typescript
// Require any authenticated user
await requireAuthApi()

// Require admin user
await requireAdminApi()

// Higher-order function wrapper
export const GET = withAdminAuth(async (user, request) => { ... })
```

**Best practices**:
- Use `requireAdminApi()` for all admin mutations (create, update, delete)
- Use `requireAuthApi()` for user-specific operations
- No auth required for public read-only endpoints

### Authorization Checks

**File**: `lib/auth/groups.ts`

**Functions**:
- `hasAdminAccess(user)` - Checks if user has admin privileges
- `hasArgusAccess(user)` - Checks if user has Argus feature access
- `hasGroupAccess(user, group)` - Generic group access check

**Access determination**:
- Checks `user.role === 'admin'`
- Checks `user.teams` array
- Checks `user.labels` array

### Public vs. Private Content

**Public content** (no authentication required):
- Published blog posts (status = 'published')
- Public user profiles
- Published post assets (cover images, content images)

**Private content** (requires authentication):
- Draft posts (status = 'draft')
- Unpublished posts
- Admin operations
- User management

**Implementation**:
```typescript
// In queries/posts.ts
const filter: any = {};
if (status) {
  filter.status = { _eq: status }; // 'published' for public
}
```

## Asset Storage & Delivery

### R2 Bucket Structure

**Bucket**: `cms-assets`

**Folder structure**:
```
blog/
  covers/          # Blog post cover images (timestamp-slug.ext)
  content/         # Blog post content images
site-assets/       # General site assets
user-uploads/      # User-uploaded files
documents/         # PDFs and documents
argus/            # Argus feature assets
directus/         # Directus-uploaded files
```

### Asset URL Patterns

**Path resolution** (`app/api/assets/[...path]/route.ts`):

1. **Direct path**: If path starts with known prefix (blog/, site-assets/, etc.) → use as-is
2. **Timestamp pattern**: If filename matches `\d{13}-.*` → `blog/covers/{filename}`
3. **Special files**: Resume PDF → `documents/{filename}`
4. **Directus fallback**: Try both with and without `directus/` prefix

**Examples**:
- `/api/assets/1766345013607-welch-s-grape-soda.jpg` → `blog/covers/1766345013607-welch-s-grape-soda.jpg`
- `/api/assets/blog/covers/image.jpg` → `blog/covers/image.jpg`
- `/api/assets/some-file.jpg` → tries `some-file.jpg` and `directus/some-file.jpg`

### Access Control

**R2 bucket**: Private (requires AWS credentials)

**Public access**: Via Next.js API route `/api/assets/[...path]`
- No authentication required
- Proxies requests to R2
- Sets proper Content-Type headers
- Adds cache headers: `public, max-age=31536000, immutable`

**Credentials** (environment variables):
```
R2_ACCESS_KEY       # Cloudflare R2 access key
R2_SECRET_KEY       # Cloudflare R2 secret key
R2_ENDPOINT         # R2 endpoint URL
R2_BUCKET          # Bucket name (cms-assets)
R2_REGION          # auto
```

## Environment Variables

### Vercel Deployment

**Environments**:
- `production` - https://geralddagher.com
- `preview` - PR preview deployments
- `development` - Local development

**Critical variables**:
```
DIRECTUS_URL                 # CMS API endpoint
DIRECTUS_API_TOKEN          # Server API token
NEXT_PUBLIC_DIRECTUS_URL    # Client-accessible CMS endpoint
R2_ACCESS_KEY               # R2 credentials
R2_SECRET_KEY
R2_ENDPOINT
R2_BUCKET
```

**Setting variables**:
```bash
# Add variable to production
echo "value" | VERCEL_ORG_ID="team_DldsFiy3ArSsA0sJvIXr2zId" npx vercel env add VAR_NAME production

# Remove variable
VERCEL_ORG_ID="team_DldsFiy3ArSsA0sJvIXr2zId" npx vercel env rm VAR_NAME production --yes

# List variables
VERCEL_ORG_ID="team_DldsFiy3ArSsA0sJvIXr2zId" npx vercel env ls
```

**Common issues**:
- Literal `\n` characters in environment variables will break R2 client
- Always verify values after setting: `vercel env pull .env.tmp --environment production`

### Directus (CMS)

**URL**: https://cms.geralddagher.com

**Access levels**:
1. **Public role**: Can read published posts and public user data
2. **Authenticated users**: Can read their own data
3. **Administrator role**: Full access

**Permissions setup**:
- Public role should have READ access to `posts` collection where `status = 'published'`
- Public role should have READ access to published post assets
- Admin role has full CRUD access

## Data Flow Examples

### Blog Post with Image (Public Access)

1. **Request**: `GET https://geralddagher.com/blog/welchs-grape-soda`
2. **Data fetch**: `lib/directus/queries/posts.ts::getPostBySlug()`
   - Uses server-side Directus client (with API token)
   - Fetches post where `slug = 'welchs-grape-soda'` and `status = 'published'`
   - Returns cover_image: `1766345013607-welch-s-grape-soda.jpg`
3. **Image normalization**: `lib/directus/queries/posts.ts::normalizePost()`
   - Transforms to: `/api/assets/1766345013607-welch-s-grape-soda.jpg`
4. **Image request**: Browser requests `/api/assets/1766345013607-welch-s-grape-soda.jpg`
5. **Asset resolution**: `app/api/assets/[...path]/route.ts`
   - Parses path: `['1766345013607-welch-s-grape-soda.jpg']`
   - Matches timestamp pattern → `blog/covers/1766345013607-welch-s-grape-soda.jpg`
   - Fetches from R2 using credentials
   - Returns image with proper headers
6. **Result**: Image displays publicly, no authentication required

### Admin Post Update

1. **Authentication**: User logs in via `/login`
   - Calls `lib/directus/auth.ts::signIn()`
   - Sets `directus_session_token` cookie
2. **Request**: `PATCH /api/admin/posts/20`
3. **Auth check**: `lib/auth/api-auth.ts::requireAdminApi()`
   - Reads session from cookie
   - Verifies user has admin role
   - Returns user object or throws 401/403
4. **Update**: Updates post via Directus SDK
5. **Cache invalidation**: Revalidates Next.js cache tags

## Best Practices

### Security

1. **Never expose credentials**:
   - R2 credentials stay server-side only
   - Directus API token is server-only
   - Session tokens are httpOnly cookies

2. **Validate all inputs**:
   - Sanitize user inputs
   - Validate file paths before R2 operations
   - Check permissions before mutations

3. **Use proper HTTP methods**:
   - GET for reads
   - POST for creates
   - PATCH for updates
   - DELETE for deletes

### Performance

1. **Caching strategy**:
   - Public content: `s-maxage=300, stale-while-revalidate=900`
   - Private content: `no-store`
   - Assets: `public, max-age=31536000, immutable`

2. **Image optimization**:
   - Use Next.js Image component
   - Leverage R2 CDN capabilities
   - Proper content-type headers

3. **Database queries**:
   - Use field selection to limit data
   - Cache with Next.js `unstable_cache`
   - Add appropriate cache tags

### Code Organization

1. **Separation of concerns**:
   - Client components: `components/`
   - Server utilities: `lib/`
   - API routes: `app/api/`
   - Database queries: `lib/directus/queries/`

2. **Type safety**:
   - Define types in `lib/types/`
   - Use Directus schema types
   - Validate at boundaries

3. **Error handling**:
   - Use try-catch in async functions
   - Log errors with context
   - Return appropriate HTTP status codes

## Troubleshooting

### Images not loading

1. Check R2 credentials in Vercel environment variables
2. Verify bucket structure matches expected paths
3. Check browser console for 400/404 errors
4. Verify asset path transformation logic
5. Test R2 access directly with AWS CLI

### Authentication issues

1. Check Directus session cookie exists
2. Verify DIRECTUS_API_TOKEN is set
3. Check user role mapping logic
4. Verify Directus permissions in CMS admin

### Deployment issues

1. Check build logs for errors
2. Verify all environment variables are set
3. Test preview deployments before production
4. Check Vercel deployment logs

## Common Tasks

### Adding a new admin endpoint

1. Create route file in `app/api/admin/`
2. Import `requireAdminApi` from `lib/auth/api-auth`
3. Call `await requireAdminApi()` at route start
4. Implement logic
5. Return proper HTTP responses

Example:
```typescript
import { requireAdminApi } from '@/lib/auth/api-auth';

export async function POST(request: Request) {
  await requireAdminApi();
  // Your logic here
  return NextResponse.json({ success: true });
}
```

### Adding a new asset type

1. Update `getR2Path()` in `app/api/assets/[...path]/route.ts`
2. Add path prefix or filename pattern
3. Create corresponding folder in R2 bucket
4. Update this documentation

### Managing Directus permissions

1. Log into https://cms.geralddagher.com
2. Navigate to Settings → Roles & Permissions
3. Select role (Public, Administrator, etc.)
4. Configure collection permissions
5. Test with public/authenticated requests
