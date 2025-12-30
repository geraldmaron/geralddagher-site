import type { User } from './types';

export function hasAdminAccess(user: User | null): boolean {
  if (!user) {
    return false;
  }
  const hasAccessByRole = user.role === 'admin';
  const hasAccessByTeam = user.teams?.includes('admin') ?? false;
  const hasAccessByLabels = user.labels?.includes('admin') ?? false;
  return hasAccessByRole || hasAccessByTeam || hasAccessByLabels;
}

export function hasArgusAccess(user: User | null): boolean {
  if (!user) return false;
  const hasAccessByTeam = user.teams?.includes('argus') ?? false;
  const hasAccessByLabels = user.labels?.includes('argus') ?? false;
  return hasAccessByTeam || hasAccessByLabels;
}

export function hasGroupAccess(user: User | null, group: string): boolean {
  if (!user) return false;
  const hasAccessByTeam = user.teams?.includes(group.toLowerCase()) ?? false;
  const hasAccessByLabels = user.labels?.includes(group) ?? false;
  return hasAccessByTeam || hasAccessByLabels;
}
