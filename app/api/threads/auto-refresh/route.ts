import { NextRequest, NextResponse } from 'next/server';
import {
  checkThreadsTokenHealth,
  refreshThreadsToken,
  updateTokenInEnvironment
} from '@/lib/threads-refresh';

/**
 * Automated token refresh endpoint
 * Can be triggered by:
 * - Vercel Cron Jobs (production)
 * - Manual POST request with INTERNAL_WEBHOOK_TOKEN
 * - Local cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication for Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-vercel-cron-secret');
    const internalToken = process.env.INTERNAL_WEBHOOK_TOKEN;
    
    // Allow Vercel Cron (has x-vercel-cron-secret header)
    // Allow requests with valid INTERNAL_WEBHOOK_TOKEN
    // Allow local requests (development mode)
    const isVercelCron = cronSecret === process.env.CRON_SECRET;
    const isAuthorized = authHeader === `Bearer ${internalToken}`;
    const isLocal = process.env.NODE_ENV === 'development';
    
    if (!isVercelCron && !isAuthorized && !isLocal) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    const healthCheck = await checkThreadsTokenHealth();
    
    if (!healthCheck.needsRefresh) {
      return NextResponse.json({
        success: true,
        message: 'Token is healthy, no refresh needed',
        healthCheck
      });
    }
    
    // Attempt to refresh the token
    const refreshResult = await refreshThreadsToken();
    
    if (!refreshResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Token refresh failed',
        error: refreshResult.error,
        healthCheck
      }, { status: 500 });
    }
    
    // Update environment (in production, this would update your deployment platform)
    const updateSuccess = await updateTokenInEnvironment(refreshResult.token!);
    
    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      healthCheck: {
        ...healthCheck,
        status: 'healthy',
        needsRefresh: false,
        lastChecked: new Date().toISOString()
      },
      tokenUpdated: updateSuccess,
      note: 'Token updated in .env file, process environment, and .threads-token file'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Automated refresh failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  try {
    const healthCheck = await checkThreadsTokenHealth();
    
    return NextResponse.json({
      ...healthCheck,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      needsRefresh: true,
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
