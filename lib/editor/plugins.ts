import { Editor, Transforms, Element as SlateElement, Range, Point } from 'slate';
import { ReactEditor } from 'slate-react';
import { CustomElement, CustomText } from '@/lib/types/editor';
import { insertHTMLData, insertPlainTextData } from './paste-handler';

export interface SlashCommand {
  id: string;
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  group: string;
  shortcut?: string;
  popular?: boolean;
  action: (editor: any) => void;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  // Headings
  {
    id: 'heading-1',
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    keywords: ['h1', 'heading', 'title'],
    group: 'Headings',
    shortcut: '#',
    popular: true,
    action: (editor) => {
      const block: CustomElement = { type: 'heading-one', children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
    },
  },
  {
    id: 'heading-2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    keywords: ['h2', 'heading', 'subtitle'],
    group: 'Headings',
    shortcut: '##',
    popular: true,
    action: (editor) => {
      const block: CustomElement = { type: 'heading-two', children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
    },
  },
  {
    id: 'heading-3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    keywords: ['h3', 'heading', 'subheading'],
    group: 'Headings',
    shortcut: '###',
    popular: true,
    action: (editor) => {
      const block: CustomElement = { type: 'heading-three', children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
    },
  },
  // Basic
  {
    id: 'paragraph',
    title: 'Text',
    description: 'Continue with plain text',
    icon: 'P',
    keywords: ['text', 'paragraph'],
    group: 'Basic',
    popular: true,
    action: (editor) => {
      const block: CustomElement = { type: 'paragraph', children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
    },
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Add a horizontal line',
    icon: '—',
    keywords: ['divider', 'line', 'hr'],
    group: 'Basic',
    shortcut: '---',
    action: (editor) => {
      const divider: CustomElement = { type: 'divider', children: [{ text: '' }] };
      Transforms.insertNodes(editor, divider);
    },
  },
  // Lists
  {
    id: 'bullet-list',
    title: 'Bulleted List',
    description: 'Create a bulleted list',
    icon: '•',
    keywords: ['list', 'bullet', 'ul'],
    group: 'Lists',
    shortcut: '*',
    popular: true,
    action: (editor) => {
      const block: CustomElement = { type: 'list-item', children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
      const list: CustomElement = { type: 'bulleted-list', children: [] };
      Transforms.wrapNodes(editor, list);
      
      // After wrapping, ensure selection points to a valid text node
      try {
        const { selection } = editor;
        if (selection) {
          const start = Editor.start(editor, selection);
          Transforms.select(editor, start);
        }
      } catch (e) {
        // Silently handle selection errors
      }
    },
  },
  {
    id: 'number-list',
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: '1.',
    keywords: ['list', 'number', 'ol'],
    group: 'Lists',
    shortcut: '1.',
    action: (editor) => {
      const block: CustomElement = { type: 'list-item', children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
      const list: CustomElement = { type: 'numbered-list', children: [] };
      Transforms.wrapNodes(editor, list);
      
      // After wrapping, ensure selection points to a valid text node
      try {
        const { selection } = editor;
        if (selection) {
          const start = Editor.start(editor, selection);
          Transforms.select(editor, start);
        }
      } catch (e) {
        // Silently handle selection errors
      }
    },
  },
  {
    id: 'todo-list',
    title: 'Checklist',
    description: 'Create a checklist',
    icon: '☑️',
    keywords: ['todo', 'checklist', 'task'],
    group: 'Lists',
    action: (editor) => {
      const block: CustomElement = { type: 'todo-item', checked: false, children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
      const list: CustomElement = { type: 'todo-list', children: [] };
      Transforms.wrapNodes(editor, list);
      
      // After wrapping, ensure selection points to a valid text node
      try {
        const { selection } = editor;
        if (selection) {
          const start = Editor.start(editor, selection);
          Transforms.select(editor, start);
        }
      } catch (e) {
        // Silently handle selection errors
      }
    },
  },
  // Content
  {
    id: 'quote',
    title: 'Quote',
    description: 'Capture a quote or callout',
    icon: '"',
    keywords: ['quote', 'blockquote'],
    group: 'Content',
    shortcut: '>',
    popular: true,
    action: (editor) => {
      const block: CustomElement = { type: 'block-quote', children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
    },
  },
  {
    id: 'callout',
    title: 'Callout',
    description: 'Highlight important information',
    icon: '💡',
    keywords: ['callout', 'info', 'highlight'],
    group: 'Content',
    action: (editor) => {
      const block: CustomElement = { type: 'callout', children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
    },
  },
  {
    id: 'toggle-list',
    title: 'Toggle List',
    description: 'Create a collapsible toggle',
    icon: '▸',
    keywords: ['toggle', 'collapse', 'expand'],
    group: 'Content',
    action: (editor) => {
      const block: CustomElement = { type: 'toggle-item', collapsed: true, children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
      const list: CustomElement = { type: 'toggle-list', children: [] };
      Transforms.wrapNodes(editor, list);
      
      // After wrapping, ensure selection points to a valid text node
      try {
        const { selection } = editor;
        if (selection) {
          const start = Editor.start(editor, selection);
          Transforms.select(editor, start);
        }
      } catch (e) {
        // Silently handle selection errors
      }
    },
  },
  {
    id: 'code-block',
    title: 'Code Block',
    description: 'Insert a code snippet',
    icon: '</>',
    keywords: ['code', 'snippet'],
    group: 'Content',
    shortcut: '```',
    popular: true,
    action: (editor) => {
      const block: CustomElement = { type: 'code-block', children: [{ text: '' }] };
      Transforms.setNodes(editor, block);
    },
  },
  // Tables
  {
    id: 'table',
    title: 'Table',
    description: 'Insert a table',
    icon: '⊞',
    keywords: ['table', 'grid'],
    group: 'Tables',
    action: (editor) => {
      // Import table utils inline to prevent nesting
      const { isInTable, insertTable } = require('@/lib/editor/tableUtils');
      
      if (isInTable(editor)) {
        return;
      }
      
      insertTable(editor, 2, 3);
    },
  },
  // Media
  {
    id: 'image',
    title: 'Image',
    description: 'Upload or embed an image',
    icon: '🖼️',
    keywords: ['image', 'photo', 'picture'],
    group: 'Media',
    popular: true,
    action: async (editor) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const placeholderImage: CustomElement = {
            type: 'image',
            url: URL.createObjectURL(file),
            alt: file.name,
            children: [{ text: '' }],
          };
          Transforms.insertNodes(editor, placeholderImage);
          
          // Upload file to storage
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('bucketContext', 'post-content');
            formData.append('makePublic', 'true');
            
            const response = await fetch('/api/storage/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const data = await response.json();
              const [match] = Editor.nodes(editor, {
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'image' && n.url === URL.createObjectURL(file),
                at: [],
              });
              
              if (match) {
                const [, path] = match;
                Transforms.setNodes(
                  editor,
                  { url: data.url },
                  { at: path }
                );
              }
            }
          } catch (error) {
            console.error('Image upload failed:', error);
          }
        }
      };
      input.click();
    },
  },
  {
    id: 'video',
    title: 'Video',
    description: 'Embed a video',
    icon: '🎥',
    keywords: ['video', 'media'],
    group: 'Media',
    action: async (editor) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const placeholderVideo: CustomElement = {
            type: 'video',
            url: URL.createObjectURL(file),
            children: [{ text: '' }],
          };
          Transforms.insertNodes(editor, placeholderVideo);
          
          // Upload file to storage
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('bucketContext', 'media-files');
            formData.append('makePublic', 'true');
            
            const response = await fetch('/api/storage/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const data = await response.json();
              const [match] = Editor.nodes(editor, {
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'video' && n.url === URL.createObjectURL(file),
                at: [],
              });
              
              if (match) {
                const [, path] = match;
                Transforms.setNodes(
                  editor,
                  { url: data.url },
                  { at: path }
                );
              }
            }
          } catch (error) {
            console.error('Image upload failed:', error);
          }
        }
      };
      input.click();
    },
  },
  {
    id: 'file',
    title: 'File',
    description: 'Attach a file',
    icon: '📎',
    keywords: ['file', 'attachment', 'document'],
    group: 'Media',
    action: (editor) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const fileNode: CustomElement = {
            type: 'file',
            url: URL.createObjectURL(file),
            fileName: file.name,
            fileType: file.type,
            children: [{ text: file.name }],
          };
          Transforms.insertNodes(editor, fileNode);
        }
      };
      input.click();
    },
  },
  // Links
  {
    id: 'link',
    title: 'Link',
    description: 'Insert a link',
    icon: '🔗',
    keywords: ['link', 'url'],
    group: 'Content',
    shortcut: 'Ctrl+K',
    popular: true,
    action: (editor) => {
      const url = window.prompt('Enter URL:');
      if (url) {
        const link: CustomElement = {
          type: 'link',
          url,
          children: [{ text: url }],
        };
        Transforms.insertNodes(editor, link);
      }
    },
  },
];

/**
 * Markdown shortcuts plugin - handles common markdown patterns like:
 * - `* ` or `- ` → bulleted list
 * - `1. ` → numbered list
 * - `# `, `## `, `### ` → headings
 * - `> ` → blockquote
 * - ``` ` ``` → code block
 * 
 * Best practice: This plugin intercepts space key to check for markdown patterns
 */
export const withMarkdownShortcuts = (editor: any) => {
  const { insertText } = editor;

  editor.insertText = (text: string) => {
    const { selection } = editor;

    // Only handle space key for markdown shortcuts
    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });
      
      if (!block) {
        insertText(text);
        return;
      }
      
      const path = block[1];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);

      // Helper to convert to list
      function convertToList(listType: 'bulleted-list' | 'numbered-list') {
        Transforms.delete(editor, { distance: beforeText.length, unit: 'character', reverse: true });
        
        Transforms.setNodes(editor, { type: 'list-item' } as Partial<CustomElement>);
        
        const list: CustomElement = { type: listType, children: [] };
        Transforms.wrapNodes(editor, list, {
          match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item',
        });
        
        const newSelection = editor.selection;
        if (newSelection) {
          const start = Editor.start(editor, newSelection);
          Transforms.select(editor, start);
        }
      }

      function convertToBlock(blockType: CustomElement['type']) {
        Transforms.delete(editor, { distance: beforeText.length, unit: 'character', reverse: true });
        
        Transforms.setNodes(editor, { type: blockType } as Partial<CustomElement>);
      }

      const numberedListMatch = beforeText.match(/^(\d+)\.$/);
      if (numberedListMatch) {
        convertToList('numbered-list');
        return; // Don't insert the space
      }

      // Match other markdown patterns
      const patterns: Record<string, () => void> = {
        '*': () => convertToList('bulleted-list'),
        '-': () => convertToList('bulleted-list'),
        '+': () => convertToList('bulleted-list'),
        '>': () => convertToBlock('block-quote'),
        '#': () => convertToBlock('heading-one'),
        '##': () => convertToBlock('heading-two'),
        '###': () => convertToBlock('heading-three'),
        '```': () => convertToBlock('code-block'),
      };

      // Check other patterns
      const handler = patterns[beforeText];
      if (handler) {
        handler();
        return; // Don't insert the space
      }
    }

    // Continue with default insertText behavior
    insertText(text);
  };

  return editor;
};

export const withSlashCommands = (editor: any) => {
  const { insertText, deleteBackward } = editor;

  editor.insertText = (text: string) => {
    insertText(text);
    
    if (text === '/') {
      // Use setTimeout to ensure the text is inserted before checking context
      setTimeout(() => {
        const isContext = isSlashCommandContext(editor);
        
        if (isContext) {
          const position = getCaretPosition(editor);
          
          if (position) {
            const event = new CustomEvent('show-slash-menu', {
              detail: { 
                editor, 
                position,
                commands: SLASH_COMMANDS
              }
            });
            document.dispatchEvent(event);
          }
        }
      }, 0);
    }
  };

  editor.deleteBackward = (unit: 'character' | 'word' | 'line' | 'block') => {
    const { selection } = editor;
    if (selection && unit === 'character') {
      try {
        const [node, path] = Editor.node(editor, selection.focus.path);
        const start = Editor.start(editor, path);
        const beforeText = Editor.string(editor, { anchor: start, focus: selection.focus });

        if (beforeText === '/') {
          const event = new CustomEvent('close-slash-menu');
          document.dispatchEvent(event);
        }
      } catch (error) {
        console.error('Delete backward failed:', error);
      }
    }

    deleteBackward(unit);
  };

  return editor;
};

export const withEmojiCommands = (editor: any) => {
  const { insertText } = editor;

  editor.insertText = (text: string) => {
    // Call the original insertText first (which includes slash commands)
    insertText(text);
    
    if (text === ':' && isEmojiContext(editor)) {
      const position = getCaretPosition(editor);
      if (position) {
        const event = new CustomEvent('show-emoji-picker', {
          detail: { 
            editor, 
            position
          }
        });
        document.dispatchEvent(event);
      }
    }
  };

  return editor;
};

export const withVoidElements = (editor: any) => {
  const { isVoid } = editor;

  editor.isVoid = (element: CustomElement) => {
    return element.type === 'divider' || element.type === 'image' || element.type === 'video' ? true : isVoid(element);
  };

  return editor;
};

export const withMediaHandling = (editor: any) => {
  const { insertData } = editor;

  editor.insertData = async (data: DataTransfer) => {
    const html = data.getData('text/html');
    if (html) {
      insertHTMLData(editor, html);
      return;
    }
    
    const text = data.getData('text/plain');
    if (text && !data.files?.length) {
      insertPlainTextData(editor, text);
      return;
    }
    
    const { files } = data;
    
    if (files && files.length > 0) {
      const file = files[0];
      
      if (file.type.startsWith('image/')) {
        // Insert placeholder image
        const placeholderImage: CustomElement = {
          type: 'image',
          url: URL.createObjectURL(file),
          alt: file.name,
          children: [{ text: '' }],
        };
        Transforms.insertNodes(editor, placeholderImage);
        
        // Upload to storage
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileName', file.name);
          formData.append('bucketContext', 'post-content');
          formData.append('makePublic', 'true');
          
          const response = await fetch('/api/storage/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const uploadData = await response.json();
            // Update with real URL
            const [match] = Editor.nodes(editor, {
              match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'image' && n.url === URL.createObjectURL(file),
              at: [],
            });
            
            if (match) {
              const [, path] = match;
              Transforms.setNodes(
                editor,
                { url: uploadData.url },
                { at: path }
              );
            }
          }
        } catch (error) {
          console.error('File upload failed:', error);
        }
        return;
      }
      
      if (file.type.startsWith('video/')) {
        // Insert placeholder video
        const placeholderVideo: CustomElement = {
          type: 'video',
          url: URL.createObjectURL(file),
          children: [{ text: '' }],
        };
        Transforms.insertNodes(editor, placeholderVideo);
        
        // Upload to storage
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileName', file.name);
          formData.append('bucketContext', 'media-files');
          formData.append('makePublic', 'true');
          
          const response = await fetch('/api/storage/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const uploadData = await response.json();
            // Update with real URL
            const [match] = Editor.nodes(editor, {
              match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'video' && n.url === URL.createObjectURL(file),
              at: [],
            });
            
            if (match) {
              const [, path] = match;
              Transforms.setNodes(
                editor,
                { url: uploadData.url },
                { at: path }
              );
            }
          }
        } catch (error) {
          console.error('File upload failed:', error);
        }
        return;
      }
      
      const fileNode: CustomElement = {
        type: 'file',
        url: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type,
        children: [{ text: file.name }],
      };
      Transforms.insertNodes(editor, fileNode);
      return;
    }

    insertData(data);
  };

  return editor;
};

const isSlashCommandContext = (editor: any): boolean => {
  const { selection } = editor;
  
  if (!selection) return false;

  try {
    const [node] = Editor.node(editor, selection.focus.path);
    
    if (SlateElement.isElement(node) && node.type === 'code-block') {
      return false;
    }

    const start = Editor.start(editor, selection.focus.path);
    const beforeText = Editor.string(editor, { anchor: start, focus: selection.focus });
    
    // Allow slash commands at the beginning of a line, after whitespace, or when the only text is '/'
    return beforeText === '' || beforeText.match(/^\s*$/) !== null || beforeText === '/';
  } catch (error) {
    return false;
  }
};

const isEmojiContext = (editor: any): boolean => {
  const { selection } = editor;
  if (!selection) return false;

  try {
    const [node] = Editor.node(editor, selection.focus.path);
    
    if (SlateElement.isElement(node) && node.type === 'code-block') {
      return false;
    }

    const start = Editor.start(editor, selection.focus.path);
    const beforeText = Editor.string(editor, { anchor: start, focus: selection.focus });
    
    return beforeText === '' || beforeText.match(/^\s*$/) !== null;
  } catch (error) {
    return false;
  }
};

const getCaretPosition = (editor: any): { top: number; left: number } | null => {
  const { selection } = editor;
  
  if (!selection) return null;

  try {
    const domRange = ReactEditor.toDOMRange(editor, selection);
    const rect = domRange.getBoundingClientRect();
    
    if (rect.width === 0 && rect.height === 0) {
      const editorElement = document.querySelector('[data-slate-editor="true"]') as HTMLElement;
      if (editorElement) {
        const editorRect = editorElement.getBoundingClientRect();
        return {
          top: editorRect.top + window.scrollY + 20,
          left: editorRect.left + window.scrollX + 20,
        };
      }
      return null;
    }
    
    return {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    };
  } catch (error) {
    return null;
  }
};
