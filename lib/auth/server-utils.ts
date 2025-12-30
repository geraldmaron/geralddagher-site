import { getCurrentUser } from '@/lib/directus/auth';
import { User } from './types';

export async function getServerUser(): Promise<User | null> {
  try {
    const directusUser = await getCurrentUser();

    if (!directusUser) {

      return null;
    }

    const roleInfo: any = directusUser.role;
    const roleName = typeof roleInfo === 'string' ? roleInfo : roleInfo?.name;

    const isAdmin = roleName &&
      (roleName.toLowerCase() === 'administrator' ||
       roleName.toLowerCase() === 'admin' ||
       roleName.toLowerCase().includes('admin'));

    const user: User = {
      id: directusUser.id,
      email: directusUser.email,
      name: `${directusUser.first_name || ''} ${directusUser.last_name || ''}`.trim() || directusUser.email,
      role: isAdmin ? 'admin' : 'user',
      labels: [],
      teams: [],
      avatar_url: directusUser.avatar || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return user;
  } catch (error) {
    return null;
  }
}

export async function clearServerSession(): Promise<void> {
}
