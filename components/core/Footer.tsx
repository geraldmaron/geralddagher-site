'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import SocialMediaBar from '@/components/core/SocialBar';
import { BugReportModal } from '@/components/core/BugReportModal';
import { name } from '@/lib/constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

  const linkClass = 'text-sm text-muted-foreground hover:text-foreground transition-colors';
  const headingClass = 'text-sm font-semibold uppercase tracking-wider text-foreground';

  return (
    <>
      <footer
        className="w-full border-t border-border/60 bg-background text-foreground"
        role="contentinfo"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center mb-10">
            <SocialMediaBar className="justify-center px-0" />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-10 text-center">
            <div className="flex flex-col gap-3 items-center">
              <h3 className={headingClass}>Quick Links</h3>
              <Link href="/blog" className={linkClass}>Writing</Link>
              <Link href="/themaronproject" className={linkClass}>The Maron Project</Link>
            </div>

            <div className="flex flex-col gap-3 items-center">
              <h3 className={headingClass}>Connect</h3>
              <a href="mailto:me@geralddagher.com" className={linkClass}>Email Me</a>
              <Link href="/themaronproject" className={linkClass}>Share Your Story</Link>
              <button
                onClick={() => setIsBugReportOpen(true)}
                className={linkClass}
              >
                Report a Bug
              </button>
            </div>

            <div className="flex flex-col gap-3 items-center">
              <h3 className={headingClass}>Legal</h3>
              <Link href="/privacy-policy" className={linkClass}>Privacy Policy</Link>
              <Link href="/terms-of-service" className={linkClass}>Terms of Service</Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-8 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
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
