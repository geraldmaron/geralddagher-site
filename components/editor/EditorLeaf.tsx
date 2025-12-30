import React from 'react';

interface EditorLeafProps {
  attributes: any;
  children: React.ReactNode;
  leaf: any;
}

export const EditorLeaf: React.FC<EditorLeafProps> = ({
  attributes,
  children,
  leaf,
}) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  if (leaf.code) {
    children = (
      <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  }

  if (leaf.highlight) {
    children = (
      <mark className="bg-yellow-200 dark:bg-yellow-900/50 text-neutral-900 dark:text-neutral-100 px-0.5 rounded">
        {children}
      </mark>
    );
  }

  if (leaf.superscript) {
    children = <sup className="text-xs">{children}</sup>;
  }

  if (leaf.subscript) {
    children = <sub className="text-xs">{children}</sub>;
  }

  return <span {...attributes}>{children}</span>;
};

