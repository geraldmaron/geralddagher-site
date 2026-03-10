'use client';

import React, { useState } from 'react';
import { Heart, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SocialMediaBar from '@/components/core/SocialBar';
import { BugReportModal } from '@/components/core/BugReportModal';
import { name } from '@/lib/constants';
import { useTheme } from '@/components/core/ThemeProvider';
import ScrollReveal from '@/components/core/ScrollReveal';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const logoSrc = '/Dagher_Logo_2024_Mark_White.png';
  const logoFallback = '/Dagher_Logo_2024_Mark.png';

  return (
    <>
      <footer
        className="w-full bg-gray-950 text-gray-300"
        role="contentinfo"
      >
        {/* Gradient top border */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <ScrollReveal preset="fade-up">
            {/* Top section: Logo + Tagline + Social */}
            <div className="flex flex-col items-center text-center mb-12">
              <div className="relative w-12 h-12 mb-4">
                <Image
                  src={isDarkMode ? logoSrc : logoSrc}
                  alt="Logo"
                  fill
                  style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                  sizes="48px"
                  onError={(e) => { (e.target as HTMLImageElement).src = logoFallback; }}
                />
              </div>
              <p className="text-sm text-gray-400 max-w-md mb-6">
                Exploring technology, culture, leadership, and the spaces in between.
              </p>
              <SocialMediaBar className="justify-center px-0 [&_a]:text-gray-400 [&_a:hover]:text-white" />
            </div>
          </ScrollReveal>

          {/* Links grid */}
          <ScrollReveal preset="fade-up" delay={0.1}>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-12">
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-100">
                  Explore
                </h3>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Writing
                </Link>
                <Link href="/themaronproject" className="text-sm text-gray-400 hover:text-white transition-colors">
                  The Maron Project
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-100">
                  Products
                </h3>
                <Link href="/argus" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Argus
                </Link>
                <Link href="/rss" className="text-sm text-gray-400 hover:text-white transition-colors">
                  RSS Feed
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-100">
                  Connect
                </h3>
                <a href="mailto:me@geralddagher.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Email
                </a>
                <Link href="/themaronproject" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Share Your Story
                </Link>
                <button
                  onClick={() => setIsBugReportOpen(true)}
                  className="text-sm text-gray-400 hover:text-white transition-colors text-left"
                >
                  Report a Bug
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-100">
                  Legal
                </h3>
                <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-red-500 animate-wave" aria-label="love" />
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
