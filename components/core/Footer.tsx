'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import SocialMediaBar from '@/components/core/SocialBar';
import { BugReportModal } from '@/components/core/BugReportModal';
import { name } from '@/lib/constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [logoSrc] = useState('/Dagher_Logo_2024.png');

  return (
    <>
      <footer
        className="w-full bg-surface"
        role="contentinfo"
      >
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10 py-16 lg:py-20">

          <div className="flex items-center justify-between mb-12">
            <Link href="/" aria-label="Home">
              <div className="relative w-10 h-10">
                <Image
                  src={logoSrc}
                  alt="Dagher Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="40px"
                  className="dark:hidden"
                />
                <Image
                  src="/Dagher_Logo_2024_WH.png"
                  alt="Dagher Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="40px"
                  className="hidden dark:block"
                />
              </div>
            </Link>
            <SocialMediaBar className="justify-end px-0" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-12">
            <div className="flex flex-col gap-5">
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight text-pretty leading-tight">
                Building platforms.<br />Leading teams.<br />Writing it down.
              </p>
              <a
                href="mailto:me@geralddagher.com"
                className="inline-flex items-center gap-2 self-start rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Mail className="w-4 h-4" />
                Get in touch
              </a>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Explore
                </p>
                <Link href="/blog" className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1">
                  Writing
                </Link>
                <Link href="/themaronproject" className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1">
                  The Maron Project
                </Link>
                <a href="/rss" className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1">
                  RSS Feed
                </a>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Connect
                </p>
                <a href="mailto:me@geralddagher.com" className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1">
                  Email Me
                </a>
                <Link href="/themaronproject" className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1">
                  Share Your Story
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Made with intention by {name}</span>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <button
                onClick={() => setIsBugReportOpen(true)}
                className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Report a Bug
              </button>
              <span>© {currentYear} {name}</span>
            </div>
          </div>
        </div>
      </footer>

      <BugReportModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />
    </>
  );
};

export default Footer;
