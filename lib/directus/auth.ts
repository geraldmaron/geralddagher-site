import { createDirectusClient } from './client';
import { createDirectusServerClient } from './server-client';
import { login, logout, refresh, readMe } from '@directus/sdk';
import { cookies } from 'next/headers';

export async function signIn(email: string, password: string) {
  const client = createDirectusClient();

  const result = await client.request(
    login(email, password, {
      mode: 'cookie'
    })
  );

  return result;
}

export async function signOut() {
  const client = createDirectusClient();
  await client.request(logout());
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('directus_session_token')?.value;

    if (!sessionToken) {
      return null;
    }

    const client = await createDirectusServerClient({ requireAuth: true });
    const user = await client.request(
      readMe({
        fields: [
          'id',
          'email',
          'first_name',
          'last_name',
          'avatar',
          { role: ['id', 'name'] }
        ]
      })
    );

    return user;
  } catch (error: any) {
    if (error?.errors?.[0]?.extensions?.code === 'INVALID_CREDENTIALS' ||
        error?.errors?.[0]?.extensions?.code === 'TOKEN_EXPIRED') {
      return null;
    }
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function refreshSession() {
  const client = createDirectusClient();
  await client.request(refresh('cookie'));
}
