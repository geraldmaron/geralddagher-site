'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import SocialMediaBar from '@/components/core/SocialBar';
import { BugReportModal } from '@/components/core/BugReportModal';
import { name } from '@/lib/constants';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

  return (
    <>
      <footer
        className="w-full border-t border-gray-200/60 bg-white text-black dark:border-gray-800/60 dark:bg-black dark:text-white"
        role="contentinfo"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center mb-10">
            <SocialMediaBar className="justify-center px-0" />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-10">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                Quick Links
              </h3>
              <Link
                href="/blog"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Writing
              </Link>
              <Link
                href="/themaronproject"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                The Maron Project
              </Link>
              <Link
                href="/argus"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Argus
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                Connect
              </h3>
              <a
                href="mailto:me@geralddagher.com"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Email Me
              </a>
              <Link
                href="/themaronproject"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Share Your Story
              </Link>
              <button
                onClick={() => setIsBugReportOpen(true)}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors text-left"
              >
                Report a Bug
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                Legal
              </h3>
              <Link
                href="/privacy-policy"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200/60 pt-8 text-center text-sm text-gray-500 dark:border-gray-800/60 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-3.5 w-3.5 text-red-500" aria-label="love" />
              <span>Made with intention by {name}</span>
            </div>
            <span>© {currentYear} {name}. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />
    </>
  );
};

export default Footer;
