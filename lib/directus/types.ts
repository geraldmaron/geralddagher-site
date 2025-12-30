export interface DirectusUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  job_title: string | null;
  company: string | null;
  social_links: Record<string, string> | null;
  personal_website: string | null;
  is_author: boolean;
  author_slug: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: 'published' | 'draft';
  color: string | null;
  icon: string | null;
  sort_order: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: 'published' | 'draft';
  color: string | null;
  sort_order: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  author: DirectusUser | string;
  category: Category | number | null;
  tags: PostTag[];
  published_at: string | null;
  date_created: string;
  date_updated: string | null;
  view_count: number;
  reading_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

export interface PostTag {
  id: number;
  posts_id: Post | number;
  tags_id: Tag | number;
}

export interface Subscription {
  id: number;
  email: string;
  status: 'active' | 'unsubscribed';
  confirmed: boolean;
  date_created: string;
  date_updated: string | null;
}

export interface Milestone {
  id: number;
  event: string;
  year: number;
  category?: string;
  icon: string;
  color: string;
  summary: string;
  is_public: boolean;
  user: string;
}
