export enum PostStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
  Deleted = 'deleted'
}
export enum TargetType {
  Blog = 'blog'
}
export enum ContentType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Document = 'document'
}
export interface AuthorSentiment extends WithTimestamps, WithSoftDelete {
  id: string;
  emoji: string;
  name: string;
  description: string;
  is_active: boolean;
}

export enum TMPSubmissionStatus {
  Pending = 'Pending',
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Rejected = 'Rejected'
}
export interface WithTimestamps extends Record<string, unknown> {
  created_at: string;
  updated_at: string;
}
export interface WithSoftDelete extends Record<string, unknown> {
  deleted_at: string | null;
}
export interface SoftDeletedItem extends WithTimestamps, WithSoftDelete {
  id: string;
  title: string;
  type: 'post' | 'argus';
  daysRemaining: number;
  content_type: ContentType;
  status: PostStatus;
  excerpt?: string | null;
  cover_image?: string | null;
  author_id?: string | null;
  published_at?: string | null;
  file_url?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  target_users?: string[] | null;
}
export interface SoftDeleteStats {
  total: number;
  posts: number;
  argus: number;
}
export interface WithStatus<T> extends Record<string, unknown> {
  status: T;
}
export interface WithSlug extends Record<string, unknown> {
  slug: string;
}
export interface SMSMessage extends WithTimestamps {
  id: string;
  originalText: string;
  correctedText: string;
  phoneNumber: string;
}
export interface Author extends WithTimestamps {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
}
export interface Category extends WithTimestamps, WithSlug {
  id: string;
  name: string;
  description: string | null;
}
export interface Tag extends WithTimestamps, WithSlug {
  id: string;
  name: string;
  description: string | null;
}
export interface PostTag extends Record<string, unknown> {
  id: string;
  post_id: string;
  tag_id: string;
  created_at: string;
  updated_at: string;
}
export interface PostSentiment extends Record<string, unknown> {
  id: string;
  post_id: string;
  sentiment_id: string;
  created_at: string;
  updated_at: string;
}
export interface SlateContent {
  type: 'slate';
  version: number;
  content: unknown;
}
export interface Post extends WithTimestamps, WithSoftDelete, WithStatus<PostStatus>, WithSlug {
  id: string;
  title: string;
  content: SlateContent;
  excerpt: string | null;
  cover_image: string | null;
  author_id: string | null;
  category_id: string | null;
  published_at: string | null;
  last_updated: string | null;
  content_type: ContentType;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
}
export interface Argus extends WithTimestamps, WithSoftDelete, WithStatus<PostStatus>, WithSlug {
  id: string;
  title: string;
  content: SlateContent;
  excerpt: string | null;
  author_id: string | null;
  published_at: string | null;
  content_type: ContentType;
  target_users: string[] | null;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  bucket_id: string | null;
  file_id: string | null;
  writer_sentiment_id?: string;
}
export interface TMPSubmission extends WithTimestamps, WithStatus<TMPSubmissionStatus> {
  id: number | string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  company?: string;
  about_you: string;
  phonetic_spelling?: string;
  pronouns?: string;
  website?: string;
  youtube_link?: string;
  session_date?: string | null;
  social_links?: Record<string, string>;
  contact_preferences?: {
    selected_contact_methods: string[];
    selected_days: string[];
    selected_times: string[];
    selected_dates: string[];
  };
  scheduled_at?: string;
  completed_at?: string;
  rejected_at?: string;
  rejected_reason?: string;
  notes?: string;
}
export interface Profile extends WithTimestamps {
  id: string;
  user_id: string;
  is_admin: boolean;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export interface Subscription extends WithTimestamps {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  type: 'blog' | 'substack';
  status: 'pending' | 'active' | 'unsubscribed';
  email_verified: boolean;
  verification_token?: string;
  verificationTokenExpiresAt?: string;
  brevo_contact_id?: string;
  unsubscribed_at?: string;
  userId?: string;
  sourceIp?: string;
  userAgent?: string;
}

export interface Milestone extends WithTimestamps {
  id: string;
  event: string;
  year: string;
  icon: string;
  color: string;
  summary: string;
  order?: number;
  status: 'published' | 'draft';
}

export interface Database {
  public: {
    Tables: {
      sms_messages: {
        Row: SMSMessage;
        Insert: Omit<SMSMessage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SMSMessage, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      authors: {
        Row: Author;
        Insert: Omit<Author, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Author, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [{
          foreignKeyName: 'posts_author_id_fkey';
          columns: ['id'];
          referencedRelation: 'posts';
          referencedColumns: ['author_id'];
        }];
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [{
          foreignKeyName: 'posts_category_id_fkey';
          columns: ['id'];
          referencedRelation: 'posts';
          referencedColumns: ['category_id'];
        }];
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Tag, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [{
          foreignKeyName: 'post_tags_tag_id_fkey';
          columns: ['id'];
          referencedRelation: 'post_tags';
          referencedColumns: ['tag_id'];
        }];
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;
        Relationships: [{
          foreignKeyName: 'posts_author_id_fkey';
          columns: ['author_id'];
          referencedRelation: 'authors';
          referencedColumns: ['id'];
        }, {
          foreignKeyName: 'posts_category_id_fkey';
          columns: ['category_id'];
          referencedRelation: 'categories';
          referencedColumns: ['id'];
        }];
      };
      post_tags: {
        Row: PostTag;
        Insert: Omit<PostTag, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PostTag, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [{
          foreignKeyName: 'post_tags_post_id_fkey';
          columns: ['post_id'];
          referencedRelation: 'posts';
          referencedColumns: ['id'];
        }, {
          foreignKeyName: 'post_tags_tag_id_fkey';
          columns: ['tag_id'];
          referencedRelation: 'tags';
          referencedColumns: ['id'];
        }];
      };
      argus: {
        Row: Argus;
        Insert: Omit<Argus, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Omit<Argus, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;
        Relationships: [{
          foreignKeyName: 'argus_author_id_fkey';
          columns: ['author_id'];
          referencedRelation: 'authors';
          referencedColumns: ['id'];
        }];
      };
      tmp_submissions: {
        Row: TMPSubmission;
        Insert: Omit<TMPSubmission, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TMPSubmission, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [{
          foreignKeyName: 'profiles_user_id_fkey';
          columns: ['user_id'];
          referencedRelation: 'users';
          referencedColumns: ['id'];
        }];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      milestones: {
        Row: Milestone;
        Insert: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Milestone, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      author_sentiments: {
        Row: AuthorSentiment;
        Insert: Omit<AuthorSentiment, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
        Update: Partial<Omit<AuthorSentiment, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>;
        Relationships: [];
      };
      g_conversations: {
        Row: GConversation;
        Insert: Omit<GConversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GConversation, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [{
          foreignKeyName: 'g_conversations_post_id_fkey';
          columns: ['post_id'];
          referencedRelation: 'posts';
          referencedColumns: ['id'];
        }];
      };
      g_messages: {
        Row: GMessage;
        Insert: Omit<GMessage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GMessage, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [{
          foreignKeyName: 'g_messages_conversation_id_fkey';
          columns: ['conversation_id'];
          referencedRelation: 'g_conversations';
          referencedColumns: ['id'];
        }];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      post_status: PostStatus;
      tmp_submission_status: TMPSubmissionStatus;
      target_type: TargetType;
      content_type: ContentType;
      conversation_status: ConversationStatus;
      message_role: MessageRole;
      writing_task_type: WritingTaskType;
      feedback_type: FeedbackType;
    };
  };
}
export type SMSMessageRow = SMSMessage;
export type AuthorRow = Author;
export type CategoryRow = Category;
export type TagRow = Tag;
export type PostRow = Post;
export type PostTagRow = PostTag;
export type ArgusRow = Argus;
export type TMPSubmissionRow = TMPSubmission;
export type ProfileRow = Profile;
export type SubscriptionRow = Subscription;
export type MilestoneRow = Milestone;
export type AuthorSentimentRow = AuthorSentiment;

export enum ConversationStatus {
  Active = 'active',
  Archived = 'archived',
  Deleted = 'deleted'
}

export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system'
}

export enum WritingTaskType {
  Generate = 'generate',
  Improve = 'improve',
  Analyze = 'analyze',
  Suggest = 'suggest'
}

export enum FeedbackType {
  Accepted = 'accepted',
  Rejected = 'rejected',
  Modified = 'modified'
}

export interface GConversation extends WithTimestamps {
  id: string;
  title: string;
  status: ConversationStatus;
  user_id: string;
  message_count?: number;
  last_message_at?: string;
  context_data?: string;
  deleted_at?: string;
}

export interface GMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  metadata?: string;
  token_count?: number;
  processing_time_ms?: number;
  model_version?: string;
  created_at: string;
}

export interface GPattern {
  id: string;
  category: string;
  pattern: string;
  confidence: number;
  usage_count: number;
  last_used: string;
  source: 'post' | 'feedback' | 'manual';
  post_ids: string[];
}

export interface GLearningState {
  last_processed_post_id: string;
  last_analysis_date: string;
  pattern_version: number;
  total_sessions: number;
  average_success_rate: number;
}

export interface GCache extends WithTimestamps {
  id: string;
  cache_key: string;
  content: string;
  expires_at: string;
  hit_count: number;
}

export interface GAssistantConfig extends WithTimestamps {
  id: string;
  config_type: string;
  config_key: string;
  config_value: any;
  is_system: boolean;
  description?: string;
}

export interface GPatternCategory extends WithTimestamps {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

export interface GLearnedPrompt extends WithTimestamps {
  id: string;
  user_id: string;
  category: 'structure' | 'tone' | 'voice' | 'style' | 'engagement' | 'content' | 'personality' | 'interaction' | 'adaptation' | 'context';
  title: string;
  prompt: string;
  source: 'pattern_analysis' | 'manual' | 'user_feedback' | 'system_generated' | 'ai_evolved';
  is_active: boolean;
  metadata: string;
}

export interface GLearnedPromptMetadata {
  examples: string;
  weight: number;
  confidence: number;
  is_baseline: boolean;
  is_permanent: boolean;
  is_locked: boolean;
  usage_count: number;
  success_rate: number;
  prompt_type: 'guidance' | 'instruction' | 'constraint' | 'enhancement' | 'adaptation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: 'general' | 'specific' | 'conversational' | 'content_creation' | 'analysis';
  tags: string[];
  version: number;
  parent_id?: string;
  evolution_chain: string;
  last_used: string | null;
  original_type?: 'writing_pattern';
  post_ids?: string[];
  conversation_ids?: string[];
}

export interface GLearningSession extends WithTimestamps {
  id: string;
  user_id: string;
  session_type: string;
  questions: string[];
  answers: string[];
  insights: string[];
  patterns_learned: string[];
  success_rate: number;
  completed: boolean;
  completed_at: string | null;
}

export interface GInsight extends WithTimestamps {
  id: string;
  user_id: string;
  content: string;
  category: string;
  source: string;
  processed: boolean;
  processed_at: string | null;
  metadata: Record<string, any> | null;
}

export type GConversationRow = GConversation;
export type GMessageRow = GMessage;
export type GPatternRow = GPattern;
export type GCacheRow = GCache;
export type GAssistantConfigRow = GAssistantConfig;
export type GPatternCategoryRow = GPatternCategory;
export type GLearnedPromptRow = GLearnedPrompt;
export type GLearningSessionRow = GLearningSession;
export type GInsightRow = GInsight;