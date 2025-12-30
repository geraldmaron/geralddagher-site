import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, getPosts, getCategoryById, getTagById } from '@/lib/directus/queries'
import { formatDate } from '@/lib/utils/date'
import { calculateReadingTime } from '@/lib/utils/readingTime'
import Image from 'next/image'
import { ArrowLeft, Clock, Calendar, FolderOpen, TagIcon, Sparkles, BookOpen } from 'lucide-react'
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
    <div className="min-h-screen bg-white text-slate-900 dark:bg-black dark:text-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(167,139,250,0.08),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(74,222,128,0.08),transparent_22%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white dark:from-black dark:via-black dark:to-black opacity-95" />
        <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,white,transparent_72%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.35)] bg-slate-950/70 dark:border-white/10 dark:bg-black/60">
            <div className="absolute inset-0">
              {hydratedPost.cover_image ? (
                <Image
                  src={hydratedPost.cover_image}
                  alt={hydratedPost.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
            <div className="relative px-5 sm:px-8 lg:px-10 py-10 sm:py-12 lg:py-14 space-y-8 text-white">
              <div className="flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                  Feature
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 px-3 py-1 text-xs text-white">
                  <BookOpen className="h-3.5 w-3.5" />
                  {readingTime} min read
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
                  {hydratedPost.title}
                </h1>
                {excerpt && <p className="text-base sm:text-lg text-white/80 max-w-3xl">{excerpt}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3">
                  <Calendar className="h-4 w-4 text-cyan-200" />
                  <div>
                    <p className="text-xs text-white/70">Published</p>
                    <time dateTime={postDate.toISOString()} className="font-medium text-white">{formattedDate}</time>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3">
                  <Clock className="h-4 w-4 text-emerald-200" />
                  <div>
                    <p className="text-xs text-white/70">Reading time</p>
                    <p className="font-medium text-white">{readingTime} minutes</p>
                  </div>
                </div>
                {hydratedPost.category && (
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3">
                    <FolderOpen className="h-4 w-4 text-indigo-200" />
                    <div>
                      <p className="text-xs text-white/70">Category</p>
                      <p className="font-medium text-white">{hydratedPost.category.name}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {author && (
                  <div className="flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-2.5">
                    <Avatar
                      avatarId={author.avatar}
                      firstName={author.first_name}
                      lastName={author.last_name}
                      email={author.email}
                      size="sm"
                    />
                    <div>
                      <p className="text-xs text-white/70">Author</p>
                      <p className="font-medium text-white">{author.first_name} {author.last_name}</p>
                    </div>
                  </div>
                )}
                {hydratedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hydratedPost.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-[12px] text-white ring-1 ring-white/15"
                      >
                        <TagIcon className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-20">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_20px_80px_-30px_rgba(0,0,0,0.25)] p-6 sm:p-10 dark:border-slate-800 dark:bg-black/60">
            {contentNodes ? (
              <SlateRenderer
                content={contentNodes}
                  className="prose prose-lg max-w-none text-slate-800 prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-h1:text-3xl sm:prose-h1:text-4xl prose-h2:text-2xl sm:prose-h2:text-3xl prose-h3:text-xl sm:prose-h3:text-2xl prose-h4:text-lg dark:prose-invert"
              />
            ) : (
              <div className="text-slate-500 dark:text-slate-400">No content available.</div>
            )}
          </div>

          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Up next</p>
                <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">Recent posts</h2>
              </div>
              <Link
                href="/blog"
                className="text-sm text-slate-700 hover:text-slate-900 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10"
              >
                Browse all
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hydratedRecentPosts.map((recentPost) => (
                <PostCard key={recentPost.id} post={recentPost as any} viewMode="grid" forcePreview />
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
