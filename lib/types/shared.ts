import type { Database, Post as DatabasePost, Author, Category, Tag, TMPSubmissionStatus, SlateContent, PostStatus, TargetType, ContentType, AuthorSentiment, Milestone } from './database';
import type { TMPSubmission as BaseTMPSubmission } from './database';
import { ReactNode } from 'react';
import { z } from 'zod';
export type { PostStatus, TargetType, ContentType, Milestone, TMPSubmissionStatus } from './database';
export type StorageBucket = 'cover-images' | 'post-content' | 'argus-content' | 'argus-media';
export type StorageOperation = {
  bucket: StorageBucket;
  path: string;
  file?: File;
};
export interface PageParams {
  [key: string]: string;
}
export interface PageProps {
  params: Promise<PageParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
export interface PostWithRelations extends DatabasePost {
  author: Author | null;
  category: Category | null;
  post_tags: Array<{
    tag: Tag;
  }>;
}
export interface PostData extends Omit<Post, 'author_id' | 'category_id' | 'post_tags'> {
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  category_id?: string | null;
  author_id?: string | null;
  writer_sentiments?: AuthorSentiment[];
  writer_sentiment_ids?: string[];
  writer_sentiment: AuthorSentiment | null;
  last_updated: string | null;
}
export interface ArgusUser {
  id: string;
  name: string;
  email: string;
}
export interface ArgusFileFilters {
  content_type?: ContentType[];
  target_users?: string[];
  status?: PostStatus;
}
export type BlogPost = PostData;
export interface SerializedPost extends Omit<DatabasePost, 'published_at' | 'updated_at' | 'created_at'> {
  published_date: string;
  updatedAt: string;
  createdAt: string;
  authorDetails?: (Omit<Author, 'created_at'> & {
    createdAt: string;
  }) | undefined;
  tags?: string[];
  reading_time?: number;
}
export interface FormattedPost {
  id: string;
  title: string;
  slug: string;
  content: SlateContent;
  excerpt: string | null;
  coverImage: string | null;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: string[];
}
export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  source: string;
}
export interface DatabaseError extends Error {
  code: string;
  details?: unknown;
  hint?: string;
}
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  birthPlace: string;
  currentLocation: string;
  currentJobTitle: string;
  currentCompany: string;
  children: string;
  married: string;
  pets: string;
  pronouns: string;
  nationality: string;
  linkedIn: string;
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  github: string;
  website: string;
  email: string;
  city: string;
  state: string;
  generalAbout: string;
  BusinessCardAbout: string;
  personalAbout: string[];
  professionalAbout: string;
  TMPAbout: string;
  personalKeywords: string[];
  milestones: Array<{
    event: string;
    year: string;
    icon: string;
    color: string;
    order?: number;
  }>;
}
export interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  loading: boolean;
  error: ErrorMessage | null;
}
export type AuthOperation = {
  type: 'signIn' | 'signOut' | 'resetPassword';
  email?: string;
  password?: string;
};
export interface TransformedUser {
  id: string;
  email: string;
  name: string;
  labels: string[];
}
export interface AuthContextType {
  user: TransformedUser | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
export interface BlogPostClientProps {
  slug: string;
  previewPost?: SerializedPost;
}
export interface TMPSubmission extends BaseTMPSubmission {
  status: TMPSubmissionStatus;
  youtube_link?: string;
  contact_preferences: {
    selected_contact_methods: string[];
    selected_days: string[];
    selected_times: string[];
    selected_dates: string[];
  };
  social_links?: Record<string, string>;
  scheduled_at?: string;
  session_date?: string | null;
  completed_at?: string;
  rejected_at?: string;
  rejected_reason?: string;
  notes?: string;
}
export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface TagData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface AuthorData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface TMPSubmissionData {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnailUrl?: string;
  status: TMPSubmissionStatus;
  createdAt: string;
  updatedAt: string;
}
export interface PaginationParams {
  page: number;
  pageSize: number;
}
export interface FilterParams {
  categories?: string[];
  tags?: string[];
  status?: PostStatus[];
  searchQuery?: string;
}
export interface GetPostsParams extends PaginationParams, FilterParams {
  sortBy?: 'published_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface PostFilters {
  categories: string[];
  tags: string[];
  status?: PostStatus;
  target_type?: TargetType;
  content_type?: ContentType[];
}
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: SlateContent;
  excerpt: string | null;
  cover_image: string | null;
  status: PostStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  deleted_at: string | null;
  target_type: TargetType;
  target_users: string[] | null;
  content_type: ContentType;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  writer_sentiment: AuthorSentiment | null;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: string[];
}
export interface PostWithContent extends Post {
  content: SlateContent;
}
export interface PostWithoutContent extends Omit<Post, 'content'> { }
export interface ErrorsProps {
  errors: ErrorMessage[];
  className?: string;
}
export interface LogContext {
  [key: string]: unknown;
}
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  labels: string[];
  teams?: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}