import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, getPosts, getCategoryById, getTagById } from '@/lib/directus/queries'
import { formatDate } from '@/lib/utils/date'
import { calculateReadingTime } from '@/lib/utils/readingTime'
import Image from 'next/image'
import { ArrowLeft, TagIcon } from 'lucide-react'
import Link from 'next/link'
import PostCard from '@/components/posts/PostCard'
import { Avatar } from '@/components/core/Avatar'
import SlateRenderer from '@/components/core/SlateRenderer'
import { Post, DirectusUser, Category, Tag } from '@/lib/directus/types'
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

  const hydratedRecentPosts = recentPostsRaw.map((recentPost: any) => ({
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <article>
        {/* Article header — narrow reading column */}
        <div className="max-w-2xl mx-auto px-6 sm:px-8 pt-10 sm:pt-14 pb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-3 w-3" />
            Writing
          </Link>

          {category && (
            <span className="section-label block mb-3">{category.name}</span>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight mb-4">
            {hydratedPost.title}
          </h1>

          {excerpt && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
              {excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border/40">
            <div className="flex items-center gap-3">
              {author && (
                <Avatar
                  avatarId={author.avatar}
                  firstName={author.first_name}
                  lastName={author.last_name}
                  email={author.email}
                  size="sm"
                />
              )}
              <div>
                {author && (
                  <p className="text-sm font-medium text-foreground">
                    {author.first_name} {author.last_name}
                  </p>
                )}
                <p className="text-xs font-mono text-muted-foreground">
                  <time dateTime={postDate.toISOString()}>{formattedDate}</time>
                  {' · '}{readingTime} min read
                </p>
              </div>
            </div>

            {hydratedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hydratedPost.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted border border-border/60 text-muted-foreground"
                  >
                    <TagIcon className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cover image — full width */}
        {hydratedPost.cover_image && (
          <div className="w-full aspect-video relative overflow-hidden">
            <Image
              src={hydratedPost.cover_image}
              alt={hydratedPost.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        {/* Prose body — narrow reading column */}
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
          {contentNodes ? (
            <SlateRenderer
              content={contentNodes}
              className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground dark:prose-invert"
            />
          ) : (
            <p className="text-muted-foreground text-sm">No content available.</p>
          )}
        </div>
      </article>

      {/* Recent posts */}
      <div className="border-t border-border/40 bg-muted/20">
        <div className="section-inner-wide py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="section-label">Up next</span>
              <h2 className="section-heading mt-1">More from the blog</h2>
            </div>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              Browse all
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hydratedRecentPosts.map((recentPost) => (
              <PostCard key={recentPost.id} post={recentPost as any} viewMode="grid" forcePreview />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
