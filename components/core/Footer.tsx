'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SocialMediaBar from '@/components/core/SocialBar';
import { BugReportModal } from '@/components/core/BugReportModal';
import { name } from '@/lib/constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

  return (
    <>
      <footer
        className="w-full border-t border-border/50 bg-background"
        role="contentinfo"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 lg:px-10">

          {/* Social icons row */}
          <div className="flex justify-center mb-12">
            <SocialMediaBar className="justify-center px-0" />
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 mb-12">
            <div className="flex flex-col gap-1 items-center sm:items-start">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Quick Links
              </p>
              <Link
                href="/blog"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1"
              >
                Writing
              </Link>
              <Link
                href="/themaronproject"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1"
              >
                The Maron Project
              </Link>
            </div>

            <div className="flex flex-col gap-1 items-center sm:items-start">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Connect
              </p>
              <a
                href="mailto:me@geralddagher.com"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1"
              >
                Email Me
              </a>
              <Link
                href="/themaronproject"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1"
              >
                Share Your Story
              </Link>
              <button
                onClick={() => setIsBugReportOpen(true)}
                className="text-start text-sm text-foreground/70 hover:text-foreground transition-colors py-1 focus-visible:outline-none focus-visible:underline"
              >
                Report a Bug
              </button>
            </div>

            <div className="flex flex-col gap-1 items-center sm:items-start">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Legal
              </p>
              <Link
                href="/privacy-policy"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Made with intention by {name}</span>
            <span>© {currentYear} {name}. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />
    </>
  );
};

export default Footer;
