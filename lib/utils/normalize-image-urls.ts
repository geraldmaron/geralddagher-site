export function normalizeImageUrls(content: any): any {
  if (!content) return content;

  if (Array.isArray(content)) {
    return content.map(node => normalizeImageUrls(node));
  }

  if (typeof content === 'object' && content !== null) {
    const normalized = { ...content };

    if (normalized.type === 'image' && normalized.url && typeof normalized.url === 'string') {
      normalized.url = normalizeUrl(normalized.url);
    }

    if (normalized.children && Array.isArray(normalized.children)) {
      normalized.children = normalized.children.map((child: any) => normalizeImageUrls(child));
    }

    return normalized;
  }

  return content;
}

function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;

  if (url.startsWith('/')) return url;

  if (url.startsWith('blob:')) return url;

  try {
    const urlObj = new URL(url);
    if (urlObj.pathname.startsWith('/api/assets/')) {
      return urlObj.pathname;
    }
    return url;
  } catch (_) {
    return url;
  }
}

