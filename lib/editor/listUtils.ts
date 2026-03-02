import { Editor, Transforms, Element as SlateElement, Node, Path, Range, Point, Text } from 'slate';
import { CustomElement } from '@/lib/types/editor';

const LIST_TYPES = ['bulleted-list', 'numbered-list', 'todo-list'];
const LIST_ITEM_TYPES = ['list-item', 'todo-item'];

export function isInList(editor: Editor): boolean {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        LIST_TYPES.includes(n.type),
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
        LIST_ITEM_TYPES.includes(n.type),
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
        LIST_ITEM_TYPES.includes(n.type),
    })
  );

  return match ? (match as [CustomElement, Path]) : null;
}

export function indentListItem(editor: Editor): void {
  const { selection } = editor;
  if (!selection || !isListItem(editor)) return;

  const listItemEntry = getListItemEntry(editor);
  if (!listItemEntry) return;

  const [, listItemPath] = listItemEntry;
  const parentListPath = Path.parent(listItemPath);
  const parentList = Node.get(editor, parentListPath);

  if (!SlateElement.isElement(parentList) || !LIST_TYPES.includes(parentList.type)) {
    return;
  }

  const listItemIndex = listItemPath[listItemPath.length - 1];
  if (listItemIndex === 0) return;

  const previousItemPath = Path.previous(listItemPath);
  const previousItem = Node.get(editor, previousItemPath);
  if (!SlateElement.isElement(previousItem) || !LIST_ITEM_TYPES.includes(previousItem.type)) {
    return;
  }

  const existingSublistIndex = previousItem.children.findIndex(
    (child) => SlateElement.isElement(child) && child.type === parentList.type
  );

  let sublistPath: Path;
  if (existingSublistIndex >= 0) {
    sublistPath = previousItemPath.concat([existingSublistIndex]);
  } else {
    const newSublist: CustomElement = { type: parentList.type as CustomElement['type'], children: [] };
    const insertPath = previousItemPath.concat([previousItem.children.length]);
    Transforms.insertNodes(editor, newSublist, { at: insertPath });
    sublistPath = insertPath;
  }

  const sublistNode = Node.get(editor, sublistPath) as CustomElement;
  const destination = sublistPath.concat([sublistNode.children.length]);
  Transforms.moveNodes(editor, { at: listItemPath, to: destination });
}

export function outdentListItem(editor: Editor): void {
  const { selection } = editor;
  if (!selection || !isListItem(editor)) return;

  const listItemEntry = getListItemEntry(editor);
  if (!listItemEntry) return;

  const [, listItemPath] = listItemEntry;
  const parentListPath = Path.parent(listItemPath);
  const parentList = Node.get(editor, parentListPath);

  if (!SlateElement.isElement(parentList) || !LIST_TYPES.includes(parentList.type)) {
    return;
  }

  const parentListItemPath = Path.parent(parentListPath);
  const parentListItem = Node.get(editor, parentListItemPath);

  if (!SlateElement.isElement(parentListItem) || !LIST_ITEM_TYPES.includes(parentListItem.type)) {
    return;
  }

  const grandParentListPath = Path.parent(parentListItemPath);
  const grandParentList = Node.get(editor, grandParentListPath);
  if (!SlateElement.isElement(grandParentList) || !LIST_TYPES.includes(grandParentList.type)) {
    return;
  }

  const newPath = Path.next(parentListItemPath);
  Transforms.moveNodes(editor, { at: listItemPath, to: newPath });

  try {
    const updatedParentList = Node.get(editor, parentListPath) as CustomElement;
    if (SlateElement.isElement(updatedParentList) && updatedParentList.children.length === 0) {
      Transforms.removeNodes(editor, { at: parentListPath });
    }
  } catch {
  }
}

export function handleEnterInList(editor: Editor, event: React.KeyboardEvent): boolean {
  const { selection } = editor;
  if (!selection) return false;

  const listItemEntry = getListItemEntry(editor);
  if (!listItemEntry) return false;

  const [listItem, listItemPath] = listItemEntry;
  const itemText = listItem.children
    .filter((child) => !SlateElement.isElement(child) || !LIST_TYPES.includes(child.type))
    .map((child) => (Text.isText(child) ? child.text : Node.string(child)))
    .join('');

  if (!itemText.trim()) {
    event.preventDefault();
    const parentListPath = Path.parent(listItemPath);
    const parentListItemPath = Path.parent(parentListPath);
    const parentListItem = Node.get(editor, parentListItemPath);

    if (SlateElement.isElement(parentListItem) && LIST_ITEM_TYPES.includes(parentListItem.type)) {
      outdentListItem(editor);
      return true;
    }

    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        LIST_TYPES.includes(n.type),
      split: true,
    });
    Transforms.setNodes(editor, { type: 'paragraph' } as Partial<CustomElement>);
    return true;
  }

  event.preventDefault();
  const isTodoItem = listItem.type === 'todo-item';
  Transforms.splitNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_ITEM_TYPES.includes(n.type),
    always: true,
  });

  if (isTodoItem) {
    const nextItem = Editor.above(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === 'todo-item',
    });
    if (nextItem) {
      Transforms.setNodes(editor, { checked: false } as Partial<CustomElement>, { at: nextItem[1] });
    }
  }

  return true;
}

export function handleBackspaceInList(editor: Editor, event: React.KeyboardEvent): boolean {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;

  const listItemEntry = getListItemEntry(editor);
  if (!listItemEntry) return false;

  const [, listItemPath] = listItemEntry;
  const start = Editor.start(editor, listItemPath);

  if (Point.equals(selection.anchor, start)) {
    event.preventDefault();
    const parentListPath = Path.parent(listItemPath);
    const parentListItemPath = Path.parent(parentListPath);
    const parentListItem = Node.get(editor, parentListItemPath);

    if (SlateElement.isElement(parentListItem) && LIST_ITEM_TYPES.includes(parentListItem.type)) {
      outdentListItem(editor);
      return true;
    }

    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        LIST_TYPES.includes(n.type),
      split: true,
    });
    Transforms.setNodes(editor, { type: 'paragraph' } as Partial<CustomElement>);
    return true;
  }

  return false;
}
