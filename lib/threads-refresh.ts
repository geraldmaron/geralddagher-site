/**
 * Threads Token Refresh Utilities
 * Helper functions for checking and refreshing Threads API tokens
 * 
 * @module lib/threads-refresh
 * @description Provides utilities for automated Threads API token management
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface TokenRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TokenHealthCheck {
  status: 'healthy' | 'expired' | 'error';
  needsRefresh: boolean;
  lastChecked: string;
  expiresAt?: string;
}

export interface RefreshResult {
  success: boolean;
  token?: string;
  error?: string;
  expiresIn?: number;
}

/**
 * Check the health of the current Threads token
 * 
 * @returns {Promise<TokenHealthCheck>} Token health status
 * @throws Never throws - returns error status instead
 */
export async function checkThreadsTokenHealth(): Promise<TokenHealthCheck> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/threads/list?limit=1`, {
      cache: 'no-store'
    });
    
    if (response.status === 401) {
      return {
        status: 'expired',
        needsRefresh: true,
        lastChecked: new Date().toISOString()
      };
    }
    
    if (response.ok) {
      return {
        status: 'healthy',
        needsRefresh: false,
        lastChecked: new Date().toISOString()
      };
    }
    
    return {
      status: 'error',
      needsRefresh: true,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      needsRefresh: true,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Refresh the Threads token using the current long-lived token
 * 
 * @returns {Promise<RefreshResult>} Result of the refresh operation
 * @throws Never throws - returns error in result object instead
 */
export async function refreshThreadsToken(): Promise<RefreshResult> {
  try {
    const currentToken = process.env.THREADS_LONG_LIVED_TOKEN;
    
    if (!currentToken) {
      return {
        success: false,
        error: 'Missing THREADS_LONG_LIVED_TOKEN environment variable'
      };
    }
    
    const url = new URL('https://graph.threads.net/refresh_access_token');
    url.searchParams.set('grant_type', 'th_refresh_token');
    url.searchParams.set('access_token', currentToken);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Token refresh failed (${response.status}): ${errorText}`
      };
    }
    
    const data = await response.text();
    
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(data) as TokenRefreshResponse;
      
      if (!jsonData.access_token) {
        return {
          success: false,
          error: 'Invalid response: missing access_token'
        };
      }
      
      return {
        success: true,
        token: jsonData.access_token,
        expiresIn: jsonData.expires_in
      };
    } catch (parseError) {
      return {
        success: false,
        error: 'Invalid JSON response from Threads API'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during token refresh'
    };
  }
}

/**
 * Update the token in the environment
 * 
 * This includes:
 * - Updating .env file (development mode only)
 * - Updating process.env (runtime)
 * - Writing to .threads-token file (for external processes)
 * - Sending webhook notifications (if configured)
 * 
 * @param {string} newToken - The new access token to update
 * @returns {Promise<boolean>} True if update was successful, false otherwise
 * @throws Never throws - returns false on error
 */
export async function updateTokenInEnvironment(newToken: string): Promise<boolean> {
  try {
    if (!newToken || newToken.trim() === '') {
      return false;
    }
    
    // Method 1: Update .env file (for local development only)
    if (process.env.NODE_ENV === 'development') {
      await updateEnvFile(newToken);
    }
    
    // Method 2: Update process environment (runtime)
    process.env.THREADS_LONG_LIVED_TOKEN = newToken;
    
    // Method 3: Write to token file for external processes
    await writeTokenFile(newToken);
    
    // Method 4: Send webhook notification (for external systems)
    await notifyTokenUpdate(newToken);
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Update .env.local file with new token (development only)
 * 
 * @param {string} newToken - The new token to write
 * @returns {Promise<void>}
 * @private
 */
async function updateEnvFile(newToken: string): Promise<void> {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent: string;
    
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (readError) {
      // File doesn't exist, create new content
      envContent = '';
    }
    
    // Update or add THREADS_LONG_LIVED_TOKEN
    const tokenRegex = /^THREADS_LONG_LIVED_TOKEN=.*$/m;
    
    if (tokenRegex.test(envContent)) {
      // Update existing token
      envContent = envContent.replace(tokenRegex, `THREADS_LONG_LIVED_TOKEN=${newToken}`);
    } else {
      // Add new token
      envContent += `${envContent ? '\n' : ''}THREADS_LONG_LIVED_TOKEN=${newToken}\n`;
    }
    
    await fs.writeFile(envPath, envContent, 'utf-8');
  } catch (error) {
    // Don't throw - this is optional for production
  }
}

/**
 * Write token to a separate file for external processes (e.g., cron scripts)
 * 
 * @param {string} newToken - The token to write
 * @returns {Promise<void>}
 * @private
 */
async function writeTokenFile(newToken: string): Promise<void> {
  try {
    const tokenFilePath = path.join(process.cwd(), '.threads-token');
    await fs.writeFile(tokenFilePath, newToken, 'utf-8');
  } catch (error) {
    // Don't throw - this is optional
  }
}

/**
 * Send webhook notification about token update to external monitoring systems
 * 
 * @param {string} newToken - The new token (only prefix is sent for security)
 * @returns {Promise<void>}
 * @private
 */
async function notifyTokenUpdate(newToken: string): Promise<void> {
  const webhookUrl = process.env.THREADS_REFRESH_WEBHOOK;
  
  if (!webhookUrl) {
    return; // No webhook configured, skip silently
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: 'threads_token_refreshed',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        tokenPrefix: newToken.substring(0, 10) + '...', // Only send prefix for security
        tokenLength: newToken.length
      }),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return;
    }
  } catch (error) {
    // Don't throw - this is optional
  }
}

