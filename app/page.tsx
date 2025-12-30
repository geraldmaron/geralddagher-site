import React from 'react';
import Hero from '@/components/hero/Hero';
import AboutMe from '@/components/about/About';
import Timeline from '@/components/Timeline';
import BlogWrapper from '@/components/posts/BlogWrapper';

export default async function Home() {
  try {
    const { getPosts, getCategories, getTags, getMilestones } = await import('@/lib/directus/queries');

    const [postsResult, categoriesResult, tagsResult, milestonesResult] = await Promise.allSettled([
      getPosts({ limit: 6, status: 'published' }),
      getCategories(),
      getTags(),
      getMilestones()
    ]);

    const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
    const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
    const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];
    const milestones = milestonesResult.status === 'fulfilled' ? milestonesResult.value : [];

    return (
      <>
        <Hero />
        <main className="w-full mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
          <AboutMe />
          <Timeline initialMilestones={milestones as any} />
          <section className="w-full py-12 sm:py-16 lg:py-20">
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-2">Latest Posts</h2>
            </div>
            <BlogWrapper
              initialPosts={posts as any}
              categories={categories as any}
              tags={tags as any}
            />
          </section>
        </main>
      </>
    );
  } catch (error) {
    return (
      <>
        <Hero />
        <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <AboutMe />
          <Timeline initialMilestones={[]} />
          <section className="w-full py-12 sm:py-16 lg:py-20">
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-2">Latest Posts</h2>
            </div>
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800/60 backdrop-blur-sm">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                  Unable to load posts at the moment. Please try again later.
                </p>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }
}