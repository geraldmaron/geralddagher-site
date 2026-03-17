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
      <main aria-label="Blog" className="w-full min-h-screen">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-background to-primary/5 dark:from-gray-950 dark:via-background dark:to-primary/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.15),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.12),transparent_25%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.25),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.2),transparent_25%)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur">
                <BookOpen className="h-4 w-4" />
                <span>Writing</span>
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Thoughts, Stories,{' '}
                <span className="inline-flex items-center gap-2">
                  & Reflections
                  <Sparkles className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
                Exploring technology, culture, leadership, and the spaces in between. Writing about what shapes us and what we shape.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <BlogWrapper
            initialPosts={posts as any}
            initialTotal={total}
            categories={categories as any}
            tags={tags as any}
          />
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main aria-label="Blog" className="w-full min-h-screen">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-background to-primary/5 dark:from-gray-950 dark:via-background dark:to-primary/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.15),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.12),transparent_25%)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur">
                <BookOpen className="h-4 w-4" />
                <span>Writing</span>
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Thoughts, Stories,{' '}
                <span className="inline-flex items-center gap-2">
                  & Reflections
                  <Sparkles className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
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
