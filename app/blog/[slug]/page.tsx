import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, getPosts, getCategoryById, getTagById } from '@/lib/directus/queries'
import { formatDate } from '@/lib/utils/date'
import { calculateReadingTime } from '@/lib/utils/readingTime'
import Image from 'next/image'
import { ArrowLeft, CalendarDays, Clock3, TagIcon } from 'lucide-react'
import Link from 'next/link'
import PostCard from '@/components/posts/PostCard'
import { Avatar } from '@/components/core/Avatar'
import SlateRenderer from '@/components/core/SlateRenderer'
import { DirectusUser, Category, Tag } from '@/lib/directus/types'
import { PostStatus } from '@/lib/types/database'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const post = await getPostBySlug(resolvedParams.slug)
    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found.'
      }
    }

    const description =
      post.excerpt ||
      (typeof post.content === 'string' ? post.content.slice(0, 160) : '') ||
      ''

    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://geralddagher.com'}/blog/${resolvedParams.slug}`
    const imageUrl = post.cover_image || undefined

    return {
      title: post.title,
      description,
      openGraph: {
        title: post.title,
        description,
        url: canonicalUrl,
        type: 'article',
        publishedTime: post.published_at || undefined,
        modifiedTime: post.date_updated || undefined,
        images: imageUrl ? [imageUrl] : undefined
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: imageUrl ? [imageUrl] : undefined
      },
      alternates: { canonical: canonicalUrl }
    }
  } catch (error) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    }
  }
}

function normalizeContent(content: any) {
  if (!content) return null

  if (Array.isArray(content)) {
    return content.length > 0 ? content : null
  }

  if (typeof content === 'object' && content !== null) {
    if (content?.content && Array.isArray(content.content)) {
      return content.content.length > 0 ? content.content : null
    }
    return null
  }

  if (typeof content === 'string') {
    const trimmed = content.trim()
    if (!trimmed || trimmed.length === 0) return null

    const firstChar = trimmed[0]
    if (firstChar !== '{' && firstChar !== '[') {
      return null
    }

    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object') {
        if (parsed?.content && Array.isArray(parsed.content)) {
          return parsed.content.length > 0 ? parsed.content : null
        }
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed : null
        }
      }
      return null
    } catch (error) {
      return null
    }
  }

  return null
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const postRaw = (await getPostBySlug(slug as string)) as any
  if (!postRaw) notFound()

  let category: Category | null = null
  if (typeof postRaw.category === 'number') {
    const cat = await getCategoryById(postRaw.category)
    category = cat as Category | null
  } else if (postRaw.category) {
    category = postRaw.category as Category
  }

  let author: DirectusUser | null = null
  if (typeof postRaw.author === 'object' && postRaw.author) {
    author = postRaw.author as DirectusUser
  }

  let tags: Tag[] = []
  if (postRaw.tags && Array.isArray(postRaw.tags)) {
    const tagPromises = postRaw.tags.map(async (pt: any) => {
      if (typeof pt.tags_id === 'number') {
        return await getTagById(pt.tags_id)
      } else if (pt.tags_id && typeof pt.tags_id === 'object') {
        return pt.tags_id as Tag
      }
      return null
    })
    tags = (await Promise.all(tagPromises)).filter((tag): tag is Tag => tag !== null)
  }

  const recentPostsRaw = (await getPosts({
    limit: 3,
    status: 'published'
  })) as any[]

  const hydratedPost = {
    ...postRaw,
    author,
    tags: tags.map((tag: Tag) => tag.name),
    category
  }

  const hydratedRecentPosts = recentPostsRaw
    .filter((recentPost: any) => recentPost.slug !== slug)
    .slice(0, 3)
    .map((recentPost: any) => ({
      id: recentPost.id,
      title: recentPost.title,
      slug: recentPost.slug,
      excerpt: recentPost.excerpt,
      content: recentPost.content || null,
      cover_image: recentPost.cover_image,
      published_at: recentPost.published_at,
      date_created: recentPost.date_created,
      reading_time: recentPost.reading_time,
      status: PostStatus.Published,
      author: typeof recentPost.author === 'object' ? recentPost.author : null,
      tags: recentPost.tags || [],
      category: typeof recentPost.category === 'object' ? recentPost.category : null
    }))

  let contentNodes = null
  try {
    contentNodes = normalizeContent(postRaw.content)
  } catch (error) {
    console.error('Error normalizing content:', error)
    contentNodes = null
  }

  const postDate = new Date(postRaw.published_at || postRaw.date_created)
  const formattedDate = formatDate(postDate)
  const readingTime = calculateReadingTime(contentNodes || postRaw.content)
  const excerpt = hydratedPost.excerpt || ''
  const authorName = author ? `${author.first_name} ${author.last_name}`.trim() : 'Gerald Dagher'

  return (
    <main className="min-h-screen text-foreground">
      <article className="pb-20 sm:pb-28">
        <section className="relative overflow-hidden border-b border-border/40 bg-muted/20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.1),transparent_28%)]"
          />
          <div className="section-inner-wide relative pt-24 pb-10 sm:pt-32 sm:pb-14 lg:pt-36 lg:pb-18">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
              <div className="max-w-4xl">
                <Link
                  href="/blog"
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to writing
                </Link>

                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {category && <span className="section-label">{category.name}</span>}
                  <span className="section-kicker">Essay</span>
                </div>

                <h1 className="display-heading max-w-5xl text-4xl text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
                  {hydratedPost.title}
                </h1>

                {excerpt && (
                  <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                    {excerpt}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1.5">
                    <CalendarDays className="h-4 w-4" />
                    <time dateTime={postDate.toISOString()}>{formattedDate}</time>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1.5">
                    <Clock3 className="h-4 w-4" />
                    {readingTime} min read
                  </span>
                  {hydratedPost.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground/80"
                    >
                      <TagIcon className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <aside className="section-panel-muted p-5 sm:p-6 xl:ms-auto xl:w-full">
                <p className="section-kicker">Written by</p>
                <div className="mt-4 flex items-center gap-4">
                  {author ? (
                    <Avatar
                      avatarId={author.avatar}
                      firstName={author.first_name}
                      lastName={author.last_name}
                      email={author.email}
                      size="lg"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                  )}
                  <div>
                    <p className="text-base font-semibold text-foreground">{authorName}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Notes on technology, leadership, culture, and the systems shaping how we work.
                    </p>
                  </div>
                </div>

                {hydratedPost.tags.length > 0 && (
                  <div className="mt-6 border-t border-border/50 pt-5">
                    <p className="section-kicker">Filed under</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {hydratedPost.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                        >
                          <TagIcon className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section className="section-inner-wide pt-8 sm:pt-12">
          {hydratedPost.cover_image && (
            <div className="section-panel relative mb-10 aspect-[16/9] overflow-hidden sm:mb-14">
              <Image
                src={hydratedPost.cover_image}
                alt={hydratedPost.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1200px"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          )}

          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-14">
            <div className="section-panel p-6 sm:p-8 lg:p-10">
              {contentNodes ? (
                <SlateRenderer
                  content={contentNodes}
                  className="max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No content available.</p>
              )}
            </div>

            <aside className="space-y-6 xl:pt-4">
              <div className="section-panel-muted p-5 sm:p-6 xl:sticky xl:top-28">
                <p className="section-kicker">Article details</p>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Published</dt>
                    <dd className="mt-1 text-sm text-foreground">{formattedDate}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Reading time</dt>
                    <dd className="mt-1 text-sm text-foreground">{readingTime} minutes</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Category</dt>
                    <dd className="mt-1 text-sm text-foreground">{category?.name ?? 'Writing'}</dd>
                  </div>
                </dl>

                <div className="mt-6 border-t border-border/50 pt-5">
                  <p className="text-sm leading-7 text-muted-foreground">
                    Prefer browsing more essays before diving deeper?
                  </p>
                  <Link
                    href="/blog"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                  >
                    Explore the archive
                    <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </article>

      <section className="border-t border-border/40 bg-muted/20">
        <div className="section-inner-wide py-14 sm:py-18">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="section-label">Continue reading</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                More essays from the archive
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                A few more pieces that carry the same thread of reflection, craft, and systems thinking.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Browse all posts
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {hydratedRecentPosts.map((recentPost) => (
              <PostCard key={recentPost.id} post={recentPost as any} viewMode="grid" forcePreview />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
