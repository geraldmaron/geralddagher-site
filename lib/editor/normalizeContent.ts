import { Descendant, Element as SlateElement, Text } from 'slate';
import { CustomElement } from '@/lib/types/editor';

const LIST_TYPES = ['bulleted-list', 'numbered-list', 'todo-list'];
const LIST_ITEM_TYPES = ['list-item', 'todo-item'];

function isCustomElement(node: Descendant): node is CustomElement {
  return SlateElement.isElement(node);
}

function isListElement(node: CustomElement): boolean {
  return LIST_TYPES.includes(node.type);
}

function isListItemElement(node: CustomElement): boolean {
  return LIST_ITEM_TYPES.includes(node.type);
}

function normalizeListItem(node: CustomElement, expectedType?: CustomElement['type']): CustomElement {
  const type = expectedType ?? node.type;
  const children: (CustomElement | Text)[] = [];
  let hasContent = false;

  for (const child of node.children ?? []) {
    if (isCustomElement(child)) {
      if (isListElement(child)) {
        children.push(normalizeList(child));
      } else if (isListItemElement(child)) {
        const normalizedChild = normalizeListItem(child, type);
        children.push(...normalizedChild.children);
        hasContent = hasContent || normalizedChild.children.some(
          (entry) => !isCustomElement(entry) || !isListElement(entry)
        );
      } else {
        const normalizedChild = normalizeNode(child) as CustomElement;
        children.push(normalizedChild);
        hasContent = true;
      }
    } else {
      children.push(child);
      hasContent = true;
    }
  }

  if (!hasContent) {
    children.unshift({ text: '' });
  }

  const next: CustomElement = { ...node, type, children };
  if ('depth' in next) {
    delete next.depth;
  }
  return next;
}

function coerceListItem(child: Descendant, expectedItemType: CustomElement['type']): CustomElement | null {
  if (isCustomElement(child)) {
    if (isListElement(child)) {
      return normalizeListItem(
        { type: expectedItemType, children: [{ text: '' }, normalizeList(child)] } as CustomElement,
        expectedItemType
      );
    }
    if (isListItemElement(child)) {
      return normalizeListItem({ ...child, type: expectedItemType }, expectedItemType);
    }
    return normalizeListItem(
      { type: expectedItemType, children: [normalizeNode(child) as CustomElement] } as CustomElement,
      expectedItemType
    );
  }

  if (Text.isText(child)) {
    return normalizeListItem({ type: expectedItemType, children: [child] } as CustomElement, expectedItemType);
  }

  return null;
}

function normalizeList(node: CustomElement): CustomElement {
  const expectedItemType = node.type === 'todo-list' ? 'todo-item' : 'list-item';
  const root: CustomElement = { ...node, children: [] };
  const stack: CustomElement[] = [root];
  let lastItem: CustomElement | null = null;

  for (const child of node.children ?? []) {
    const item = coerceListItem(child, expectedItemType);
    if (!item) continue;

    const rawDepth = Math.max(0, item.depth ?? 0);
    delete item.depth;

    let targetDepth = rawDepth;
    const currentDepth = stack.length - 1;

    if (!lastItem) {
      targetDepth = 0;
    } else if (targetDepth > currentDepth + 1) {
      targetDepth = currentDepth + 1;
    }

    if (targetDepth > currentDepth) {
      const nestedList: CustomElement = { type: node.type, children: [] };
      if (lastItem) {
        lastItem.children = [...lastItem.children, nestedList];
      } else {
        stack[stack.length - 1].children.push(nestedList);
      }
      stack.push(nestedList);
    } else if (targetDepth < currentDepth) {
      stack.length = targetDepth + 1;
    }

    stack[stack.length - 1].children.push(item);
    lastItem = item;
  }

  if (root.children.length === 0) {
    root.children.push({ type: expectedItemType, children: [{ text: '' }] } as CustomElement);
  }

  return root;
}

function normalizeNode(node: Descendant): Descendant {
  if (!isCustomElement(node)) {
    return node;
  }

  if (isListElement(node)) {
    return normalizeList(node);
  }

  if (isListItemElement(node)) {
    return normalizeListItem(node);
  }

  if (node.children && node.children.length > 0) {
    return {
      ...node,
      children: node.children.map(child => normalizeNode(child))
    };
  }

  return node;
}

export function normalizeContent(content: Descendant[]): Descendant[] {
  return content.map(node => normalizeNode(node));
}
