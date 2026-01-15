import { Editor, Transforms, Element as SlateElement, Node, Path } from 'slate';
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
