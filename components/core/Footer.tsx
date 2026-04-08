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
        className="relative w-full overflow-hidden bg-surface"
        role="contentinfo"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.10),transparent_30%)]" aria-hidden="true" />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">

          <div className="mb-10 flex items-center justify-between gap-6 sm:mb-12">
            <Link href="/" aria-label="Home" className="rounded-xl p-1 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
            <SocialMediaBar className="justify-end rounded-full border border-border/60 bg-background/70 px-3 py-1.5 shadow-sm" />
          </div>

          <div className="section-panel-muted mb-12 overflow-hidden">
            <div className="grid grid-cols-1 gap-px bg-border/25 md:grid-cols-[1.25fr_0.95fr]">
              <div className="bg-background/88 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                <div className="max-w-xl space-y-5">
                  <p className="section-kicker">Stay in orbit</p>
                  <p className="text-2xl font-bold leading-tight tracking-tight text-foreground text-pretty sm:text-3xl">
                    Building platforms. Leading teams. Writing down what matters.
                  </p>
                  <p className="section-lead max-w-lg">
                    A public home for product thinking, reliability lessons, and story-driven work across platforms, leadership, and culture.
                  </p>
                  <a
                    href="mailto:me@geralddagher.com"
                    className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Mail className="w-4 h-4" />
                    Get in touch
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-px bg-border/25 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                <div className="bg-background/82 px-6 py-7">
                  <p className="section-kicker mb-4">Explore</p>
                  <div className="flex flex-col gap-2.5">
                    <Link href="/blog" className="text-sm text-foreground/72 transition-colors hover:text-foreground">
                      Writing
                    </Link>
                    <Link href="/themaronproject" className="text-sm text-foreground/72 transition-colors hover:text-foreground">
                      The Maron Project
                    </Link>
                    <a href="/rss" className="text-sm text-foreground/72 transition-colors hover:text-foreground">
                      RSS Feed
                    </a>
                  </div>
                </div>

                <div className="bg-background/82 px-6 py-7">
                  <p className="section-kicker mb-4">Connect</p>
                  <div className="flex flex-col gap-2.5">
                    <a href="mailto:me@geralddagher.com" className="text-sm text-foreground/72 transition-colors hover:text-foreground">
                      Email Me
                    </a>
                    <Link href="/themaronproject" className="text-sm text-foreground/72 transition-colors hover:text-foreground">
                      Share Your Story
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-8 text-xs text-muted-foreground sm:flex-row">
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
