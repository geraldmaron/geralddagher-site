import { getPosts, getPostsCount, getCategories, getTags } from '@/lib/directus/queries';
import BlogWrapper from '@/components/posts/BlogWrapper';
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
        <div className="relative w-full overflow-hidden border-b border-border/40 bg-muted/30 dot-grid">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_32%)]" aria-hidden="true" />
          <div className="section-inner-wide pt-32 pb-16 sm:pt-40 sm:pb-24">
            <div className="max-w-2xl">
              <span className="section-label">Writing</span>
              <h1 className="section-heading mt-2">Thoughts, stories, and reflections.</h1>
              <p className="section-subheading mt-3">
                Exploring technology, culture, leadership, and the spaces in between.
              </p>
            </div>
          </div>
        </div>

        <div className="section-inner-wide py-12 sm:py-16">
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
        <div className="relative w-full overflow-hidden border-b border-border/40 bg-muted/30 dot-grid">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_32%)]" aria-hidden="true" />
          <div className="section-inner-wide pt-32 pb-16 sm:pt-40 sm:pb-24">
            <div className="max-w-2xl">
              <span className="section-label">Writing</span>
              <h1 className="section-heading mt-2">Thoughts, stories, and reflections.</h1>
              <p className="section-subheading mt-3">
                Exploring technology, culture, leadership, and the spaces in between.
              </p>
            </div>
          </div>
        </div>

        <div className="section-inner-wide py-12 sm:py-16">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">Unable to load posts. Please try again later.</p>
          </div>
        </div>
      </main>
    );
  }
}
