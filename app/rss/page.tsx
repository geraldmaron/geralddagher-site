'use client';

import { useState } from 'react';
import { Rss, Download, Copy, Check, ExternalLink, Radio, Zap } from 'lucide-react';
import Link from 'next/link';

export default function RSSPage() {
  const [copied, setCopied] = useState(false);
  const feedUrl = 'https://geralddagher.com/api/rss';

  const copyFeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy RSS URL to clipboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(167,139,250,0.08),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(74,222,128,0.08),transparent_22%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white dark:from-black dark:via-black dark:to-black opacity-95" />
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_72%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400 mb-6">
              <Rss className="h-3.5 w-3.5" />
              RSS Feed
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white mb-4">
              Stay Updated
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Subscribe to get notified when new posts are published. Never miss an update.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm p-6 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.25)]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20 mb-4">
                <Radio className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Real-time Updates
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get instant notifications when new content is published to the blog.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm p-6 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.25)]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 mb-4">
                <Zap className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Easy Integration
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Works with any RSS reader. Add the feed URL and you're all set.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm p-6 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.25)] sm:col-span-2 lg:col-span-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20 mb-4">
                <Rss className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                RSS 2.0 Format
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Standard RSS 2.0 format with XML content, compatible with all readers.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm shadow-[0_24px_80px_-32px_rgba(0,0,0,0.35)] p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mb-3">
                  Feed URL
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Copy this URL and add it to your favorite RSS reader
                </p>
                <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-100 dark:bg-slate-900/50 ring-1 ring-slate-200 dark:ring-slate-800 px-4 py-3 font-mono text-sm text-slate-900 dark:text-slate-100 break-all">
                  <Rss className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                  <span className="break-all">{feedUrl}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="/api/rss"
                download="rss-feed.xml"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
              >
                <Download className="h-5 w-5" />
                Download Feed
              </a>
              <button
                onClick={copyFeedUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ring-1 ring-slate-200 dark:ring-slate-800"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copy URL
                  </>
                )}
              </button>
              <a
                href="/api/rss"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ring-1 ring-slate-200 dark:ring-slate-800"
              >
                <ExternalLink className="h-5 w-5" />
                View Feed
              </a>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm p-8 sm:p-10">
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-6">
              Popular RSS Readers
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Feedly', url: 'https://feedly.com' },
                { name: 'Inoreader', url: 'https://www.inoreader.com' },
                { name: 'NewsBlur', url: 'https://www.newsblur.com' },
                { name: 'The Old Reader', url: 'https://theoldreader.com' },
                { name: 'Feedbin', url: 'https://feedbin.com' },
                { name: 'Reeder', url: 'https://reederapp.com' },
              ].map((reader) => (
                <a
                  key={reader.name}
                  href={reader.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4 py-3 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {reader.name}
                  </span>
                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
