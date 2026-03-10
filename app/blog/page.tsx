import React from 'react';
import { getPosts, getPostsCount, getCategories, getTags } from '@/lib/directus/queries';
import BlogWrapper from '@/components/posts/BlogWrapper';
import { BookOpen, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Writing | Gerald Dagher',
  description: 'Thoughts, stories, and reflections on technology, culture, and everything in between.',
  openGraph: {
    title: 'Writing | Gerald Dagher',
    description: 'Thoughts, stories, and reflections on technology, culture, and everything in between.',
    type: 'website',
  },
};

export default async function BlogPage() {
  try {
    const [postsResult, totalResult, categoriesResult, tagsResult] = await Promise.allSettled([
      getPosts({ limit: 100, status: 'published' }),
      getPostsCount({ status: 'published' }),
      getCategories(),
      getTags()
    ]);

    const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
    const total = totalResult.status === 'fulfilled' ? totalResult.value : posts.length;
    const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
    const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];

    return (
      <main data-area="blog" className="w-full min-h-screen">
        <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-blue-950/40 dark:via-gray-950 dark:to-gray-950">
          {/* Large decorative orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400/15 dark:bg-blue-600/10 blur-3xl" />
          <div className="absolute -top-12 right-0 w-72 h-72 rounded-full bg-cyan-400/10 dark:bg-cyan-600/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-80 h-48 rounded-full bg-sky-400/10 dark:bg-sky-600/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/40 dark:border-blue-500/30 bg-blue-100/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 backdrop-blur-sm">
                <BookOpen className="h-4 w-4" />
                <span>Writing</span>
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-display)', lineHeight: '1.25' }}>
                <span className="text-gray-900 dark:text-white">Thoughts, Stories,</span>{' '}
                <span className="inline-flex items-center gap-2">
                  <em><span className="galaxy-text">& Reflections</span></em>
                  <Sparkles className="h-8 w-8 text-blue-500 dark:text-blue-400 sm:h-10 sm:w-10 animate-pulse" />
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-balance text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
                Exploring technology, culture, leadership, and the spaces in between. Writing about what shapes us and what we shape.
              </p>
            </div>
          </div>

          {/* Gradient divider into content */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-300/50 dark:via-blue-600/30 to-transparent" />
        </div>

        <div className="relative bg-gradient-to-b from-blue-50/40 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent dark:to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <BlogWrapper
            initialPosts={posts as any}
            initialTotal={total}
            categories={categories as any}
            tags={tags as any}
          />
        </div>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main data-area="blog" className="w-full min-h-screen">
        <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-blue-950/40 dark:via-gray-950 dark:to-gray-950">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400/15 dark:bg-blue-600/10 blur-3xl" />
          <div className="absolute -top-12 right-0 w-72 h-72 rounded-full bg-cyan-400/10 dark:bg-cyan-600/8 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/40 dark:border-blue-500/30 bg-blue-100/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 backdrop-blur-sm">
                <BookOpen className="h-4 w-4" />
                <span>Writing</span>
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-display)', lineHeight: '1.25' }}>
                <span className="text-gray-900 dark:text-white">Thoughts, Stories,</span>{' '}
                <span className="inline-flex items-center gap-2">
                  <em><span className="galaxy-text">& Reflections</span></em>
                  <Sparkles className="h-8 w-8 text-blue-500 dark:text-blue-400 sm:h-10 sm:w-10 animate-pulse" />
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-balance text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
                Exploring technology, culture, leadership, and the spaces in between.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/20">
            <p className="text-red-800 dark:text-red-200">
              Unable to load posts. Please try again later.
            </p>
          </div>
        </div>
      </main>
    );
  }
}
