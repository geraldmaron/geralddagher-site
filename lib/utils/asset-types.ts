export type AssetType = 'image' | 'video' | 'audio' | 'document' | 'other';

export function getAssetType(key: string, mimeType?: string): AssetType {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  }

  const extension = key.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff', 'avif'].includes(extension)) {
    return 'image';
  }

  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'm4v'].includes(extension)) {
    return 'video';
  }

  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus'].includes(extension)) {
    return 'audio';
  }

  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'].includes(extension)) {
    return 'document';
  }

  return 'other';
}

export function getAssetTypeIconName(type: AssetType): string {
  switch (type) {
    case 'image':
      return 'ImageIcon';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Music';
    case 'document':
      return 'FileText';
    default:
      return 'Package';
  }
}

export function getAssetTypeLabel(type: AssetType) {
  switch (type) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Audio';
    case 'document':
      return 'Document';
    default:
      return 'Other';
  }
}


