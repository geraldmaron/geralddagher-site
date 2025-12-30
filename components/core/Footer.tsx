'use client';

import React from 'react';
import { Heart, Sun, Moon, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Button from '@/components/core/Button';
import SocialMediaBar from '@/components/core/SocialBar';
import { useAuth } from '@/lib/auth/provider';
import { useTheme } from '@/components/core/ThemeProvider';
import { name } from '@/lib/constants';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { user, signOut, loading } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleContact = () => {
    window.open('mailto:me@geralddagher.com', '_self');
  };

  const statusColor = loading ? 'bg-amber-400 animate-pulse' : user ? 'bg-green-500' : 'bg-gray-400';
  const statusLabel = loading ? 'Verifying...' : user ? `Signed in` : 'Signed out';

  return (
    <footer
      className="w-full border-t border-gray-200/60 bg-white text-black dark:border-gray-800/60 dark:bg-black dark:text-white"
      role="contentinfo"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Main content row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
          {/* Left: Links and Social */}
          <div className="flex flex-col gap-4 flex-1">
            {/* Quick Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/blog" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                Writing
              </Link>
              <Link href="/themaronproject" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                The Maron Project
              </Link>
              <Link href="/argus" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                Argus
              </Link>
              <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                Privacy
              </Link>
              <Link href="/terms-of-service" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                Terms
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <SocialMediaBar className="justify-start px-0" />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextMode = themeMode === 'system' ? 'light' : themeMode === 'light' ? 'dark' : 'system';
                  setThemeMode(nextMode);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                  'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
                  'border border-gray-200 dark:border-gray-700',
                  'text-gray-700 dark:text-gray-300',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
                aria-label={`Current theme: ${themeMode}. Click to cycle between themes.`}
              >
                {themeMode === 'light' && (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                )}
                {themeMode === 'dark' && (
                  <>
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
                {themeMode === 'system' && (
                  <>
                    <Monitor className="w-4 h-4" />
                    <span className="hidden sm:inline">System</span>
                  </>
                )}
              </button>
            </div>


            <div className="flex items-center gap-2 text-sm" aria-live="polite">
              <span className={`h-2 w-2 rounded-full ${statusColor}`} aria-label={statusLabel} />
              <span className="text-gray-600 dark:text-gray-400">{statusLabel}</span>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={loading}
                  className="ml-2 h-auto py-1 px-2 text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  {loading ? '...' : 'Logout'}
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => router.push('/themaronproject')}>
                Explore TMP
              </Button>
              <Button variant="ghost" size="sm" onClick={handleContact}>
                Say hello
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="mt-6 flex flex-col gap-2 border-t border-gray-200/60 pt-4 text-xs text-gray-500 dark:border-gray-800/60 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-3 w-3 text-red-500" aria-label="love" />
            <span>Made with intention by {name}</span>
          </div>
          <span>© {currentYear} {name}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;