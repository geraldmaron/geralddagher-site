'use client';

import { Post } from '@/lib/directus/types';
import { UserProfile } from '@/lib/directus/queries/users';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Avatar } from '@/components/core/Avatar';

interface ArgusPostClientProps {
  post: Post;
  user: UserProfile;
}

export default function ArgusPostClient({ post, user }: ArgusPostClientProps) {
  const author = typeof post.author === 'object' ? post.author : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-16">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/argus"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Argus</span>
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
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <header className="mb-8">
            {post.document_type && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                  {typeof post.document_type === 'object' ? post.document_type.name : post.document_type}
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {post.published_at && (
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), 'MMMM d, yyyy')}
                </time>
              )}
              {post.reading_time && (
                <>
                  <span>•</span>
                  <span>{post.reading_time} min read</span>
                </>
              )}
            </div>

            {author && (
              <div className="mt-6 flex items-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Avatar
                  avatarId={author.avatar || null}
                  firstName={author.first_name}
                  lastName={author.last_name}
                  email={author.email || null}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {author.first_name} {author.last_name}
                  </p>
                  {author.job_title && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {author.job_title}
                    </p>
                  )}
                </div>
              </div>
            )}
          </header>

          {post.cover_image && (
            <div className="mb-8">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-auto rounded-xl"
              />
            </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/argus"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all messages</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
