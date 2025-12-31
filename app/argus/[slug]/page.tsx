import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getMyProfile } from '@/lib/directus/queries/users';
import { getPostBySlug } from '@/lib/directus/queries/posts';
import { getAdminRole } from '@/lib/auth/server-utils';
import ArgusPostClient from './ArgusPostClient';

export default async function ArgusPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('directus_session_token');

  if (!sessionToken) {
    redirect('/login?redirect=/argus');
  }

  try {
    const user = await getMyProfile();

    if (!user || !user.has_argus_access) {
      redirect('/argus');
    }

    const post = await getPostBySlug(slug);

    if (!post) {
      notFound();
    }

    if (!post.is_argus_content) {
      redirect(`/blog/${slug}`);
    }

    const adminRole = await getAdminRole();
    const isAdmin = adminRole === 'admin';

    if (!isAdmin) {
      const hasAccess =
        !post.argus_users ||
        post.argus_users.length === 0 ||
        post.argus_users.some((au: any) => {
          const userId = typeof au.directus_users_id === 'string' ? au.directus_users_id : au.directus_users_id?.id;
          return userId === user.id;
        });

      if (!hasAccess) {
        redirect('/argus');
      }
    }

    return <ArgusPostClient post={post as any} user={user} />;
  } catch (error) {
    console.error('Error loading Argus post:', error);
    redirect('/argus');
  }
}
