'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThreads } from '@fortawesome/free-brands-svg-icons';
import {
  Heart,
  MessageCircle,
  Repeat2,
  ExternalLink,
  Clock,
  Battery,
  Signal
} from 'lucide-react';

interface ThreadItem {
  id: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  text?: string;
  timestamp?: string;
  like_count?: number;
  reply_count?: number;
  repost_count?: number;
  username?: string;
}

interface ThreadsResponse {
  data: ThreadItem[];
  total?: number;
}

const socialLinks = {
  linkedin: "https://linkedin.com/in/geralddagher",
  instagram: "https://instagram.com/geralddagher",
  twitter: "https://twitter.com/geralddagher",
  youtube: "https://youtube.com/@geralddagher",
  github: "https://github.com/geralddagher",
  threads: "https://threads.net/@geraldmdagher",
};

const ThreadsFeed: React.FC = () => {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedThreads, setLikedThreads] = useState<Set<string>>(new Set());

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/threads/list?limit=20`, { cache: "no-store" });
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 500 && errorData.error?.includes('expired')) {
          throw new Error('EXPIRED_TOKEN');
        } else if (res.status === 500 && errorData.error?.includes('Missing')) {
          throw new Error('Threads integration not configured. Please contact support.');
        } else {
          throw new Error(`Failed to fetch threads: ${res.status}`);
        }
      }
      const result: ThreadsResponse = await res.json();
      const data = result.data || [];
      const liked = data.filter(t => typeof t.like_count === 'number' && (t.like_count as number) > 0);
      setThreads(liked.length > 0 ? liked : data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load threads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const getRelativeTime = (timestamp?: string) => {
    if (!timestamp) return "2h";

    const now = new Date();
    const threadTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - threadTime.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleLike = (threadId: string) => {
    setLikedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="relative w-full max-w-[420px] aspect-[9/19.5] rounded-[2.75rem] p-2 bg-gray-200 dark:bg-gray-900 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.55)] border border-gray-200/80 dark:border-gray-800/80">
      <div className="absolute inset-0 rounded-[2.5rem] bg-white/60 dark:bg-black/50 blur-2xl pointer-events-none" />
      <div className="relative w-full h-full overflow-hidden rounded-[2.25rem] bg-white dark:bg-gray-950 border border-gray-200/70 dark:border-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
        <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-900 dark:bg-gray-100" />
        <div className="absolute right-6 top-[18px] z-20 h-1.5 w-8 rounded-full bg-gray-900/40 dark:bg-gray-100/40" />
        {children}
      </div>
    </div>
  );

  const chromeBar = (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 pt-10 pb-4 backdrop-blur bg-white/92 dark:bg-gray-950/92 border-b border-gray-200/70 dark:border-gray-800">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <Clock className="w-4 h-4" />
        <time className="text-sm font-semibold leading-none">{currentTime}</time>
      </div>
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-900 px-2 py-1 text-xs font-medium">
          <Signal className="w-3.5 h-3.5" />
          <span>5G</span>
        </div>
        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
          <Battery className="w-4 h-4" />
          <span className="text-xs font-semibold">100%</span>
        </div>
      </div>
    </header>
  );

  const masthead = (
    <motion.div
      className="text-center space-y-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg shadow-black/10">
          <FontAwesomeIcon icon={faThreads} className="w-7 h-7" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
          threads
        </h1>
      </div>
    </motion.div>
  );

  const actionFooter = (
    <footer className="border-t border-gray-200/70 dark:border-gray-800 bg-white/95 dark:bg-gray-950 px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">Follow</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Gerald Dagher</p>
        </div>
        <nav aria-label="Social media links" className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <Link href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-pink-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2.162c2.67 0 2.986.01 4.04.058 1.032.047 1.59.218 1.963.362.492.191.843.42 1.212.788.369.369.598.72.788 1.212.144.373.315.931.362 1.963.048 1.054.058 1.37.058 4.04s-.01 2.986-.058 4.04c-.047 1.032-.218 1.59-.362 1.963-.191.492-.42.843-.788 1.212-.369.369-.72.598-1.212.788-.373.144-.931.315-1.963.362-1.054.048-1.37.058-4.04.058s-2.986-.01-4.04-.058c-1.032-.047-1.59-.218-1.963-.362-.492-.191-.843-.42-1.212-.788-.369-.369-.598-.72-.788-1.212-.144-.373-.315-.931-.362-1.963C2.172 12.986 2.162 12.67 2.162 10s.01-2.986.058-4.04c.047-1.032.218-1.59.362-1.963.191-.492.42-.843.788-1.212.369-.369.72-.598 1.212-.788.373-.144.931-.315 1.963-.362C7.014 2.172 7.33 2.162 10 2.162zM10 0C7.284 0 6.944.012 5.877.06 4.813.107 4.086.277 3.45.525a4.74 4.74 0 00-1.716 1.118A4.74 4.74 0 00.525 3.45C.277 4.086.107 4.813.06 5.877.012 6.944 0 7.284 0 10s.012 3.056.06 4.123c.047 1.064.217 1.791.465 2.427a4.74 4.74 0 001.118 1.716 4.74 4.74 0 001.716 1.118c.636.248 1.363.418 2.427.465C6.944 19.988 7.284 20 10 20s3.056-.012 4.123-.06c1.064-.047 1.791-.217 2.427-.465a4.74 4.74 0 001.716-1.118 4.74 4.74 0 001.118-1.716c.248-.636.418-1.363.465-2.427C19.988 13.056 20 12.716 20 10s-.012-3.93-.06-4.123c-.047-1.064-.217-1.791-.465-2.427a4.74 4.74 0 00-1.118-1.716A4.74 4.74 0 0016.55.525C15.914.277 15.187.107 14.123.06 13.056.012 12.716 0 10 0zm0 4.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link href={socialLinks.threads} target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-400">
            <FontAwesomeIcon icon={faThreads} className="w-5 h-5" />
          </Link>
          <Link href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </Link>
          <Link href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </Link>
          <Link href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </nav>
      </div>
    </footer>
  );

  const Background = null;

  if (loading) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden bg-white dark:bg-black flex flex-col items-center px-6 py-16">
        {Background}
        {masthead}
        <div className="mt-12">
          <Shell>
            <div className="flex h-full flex-col">
              {chromeBar}
              <div className="flex-1 min-h-0 px-5 pb-6 pt-2 overflow-y-auto">
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                  <span>Loading</span>
                  <span>Threads</span>
                </div>
                <div className="space-y-5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                      <div className="flex-1 space-y-3">
                        <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        <div className="h-3 w-3/5 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {actionFooter}
            </div>
          </Shell>
        </div>
      </div>
    );
  }

  if (error) {
    const isExpiredToken = error === 'EXPIRED_TOKEN';
    return (
      <div className="relative w-full min-h-screen overflow-hidden bg-white dark:bg-black flex flex-col items-center px-6 py-16">
        {Background}
        {masthead}
        <div className="mt-12">
          <Shell>
            <div className="flex h-full flex-col">
              {chromeBar}
              <div className="flex-1 min-h-0 px-5 pb-6 pt-4 overflow-y-auto">
                <div className="rounded-2xl border border-red-200/70 dark:border-red-800/60 bg-red-50/80 dark:bg-red-900/20 p-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {isExpiredToken ? 'Threads Token Expired' : 'Can\'t load Threads'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {isExpiredToken
                        ? 'Your Threads access token has expired. Please reconnect your account to continue.'
                        : error}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {isExpiredToken ? (
                      <a
                        href="/api/threads/login"
                        className="w-full sm:w-auto rounded-xl bg-gray-900 text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        Reconnect Threads
                      </a>
                    ) : (
                      <button
                        onClick={fetchThreads}
                        className="w-full sm:w-auto rounded-xl bg-gray-900 text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {actionFooter}
            </div>
          </Shell>
        </div>
      </div>
    );
  }

  return (
      <div className="relative w-full min-h-screen overflow-hidden bg-white dark:bg-black flex flex-col items-center px-6 py-16">
      {Background}
      {masthead}
      <div className="mt-12">
        <Shell>
          <div className="flex h-full flex-col">
            {chromeBar}
            <div className="flex items-center justify-between px-5 pb-3 text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                Live
              </div>
              <span>{threads.length} posts</span>
            </div>
            {error && (
              <div className="mx-5 mb-3 rounded-xl border border-red-200/70 dark:border-red-800/60 bg-red-50/80 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 space-y-5">
              {threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                    <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No threads yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your Threads posts will appear here</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <article
                    key={thread.id}
                    className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white/90 dark:bg-gray-950/80 backdrop-blur-md p-4 shadow-sm shadow-black/5 hover:-translate-y-[1px] transition-transform"
                  >
                    <div className="flex gap-3">
                      <Image
                        src="/Dagher_Headshot_2.png"
                        alt="Gerald Dagher profile picture"
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Gerald Dagher</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">@{thread.username || 'geraldmdagher'}</span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">•</span>
                          <time className="text-xs text-gray-500 dark:text-gray-400">{getRelativeTime(thread.timestamp)}</time>
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-900 px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                            <Signal className="w-3.5 h-3.5" />
                            Threads
                          </span>
                        </div>
                        {thread.text && (
                          <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                            {thread.text}
                          </p>
                        )}
                        {thread.media_url && thread.media_type?.toUpperCase() !== 'VIDEO' && (
                          <div className="overflow-hidden rounded-xl border border-gray-200/70 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                            <Image
                              src={thread.media_url}
                              alt="Threads media"
                              width={320}
                              height={180}
                              className="w-full object-cover aspect-[4/5] sm:aspect-video max-h-56"
                              sizes="(max-width: 768px) 90vw, 360px"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-6 pt-1 text-gray-500 dark:text-gray-400">
                          <button
                            onClick={() => handleLike(thread.id)}
                            className={cn(
                              "group flex items-center gap-2 rounded-full px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950 focus:ring-red-300",
                              likedThreads.has(thread.id) || (thread.like_count || 0) > 0
                                ? "bg-red-50 text-red-600 dark:bg-red-900/30"
                                : "hover:bg-gray-100 dark:hover:bg-gray-900"
                            )}
                            aria-label={`${(likedThreads.has(thread.id) || (thread.like_count || 0) > 0) ? 'Unlike' : 'Like'} thread`}
                          >
                            <Heart
                              className={cn(
                                "w-5 h-5 transition-transform",
                                likedThreads.has(thread.id) || (thread.like_count || 0) > 0
                                  ? "fill-current text-red-500 scale-110"
                                  : "text-gray-500 dark:text-gray-400"
                              )}
                            />
                            <span className="text-sm font-semibold">{thread.like_count || 0}</span>
                          </button>

                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{thread.reply_count || 0}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Repeat2 className="w-5 h-5" />
                            <span className="text-sm">{thread.repost_count || 0}</span>
                          </div>
                        </div>
                        {thread.permalink && (
                          <div className="pt-1">
                            <a
                              href={thread.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-200"
                            >
                              Open on Threads
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
            {actionFooter}
          </div>
        </Shell>
      </div>
    </div>
  );
};

export default ThreadsFeed;
