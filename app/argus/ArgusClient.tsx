'use client';

import { UserProfile } from '@/lib/directus/queries/users';
import { Post } from '@/lib/directus/types';
import Link from 'next/link';
import { format } from 'date-fns';
import { Avatar } from '@/components/core/Avatar';
import { motion } from 'framer-motion';
import { Shield, Clock, FileText, ArrowRight } from 'lucide-react';

interface ArgusClientProps {
  user: UserProfile;
  posts: Post[];
}

export default function ArgusClient({ user, posts }: ArgusClientProps) {
  return (
    <div data-area="argus" className="min-h-screen bg-background pt-16 borealis-effect">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground overflow-visible" style={{ fontFamily: 'var(--font-display)', lineHeight: '1.3' }}>Argus</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/argus/settings"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Settings
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Avatar
                avatarId={user.avatar}
                firstName={user.first_name}
                lastName={user.last_name}
                email={user.email}
                size="md"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h2
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4 overflow-visible"
            style={{ fontFamily: 'var(--font-display)', lineHeight: '1.2' }}
          >
            Hi <span className="text-primary">{user.first_name}</span>
          </h2>

          {user.argus_message && (
            <div
              className="prose prose-lg dark:prose-invert max-w-none text-foreground/80"
              dangerouslySetInnerHTML={{ __html: user.argus_message }}
            />
          )}
        </motion.div>

        {/* Messages */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="border-t border-border/60 pt-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h3
              className="text-2xl font-bold text-foreground overflow-visible"
              style={{ fontFamily: 'var(--font-display)', lineHeight: '1.3' }}
            >
              Your Messages
            </h3>
            <span className="text-sm text-muted-foreground">{posts.length} item{posts.length !== 1 ? 's' : ''}</span>
          </div>

          {posts.length === 0 ? (
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-12 border border-border/30 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-4">
                <FileText className="w-8 h-8 text-indigo-500" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                No messages yet
              </h4>
              <p className="text-muted-foreground text-sm">
                Check back later for new content
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                >
                  <Link
                    href={`/argus/${post.slug}`}
                    className="group block bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/30 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-5">
                      {/* Severity/type indicator */}
                      <div className="hidden sm:flex w-1 self-stretch rounded-full bg-gradient-to-b from-indigo-500 to-violet-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4
                            className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {post.title}
                          </h4>
                          {post.document_type && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shrink-0">
                              {typeof post.document_type === 'object' ? post.document_type.name : post.document_type}
                            </span>
                          )}
                        </div>

                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {post.published_at && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(post.published_at), 'MMM d, yyyy')}
                            </span>
                          )}
                          {post.reading_time && (
                            <span>{post.reading_time} min read</span>
                          )}
                          <span className="ml-auto flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all duration-300">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
