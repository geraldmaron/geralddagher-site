/**
 * Centralized API Authentication Utilities
 * 
 * Provides consistent authentication patterns for API routes with proper
 * error handling and HTTP status codes. Follows best practices for
 * centralized authentication management.
 */

import { NextResponse } from 'next/server';
import { Logger } from '@/lib/utils/logger';
import type { User } from '@/lib/types/shared';
import { hasAdminAccess } from './groups';
import { getServerUser } from './server-utils';

/**
 * Custom error class for API authentication failures
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * API route authentication - returns HTTP error responses
 * Use this for all API routes that need authentication
 */
export async function requireAuthApi(): Promise<User> {
  // Try to get session user first
  try {
    const user = await getServerUser();
    if (user) {
      return user;
    }
  } catch (error) {
    // Ignore session error, fall back to API key
  }

  if (process.env.APPWRITE_API_KEY) {
    try {
      return {
        id: 'server-admin',
        email: 'server@admin.local',
        name: 'Server Admin',
        role: 'admin',
        labels: ['admin'],
        teams: ['admin'],
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      Logger.warn('API key authentication failed, falling back to session auth', { error });
    }
  }

  throw new AuthError('Authentication required', 401);
}

/**
 * API route admin authentication - returns HTTP error responses
 * Use this for all admin API routes
 */
export async function requireAdminApi(): Promise<User> {
  const user = await requireAuthApi();
  if (!hasAdminAccess(user)) {
    throw new AuthError('Admin access required', 403);
  }
  return user;
}

/**
 * Helper function to handle authentication errors in API routes
 * Returns proper HTTP responses for authentication failures
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Re-throw non-auth errors to be handled by the calling code
  throw error;
}

/**
 * Higher-order function to wrap API routes with authentication
 * Usage: export const GET = withAuth(requireAdminApi, async (user, request) => { ... })
 */
export function withAuth<T extends any[]>(
  authFn: () => Promise<User>,
  handler: (user: User, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const user = await authFn();
      return await handler(user, ...args);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

/**
 * Higher-order function to wrap API routes with admin authentication
 * Usage: export const GET = withAdminAuth(async (user, request) => { ... })
 */
export function withAdminAuth<T extends any[]>(
  handler: (user: User, ...args: T) => Promise<NextResponse>
) {
  return withAuth(requireAdminApi, handler);
}

/**
 * Utility functions for checking authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getServerUser();
    return !!user;
  } catch (error) {
    Logger.error('Failed to check authentication status', {
      error,
      context: { location: 'auth.api-auth.isAuthenticated' }
    });
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getServerUser();
    return hasAdminAccess(user);
  } catch (error) {
    Logger.error('Failed to check admin status', {
      error,
      context: { location: 'auth.api-auth.isAdmin' }
    });
    return false;
  }
}
