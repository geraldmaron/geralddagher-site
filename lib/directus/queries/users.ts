import { getDirectusClient } from '../server-client';
import { readMe, readUsers } from '@directus/sdk';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  location: string | null;
  bio: string | null;
  tmp_summary: string | null;
  job_title: string | null;
  company: string | null;
  social_links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
  } | null;
  personal_website: string | null;
  skills: Array<{
    id: string;
    title: string;
    color: string;
    cluster: string;
    summary: string;
    skills: string[];
  }>;
  avatar: string | null;
  is_author: boolean;
  author_slug: string | null;
  has_argus_access: boolean;
  argus_message: string | null;
  role: {
    id: string;
    name: string;
  } | null;
}

export async function getMyProfile(): Promise<UserProfile | null> {
  try {
    const directus = await getDirectusClient();
    const user = await directus.request(
      readMe({
        fields: [
          'id',
          'first_name',
          'last_name',
          'email',
          'location',
          'bio',
          'tmp_summary',
          'job_title',
          'company',
          'social_links',
          'personal_website',
          'skills',
          'avatar',
          'is_author',
          'author_slug',
          'has_argus_access',
          'argus_message',
          'role.id',
          'role.name',
        ],
      })
    );

    return user as UserProfile;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

export async function getAuthorProfile(authorId: string): Promise<UserProfile | null> {
  try {
    const directus = await getDirectusClient({ requireAuth: false });
    const users = await directus.request(
      readUsers({
        filter: { id: { _eq: authorId } },
        fields: [
          'id',
          'first_name',
          'last_name',
          'email',
          'location',
          'bio',
          'tmp_summary',
          'job_title',
          'company',
          'social_links',
          'personal_website',
          'skills',
          'avatar',
          'is_author',
          'author_slug',
        ],
      })
    );

    if (!users || users.length === 0) {
      return null;
    }

    return users[0] as UserProfile;
  } catch (error) {
    console.error('Failed to fetch author profile:', error);
    return null;
  }
}

export async function getPublicProfile(): Promise<UserProfile | null> {
  const authorId = '9b1b7df2-b252-4a55-978a-f550465d6470';
  return getAuthorProfile(authorId);
}
