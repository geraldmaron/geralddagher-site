import { Editor, Transforms, Element as SlateElement, Node, Path, Range, Point } from 'slate';
import { CustomElement } from '@/lib/types/editor';

const MAX_DEPTH = 5;

export function isInList(editor: Editor): boolean {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ['bulleted-list', 'numbered-list', 'todo-list'].includes(n.type),
    })
  );

  return !!match;
}

export function isListItem(editor: Editor): boolean {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ['list-item', 'todo-item'].includes(n.type),
    })
  );

  return !!match;
}

export function getListItemEntry(editor: Editor): [CustomElement, Path] | null {
  const { selection } = editor;
  if (!selection) return null;

  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ['list-item', 'todo-item'].includes(n.type),
    })
  );

  return match ? (match as [CustomElement, Path]) : null;
}

export function indentListItem(editor: Editor): void {
  const { selection } = editor;
  if (!selection || !isListItem(editor)) return;

  const [listItemMatch] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ['list-item', 'todo-item'].includes(n.type),
    })
  );

  if (!listItemMatch) return;

  const [listItem] = listItemMatch as [CustomElement, Path];
  const currentDepth = listItem.depth || 0;

  if (currentDepth >= MAX_DEPTH) return;

  Transforms.setNodes(
    editor,
    { depth: currentDepth + 1 } as Partial<CustomElement>,
    {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ['list-item', 'todo-item'].includes(n.type),
    }
  );
}

export function outdentListItem(editor: Editor): void {
  const { selection } = editor;
  if (!selection || !isListItem(editor)) return;

  const [listItemMatch] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ['list-item', 'todo-item'].includes(n.type),
    })
  );

  if (!listItemMatch) return;

  const [listItem] = listItemMatch as [CustomElement, Path];
  const currentDepth = listItem.depth || 0;

  if (currentDepth <= 0) return;

  Transforms.setNodes(
    editor,
    { depth: currentDepth - 1 } as Partial<CustomElement>,
    {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        ['list-item', 'todo-item'].includes(n.type),
    }
  );
}

export function handleEnterInList(editor: Editor, event: React.KeyboardEvent): boolean {
  const { selection } = editor;
  if (!selection) return false;

  const listItemEntry = getListItemEntry(editor);
  if (!listItemEntry) return false;

  const [listItem, listItemPath] = listItemEntry;
  const itemText = Editor.string(editor, listItemPath);

  if (!itemText.trim()) {
    event.preventDefault();

    const currentDepth = listItem.depth || 0;
    if (currentDepth > 0) {
      outdentListItem(editor);
    } else {
      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          ['bulleted-list', 'numbered-list', 'todo-list'].includes(n.type),
        split: true,
      });
      Transforms.setNodes(editor, { type: 'paragraph' } as Partial<CustomElement>);
    }
    return true;
  }

  event.preventDefault();

  const currentDepth = listItem.depth || 0;
  const isTodoItem = listItem.type === 'todo-item';

  const newListItem: CustomElement = isTodoItem
    ? { type: 'todo-item', checked: false, depth: currentDepth, children: [{ text: '' }] }
    : { type: 'list-item', depth: currentDepth, children: [{ text: '' }] };

  Transforms.splitNodes(editor, { always: true });
  Transforms.setNodes(editor, newListItem);

  return true;
}

export function handleBackspaceInList(editor: Editor, event: React.KeyboardEvent): boolean {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;

  const listItemEntry = getListItemEntry(editor);
  if (!listItemEntry) return false;

  const [listItem, listItemPath] = listItemEntry;
  const start = Editor.start(editor, listItemPath);

  if (Point.equals(selection.anchor, start)) {
    event.preventDefault();

    const currentDepth = listItem.depth || 0;
    if (currentDepth > 0) {
      outdentListItem(editor);
    } else {
      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          ['bulleted-list', 'numbered-list', 'todo-list'].includes(n.type),
        split: true,
      });
      Transforms.setNodes(editor, { type: 'paragraph' } as Partial<CustomElement>);
    }
    return true;
  }

  return false;
}
