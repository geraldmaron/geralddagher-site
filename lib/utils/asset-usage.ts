import { createDirectusServerClient } from '@/lib/directus/server-client';
import { readItems, readUsers } from '@directus/sdk';

export interface AssetUsage {
  type: 'cover_image' | 'content' | 'avatar' | 'category_image' | 'tag_image' | 'milestone_image' | 'work_image';
  entityType: 'post' | 'user' | 'category' | 'tag' | 'milestone' | 'work_experience';
  entityId: string;
  entityTitle: string;
  entitySlug?: string;
  adminUrl: string;
  publicUrl?: string;
}

export interface AssetUsageResult {
  isUsed: boolean;
  usageCount: number;
  usages: AssetUsage[];
}

interface SlateNode {
  type?: string;
  children?: SlateNode[];
  url?: string;
  [key: string]: any;
}

function findAssetInSlateContent(content: any, assetKey: string, assetUrl: string): boolean {
  if (!content) return false;

  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch {
      return content.includes(assetKey) || content.includes(assetUrl);
    }
  }

  if (Array.isArray(content)) {
    return content.some(item => findAssetInSlateContent(item, assetKey, assetUrl));
  }

  if (typeof content === 'object' && content !== null) {
    if (content.type === 'image' && content.url) {
      const nodeUrl = String(content.url);
      if (matchesAssetReference(nodeUrl, assetKey, assetUrl)) {
        return true;
      }
    }

    return Object.values(content).some(value => findAssetInSlateContent(value, assetKey, assetUrl));
  }

  return false;
}

function normalizeAssetReference(assetKey: string, assetUrl: string): string[] {
  const variations: string[] = [assetKey, assetUrl];

  const urlParts = assetUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  if (filename && filename !== assetKey) {
    variations.push(filename);
  }

  const keyParts = assetKey.split('-');
  if (keyParts.length > 1) {
    const keyWithoutTimestamp = keyParts.slice(1).join('-');
    variations.push(keyWithoutTimestamp);
  }

  return variations;
}

function matchesAssetReference(reference: string, assetKey: string, assetUrl: string): boolean {
  if (!reference || !assetKey) return false;

  const normalized = normalizeAssetReference(assetKey, assetUrl);
  const refLower = reference.toLowerCase().trim();
  const assetKeyLower = assetKey.toLowerCase().trim();

  const refFilename = refLower.split('/').pop() || refLower;
  const refFilenameNoExt = refFilename.split('.')[0];
  const assetKeyNoExt = assetKeyLower.split('.')[0];

  if (refLower === assetKeyLower) return true;
  if (refFilename === assetKeyLower) return true;
  if (refLower === assetKeyNoExt) return true;
  if (refFilename === assetKeyNoExt) return true;
  if (refFilenameNoExt === assetKeyNoExt) return true;

  return normalized.some(variant => {
    const variantLower = variant.toLowerCase().trim();
    const variantFilename = variantLower.split('/').pop() || variantLower;
    const variantFilenameNoExt = variantFilename.split('.')[0];

    if (refLower === variantLower) return true;
    if (refFilename === variantFilename) return true;
    if (refFilenameNoExt === variantFilenameNoExt) return true;
    if (refLower.includes(assetKeyLower)) return true;
    if (refLower.endsWith(assetKeyLower)) return true;

    const urlFilename = assetUrl.split('/').pop()?.toLowerCase();
    if (urlFilename) {
      const urlFilenameNoExt = urlFilename.split('.')[0];
      if (refLower.includes(urlFilename)) return true;
      if (refLower.endsWith(urlFilename)) return true;
      if (refFilename === urlFilename) return true;
      if (refFilenameNoExt === urlFilenameNoExt) return true;
    }

    if (refLower.includes(variantFilename) || variantLower.includes(refFilename)) return true;

    const keyParts = assetKeyLower.split('-');
    if (keyParts.length > 1) {
      const keyWithoutTimestamp = keyParts.slice(1).join('-');
      const keyWithoutTimestampNoExt = keyWithoutTimestamp.split('.')[0];
      if (refLower.includes(keyWithoutTimestamp) || refLower.endsWith(keyWithoutTimestamp)) {
        return true;
      }
      if (refLower.includes(keyWithoutTimestampNoExt) || refLower.endsWith(keyWithoutTimestampNoExt)) {
        return true;
      }
    }

    return false;
  });
}

export async function findAssetUsage(assetKey: string, assetUrl: string): Promise<AssetUsageResult> {
  try {
    const client = await createDirectusServerClient();
    const usages: AssetUsage[] = [];


    const posts = await client.request(
      readItems('posts', {
        fields: ['id', 'title', 'slug', 'cover_image', 'content'],
        limit: -1
      })
    );


    for (const post of posts) {
      if (post.cover_image) {
        const coverImage = String(post.cover_image).trim();
        if (coverImage && matchesAssetReference(coverImage, assetKey, assetUrl)) {
          usages.push({
            type: 'cover_image',
            entityType: 'post',
            entityId: String(post.id),
            entityTitle: post.title || 'Untitled',
            entitySlug: post.slug || '',
            adminUrl: `/admin/posts/${post.slug || post.id}`,
            publicUrl: `/blog/${post.slug}`
          });
          continue;
        }
      }

      if (post.content && findAssetInSlateContent(post.content, assetKey, assetUrl)) {
        usages.push({
          type: 'content',
          entityType: 'post',
          entityId: String(post.id),
          entityTitle: post.title || 'Untitled',
          entitySlug: post.slug || '',
          adminUrl: `/admin/posts/${post.slug || post.id}`,
          publicUrl: `/blog/${post.slug}`
        });
      }
    }

    const users = await client.request(
      readUsers({
        fields: ['id', 'first_name', 'last_name', 'email', 'avatar'],
        limit: -1
      })
    ).catch(() => []);


    for (const user of users) {
      if (user.avatar) {
        const avatar = String(user.avatar).trim();
        if (avatar && matchesAssetReference(avatar, assetKey, assetUrl)) {
          const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Unknown User';
          usages.push({
            type: 'avatar',
            entityType: 'user',
            entityId: String(user.id),
            entityTitle: name,
            adminUrl: `/admin/users/${user.id}`
          });
        }
      }
    }

    const categories = await client.request(
      readItems('categories', {
        fields: ['id', 'name', 'slug', 'image'],
        limit: -1
      })
    ).catch(() => []);

    for (const category of categories) {
      if (category.image) {
        const image = String(category.image).trim();
        if (image && matchesAssetReference(image, assetKey, assetUrl)) {
          usages.push({
            type: 'category_image',
            entityType: 'category',
            entityId: String(category.id),
            entityTitle: category.name || 'Untitled Category',
            entitySlug: category.slug,
            adminUrl: `/admin/categories/${category.id}`
          });
        }
      }
    }

    const tags = await client.request(
      readItems('tags', {
        fields: ['id', 'name', 'slug', 'image'],
        limit: -1
      })
    ).catch(() => []);

    for (const tag of tags) {
      if (tag.image) {
        const image = String(tag.image).trim();
        if (image && matchesAssetReference(image, assetKey, assetUrl)) {
          usages.push({
            type: 'tag_image',
            entityType: 'tag',
            entityId: String(tag.id),
            entityTitle: tag.name || 'Untitled Tag',
            entitySlug: tag.slug,
            adminUrl: `/admin/tags/${tag.id}`
          });
        }
      }
    }

    const milestones = await client.request(
      readItems('milestones', {
        fields: ['id', 'title', 'image'],
        limit: -1
      })
    ).catch(() => []);

    for (const milestone of milestones) {
      if (milestone.image) {
        const image = String(milestone.image).trim();
        if (image && matchesAssetReference(image, assetKey, assetUrl)) {
          usages.push({
            type: 'milestone_image',
            entityType: 'milestone',
            entityId: String(milestone.id),
            entityTitle: milestone.title || 'Untitled Milestone',
            adminUrl: `/admin/milestones/${milestone.id}`
          });
        }
      }
    }

    const workExperience = await client.request(
      readItems('work_experience', {
        fields: ['id', 'company', 'logo'],
        limit: -1
      })
    ).catch(() => []);

    for (const work of workExperience) {
      if (work.logo) {
        const logo = String(work.logo).trim();
        if (logo && matchesAssetReference(logo, assetKey, assetUrl)) {
          usages.push({
            type: 'work_image',
            entityType: 'work_experience',
            entityId: String(work.id),
            entityTitle: work.company || 'Untitled Work Experience',
            adminUrl: `/admin/work-experience/${work.id}`
          });
        }
      }
    }


    return {
      isUsed: usages.length > 0,
      usageCount: usages.length,
      usages
    };
  } catch (error) {
    console.error('Error finding asset usage:', error);
    return {
      isUsed: false,
      usageCount: 0,
      usages: []
    };
  }
}


