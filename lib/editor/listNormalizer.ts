import { Editor, Element as SlateElement, Node, NodeEntry, Transforms, Text } from 'slate';
import { CustomElement } from '@/lib/types/editor';

const LIST_TYPES = ['bulleted-list', 'numbered-list', 'todo-list'];
const LIST_ITEM_TYPES = ['list-item', 'todo-item'];

export const withListNormalizer = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry: NodeEntry) => {
    const [node, path] = entry;

    if (!SlateElement.isElement(node)) {
      return normalizeNode(entry);
    }

    if (LIST_ITEM_TYPES.includes(node.type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (SlateElement.isElement(child) && LIST_ITEM_TYPES.includes(child.type)) {
          Transforms.unwrapNodes(editor, { at: childPath });
          return;
        }
      }

      const hasContentChild = Array.from(Node.children(editor, path)).some(([child]) => {
        if (Text.isText(child)) return true;
        return SlateElement.isElement(child) && !LIST_TYPES.includes(child.type);
      });

      if (!hasContentChild) {
        Transforms.insertNodes(editor, { text: '' }, { at: [...path, 0] });
        return;
      }
    }

    if (LIST_TYPES.includes(node.type)) {
      const expectedItemType = node.type === 'todo-list' ? 'todo-item' : 'list-item';
      for (const [child, childPath] of Node.children(editor, path)) {
        if (!SlateElement.isElement(child)) {
          Transforms.wrapNodes(
            editor,
            { type: expectedItemType, children: [] } as CustomElement,
            { at: childPath }
          );
          return;
        }

        if (child.type !== expectedItemType) {
          Transforms.setNodes(
            editor,
            { type: expectedItemType } as Partial<CustomElement>,
            { at: childPath }
          );
          return;
        }
      }
    }

    return normalizeNode(entry);
  };

  return editor;
};
