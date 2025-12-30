export function extractPlainTextFromLearningContent(content: any): string {
  if (!content) return '';

  let rawString = '';

  if (typeof content === 'string') {
    rawString = content;
  } else if (typeof content === 'object') {
    rawString = JSON.stringify(content);
  } else {
    return String(content);
  }

  if (rawString.startsWith('Blog Post:') || rawString.startsWith('blog_post:')) {
    const dashIndex = rawString.indexOf(' - ');
    if (dashIndex > 0) {
      rawString = rawString.substring(dashIndex + 3);
    } else {
      rawString = rawString.replace(/^Blog Post:[^:]*:\s*/, '').replace(/^blog_post:[^:]*:\s*/, '');
    }
  }

  rawString = rawString.trim();

  if (!rawString.includes('"text"') && !rawString.includes('"children"') && !rawString.includes('"type":"')) {
    return rawString;
  }

  const textValues: string[] = [];
  const textRegex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let match;

  while ((match = textRegex.exec(rawString)) !== null) {
    const value = match[1]
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    if (value.trim()) {
      textValues.push(value);
    }
  }

  if (textValues.length > 0) {
    return textValues.join(' ').replace(/\s+/g, ' ').trim();
  }

  const cleanedJson = rawString
    .replace(/"type"\s*:\s*"[^"]*"/g, '')
    .replace(/"children"\s*:\s*\[/g, '')
    .replace(/"content"\s*:\s*\[/g, '')
    .replace(/"version"\s*:\s*\d+/g, '')
    .replace(/"bold"\s*:\s*(true|false)/g, '')
    .replace(/"italic"\s*:\s*(true|false)/g, '')
    .replace(/"underline"\s*:\s*(true|false)/g, '')
    .replace(/[[\]{}",]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanedJson.length > 10 && !cleanedJson.match(/^[\s:]+$/)) {
    return cleanedJson;
  }

  return rawString.length > 500 ? rawString.substring(0, 500) + '...' : rawString;
}
