import Hero from '@/components/hero/Hero';
import AboutMe from '@/components/about/About';
import Timeline from '@/components/Timeline';
import BlogWrapper from '@/components/posts/BlogWrapper';
import SectionDivider from '@/components/core/SectionDivider';
import MetricStrip from '@/components/core/MetricStrip';

export default async function Home() {
  try {
    const { getPosts, getPostsCount, getCategories, getTags, getMilestones } = await import('@/lib/directus/queries');

    const [postsResult, totalResult, categoriesResult, tagsResult, milestonesResult] = await Promise.allSettled([
      getPosts({ limit: 6, status: 'published' }),
      getPostsCount({ status: 'published' }),
      getCategories(),
      getTags(),
      getMilestones()
    ]);

    const posts = postsResult.status === 'fulfilled' ? postsResult.value : [];
    const total = totalResult.status === 'fulfilled' ? totalResult.value : posts.length;
    const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
    const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];
    const milestones = milestonesResult.status === 'fulfilled' ? milestonesResult.value : [];

    return (
      <>
        <Hero />
        <MetricStrip />

        <main id="main-content">
          <div className="w-full bg-background">
            <AboutMe />
          </div>

          <SectionDivider />

          <Timeline initialMilestones={milestones as any} />

          <SectionDivider />

          <div className="w-full bg-background">
            <section className="section-inner-wide py-12 sm:py-20 lg:py-28">
              <div className="flex flex-col gap-3 mb-8 sm:mb-12">
                <span className="section-label">Writing</span>
                <h2 className="section-heading">Latest Posts</h2>
                <p className="section-subheading max-w-2xl">Thoughts on platform engineering, product leadership, and building with intention.</p>
              </div>
              <BlogWrapper
                initialPosts={posts as any}
                initialTotal={total}
                categories={categories as any}
                tags={tags as any}
              />
            </section>
          </div>
        </main>
      </>
    );
  } catch (error) {
    return (
      <>
        <Hero />
        <MetricStrip />

        <main id="main-content">
          <div className="w-full bg-background">
            <AboutMe />
          </div>

          <SectionDivider />

          <Timeline initialMilestones={[]} />

          <SectionDivider />

          <div className="w-full bg-background">
            <section className="section-inner-wide py-12 sm:py-20 lg:py-28">
              <div className="flex flex-col gap-3 mb-8 sm:mb-12">
                <span className="section-label">Writing</span>
                <h2 className="section-heading">Latest Posts</h2>
                <p className="section-subheading max-w-2xl">Thoughts on platform engineering, product leadership, and building with intention.</p>
              </div>
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-muted border border-border/60">
                  <p className="text-foreground text-sm font-medium">
                    Unable to load posts at the moment. Please try again later.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </>
    );
  }
}
