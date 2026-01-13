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

## Argus User Management

Argus is a private content delivery system with controlled user activation. This section documents the user lifecycle and implementation patterns.

### Overview

Argus users follow a special lifecycle that differs from standard users:

1. **Creation**: Users are created in `suspended` status without passwords
2. **Initiation**: Administrators activate all suspended Argus users via "Initiate Argus" button
3. **Activation**: Users receive emails with generated credentials
4. **Access**: Users can log in and change passwords via Settings

### User Roles

**Argus Admin** (`role_name = 'Argus Admin'`):
- Can create Argus users
- Can initiate Argus (activate suspended users)
- Can edit Argus User accounts
- Full access to Argus content management

**Argus User** (`role_name = 'Argus User'`):
- Can access Argus content (has_argus_access = true)
- Can view personalized messages
- Can manage own account settings
- Can change own password

**Administrator** (`role_name = 'Administrator'`):
- All permissions of Argus Admin
- Full system access

### User Creation Flow

#### Non-Argus Users

**Location**: `app/api/admin/users/route.ts::POST`

```typescript
const isArgusUser = payload.has_argus_access === true;
const shouldGeneratePassword = !isArgusUser;
const generatedPassword = shouldGeneratePassword ? generateRandomPassword(16) : undefined;

const userPayload = {
  first_name, last_name, email,
  status: 'active',
  role,
  ...(generatedPassword && { password: generatedPassword })
};

await createUser(userPayload);

if (shouldGeneratePassword) {
  await sendPasswordEmail(email, firstName, lastName, generatedPassword, true);
}
```

**Behavior**:
- Status set to `active`
- 16-character password generated immediately
- Welcome email sent with credentials
- User can log in immediately

#### Argus Users

**Location**: `app/api/admin/users/route.ts::POST`

```typescript
const isArgusUser = payload.has_argus_access === true;
const shouldGeneratePassword = !isArgusUser;

const userPayload = {
  first_name, last_name, email,
  status: 'suspended',  // Argus users start suspended
  role
  // No password field included
};

await createUser(userPayload);
// No email sent
```

**Behavior**:
- Status set to `suspended`
- No password generated or set
- No email sent
- User cannot log in
- Admin must use "Initiate Argus" to activate

**Rationale**: Argus users are created in bulk and activated together, preventing premature access and wasted password generation.

### Argus Initiation Flow

**Trigger**: Admin/Argus Admin clicks "Initiate Argus" button

**Location**: `app/api/admin/argus/initiate/route.ts`

**Process**:
1. Query for all suspended Argus users:
   ```typescript
   filter: {
     has_argus_access: { _eq: true },
     status: { _eq: 'suspended' }
   }
   ```

2. For each user:
   - Generate secure 16-character password
   - Update user: `{ password: newPassword, status: 'active' }`
   - Send welcome email with credentials
   - Track success/failure

3. Return summary:
   ```typescript
   {
     success: true,
     message: 'Successfully activated N Argus user(s).',
     activated: [{ id, email, name, emailSent }],
     errors: [{ email, error }]  // if any
   }
   ```

**UI Location**: `app/admin/users/page.tsx`
- Blue "Initiate Argus" button in header
- Visible to: `admin` and `argus_admin` roles
- Confirmation dialog before execution
- Success toast with activation count

### User Update Edge Cases

**Location**: `app/api/admin/users/[id]/route.ts::PATCH`

#### Edge Case: Manual Activation

**Scenario**: Admin manually changes status from `suspended` to `active` for Argus user

**Detection**:
```typescript
if (data.status === 'active') {
  const existingUser = await readUser(id);

  const isActivatingSuspendedArgusUser =
    existingUser.status === 'suspended' &&
    existingUser.has_argus_access === true;

  if (isActivatingSuspendedArgusUser) {
    // Auto-generate password and send email
  }
}
```

**Behavior**:
- Generates new password automatically
- Sends welcome email with credentials
- Returns special message: "User activated and credentials sent via email."

**Rationale**: Prevents creating active users without valid credentials, ensures they can log in.

#### Other Update Scenarios

**Adding Argus access to active user**:
- User stays `active`
- Keeps existing password
- No email sent
- Can immediately access Argus

**Removing Argus access**:
- User status unchanged
- Password unchanged
- Loses Argus access only

**Editing suspended Argus user** (name, email, role):
- No password generation
- Status stays `suspended`
- Waits for initiation

### Password Management

#### Password Generation

**Location**: `lib/auth/password-utils.ts::generateRandomPassword()`

**Requirements**:
- 16 characters minimum
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*()-_=+)
- Cryptographically random

**Usage**:
```typescript
import { generateRandomPassword } from '@/lib/auth/password-utils';
const password = generateRandomPassword(16);
```

#### Password Email Delivery

**Location**: `lib/auth/password-utils.ts::sendPasswordEmail()`

**Parameters**:
- `email`: Recipient email
- `firstName`, `lastName`: Personalization
- `password`: Generated password
- `isNewUser`: true for welcome emails, false for password resets

**Email Content**:
- Branded HTML template with gradient header
- Login credentials (email + password)
- Security reminder to change password
- Direct link to login page
- Sent via Brevo SMTP API

**Example**:
```typescript
await sendPasswordEmail(
  'user@example.com',
  'John',
  'Doe',
  generatedPassword,
  true  // isNewUser
);
```

### User Self-Service Password Change

**Location**: `app/argus/settings/page.tsx`

**Access**: Available to all Argus users from Settings page

**API**: `app/api/auth/change-password/route.ts`

**Flow**:
1. User provides current password
2. API validates by attempting Directus login
3. User provides new password (must meet requirements)
4. New password validated against schema
5. Password updated in Directus
6. Success message returned

**Security**:
- Current password verified before allowing change
- New password must meet all complexity requirements
- Real-time UI validation of requirements
- Passwords match confirmation required

### Access Control

#### Argus Content Access

**Check**: `user.has_argus_access === true`

**Files**:
- `app/argus/page.tsx` - Main Argus dashboard
- `app/argus/[slug]/page.tsx` - Individual Argus posts
- `app/argus/settings/page.tsx` - User settings

**Pattern**:
```typescript
const user = await getMyProfile();
if (!user?.has_argus_access) {
  redirect('/login?redirect=/argus');
}
```

#### Admin Operations

**User Creation**: Requires `admin` role
**Initiate Argus**: Requires `admin` or `argus_admin` role
**Edit Argus Users**: Requires `admin` or `argus_admin` role
**Delete Users**: Requires `admin` role

**Implementation**: `app/admin/users/page.tsx`

```typescript
const canInitiateArgus = useMemo(() => {
  return currentUserRole === 'admin' || currentUserRole === 'argus_admin';
}, [currentUserRole]);
```

### Best Practices

#### Creating Argus Users

1. **Always use has_argus_access flag**: Don't manually create with passwords
2. **Batch creation**: Create all Argus users before initiating
3. **Verify email addresses**: Ensure all emails are valid before creation
4. **Use Initiate Argus**: Don't manually activate suspended Argus users
5. **Monitor initiation results**: Check for email delivery failures

#### Error Handling

1. **Email delivery failures**: Logged but don't block user activation
2. **Partial failures**: Some users may succeed while others fail
3. **Duplicate emails**: Directus will reject, handle gracefully
4. **Missing env vars**: BREVO_API_KEY required for email delivery

#### Security Considerations

1. **Password storage**: Never log or display generated passwords
2. **Email content**: Passwords sent over secure SMTP (Brevo)
3. **Session management**: Use httpOnly cookies for authentication
4. **Rate limiting**: Consider for password change endpoint
5. **Audit logging**: Track Argus initiations and activations

### Troubleshooting

#### Users can't log in after creation

**Symptom**: Argus user activated but login fails

**Diagnosis**:
1. Check user status: should be `active`
2. Verify password was generated (check logs)
3. Confirm email was sent (check Brevo logs)
4. Test with password reset

**Solution**: Use "Regenerate Password" button in admin UI

#### Initiate Argus shows no users

**Symptom**: "No suspended Argus users found"

**Diagnosis**:
1. Verify users have `has_argus_access = true`
2. Check user status is `suspended`
3. Query Directus directly to confirm

**Solution**: Ensure users created with correct flags

#### Email not received

**Symptom**: User activated but no email

**Diagnosis**:
1. Check BREVO_API_KEY environment variable
2. Verify email address is valid
3. Check spam folder
4. Review Brevo sending logs

**Solution**: Use "Regenerate Password" to resend

#### Manual activation issues

**Symptom**: User activated manually but can't log in

**Diagnosis**:
1. Check if password was auto-generated
2. Verify edge case handler triggered
3. Review API logs for errors

**Solution**: System should auto-generate password; if not, use password reset

### API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/admin/users` | POST | Create user | Admin |
| `/api/admin/users/[id]` | PATCH | Update user | Admin/Argus Admin |
| `/api/admin/users/[id]/regenerate-password` | POST | Reset password | Admin/Argus Admin |
| `/api/admin/argus/initiate` | POST | Activate all suspended Argus users | Admin/Argus Admin |
| `/api/auth/change-password` | POST | User changes own password | Any authenticated user |

### Testing Argus Flow

**Manual Test Steps**:

1. Create suspended Argus user:
   ```bash
   POST /api/admin/users
   {
     "first_name": "Test",
     "last_name": "User",
     "email": "test@example.com",
     "role": "<argus_user_role_id>",
     "has_argus_access": true
   }
   ```
   Expected: User created with status=suspended, no email sent

2. Verify user can't log in:
   ```bash
   POST https://cms.geralddagher.com/auth/login
   { "email": "test@example.com", "password": "any" }
   ```
   Expected: Authentication fails (no password set)

3. Initiate Argus:
   ```bash
   POST /api/admin/argus/initiate
   ```
   Expected: User activated, email sent with credentials

4. Verify user can log in:
   Use credentials from email
   Expected: Login succeeds, can access /argus

5. Test password change:
   Navigate to /argus/settings
   Change password
   Expected: Password updated, can log in with new password

### Database Schema

**users collection** (Directus):

```typescript
{
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string | null;  // Can be null for suspended Argus users
  status: 'active' | 'suspended' | 'draft' | 'archived';
  role: string;  // UUID reference to directus_roles
  has_argus_access: boolean;  // Custom field
  argus_message: string | null;  // Custom HTML content for user
  // ... other fields
}
```

**Key Fields**:
- `has_argus_access`: Gates access to /argus routes
- `status`: Controls login ability (`suspended` blocks login)
- `password`: Can be null for newly created Argus users
- `argus_message`: Optional personalized HTML content shown on Argus dashboard
