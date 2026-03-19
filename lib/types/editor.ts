import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;
export type CustomElement = {
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'heading-four' | 'heading-five' | 'heading-six' | 'block-quote' | 'bulleted-list' | 'numbered-list' | 'list-item' | 'table' | 'table-row' | 'table-cell' | 'code-block' | 'image' | 'video' | 'file' | 'link' | 'todo-list' | 'todo-item' | 'toggle-list' | 'toggle-item' | 'divider' | 'callout';
  fileName?: string;
  fileType?: string;
  children: (CustomElement | CustomText)[];
  id?: string;
  url?: string;
  alt?: string;
  caption?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  emoji?: string;
  colSpan?: number;
  rowSpan?: number;
  checked?: boolean;
  collapsed?: boolean;
  depth?: number;
};
export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  highlight?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  link?: string;
  emoji?: string;
  color?: string;
  backgroundColor?: string;
};
declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
export interface SlateContent {
  type: 'slate';
  version: number;
  content: Descendant[];
}
export interface SlateNode {
  type: string;
  children: SlateNode[];
}
export interface SlateText {
  text: string;
}
export const EMPTY_EDITOR: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];
export type UploadedFile = {
  url: string;
  alt?: string;
  caption?: string;
  type: 'image' | 'video' | 'file';
  size: number;
  mimeType: string;
};
export type SlashCommand = {
  title: string;
  description: string;
  icon: string;
  action: (editor: CustomEditor) => void;
};
export type FormattingToolbar = {
  isVisible: boolean;
  position: { top: number; left: number };
  selection: any;
};