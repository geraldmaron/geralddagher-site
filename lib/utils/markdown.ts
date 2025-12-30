interface SlateNode {
  type?: string;
  children?: SlateNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  url?: string;
  src?: string;
  alt?: string;
  language?: string;
  align?: string;
}

interface PostMetadata {
  title: string;
  excerpt?: string | null;
  cover_image?: string | null;
  status: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    avatar_url?: string | null;
  } | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  tags: string[];
}

function validateSlateNode(node: SlateNode): boolean {
  if (typeof node !== 'object' || node === null) {
    return false;
  }
  
  if (node.text !== undefined && typeof node.text !== 'string') {
    return false;
  }
  
  if (node.children && !Array.isArray(node.children)) {
    return false;
  }
  
  if (node.children) {
    for (const child of node.children) {
      if (!validateSlateNode(child)) {
        return false;
      }
    }
  }
  
  return true;
}

function serializeSlateToMarkdown(nodes: SlateNode[]): string {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return '';
  }
  
  const validNodes = nodes.filter(node => validateSlateNode(node));
  if (validNodes.length === 0) {
    return '';
  }
  
  return validNodes.map(node => serializeNode(node)).join('');
}

function serializeNode(node: SlateNode): string {
  if (!validateSlateNode(node)) {
    return '';
  }
  
  if (node.text !== undefined) {
    let text = node.text || '';
    if (node.bold) text = `**${text}**`;
    if (node.italic) text = `*${text}*`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.code) text = `\`${text}\``;
    return text;
  }
  
  const children = node.children ? node.children.map(child => serializeNode(child)).join('') : '';
  
  switch (node.type) {
    case 'paragraph':
      return `${children}\n\n`;
    case 'heading-one':
      return `# ${children}\n\n`;
    case 'heading-two':
      return `## ${children}\n\n`;
    case 'heading-three':
      return `### ${children}\n\n`;
    case 'heading-four':
      return `#### ${children}\n\n`;
    case 'heading-five':
      return `##### ${children}\n\n`;
    case 'heading-six':
      return `###### ${children}\n\n`;
    case 'block-quote':
      return `> ${children}\n\n`;
    case 'bulleted-list':
      return `${children}\n`;
    case 'numbered-list':
      return `${children}\n`;
    case 'list-item': {
      const listType = node.children?.[0]?.type;
      const bullet = listType === 'numbered-list' ? '1.' : '-';
      return `${bullet} ${children}\n`;
    }
    case 'code-block': {
      const language = node.language || '';
      return `\`\`\`${language}\n${children}\`\`\`\n\n`;
    }
    case 'link': {
      const url = node.url || '';
      if (!url.trim()) {
        return children;
      }
      return `[${children}](${url})`;
    }
    case 'image': {
      const src = node.src || '';
      const alt = node.alt || '';
      if (!src.trim()) {
        return '';
      }
      return `![${alt}](${src})\n\n`;
    }
    case 'horizontal-rule':
      return `---\n\n`;
    case 'table':
      return serializeTable(node);
    case 'table-row':
      return `| ${children} |\n`;
    case 'table-cell':
      return `${children} | `;
    default:
      return children;
  }
}

function serializeTable(tableNode: SlateNode): string {
  if (!validateSlateNode(tableNode) || !tableNode.children || !Array.isArray(tableNode.children)) {
    return '';
  }
  
  const rows = tableNode.children;
  if (rows.length === 0) return '';
  
  let markdown = '';
  rows.forEach((row, index) => {
    markdown += serializeNode(row);
    if (index === 0) {
      const cellCount = row.children?.length || 0;
      markdown += '|' + ' --- |'.repeat(cellCount) + '\n';
    }
  });
  return markdown + '\n';
}

function validateMetadata(metadata: PostMetadata): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!metadata.title || metadata.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!metadata.status || metadata.status.trim() === '') {
    errors.push('Status is required');
  }
  
  if (!metadata.created_at || metadata.created_at.trim() === '') {
    errors.push('Created date is required');
  }
  
  if (!metadata.updated_at || metadata.updated_at.trim() === '') {
    errors.push('Updated date is required');
  }
  
  if (metadata.published_at) {
    try {
      new Date(metadata.published_at);
    } catch {
      errors.push('Invalid published date format');
    }
  }
  
  try {
    new Date(metadata.created_at);
  } catch {
    errors.push('Invalid created date format');
  }
  
  try {
    new Date(metadata.updated_at);
  } catch {
    errors.push('Invalid updated date format');
  }
  
  return { valid: errors.length === 0, errors };
}

function generateFrontMatter(metadata: PostMetadata): string {
  const validation = validateMetadata(metadata);
  if (!validation.valid) {
    throw new Error(`Invalid metadata: ${validation.errors.join(', ')}`);
  }
  
  const frontMatter = [
    '---',
    `title: "${metadata.title.replace(/"/g, '\\"')}"`,
  ];
  
  if (metadata.excerpt) {
    frontMatter.push(`excerpt: "${metadata.excerpt.replace(/"/g, '\\"')}"`);
  }
  
  if (metadata.cover_image) {
    frontMatter.push(`cover_image: "${metadata.cover_image}"`);
  }
  
  frontMatter.push(`status: "${metadata.status}"`);
  
  if (metadata.published_at) {
    frontMatter.push(`published_at: "${metadata.published_at}"`);
  }
  
  frontMatter.push(`created_at: "${metadata.created_at}"`);
  frontMatter.push(`updated_at: "${metadata.updated_at}"`);
  
  if (metadata.author) {
    frontMatter.push(`author: "${metadata.author.name}"`);
    if (metadata.author.avatar_url) {
      frontMatter.push(`author_avatar: "${metadata.author.avatar_url}"`);
    }
  }
  
  if (metadata.category) {
    frontMatter.push(`category: "${metadata.category.name}"`);
    frontMatter.push(`category_slug: "${metadata.category.slug}"`);
  }
  
  if (metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
    frontMatter.push(`tags:`);
    metadata.tags.forEach(tag => {
      if (tag && typeof tag === 'string' && tag.trim() !== '') {
        frontMatter.push(`  - "${tag.replace(/"/g, '\\"')}"`);
      }
    });
  }
  
  frontMatter.push('---');
  frontMatter.push('');
  return frontMatter.join('\n');
}

export function convertPostToMarkdown(post: any): string {
  if (!post || typeof post !== 'object') {
    throw new Error('Invalid post object');
  }
  
  const metadata: PostMetadata = {
    title: post.title || '',
    excerpt: post.excerpt || null,
    cover_image: post.cover_image || null,
    status: post.status || 'draft',
    published_at: post.published_at || null,
    created_at: post.created_at || new Date().toISOString(),
    updated_at: post.updated_at || new Date().toISOString(),
    author: post.author || null,
    category: post.category || null,
    tags: Array.isArray(post.tags) ? post.tags.filter((tag: any) => tag && typeof tag === 'string') : []
  };
  
  const frontMatter = generateFrontMatter(metadata);
  let content = '';
  
  if (post.content?.content && Array.isArray(post.content.content)) {
    content = serializeSlateToMarkdown(post.content.content);
  }
  
  const result = frontMatter + content;
  if (!result || result.trim() === '') {
    throw new Error('Generated markdown content is empty');
  }
  
  return result;
}

export function generateMarkdownFilename(post: any): string {
  if (!post || typeof post !== 'object') {
    throw new Error('Invalid post object');
  }
  
  let date: Date;
  
  try {
    if (post.published_at) {
      date = new Date(post.published_at);
    } else if (post.created_at) {
      date = new Date(post.created_at);
    } else if (post.$createdAt) {
      date = new Date(post.$createdAt);
    } else {
      date = new Date();
    }
    
    if (isNaN(date.getTime())) {
      date = new Date();
    }
  } catch {
    date = new Date();
  }
  
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  let slug = '';
  if (post.slug && typeof post.slug === 'string' && post.slug.trim() !== '') {
    slug = post.slug.trim();
  } else if (post.title && typeof post.title === 'string' && post.title.trim() !== '') {
    slug = post.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  } else {
    slug = 'untitled';
  }
  
  if (!slug || slug.trim() === '') {
    slug = 'untitled';
  }
  
  return `${year}-${month}-${day}-${slug}.md`;
}

export function extractSlugFromFilename(filename: string): string {
  const match = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
  return match ? match[1] : '';
}

export function findMatchingMarkdownFile(filename: string, existingFiles: string[]): string | null {
  const targetSlug = extractSlugFromFilename(filename);
  if (!targetSlug) return null;
  
  return existingFiles.find(file => {
    const fileSlug = extractSlugFromFilename(file);
    return fileSlug === targetSlug;
  }) || null;
}