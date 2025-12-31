import { getCurrentUser } from '@/lib/directus/auth';
import { User } from './types';

export type AdminRole = 'admin' | 'argus_admin' | null;

export async function getAdminRole(): Promise<AdminRole> {
  try {
    const directusUser = await getCurrentUser();
    if (!directusUser) return null;

    const roleInfo: any = directusUser.role;
    const roleName = typeof roleInfo === 'string' ? roleInfo : roleInfo?.name;

    if (!roleName) return null;

    const lowerRoleName = roleName.toLowerCase();

    if (lowerRoleName === 'administrator' || lowerRoleName === 'admin') {
      return 'admin';
    }

    if (lowerRoleName === 'argus admin') {
      return 'argus_admin';
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function isFullAdmin(): Promise<boolean> {
  const role = await getAdminRole();
  return role === 'admin';
}

export async function isAnyAdmin(): Promise<boolean> {
  const role = await getAdminRole();
  return role !== null;
}

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
