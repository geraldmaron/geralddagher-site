import type { WithTimestamps } from './database';

export enum SubscriptionType {
  Blog = 'blog',
  Substack = 'substack'
}

export enum SubscriptionStatus {
  Pending = 'pending',
  Active = 'active',
  Unsubscribed = 'unsubscribed'
}

export interface Subscription extends WithTimestamps {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiresAt?: string;
  brevoContactId?: string;
  unsubscribedAt?: string;
  userId?: string;
  sourceIp?: string;
  userAgent?: string;
}

export interface CreateSubscriptionRequest {
  email: string;
  blog: boolean;
  substack: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  substackRedirectUrl?: string;
}

export interface ConfirmSubscriptionRequest {
  token: string;
}

export interface UnsubscribeRequest {
  email: string;
  target: 'blog' | 'substack';
}

export interface BrevoWebhookEvent {
  event: 'delivered' | 'bounced' | 'unsubscribed';
  email: string;
  date: string;
  messageId?: string;
}

export interface PublishWebhookRequest {
  postId: string;
}
