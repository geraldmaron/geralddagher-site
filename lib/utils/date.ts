import { Post } from '@/lib/types/shared';
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
export function getPostDate(post: Post): Date {
  if (post.published_at) {
    return new Date(post.published_at);
  }
  return new Date(post.created_at);
}
export const formatISODate = (date: Date): string => {
  return date.toISOString();
};