'use client';

import { UserProfile } from '@/lib/directus/queries/users';
import { Post } from '@/lib/directus/types';
import Link from 'next/link';
import { format } from 'date-fns';
import { Avatar } from '@/components/core/Avatar';

interface ArgusClientProps {
  user: UserProfile;
  posts: Post[];
}

export default function ArgusClient({ user, posts }: ArgusClientProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-16">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Argus</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Hi {user.first_name}
          </h2>

          {user.argus_message && (
            <div
              className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: user.argus_message }}
            />
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Messages
          </h3>

          {posts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No messages yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for new content
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/argus/${post.slug}`}
                  className="block bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                        {post.title}
                      </h4>
                      {post.published_at && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(post.published_at), 'MMMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    {post.document_type && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        {typeof post.document_type === 'object' ? post.document_type.name : post.document_type}
                      </span>
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  {post.reading_time && (
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      {post.reading_time} min read
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
