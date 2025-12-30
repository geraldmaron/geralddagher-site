export function migrateImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.includes('167.99.174.79') || url.includes('cloud.appwrite.io')) {
    return url;
  }
  if (url.includes('supabase.co')) {
    return '/Dagher_Logo_2024_Mark.png';
  }
  return url;
}
export function getSafeImageUrl(url: string | null): string {
  if (!url) return '/Dagher_Logo_2024_Mark.png';
  const migratedUrl = migrateImageUrl(url);
  if (migratedUrl?.startsWith('http')) {
    return migratedUrl;
  }
  if (migratedUrl?.startsWith('/')) {
    return migratedUrl;
  }
  if (migratedUrl && !migratedUrl.startsWith('http') && !migratedUrl.startsWith('/')) {
    return `/api/assets/${migratedUrl}`;
  }
  return '/Dagher_Logo_2024_Mark.png';
}
export function isAppwriteImageUrl(url: string): boolean {
  return url.includes('167.99.174.79') || url.includes('cloud.appwrite.io');
}
export function isSupabaseImageUrl(url: string): boolean {
  return url.includes('supabase.co');
}
export function getAppwriteFileUrl(fileId: string | null, bucket: string = 'cover-images') {
  if (!fileId) return null;
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  return `${endpoint}/storage/buckets/${bucket}/files/${fileId}/view?project=${project}`;
}