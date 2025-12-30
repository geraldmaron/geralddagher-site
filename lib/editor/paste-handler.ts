import { Editor, Transforms, Element as SlateElement, Text } from 'slate';
import { CustomElement, CustomText } from '@/lib/types/editor';

/**
 * Deserialize HTML to Slate nodes
 * Handles pasted content from external sources (Google Docs, Word, websites, etc.)
 */
export const deserializeHTML = (el: Node, markAttributes = {}): any => {
  if (el.nodeType === Node.TEXT_NODE) {
    const text = el.textContent || '';
    if (!text.trim()) return null;
    return { ...markAttributes, text };
  }

  if (el.nodeType === Node.COMMENT_NODE) {
    return null;
  }

  const nodeEl = el as HTMLElement;
  let children: any[] = Array.from(nodeEl.childNodes)
    .map(node => deserializeHTML(node, markAttributes))
    .flat()
    .filter(Boolean);

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  // Merge adjacent text nodes with same marks
  children = children.reduce((acc: any[], child) => {
    const prev = acc[acc.length - 1];
    if (
      Text.isText(child) &&
      Text.isText(prev) &&
      Object.keys(child).length === Object.keys(prev).length &&
      Object.keys(child).every(key => {
        if (key === 'text') return true;
        return (child as any)[key] === (prev as any)[key];
      })
    ) {
      acc[acc.length - 1] = { ...prev, text: prev.text + child.text };
      return acc;
    }
    acc.push(child);
    return acc;
  }, []);

  const nodeName = nodeEl.nodeName.toLowerCase();
  const computedStyle = nodeEl instanceof HTMLElement ? window.getComputedStyle(nodeEl) : null;

  // Check for bold
  if (
    nodeName === 'strong' ||
    nodeName === 'b' ||
    (computedStyle && (
      parseInt(computedStyle.fontWeight) >= 600 ||
      computedStyle.fontWeight === 'bold'
    ))
  ) {
    markAttributes = { ...markAttributes, bold: true };
    return children.map((child: any) => {
      if (Text.isText(child)) {
        return { ...child, bold: true };
      }
      return child;
    });
  }

  if (
    nodeName === 'em' ||
    nodeName === 'i' ||
    (computedStyle && computedStyle.fontStyle === 'italic')
  ) {
    markAttributes = { ...markAttributes, italic: true };
    return children.map((child: any) => {
      if (Text.isText(child)) {
        return { ...child, italic: true };
      }
      return child;
    });
  }

  if (
    nodeName === 'u' ||
    (computedStyle && computedStyle.textDecoration.includes('underline'))
  ) {
    markAttributes = { ...markAttributes, underline: true };
    return children.map((child: any) => {
      if (Text.isText(child)) {
        return { ...child, underline: true };
      }
      return child;
    });
  }

  if (
    nodeName === 's' ||
    nodeName === 'strike' ||
    nodeName === 'del' ||
    (computedStyle && computedStyle.textDecoration.includes('line-through'))
  ) {
    markAttributes = { ...markAttributes, strikethrough: true };
    return children.map((child: any) => {
      if (Text.isText(child)) {
        return { ...child, strikethrough: true };
      }
      return child;
    });
  }

  if (nodeName === 'code' && nodeEl.parentElement?.nodeName !== 'PRE') {
    markAttributes = { ...markAttributes, code: true };
    return children.map((child: any) => {
      if (Text.isText(child)) {
        return { ...child, code: true };
      }
      return child;
    });
  }

  if (nodeName === 'mark') {
    markAttributes = { ...markAttributes, highlight: true };
    return children.map((child: any) => {
      if (Text.isText(child)) {
        return { ...child, highlight: true };
      }
      return child;
    });
  }

  if (nodeName === 'sup') {
    markAttributes = { ...markAttributes, superscript: true };
    return children.map((child: any) => {
      if (Text.isText(child)) {
        return { ...child, superscript: true };
      }
      return child;
    });
  }

  if (nodeName === 'sub') {
    markAttributes = { ...markAttributes, subscript: true };
    return children.map((child: any) => {
      if (Text.isText(child)) {
        return { ...child, subscript: true };
      }
      return child;
    });
  }

  switch (nodeName) {
    case 'body':
    case 'html':
      return children;

    case 'br':
      return { text: '\n' };

    case 'h1':
      return { type: 'heading-one', children };

    case 'h2':
      return { type: 'heading-two', children };

    case 'h3':
      return { type: 'heading-three', children };

    case 'h4':
      return { type: 'heading-four', children };

    case 'h5':
      return { type: 'heading-five', children };

    case 'h6':
      return { type: 'heading-six', children };

    case 'blockquote':
      return { type: 'block-quote', children };

    case 'ul':
      return { type: 'bulleted-list', children };

    case 'ol':
      return { type: 'numbered-list', children };

    case 'li': {
      const parent = nodeEl.parentElement;
      if (parent && (parent.nodeName === 'UL' || parent.nodeName === 'OL')) {
        return { type: 'list-item', children };
      }
      return { type: 'paragraph', children };
    }

    case 'pre':
      if (nodeEl.querySelector('code')) {
        return { type: 'code-block', children };
      }
      return { type: 'code-block', children };

    case 'hr':
      return { type: 'divider', children: [{ text: '' }] };

    case 'a': {
      const href = nodeEl.getAttribute('href');
      if (href) {
        return { type: 'link', url: href, children };
      }
      return children;
    }

    case 'img': {
      const src = nodeEl.getAttribute('src');
      const alt = nodeEl.getAttribute('alt') || '';
      if (src) {
        return { type: 'image', url: src, alt, children: [{ text: '' }] };
      }
      return null;
    }

    case 'table':
      return { type: 'table', children };

    case 'tr':
      return { type: 'table-row', children };

    case 'td':
    case 'th':
      return { type: 'table-cell', children };

    case 'p':
      return { type: 'paragraph', children };

    case 'div':
    case 'article':
    case 'section': {
      const hasBlockChild = children.some((child: any) => 
        child && typeof child === 'object' && 'type' in child &&
        child.type !== 'link'
      );
      
      if (hasBlockChild) {
        return children;
      }
      
      return { type: 'paragraph', children };
    }

    case 'span':
      return children;

    default:
      return children;
  }
};

/**
 * Insert pasted HTML content into the editor
 */
export const insertHTMLData = (editor: Editor, html: string) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const fragment = deserializeHTML(doc.body);
    
    let nodes = Array.isArray(fragment) ? fragment : [fragment];
    nodes = nodes.flat().filter(Boolean);
    
    nodes = nodes.map((node: any) => {
      if (Text.isText(node)) {
        return { type: 'paragraph', children: [node] };
      }
      
      if (!node.children) {
        node.children = [{ text: '' }];
      }
      
      if (Array.isArray(node.children) && node.children.length === 0) {
        node.children = [{ text: '' }];
      }
      
      return node;
    });
    
    if (nodes.length > 0) {
      Transforms.insertFragment(editor, nodes as any[]);
    }
  } catch (error) {
    // Fall back to plain text
    const plainText = html.replace(/<[^>]*>/g, '');
    if (plainText.trim()) {
      Transforms.insertText(editor, plainText);
    }
  }
};

/**
 * Insert pasted plain text with smart formatting
 */
export const insertPlainTextData = (editor: Editor, text: string) => {
  // Split by paragraphs (double line breaks)
  const paragraphs = text.split(/\n\n+/);
  
  if (paragraphs.length === 1) {
    // Single paragraph - just insert as text
    Transforms.insertText(editor, text);
    return;
  }
  
  // Multiple paragraphs - create paragraph nodes
  const nodes: CustomElement[] = paragraphs
    .filter(p => p.trim())
    .map(p => ({
      type: 'paragraph',
      children: [{ text: p.trim() }],
    }));
  
  if (nodes.length > 0) {
    Transforms.insertFragment(editor, nodes as any[]);
  }
};

