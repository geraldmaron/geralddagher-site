import React from 'react';
import PostCard from './PostCard';
import type { BlogPost } from '@/lib/types/shared';
interface BlogListProps {
  posts: BlogPost[];
}
export default function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} viewMode="grid" />
      ))}
    </div>
  );
}