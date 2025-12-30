import React from 'react';
import { getPosts, getCategories, getTags } from '@/lib/directus/queries';
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
    const [postsResult, categoriesResult, tagsResult] = await Promise.allSettled([
      getPosts({ limit: 100, status: 'published' }),
      getCategories(),
      getTags()
    ]);

    const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
    const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
    const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];

    return (
      <main className="w-full min-h-screen">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.15),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.12),transparent_25%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.25),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.2),transparent_25%)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur dark:border-blue-800/50 dark:bg-blue-950/50 dark:text-blue-300">
                <BookOpen className="h-4 w-4" />
                <span>Writing</span>
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Thoughts, Stories,{' '}
                <span className="inline-flex items-center gap-2">
                  & Reflections
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400 sm:h-10 sm:w-10" />
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-balance text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
                Exploring technology, culture, leadership, and the spaces in between. Writing about what shapes us and what we shape.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <BlogWrapper
            initialPosts={posts as any}
            categories={categories as any}
            tags={tags as any}
          />
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="w-full min-h-screen">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.15),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.12),transparent_25%)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur dark:border-blue-800/50 dark:bg-blue-950/50 dark:text-blue-300">
                <BookOpen className="h-4 w-4" />
                <span>Writing</span>
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Thoughts, Stories,{' '}
                <span className="inline-flex items-center gap-2">
                  & Reflections
                  <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400 sm:h-10 sm:w-10" />
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-balance text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
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
