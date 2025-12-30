const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://cms.geralddagher.com';

export function getAvatarUrl(avatarId: string | null | undefined, options?: {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  quality?: number;
}): string | null {
  if (!avatarId) return null;

  const params = new URLSearchParams();

  if (options?.width) params.append('width', options.width.toString());
  if (options?.height) params.append('height', options.height.toString());
  if (options?.fit) params.append('fit', options.fit);
  if (options?.quality) params.append('quality', options.quality.toString());

  const queryString = params.toString();
  const url = `${DIRECTUS_URL}/assets/${avatarId}`;

  return queryString ? `${url}?${queryString}` : url;
}

export function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null): string {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return '?';
}
