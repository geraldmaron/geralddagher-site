/**
 * Centralized Collection Configuration
 * 
 * This file provides a single source of truth for all Appwrite collection IDs
 * used throughout the G-Assistant system. It uses environment variables with
 * sensible fallbacks to ensure consistency across the codebase.
 */

// Database configuration
export const DATABASE_CONFIG = {
  DATABASE_ID: process.env.APPWRITE_DATABASE_ID || 'main',
} as const;

// G-Assistant collection configuration
export const G_ASSISTANT_COLLECTIONS = {
  CONVERSATIONS: process.env.APPWRITE_G_ASSISTANT_CONVERSATIONS_COLLECTION_ID || 'g_conversations',
  MESSAGES: process.env.APPWRITE_G_ASSISTANT_MESSAGES_COLLECTION_ID || 'g_messages',
  LEARNINGS: process.env.APPWRITE_G_ASSISTANT_LEARNINGS_COLLECTION_ID || 'g_learnings',
  INFERENCES_PROPOSED: process.env.APPWRITE_G_ASSISTANT_INFERENCES_COLLECTION_ID || 'inferences_proposed',
  INFERENCES_CONFIRMED: process.env.APPWRITE_G_ASSISTANT_INFERENCES_CONFIRMED_COLLECTION_ID || 'inferences_confirmed',
  UPLOADS: process.env.APPWRITE_G_ASSISTANT_UPLOADS_COLLECTION_ID || 'g_uploads',
  OUTPUTS: process.env.APPWRITE_G_ASSISTANT_OUTPUTS_COLLECTION_ID || 'g_outputs',
  CONTROLS: process.env.APPWRITE_G_ASSISTANT_CONTROLS_COLLECTION_ID || 'g_controls',
  PROFILE_FACTS: process.env.APPWRITE_G_ASSISTANT_PROFILE_FACTS_COLLECTION_ID || 'profile_facts',
  ENTITY_REGISTRY: process.env.APPWRITE_G_ASSISTANT_ENTITY_REGISTRY_COLLECTION_ID || 'entity_registry',
} as const;

// Main application collections
export const APP_COLLECTIONS = {
  POSTS: 'posts',
  AUTHORS: 'authors',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  POST_TAGS: 'post_tags',
  PROFILES: 'profiles',
  SUBSCRIPTIONS: 'subscriptions',
  FEEDBACK: 'feedback',
  TMP_SUBMISSIONS: 'tmp_submissions',
  SMS_MESSAGES: 'sms_messages',
  EMAIL_NOTIFICATIONS: 'email_notifications',

  ARGUS: 'argus',
  AUTHOR_SENTIMENTS: 'author_sentiments',
  POST_SENTIMENTS: 'post_sentiments',
} as const;

// All collections combined for reference
export const ALL_COLLECTIONS = {
  ...G_ASSISTANT_COLLECTIONS,
  ...APP_COLLECTIONS,
} as const;

// Type definitions for better TypeScript support
export type GAssistantCollectionId = keyof typeof G_ASSISTANT_COLLECTIONS;
export type AppCollectionId = keyof typeof APP_COLLECTIONS;
export type CollectionId = keyof typeof ALL_COLLECTIONS;

// Helper functions
export const getCollectionId = (collection: GAssistantCollectionId | AppCollectionId): string => {
  return ALL_COLLECTIONS[collection];
};

export const getDatabaseId = (): string => {
  return DATABASE_CONFIG.DATABASE_ID;
};

// Validation helper
export const validateCollectionExists = (collectionId: string): boolean => {
  return Object.values(ALL_COLLECTIONS).includes(collectionId);
};
